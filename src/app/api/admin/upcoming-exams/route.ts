import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all upcoming exams
export async function GET() {
  try {
    const upcomingExams = await db.upcomingExam.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { examDate: "asc" },
    });

    return NextResponse.json({ upcomingExams });
  } catch (error) {
    console.error("Admin upcoming exams fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create upcoming exam
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
      name,
      examDate,
      lastApplyDate,
      description,
      image,
      notificationLink,
      tags,
      isActive,
    } = body;

    if (!categoryId || !name || !examDate) {
      return NextResponse.json(
        { error: "categoryId, name, and examDate are required" },
        { status: 400 }
      );
    }

    const upcomingExam = await db.upcomingExam.create({
      data: {
        categoryId,
        name,
        examDate: new Date(examDate),
        lastApplyDate: lastApplyDate ? new Date(lastApplyDate) : null,
        description: description || null,
        image: image || null,
        notificationLink: notificationLink || null,
        tags: tags || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ upcomingExam }, { status: 201 });
  } catch (error) {
    console.error("Admin upcoming exam create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
