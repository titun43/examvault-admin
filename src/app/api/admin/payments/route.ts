// =============================================================================
// GET /api/admin/payments
// =============================================================================
// List payments with pagination + filters. Each row includes its Order
// (productType, productName, orderRef) and minimal User (email, phone).
//
// Query params:
//   page        — 1-based page number (default 1)
//   limit       — page size (default 20, max 100)
//   search      — substring match on razorpayPaymentId, order.orderRef, user.email
//   status      — PaymentStatus enum value (CAPTURED, FAILED, REFUNDED, ...)
//   method      — upi | card | netbanking | wallet | emi
//   productType — PurchaseType enum value (TEST_PURCHASE, SUBJECT_PACK, ...)
//   userId      — exact user id match
//   from        — ISO date (YYYY-MM-DD) — payments created >= this date
//   to          — ISO date (YYYY-MM-DD) — payments created <= this date
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay, parsePositiveInt } from '../_lib';

export async function GET(req: NextRequest) {
  // ---- Admin auth ----
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, parsePositiveInt(sp.get('page'), 1) ?? 1);
    const limit = Math.min(
      100,
      Math.max(1, parsePositiveInt(sp.get('limit'), 20) ?? 20),
    );
    const search = sp.get('search')?.trim() || '';
    const status = sp.get('status')?.trim() || '';
    const method = sp.get('method')?.trim() || '';
    const productType = sp.get('productType')?.trim() || '';
    const userId = sp.get('userId')?.trim() || '';
    const from = startOfDay(sp.get('from'));
    const to = endOfDay(sp.get('to'));

    // ---- Build where clause ----
    const where: Prisma.PaymentWhereInput = {};

    if (status) {
      // Validate against PaymentStatus enum
      const valid = [
        'CREATED',
        'AUTHORIZED',
        'CAPTURED',
        'FAILED',
        'REFUNDED',
        'PENDING',
      ];
      if (valid.includes(status)) {
        where.status = status as Prisma.PaymentWhereInput['status'];
      }
    }

    if (method) {
      // SQLite contains is case-sensitive; normalize both sides by lowercasing.
      where.method = { contains: method.toLowerCase() };
    }

    if (userId) {
      where.userId = userId;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Prisma.DateTimeFilter)['gte'] = from;
      if (to) (where.createdAt as Prisma.DateTimeFilter)['lte'] = to;
    }

    // search: matches razorpayPaymentId OR order.orderRef OR user.email
    if (search) {
      where.OR = [
        { razorpayPaymentId: { contains: search } },
        {
          order: { orderRef: { contains: search } },
        },
        {
          user: { email: { contains: search } },
        },
      ];
    }

    if (productType) {
      const valid = [
        'TEST_PURCHASE',
        'SUBJECT_PACK',
        'EXAM_PACK',
        'PREMIUM_SUBSCRIPTION',
      ] as const;
      if ((valid as readonly string[]).includes(productType)) {
        const existingOrder = (where.order ?? {}) as Prisma.OrderWhereInput;
        where.order = {
          ...existingOrder,
          productType: productType as Prisma.OrderWhereInput['productType'],
        };
      }
    }

    // ---- Query ----
    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderRef: true,
              productType: true,
              productName: true,
              productId: true,
              amount: true,
              currency: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/payments GET] error:', message);
    return NextResponse.json(
      { error: 'Failed to list payments' },
      { status: 500 },
    );
  }
}
