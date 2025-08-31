'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FamilyNode } from '@/components/ui/FamilyNode'
import { Connections } from '@/components/ui/ConnectionLine'
import { FamilyNode as FamilyNodeType, Connection } from '@/types'
import { 
  Filter, 
  Search, 
  Maximize2, 
  RotateCcw, 
  Play, 
  Pause,
  Users,
  Star,
  Globe,
  Zap
} from 'lucide-react'

// Extended family network with 15 families
const extendedFamilies: FamilyNodeType[] = [
  // Core Mumbai families
  { id: 'fam_01', name: 'Sharma', surname: 'Sharma', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Hindu', language: ['Hindi', 'Marathi'] }, trustScore: 9.2, verified: true, memberCount: 8, connections: [] },
  { id: 'fam_02', name: 'Patel', surname: 'Patel', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Hindu', language: ['Gujarati', 'Hindi'] }, trustScore: 8.8, verified: true, memberCount: 12, connections: [] },
  { id: 'fam_03', name: 'Singh', surname: 'Singh', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Sikh', language: ['Punjabi', 'Hindi'] }, trustScore: 9.1, verified: true, memberCount: 6, connections: [] },
  
  // Delhi families
  { id: 'fam_04', name: 'Gupta', surname: 'Gupta', location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] }, community: { religion: 'Hindu', language: ['Hindi', 'Punjabi'] }, trustScore: 8.6, verified: true, memberCount: 7, connections: [] },
  { id: 'fam_05', name: 'Agarwal', surname: 'Agarwal', location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] }, community: { religion: 'Hindu', language: ['Hindi'] }, trustScore: 8.4, verified: true, memberCount: 5, connections: [] },
  
  // Bangalore families
  { id: 'fam_06', name: 'Kumar', surname: 'Kumar', location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] }, community: { religion: 'Hindu', language: ['Kannada', 'English'] }, trustScore: 8.9, verified: true, memberCount: 6, connections: [] },
  { id: 'fam_07', name: 'Reddy', surname: 'Reddy', location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] }, community: { religion: 'Hindu', language: ['Telugu', 'English'] }, trustScore: 8.7, verified: true, memberCount: 9, connections: [] },
  
  // International families
  { id: 'fam_08', name: 'Patel-USA', surname: 'Patel', location: { city: 'San Francisco', state: 'California', country: 'USA', coordinates: [37.7749, -122.4194] }, community: { religion: 'Hindu', language: ['Gujarati', 'English'] }, trustScore: 9.0, verified: true, memberCount: 4, connections: [] },
  { id: 'fam_09', name: 'Singh-Canada', surname: 'Singh', location: { city: 'Toronto', state: 'Ontario', country: 'Canada', coordinates: [43.6532, -79.3832] }, community: { religion: 'Sikh', language: ['Punjabi', 'English'] }, trustScore: 8.8, verified: true, memberCount: 5, connections: [] },
  { id: 'fam_10', name: 'Sharma-UK', surname: 'Sharma', location: { city: 'London', state: 'England', country: 'UK', coordinates: [51.5074, -0.1278] }, community: { religion: 'Hindu', language: ['Hindi', 'English'] }, trustScore: 8.5, verified: true, memberCount: 6, connections: [] },
  
  // Extended network
  { id: 'fam_11', name: 'Joshi', surname: 'Joshi', location: { city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: [18.5204, 73.8567] }, community: { religion: 'Hindu', language: ['Marathi', 'Hindi'] }, trustScore: 8.3, verified: true, memberCount: 7, connections: [] },
  { id: 'fam_12', name: 'Mehta', surname: 'Mehta', location: { city: 'Ahmedabad', state: 'Gujarat', country: 'India', coordinates: [23.0225, 72.5714] }, community: { religion: 'Hindu', language: ['Gujarati'] }, trustScore: 8.7, verified: true, memberCount: 10, connections: [] },
  { id: 'fam_13', name: 'Verma', surname: 'Verma', location: { city: 'Noida', state: 'Uttar Pradesh', country: 'India', coordinates: [28.5355, 77.3910] }, community: { religion: 'Hindu', language: ['Hindi'] }, trustScore: 8.1, verified: false, memberCount: 6, connections: [] },
  { id: 'fam_14', name: 'Chopra', surname: 'Chopra', location: { city: 'Chandigarh', state: 'Punjab', country: 'India', coordinates: [30.7333, 76.7794] }, community: { religion: 'Hindu', language: ['Punjabi', 'Hindi'] }, trustScore: 8.9, verified: true, memberCount: 8, connections: [] },
  { id: 'fam_15', name: 'Nair', surname: 'Nair', location: { city: 'Kochi', state: 'Kerala', country: 'India', coordinates: [9.9312, 76.2673] }, community: { religion: 'Hindu', language: ['Malayalam', 'English'] }, trustScore: 9.3, verified: true, memberCount: 5, connections: [] }
]

