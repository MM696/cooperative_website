'use client'

import { useState } from 'react'
import { 
  Home, 
  Camera, 
  Video, 
  Pen, 
  Brush, 
  Type, 
  Folder,
  Bell,
  Sun,
  Moon,
  User
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setIsDark(!isDark)
  }

  return (
    <header className="bg-white dark:bg-krea-dark border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Browser-like icons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Camera className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Video className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Pen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Brush className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Type className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Folder className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              benevolentnimblebat
            </div>
          </div>

          {/* Right side - Navigation and user actions */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Gallery
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Support
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}