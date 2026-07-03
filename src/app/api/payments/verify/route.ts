// =============================================================================
// POST /api/payments/verify
// =============================================================================
// Verifies a Razorpay payment signature (server-side) and unlocks the
// purchased content via `grantEntitlement`. Idempotent: a re-verify on an
// already-PAID order returns success without re-granting.
//
// The `meta` for grantEntitlement (subjectId / categoryId / planTier /
// durationMonths etc.) was attached to the ORDER_CREATED PaymentLog row by
// create-order, since the Order schema has no meta column. We read it back
// here.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyPaymentSignature,
  fetchRazorpayPayment,
} from '@/lib/razorpay-server';
import { requireUser, upsertUser } from '@/lib/payment-auth';
import { grantEntitlement } from '@/lib/payment-access';
import { resolveOrderMeta, type OrderMeta } from '@/lib/order-meta';
import { getClientMeta } from '../_lib';

interface VerifyBody {
  orderId: string; // Prisma Order.id
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export async function POST(req: NextRequest) {
  const clientMeta = getClientMeta(req);
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    // ---- Parse body ----
    let body: VerifyBody;
    try {
      body = (await req.json()) as VerifyBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      body;

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // ---- Load order ----
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ownership check
    if (order.userId !== prismaUserId) {
      return NextResponse.json(
        { error: 'Order ownership mismatch' },
        { status: 403 },
      );
    }

    // ---- Idempotency: already paid ----
    if (order.status === 'PAID') {
      const existingPayment = await db.payment.findFirst({
        where: { orderId: order.id, razorpayPaymentId },
      });
      return NextResponse.json({
        success: true,
        paymentId: existingPayment?.id ?? null,
        productType: order.productType,
        productId: order.productId,
        granted: true,
        reused: true,
      });
    }

    // ---- Signature verification ----
    const sigOk = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    // ---- Defense-in-depth: fetch payment from Razorpay ----
    // We ALWAYS fetch the payment from Razorpay's API, regardless of whether
    // the signature verified. This serves two purposes:
    //
    // 1. If the signature VERIFIED: cross-check the amount + captured status
    //    (tamper defense — the signature only proves the payment_id+order_id
    //    pair, not the amount or status).
    //
    // 2. If the signature FAILED: this is the SELF-SUFFICIENT RECOVERY PATH.
    //    Instead of returning 400 and hoping the webhook will eventually grant
    //    the entitlement (which requires the webhook secret to be correctly
    //    configured — and if it isn't, the user pays but never gets access),
    //    we check Razorpay's API directly. If Razorpay says the payment is
    //    "captured" for OUR order_id with the correct amount, we grant the
    //    entitlement RIGHT NOW. This is equally secure because:
    //      a) We're using server-side Razorpay credentials (not client-supplied).
    //      b) We verify the payment's order_id matches our order's
    //         razorpayOrderId (proves the payment belongs to this checkout).
    //      c) We verify the amount matches (prevents amount tampering).
    //      d) We verify the status is "captured" (proves money was collected).
    //    This eliminates the dependency on the webhook being correctly
    //    configured and fixes "payment ta bhalo hoi nai" — the case where
    //    payment succeeds but the entitlement is never granted because the
    //    webhook secret is missing/mismatched on Vercel.
    let rzpPayment:
      | {
          id: string;
          status: string;
          method: string | null;
          fee: number;
          tax: number;
          amount: number;
          order_id: string | null;
        }
      | null = null;
    try {
      const fetched = await fetchRazorpayPayment(razorpayPaymentId);
      rzpPayment = {
        id: fetched.id,
        status: fetched.status,
        method: fetched.method,
        fee: fetched.fee,
        tax: fetched.tax,
        amount: fetched.amount,
        order_id: fetched.order_id,
      };
    } catch {
      rzpPayment = null;
    }

    if (!sigOk) {
      // Signature mismatch. Try the SELF-SUFFICIENT RECOVERY PATH: check
      // Razorpay's API directly. If the payment is captured for our order with
      // the correct amount, grant the entitlement. Otherwise, record the
      // failure and return 400.
      const rzpConfirmed =
        rzpPayment !== null &&
        rzpPayment.status === 'captured' &&
        rzpPayment.order_id === order.razorpayOrderId &&
        rzpPayment.amount === order.amount;

      if (rzpConfirmed) {
        // Razorpay API confirms the payment is captured for our order. This is
        // just as trustworthy as a signature — proceed with the grant. Log the
        // signature mismatch for audit but DO NOT block the user.
        await db.paymentLog
          .create({
            data: {
              orderId: order.id,
              userId: prismaUserId,
              event: 'SIGNATURE_MISMATCH_RAZORPAY_CONFIRMED',
              level: 'WARN',
              message: `Signature verification failed for ${razorpayPaymentId}, but Razorpay API confirms payment is captured for order ${order.razorpayOrderId} (amount ${order.amount} paise). Granting entitlement via self-sufficient recovery path.`,
              payload: JSON.stringify({
                razorpayPaymentId,
                razorpayOrderId,
                rzpStatus: rzpPayment!.status,
                rzpAmount: rzpPayment!.amount,
                rzpOrderId: rzpPayment!.order_id,
                orderAmount: order.amount,
                orderRazorpayOrderId: order.razorpayOrderId,
              }),
              ...clientMeta,
            },
          })
          .catch(() => {});
        // Fall through to the normal success flow below (mark PAID + grant).
      } else {
        // Signature failed AND Razorpay doesn't confirm capture. Record a
        // FAILED Payment row for audit, but DO NOT mark the Order as FAILED
        // (the webhook can still recover if it's properly configured).
        try {
          const payment = await db.payment.create({
            data: {
              orderId: order.id,
              userId: prismaUserId,
              razorpayPaymentId,
              razorpaySignature,
              razorpayOrderId,
              amount: order.amount,
              currency: order.currency,
              status: 'FAILED',
              errorCode: 'SIGNATURE_VERIFY_FAILED',
              errorMessage: 'Server-side signature verification failed and Razorpay API did not confirm capture',
              signatureVerified: false,
            },
          });
          await db.paymentLog.create({
            data: {
              paymentId: payment.id,
              orderId: order.id,
              userId: prismaUserId,
              event: 'SIGNATURE_VERIFY_FAILED',
              level: 'WARN',
              message: `Signature verification failed for payment ${razorpayPaymentId}. Razorpay confirmation also failed (rzpPayment=${rzpPayment ? 'fetched but not captured/mismatch' : 'fetch failed'}). Order left as ${order.status} so the webhook can still recover.`,
              payload: JSON.stringify({
                razorpayPaymentId,
                razorpayOrderId,
                orderStatusBefore: order.status,
                rzpPaymentStatus: rzpPayment?.status ?? null,
                rzpPaymentOrderId: rzpPayment?.order_id ?? null,
                rzpPaymentAmount: rzpPayment?.amount ?? null,
              }),
              ...clientMeta,
            },
          });
        } catch (e) {
          const code = (e as { code?: string })?.code;
          if (code !== 'P2002') {
            db.paymentLog
              .create({
                data: {
                  orderId: order.id,
                  userId: prismaUserId,
                  event: 'SIGNATURE_VERIFY_FAILED_LOG_ERROR',
                  level: 'ERROR',
                  message: `Failed to record SIGNATURE_VERIFY_FAILED audit row: ${e instanceof Error ? e.message : 'unknown'}`,
                  payload: JSON.stringify({ razorpayPaymentId, razorpayOrderId }),
                  ...clientMeta,
                },
              })
              .catch(() => {});
          }
        }

        return NextResponse.json(
          { error: 'Signature verification failed. If money was deducted, it will be auto-verified within a few seconds — please check "My Purchases".' },
          { status: 400 },
        );
      }
    }

    // ---- Amount cross-check (tamper defense) ----
    // The Razorpay order binds the amount the user must pay, but we double-check
    // that the CAPTURED payment amount matches our Order.amount. Any mismatch is
    // a serious anomaly (possible tampering or a Razorpay bug) — refuse to grant
    // and mark FAILED so the admin can investigate + refund manually.
    if (rzpPayment && rzpPayment.amount !== order.amount) {
      await db.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            userId: prismaUserId,
            razorpayPaymentId,
            razorpaySignature,
            razorpayOrderId,
            amount: order.amount,
            currency: order.currency,
            status: 'FAILED',
            errorCode: 'AMOUNT_MISMATCH',
            errorMessage: `Captured ${rzpPayment!.amount} != order ${order.amount}`,
            signatureVerified: true,
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' },
        });
        await tx.paymentLog.create({
          data: {
            paymentId: payment.id,
            orderId: order.id,
            userId: prismaUserId,
            event: 'AMOUNT_MISMATCH',
            level: 'ERROR',
            message: `Captured amount ${rzpPayment!.amount} paise != order amount ${order.amount} paise — possible tampering. Payment refused + marked FAILED for manual refund.`,
            payload: JSON.stringify({
              razorpayPaymentId,
              capturedAmount: rzpPayment!.amount,
              orderAmount: order.amount,
            }),
            ...clientMeta,
          },
        });
      });
      return NextResponse.json(
        { error: 'Payment amount mismatch. Please contact support.' },
        { status: 400 },
      );
    }

    if (rzpPayment && rzpPayment.status !== 'captured') {
      const rzpStatus = rzpPayment.status;
      await db.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            userId: prismaUserId,
            razorpayPaymentId,
            razorpaySignature,
            razorpayOrderId,
            amount: order.amount,
            currency: order.currency,
            status: 'FAILED',
            errorCode: 'NOT_CAPTURED',
            errorMessage: `Razorpay payment status: ${rzpStatus}`,
            signatureVerified: true,
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' },
        });
        await tx.paymentLog.create({
          data: {
            paymentId: payment.id,
            orderId: order.id,
            userId: prismaUserId,
            event: 'PAYMENT_FAILED',
            level: 'WARN',
            message: `Razorpay status not captured: ${rzpStatus}`,
            payload: JSON.stringify({
              razorpayPaymentId,
              status: rzpStatus,
            }),
            ...clientMeta,
          },
        });
      });

      return NextResponse.json(
        { error: `Payment not captured (status: ${rzpPayment.status})` },
        { status: 400 },
      );
    }

    // ---- Resolve the create-order meta (stored in ORDER_CREATED log payload) ----
    const meta: OrderMeta | undefined = await resolveOrderMeta(order.id);

    // ---- Success: mark PAID + grant entitlement, in a transaction ----
    const now = new Date();
    const result = await db.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      // 2. Create Payment row
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          userId: prismaUserId,
          razorpayPaymentId,
          razorpaySignature,
          razorpayOrderId,
          amount: order.amount,
          currency: order.currency,
          status: 'CAPTURED',
          method: rzpPayment?.method ?? null,
          fee: rzpPayment?.fee ?? null,
          tax: rzpPayment?.tax ?? null,
          // sigOk is true when the HMAC-SHA256 signature verified normally.
          // When false, we're in the self-sufficient recovery path (Razorpay
          // API confirmed capture) — still trustworthy, but we record the
          // distinction for audit.
          signatureVerified: sigOk,
          webhookVerified: false,
          verifiedAt: now,
          capturedAt: now,
        },
      });

      // 3. Create Transaction row
      await tx.transaction.create({
        data: {
          paymentId: payment.id,
          orderId: order.id,
          userId: prismaUserId,
          type: 'PAYMENT',
          amount: order.amount,
          razorpayPaymentId,
          status: 'SUCCESS',
          description: `Payment for ${order.productName}`,
        },
      });

      // 4. Audit log (inside the txn so we know it's durable)
      await tx.paymentLog.create({
        data: {
          paymentId: payment.id,
          orderId: order.id,
          userId: prismaUserId,
          event: 'PAYMENT_SUCCESS',
          level: 'AUDIT',
          message: `Payment captured for ${order.productName} (${order.productType})`,
          payload: JSON.stringify({
            razorpayPaymentId,
            razorpayOrderId,
            amount: order.amount,
            method: rzpPayment?.method ?? null,
          }),
          ...clientMeta,
        },
      });

      return { paymentId: payment.id };
    });

    // 5. Grant entitlement (separate txn inside grantEntitlement)
    await grantEntitlement(
      prismaUserId,
      order.productType,
      order.productId,
      order.productName,
      order.amount,
      result.paymentId,
      order.id,
      meta,
    );

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      productType: order.productType,
      productId: order.productId,
      granted: true,
      reused: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Fire-and-forget error log — do NOT await (speeds up error response).
    db.paymentLog
      .create({
        data: {
          event: 'VERIFY_FAILED',
          level: 'ERROR',
          message: `Verify endpoint error: ${message}`,
          payload: JSON.stringify({ error: message }),
          ...clientMeta,
        },
      })
      .catch(() => {
        // swallow
      });
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 },
    );
  }
}


