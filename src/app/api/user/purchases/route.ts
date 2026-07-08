// =============================================================================
// GET /api/user/purchases
// =============================================================================
// Returns the authenticated user's purchase dashboard:
//   - subscription: active PremiumSubscription (if any)
//   - examPacks:    ExamPackPurchase rows (isActive)
//   - subjectPacks: SubjectPackPurchase rows (isActive)
//   - tests:        TestPurchase rows (isActive)
//   - payments:     recent Payment rows (CAPTURED / FAILED), newest first
//
// The Flutter app's MyPurchasesScreen calls this endpoint to render the
// "My Purchases" / "Payment History" page in the Profile tab. Without this
// endpoint the screen 404s and shows a "rolling out" message, so the user
// never sees their purchases even after a successful payment.
//
// Auth: Firebase ID token (Bearer) — verified via requireUser + upsertUser,
// same as all other payment endpoints.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, upsertUser } from '@/lib/payment-auth';

// Cap the number of payment-history rows we return so the payload stays small.
const PAYMENT_HISTORY_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    // ---- Auth ----
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const prismaUserId = await upsertUser(auth.user);

    // ---- Active premium subscription (most recent ACTIVE, not expired) ----
    // We also include CANCELLED subs that are still within their endDate so the
    // user sees "Active until <date>" even after cancelling.
    const now = new Date();
    const subscription = await db.premiumSubscription.findFirst({
      where: {
        userId: prismaUserId,
        status: { in: ['ACTIVE', 'CANCELLED'] },
        endDate: { gt: now },
      },
      orderBy: { endDate: 'desc' },
    });

    // ---- Exam pack purchases ----
    const examPackPurchases = await db.examPackPurchase.findMany({
      where: { userId: prismaUserId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // ---- Subject pack purchases ----
    const subjectPackPurchases = await db.subjectPackPurchase.findMany({
      where: { userId: prismaUserId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // ---- Individual test purchases ----
    const testPurchases = await db.testPurchase.findMany({
      where: { userId: prismaUserId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // ---- Resolve Product names for packs (best-effort) ----
    // ExamPackPurchase/SubjectPackPurchase store `packName` (snapshot at purchase
    // time) and `productId`. We prefer packName; if missing, fall back to the
    // Product.name. Collect productIds to fetch in one query.
    const productIds = new Set<string>();
    for (const p of examPackPurchases) {
      if (!p.packName && p.productId) productIds.add(p.productId);
    }
    for (const p of subjectPackPurchases) {
      if (!p.packName && p.productId) productIds.add(p.productId);
    }
    const products =
      productIds.size > 0
        ? await db.product.findMany({
            where: { id: { in: Array.from(productIds) } },
            select: { id: true, name: true },
          })
        : [];
    const productNameById = new Map(products.map((p) => [p.id, p.name]));

    // ---- Recent payments (with their order for product name + amount) ----
    const payments = await db.payment.findMany({
      where: { userId: prismaUserId },
      orderBy: { createdAt: 'desc' },
      take: PAYMENT_HISTORY_LIMIT,
      include: { order: { select: { productName: true, productType: true } } },
    });

    // ---- Build the response payload ----
    // Field names match what the Flutter MyPurchasesScreen reads:
    //   subscription: { planName, planTier, startsAt, expiresAt, status }
    //   examPacks:    [{ productName, categoryName, purchasedAt, paymentId }]
    //   subjectPacks: [{ productName, subjectName,  purchasedAt, paymentId }]
    //   tests:        [{ productName, purchasedAt, paymentId }]
    //   payments:     [{ id, productName, amount, status, createdAt }]
    const subPayload = subscription
      ? {
          planName: subscription.planName,
          planTier: subscription.planTier,
          startsAt: subscription.startDate.toISOString(),
          expiresAt: subscription.endDate.toISOString(),
          status: subscription.status, // ACTIVE | CANCELLED
        }
      : null;

    const examPacksPayload = examPackPurchases.map((p) => ({
      id: p.id,
      productName: p.packName || productNameById.get(p.productId) || 'Exam Pack',
      categoryId: p.categoryId ?? '',   // Firestore category doc id — Flutter uses this to navigate
      categoryName: '',                  // resolved from Firestore on the client if needed
      purchasedAt: p.createdAt.toISOString(),
      paymentId: p.paymentId ?? '',
    }));

    const subjectPacksPayload = subjectPackPurchases.map((p) => ({
      id: p.id,
      productName: p.packName || productNameById.get(p.productId) || 'Subject Pack',
      subjectId: p.subjectId ?? '',     // Firestore subject doc id — Flutter uses this to navigate
      subjectName: '',
      purchasedAt: p.createdAt.toISOString(),
      paymentId: p.paymentId ?? '',
    }));

    const testsPayload = testPurchases.map((p) => ({
      id: p.id,
      productName: p.testTitle,
      testId: p.testId,
      purchasedAt: p.createdAt.toISOString(),
      paymentId: p.paymentId ?? '',
    }));

    const paymentsPayload = payments.map((p) => ({
      id: p.id,
      productName: p.order?.productName ?? 'Payment',
      amount: p.amount, // paise
      status: p.status, // CAPTURED | FAILED | ...
      method: p.method,
      createdAt: p.createdAt.toISOString(),
      paymentId: p.razorpayPaymentId ?? '',
    }));

    return NextResponse.json({
      subscription: subPayload,
      examPacks: examPacksPayload,
      subjectPacks: subjectPacksPayload,
      tests: testsPayload,
      payments: paymentsPayload,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Fire-and-forget error log.
    db.paymentLog
      .create({
        data: {
          event: 'PURCHASES_FETCH_FAILED',
          level: 'ERROR',
          message: `User purchases endpoint error: ${message}`,
          payload: JSON.stringify({ error: message }),
        },
      })
      .catch(() => {
        // swallow
      });
    return NextResponse.json(
      { error: 'Could not load purchases' },
      { status: 500 },
    );
  }
}
