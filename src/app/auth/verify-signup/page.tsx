'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

export default function VerifySignupPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your account...')

  useEffect(() => {
    const verify = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Invalid or missing verification link')
        return
      }

      try {
        const res = await fetch('/api/verify-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage('Account verified! Redirecting to your dashboard...')
          setTimeout(() => router.push('/member/dashboard'), 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (err) {
        console.error(err)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    verify()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <Loader2 className="mx-auto mb-6 text-blue-600 w-16 h-16 animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="mx-auto mb-6 text-green-600 w-16 h-16" />
        )}
        {status === 'error' && (
          <XCircle className="mx-auto mb-6 text-red-600 w-16 h-16" />
        )}

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {status === 'loading' && 'Verifying...'}
          {status === 'success' && 'Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="text-gray-600 dark:text-gray-300">{message}</p>

        {status === 'error' && (
          <button
            type="button"
            onClick={() => router.push('/auth/member-signup')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Signup
          </button>
        )}
      </div>
    </div>
  )
}
