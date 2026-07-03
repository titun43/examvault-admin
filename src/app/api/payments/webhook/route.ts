// =============================================================================
// POST /api/payments/webhook
// =============================================================================
// Razorpay webhook receiver. NO auth (public — Razorpay calls this), but the
// raw body signature is verified before any DB writes. Always returns 200
// quickly so Razorpay does not retry.
//
// SAFETY NET (v2): The `payment.captured` handler is now the ULTIMATE
// reliability backstop. Even if the app's /verify call never runs (app crash,
// network death, user kills the app right after paying), the webhook:
//   1. Looks up the Payment row by razorpayPaymentId. If missing, looks up the
//      Order by razorpayOrderId and creates the Payment row itself.
//   2. Marks the Order PAID + creates a Transaction row.
//   3. Grants the entitlement idempotently (if not already granted) using the
//      meta resolved from the ORDER_CREATED log.
// This guarantees the user ALWAYS gets what they paid for, even when the app
// is unreachable. grantEntitlement uses upserts, so concurrent /verify +
// webhook runs are safe (no duplicate entitlements).
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { grantEntitlement } from '@/lib/payment-access';
import { resolveOrderMeta } from '@/lib/order-meta';

// Resolve webhook secret: DB (admin-set) takes precedence over env.
async function getWebhookSecret(): Promise<string | null> {
  try {
    const row = await db.paymentSetting.findUnique({ where: { key: 'razorpay_webhook_secret' } });
    if (row?.value) return row.value;
  } catch {
    // DB not ready — fall through to env
  }
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? null;
}

