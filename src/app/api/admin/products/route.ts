// =============================================================================
// GET  /api/admin/products?type=SUBJECT_PACK|EXAM_PACK
// POST /api/admin/products
// =============================================================================
// List + create products (Subject Packs + Exam Packs).
//
// GET query:
//   type   — filter by ProductType (optional)
//   active — "true" / "false" — filter by isActive (optional)
//
// POST body:
//   type        : 'SUBJECT_PACK' | 'EXAM_PACK'  (required)
//   name        : string                         (required)
//   description : string                         (optional)
//   refId       : string                         (required)
//   price       : number (rupees)                (required)
//   isActive    : boolean                        (default true)
//   subjectIds? : string[]                       (for EXAM_PACK)
//
// Slug is auto-generated from name (lowercase, hyphenated, + short random
// suffix for uniqueness). Price is converted rupees -> paise.
// subjectIds is stringified to JSON before storage.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { Prisma } from '@prisma/client';
import { slugify, getClientMeta } from '../_lib';
import { rupeesToPaise } from '@/lib/razorpay-server';

// ---- GET (list) ----
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const sp = req.nextUrl.searchParams;
    const type = sp.get('type')?.trim() || '';
    const active = sp.get('active')?.trim() || '';

    const where: Prisma.ProductWhereInput = {};
    if (type === 'SUBJECT_PACK' || type === 'EXAM_PACK') {
      where.type = type;
    }
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            subjectPackPurchases: true,
            examPackPurchases: true,
          },
        },
      },
    });

    // Map _count into a flat `purchases` number for UI convenience.
    const result = products.map((p) => {
      const purchases =
        p.type === 'SUBJECT_PACK'
          ? p._count.subjectPackPurchases
          : p._count.examPackPurchases;
      // strip the _count helper from the response
      // (destructure)
      const { _count, ...rest } = p;
      void _count; // suppress unused
      return { ...rest, purchases };
    });

    return NextResponse.json({ products: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/products GET] error:', message);
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 },
    );
  }
}

// ---- POST (create) ----
interface CreateBody {
  type: 'SUBJECT_PACK' | 'EXAM_PACK';
  name: string;
  description?: string;
  refId: string;
  price: number; // rupees
  isActive?: boolean;
  subjectIds?: string[];
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;
  const clientMeta = getClientMeta(req);

  try {
    let body: CreateBody;
    try {
      body = (await req.json()) as CreateBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { type, name, description, refId, price, isActive, subjectIds } = body;

    // ---- Validate ----
    if (type !== 'SUBJECT_PACK' && type !== 'EXAM_PACK') {
      return NextResponse.json(
        { error: "type must be 'SUBJECT_PACK' or 'EXAM_PACK'" },
        { status: 400 },
      );
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'name is required (min 2 chars)' },
        { status: 400 },
      );
    }
    if (!refId || typeof refId !== 'string' || refId.trim().length === 0) {
      return NextResponse.json(
        { error: 'refId is required (Firestore subject/category id)' },
        { status: 400 },
      );
    }
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'price must be a positive number (rupees)' },
        { status: 400 },
      );
    }

    // ---- Build slug (unique) ----
    const baseSlug = slugify(name);
    // ensure uniqueness — retry with a longer suffix if collision
    let slug = baseSlug;
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await db.product.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    }

    // ---- Create ----
    const product = await db.product.create({
      data: {
        type,
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        refId: refId.trim(),
        price: rupeesToPaise(price),
        currency: 'INR',
        isActive: isActive !== false,
        subjectIds: JSON.stringify(subjectIds ?? []),
      },
    });

    // ---- Audit log ----
    await db.paymentLog.create({
      data: {
        event: 'PRODUCT_CREATED',
        level: 'AUDIT',
        message: `Product created: ${product.name} (${product.type}, id=${product.id})`,
        payload: JSON.stringify({
          productId: product.id,
          type: product.type,
          name: product.name,
          slug: product.slug,
          refId: product.refId,
          pricePaise: product.price,
        }),
        ...clientMeta,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/products POST] error:', message);
    return NextResponse.json(
      { error: `Failed to create product: ${message}` },
      { status: 500 },
    );
  }
}