// Complex relationship network
const extendedConnections: Connection[] = [
  // Primary cluster (Mumbai hub)
  { id: 'conn_01', fromFamilyId: 'fam_01', toFamilyId: 'fam_02', relationshipType: 'blood', specificRelation: 'cousins', strength: 0.9, verified: true, establishedDate: '2015-06-20' },
  { id: 'conn_02', fromFamilyId: 'fam_02', toFamilyId: 'fam_03', relationshipType: 'marriage', specificRelation: 'in-laws', strength: 0.85, verified: true, establishedDate: '2018-02-14' },
  { id: 'conn_03', fromFamilyId: 'fam_01', toFamilyId: 'fam_11', relationshipType: 'blood', specificRelation: 'uncle', strength: 0.8, verified: true, establishedDate: '2010-01-01' },
  
  // Delhi cluster
  { id: 'conn_04', fromFamilyId: 'fam_04', toFamilyId: 'fam_05', relationshipType: 'friendship', specificRelation: 'family_friends', strength: 0.7, verified: true, establishedDate: '2019-09-15' },
  { id: 'conn_05', fromFamilyId: 'fam_04', toFamilyId: 'fam_13', relationshipType: 'community', specificRelation: 'neighbors', strength: 0.6, verified: false, establishedDate: '2021-03-10' },
  
  // Bangalore cluster  
  { id: 'conn_06', fromFamilyId: 'fam_06', toFamilyId: 'fam_07', relationshipType: 'friendship', specificRelation: 'colleagues', strength: 0.75, verified: true, establishedDate: '2020-07-22' },
  
  // International connections
  { id: 'conn_07', fromFamilyId: 'fam_02', toFamilyId: 'fam_08', relationshipType: 'blood', specificRelation: 'brother', strength: 0.95, verified: true, establishedDate: '2016-11-30' },
  { id: 'conn_08', fromFamilyId: 'fam_03', toFamilyId: 'fam_09', relationshipType: 'blood', specificRelation: 'cousin', strength: 0.8, verified: true, establishedDate: '2017-05-18' },
  { id: 'conn_09', fromFamilyId: 'fam_01', toFamilyId: 'fam_10', relationshipType: 'marriage', specificRelation: 'daughter_married', strength: 0.9, verified: true, establishedDate: '2019-12-01' },
  
  // Cross-cluster connections
  { id: 'conn_10', fromFamilyId: 'fam_04', toFamilyId: 'fam_01', relationshipType: 'friendship', specificRelation: 'college_friends', strength: 0.65, verified: true, establishedDate: '2012-08-15' },
  { id: 'conn_11', fromFamilyId: 'fam_06', toFamilyId: 'fam_12', relationshipType: 'community', specificRelation: 'business_partners', strength: 0.7, verified: true, establishedDate: '2021-01-20' },
  { id: 'conn_12', fromFamilyId: 'fam_14', toFamilyId: 'fam_03', relationshipType: 'blood', specificRelation: 'maternal_uncle', strength: 0.85, verified: true, establishedDate: '2008-01-01' },
  
  // Southern connections
  { id: 'conn_13', fromFamilyId: 'fam_15', toFamilyId: 'fam_07', relationshipType: 'marriage', specificRelation: 'inter_state_marriage', strength: 0.8, verified: true, establishedDate: '2020-11-25' },
  { id: 'conn_14', fromFamilyId: 'fam_15', toFamilyId: 'fam_06', relationshipType: 'friendship', specificRelation: 'childhood_friends', strength: 0.75, verified: true, establishedDate: '2018-04-12' },
  
  // More cross connections
  { id: 'conn_15', fromFamilyId: 'fam_12', toFamilyId: 'fam_02', relationshipType: 'community', specificRelation: 'gujarati_association', strength: 0.6, verified: true, establishedDate: '2019-03-25' },
  { id: 'conn_16', fromFamilyId: 'fam_13', toFamilyId: 'fam_14', relationshipType: 'friendship', specificRelation: 'university_friends', strength: 0.65, verified: false, establishedDate: '2022-01-10' }
]