// Verify webhook signature using the resolved secret.
function verifyWithSecret(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface PaymentEntity {
  id?: string;
  order_id?: string | null;
  status?: string;
  amount?: number;
  method?: string;
  fee?: number;
  tax?: number;
  error_code?: string | null;
  error_description?: string | null;
  amount_refunded?: number;
  refund_status?: string | null;
}

interface RefundEntity {
  id?: string;
  payment_id?: string;
  status?: string;
  amount?: number;
}

interface RazorpayWebhookEvent {
  entity?: string;
  event?: string;
  contains?: string[];
  payload?: {
    payment?: { entity?: PaymentEntity };
    refund?: { entity?: RefundEntity };
    order?: { entity?: { id?: string; status?: string } };
  };
}

export async function POST(req: NextRequest) {
  // ---- Read RAW body first (signature is over the raw bytes) ----
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  // ---- Verify signature (using DB-set secret, falling back to env) ----
  const secret = await getWebhookSecret();
  const ok = secret ? verifyWithSecret(rawBody, signature, secret) : false;
  if (!ok) {
    // Best-effort log
    try {
      await db.paymentLog.create({
        data: {
          event: 'WEBHOOK_SIGNATURE_FAILED',
          level: 'WARN',
          message: 'Webhook signature verification failed',
          payload: JSON.stringify({
            hasSignature: !!signature,
            bodyLen: rawBody.length,
          }),
        },
      });
    } catch {
      // swallow
    }
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ---- Parse JSON ----
  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    try {
      await db.paymentLog.create({
        data: {
          event: 'WEBHOOK_PARSE_FAILED',
          level: 'WARN',
          message: 'Webhook body was not valid JSON',
          payload: JSON.stringify({ bodyLen: rawBody.length }),
        },
      });
    } catch {
      // swallow
    }
    // Still return 200 so Razorpay doesn't retry forever
    return NextResponse.json({ ok: true });
  }

  const eventType = event.event ?? '';
  const paymentEntity = event.payload?.payment?.entity;
  const refundEntity = event.payload?.refund?.entity;

  try {
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity);
        break;
      case 'payment.authorized':
        await handlePaymentAuthorized(paymentEntity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
      case 'refund.created':
      case 'refund.processed':
        await handleRefund(refundEntity, paymentEntity, eventType);
        break;
      default:
        // Unknown event — log and ack
        await db.paymentLog.create({
          data: {
            event: 'WEBHOOK_UNHANDLED_EVENT',
            level: 'INFO',
            message: `Unhandled webhook event: ${eventType}`,
            payload: rawBody.slice(0, 4000),
          },
        });
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    try {
      await db.paymentLog.create({
        data: {
          event: 'WEBHOOK_HANDLER_ERROR',
          level: 'ERROR',
          message: `Webhook handler error for ${eventType}: ${message}`,
          payload: JSON.stringify({ error: message, eventType }),
        },
      });
    } catch {
      // swallow
    }
    // Still 200 — don't trigger Razorpay retry storms
  }

  return NextResponse.json({ ok: true });
}

// ----------------------------------------------------------------------------
// Event handlers
// ----------------------------------------------------------------------------

/**
 * SAFETY NET handler for `payment.captured`.
 *
 * Guarantees the user ALWAYS gets their entitlement when Razorpay captures a
 * payment, regardless of whether the app's /verify call succeeds. Three paths:
 *
 *   A) Payment row exists + already webhookVerified → idempotent ack.
 *   B) Payment row exists + NOT yet verified → mark captured + webhookVerified,
 *      then grant the entitlement if not already granted (race with /verify).
 *   C) Payment row MISSING (webhook arrived before /verify, or /verify failed)
 *      → look up the Order by razorpayOrderId, create the Payment + Transaction
 *      rows, mark the Order PAID, and grant the entitlement. THIS IS THE KEY
 *      FIX: previously the webhook just logged "unknown payment" and the user
 *      paid without receiving anything if /verify never completed.
 */
async function handlePaymentCaptured(p?: PaymentEntity) {
  if (!p?.id) return;

  // ---- Path A/B: Payment row already exists (verify ran first, or a retry) ----
  const payment = await db.payment.findUnique({
    where: { razorpayPaymentId: p.id },
  });

  if (payment) {
    // Path A: already processed by a previous webhook delivery — idempotent.
    if (payment.webhookVerified) return;

    // Path B: mark captured + webhookVerified. Also flip the Order to PAID
    // if it isn't already — this handles the case where /verify ran first,
    // signature verification failed (e.g. transient client/network issue),
    // and the Payment row was created with status=FAILED while the Order was
    // left as CREATED (per the verify route's defensive design). Without
    // flipping the Order to PAID here, ensureEntitlementGranted() would
    // refuse to grant (it only grants for PAID orders) and the user would
    // never get what they paid for — the "buy korlam but test khulteche na"
    // bug. Doing both updates in a single transaction keeps them atomic.
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          webhookVerified: true,
          status: 'CAPTURED',
          capturedAt: payment.capturedAt ?? new Date(),
          method: p.method ?? payment.method,
          fee: p.fee ?? payment.fee,
          tax: p.tax ?? payment.tax,
        },
      });
      // Only flip the Order to PAID; never downgrade a PAID order, and never
      // resurrect a REFUNDED one. CREATED/FAILED → PAID is the recovery path.
      // We use updateMany to no-op if the order is already PAID (avoids the
      // need for a prior read and prevents race conditions with concurrent
      // verify runs).
      await tx.order.updateMany({
        where: { id: payment.orderId, status: { in: ['CREATED', 'FAILED'] } },
        data: { status: 'PAID' },
      });
    });
    await db.paymentLog.create({
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
        event: 'WEBHOOK_PAYMENT_CAPTURED',
        level: 'AUDIT',
        message: `Webhook confirmed capture for ${p.id}. Payment + Order flipped to PAID/CAPTURED.`,
        payload: JSON.stringify({ razorpayPaymentId: p.id, method: p.method }),
      },
    });

    // Ensure the entitlement is granted (idempotent — safe even if /verify
    // already granted it). This covers the race where /verify marked the
    // Payment row but crashed before calling grantEntitlement.
    await ensureEntitlementGranted(payment.orderId, payment.id, payment.userId);
    return;
  }

  // ---- Path C: Payment row MISSING — the webhook arrived before /verify
  //      (or /verify failed). Look up the Order by razorpayOrderId and act as
  //      the safety net. ----
  if (!p.order_id) {
    // No order_id to look up — can't do anything. Log and ack.
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_PAYMENT_CAPTURED',
        level: 'WARN',
        message: `Webhook payment.captured for payment ${p.id} with no order_id — cannot resolve order.`,
        payload: JSON.stringify({ razorpayPaymentId: p.id }),
      },
    });
    return;
  }

  const order = await db.order.findFirst({
    where: { razorpayOrderId: p.order_id },
  });
  if (!order) {
    // Unknown order — log and ack (Razorpay will not retry since we return 200).
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_PAYMENT_CAPTURED',
        level: 'WARN',
        message: `Webhook payment.captured for unknown order ${p.order_id} (payment ${p.id})`,
        payload: JSON.stringify({ razorpayPaymentId: p.id, razorpayOrderId: p.order_id }),
      },
    });
    return;
  }

  // If the order is already PAID, /verify already processed it. Just create a
  // Payment row for record-keeping (idempotent) and ack.
  if (order.status === 'PAID') {
    try {
      await db.payment.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          razorpayPaymentId: p.id,
          razorpayOrderId: p.order_id,
          amount: order.amount,
          currency: order.currency,
          status: 'CAPTURED',
          method: p.method ?? null,
          fee: p.fee ?? null,
          tax: p.tax ?? null,
          signatureVerified: false, // webhook can't verify the client signature
          webhookVerified: true,
          verifiedAt: new Date(),
          capturedAt: new Date(),
        },
      });
    } catch (e) {
      // P2002 = unique constraint (Payment row created by a concurrent /verify).
      // Safe to ignore — the row exists, which is all we need.
    }
    await ensureEntitlementGranted(order.id, undefined, order.userId);
    return;
  }

  // ---- SAFETY NET: order is NOT yet PAID. The app's /verify never completed.
  //      Mark the order PAID, create Payment + Transaction, and grant the
  //      entitlement. This is the fix for "user paid but got nothing". ----
  const now = new Date();
  let newPaymentId: string | undefined;
  try {
    const result = await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });
      const newPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          razorpayPaymentId: p.id!,
          razorpayOrderId: p.order_id!,
          amount: order.amount,
          currency: order.currency,
          status: 'CAPTURED',
          method: p.method ?? null,
          fee: p.fee ?? null,
          tax: p.tax ?? null,
          signatureVerified: false,
          webhookVerified: true,
          verifiedAt: now,
          capturedAt: now,
        },
      });
      await tx.transaction.create({
        data: {
          paymentId: newPayment.id,
          orderId: order.id,
          userId: order.userId,
          type: 'PAYMENT',
          amount: order.amount,
          razorpayPaymentId: p.id!,
          status: 'SUCCESS',
          description: `Payment for ${order.productName} (via webhook safety net)`,
        },
      });
      await tx.paymentLog.create({
        data: {
          paymentId: newPayment.id,
          orderId: order.id,
          userId: order.userId,
          event: 'WEBHOOK_SAFETY_NET_CAPTURED',
          level: 'AUDIT',
          message: `Webhook safety net marked order PAID + captured payment ${p.id} (verify did not run).`,
          payload: JSON.stringify({
            razorpayPaymentId: p.id,
            razorpayOrderId: p.order_id,
            amount: order.amount,
            method: p.method ?? null,
          }),
        },
      });
      return { paymentId: newPayment.id };
    });
    newPaymentId = result.paymentId;
  } catch (e) {
    // P2002 = a concurrent /verify created the Payment row first. In that case
    // /verify is handling the grant; we just ack the webhook.
    const code = (e as { code?: string })?.code;
    if (code === 'P2002') {
      await db.paymentLog
        .create({
          data: {
            orderId: order.id,
            userId: order.userId,
            event: 'WEBHOOK_SAFETY_NET_RACE',
            level: 'INFO',
            message: `Webhook safety net: Payment row already exists (concurrent verify) for ${p.id}. Skipping.`,
            payload: JSON.stringify({ razorpayPaymentId: p.id }),
          },
        })
        .catch(() => {});
      // Still ensure entitlement — the verify path may have been interrupted.
      await ensureEntitlementGranted(order.id, undefined, order.userId);
      return;
    }
    // Re-throw unexpected errors to the outer catch (which logs + 200s).
    throw e;
  }

  // Grant the entitlement (idempotent). This is the actual "unlock".
  await ensureEntitlementGranted(order.id, newPaymentId, order.userId);
}

