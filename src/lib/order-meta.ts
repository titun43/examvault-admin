// =============================================================================
// ExamVault - Order Meta Resolver (shared by /verify and /webhook)
// =============================================================================
// The create-order endpoint stores the purchase `meta` (subjectId / categoryId /
// plan metadata) inside the ORDER_CREATED PaymentLog row's `payload` JSON,
// because the Order schema has no meta column. Both /verify and /webhook need
// to read this meta back to call `grantEntitlement`, so the logic is extracted
// here to avoid duplication and keep the two paths consistent.
//
// This is CRITICAL for the webhook safety net: when the Razorpay webhook fires
// `payment.captured` and the app's /verify has NOT yet run (or failed), the
// webhook must be able to grant the entitlement on its own — which requires
// resolving the meta the same way /verify does.
// =============================================================================

import { db } from './db';

export interface OrderMeta {
  planId?: string;
  planName?: string;
  planTier?: string;
  durationMonths?: number;
  subjectId?: string;
  categoryId?: string;
}

/**
 * Resolve the create-order `meta` (subjectId / categoryId / plan metadata)
 * from the ORDER_CREATED PaymentLog row written by create-order. Returns
 * `undefined` if no meta was stored (e.g. for TEST_PURCHASE). For
 * SUBJECT_PACK / EXAM_PACK, falls back to using productId as subjectId /
 * categoryId when no meta was stored.
 */
export async function resolveOrderMeta(
  orderId: string,
): Promise<OrderMeta | undefined> {
  const log = await db.paymentLog.findFirst({
    where: { orderId, event: 'ORDER_CREATED' },
    orderBy: { createdAt: 'desc' },
  });
  let parsed:
    | { meta?: OrderMeta; productType?: string; productId?: string }
    | null = null;
  if (log?.payload) {
    try {
      parsed = JSON.parse(log.payload) as {
        meta?: OrderMeta;
        productType?: string;
        productId?: string;
      };
    } catch {
      parsed = null;
    }
  }
  const meta = parsed?.meta;
  // Fallbacks for legacy orders without stored meta
  if (!meta) {
    if (parsed?.productType === 'SUBJECT_PACK' && parsed.productId) {
      return { subjectId: parsed.productId };
    }
    if (parsed?.productType === 'EXAM_PACK' && parsed.productId) {
      return { categoryId: parsed.productId };
    }
    return undefined;
  }
  // Backfill missing subjectId/categoryId from productId for pack types
  if (parsed?.productType === 'SUBJECT_PACK' && !meta.subjectId && parsed.productId) {
    meta.subjectId = parsed.productId;
  }
  if (parsed?.productType === 'EXAM_PACK' && !meta.categoryId && parsed.productId) {
    meta.categoryId = parsed.productId;
  }
  return meta;
}
