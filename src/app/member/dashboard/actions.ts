'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export async function getLoggedInMemberId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('member_token')?.value
  if (!token || !process.env.JWT_SECRET) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (typeof decoded === 'string' || typeof decoded.id !== 'string') return null
    return decoded.id
  } catch {
    return null
  }
}

export async function updateMemberAction(
  memberId: string,
  updates: { name?: string; email?: string; phone?: string }
) {
  const sessionMemberId = await getLoggedInMemberId()
  if (!sessionMemberId || sessionMemberId !== memberId) return null

  const fields: string[] = []
  const values: string[] = []
  let idx = 1

  for (const key of ['name', 'email', 'phone'] as const) {
    const value = updates[key]
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(value)
      idx++
    }
  }

  if (fields.length === 0) return null

  values.push(sessionMemberId)
  const sql = `UPDATE cooperative.members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, phone, created_at`
  const result = await query<Member>(sql, values)
  const member = result.rows[0]
  return member ? { ...member, phone: member.phone ?? '' } : null
}
