import { redirect } from 'next/navigation'
import MemberDashboardClient from '../../member/dashboard/MemberDashboardClient'
import { query } from '@/lib/db'
import { getLoggedInMemberId, updateMemberAction } from './actions'

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
