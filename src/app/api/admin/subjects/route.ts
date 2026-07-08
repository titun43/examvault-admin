import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Return all subjects with category info
export async function GET() {
  try {
    const subjects = await db.subject.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { tests: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Admin subjects fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, categoryId, icon, description, order } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: "name, slug, and categoryId are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug within category
    const existing = await db.subject.findUnique({
      where: {
        categoryId_slug: { categoryId, slug },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Subject with this slug already exists in this category" },
        { status: 409 }
      );
    }

    const subject = await db.subject.create({
      data: {
        name,
        slug,
        categoryId,
        icon: icon || null,
        description: description || null,
        order: order || 0,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error("Admin subject create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
