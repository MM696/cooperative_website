import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import { query } from '@/lib/db'

// ✅ Types
interface Admin {
  id: string
  email: string
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

async function getAdminData(email: string): Promise<AdminDashboardData | null> {
  try {
    // ✅ Get admin info from DB, ensuring role is never null
    const adminResult = await query<Admin>(
      `SELECT id, email, created_at
       FROM admins WHERE email = $1 LIMIT 1`,
      [email]
    )
    const admin = adminResult.rows[0]
    if (!admin) return null

    // ✅ Get members
    const membersResult = await query<Member>(
      `SELECT id, name, email, phone, created_at FROM members ORDER BY created_at DESC`
    )
    const members = membersResult.rows

    // ✅ Get contributions
    const contributionsResult = await query<Contribution>(
      `SELECT id, member_id, amount, date_paid, recorded_by, notes, created_at 
       FROM contributions ORDER BY created_at DESC`
    )
    const contributions = contributionsResult.rows

    // ✅ Calculate total contributions
    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      admin,
      members,
      contributions,
      totalContributions,
      errors: {
        members: null,
        contributions: null,
        total: null,
      },
    }
  } catch (err) {
    console.error('[AdminDashboard] DB query error:', err)
    return null
  }
}

// ✅ Server Component
export default async function AdminDashboard() {
  // Get logged-in admin from cookie/session
  const { getLoggedInAdmin } = await import('@/lib/auth')
  const admin = await getLoggedInAdmin()

  if (!admin) {
    redirect('/auth/admin')
  }

  const adminData = await getAdminData(admin.email)

  if (!adminData) {
    redirect('/auth/admin?error=not_found')
  }

  return <AdminDashboardClient {...adminData} />
}
