'use client'

import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 max-w-md text-center">
        <Mail className="mx-auto mb-6 text-blue-600 w-16 h-16" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Check Your Email
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We’ve sent a verification link to <strong>{email}</strong>. Please click the link in the email to complete your signup.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Didn’t receive the email? Check your spam folder or try signing up again.
        </p>
        <Link
          href="/auth/member"
          className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Login
          <ArrowLeft className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  )
}
