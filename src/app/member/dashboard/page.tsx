import { redirect } from 'next/navigation'
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

// Fetch member + contributions
async function getMemberData(email: string): Promise<MemberDashboardData | null> {
  console.log('Fetching member for email:', email)

  const memberResult = await query('SELECT * FROM members WHERE email = $1', [email])
  const member: Member | undefined = memberResult.rows[0]

  if (!member) {
    console.log('No member found for email:', email)
    return null
  }

  console.log('Member found:', member)

  const contributionsResult = await query(
    'SELECT * FROM contributions WHERE member_id = $1 ORDER BY date_paid DESC',
    [member.id]
  )
  const contributions: Contribution[] = contributionsResult.rows
  const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)

  console.log('Contributions:', contributions, 'Total:', totalContributions)

  return { member, contributions, totalContributions }
}

// Server Action
export async function updateMemberAction(
  memberId: string,
  updates: { full_name?: string; email?: string; phone?: string }
) {
  'use server'
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  for (const key in updates) {
    if ((updates as any)[key] !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push((updates as any)[key])
      idx++
    }
  }

  if (fields.length === 0) return null

  values.push(memberId)
  const sql = `UPDATE members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`
  const result = await query(sql, values)
  return result.rows[0] || null
}

// Server Component
export default async function MemberDashboard() {
  const email = process.env.MOCK_MEMBER_EMAIL

  if (!email) {
    console.error('MOCK_MEMBER_EMAIL not set in environment!')
    redirect('/auth/member')
  }

  const memberData = await getMemberData(email)
  console.log('MemberDashboardClient props:', memberData)

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
