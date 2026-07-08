import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all tests with subject+category
export async function GET() {
  try {
    const tests = await db.test.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { questions: true, testAttempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("Admin tests fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create test (link to subjectId, include type field)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subjectId,
      title,
      slug,
      type,
      duration,
      totalMarks,
      passingMarks,
      isPublished,
      difficulty,
      negativeMarking,
      negativeMarks,
      instructions,
      year,
      examSession,
    } = body;

    if (!subjectId || !title || !slug || !duration || !totalMarks) {
      return NextResponse.json(
        { error: "subjectId, title, slug, duration, and totalMarks are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.test.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Test with this slug already exists" },
        { status: 409 }
      );
    }

    const test = await db.test.create({
      data: {
        subjectId,
        title,
        slug,
        type: type || "free",
        duration,
        totalMarks,
        passingMarks: passingMarks || null,
        isPublished: isPublished !== undefined ? isPublished : false,
        difficulty: difficulty || "medium",
        negativeMarking: negativeMarking || false,
        negativeMarks: negativeMarks || 0,
        instructions: instructions || null,
        year: year || null,
        examSession: examSession || null,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch (error) {
    console.error("Admin test create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