// Pre-calsculated deterministic node positions (SSR-safe)
const fixedNodePositions: Record<string, { x: number; y: number }> = {
  // Mumbai cluster (centerX - 200 = 200, centerY - 100 = 200)
  'fam_01': { x: 200, y: 120 },     // Sharma
  'fam_02': { x: 160, y: 200 },     // Patel  
  'fam_03': { x: 240, y: 200 },     // Singh
  'fam_11': { x: 200, y: 280 },     // Joshi
  
  // Delhi cluster (centerX + 200 = 600, centerY - 100 = 200)
  'fam_04': { x: 600, y: 120 },     // Gupta
  'fam_05': { x: 560, y: 200 },     // Agarwal
  'fam_13': { x: 640, y: 200 },     // Verma
  
  // Bangalore cluster (centerX = 400, centerY + 150 = 450)
  'fam_06': { x: 400, y: 370 },     // Kumar
  'fam_07': { x: 360, y: 450 },     // Reddy
  'fam_15': { x: 440, y: 450 },     // Nair
  
  // International cluster (centerX - 300 = 100, centerY + 100 = 400)
  'fam_08': { x: 100, y: 320 },     // Patel-USA
  'fam_09': { x: 60, y: 400 },      // Singh-Canada
  'fam_10': { x: 140, y: 400 },     // Sharma-UK
  
  // Others cluster (centerX + 300 = 700, centerY + 100 = 400)
  'fam_12': { x: 700, y: 320 },     // Mehta
  'fam_14': { x: 660, y: 400 },     // Chopra
}

// Simple deterministic positioning function
const getNodePositions = () => fixedNodePositions

interface EnhancedFamilyGraphProps {
  interactive?: boolean
  autoPlay?: boolean
  showStats?: boolean
  height?: number
}

