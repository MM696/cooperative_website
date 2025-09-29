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
  User,
  Sparkles
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setIsDark(!isDark)
  }

  const iconVariants = {
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 }
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Modern creative tools */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {[
                { icon: Home, color: "text-blue-500" },
                { icon: Camera, color: "text-green-500" },
                { icon: Video, color: "text-purple-500" },
                { icon: Pen, color: "text-orange-500" },
                { icon: Brush, color: "text-pink-500" },
                { icon: Type, color: "text-cyan-500" },
                { icon: Folder, color: "text-indigo-500" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300"
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </motion.div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                Cooperative Studio
              </span>
            </div>
          </div>

          {/* Right side - Modern navigation */}
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Gallery
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Support
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-gray-600 dark:text-gray-300"
            >
              <Bell className="h-5 w-5" />
            </motion.button>
            <motion.button 
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-gray-600 dark:text-gray-300"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-white"
            >
              <User className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}