/**
 * Idempotently ensure the entitlement for an order is granted. Reads the order
 * + its stored meta, then calls grantEntitlement (which uses upserts). Safe to
 * call multiple times — the ENTITLEMENT_GRANTED log + upserts prevent duplicates.
 *
 * DEFENSE-IN-DEPTH: if the order is not yet PAID but a CAPTURED payment exists
 * (e.g. the webhook's Path B ran but a race left the Order stale, or a manual
 * admin operation marked the Payment CAPTURED without flipping the Order), we
 * flip the Order to PAID here before granting. This is the LAST line of
 * defence against "user paid but never got the entitlement" — every path that
 * reaches this function has confirmed (via webhook signature or admin action)
 * that the payment was genuinely captured.
 */
async function ensureEntitlementGranted(
  orderId: string,
  paymentId: string | undefined,
  userId: string,
): Promise<void> {
  try {
    // Quick check: already granted?
    const existing = await db.paymentLog.findFirst({
      where: { orderId, event: 'ENTITLEMENT_GRANTED' },
      select: { id: true },
    });
    if (existing) return; // idempotent — nothing to do

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    // If the order is not PAID, attempt to recover by flipping it to PAID
    // (only if a CAPTURED payment exists for this order). This is the safety
    // net for the case where Path B's transaction committed the Payment
    // update but the Order update was somehow lost (extremely rare, but the
    // cost of an extra query is trivial vs. a permanently-locked-out user).
    if (order.status !== 'PAID') {
      const captured = await db.payment.findFirst({
        where: { orderId, status: 'CAPTURED' },
        orderBy: { capturedAt: 'desc' },
        select: { id: true },
      });
      if (!captured) {
        // No captured payment — genuinely nothing to grant. Bail.
        return;
      }
      await db.order.updateMany({
        where: { id: orderId, status: { in: ['CREATED', 'FAILED'] } },
        data: { status: 'PAID' },
      });
      await db.paymentLog
        .create({
          data: {
            orderId,
            userId,
            event: 'WEBHOOK_ORDER_RECOVERED',
            level: 'AUDIT',
            message: `ensureEntitlementGranted flipped order ${orderId} to PAID (was ${order.status}) because a CAPTURED payment exists.`,
            payload: JSON.stringify({ priorStatus: order.status }),
          },
        })
        .catch(() => {});
      // Reload to confirm — if the updateMany affected 0 rows (e.g. another
      // concurrent process flipped it to REFUNDED), bail.
      const refreshed = await db.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      if (refreshed?.status !== 'PAID') return;
    }

    // Resolve the paymentId if not provided (e.g. the "order already PAID" path
    // where /verify created the Payment row). grantEntitlement links the
    // entitlement to this payment for audit.
    let resolvedPaymentId = paymentId;
    if (!resolvedPaymentId) {
      const captured = await db.payment.findFirst({
        where: { orderId, status: 'CAPTURED' },
        orderBy: { capturedAt: 'desc' },
        select: { id: true },
      });
      resolvedPaymentId = captured?.id ?? '';
    }

    const meta = await resolveOrderMeta(orderId);
    await grantEntitlement(
      userId,
      order.productType,
      order.productId,
      order.productName,
      order.amount,
      resolvedPaymentId,
      orderId,
      meta,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await db.paymentLog
      .create({
        data: {
          orderId,
          userId,
          event: 'WEBHOOK_GRANT_FAILED',
          level: 'ERROR',
          message: `Webhook safety net failed to grant entitlement for order ${orderId}: ${message}`,
          payload: JSON.stringify({ error: message, orderId, paymentId }),
        },
      })
      .catch(() => {});
    // Do NOT re-throw — the webhook must still ack 200 to Razorpay. The
    // entitlement grant can be retried by a subsequent webhook delivery or by
    // the user re-opening the app (which calls /verify or /order-status).
  }
}

async function handlePaymentAuthorized(p?: PaymentEntity) {
  if (!p?.id) return;
  const payment = await db.payment.findUnique({
    where: { razorpayPaymentId: p.id },
  });
  if (!payment) return;
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: 'AUTHORIZED',
      method: p.method ?? payment.method,
    },
  });
  await db.paymentLog.create({
    data: {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      event: 'WEBHOOK_PAYMENT_AUTHORIZED',
      level: 'INFO',
      message: `Payment authorized: ${p.id}`,
      payload: JSON.stringify({ razorpayPaymentId: p.id }),
    },
  });
}

