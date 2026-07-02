// =============================================================================
// PUT    /api/admin/products/[id]
// DELETE /api/admin/products/[id]
// =============================================================================
// Update or delete a product. All fields optional on PUT.
//
// PUT body (any subset):
//   name, description, refId, price (rupees), isActive, subjectIds
//
// If name changes, slug is regenerated (with random suffix for uniqueness).
//
// DELETE: soft-check — if any purchases reference the product, return 400 with
// "Cannot delete product with existing purchases; deactivate instead."
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { slugify, getClientMeta } from '../../_lib';
import { rupeesToPaise } from '@/lib/razorpay-server';

interface UpdateBody {
  name?: string;
  description?: string;
  refId?: string;
  price?: number; // rupees
  isActive?: boolean;
  subjectIds?: string[];
}

// ---- PUT ----
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;
  const clientMeta = getClientMeta(req);

  try {
    const { id } = await params;

    let body: UpdateBody;
    try {
      body = (await req.json()) as UpdateBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    // ---- Build update payload ----
    const data: {
      name?: string;
      description?: string | null;
      refId?: string;
      price?: number;
      isActive?: boolean;
      subjectIds?: string;
      slug?: string;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2) {
        return NextResponse.json(
          { error: 'name must be at least 2 chars' },
          { status: 400 },
        );
      }
      data.name = body.name.trim();
      // regenerate slug if name changed
      if (data.name !== existing.name) {
        const baseSlug = slugify(data.name);
        let slug = baseSlug;
        for (let attempt = 0; attempt < 5; attempt++) {
          // ensure no collision with another product (including the current one's slug is fine)
          const clash = await db.product.findFirst({
            where: { slug, id: { not: existing.id } },
          });
          if (!clash) break;
          slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
        }
        data.slug = slug;
      }
    }

    if (body.description !== undefined) {
      data.description =
        typeof body.description === 'string' && body.description.trim().length > 0
          ? body.description.trim()
          : null;
    }

    if (body.refId !== undefined) {
      if (typeof body.refId !== 'string' || body.refId.trim().length === 0) {
        return NextResponse.json(
          { error: 'refId must be a non-empty string' },
          { status: 400 },
        );
      }
      data.refId = body.refId.trim();
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json(
          { error: 'price must be a positive number (rupees)' },
          { status: 400 },
        );
      }
      data.price = rupeesToPaise(body.price);
    }

    if (body.isActive !== undefined) {
      data.isActive = !!body.isActive;
    }

    if (body.subjectIds !== undefined) {
      if (!Array.isArray(body.subjectIds)) {
        return NextResponse.json(
          { error: 'subjectIds must be an array of strings' },
          { status: 400 },
        );
      }
      data.subjectIds = JSON.stringify(
        body.subjectIds.filter((s) => typeof s === 'string'),
      );
    }

    const updated = await db.product.update({
      where: { id },
      data,
    });

    await db.paymentLog.create({
      data: {
        event: 'PRODUCT_UPDATED',
        level: 'AUDIT',
        message: `Product updated: ${updated.name} (id=${updated.id})`,
        payload: JSON.stringify({
          productId: updated.id,
          changedFields: Object.keys(data),
        }),
        ...clientMeta,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/products/[id] PUT] error:', message);
    return NextResponse.json(
      { error: `Failed to update product: ${message}` },
      { status: 500 },
    );
  }
}

// ---- DELETE ----
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;
  const clientMeta = getClientMeta(req);

  try {
    const { id } = await params;

    const existing = await db.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subjectPackPurchases: true,
            examPackPurchases: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    const purchaseCount =
      existing._count.subjectPackPurchases + existing._count.examPackPurchases;

    if (purchaseCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete product with existing purchases; deactivate instead.',
          purchaseCount,
        },
        { status: 400 },
      );
    }

    await db.product.delete({ where: { id } });

    await db.paymentLog.create({
      data: {
        event: 'PRODUCT_DELETED',
        level: 'AUDIT',
        message: `Product deleted: ${existing.name} (id=${existing.id})`,
        payload: JSON.stringify({
          productId: existing.id,
          name: existing.name,
          type: existing.type,
          refId: existing.refId,
        }),
        ...clientMeta,
      },
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/products/[id] DELETE] error:', message);
    return NextResponse.json(
      { error: `Failed to delete product: ${message}` },
      { status: 500 },
    );
  }
}
