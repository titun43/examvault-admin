import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Admin categories fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, icon, description, image, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        description: description || null,
        image: image || null,
        order: order || 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Admin category create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
