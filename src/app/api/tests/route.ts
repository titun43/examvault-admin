import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const type = searchParams.get("type");

    // Build the where clause. subjectId is optional when type is provided
    // (e.g. fetching all daily quizzes across subjects).
    const where: Record<string, unknown> = { isPublished: true };
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (type) {
      where.type = type;
    }

    // If neither subjectId nor type is provided, require subjectId to avoid
    // dumping the entire tests table accidentally.
    if (!subjectId && !type) {
      return NextResponse.json(
        { error: "subjectId or type query parameter is required" },
        { status: 400 }
      );
    }

    const tests = await db.test.findMany({
      where,
      include: {
        _count: {
          select: { questions: true, testAttempts: true },
        },
        subject: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("Tests fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
