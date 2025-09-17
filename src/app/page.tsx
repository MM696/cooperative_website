import Link from 'next/link'
import { Users, DollarSign, Shield, Mail } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cooperative Manager
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth/member"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Member Login
              </Link>
              <Link
                href="/auth/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to Your
              <span className="text-blue-600"> Cooperative</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Efficiently manage member contributions, track financial records, and maintain 
              transparent communication with our comprehensive cooperative management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/member"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Access Member Portal
              </Link>
              <Link
                href="/auth/admin"
                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Your Cooperative
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Streamlined tools for members and administrators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Member Management
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Add, edit, and manage member profiles with ease
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Contribution Tracking
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Record and monitor member contributions automatically
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Secure Access
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Role-based access control for members and administrators
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Notifications
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Automatic notifications for contribution updates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Users className="h-6 w-6" />
              <span className="text-xl font-bold">Cooperative Manager</span>
            </div>
            <p className="text-gray-400">
              Empowering cooperatives with modern management tools
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}