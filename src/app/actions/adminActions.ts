'use server'

import { query } from '@/lib/db'
import bcrypt from 'bcrypt'
import { logoutAdmin } from '@/lib/auth'

export async function createAdmin(email: string, password: string) {
  try {
    console.log('[ADMIN] Creating new admin:', email)

    // ✅ Check if admin already exists
    const existing = await query<{ id: string }>(
      'SELECT id FROM cooperative.admins WHERE email = $1 LIMIT 1',
      [email]
    )

    if (existing.rows.length > 0) {
      return { success: false, error: 'Admin with this email already exists' }
    }

    // ✅ Hash password securely
    const passwordHash = await bcrypt.hash(password, 10)

    // ✅ Insert new admin into database
    await query(
      'INSERT INTO cooperative.admins (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    )

    return { success: true }
  } catch (error) {
    console.error('[ADMIN] Error creating admin:', error)
    return { success: false, error: 'Failed to create admin' }
  }
}

export async function signOutAdmin() {
  await logoutAdmin()
}
