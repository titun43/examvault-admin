// =============================================================================
// POST /api/admin/subject-pack-purchases/[id]/revoke
// =============================================================================
// Revoke a subject-pack purchase entitlement.
//
// Body:
//   reason? : string — admin note (stored as revokeReason)
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

    const sp = await db.subjectPackPurchase.findUnique({ where: { id } });
    if (!sp) {
      return NextResponse.json(
        { error: 'Subject pack purchase not found' },
        { status: 404 },
      );
    }

    const now = new Date();
    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.subjectPackPurchase.update({
        where: { id: sp.id },
        data: {
          isActive: false,
          revokedAt: now,
          revokeReason: body.reason ?? null,
        },
      });

      await tx.paymentLog.create({
        data: {
          userId: sp.userId,
          paymentId: sp.paymentId ?? undefined,
          orderId: sp.orderId ?? undefined,
          event: 'SUBJECT_PACK_REVOKED',
          level: 'AUDIT',
          message: `Subject pack revoked: ${sp.packName} (subjectId=${sp.subjectId})`,
          payload: JSON.stringify({
            subjectPackPurchaseId: sp.id,
            productId: sp.productId,
            subjectId: sp.subjectId,
            packName: sp.packName,
            reason: body.reason ?? null,
          }),
          ...clientMeta,
        },
      });

      return upd;
    });

    return NextResponse.json({ subjectPackPurchase: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/subject-pack-purchases/[id]/revoke POST] error:', message);
    return NextResponse.json(
      { error: `Failed to revoke subject pack: ${message}` },
      { status: 500 },
    );
  }
}
