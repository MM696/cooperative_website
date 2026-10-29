'use server'

import { query } from '@/lib/db'
import bcrypt from 'bcrypt'
import { createAdminSession } from '@/lib/auth'

// ✅ Define the exact shape of an Admin row
interface AdminRow {
  id: string
  email: string
  password_hash: string
 }

export async function loginAdmin(email: string, password: string) {
  try {
    console.log('[LOGIN] Attempting login for:', email)

    // ✅ Fetch admin from DB
    const result = await query<AdminRow>(
      'SELECT id, email, password_hash FROM cooperative.admins WHERE email = $1 LIMIT 1',
      [email]
    )

    console.log('[LOGIN] Query result:', result.rows)

    const admin = result.rows[0]
    if (!admin) {
      console.warn('[LOGIN] Admin not found:', email)
      return { success: false, message: 'Admin not found' }
    }

    console.log('[LOGIN] Admin found:', admin.id)

    // ✅ Compare password
    const valid = await bcrypt.compare(password, admin.password_hash)
    console.log('[LOGIN] Password valid?', valid)

    if (!valid) {
      console.warn('[LOGIN] Invalid password for admin:', email)
      return { success: false, message: 'Invalid password' }
    }

    // ✅ Create session + set cookie
    await createAdminSession(admin.id)

    console.log('[LOGIN] Admin session created & cookie set.')

    return {
      success: true,
      message: 'Login successful',
      redirectTo: '/admin/dashboard',
    }
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error)
    return { success: false, message: 'Unexpected server error' }
  }
}
