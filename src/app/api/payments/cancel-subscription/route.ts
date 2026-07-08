// =============================================================================
// POST /api/payments/cancel-subscription
// =============================================================================
// Cancels the user's active premium subscription so it will NOT renew at the
// end of the current billing period. The subscription remains ACTIVE (full
// access) until `endDate`, then naturally expires.
//
// Called by the Flutter app's MyPurchasesScreen "Cancel Subscription" button.
// Auth: Firebase ID token (Bearer).
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, upsertUser } from '@/lib/payment-auth';
import { getClientMeta } from '../_lib';

export async function POST(req: NextRequest) {
  const clientMeta = getClientMeta(req);
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    // ---- Find the user's active subscription ----
    const now = new Date();
    const sub = await db.premiumSubscription.findFirst({
      where: {
        userId: prismaUserId,
        status: 'ACTIVE',
        endDate: { gt: now },
      },
      orderBy: { endDate: 'desc' },
    });

    if (!sub) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 404 },
      );
    }

    // ---- Mark as CANCELLED (keeps access until endDate) ----
    await db.premiumSubscription.update({
      where: { id: sub.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        cancelReason: 'User cancelled via app',
      },
    });

    // ---- Audit log ----
    db.paymentLog
      .create({
        data: {
          userId: prismaUserId,
          event: 'SUBSCRIPTION_CANCELLED',
          level: 'AUDIT',
          message: `Subscription ${sub.planName} cancelled (remains active until ${sub.endDate.toISOString()})`,
          payload: JSON.stringify({
            subscriptionId: sub.id,
            planName: sub.planName,
            endDate: sub.endDate,
          }),
          ...clientMeta,
        },
      })
      .catch(() => {
        // swallow — logging is best-effort
      });

    return NextResponse.json({
      success: true,
      cancelledAt: now.toISOString(),
      activeUntil: sub.endDate.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Could not cancel subscription', detail: message },
      { status: 500 },
    );
  }
}
