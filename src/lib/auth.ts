import { cookies } from 'next/headers'
import { query } from './db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables')
}

// 🔑 Get logged-in member (server-side)
export async function getLoggedInMember() {
  const cookieStore = cookies() as any
  const token = cookieStore.get('session_token')?.value
  if (!token) return null

  try {
    // 1️⃣ Decode & verify JWT first
    const decoded = jwt.verify(token, JWT_SECRET) as { member_id: string }

    // 2️⃣ Optional: confirm session still valid in DB
    const sessionResult = await query(
      'SELECT member_id FROM member_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    )
    if (sessionResult.rows.length === 0) return null

    // 3️⃣ Fetch member record
    const memberResult = await query(
      'SELECT id, full_name, email, phone, created_at FROM members WHERE id = $1',
      [decoded.member_id]
    )

    return memberResult.rows[0] || null
  } catch (err) {
    console.error('[AUTH] Invalid or expired token:', err)
    return null
  }
}

// 🔑 Create new member session with JWT
export async function createMemberSession(memberId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // 1️⃣ Sign JWT with member_id
  const token = jwt.sign({ member_id: memberId }, JWT_SECRET, { expiresIn: '7d' })

  // 2️⃣ Store session in DB (so we can revoke if needed)
  await query(
    'INSERT INTO member_sessions (member_id, token, expires_at) VALUES ($1, $2, $3)',
    [memberId, token, expiresAt]
  )

  // 3️⃣ Set cookie with JWT
  const cookieStore = cookies() as any
  cookieStore.set({
    name: 'session_token',
    value: token,
    httpOnly: true,
    path: '/',
    expires: expiresAt,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return token
}

// 🔧 Update member information (hash password if updated)
export async function updateMember(
  memberId: string,
  updates: { full_name?: string; email?: string; phone?: string; password?: string }
) {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  for (const key in updates) {
    let value = (updates as any)[key]
    if (key === 'password' && value) {
      value = await bcrypt.hash(value, 10)
    }
    fields.push(`${key} = $${idx}`)
    values.push(value)
    idx++
  }

  if (fields.length === 0) return null

  values.push(memberId)
  const sql = `UPDATE members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`
  const result = await query(sql, values)
  return result.rows[0] || null
}

// 🚪 Log out member (invalidate session)
export async function logoutMember() {
  const cookieStore = cookies() as any
  const token = cookieStore.get('session_token')?.value
  if (token) {
    // Delete session from DB (revokes token)
    await query('DELETE FROM member_sessions WHERE token = $1', [token])
    cookieStore.delete('session_token', { path: '/' })
  }
}
