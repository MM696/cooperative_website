import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // 1️⃣ Find token
    const result = await query(
      'SELECT * FROM member_signup_tokens WHERE token = $1 LIMIT 1',
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const signup = result.rows[0]

    // 2️⃣ Check if token is already used
    if (signup.used) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }

    // 3️⃣ Check expiration
    if (new Date(signup.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    // 4️⃣ Insert new member
    const insert = await query(
      'INSERT INTO members (name, email, phone, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email',
      [signup.name, signup.email, signup.phone]
    )
    const member = insert.rows[0]

    // 5️⃣ Mark token as used
    await query('UPDATE member_signup_tokens SET used = true, updated_at = NOW() WHERE token = $1', [token])

    // 6️⃣ Generate JWT
    const jwtToken = jwt.sign(
      { id: member.id, email: member.email, name: member.name },
      process.env.JWT_SECRET!, // Ensure JWT_SECRET is set
      { expiresIn: '7d' }
    )

    // 7️⃣ Set cookie
    const response = NextResponse.json({ member, message: 'Verification successful' })
    response.cookies.set({
      name: 'member_token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('[VERIFY] ❌ Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
