// =============================================================================
// POST /api/admin/test-purchases/[id]/revoke
// =============================================================================
// Revoke a test purchase entitlement.
//
// Body:
//   reason? : string — admin note (stored as revokeReason)
//
// Logic:
//   1. Load TestPurchase.
//   2. Set isActive = false, revokedAt = now, revokeReason = reason.
//   3. Log TEST_PURCHASE_REVOKED.
//   4. Return updated row.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { getClientMeta } from '../../../_lib';

interface RevokeBody {
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

    let body: RevokeBody = {};
    try {
      body = (await req.json()) as RevokeBody;
    } catch {
      // empty body is OK
    }

    const tp = await db.testPurchase.findUnique({ where: { id } });
    if (!tp) {
      return NextResponse.json(
        { error: 'Test purchase not found' },
        { status: 404 },
      );
    }

    const now = new Date();
    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.testPurchase.update({
        where: { id: tp.id },
        data: {
          isActive: false,
          revokedAt: now,
          revokeReason: body.reason ?? null,
        },
      });

      await tx.paymentLog.create({
        data: {
          userId: tp.userId,
          paymentId: tp.paymentId ?? undefined,
          orderId: tp.orderId ?? undefined,
          event: 'TEST_PURCHASE_REVOKED',
          level: 'AUDIT',
          message: `Test purchase revoked: ${tp.testTitle} (testId=${tp.testId})`,
          payload: JSON.stringify({
            testPurchaseId: tp.id,
            testId: tp.testId,
            testTitle: tp.testTitle,
            reason: body.reason ?? null,
          }),
          ...clientMeta,
        },
      });

      return upd;
    });

    return NextResponse.json({ testPurchase: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/test-purchases/[id]/revoke POST] error:', message);
    return NextResponse.json(
      { error: `Failed to revoke test purchase: ${message}` },
      { status: 500 },
    );
  }
}
