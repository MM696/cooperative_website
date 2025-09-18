import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import { getLoggedInMember } from '@/lib/auth'

// Types
interface Admin {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

interface Member {
  id: string
  full_name: string
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

interface AdminDashboardData {
  admin: Admin
  members: Member[]
  contributions: Contribution[]
  totalContributions: number
  errors: {
    members: string | null
    contributions: string | null
    total: string | null
  }
}

// Fetch admin + members + contributions
async function getAdminData(email: string): Promise<AdminDashboardData | null> {
  try {
    // Fetch admin data
    const resAdmin = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admins?email=${email}`)
    if (!resAdmin.ok) return null
    const adminData: Admin = await resAdmin.json()

    // Fetch members
    const resMembers = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/members`)
    const members: Member[] = resMembers.ok ? await resMembers.json() : []

    // Fetch contributions
    const resContributions = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contributions`)
    const contributions: Contribution[] = resContributions.ok ? await resContributions.json() : []

    // Calculate total contributions
    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      admin: adminData,
      members,
      contributions,
      totalContributions,
      errors: {
        members: resMembers.ok ? null : 'Failed to fetch members',
        contributions: resContributions.ok ? null : 'Failed to fetch contributions',
        total: null,
      },
    }
  } catch (err) {
    console.error('[AdminDashboard] Error fetching data:', err)
    return null
  }
}

// Server Component
export default async function AdminDashboard() {
  const admin = await getLoggedInMember()

  if (!admin) {
    redirect('/auth/admin')
  }

  const adminData = await getAdminData(admin.email)

  if (!adminData) {
    redirect('/auth/admin?error=not_found')
  }

  return <AdminDashboardClient {...adminData} />
}
