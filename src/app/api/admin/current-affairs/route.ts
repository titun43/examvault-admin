import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Return all current affairs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [currentAffairs, total] = await Promise.all([
      db.currentAffair.findMany({
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
        include: {
          categoryRef: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      db.currentAffair.count(),
    ]);

    return NextResponse.json({
      currentAffairs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Admin current affairs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create current affair
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      title,
      content,
      summary,
      pdfUrl,
      category,
      categoryId,
      isImportant,
      tags,
    } = body;

    if (!date || !title || !content) {
      return NextResponse.json(
        { error: "date, title, and content are required" },
        { status: 400 }
      );
    }

    const currentAffair = await db.currentAffair.create({
      data: {
        date: new Date(date),
        title,
        content,
        summary: summary || null,
        pdfUrl: pdfUrl || null,
        category: category || null,
        categoryId: categoryId || null,
        isImportant: isImportant || false,
        tags: tags || null,
      },
      include: {
        categoryRef: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ currentAffair }, { status: 201 });
  } catch (error) {
    console.error("Admin current affair create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