export function EnhancedFamilyGraph({ 
  interactive = true, 
  autoPlay = true,
  showStats = true,
  height = 600 
}: EnhancedFamilyGraphProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedFamily, setSelectedFamily] = useState<FamilyNodeType | null>(null)
  const [connectionFilter, setConnectionFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [animationPlaying, setAnimationPlaying] = useState(autoPlay)
  const [connectionPhase, setConnectionPhase] = useState(0)
  const [hoveredFamily, setHoveredFamily] = useState<FamilyNodeType | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const nodePositions = getNodePositions()
  
  // Filter families and connections
  const filteredFamilies = extendedFamilies.filter(family =>
    family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredConnections = extendedConnections.filter(conn => {
    if (connectionFilter !== 'all' && conn.relationshipType !== connectionFilter) return false
    
    // Show connections for searched families
    if (searchTerm) {
      const fromFamily = extendedFamilies.find(f => f.id === conn.fromFamilyId)
      const toFamily = extendedFamilies.find(f => f.id === conn.toFamilyId)
      return (
        filteredFamilies.some(f => f.id === fromFamily?.id) &&
        filteredFamilies.some(f => f.id === toFamily?.id)
      )
    }
    
    return true
  })

  // Animated connection reveal
  useEffect(() => {
    if (!animationPlaying) return
    
    const timer = setInterval(() => {
      setConnectionPhase(prev => (prev + 1) % (filteredConnections.length + 1))
    }, 800)
    
    return () => clearInterval(timer)
  }, [animationPlaying, filteredConnections.length])

  const visibleConnections = animationPlaying 
    ? filteredConnections.slice(0, connectionPhase)
    : filteredConnections

  const getRelatedFamilies = (familyId: string) => {
    return extendedConnections
      .filter(conn => conn.fromFamilyId === familyId || conn.toFamilyId === familyId)
      .map(conn => conn.fromFamilyId === familyId ? conn.toFamilyId : conn.fromFamilyId)
  }

  const networkStats = {
    totalFamilies: filteredFamilies.length,
    totalConnections: filteredConnections.length,
    averageConnections: filteredConnections.length > 0 ? (filteredConnections.length * 2 / filteredFamilies.length).toFixed(1) : '0',
    verifiedPercentage: Math.round((filteredConnections.filter(c => c.verified).length / filteredConnections.length) * 100) || 0
  }

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex items-center justify-center" style={{ height }}>
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <div>Loading Family Network...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex items-center justify-center" style={{ height }}>
      {/* Floating Animation Control */}
      <motion.button
        className={`absolute top-6 right-6 z-20 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
          animationPlaying 
            ? 'bg-red-500/90 text-white hover:bg-red-600' 
            : 'bg-green-500/90 text-white hover:bg-green-600'
        }`}
        onClick={() => setAnimationPlaying(!animationPlaying)}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        {animationPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </motion.button>

      {/* Main Graph Visualization */}
      <div className="relative w-full h-full p-8">
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {/* Gradient definitions for connections */}
            <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#e11d48', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#be123c', stopOpacity: 0.6 }} />
            </linearGradient>
            <linearGradient id="marriageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 0.6 }} />
            </linearGradient>
            <linearGradient id="friendshipGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 0.6 }} />
            </linearGradient>
            <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>
          
          <Connections
            connections={visibleConnections}
            nodePositions={nodePositions}
            animated={true}
            interactive={false}
          />
        </svg>

        {/* Family Nodes */}
        <AnimatePresence>
          {filteredFamilies.map((family, index) => {
            const position = nodePositions[family.id]
            if (!position) return null
            
            const relatedFamilies = getRelatedFamilies(family.id)
            const isHighlighted = selectedFamily?.id === family.id || 
                                hoveredFamily?.id === family.id ||
                                (selectedFamily && relatedFamilies.includes(selectedFamily.id))

            return (
              <motion.div
                key={family.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: position.x,
                  top: position.y,
                  zIndex: isHighlighted ? 20 : 10
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHighlighted ? 1.2 : 1,
                  zIndex: isHighlighted ? 20 : 10
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  delay: animationPlaying ? index * 0.1 : 0,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  scale: { duration: 0.2 }
                }}
                layout
              >
                <FamilyNode
                  family={family}
                  size="md"
                  interactive={interactive}
                  selected={selectedFamily?.id === family.id}
                  onClick={setSelectedFamily}
                  onHover={setHoveredFamily}
                  animationDelay={0}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>


        {/* Connection Flow Animation */}
        {animationPlaying && visibleConnections.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {visibleConnections.slice(-3).map((connection, index) => {
              const startPos = nodePositions[connection.fromFamilyId]
              const endPos = nodePositions[connection.toFamilyId]
              if (!startPos || !endPos) return null
              
              return (
                <motion.circle
                  key={`flow-${connection.id}`}
                  r="4"
                  fill={connectionTypeColors[connection.relationshipType]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={`M ${startPos.x} ${startPos.y} Q ${(startPos.x + endPos.x) / 2} ${(startPos.y + endPos.y) / 2 - 50} ${endPos.x} ${endPos.y}`}
                  />
                </motion.circle>
              )
            })}
          </svg>
        )}
      </div>

      {/* Selected Family Details - Minimalist */}
      <AnimatePresence>
        {selectedFamily && (
          <motion.div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200 min-w-[300px]"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedFamily.trustScore > 8.5 ? '#10b981' : '#3b82f6'}, ${selectedFamily.trustScore > 8.5 ? '#065f46' : '#1e40af'})` 
                  }}
                >
                  {selectedFamily.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedFamily.name} Family</h3>
                  <p className="text-xs text-gray-500">{selectedFamily.location.city}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFamily(null)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-all hover:rotate-90"
              >
                ×
              </button>
            </div>
            
            <div className="flex justify-around text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{selectedFamily.memberCount}</div>
                <div className="text-xs text-gray-500">Members</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{selectedFamily.trustScore}</div>
                <div className="text-xs text-gray-500">Trust</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{getRelatedFamilies(selectedFamily.id).length}</div>
                <div className="text-xs text-gray-500">Links</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

const connectionTypeColors = {
  blood: '#e11d48',
  marriage: '#f59e0b',
  friendship: '#3b82f6',
  community: '#10b981'
}