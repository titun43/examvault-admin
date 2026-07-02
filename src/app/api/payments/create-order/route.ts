// =============================================================================
// POST /api/payments/create-order
// =============================================================================
// Creates a Razorpay order for a product purchase. Idempotent on the client
// `idempotencyKey`: a duplicate request for a PAID/CREATED/ATTEMPTED order
// returns the existing Razorpay order id; a FAILED/EXPIRED order is recreated.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  createRazorpayOrder,
  rupeesToPaise,
} from '@/lib/razorpay-server';
import { requireUser, upsertUser } from '@/lib/payment-auth';
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
  amount: number; // rupees
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
    if (
      !productType ||
      !productId ||
      !productName ||
      typeof amount !== 'number' ||
      amount <= 0 ||
      !idempotencyKey
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
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
        { error: 'Invalid productType' },
        { status: 400 },
      );
    }

    const amountPaise = rupeesToPaise(amount);

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

      // FAILED or EXPIRED — recreate the Razorpay order on the existing row
      const orderRef = generateOrderRef();
      const rzpOrder = await createRazorpayOrder({
        amount: amountPaise,
        receipt: orderRef,
        notes: {
          userId: prismaUserId,
          productType,
          productId,
          idempotencyKey,
        },
      });

      const updated = await db.order.update({
        where: { id: existing.id },
        data: {
          orderRef,
          razorpayOrderId: rzpOrder.id,
          amount: amountPaise,
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
            productId,
            amount: amountPaise,
            razorpayOrderId: rzpOrder.id,
            previousStatus: existing.status,
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
        reused: false,
        status: updated.status,
      });
    }

    // ---- Fresh order ----
    const orderRef = generateOrderRef();
    const rzpOrder = await createRazorpayOrder({
      amount: amountPaise,
      receipt: orderRef,
      notes: {
        userId: prismaUserId,
        productType,
        productId,
        idempotencyKey,
      },
    });

    const order = await db.order.create({
      data: {
        orderRef,
        userId: prismaUserId,
        productType: productType as PurchaseType,
        productId,
        productName,
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
          productId,
          productName,
          amount: amountPaise,
          razorpayOrderId: rzpOrder.id,
          meta: meta ?? null,
        }),
        ...clientMeta,
      },
    });

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
    // Best-effort log
    try {
      await db.paymentLog.create({
        data: {
          event: 'ORDER_CREATE_FAILED',
          level: 'ERROR',
          message: `Failed to create order: ${message}`,
          payload: JSON.stringify({ error: message }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow logging failure
    }
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}
