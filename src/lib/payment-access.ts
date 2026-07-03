// =============================================================================
// ExamVault - Payment Access Service (4-tier access logic)
// =============================================================================
// THE single source of truth for "can this user access this resource?"
//
// Access tiers (highest precedence first):
//   1. Active Premium Subscription -> access everything
//   2. Exam Pack purchase for the test's category -> access
//   3. Subject Pack purchase for the test's subject -> access
//   4. Individual Test purchase -> access that test only
//   5. Otherwise -> denied (show purchase screen)
//
// IMPORTANT — hierarchy resolution responsibility:
//   This service CANNOT read Firestore (no firebase-admin SDK on the server),
//   so it does NOT resolve a testId into its subjectId/categoryId. The caller
//   (Flutter app) MUST pass the full hierarchy when calling /access-check:
//     type=test&testId=X&subjectId=Y&categoryId=Z
//   If the caller omits subjectId/categoryId, tiers 2 and 3 are SKIPPED —
//   which would cause a FALSE DENY for a user who owns an exam/subject pack.
//   The Flutter app already knows the hierarchy from its Firestore reads, so
//   it must forward it. The premium content model itself (whether a test is
//   locked at all) is enforced by the `isPremium` flag on each test in
//   Firestore — the app only calls /access-check for tests where
//   `price > 0 || isPremium` is true.
// =============================================================================

import { db } from './db';
import type { PurchaseType } from '@prisma/client';

export type ResourceType = 'test' | 'subject' | 'exam' | 'all';

export interface ResourceDescriptor {
  type: ResourceType;
  // Firestore IDs (the caller resolves these from the test/category/subject)
  testId?: string;
  subjectId?: string;
  categoryId?: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  // Which entitlement granted access (for UI display / debugging)
  grantedBy?:
    | 'premium'
    | 'exam_pack'
    | 'subject_pack'
    | 'test_purchase'
    | 'admin_override';
  // The purchase / subscription row that granted access
  sourceId?: string;
  // Expiry if applicable (for premium subscriptions)
  expiresAt?: Date;
  // True when the resource needs an entitlement the user doesn't have.
  // The Flutter app uses this to decide whether to show the paywall: when
  // `allowed=false && requiresPremium=true`, surface the purchase screen.
  // (When `allowed=false && requiresPremium=false` the resource is either
  // free or the check was for `type=all` without a premium subscription.)
  requiresPremium?: boolean;
}

// ==================== MAIN ACCESS CHECK ====================
export async function checkAccess(
  prismaUserId: string,
  resource: ResourceDescriptor,
): Promise<AccessDecision> {
  // Tier 1: Active premium subscription
  const sub = await db.premiumSubscription.findFirst({
    where: {
      userId: prismaUserId,
      status: 'ACTIVE',
      endDate: { gt: new Date() },
    },
    orderBy: { endDate: 'desc' },
  });
  if (sub) {
    return {
      allowed: true,
      reason: 'Active premium subscription',
      grantedBy: 'premium',
      sourceId: sub.id,
      expiresAt: sub.endDate,
    };
  }

  // For 'all' resource type, premium is the only thing that grants access
  if (resource.type === 'all') {
    return { allowed: false, reason: 'No active premium subscription', requiresPremium: true };
  }

  // Tier 2: Exam pack (unlocks the whole category/exam)
  if (resource.categoryId) {
    const examPack = await db.examPackPurchase.findFirst({
      where: {
        userId: prismaUserId,
        categoryId: resource.categoryId,
        isActive: true,
      },
    });
    if (examPack) {
      return {
        allowed: true,
        reason: `Exam pack: ${examPack.packName}`,
        grantedBy: 'exam_pack',
        sourceId: examPack.id,
      };
    }
  }

  // Tier 3: Subject pack (unlocks the whole subject)
  if (resource.subjectId) {
    const subjPack = await db.subjectPackPurchase.findFirst({
      where: {
        userId: prismaUserId,
        subjectId: resource.subjectId,
        isActive: true,
      },
    });
    if (subjPack) {
      return {
        allowed: true,
        reason: `Subject pack: ${subjPack.packName}`,
        grantedBy: 'subject_pack',
        sourceId: subjPack.id,
      };
    }
  }

  // Tier 4: Individual test purchase (test access only)
  if (resource.type === 'test' && resource.testId) {
    const testPurch = await db.testPurchase.findFirst({
      where: {
        userId: prismaUserId,
        testId: resource.testId,
        isActive: true,
      },
    });
    if (testPurch) {
      return {
        allowed: true,
        reason: `Test purchased: ${testPurch.testTitle}`,
        grantedBy: 'test_purchase',
        sourceId: testPurch.id,
      };
    }
  }

  return { allowed: false, reason: 'No matching entitlement', requiresPremium: true };
}

