'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifySignupPage() {
  const [status, setStatus] = useState('Verifying...')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return setStatus('Invalid link')

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-signup?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus(`Welcome, ${data.member.name}! Redirecting to dashboard...`)
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setStatus(data.error || 'Verification failed')
        }
      } catch {
        setStatus('Something went wrong.')
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <p className="text-xl font-medium text-gray-800 dark:text-white">{status}</p>
    </div>
  )
}
