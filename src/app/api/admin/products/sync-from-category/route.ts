// =============================================================================
// POST /api/admin/products/sync-from-category
// =============================================================================
// Auto-sync an EXAM_PACK Product row whenever an admin toggles the "Premium
// Category" flag (or changes premiumPrice) on a Firestore category.
//
// PROBLEM this fixes:
//   Setting `categories.isPremium = true` in the admin UI used to ONLY write
//   to Firestore. The payment flow, however, requires a Prisma `Product` row
//   of type EXAM_PACK (with refId = categoryId) for the price to be resolved
//   server-side. If the admin forgot to manually create that Product on the
//   Products page, every "Unlock this exam" attempt from the Flutter app
//   failed with: "This exam pack is not available for purchase."
//
// FIX:
//   After the Firestore write succeeds in categories.tsx, the client calls
//   this endpoint. It idempotently upserts the EXAM_PACK Product:
//     - isPremium = true  -> create or activate + set price = premiumPrice
//     - isPremium = false -> deactivate (preserve purchase history; never delete)
//
// This keeps `categories.premiumPrice` (Firestore, rupees) and
// `Product.price` (Prisma, paise) in sync — solving the two-sources-of-truth
// drift problem for exam packs.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { slugify, getClientMeta } from '../../_lib';
import { rupeesToPaise } from '@/lib/razorpay-server';

interface SyncBody {
  categoryId: string;
  categoryName: string;
  isPremium: boolean;
  premiumPrice?: number; // rupees
  premiumDurationMonths?: number;
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;
  const clientMeta = getClientMeta(req);

  try {
    let body: SyncBody;
    try {
      body = (await req.json()) as SyncBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { categoryId, categoryName, isPremium, premiumPrice } = body;

    // ---- Validate ----
    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json(
        { error: 'categoryId is required' },
        { status: 400 },
      );
    }
    if (!categoryName || typeof categoryName !== 'string') {
      return NextResponse.json(
        { error: 'categoryName is required' },
        { status: 400 },
      );
    }
    if (isPremium && (typeof premiumPrice !== 'number' || premiumPrice <= 0)) {
      return NextResponse.json(
        { error: 'premiumPrice must be a positive number (rupees) when isPremium is true' },
        { status: 400 },
      );
    }

    // ---- Find existing EXAM_PACK Product for this category ----
    const existing = await db.product.findFirst({
      where: { type: 'EXAM_PACK', refId: categoryId },
    });

    // ---- Case 1: Premium turned OFF -> deactivate (if exists) ----
    if (!isPremium) {
      if (!existing) {
        // No product to deactivate — nothing to do.
        return NextResponse.json({
          action: 'noop',
          product: null,
          message: 'Category is not premium and no EXAM_PACK product exists.',
        });
      }
      if (existing.isActive) {
        await db.product.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
        await db.paymentLog.create({
          data: {
            event: 'PRODUCT_DEACTIVATED',
            level: 'AUDIT',
            message: `EXAM_PACK auto-deactivated (category no longer premium): ${existing.name} (id=${existing.id})`,
            payload: JSON.stringify({
              productId: existing.id,
              refId: categoryId,
              categoryName,
            }),
            ...clientMeta,
          },
        });
        return NextResponse.json({
          action: 'deactivated',
          productId: existing.id,
          message: 'EXAM_PACK product deactivated (category no longer premium).',
        });
      }
      // Already inactive — noop.
      return NextResponse.json({
        action: 'noop',
        productId: existing.id,
        message: 'EXAM_PACK product already inactive.',
      });
    }

    // ---- Case 2: Premium turned ON -> create or update ----
    const pricePaise = rupeesToPaise(premiumPrice as number);
    const trimmedName = categoryName.trim();

    if (existing) {
      // Update existing product: sync name + price + reactivate.
      const updated = await db.product.update({
        where: { id: existing.id },
        data: {
          name: trimmedName,
          price: pricePaise,
          isActive: true,
        },
      });
      await db.paymentLog.create({
        data: {
          event: 'PRODUCT_UPDATED',
          level: 'AUDIT',
          message: `EXAM_PACK auto-synced from category: ${updated.name} (id=${updated.id})`,
          payload: JSON.stringify({
            productId: updated.id,
            refId: categoryId,
            categoryName: trimmedName,
            pricePaise,
            source: 'category_sync',
          }),
          ...clientMeta,
        },
      });
      return NextResponse.json({
        action: 'updated',
        product: updated,
        message: 'EXAM_PACK product synced with category premium settings.',
      });
    }

    // Create new EXAM_PACK product.
    // Generate a unique slug.
    const baseSlug = slugify(trimmedName);
    let slug = baseSlug;
    for (let attempt = 0; attempt < 5; attempt++) {
      const collision = await db.product.findUnique({ where: { slug } });
      if (!collision) break;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const created = await db.product.create({
      data: {
        type: 'EXAM_PACK',
        name: trimmedName,
        slug,
        description: `Auto-created from premium category: ${trimmedName}`,
        refId: categoryId,
        price: pricePaise,
        currency: 'INR',
        isActive: true,
        subjectIds: JSON.stringify([]), // empty — access check uses categoryId only
      },
    });

    await db.paymentLog.create({
      data: {
        event: 'PRODUCT_CREATED',
        level: 'AUDIT',
        message: `EXAM_PACK auto-created from premium category: ${created.name} (id=${created.id})`,
        payload: JSON.stringify({
          productId: created.id,
          type: 'EXAM_PACK',
          name: created.name,
          slug: created.slug,
          refId: categoryId,
          pricePaise,
          source: 'category_sync',
        }),
        ...clientMeta,
      },
    });

    return NextResponse.json(
      {
        action: 'created',
        product: created,
        message: 'EXAM_PACK product auto-created for premium category.',
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/products/sync-from-category POST] error:', message);
    return NextResponse.json(
      { error: `Failed to sync product: ${message}` },
      { status: 500 },
    );
  }
}
