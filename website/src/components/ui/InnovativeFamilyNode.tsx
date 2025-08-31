'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FamilyNode as FamilyNodeType } from '@/types'
import { Users, MapPin, Shield, Star, Heart, Home, Sparkles } from 'lucide-react'

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
        y: 20
    },
    visible: (delay: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            delay,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }),
    hover: {
        scale: 1.1,
        y: -8,
        transition: { duration: 0.2 }
    },
    tap: {
        scale: 0.95,
        transition: { duration: 0.1 }
    },
    selected: {
        scale: 1.15,
        transition: { duration: 0.3 }
    }
}

const smokeVariants = {
    animate: {
        y: [-5, -20, -35, -50],
        opacity: [0.8, 0.6, 0.4, 0],
        scale: [1, 1.2, 1.5, 2],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
        }
    }
}

const windowGlowVariants = {
    animate: {
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.1, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

const doorKnobVariants = {
    animate: {
        rotate: [0, 10, -10, 0],
        transition: {
            duration: 1,
            repeat: Infinity,
            delay: 2
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
    // Inject styles safely in useEffect
    useEffect(() => {
        if (typeof document !== 'undefined') {
            // Check if styles are already injected
            const existingStyle = document.getElementById('innovative-family-node-styles')
            if (!existingStyle) {
                const styles = `
          .innovative-family-node {
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          }
          
          .innovative-family-node:hover {
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
          }
        `
                const styleSheet = document.createElement('style')
                styleSheet.id = 'innovative-family-node-styles'
                styleSheet.textContent = styles
                document.head.appendChild(styleSheet)
            }
        }
    }, [])

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

    // Get house design based on family characteristics
    const getHouseDesign = () => {
        const trustLevel = family.trustScore / 10
        const familySize = family.memberCount

        // House size based on family size
        let houseSize = 'small'
        if (familySize >= 8) houseSize = 'large'
        else if (familySize >= 5) houseSize = 'medium'

        // House style based on trust score
        let houseStyle = 'basic'
        if (family.trustScore >= 9) houseStyle = 'luxury'
        else if (family.trustScore >= 8) houseStyle = 'modern'
        else if (family.trustScore >= 7) houseStyle = 'traditional'

        // Colors based on trust score
        let colors = {
            roof: '#8B4513',
            walls: '#F5DEB3',
            door: '#8B4513',
            windows: '#87CEEB',
            chimney: '#696969'
        }

        if (family.trustScore >= 9) {
            colors = {
                roof: '#FFD700',
                walls: '#F0F8FF',
                door: '#8B4513',
                windows: '#FFD700',
                chimney: '#C0C0C0'
            }
        } else if (family.trustScore >= 8) {
            colors = {
                roof: '#4169E1',
                walls: '#F0F8FF',
                door: '#2F4F4F',
                windows: '#87CEEB',
                chimney: '#696969'
            }
        } else if (family.trustScore >= 7) {
            colors = {
                roof: '#228B22',
                walls: '#F5F5DC',
                door: '#8B4513',
                windows: '#87CEEB',
                chimney: '#696969'
            }
        }

        return { houseSize, houseStyle, colors }
    }

    const design = getHouseDesign()

    const renderHouse = () => {
        const { houseSize, houseStyle, colors } = design

        // Size configurations - made smaller
        const sizeConfig = {
            small: { width: 40, height: 35, roofHeight: 15 },
            medium: { width: 50, height: 45, roofHeight: 18 },
            large: { width: 60, height: 55, roofHeight: 22 }
        }

        const size = sizeConfig[houseSize]

        return (
            <div className="relative" style={{ width: size.width, height: size.height + size.roofHeight }}>
                {/* Chimney */}
                <div
                    className="absolute top-0 right-1 w-2 h-4 rounded-sm"
                    style={{ backgroundColor: colors.chimney }}
                />

                {/* Smoke for active families */}
                {family.trustScore >= 8 && (
                    <motion.div
                        className="absolute top-0 right-2 w-1 h-1 rounded-full opacity-60"
                        style={{ backgroundColor: '#D3D3D3' }}
                        variants={smokeVariants}
                        animate="animate"
                    />
                )}

                {/* Roof */}
                <div
                    className="absolute top-0 left-0 w-full h-0 border-l-0 border-r-0 border-b-0"
                    style={{
                        borderLeft: `${size.width / 2}px solid transparent`,
                        borderRight: `${size.width / 2}px solid transparent`,
                        borderBottom: `${size.roofHeight}px solid ${colors.roof}`,
                    }}
                />

                {/* House body */}
                <div
                    className="absolute bottom-0 left-0 w-full rounded-b-lg"
                    style={{
                        height: size.height,
                        backgroundColor: colors.walls,
                        border: `1px solid ${colors.roof}`
                    }}
                >
                    {/* Windows */}
                    <div className="absolute top-2 left-1 w-3 h-3 rounded border" style={{ borderColor: colors.windows, backgroundColor: colors.windows }}>
                        <motion.div
                            className="w-full h-full rounded-sm"
                            style={{ backgroundColor: family.trustScore >= 8 ? '#FFD700' : '#FFFFFF' }}
                            variants={windowGlowVariants}
                            animate="animate"
                        />
                    </div>

                    <div className="absolute top-2 right-1 w-3 h-3 rounded border" style={{ borderColor: colors.windows, backgroundColor: colors.windows }}>
                        <motion.div
                            className="w-full h-full rounded-sm"
                            style={{ backgroundColor: family.trustScore >= 8 ? '#FFD700' : '#FFFFFF' }}
                            variants={windowGlowVariants}
                            animate="animate"
                        />
                    </div>

                    {/* Door */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-6 rounded-t-lg" style={{ backgroundColor: colors.door }}>
                        {/* Door knob */}
                        <motion.div
                            className="absolute top-3 right-0.5 w-0.5 h-0.5 rounded-full"
                            style={{ backgroundColor: '#FFD700' }}
                            variants={doorKnobVariants}
                            animate="animate"
                        />

                        {/* Family initial on door */}
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
                            {family.name.charAt(0)}
                        </div>
                    </div>

                    {/* Additional windows for larger houses */}
                    {houseSize !== 'small' && (
                        <>
                            <div className="absolute top-5 left-1 w-2 h-2 rounded border" style={{ borderColor: colors.windows, backgroundColor: colors.windows }}>
                                <motion.div
                                    className="w-full h-full rounded-sm"
                                    style={{ backgroundColor: family.trustScore >= 8 ? '#FFD700' : '#FFFFFF' }}
                                    variants={windowGlowVariants}
                                    animate="animate"
                                />
                            </div>
                            <div className="absolute top-5 right-1 w-2 h-2 rounded border" style={{ borderColor: colors.windows, backgroundColor: colors.windows }}>
                                <motion.div
                                    className="w-full h-full rounded-sm"
                                    style={{ backgroundColor: family.trustScore >= 8 ? '#FFD700' : '#FFFFFF' }}
                                    variants={windowGlowVariants}
                                    animate="animate"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Trust score indicator */}
                {family.verified && (
                    <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: animationDelay + 0.5 }}
                    >
                        <Shield className="w-2 h-2 text-green-600" />
                    </motion.div>
                )}

                {/* Family size indicator */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-1 py-0.5 shadow-md">
                    <div className="flex items-center gap-0.5 text-xs font-bold text-gray-700">
                        <Users className="w-2 h-2" />
                        {family.memberCount}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <motion.div
                className={`
          innovative-family-node relative
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
                {/* House rendering */}
                {renderHouse()}

                {/* Family name label */}
                <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
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
        </div>
    )
} 