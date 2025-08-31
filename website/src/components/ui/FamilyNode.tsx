'use client'

import { motion } from 'framer-motion'
import { FamilyNode as FamilyNodeType } from '@/types'
import { Users, MapPin, Shield, Star } from 'lucide-react'

interface FamilyNodeProps {
  family: FamilyNodeType
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  selected?: boolean
  onClick?: (family: FamilyNodeType) => void
  onHover?: (family: FamilyNodeType | null) => void
  animationDelay?: number
}

const nodeVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20 
  },
  visible: (delay: number) => ({
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }),
  hover: { 
    scale: 1.1,
    y: -4,
    transition: { duration: 0.15 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export function FamilyNode({
  family,
  size = 'md',
  interactive = true,
  selected = false,
  onClick,
  onHover,
  animationDelay = 0
}: FamilyNodeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-24 h-24 text-base'
  }

  const handleClick = () => {
    if (onClick && interactive) {
      onClick(family)
    }
  }

  const handleMouseEnter = () => {
    if (onHover && interactive) {
      onHover(family)
    }
  }

  const handleMouseLeave = () => {
    if (onHover && interactive) {
      onHover(null)
    }
  }

  return (
    <div className="relative">
      <motion.div
        className={`
          family-node relative rounded-full bg-white border-2 shadow-lg
          flex flex-col items-center justify-center p-2
          ${sizeClasses[size]}
          ${selected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'}
          ${interactive ? 'cursor-pointer' : ''}
        `}
        variants={nodeVariants}
        initial="hidden"
        animate="visible"
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        custom={animationDelay}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Trust Score Indicator */}
        {family.verified && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
            variants={pulseVariants}
            animate="animate"
          >
            <Shield className="w-2 h-2 text-white" />
          </motion.div>
        )}

        {/* Avatar or Initial */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
          {family.avatar ? (
            <img src={family.avatar} alt={family.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            family.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Family Name */}
        <div className="text-center mt-1">
          <div className="font-semibold truncate max-w-full">{family.surname}</div>
          <div className="text-gray-500 text-xs flex items-center gap-1">
            <Users className="w-3 h-3" />
            {family.memberCount}
          </div>
        </div>
      </motion.div>

      {/* Hover Details */}
      {interactive && (
        <motion.div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="font-semibold">{family.name} Family</div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {family.location.city}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Trust Score: {family.trustScore.toFixed(1)}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Specialized variants
export function HeroFamilyNode(props: Omit<FamilyNodeProps, 'size'>) {
  return <FamilyNode {...props} size="lg" />
}

export function NetworkFamilyNode(props: Omit<FamilyNodeProps, 'size'>) {
  return <FamilyNode {...props} size="md" />
}

export function MiniFamilyNode(props: Omit<FamilyNodeProps, 'size'>) {
  return <FamilyNode {...props} size="sm" />
}