import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const where = categoryId ? { categoryId } : {};

    const subjects = await db.subject.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: {
          select: { tests: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Subjects fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
