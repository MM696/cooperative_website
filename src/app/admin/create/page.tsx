'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createAdmin } from '@/app/actions/adminActions'

export default function AdminCreatePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [authorized, setAuthorized] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token === process.env.NEXT_PUBLIC_ADMIN_SETUP_TOKEN) {
      setAuthorized(true)
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await createAdmin(email, password)

    if (result.success) {
      setMessage('✅ Admin account created successfully!')
      setEmail('')
      setPassword('')
    } else {
      setMessage(`❌ ${result.error}`)
    }

    setLoading(false)
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">
          Unauthorized: Invalid or missing token
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Create Admin</h1>

        {message && (
          <p className="mb-4 text-center text-sm font-medium">
            {message}
          </p>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  )
}
