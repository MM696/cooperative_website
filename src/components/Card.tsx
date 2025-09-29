import Image from "next/image"
import { motion } from "framer-motion"

type CardProps = {
  title: string
  description: string
  img: string
  hover?: boolean
  glow?: boolean
  gradient?: boolean
}

export default function Card({ 
  title, 
  description, 
  img, 
  hover = true, 
  glow = false,
  gradient = false 
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      className={`
        relative rounded-2xl overflow-hidden max-w-sm transition-all duration-300
        ${gradient 
          ? 'bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/20 dark:to-gray-800/5 backdrop-blur-sm border border-white/20 dark:border-gray-700/20' 
          : 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20'
        }
        ${hover ? 'hover:shadow-xl hover:shadow-blue-500/10' : ''}
        ${glow ? 'hover:shadow-glow' : ''}
      `}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      )}
      
      <div className="relative overflow-hidden">
        <Image
          src={img}
          alt={title}
          width={400}
          height={250}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}
