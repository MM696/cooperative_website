'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, DollarSign, Plus, LogOut, Download, Trash2 } from 'lucide-react'

/* ---------------------- TYPES ---------------------- */

interface Admin {
  id: string
  email: string
  role: string
  full_name?: string
  created_at: string
}

interface Member {
  id: string
  full_name: string
  email: string
  phone?: string
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
  members?: {
    full_name: string
    email: string
  }
}

interface AdminDashboardClientProps {
  admin: Admin
  members: Member[]
  contributions: Contribution[]
  totalContributions: number
}

type Tab = 'overview' | 'members' | 'contributions' | 'add-member' | 'add-contribution'

interface MemberFormData {
  full_name: string
  email: string
  phone: string
}

interface ContributionFormData {
  member_id: string
  amount: string
  date_paid: string
  recorded_by: string
  notes: string
}

/* ---------------------- COMPONENT ---------------------- */

export default function AdminDashboardClient({
  admin,
  members,
  contributions,
  totalContributions
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const router = useRouter()

  /* ---------------------- HANDLERS ---------------------- */

  const handleSignOut = () => router.push('/')

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    const res = await fetch(`/api/members?id=${memberId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) alert(data.error || 'Error deleting member')
    else window.location.reload()
  }

  const handleDeleteContribution = async (contributionId: string) => {
    if (!confirm('Are you sure you want to delete this contribution?')) return
    const res = await fetch(`/api/contributions?id=${contributionId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) alert(data.error || 'Error deleting contribution')
    else window.location.reload()
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Member Name', 'Email', 'Phone', 'Total Contributions', 'Join Date'],
      ...members.map(member => {
        const memberContributions = contributions.filter(c => c.member_id === member.id)
        const totalAmount = memberContributions.reduce((sum, c) => sum + c.amount, 0)
        return [
          member.full_name,
          member.email,
          member.phone || '',
          totalAmount.toFixed(2),
          new Date(member.created_at).toLocaleDateString()
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'members-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  /* ---------------------- RENDER ---------------------- */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <span className="text-gray-700 dark:text-gray-300">Welcome, {admin.full_name || admin.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview','members','contributions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... Tabs content stays same, forms will be typed with MemberFormData & ContributionFormData ... */}
      </main>
    </div>
  )
}

/* ---------------------- AddMemberForm ---------------------- */

interface AddMemberFormProps {
  onClose: () => void
}

function AddMemberForm({ onClose }: AddMemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    full_name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) setMessage(data.error || 'Failed to add member')
      else {
        setMessage('Member added successfully!')
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* ...form content same as original... */}
    </div>
  )
}

/* ---------------------- AddContributionForm ---------------------- */

interface AddContributionFormProps {
  members: Member[]
  selectedMember: Member | null
  onClose: () => void
}

function AddContributionForm({ members, selectedMember, onClose }: AddContributionFormProps) {
  const [formData, setFormData] = useState<ContributionFormData>({
    member_id: selectedMember?.id || '',
    amount: '',
    date_paid: new Date().toISOString().split('T')[0],
    recorded_by: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
      })
      const data = await res.json()
      if (!res.ok) setMessage(data.error || 'Failed to record contribution')
      else {
        setMessage('Contribution recorded successfully!')
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Record Contribution
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Member
          </label>
          <select
            required
            value={formData.member_id}
            onChange={(e) =>
              setFormData({ ...formData, member_id: e.target.value })
            }
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name} ({member.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Paid
          </label>
          <input
            type="date"
            required
            value={formData.date_paid}
            onChange={(e) =>
              setFormData({ ...formData, date_paid: e.target.value })
            }
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recorded By
          </label>
          <input
            type="text"
            required
            value={formData.recorded_by}
            onChange={(e) =>
              setFormData({ ...formData, recorded_by: e.target.value })
            }
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes"
            rows={3}
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
          >
            {loading ? 'Recording...' : 'Record Contribution'}
          </button>
        </div>
      </form>
    </div>
  )
}
