'use client'

import { motion } from 'framer-motion'

interface AnimatedHeroProps {
  title: string
  subtitle: string
  description: string
  englishDescription: string
}

export function AnimatedHero({ title, subtitle, description, englishDescription }: AnimatedHeroProps) {
  return (
    <div className="text-center mb-12">
      <motion.h1 
        className="text-5xl md:text-6xl font-extralight text-gray-900 mb-6 tracking-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {title}
      </motion.h1>
      <motion.h2 
        className="text-3xl md:text-4xl font-light text-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        {subtitle}
      </motion.h2>
      <motion.p 
        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        {description}
        <br />
        <span className="text-lg text-gray-500">
          {englishDescription}
        </span>
      </motion.p>
    </div>
  )
} 