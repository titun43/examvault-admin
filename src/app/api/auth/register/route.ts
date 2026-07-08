import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, phone } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Either email or mobile number is required" },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const normalizedPhone = phone ? phone.trim() : null;

    // Validate phone format (10 digits for India)
    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Mobile number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Check for existing email
    if (normalizedEmail) {
      const existingEmail = await db.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
    }

    // Check for existing phone
    if (normalizedPhone) {
      const existingPhone = await db.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Mobile number already registered" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with student role and leaderboard entry in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name,
          password: hashedPassword,
          phone: normalizedPhone,
          role: "student",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      });

      // Create leaderboard entry for new user
      await tx.leaderboard.create({
        data: {
          userId: user.id,
          dailyScore: 0,
          weeklyScore: 0,
          monthlyScore: 0,
          totalScore: 0,
        },
      });

      return user;
    });

    return NextResponse.json(
      { message: "User registered successfully", user: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
