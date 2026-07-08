// =============================================================================
// POST /api/payments/create-order
// =============================================================================
// Creates a Razorpay order for a product purchase. Idempotent on the client
// `idempotencyKey`: a duplicate request for a PAID/CREATED/ATTEMPTED order
// returns the existing Razorpay order id; a FAILED/EXPIRED order is recreated.
//
// SECURITY (v2): The order amount is resolved SERVER-SIDE via `resolvePrice`.
// For SUBJECT_PACK / EXAM_PACK, the price is read from the Prisma Product
// table and the client-sent amount is IGNORED entirely (prevents price
// tampering). For TEST_PURCHASE / PREMIUM_SUBSCRIPTION, the client amount is
// used but bounds-validated + audited (Firestore prices aren't readable
// server-side here). A PRICE_MISMATCH warning is logged whenever the client
// amount differs from the server-authoritative price.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay-server';
import { requireUser, upsertUser } from '@/lib/payment-auth';
import { resolvePrice } from '@/lib/price-resolver';
import { PurchaseType } from '@prisma/client';
import { generateOrderRef, getClientMeta } from '../_lib';

type ProductTypeBody =
  | 'TEST_PURCHASE'
  | 'SUBJECT_PACK'
  | 'EXAM_PACK'
  | 'PREMIUM_SUBSCRIPTION';

interface CreateOrderBody {
  productType: ProductTypeBody;
  productId: string;
  productName: string;
  amount: number; // rupees (client hint — IGNORED for packs)
  idempotencyKey: string;
  meta?: {
    planId?: string;
    planName?: string;
    planTier?: string;
    durationMonths?: number;
    subjectId?: string;
    categoryId?: string;
  };
}

