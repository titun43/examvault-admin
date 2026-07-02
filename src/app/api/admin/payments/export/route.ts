// =============================================================================
// GET /api/admin/payments/export
// =============================================================================
// CSV export of filtered payments. Same filters as the list endpoint but no
// pagination — exports the full filtered set (capped at 5000 rows for safety).
//
// Returns:
//   Content-Type:        text/csv; charset=utf-8
//   Content-Disposition: attachment; filename="examvault-payments-{date}.csv"
//   Body: UTF-8 BOM + CSV with the columns listed below.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay } from '../../_lib';
import { paiseToRupees } from '@/lib/razorpay-server';

const CSV_HEADERS = [
  'Payment ID',
  'Order Ref',
  'Date',
  'User Email',
  'User Phone',
  'Product Type',
  'Product Name',
  'Amount (INR)',
  'Currency',
  'Method',
  'Status',
  'Razorpay Payment ID',
  'Signature Verified',
  'Webhook Verified',
];

/** RFC4180-compliant CSV field escape: wrap in quotes if needed, escape " as "". */
function csvField(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatRow(row: unknown[]): string {
  return row.map(csvField).join(',');
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const sp = req.nextUrl.searchParams;
    const search = sp.get('search')?.trim() || '';
    const status = sp.get('status')?.trim() || '';
    const method = sp.get('method')?.trim() || '';
    const productType = sp.get('productType')?.trim() || '';
    const userId = sp.get('userId')?.trim() || '';
    const from = startOfDay(sp.get('from'));
    const to = endOfDay(sp.get('to'));

    const where: Prisma.PaymentWhereInput = {};

    if (status) {
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
      where.method = { contains: method.toLowerCase() };
    }

    if (userId) where.userId = userId;

    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Prisma.DateTimeFilter)['gte'] = from;
      if (to) (where.createdAt as Prisma.DateTimeFilter)['lte'] = to;
    }

    if (search) {
      where.OR = [
        { razorpayPaymentId: { contains: search } },
        { order: { orderRef: { contains: search } } },
        { user: { email: { contains: search } } },
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

    const payments = await db.payment.findMany({
      where,
      include: {
        order: {
          select: {
            orderRef: true,
            productType: true,
            productName: true,
          },
        },
        user: { select: { email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5000, // safety cap
    });

    // ---- Build CSV ----
    const lines: string[] = [];
    lines.push(formatRow(CSV_HEADERS));
    for (const p of payments) {
      lines.push(
        formatRow([
          p.id,
          p.order?.orderRef ?? '',
          p.createdAt.toISOString(),
          p.user?.email ?? '',
          p.user?.phone ?? '',
          p.order?.productType ?? '',
          p.order?.productName ?? '',
          paiseToRupees(p.amount).toFixed(2),
          p.currency,
          p.method ?? '',
          p.status,
          p.razorpayPaymentId ?? '',
          p.signatureVerified ? 'YES' : 'NO',
          p.webhookVerified ? 'YES' : 'NO',
        ]),
      );
    }

    const csv = lines.join('\r\n');
    // UTF-8 BOM for Excel friendliness
    const BOM = '\uFEFF';
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `examvault-payments-${dateStr}.csv`;

    return new NextResponse(BOM + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/payments/export GET] error:', message);
    return NextResponse.json(
      { error: 'Failed to export payments' },
      { status: 500 },
    );
  }
}
