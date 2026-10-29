import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

interface SignupTokenRow {
  token: string
  name: string
  email: string
  phone?: string
  password: string
  expires_at: string
  used: boolean
}

interface MemberRow {
  id: string
  name?: string
  full_name?: string
  email: string
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const result = await query<SignupTokenRow>(
      'SELECT * FROM cooperative.member_signup_tokens WHERE token = $1 LIMIT 1',
      [token]
    )

    const signup = result.rows[0]
    if (!signup) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (signup.used) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }

    if (new Date(signup.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    if (!signup.password) {
      return NextResponse.json(
        { error: 'No password on file. Please sign up again.' },
        { status: 400 }
      )
    }

    const insert = await query<MemberRow>(
      `INSERT INTO cooperative.members (name, email, phone, password, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email`,
      [signup.name, signup.email, signup.phone ?? null, signup.password]
    )

    const member = insert.rows[0]
    if (!member) {
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    await query('UPDATE cooperative.member_signup_tokens SET used = true WHERE token = $1', [
      token,
    ])

    const jwtToken = jwt.sign(
      {
        id: member.id,
        email: member.email,
        name: member.full_name ?? member.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      success: true,
      message: 'Account verified successfully',
      member: {
        id: member.id,
        email: member.email,
        name: member.full_name ?? member.name,
      },
    })

    response.cookies.set({
      name: 'member_token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      const constraint = (err as { constraint?: string }).constraint
      return NextResponse.json(
        {
          error:
            constraint === 'members_phone_key'
              ? 'This phone number is already registered to another member. Please sign up again with a different number.'
              : 'An account with this email already exists. Please log in.',
        },
        { status: 409 }
      )
    }
    console.error('[VERIFY SIGNUP] ❌', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
