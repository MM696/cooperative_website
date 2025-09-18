// app/api/set-password/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs"; // ✅ safer for Next.js
import jwt from "jsonwebtoken";

// ✅ Define types for rows
interface SignupTokenRow {
  token: string;
  name: string;
  email: string;
  phone?: string;
  expires_at: string;
  used: boolean;
}

interface MemberRow {
  id: string;
  full_name?: string; // if you use full_name column
  name?: string; // fallback if your table uses `name`
  email: string;
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Validate token
    const result = await query<SignupTokenRow>(
      "SELECT * FROM member_signup_tokens WHERE token = $1 LIMIT 1",
      [token]
    );

    const signup = result.rows[0];
    if (!signup) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (signup.used) {
      return NextResponse.json({ error: "Token already used" }, { status: 400 });
    }

    if (new Date(signup.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Insert member
    const insert = await query<MemberRow>(
      `INSERT INTO members (name, email, phone, password, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email`,
      [signup.name, signup.email, signup.phone?? null, hashedPassword]
    );

    const member = insert.rows[0];
    if (!member) {
      return NextResponse.json(
        { error: "Failed to create member" },
        { status: 500 }
      );
    }

    // 4️⃣ Mark token as used
    await query("UPDATE member_signup_tokens SET used = true WHERE token = $1", [
      token,
    ]);

    // 5️⃣ Generate JWT
    const jwtToken = jwt.sign(
      {
        id: member.id,
        email: member.email,
        name: member.full_name ?? member.name, // ✅ safely handle both column names
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 6️⃣ Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Password set successfully",
      member: {
        id: member.id,
        email: member.email,
        name: member.full_name ?? member.name,
      },
    });

    response.cookies.set({
      name: "member_token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[SET PASSWORD] ❌", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
