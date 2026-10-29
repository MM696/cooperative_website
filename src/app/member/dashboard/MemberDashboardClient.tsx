'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Banknote, Calendar, Wallet, LogOut, Loader2, X } from 'lucide-react'

interface Member {
  id: string
  name: string
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

interface MemberDashboardClientProps {
  member: Member
  contributions: Contribution[]
  totalContributions: number
  updateMemberAction: (
    memberId: string,
    updates: Partial<Pick<Member, 'name' | 'email' | 'phone'>>
  ) => Promise<Member | null>
  createContributionAction?: (memberId: string, amount: number) => Promise<Contribution | null> // ✅ optional new prop
}

export default function MemberDashboardClient({
  member,
  contributions,
  totalContributions,
  updateMemberAction,
  createContributionAction,
}: MemberDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'profile'>('overview')
  const [editing, setEditing] = useState(false)
  const [memberState, setMemberState] = useState(member)
  const [form, setForm] = useState<Pick<Member, 'name' | 'email' | 'phone'>>({
    name: member.name,
    email: member.email,
    phone: member.phone,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // ✅ New modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')

  const router = useRouter()

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await fetch('/api/member-logout', { method: 'POST' })
      router.push('/')
    } catch {
      setSigningOut(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const updated = await updateMemberAction(member.id, form)
    if (updated) {
      setMemberState(updated)
      alert('Profile updated successfully!')
      setEditing(false)
    }
  }

  const handleContributionSubmit = async () => {
    if (!contributionAmount) return alert('Please enter an amount.')
    if (createContributionAction) {
      const newContribution = await createContributionAction(member.id, parseFloat(contributionAmount))
      if (newContribution) {
        alert('Contribution recorded successfully!')
        setModalOpen(false)
        setContributionAmount('')
        // Ideally, refresh page or re-fetch contributions here
        router.refresh?.()
      }
    } else {
      alert(`Amount ₦${contributionAmount} would be submitted here.`)
      setModalOpen(false)
      setContributionAmount('')
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Dashboard</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">Welcome, {memberState.name}</span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 px-4 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">            
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="block md:hidden text-gray-700 m-2 text-sm dark:text-gray-300">Welcome, {memberState.name}
        </span>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 overflow-x-auto">
          {(['overview', 'contributions', 'profile'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
              <Banknote className="h-8 w-8 text-green-600" />
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Contributions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">₦{totalContributions}</dd>
                </dl>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Number of Payments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{contributions.length}</dd>
                </dl>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Member Since</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatDate(memberState.created_at)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Contributions */}
        {activeTab === 'contributions' && (
          <div>
            {/* Add Contribution Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + New Contribution
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th>Amount</th>
                    <th>Date Paid</th>
                    <th>Recorded By</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contributions.map(c => (
                    <tr key={c.id}>
                      <td>{formatCurrency(c.amount)}</td>
                      <td>{formatDate(c.date_paid)}</td>
                      <td>{c.recorded_by}</td>
                      <td>{c.notes || '-'}</td>
                    </tr>
                  ))}
                  {contributions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        No contributions recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
            {/* fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                disabled={!editing}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled={!editing}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                disabled={!editing}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setForm({ name: memberState.name, email: memberState.email, phone: memberState.phone })
                  }}
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Contribution Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Add Contribution
            </h2>
            <input
              type="number"
              placeholder="Enter amount"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleContributionSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
