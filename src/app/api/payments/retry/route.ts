// =============================================================================
// POST /api/payments/retry
// =============================================================================
// For an order that the user failed to pay (or that expired), creates a fresh
// Razorpay order on the SAME Order row (preserving the idempotency key) so the
// user can attempt checkout again. If the order is already PAID, returns it
// without modification.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay-server';
import { requireUser, upsertUser } from '@/lib/payment-auth';
import { generateOrderRef, getClientMeta } from '../_lib';

interface RetryBody {
  orderId: string; // Prisma Order.id of the failed/expired order
}

export async function POST(req: NextRequest) {
  const clientMeta = getClientMeta(req);
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    // ---- Parse body ----
    let body: RetryBody;
    try {
      body = (await req.json()) as RetryBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
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

    // ---- Idempotency: already paid, just return ----
    if (order.status === 'PAID') {
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
        status: order.status,
        reused: true,
      });
    }

    // ---- Create a fresh Razorpay order on the same row ----
    const newOrderRef = generateOrderRef();
    const rzpOrder = await createRazorpayOrder({
      amount: order.amount,
      receipt: newOrderRef,
      notes: {
        userId: prismaUserId,
        productType: order.productType,
        productId: order.productId,
        idempotencyKey: order.idempotencyKey,
        retry: '1',
      },
    });

    const updated = await db.order.update({
      where: { id: order.id },
      data: {
        orderRef: newOrderRef,
        razorpayOrderId: rzpOrder.id,
        status: 'CREATED',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await db.paymentLog.create({
      data: {
        orderId: updated.id,
        userId: prismaUserId,
        event: 'ORDER_RETRY',
        level: 'INFO',
        message: `Order retried after ${order.status}: ${newOrderRef}`,
        payload: JSON.stringify({
          previousStatus: order.status,
          previousOrderRef: order.orderRef,
          newOrderRef,
          razorpayOrderId: rzpOrder.id,
        }),
        ...clientMeta,
      },
    });

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
      status: updated.status,
      reused: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    try {
      await db.paymentLog.create({
        data: {
          event: 'ORDER_RETRY_FAILED',
          level: 'ERROR',
          message: `Retry endpoint error: ${message}`,
          payload: JSON.stringify({ error: message }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow
    }
    return NextResponse.json(
      { error: 'Failed to retry order' },
      { status: 500 },
    );
  }
}
