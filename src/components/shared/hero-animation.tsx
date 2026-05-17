'use client'

import { motion } from 'framer-motion'

interface HeroAnimationProps {
  children: React.ReactNode
}

export function HeroAnimation({ children }: HeroAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
