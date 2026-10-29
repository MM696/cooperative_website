import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

// ✅ Define the shape of an admin row
interface AdminRow {
  id: string;
  email: string;
  password: string; // This should match the column name in your database
}

export async function POST(request: NextRequest) {
  try {
    const body: { email?: string; password?: string } = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // ✅ Strongly type the query result
    const result = await query<AdminRow>(
      "SELECT id, email, password FROM cooperative.admins WHERE email = $1 LIMIT 1",
      [email]
    );

    const admin = result.rows[0];
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // ✅ Type-safe password comparison
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // ✅ Safe response with only required fields
    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error("[ADMIN LOGIN] ❌", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
