// =============================================================================
// GET /api/admin/payments/[id]
// =============================================================================
// Full payment detail: includes Order, User, Transactions, PaymentLogs, and
// the relevant entitlement row (PremiumSubscription / TestPurchase /
// SubjectPackPurchase / ExamPackPurchase) if any.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;

    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        order: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            displayName: true,
            firebaseUid: true,
            isPremium: true,
            premiumExpiry: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        paymentLogs: {
          orderBy: { createdAt: 'desc' },
          take: 200,
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 },
      );
    }

    // ---- Resolve the entitlement row(s) granted by this payment ----
    // We look at the order's productType + productId to find the matching row.
    let entitlement:
      | { kind: string; row: unknown }
      | null = null;

    if (payment.order) {
      const pt = payment.order.productType;
      if (pt === 'PREMIUM_SUBSCRIPTION' && payment.order.productId) {
        // PremiumSubscription rows are keyed by planId, but we can also link
        // via paymentId. Use paymentId for accuracy.
        const sub = await db.premiumSubscription.findFirst({
          where: {
            OR: [
              { paymentId: payment.id },
              { planId: payment.order.productId, userId: payment.userId },
            ],
          },
        });
        if (sub) entitlement = { kind: 'premium_subscription', row: sub };
      } else if (pt === 'TEST_PURCHASE') {
        const tp = await db.testPurchase.findFirst({
          where: {
            OR: [
              { paymentId: payment.id },
              { testId: payment.order.productId, userId: payment.userId },
            ],
          },
        });
        if (tp) entitlement = { kind: 'test_purchase', row: tp };
      } else if (pt === 'SUBJECT_PACK') {
        const sp = await db.subjectPackPurchase.findFirst({
          where: {
            OR: [
              { paymentId: payment.id },
              { productId: payment.order.productId, userId: payment.userId },
            ],
          },
        });
        if (sp) entitlement = { kind: 'subject_pack_purchase', row: sp };
      } else if (pt === 'EXAM_PACK') {
        const ep = await db.examPackPurchase.findFirst({
          where: {
            OR: [
              { paymentId: payment.id },
              { productId: payment.order.productId, userId: payment.userId },
            ],
          },
        });
        if (ep) entitlement = { kind: 'exam_pack_purchase', row: ep };
      }
    }

    return NextResponse.json({
      payment,
      entitlement,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/payments/[id] GET] error:', message);
    return NextResponse.json(
      { error: 'Failed to load payment detail' },
      { status: 500 },
    );
  }
}
