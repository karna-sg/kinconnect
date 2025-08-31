'use client'

import { motion } from 'framer-motion'
import { FamilyNode as FamilyNodeType } from '@/types'
import { Users, MapPin, Shield, Star, Heart, Sparkles } from 'lucide-react'

interface InnovativeFamilyNodeProps {
    family: FamilyNodeType
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
        rotate: -180,
        y: 20
    },
    visible: (delay: number) => ({
        opacity: 1,
        scale: 1,
        rotate: 0,
        y: 0,
        transition: {
            delay,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }),
    hover: {
        scale: 1.15,
        rotate: 5,
        y: -8,
        transition: { duration: 0.2 }
    },
    tap: {
        scale: 0.95,
        transition: { duration: 0.1 }
    },
    selected: {
        scale: 1.2,
        rotate: 0,
        transition: { duration: 0.3 }
    }
}

const pulseVariants = {
    animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

const orbitVariants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

const sparkleVariants = {
    animate: {
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 2,
        }
    }
}

export function InnovativeFamilyNode({
    family,
    interactive = true,
    selected = false,
    onClick,
    onHover,
    animationDelay = 0
}: InnovativeFamilyNodeProps) {
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

    // Generate unique colors and shapes based on family data
    const getNodeDesign = () => {
        const trustLevel = family.trustScore / 10
        const nameHash = family.name.length + family.surname.length

        // Different shapes based on trust score
        if (family.trustScore >= 9) {
            return {
                shape: 'hexagon',
                colors: {
                    primary: 'from-emerald-400 via-teal-400 to-cyan-400',
                    secondary: 'from-emerald-500 to-teal-600',
                    glow: 'shadow-emerald-400/50',
                    accent: 'text-emerald-600'
                }
            }
        } else if (family.trustScore >= 8) {
            return {
                shape: 'diamond',
                colors: {
                    primary: 'from-blue-400 via-indigo-400 to-purple-400',
                    secondary: 'from-blue-500 to-indigo-600',
                    glow: 'shadow-blue-400/50',
                    accent: 'text-blue-600'
                }
            }
        } else if (family.trustScore >= 7) {
            return {
                shape: 'star',
                colors: {
                    primary: 'from-amber-400 via-orange-400 to-yellow-400',
                    secondary: 'from-amber-500 to-orange-600',
                    glow: 'shadow-amber-400/50',
                    accent: 'text-amber-600'
                }
            }
        } else {
            return {
                shape: 'circle',
                colors: {
                    primary: 'from-gray-400 via-slate-400 to-gray-500',
                    secondary: 'from-gray-500 to-slate-600',
                    glow: 'shadow-gray-400/50',
                    accent: 'text-gray-600'
                }
            }
        }
    }

    const design = getNodeDesign()

    const renderShape = () => {
        const baseClasses = `absolute inset-0 bg-gradient-to-br ${design.colors.primary} shadow-lg ${design.glow}`

        switch (design.shape) {
            case 'hexagon':
                return (
                    <div className={`${baseClasses} clip-path-hexagon`}>
                        <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
                    </div>
                )
            case 'diamond':
                return (
                    <div className={`${baseClasses} clip-path-diamond`}>
                        <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                )
            case 'star':
                return (
                    <div className={`${baseClasses} clip-path-star`}>
                        <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                )
            default:
                return (
                    <div className={`${baseClasses} rounded-full`}>
                        <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                    </div>
                )
        }
    }

    return (
        <div className="relative">
            <motion.div
                className={`
          innovative-family-node relative w-32 h-32
          ${interactive ? 'cursor-pointer' : ''}
        `}
                variants={nodeVariants}
                initial="hidden"
                animate={selected ? "selected" : "visible"}
                whileHover={interactive ? "hover" : undefined}
                whileTap={interactive ? "tap" : undefined}
                custom={animationDelay}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Orbiting rings for high trust families */}
                {family.trustScore >= 8.5 && (
                    <motion.div
                        className="absolute inset-0"
                        variants={orbitVariants}
                        animate="animate"
                    >
                        <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full" />
                        <div className="absolute inset-2 border-2 border-purple-400/20 rounded-full" />
                        <div className="absolute inset-4 border-2 border-pink-400/10 rounded-full" />
                    </motion.div>
                )}

                {/* Main shape */}
                {renderShape()}

                {/* Inner core with family info */}
                <motion.div
                    className={`absolute inset-4 bg-gradient-to-br ${design.colors.secondary} shadow-xl backdrop-blur-sm flex flex-col items-center justify-center text-white`}
                    animate={{
                        boxShadow: selected
                            ? ['0 0 0 rgba(59, 130, 246, 0)', '0 0 30px rgba(59, 130, 246, 0.6)', '0 0 0 rgba(59, 130, 246, 0)']
                            : '0 10px 25px rgba(0, 0, 0, 0.15)'
                    }}
                    transition={{ duration: 1.5, repeat: selected ? Infinity : 0 }}
                >
                    {/* Family initial */}
                    <div className="text-white font-bold text-xl mb-1">
                        {family.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Member count with icon */}
                    <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
                        <Users className="w-3 h-3" />
                        {family.memberCount}
                    </div>
                </motion.div>

                {/* Trust score indicator */}
                {family.verified && (
                    <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                        variants={pulseVariants}
                        animate="animate"
                    >
                        <Shield className="w-4 h-4 text-green-600" />
                    </motion.div>
                )}

                {/* Sparkles for high trust families */}
                {family.trustScore >= 9 && (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 text-yellow-400"
                                style={{
                                    left: `${20 + i * 30}%`,
                                    top: `${10 + i * 20}%`,
                                }}
                                variants={sparkleVariants}
                                animate="animate"
                            >
                                <Sparkles className="w-full h-full" />
                            </motion.div>
                        ))}
                    </>
                )}

                {/* Connection strength indicators */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-1">
                        {[...Array(Math.min(4, Math.floor(family.trustScore)))].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Family name label */}
                <motion.div
                    className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: animationDelay + 0.5 }}
                >
                    <div className="font-bold text-gray-800 text-sm">{family.surname}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1 justify-center">
                        <MapPin className="w-3 h-3" />
                        {family.location.city}
                    </div>
                </motion.div>
            </motion.div>

            {/* Hover Details */}
            {interactive && (
                <motion.div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="bg-gray-900 text-white text-xs rounded-xl px-4 py-3 whitespace-nowrap shadow-2xl border border-white/10">
                        <div className="font-semibold text-sm mb-2">{family.name} Family</div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {family.location.city}, {family.location.country}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-3 h-3" />
                                Trust Score: {family.trustScore.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {family.memberCount} members
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-3 h-3" />
                                {family.community.religion}
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

// CSS for custom shapes
const styles = `
  .clip-path-hexagon {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  
  .clip-path-diamond {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }
  
  .clip-path-star {
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }
`

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
} 