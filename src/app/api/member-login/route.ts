// app/api/member-login/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs"; // ✅ safer for ESM + Next.js
import jwt from "jsonwebtoken";

// ✅ Strongly type the DB result
interface MemberRow {
  id: string;
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  created_at?: string;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ✅ Use generic type for query
    const result = await query<MemberRow>(
      "SELECT * FROM members WHERE email = $1 LIMIT 1",
      [email]
    );

    const member = result.rows[0];

    if (!member) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ TypeScript now knows member.password is a string
    const validPassword = await bcrypt.compare(password, member.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ Include correct name field (full_name, not name)
    const jwtToken = jwt.sign(
      { id: member.id, email: member.email, name: member.full_name },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      member: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
      },
    });

    // ✅ Set cookie securely
    response.cookies.set({
      name: "member_token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("❌ Error in member-login API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
