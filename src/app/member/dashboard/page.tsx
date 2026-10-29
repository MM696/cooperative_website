import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import MemberDashboardClient from '../../member/dashboard/MemberDashboardClient'
import { query } from '@/lib/db'

// Types
interface Member {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

interface Contribution {
  id: string
  member_id: string
  amount: number
  date_paid: string
  recorded_by: string
  notes?: string
  created_at: string
}

interface MemberDashboardData {
  member: Member
  contributions: Contribution[]
  totalContributions: number
}

async function getLoggedInMemberId(): Promise<string | null> {
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

async function getMemberData(memberId: string): Promise<MemberDashboardData | null> {
  const memberResult = await query<Member>(
    'SELECT id, name, email, phone, created_at FROM cooperative.members WHERE id = $1',
    [memberId]
  )
  const member = memberResult.rows[0]

  if (!member) return null

  const contributionsResult = await query<Contribution>(
    'SELECT id, member_id, amount, date_paid, recorded_by, notes, created_at FROM cooperative.contributions WHERE member_id = $1 ORDER BY date_paid DESC',
    [member.id]
  )
  const contributions = contributionsResult.rows
  const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)

  return {
    member: { ...member, phone: member.phone ?? '' },
    contributions,
    totalContributions,
  }
}

// Server Action
export async function updateMemberAction(
  memberId: string,
  updates: { name?: string; email?: string; phone?: string }
) {
  'use server'
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

// Server Component
export default async function MemberDashboard() {
  const memberId = await getLoggedInMemberId()

  if (!memberId) {
    redirect('/auth/member')
  }

  const memberData = await getMemberData(memberId)

  if (!memberData) {
    redirect('/auth/member?error=not_found')
  }

  return (
    <MemberDashboardClient
      member={memberData.member}
      contributions={memberData.contributions}
      totalContributions={memberData.totalContributions}
      updateMemberAction={updateMemberAction}
    />
  )
}