async function handlePaymentFailed(p?: PaymentEntity) {
  if (!p?.id) return;
  const payment = await db.payment.findUnique({
    where: { razorpayPaymentId: p.id },
  });
  if (payment) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        errorCode: p.error_code ?? null,
        errorMessage: p.error_description ?? null,
      },
    });
    // Flip the order to FAILED too if it was still pending
    await db.order
      .update({
        where: { id: payment.orderId },
        data: { status: 'FAILED' },
      })
      .catch(() => {
        // ignore if already PAID etc — don't override a successful state
      });
    await db.paymentLog.create({
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
        event: 'WEBHOOK_PAYMENT_FAILED',
        level: 'WARN',
        message: `Payment failed via webhook: ${p.id}`,
        payload: JSON.stringify({
          razorpayPaymentId: p.id,
          errorCode: p.error_code,
          errorDescription: p.error_description,
        }),
      },
    });
  } else {
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_PAYMENT_FAILED',
        level: 'WARN',
        message: `Webhook payment.failed for unknown payment ${p.id}`,
        payload: JSON.stringify({
          razorpayPaymentId: p.id,
          orderId: p.order_id,
          errorCode: p.error_code,
        }),
      },
    });
  }
}

async function handleRefund(
  refund?: RefundEntity,
  payment?: PaymentEntity,
  eventType?: string,
) {
  const razorpayPaymentId = refund?.payment_id ?? payment?.id;
  if (!razorpayPaymentId) return;

  const paymentRow = await db.payment.findUnique({
    where: { razorpayPaymentId },
  });

  const refundAmount = refund?.amount ?? 0;
  const refundStatus = refund?.status ?? 'processed';
  const razorpayRefundId = refund?.id ?? null;

  if (paymentRow) {
    const txStatus =
      refundStatus === 'processed' || refundStatus === 'done'
        ? 'SUCCESS'
        : refundStatus === 'pending'
          ? 'PENDING'
          : 'FAILED';

    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentRow.id },
        data: {
          refundedAt: new Date(),
          refundAmount,
          status: refundStatus === 'processed' || refundStatus === 'done' ? 'REFUNDED' : paymentRow.status,
        },
      });
      await tx.transaction.create({
        data: {
          paymentId: paymentRow.id,
          orderId: paymentRow.orderId,
          userId: paymentRow.userId,
          type: 'REFUND',
          amount: refundAmount,
          razorpayPaymentId,
          razorpayRefundId,
          status: txStatus as 'SUCCESS' | 'PENDING' | 'FAILED',
          description: `Refund ${razorpayRefundId ?? ''}`.trim(),
        },
      });
      await tx.paymentLog.create({
        data: {
          paymentId: paymentRow.id,
          orderId: paymentRow.orderId,
          userId: paymentRow.userId,
          event: 'WEBHOOK_REFUND',
          level: 'AUDIT',
          message: `Refund ${eventType}: ${razorpayRefundId ?? 'n/a'} (${refundStatus})`,
          payload: JSON.stringify({
            razorpayPaymentId,
            razorpayRefundId,
            refundAmount,
            refundStatus,
          }),
        },
      });
    });
  } else {
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_REFUND',
        level: 'WARN',
        message: `Refund webhook for unknown payment ${razorpayPaymentId}`,
        payload: JSON.stringify({
          razorpayPaymentId,
          razorpayRefundId,
          refundAmount,
          refundStatus,
        }),
      },
    });
  }
}
