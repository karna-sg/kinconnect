'use client'

import { motion } from 'framer-motion'
import { Connection } from '@/types'

interface ConnectionLineProps {
  connection: Connection
  startPosition: { x: number; y: number }
  endPosition: { x: number; y: number }
  animated?: boolean
  interactive?: boolean
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
  const opacity = Math.max(0.3, strength)
  return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}

const getStrokeWidth = (strength: number) => {
  return Math.max(1, strength * 4)
}

const generateCurvedPath = (
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  
  // Create a curved path using quadratic Bezier curve
  const controlPointOffset = Math.sqrt(dx * dx + dy * dy) * 0.3
  const midX = start.x + dx / 2
  const midY = start.y + dy / 2
  
  // Perpendicular offset for curve
  const perpX = -dy / Math.sqrt(dx * dx + dy * dy) * controlPointOffset
  const perpY = dx / Math.sqrt(dx * dx + dy * dy) * controlPointOffset
  
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
      pathLength: { duration: 1.2, ease: "easeInOut" },
      opacity: { duration: 0.5 }
    }
  }
}

const pulseVariants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export function ConnectionLine({
  connection,
  startPosition,
  endPosition,
  animated = true,
  interactive = false,
  onClick
}: ConnectionLineProps) {
  const pathData = generateCurvedPath(startPosition, endPosition)
  const strokeColor = getConnectionColor(connection.relationshipType, connection.strength)
  const strokeWidth = getStrokeWidth(connection.strength)
  
  const handleClick = () => {
    if (onClick && interactive) {
      onClick(connection)
    }
  }

  return (
    <g className={interactive ? 'cursor-pointer' : ''} onClick={handleClick}>
      {/* Main connection line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={connection.verified ? "none" : "5,5"}
        variants={animated ? pathVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        className={interactive ? 'hover:stroke-opacity-80' : ''}
      />
      
      {/* Animated flow indicator for strong connections */}
      {connection.strength > 0.7 && (
        <motion.circle
          r="3"
          fill={strokeColor}
          variants={pulseVariants}
          animate="animate"
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={pathData}
          />
        </motion.circle>
      )}
      
      {/* Relationship type indicator */}
      {interactive && (
        <g>
          <motion.circle
            cx={(startPosition.x + endPosition.x) / 2}
            cy={(startPosition.y + endPosition.y) / 2}
            r="8"
            fill="white"
            stroke={strokeColor}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            className="cursor-help"
          />
          <text
            x={(startPosition.x + endPosition.x) / 2}
            y={(startPosition.y + endPosition.y) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill={strokeColor}
            className="pointer-events-none"
          >
            {connection.relationshipType.charAt(0).toUpperCase()}
          </text>
        </g>
      )}
    </g>
  )
}

// Helper component for rendering multiple connections
interface ConnectionsProps {
  connections: Connection[]
  nodePositions: Record<string, { x: number; y: number }>
  animated?: boolean
  interactive?: boolean
  onConnectionClick?: (connection: Connection) => void
}

export function Connections({
  connections,
  nodePositions,
  animated = true,
  interactive = false,
  onConnectionClick
}: ConnectionsProps) {
  return (
    <>
      {connections.map((connection) => {
        const startPos = nodePositions[connection.fromFamilyId]
        const endPos = nodePositions[connection.toFamilyId]
        
        if (!startPos || !endPos) return null
        
        return (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            startPosition={startPos}
            endPosition={endPos}
            animated={animated}
            interactive={interactive}
            onClick={onConnectionClick}
          />
        )
      })}
    </>
  )
}