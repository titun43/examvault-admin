// =============================================================================
// GET /api/payments/access-check
// =============================================================================
// Returns the user's access decision for a given resource. Used by the Flutter
// app to decide whether to show a paywall or the content.
//
// Query: ?type=test|subject|exam&testId=...&subjectId=...&categoryId=...
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, upsertUser } from '@/lib/payment-auth';
import { checkAccess, ResourceType } from '@/lib/payment-access';
import { db } from '@/lib/db';
import { getClientMeta } from '../_lib';

const VALID_TYPES: ResourceType[] = ['test', 'subject', 'exam', 'all'];

export async function GET(req: NextRequest) {
  const clientMeta = getClientMeta(req);
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    // ---- Parse query ----
    const url = new URL(req.url);
    const type = url.searchParams.get('type') as ResourceType | null;
    const testId = url.searchParams.get('testId') ?? undefined;
    const subjectId = url.searchParams.get('subjectId') ?? undefined;
    const categoryId = url.searchParams.get('categoryId') ?? undefined;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Missing or invalid 'type' (must be test|subject|exam|all)" },
        { status: 400 },
      );
    }

    // ---- Access check ----
    const decision = await checkAccess(prismaUserId, {
      type,
      testId,
      subjectId,
      categoryId,
    });

    // Best-effort audit log (DEBUG-level)
    try {
      await db.paymentLog.create({
        data: {
          userId: prismaUserId,
          event: 'ACCESS_CHECK',
          level: 'INFO',
          message: `Access check (${type}): ${decision.allowed ? 'ALLOWED' : 'DENIED'} — ${decision.reason}`,
          payload: JSON.stringify({
            type,
            testId,
            subjectId,
            categoryId,
            allowed: decision.allowed,
            grantedBy: decision.grantedBy,
            sourceId: decision.sourceId,
            expiresAt: decision.expiresAt,
          }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow — access check must succeed even if logging fails
    }

    return NextResponse.json(decision);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    try {
      await db.paymentLog.create({
        data: {
          event: 'ACCESS_CHECK_ERROR',
          level: 'ERROR',
          message: `Access check error: ${message}`,
          payload: JSON.stringify({ error: message }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow
    }
    return NextResponse.json(
      { error: 'Access check failed' },
      { status: 500 },
    );
  }
}
