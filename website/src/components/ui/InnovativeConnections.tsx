'use client'

import { motion } from 'framer-motion'
import { Connection, FamilyNode as FamilyNodeType } from '@/types'

interface InnovativeConnectionLineProps {
    connection: Connection
    startPosition: { x: number; y: number }
    endPosition: { x: number; y: number }
    animated?: boolean
    interactive?: boolean
    selectedFamily?: FamilyNodeType | null
    onClick?: (connection: Connection) => void
}

const getConnectionColor = (type: Connection['relationshipType'], strength: number) => {
    const colors = {
        blood: '#e11d48',     // Red
        marriage: '#f59e0b',  // Gold
        friendship: '#3b82f6', // Blue
        community: '#10b981'   // Green
    }

    const baseColor = colors[type]
    const opacity = Math.max(0.4, strength)
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}

const getStrokeWidth = (strength: number) => {
    return Math.max(2, strength * 6)
}

const generateCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    type: Connection['relationshipType']
) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Different curve styles based on relationship type
    let controlPointOffset = distance * 0.3

    if (type === 'blood') {
        // Blood relations get more pronounced curves
        controlPointOffset = distance * 0.4
    } else if (type === 'marriage') {
        // Marriage gets heart-like curves
        controlPointOffset = distance * 0.35
    } else if (type === 'friendship') {
        // Friendship gets gentle curves
        controlPointOffset = distance * 0.25
    } else {
        // Community gets subtle curves
        controlPointOffset = distance * 0.2
    }

    const midX = start.x + dx / 2
    const midY = start.y + dy / 2

    // Perpendicular offset for curve
    const perpX = -dy / distance * controlPointOffset
    const perpY = dx / distance * controlPointOffset

    const controlX = midX + perpX
    const controlY = midY + perpY

    return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`
}

const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: { duration: 1.5, ease: "easeInOut" },
            opacity: { duration: 0.8 }
        }
    }
}

const pulseVariants = {
    animate: {
        opacity: [0.6, 1, 0.6],
        scale: [1, 1.2, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

const flowVariants = {
    animate: {
        opacity: [0, 1, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

export function InnovativeConnectionLine({
    connection,
    startPosition,
    endPosition,
    animated = true,
    interactive = false,
    selectedFamily = null,
    onClick
}: InnovativeConnectionLineProps) {
    const pathData = generateCurvedPath(startPosition, endPosition, connection.relationshipType)
    const strokeColor = getConnectionColor(connection.relationshipType, connection.strength)
    const strokeWidth = getStrokeWidth(connection.strength)

    const isSelected = selectedFamily && (
        connection.fromFamilyId === selectedFamily.id ||
        connection.toFamilyId === selectedFamily.id
    )

    const handleClick = () => {
        if (onClick && interactive) {
            onClick(connection)
        }
    }

    return (
        <g className={interactive ? 'cursor-pointer' : ''} onClick={handleClick}>
            {/* Main connection line with glow effect */}
            <motion.path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={connection.verified ? "none" : "8,4"}
                filter={isSelected ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))" : "none"}
                variants={animated ? pathVariants : undefined}
                initial={animated ? "hidden" : undefined}
                animate={animated ? "visible" : undefined}
                className={interactive ? 'hover:stroke-opacity-80' : ''}
            />

            {/* Glow effect for strong connections */}
            {connection.strength > 0.8 && (
                <motion.path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth * 2}
                    strokeLinecap="round"
                    opacity="0.3"
                    filter="blur(2px)"
                    variants={pulseVariants}
                    animate="animate"
                />
            )}

            {/* Animated flow particles for strong connections */}
            {connection.strength > 0.7 && (
                <>
                    {[...Array(3)].map((_, i) => (
                        <motion.circle
                            key={i}
                            r="4"
                            fill={strokeColor}
                            variants={flowVariants}
                            animate="animate"
                            style={{ animationDelay: `${i * 1}s` }}
                        >
                            <animateMotion
                                dur="4s"
                                repeatCount="indefinite"
                                path={pathData}
                                begin={`${i * 1.3}s`}
                            />
                        </motion.circle>
                    ))}
                </>
            )}

            {/* Relationship type indicator */}
            {interactive && (
                <g>
                    <motion.circle
                        cx={(startPosition.x + endPosition.x) / 2}
                        cy={(startPosition.y + endPosition.y) / 2}
                        r="12"
                        fill="white"
                        stroke={strokeColor}
                        strokeWidth="3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.3 }}
                        className="cursor-help shadow-lg"
                    />
                    <text
                        x={(startPosition.x + endPosition.x) / 2}
                        y={(startPosition.y + endPosition.y) / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill={strokeColor}
                        className="pointer-events-none"
                    >
                        {connection.relationshipType.charAt(0).toUpperCase()}
                    </text>
                </g>
            )}

            {/* Strength indicator dots */}
            {connection.strength > 0.6 && (
                <g>
                    {[...Array(Math.floor(connection.strength * 5))].map((_, i) => {
                        const progress = i / Math.floor(connection.strength * 5)
                        const point = getPointOnPath(pathData, progress)

                        return (
                            <motion.circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="2"
                                fill={strokeColor}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.8 }}
                                transition={{ delay: i * 0.1 }}
                            />
                        )
                    })}
                </g>
            )}
        </g>
    )
}

// Helper function to get point on path
const getPointOnPath = (pathData: string, progress: number) => {
    // Simplified point calculation for curved paths
    const match = pathData.match(/M ([\d.]+) ([\d.]+) Q ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/)
    if (!match) return { x: 0, y: 0 }

    const [, x1, y1, cx, cy, x2, y2] = match.map(Number)

    // Quadratic Bezier curve calculation
    const t = progress
    const x = Math.pow(1 - t, 2) * x1 + 2 * (1 - t) * t * cx + Math.pow(t, 2) * x2
    const y = Math.pow(1 - t, 2) * y1 + 2 * (1 - t) * t * cy + Math.pow(t, 2) * y2

    return { x, y }
}

// Helper component for rendering multiple connections
interface InnovativeConnectionsProps {
    connections: Connection[]
    nodePositions: Record<string, { x: number; y: number }>
    animated?: boolean
    interactive?: boolean
    selectedFamily?: FamilyNodeType | null
    onConnectionClick?: (connection: Connection) => void
}

export function InnovativeConnections({
    connections,
    nodePositions,
    animated = true,
    interactive = false,
    selectedFamily = null,
    onConnectionClick
}: InnovativeConnectionsProps) {
    return (
        <>
            {connections.map((connection) => {
                const startPos = nodePositions[connection.fromFamilyId]
                const endPos = nodePositions[connection.toFamilyId]

                if (!startPos || !endPos) return null

                return (
                    <InnovativeConnectionLine
                        key={connection.id}
                        connection={connection}
                        startPosition={startPos}
                        endPosition={endPos}
                        animated={animated}
                        interactive={interactive}
                        selectedFamily={selectedFamily}
                        onClick={onConnectionClick}
                    />
                )
            })}
        </>
    )
} 