export async function POST(req: NextRequest) {
  const clientMeta = getClientMeta(req);
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    // ---- Parse body ----
    let body: CreateOrderBody;
    try {
      body = (await req.json()) as CreateOrderBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { productType, productId, productName, amount, idempotencyKey, meta } =
      body;

    // ---- Validate ----
    // Razorpay minimum is ₹1 (100 paise). We validate here so we return a
    // clear error instead of forwarding Razorpay's "missing/invalid field".
    //
    // PREMIUM_SUBSCRIPTION special case: `productId` is the Firestore
    // `premium_plans.planId` field, which is OPTIONAL in the admin UI (it's a
    // placeholder for future Razorpay Subscription Plans). If the admin didn't
    // fill it, the Flutter app sends an empty string — but the plan is still
    // valid. We fall back to a generated id so the order can proceed.
    // The same applies to `productName` (plan name) — extremely unlikely to be
    // empty since the admin form requires it, but we fall back defensively.
    let effectiveProductId = productId;
    let effectiveProductName = productName;
    if (productType === 'PREMIUM_SUBSCRIPTION') {
      if (!effectiveProductId || !effectiveProductId.trim()) {
        // Use the idempotencyKey as a stable unique id for this order. The
        // plan is identified by the meta.planId (if set) + meta.planName.
        effectiveProductId = `plan_${idempotencyKey}`;
      }
      if (!effectiveProductName || !effectiveProductName.trim()) {
        const planName = meta?.planName as string | undefined;
        effectiveProductName = planName?.trim() || 'Premium Subscription';
      }
    }

    const missing: string[] = [];
    if (!productType) missing.push('productType');
    if (!effectiveProductId) missing.push('productId');
    if (!effectiveProductName) missing.push('productName');
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      missing.push('amount (must be > 0, Razorpay minimum is ₹1)');
    }
    if (!idempotencyKey) missing.push('idempotencyKey');

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Missing or invalid fields: ${missing.join(', ')}`,
          missing,
        },
        { status: 400 },
      );
    }
    const validTypes: ProductTypeBody[] = [
      'TEST_PURCHASE',
      'SUBJECT_PACK',
      'EXAM_PACK',
      'PREMIUM_SUBSCRIPTION',
    ];
    if (!validTypes.includes(productType)) {
      return NextResponse.json(
        { error: `Invalid productType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    // ---- Idempotency check ----
    const existing = await db.order.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      // Ownership check: the order must belong to this user
      if (existing.userId !== prismaUserId) {
        return NextResponse.json(
          { error: 'Order ownership mismatch' },
          { status: 403 },
        );
      }

      if (existing.status === 'PAID') {
        // Already paid — return the existing order
        return NextResponse.json({
          orderId: existing.id,
          orderRef: existing.orderRef,
          razorpayOrderId: existing.razorpayOrderId,
          amount: existing.amount,
          currency: existing.currency,
          productType: existing.productType,
          productId: existing.productId,
          productName: existing.productName,
          keyId: process.env.RAZORPAY_KEY_ID,
          reused: true,
          status: 'PAID',
        });
      }

      if (existing.status === 'CREATED' || existing.status === 'ATTEMPTED') {
        // Let the user retry the same Razorpay order
        return NextResponse.json({
          orderId: existing.id,
          orderRef: existing.orderRef,
          razorpayOrderId: existing.razorpayOrderId,
          amount: existing.amount,
          currency: existing.currency,
          productType: existing.productType,
          productId: existing.productId,
          productName: existing.productName,
          keyId: process.env.RAZORPAY_KEY_ID,
          reused: true,
          status: existing.status,
        });
      }

      // FAILED or EXPIRED — recreate the Razorpay order on the existing row.
      // Resolve the price server-side first (security).
      const priceRes = await resolvePrice(
        productType as PurchaseType,
        effectiveProductId,
        effectiveProductName,
        amount,
        meta as Record<string, unknown> | undefined,
      );
      if (!priceRes.ok || !priceRes.resolved) {
        return NextResponse.json(
          { error: priceRes.error ?? 'Could not resolve price' },
          { status: 400 },
        );
      }
      const resolved = priceRes.resolved;

      const orderRef = generateOrderRef();
      const rzpOrder = await createRazorpayOrder({
        amount: resolved.amountPaise,
        receipt: orderRef,
        notes: {
          userId: prismaUserId,
          productType,
          productId: effectiveProductId,
          idempotencyKey,
        },
      });

      const updated = await db.order.update({
        where: { id: existing.id },
        data: {
          orderRef,
          razorpayOrderId: rzpOrder.id,
          amount: resolved.amountPaise,
          productName: resolved.productName,
          status: 'CREATED',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await db.paymentLog.create({
        data: {
          orderId: updated.id,
          userId: prismaUserId,
          event: 'ORDER_CREATED',
          level: 'INFO',
          message: `Order recreated after ${existing.status}: ${orderRef}`,
          payload: JSON.stringify({
            productType,
            productId: effectiveProductId,
            productName: resolved.productName,
            amount: resolved.amountPaise,
            clientAmountRupees: amount,
            priceSource: resolved.source,
            priceMismatch: priceRes.mismatch ?? null,
            razorpayOrderId: rzpOrder.id,
            previousStatus: existing.status,
            meta: resolved.meta,
          }),
          ...clientMeta,
        },
      });
      // If the client tried to pay a different amount than the server price,
      // log a separate WARNING so it's visible in the audit trail.
      if (priceRes.mismatch) {
        await db.paymentLog
          .create({
            data: {
              orderId: updated.id,
              userId: prismaUserId,
              event: 'PRICE_MISMATCH',
              level: 'WARN',
              message: `Client amount ₹${(priceRes.mismatch.clientPaise / 100).toFixed(2)} != server price ₹${(priceRes.mismatch.serverPaise / 100).toFixed(2)} — used server price.`,
              payload: JSON.stringify(priceRes.mismatch),
              ...clientMeta,
            },
          })
          .catch(() => {
            // swallow — logging only
          });
      }

      return NextResponse.json({
        orderId: updated.id,
        orderRef: updated.orderRef,
        razorpayOrderId: updated.razorpayOrderId,
        amount: updated.amount,
        currency: updated.currency,
        productType: updated.productType,
        productId: updated.productId,
        productName: updated.productName,
        keyId: process.env.RAZORPAY_KEY_ID,
        reused: false,
        status: updated.status,
      });
    }

    // ---- Fresh order: resolve price SERVER-SIDE (security) ----
    const priceRes = await resolvePrice(
      productType as PurchaseType,
      effectiveProductId,
      effectiveProductName,
      amount,
      meta as Record<string, unknown> | undefined,
    );
    if (!priceRes.ok || !priceRes.resolved) {
      return NextResponse.json(
        { error: priceRes.error ?? 'Could not resolve price' },
        { status: 400 },
      );
    }
    const resolved = priceRes.resolved;
    const amountPaise = resolved.amountPaise;

    const orderRef = generateOrderRef();
    const rzpOrder = await createRazorpayOrder({
      amount: amountPaise,
      receipt: orderRef,
      notes: {
        userId: prismaUserId,
        productType,
        productId: effectiveProductId,
        idempotencyKey,
      },
    });

    const order = await db.order.create({
      data: {
        orderRef,
        userId: prismaUserId,
        productType: productType as PurchaseType,
        productId: effectiveProductId,
        productName: resolved.productName,
        amount: amountPaise,
        currency: 'INR',
        idempotencyKey,
        razorpayOrderId: rzpOrder.id,
        status: 'CREATED',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await db.paymentLog.create({
      data: {
        orderId: order.id,
        userId: prismaUserId,
        event: 'ORDER_CREATED',
        level: 'INFO',
        message: `Order created: ${orderRef}`,
        payload: JSON.stringify({
          productType,
          productId: effectiveProductId,
          productName: resolved.productName,
          amount: amountPaise,
          clientAmountRupees: amount,
          priceSource: resolved.source,
          priceMismatch: priceRes.mismatch ?? null,
          razorpayOrderId: rzpOrder.id,
          meta: resolved.meta,
        }),
        ...clientMeta,
      },
    });
    if (priceRes.mismatch) {
      await db.paymentLog
        .create({
          data: {
            orderId: order.id,
            userId: prismaUserId,
            event: 'PRICE_MISMATCH',
            level: 'WARN',
            message: `Client amount ₹${(priceRes.mismatch.clientPaise / 100).toFixed(2)} != server price ₹${(priceRes.mismatch.serverPaise / 100).toFixed(2)} — used server price.`,
            payload: JSON.stringify(priceRes.mismatch),
            ...clientMeta,
          },
        })
        .catch(() => {
          // swallow — logging only
        });
    }

    return NextResponse.json({
      orderId: order.id,
      orderRef: order.orderRef,
      razorpayOrderId: order.razorpayOrderId,
      amount: order.amount,
      currency: order.currency,
      productType: order.productType,
      productId: order.productId,
      productName: order.productName,
      keyId: process.env.RAZORPAY_KEY_ID,
      reused: false,
      status: order.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Fire-and-forget error log — do NOT await (speeds up error response).
    db.paymentLog
      .create({
        data: {
          event: 'ORDER_CREATE_FAILED',
          level: 'ERROR',
          message: `Failed to create order: ${message}`,
          payload: JSON.stringify({ error: message }),
          ...clientMeta,
        },
      })
      .catch(() => {
        // swallow logging failure
      });
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}
