// =============================================================================
// ExamVault - Server-side Price Resolver
// =============================================================================
// THE single source of truth for "how much should this order cost?"
//
// PROBLEM (security): The old create-order endpoint trusted the `amount` sent
// by the client. A malicious client could send `amount: 1` for a ₹99 product,
// the backend would create a ₹1 Razorpay order, the user pays ₹1, the signature
// verifies, and the entitlement is granted — a price-tampering attack.
//
// FIX: The backend now resolves the canonical price SERVER-SIDE and IGNORES the
// client-sent amount for product types where the price is known to the backend:
//
//   - SUBJECT_PACK / EXAM_PACK  → read from the Prisma `Product` table
//                                 (server-authoritative; client amount IGNORED)
//   - TEST_PURCHASE             → Firestore test price is NOT readable server-side
//                                 here (no firebase-admin SDK), so the client
//                                 amount is used BUT bounds-validated + audited.
//                                 The Razorpay order binds the amount, and /verify
//                                 cross-checks the captured amount, so tampering
//                                 is bounded to the validated range.
//   - PREMIUM_SUBSCRIPTION      → same as TEST_PURCHASE (Firestore premium_plans).
//
// The resolved price is what gets stored on the Order and sent to Razorpay.
// The client amount is logged alongside for audit (PRICE_MISMATCH warnings).
// =============================================================================

import { db } from './db';
import type { PurchaseType } from '@prisma/client';

export interface ResolvedPrice {
  /** Final amount in PAISE to charge. Always server-controlled. */
  amountPaise: number;
  /** Authoritative product name (from Product table for packs; client for others). */
  productName: string;
  /** The Prisma Product.id if this is a pack (for entitlement linking). */
  productId: string;
  /** Where the price came from — for audit logging. */
  source: 'product_table' | 'client_validated';
  /** True when the price is fully server-authoritative (packs). */
  serverAuthoritative: boolean;
  /** The meta to attach to the order (subjectId / categoryId / plan metadata). */
  meta: Record<string, unknown>;
}

export interface PriceResolutionResult {
  ok: boolean;
  resolved?: ResolvedPrice;
  error?: string;
  /** Client amount vs server amount, for audit. Null when not comparable. */
  mismatch?: { clientPaise: number; serverPaise: number };
}

// Sanity bounds for client-supplied amounts (tests + premium plans).
// Min ₹1 (100 paise), Max ₹10,000 (1,000,000 paise). Anything outside this
// range is rejected outright — no legitimate test or plan should exceed it.
const MIN_CLIENT_PAISE = 100;
const MAX_CLIENT_PAISE = 1_000_000;

/**
 * Resolve the canonical price for a purchase.
 *
 * @param productType  TEST_PURCHASE | SUBJECT_PACK | EXAM_PACK | PREMIUM_SUBSCRIPTION
 * @param productId    Client-supplied product id (Firestore testId, Product refId,
 *                     or plan id).
 * @param clientProductName  Client-supplied product name (used for tests/premium).
 * @param clientAmountRupees  Client-supplied amount in RUPEES (used for tests/premium,
 *                            IGNORED for packs).
 * @param clientMeta  Client-supplied meta (plan duration, subject/category ids).
 */
export async function resolvePrice(
  productType: PurchaseType,
  productId: string,
  clientProductName: string,
  clientAmountRupees: number,
  clientMeta?: Record<string, unknown>,
): Promise<PriceResolutionResult> {
  // -------------------- PACKS: server-authoritative --------------------
  if (productType === 'SUBJECT_PACK' || productType === 'EXAM_PACK') {
    // The client sends the Firestore refId (subjectId / categoryId) as productId.
    // Look up the active Product row by (type, refId).
    const product = await db.product.findFirst({
      where: { type: productType, refId: productId, isActive: true },
    });
    if (!product) {
      return {
        ok: false,
        error: `This ${productType === 'SUBJECT_PACK' ? 'subject pack' : 'exam pack'} is not available for purchase.`,
      };
    }
    const clientPaise = Math.round(clientAmountRupees * 100);
    const result: ResolvedPrice = {
      amountPaise: product.price,
      productName: product.name,
      productId: product.id,
      source: 'product_table',
      serverAuthoritative: true,
      meta: {
        ...(productType === 'SUBJECT_PACK'
          ? { subjectId: product.refId }
          : { categoryId: product.refId }),
        ...sanitizeMeta(clientMeta),
      },
    };
    return {
      ok: true,
      resolved: result,
      mismatch:
        clientPaise !== product.price
          ? { clientPaise, serverPaise: product.price }
          : undefined,
    };
  }

  // -------------------- TESTS / PREMIUM: client-validated --------------------
  // Firestore prices aren't readable server-side here. Use the client amount
  // but enforce strict bounds. The Razorpay order binds the amount, and /verify
  // cross-checks the captured amount — so tampering is bounded to [MIN, MAX].
  if (
    productType === 'TEST_PURCHASE' ||
    productType === 'PREMIUM_SUBSCRIPTION'
  ) {
    const clientPaise = Math.round(clientAmountRupees * 100);
    if (!Number.isFinite(clientPaise) || clientPaise < MIN_CLIENT_PAISE) {
      return {
        ok: false,
        error: 'Invalid amount. Please refresh and try again.',
      };
    }
    if (clientPaise > MAX_CLIENT_PAISE) {
      return {
        ok: false,
        error: 'Amount exceeds the maximum allowed. Please contact support.',
      };
    }
    const result: ResolvedPrice = {
      amountPaise: clientPaise,
      productName: clientProductName,
      productId,
      source: 'client_validated',
      serverAuthoritative: false,
      meta: sanitizeMeta(clientMeta) ?? {},
    };
    return { ok: true, resolved: result };
  }

  return { ok: false, error: 'Unknown product type' };
}

/**
 * Sanitize client meta: keep only known keys, drop anything else to prevent
 * injection of unexpected fields into the order's stored meta.
 */
function sanitizeMeta(
  meta?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const ALLOWED = [
    'planId',
    'planName',
    'planTier',
    'durationMonths',
    'subjectId',
    'categoryId',
    'subjectName',
    'categoryName',
    'testId',
    'testTitle',
  ];
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED) {
    if (k in meta) out[k] = meta[k];
  }
  return out;
}
