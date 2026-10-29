import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate token & expiry
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    try {
      // Check for existing pending signup
      const existing = await query(
        'SELECT id FROM cooperative.member_signup_tokens WHERE email = $1',
        [email]
      )

      if (existing.rows.length > 0) {
        await query(
          `UPDATE cooperative.member_signup_tokens
           SET name = $1, phone = $2, password = $3, token = $4, expires_at = $5, updated_at = NOW()
           WHERE email = $6`,
          [name, phone, hashedPassword, token, expiresAt, email]
        )
        console.log(`[SIGNUP] Updated pending signup for ${email}`)
      } else {
        await query(
          `INSERT INTO cooperative.member_signup_tokens (name, email, phone, password, token, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [name, email, phone, hashedPassword, token, expiresAt]
        )
        console.log(`[SIGNUP] Created new signup token for ${email}`)
      }
    } catch (dbErr) {
      console.error('[SIGNUP] ❌ Database error:', dbErr)
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again later.' },
        { status: 500 }
      )
    }

    // Generate magic link — verify email, password already set at signup
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-signup?token=${token}`
    console.log(`[SIGNUP] Magic link generated: ${magicLink}`)

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
        subject: 'Verify Your Signup',
        html: `
          <h2>Hello ${name},</h2>
          <p>Thanks for signing up! Click the button below to verify your account:</p>
          <p>
            <a href="${magicLink}"
              style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
              Verify Signup
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
        `,
      })

      console.log(`[SIGNUP] ✅ Email sent successfully to ${email}`)
    } catch (mailErr) {
      console.error('[SIGNUP] ❌ Failed to send email:', mailErr)
      // Still return success but warn frontend
      return NextResponse.json(
        {
          message: 'Signup created, but email could not be sent. Please contact support.',
          token,
        },
        { status: 202 }
      )
    }

    return NextResponse.json({
      message: 'Verification link created and email sent successfully',
      token,
    })
  } catch (err) {
    console.error('[SIGNUP] ❌ Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
