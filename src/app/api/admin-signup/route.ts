import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { query } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json()

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Generate token & expiry
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    try {
      // Check for existing pending admin signup
      const existing = await query(
        'SELECT id FROM cooperative.admin_signup_tokens WHERE email = $1',
        [email]
      )

      if (existing.rows.length > 0) {
        await query(
          `UPDATE cooperative.admin_signup_tokens
           SET name = $1, phone = $2, token = $3, expires_at = $4, updated_at = NOW()
           WHERE email = $5`,
          [name, phone, token, expiresAt, email]
        )
        console.log(`[ADMIN SIGNUP] Updated pending admin signup for ${email}`)
      } else {
        await query(
          `INSERT INTO cooperative.admin_signup_tokens (name, email, phone, token, expires_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [name, email, phone, token, expiresAt]
        )
        console.log(`[ADMIN SIGNUP] Created new admin signup token for ${email}`)
      }
    } catch (dbErr) {
      console.error('[ADMIN SIGNUP] ❌ Database error:', dbErr)
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again later.' },
        { status: 500 }
      )
    }

    // Generate magic link
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${token}`
    console.log(`[ADMIN SIGNUP] Magic link generated: ${magicLink}`)

    // --- ✅ SEND EMAIL VIA SMTP (Nodemailer) ---
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465, // true if port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Admin Access Request - Verification Required',
        html: `
          <h2>Hello ${name},</h2>
          <p>You have requested admin access to the cooperative system. Click the button below to verify your admin account:</p>
          <p>
            <a href="${magicLink}"
              style="display:inline-block;padding:10px 20px;background:#374151;color:#fff;text-decoration:none;border-radius:8px;">
              Verify Admin Access
            </a>
          </p>
          <p>This link will expire in 15 minutes.</p>
          <p><strong>Note:</strong> Admin access requires approval from the system administrator.</p>
        `,
      })

      console.log(`[ADMIN SIGNUP] ✅ Email sent successfully to ${email}`)
    } catch (mailErr) {
      console.error('[ADMIN SIGNUP] ❌ Failed to send email:', mailErr)
      // Still return success but warn frontend
      return NextResponse.json(
        {
          message: 'Admin signup created, but email could not be sent. Please contact support.',
          token,
        },
        { status: 202 }
      )
    }

    return NextResponse.json({
      message: 'Admin verification link created and email sent successfully',
      token,
    })
  } catch (err) {
    console.error('[ADMIN SIGNUP] ❌ Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