// ==================== GRANT ACCESS AFTER PAYMENT ====================
// Called by the verify endpoint after a successful signature verification.
// Idempotent: if the entitlement already exists, returns it without creating
// a duplicate. Wrapped in a transaction.
export async function grantEntitlement(
  prismaUserId: string,
  productType: PurchaseType,
  productId: string,
  productName: string,
  amount: number,
  paymentId: string,
  orderId: string,
  // Optional metadata for subscriptions
  meta?: {
    planId?: string;
    planName?: string;
    planTier?: string;
    durationMonths?: number;
    subjectId?: string;
    categoryId?: string;
  },
): Promise<void> {
  await db.$transaction(async (tx) => {
    switch (productType) {
      case 'PREMIUM_SUBSCRIPTION': {
        if (!meta?.durationMonths) throw new Error('durationMonths required for subscription');
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + meta.durationMonths);
        // Expire any prior active sub for this user (only one active at a time)
        await tx.premiumSubscription.updateMany({
          where: { userId: prismaUserId, status: 'ACTIVE' },
          data: { status: 'EXPIRED' },
        });
        const sub = await tx.premiumSubscription.create({
          data: {
            userId: prismaUserId,
            planId: meta.planId ?? productId,
            planName: meta.planName ?? productName,
            planTier: meta.planTier ?? 'monthly',
            durationMonths: meta.durationMonths,
            amount,
            paymentId,
            orderId,
            status: 'ACTIVE',
            startDate: now,
            endDate,
          },
        });
        // Denormalize onto User for fast checks
        await tx.user.update({
          where: { id: prismaUserId },
          data: { isPremium: true, premiumExpiry: endDate },
        });
        await tx.paymentLog.create({
          data: {
            paymentId,
            orderId,
            userId: prismaUserId,
            event: 'ENTITLEMENT_GRANTED',
            level: 'AUDIT',
            message: `Premium subscription granted: ${meta.planName} (${meta.durationMonths}m)`,
            payload: JSON.stringify({ subscriptionId: sub.id, endDate }),
          },
        });
        break;
      }
      case 'TEST_PURCHASE': {
        // Idempotent: upsert via unique [userId, testId]
        await tx.testPurchase.upsert({
          where: { userId_testId: { userId: prismaUserId, testId: productId } },
          update: { isActive: true, paymentId, orderId, revokedAt: null, revokeReason: null },
          create: {
            userId: prismaUserId,
            testId: productId,
            testTitle: productName,
            amount,
            paymentId,
            orderId,
          },
        });
        await tx.paymentLog.create({
          data: {
            paymentId,
            orderId,
            userId: prismaUserId,
            event: 'ENTITLEMENT_GRANTED',
            level: 'AUDIT',
            message: `Test purchase unlocked: ${productName}`,
            payload: JSON.stringify({ testId: productId }),
          },
        });
        break;
      }
      case 'SUBJECT_PACK': {
        if (!meta?.subjectId) throw new Error('subjectId required for subject pack');
        // CRITICAL FIX: `productId` param = order.productId = the Firestore
        // subjectId (NOT the Prisma Product.id). SubjectPackPurchase.productId
        // has a FK to Product.id, so using the Firestore id directly causes a
        // foreign-key constraint violation — the entitlement is never created.
        // Resolve the real Product.id by looking up (type=SUBJECT_PACK,
        // refId=subjectId) inside this transaction.
        const subjProduct = await tx.product.findFirst({
          where: { type: 'SUBJECT_PACK', refId: meta.subjectId, isActive: true },
        });
        if (!subjProduct) {
          throw new Error(
            `SUBJECT_PACK product not found for subjectId: ${meta.subjectId}`,
          );
        }
        await tx.subjectPackPurchase.upsert({
          where: { userId_subjectId: { userId: prismaUserId, subjectId: meta.subjectId } },
          update: { isActive: true, paymentId, orderId, revokedAt: null, revokeReason: null },
          create: {
            userId: prismaUserId,
            productId: subjProduct.id,
            subjectId: meta.subjectId,
            packName: productName,
            amount,
            paymentId,
            orderId,
          },
        });
        await tx.paymentLog.create({
          data: {
            paymentId, orderId, userId: prismaUserId,
            event: 'ENTITLEMENT_GRANTED',
            level: 'AUDIT',
            message: `Subject pack unlocked: ${productName}`,
            payload: JSON.stringify({ subjectId: meta.subjectId }),
          },
        });
        break;
      }
      case 'EXAM_PACK': {
        if (!meta?.categoryId) throw new Error('categoryId required for exam pack');
        // CRITICAL FIX: `productId` param = order.productId = the Firestore
        // categoryId (NOT the Prisma Product.id). ExamPackPurchase.productId
        // has a FK to Product.id, so using the Firestore id directly causes a
        // foreign-key constraint violation — the entitlement is never created
        // and the user sees "payment succeeded but still locked". Resolve the
        // real Product.id by looking up (type=EXAM_PACK,
        // refId=categoryId) inside this transaction.
        const examProduct = await tx.product.findFirst({
          where: { type: 'EXAM_PACK', refId: meta.categoryId, isActive: true },
        });
        if (!examProduct) {
          throw new Error(
            `EXAM_PACK product not found for categoryId: ${meta.categoryId}`,
          );
        }
        await tx.examPackPurchase.upsert({
          where: { userId_categoryId: { userId: prismaUserId, categoryId: meta.categoryId } },
          update: { isActive: true, paymentId, orderId, revokedAt: null, revokeReason: null },
          create: {
            userId: prismaUserId,
            productId: examProduct.id,
            categoryId: meta.categoryId,
            packName: productName,
            amount,
            paymentId,
            orderId,
          },
        });
        await tx.paymentLog.create({
          data: {
            paymentId, orderId, userId: prismaUserId,
            event: 'ENTITLEMENT_GRANTED',
            level: 'AUDIT',
            message: `Exam pack unlocked: ${productName}`,
            payload: JSON.stringify({ categoryId: meta.categoryId }),
          },
        });
        break;
      }
    }
  });
}

// ==================== PRICE RESOLUTION ====================
// Resolve the current price (paise) + product name for a purchase type.
// For TEST_PURCHASE, reads from Firestore (passed in by caller).
// For SUBJECT_PACK / EXAM_PACK, reads from the Product table.
// For PREMIUM_SUBSCRIPTION, reads from Firestore premium_plans (passed in).
export interface PriceQuote {
  amount: number; // paise
  currency: string;
  productName: string;
  productId: string;
  meta: Record<string, unknown>;
}
