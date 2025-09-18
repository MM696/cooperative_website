'use server'

import { query } from '@/lib/db'
import bcrypt from 'bcrypt'

// ✅ Define the exact shape of an Admin row
interface AdminRow {
  id: string
  email: string
  password_hash: string
}

export async function loginAdmin(email: string, password: string) {
  try {
    console.log('[LOGIN] Attempting login for:', email)

    // ✅ Use generics to tell TS what the query returns
    const result = await query<AdminRow>(
      'SELECT id, email, password_hash FROM admins WHERE email = $1 LIMIT 1',
      [email]
    )

    console.log('[LOGIN] Query result:', result.rows)

    const admin = result.rows[0]
    if (!admin) {
      console.warn('[LOGIN] Admin not found:', email)
      return { success: false, error: 'Admin not found' }
    }

    console.log('[LOGIN] Admin found:', admin.id)

    // ✅ Type-safe: admin.password_hash is guaranteed to be a string
    const valid = await bcrypt.compare(password, admin.password_hash)
    console.log('[LOGIN] Password valid?', valid)

    if (!valid) {
      console.warn('[LOGIN] Invalid password for admin:', email)
      return { success: false, error: 'Invalid password' }
    }

    console.log('[LOGIN] Login successful for admin:', email)

    // Here you could also set a cookie/session if you want persistent login
    return { success: true }
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error)
    throw error // rethrow so Next.js shows 500 in terminal
  }
}
