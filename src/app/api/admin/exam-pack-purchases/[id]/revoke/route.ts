// =============================================================================
// POST /api/admin/exam-pack-purchases/[id]/revoke
// =============================================================================
// Revoke an exam-pack purchase entitlement.
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

    const ep = await db.examPackPurchase.findUnique({ where: { id } });
    if (!ep) {
      return NextResponse.json(
        { error: 'Exam pack purchase not found' },
        { status: 404 },
      );
    }

    const now = new Date();
    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.examPackPurchase.update({
        where: { id: ep.id },
        data: {
          isActive: false,
          revokedAt: now,
          revokeReason: body.reason ?? null,
        },
      });

      await tx.paymentLog.create({
        data: {
          userId: ep.userId,
          paymentId: ep.paymentId ?? undefined,
          orderId: ep.orderId ?? undefined,
          event: 'EXAM_PACK_REVOKED',
          level: 'AUDIT',
          message: `Exam pack revoked: ${ep.packName} (categoryId=${ep.categoryId})`,
          payload: JSON.stringify({
            examPackPurchaseId: ep.id,
            productId: ep.productId,
            categoryId: ep.categoryId,
            packName: ep.packName,
            reason: body.reason ?? null,
          }),
          ...clientMeta,
        },
      });

      return upd;
    });

    return NextResponse.json({ examPackPurchase: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/exam-pack-purchases/[id]/revoke POST] error:', message);
    return NextResponse.json(
      { error: `Failed to revoke exam pack: ${message}` },
      { status: 500 },
    );
  }
}
