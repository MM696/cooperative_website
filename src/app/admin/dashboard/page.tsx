import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import { getLoggedInMember } from '@/lib/auth'

async function getAdminData(email: string) {
  try {
    // Fetch admin data
    const resAdmin = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admins?email=${email}`)
    const adminData = await resAdmin.json()
    if (!resAdmin.ok || !adminData) return null

    // Fetch members
    const resMembers = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/members`)
    const members = resMembers.ok ? await resMembers.json() : []

    // Fetch contributions with member info
    const resContributions = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contributions`)
    const contributions = resContributions.ok ? await resContributions.json() : []

    // Calculate total contributions
    const totalContributions = contributions.reduce((sum: number, c: any) => sum + c.amount, 0)

    return {
      admin: adminData,
      members,
      contributions,
      totalContributions,
      errors: {
        members: resMembers.ok ? null : 'Failed to fetch members',
        contributions: resContributions.ok ? null : 'Failed to fetch contributions',
        total: null
      }
    }
  } catch (err) {
    return null
  }
}

export default async function AdminDashboard() {
  const supabase = await getLoggedInMember()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/admin')
  }

  const adminData = await getAdminData(user.email!)

  if (!adminData) {
    redirect('/auth/admin?error=not_found')
  }

  return <AdminDashboardClient {...adminData} />
}
