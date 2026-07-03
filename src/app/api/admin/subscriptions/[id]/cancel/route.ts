// =============================================================================
// POST /api/admin/subscriptions/[id]/cancel
// =============================================================================
// Cancel an active premium subscription.
//
// Body:
//   reason? : string — admin note (stored as cancelReason)
//
// Logic:
//   1. Load PremiumSubscription. If status !== 'ACTIVE', return 400.
//   2. Update status -> CANCELLED, cancelledAt = now, cancelReason = reason.
//   3. If this was the user's active sub (i.e. user.isPremium === true and
//      user.premiumExpiry === sub.endDate), flip User.isPremium to false.
//   4. Log SUBSCRIPTION_CANCELLED.
//   5. Return updated sub.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { getClientMeta } from '../../../_lib';

interface CancelBody {
  reason?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;
  const clientMeta = getClientMeta(req);

  try {
    const { id } = await params;

    let body: CancelBody = {};
    try {
      body = (await req.json()) as CancelBody;
    } catch {
      // empty body is OK
    }

    const sub = await db.premiumSubscription.findUnique({
      where: { id },
    });

    if (!sub) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    if (sub.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot cancel subscription with status ${sub.status}. Only ACTIVE subscriptions can be cancelled.` },
        { status: 400 },
      );
    }

    const now = new Date();

    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.premiumSubscription.update({
        where: { id: sub.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: now,
          cancelReason: body.reason ?? null,
        },
      });

      // Flip user.isPremium off IF this was the user's currently-active sub.
      // Heuristic: user.isPremium was true AND premiumExpiry matches sub.endDate.
      const user = await tx.user.findUnique({ where: { id: sub.userId } });
      if (
        user &&
        user.isPremium &&
        user.premiumExpiry &&
        user.premiumExpiry.getTime() === sub.endDate.getTime()
      ) {
        await tx.user.update({
          where: { id: sub.userId },
          data: { isPremium: false },
        });
      }

      await tx.paymentLog.create({
        data: {
          userId: sub.userId,
          paymentId: sub.paymentId ?? undefined,
          orderId: sub.orderId ?? undefined,
          event: 'SUBSCRIPTION_CANCELLED',
          level: 'AUDIT',
          message: `Subscription cancelled: ${sub.planName} (${sub.planTier}) — ${sub.id}`,
          payload: JSON.stringify({
            subscriptionId: sub.id,
            planName: sub.planName,
            planTier: sub.planTier,
            reason: body.reason ?? null,
          }),
          ...clientMeta,
        },
      });

      return upd;
    });

    return NextResponse.json({ subscription: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/subscriptions/[id]/cancel POST] error:', message);
    return NextResponse.json(
      { error: `Failed to cancel subscription: ${message}` },
      { status: 500 },
    );
  }
}
