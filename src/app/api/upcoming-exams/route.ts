import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const upcomingExams = await db.upcomingExam.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
      orderBy: { examDate: "asc" },
    });

    return NextResponse.json({ upcomingExams });
  } catch (error) {
    console.error("Upcoming exams fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
