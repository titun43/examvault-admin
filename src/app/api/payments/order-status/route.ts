// =============================================================================
// GET /api/payments/order-status?orderId=...
// =============================================================================
// Returns the current status of a Prisma Order. Used by the Flutter app to
// RECONCILE a payment when the /verify call fails due to a network error —
// if Razorpay captured the payment and the webhook already marked the order
// PAID, this endpoint reports success so the app can unlock the content even
// though /verify never completed.
//
// This is the KEY RELIABILITY FIX for the payment system: previously, if
// /verify failed due to a transient network error, the app showed "Payment
// failed" even though the money was deducted and the webhook had already
// granted access. Now the app calls this endpoint as a fallback, and if the
// order is PAID, treats it as success.
//
// Response shape:
//   { status: 'PAID'|'CREATED'|'FAILED', paid: boolean, productType, productId,
//     productName, amount, razorpayOrderId, razorpayPaymentId?, granted: boolean }
//
// `granted` is true when the order is PAID AND the entitlement was granted
// (we check this by looking for an ENTITLEMENT_GRANTED paymentLog row).
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, upsertUser } from '@/lib/payment-auth';

export async function GET(req: NextRequest) {
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    const orderId = req.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 },
      );
    }

    // ---- Load order ----
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ownership check — a user can only check their own orders.
    if (order.userId !== prismaUserId) {
      return NextResponse.json(
        { error: 'Order ownership mismatch' },
        { status: 403 },
      );
    }

    // ---- If PAID, find the payment + check entitlement grant ----
    let razorpayPaymentId: string | null = null;
    let granted = false;

    if (order.status === 'PAID') {
      const payment = await db.payment.findFirst({
        where: { orderId: order.id, status: 'CAPTURED' },
        orderBy: { capturedAt: 'desc' },
      });
      razorpayPaymentId = payment?.razorpayPaymentId ?? null;

      // Check if the entitlement was granted (ENTITLEMENT_GRANTED log exists).
      const grantLog = await db.paymentLog.findFirst({
        where: { orderId: order.id, event: 'ENTITLEMENT_GRANTED' },
      });
      granted = grantLog !== null;
    }

    return NextResponse.json({
      status: order.status, // 'CREATED' | 'PAID' | 'FAILED'
      paid: order.status === 'PAID',
      granted,
      productType: order.productType,
      productId: order.productId,
      productName: order.productName,
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Fire-and-forget error log.
    db.paymentLog
      .create({
        data: {
          event: 'ORDER_STATUS_CHECK_FAILED',
          level: 'ERROR',
          message: `Order-status endpoint error: ${message}`,
          payload: JSON.stringify({ error: message }),
        },
      })
      .catch(() => {
        // swallow
      });
    return NextResponse.json(
      { error: 'Could not check order status' },
      { status: 500 },
    );
  }
}
