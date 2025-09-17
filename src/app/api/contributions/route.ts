import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateContributionEmail } from "@/lib/email";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, amount, date_paid, recorded_by, notes, admin_email } = body;

    // Verify admin
    const adminResult = await query(
      "SELECT * FROM admins WHERE email = $1",
      [admin_email]
    );
    const adminData = adminResult.rows[0];

    if (!adminData) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Insert contribution
    const insertResult = await query(
      `INSERT INTO contributions (member_id, amount, date_paid, recorded_by, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [member_id, amount, date_paid, recorded_by, notes]
    );

    const contribution = insertResult.rows[0];

    // Get member information
    const memberResult = await query(
      "SELECT * FROM members WHERE id = $1",
      [member_id]
    );
    const member = memberResult.rows[0];

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Get total contributions for the member
    // Get total contributions for the member
const contributionsResult = await query(
  "SELECT amount FROM contributions WHERE member_id = $1",
  [member_id]
);

const totalContributions = contributionsResult.rows.reduce(
  (sum: number, row: { amount: number | string }) => sum + parseFloat(row.amount as string),
  0
);


    // Send email notification
    const emailData = generateContributionEmail(
      member.full_name,
      amount,
      date_paid,
      totalContributions
    );

    const emailResult = await sendEmail({
      to: member.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (!emailResult.success) {
      console.error("Failed to send email notification:", emailResult.error);
    }

    return NextResponse.json({
      success: true,
      contribution,
      member: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
      },
    });
  } catch (error) {
    console.error("Error in contributions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
