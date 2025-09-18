import { cookies } from 'next/headers'
import { query } from './db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables')
}

// -------------------------
// Types
// -------------------------
interface Member {
  id: string
  full_name: string
  email: string
  phone?: string
  created_at: string
}

interface Session {
  member_id: string
  token: string
  expires_at: Date
}

type MemberUpdate = {
  full_name?: string
  email?: string
  phone?: string
  password?: string
}

// -------------------------
// Get logged-in member
// -------------------------
export async function getLoggedInMember(): Promise<Member | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { member_id: string }

    const sessionResult = await query<Session>(
      'SELECT member_id, token, expires_at FROM member_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    )
    if (sessionResult.rows.length === 0) return null

    const memberResult = await query<Member>(
      'SELECT id, full_name, email, phone, created_at FROM members WHERE id = $1',
      [decoded.member_id]
    )

    return memberResult.rows[0] || null
  } catch (err) {
    console.error('[AUTH] Invalid or expired token:', err)
    return null
  }
}

// -------------------------
// Create member session
// -------------------------
export async function createMemberSession(memberId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const token = jwt.sign({ member_id: memberId }, JWT_SECRET, { expiresIn: '7d' })

  await query(
    'INSERT INTO member_sessions (member_id, token, expires_at) VALUES ($1, $2, $3)',
    [memberId, token, expiresAt.toISOString()]
  )

  const cookieStore = await cookies()
  cookieStore.set({
    name: 'session_token',
    value: token,
    httpOnly: true,
    path: '/',
    expires: expiresAt.getTime(), // as number
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return token
}

// -------------------------
// Update member info
// -------------------------
export async function updateMember(memberId: string, updates: MemberUpdate): Promise<Member | null> {
  const fields: string[] = []
  const values: (string | number | boolean | null)[] = []
  let idx = 1

  for (const key in updates) {
    let value = updates[key as keyof MemberUpdate]
    if (key === 'password' && value) value = await bcrypt.hash(value, 10)
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(value)
      idx++
    }
  }

  if (fields.length === 0) return null

  values.push(memberId)
  const sql = `UPDATE members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, full_name, email, phone, created_at`
  const result = await query<Member>(sql, values)
  return result.rows[0] || null
}

// -------------------------
// Logout member
// -------------------------
export async function logoutMember(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (token) {
    // Delete session from DB (revokes token)
    await query('DELETE FROM member_sessions WHERE token = $1', [token])

    // Correct usage for cookieStore.delete()
    cookieStore.delete({
      name: 'session_token',
      path: '/', // optional
    })
  }
}

