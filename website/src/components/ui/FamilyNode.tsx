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
  const sizeConfig = {
    sm: { container: 'w-20 h-20', inner: 'w-12 h-12', text: 'text-xs', iconSize: 'w-3 h-3' },
    md: { container: 'w-24 h-24', inner: 'w-16 h-16', text: 'text-sm', iconSize: 'w-4 h-4' },
    lg: { container: 'w-32 h-32', inner: 'w-20 h-20', text: 'text-base', iconSize: 'w-5 h-5' }
  }

  const config = sizeConfig[size]

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

  // Generate unique colors based on family trust score and name
  const getNodeColors = () => {
    const baseHue = family.name.length * 30 % 360
    const trustLevel = family.trustScore / 10
    
    if (family.trustScore >= 9) {
      return {
        outer: 'from-emerald-400 via-teal-400 to-cyan-400',
        inner: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-400/50'
      }
    } else if (family.trustScore >= 8) {
      return {
        outer: 'from-blue-400 via-indigo-400 to-purple-400', 
        inner: 'from-blue-500 to-indigo-600',
        glow: 'shadow-blue-400/50'
      }
    } else if (family.trustScore >= 7) {
      return {
        outer: 'from-amber-400 via-orange-400 to-yellow-400',
        inner: 'from-amber-500 to-orange-600', 
        glow: 'shadow-amber-400/50'
      }
    } else {
      return {
        outer: 'from-gray-400 via-slate-400 to-gray-500',
        inner: 'from-gray-500 to-slate-600',
        glow: 'shadow-gray-400/50'
      }
    }
  }

  const colors = getNodeColors()

  return (
    <div className="relative">
      <motion.div
        className={`
          family-node-innovative relative ${config.container}
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
        {/* Outer Rotating Ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.outer} opacity-20`}
          animate={{ rotate: selected ? 360 : 0 }}
          transition={{ duration: 3, repeat: selected ? Infinity : 0, ease: "linear" }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className={`absolute inset-1 rounded-full bg-gradient-to-br ${colors.outer} opacity-30 shadow-lg ${colors.glow}`}
          animate={{ scale: selected ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: selected ? Infinity : 0, ease: "easeInOut" }}
        />

        {/* Inner Core */}
        <motion.div
          className={`absolute inset-2 ${config.inner} rounded-full bg-gradient-to-br ${colors.inner} shadow-xl backdrop-blur-sm flex flex-col items-center justify-center`}
          animate={{ 
            boxShadow: selected 
              ? ['0 0 0 rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.5)', '0 0 0 rgba(59, 130, 246, 0)']
              : '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 1.5, repeat: selected ? Infinity : 0 }}
        >
          {/* Avatar/Initial */}
          <div className="text-white font-bold text-lg">
            {family.avatar ? (
              <img src={family.avatar} alt={family.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              family.name.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* Member count indicator */}
          <div className="text-white/90 text-xs font-medium mt-0.5">
            {family.memberCount}
          </div>
        </motion.div>

        {/* Trust Score Ring */}
        {family.verified && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
            variants={pulseVariants}
            animate="animate"
          >
            <Shield className={`${config.iconSize} text-green-600`} />
          </motion.div>
        )}

        {/* Connection Indicators */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            {[...Array(Math.min(3, Math.floor(family.trustScore)))].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Family Name Label */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.5 }}
        >
          <div className={`font-bold text-gray-800 ${config.text}`}>{family.surname}</div>
          <div className="text-gray-500 text-xs">{family.location.city}</div>
        </motion.div>
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