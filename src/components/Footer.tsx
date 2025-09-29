import { motion } from 'framer-motion'
import { Users, Globe, Shield, Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' }
  ]

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      variants={footerVariants}
      viewport={{ once: true }}
      className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-16 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-75"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Cooperative Manager
              </span>
            </div>
            <p className="text-lg text-blue-100 mb-6 max-w-md">
              Empowering cooperatives with modern management tools and seamless user experience. 
              Built for the future of collaborative organizations.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 text-white hover:text-blue-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Features', 'Pricing', 'Documentation', 'Support'].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300">
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-3">
              {['Member Management', 'Contribution Tracking', 'Secure Access', 'Email Notifications', 'Analytics'].map((feature, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300">
                    {feature}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <div className="flex items-center space-x-2 text-blue-200">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Global Reach</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Secure & Reliable</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <Heart className="h-4 w-4" />
              <span className="text-sm">Made with Love</span>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-blue-200 text-sm mb-2">
              © 2024 Cooperative Manager. All rights reserved.
            </p>
            <p className="text-blue-300 text-xs">
              Built with Next.js, Tailwind CSS, and Framer Motion
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}