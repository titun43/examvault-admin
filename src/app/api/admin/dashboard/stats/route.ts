// =============================================================================
// GET /api/admin/dashboard/stats
// =============================================================================
// Payment dashboard aggregate counts. Single response with:
//   totalRevenue          — sum of amount for CAPTURED payments (paise)
//   revenueLast30Days     — same, last 30 days
//   activeSubscriptions   — count of ACTIVE PremiumSubscription rows
//   totalTestPurchases    — count of all TestPurchase rows
//   totalSubjectPackPurchases
//   totalExamPackPurchases
//   paymentsToday         — count of payments created today
//   failedPayments        — count of FAILED payments
//   refundsCount          — count of REFUND transactions
//   refundsAmount         — sum of refund Transaction amounts (paise)
//
// All numeric aggregates are returned in paise; the UI converts to rupees.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfTodayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );

    // Run all aggregates in parallel.
    const [
      totalRevAgg,
      rev30Agg,
      activeSubsCount,
      testPurchCount,
      subjectPurchCount,
      examPurchCount,
      paymentsTodayCount,
      failedPaymentsCount,
      refundsAgg,
    ] = await Promise.all([
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'CAPTURED' },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'CAPTURED',
          createdAt: { gte: last30 },
        },
      }),
      db.premiumSubscription.count({ where: { status: 'ACTIVE' } }),
      db.testPurchase.count(),
      db.subjectPackPurchase.count(),
      db.examPackPurchase.count(),
      db.payment.count({
        where: { createdAt: { gte: startOfTodayUTC } },
      }),
      db.payment.count({ where: { status: 'FAILED' } }),
      db.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { type: 'REFUND' },
      }),
    ]);

    return NextResponse.json({
      totalRevenue: totalRevAgg._sum.amount ?? 0,
      revenueLast30Days: rev30Agg._sum.amount ?? 0,
      activeSubscriptions: activeSubsCount,
      totalTestPurchases: testPurchCount,
      totalSubjectPackPurchases: subjectPurchCount,
      totalExamPackPurchases: examPurchCount,
      paymentsToday: paymentsTodayCount,
      failedPayments: failedPaymentsCount,
      refundsCount: refundsAgg._count,
      refundsAmount: refundsAgg._sum.amount ?? 0,
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/dashboard/stats GET] error:', message);
    return NextResponse.json(
      { error: 'Failed to load dashboard stats' },
      { status: 500 },
    );
  }
}
