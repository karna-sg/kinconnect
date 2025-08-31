'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { InnovativeFamilyNode } from '@/components/ui/InnovativeFamilyNode'
import { InnovativeConnections } from '@/components/ui/InnovativeConnections'
import { FamilyNode as FamilyNodeType, Connection } from '@/types'
import { Heart, Users, Star, MapPin, Shield } from 'lucide-react'

// Extended family network with 20 families for rich visualization
const innovativeFamilies: FamilyNodeType[] = [
    // Core family cluster
    { id: 'fam_01', name: 'Sharma', surname: 'Sharma', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Hindu', language: ['Hindi', 'Marathi'] }, trustScore: 9.5, verified: true, memberCount: 12, connections: [] },
    { id: 'fam_02', name: 'Patel', surname: 'Patel', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Hindu', language: ['Gujarati', 'Hindi'] }, trustScore: 9.2, verified: true, memberCount: 8, connections: [] },
    { id: 'fam_03', name: 'Singh', surname: 'Singh', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Sikh', language: ['Punjabi', 'Hindi'] }, trustScore: 8.8, verified: true, memberCount: 6, connections: [] },
    { id: 'fam_04', name: 'Gupta', surname: 'Gupta', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Hindu', language: ['Hindi'] }, trustScore: 8.6, verified: true, memberCount: 7, connections: [] },

    // Delhi cluster
    { id: 'fam_05', name: 'Agarwal', surname: 'Agarwal', location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] }, community: { religion: 'Hindu', language: ['Hindi'] }, trustScore: 9.1, verified: true, memberCount: 9, connections: [] },
    { id: 'fam_06', name: 'Kumar', surname: 'Kumar', location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] }, community: { religion: 'Hindu', language: ['Hindi', 'Punjabi'] }, trustScore: 8.4, verified: true, memberCount: 5, connections: [] },
    { id: 'fam_07', name: 'Verma', surname: 'Verma', location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] }, community: { religion: 'Hindu', language: ['Hindi'] }, trustScore: 8.9, verified: true, memberCount: 6, connections: [] },

    // Bangalore cluster
    { id: 'fam_08', name: 'Rao', surname: 'Rao', location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] }, community: { religion: 'Hindu', language: ['Kannada', 'English'] }, trustScore: 8.7, verified: true, memberCount: 8, connections: [] },
    { id: 'fam_09', name: 'Iyer', surname: 'Iyer', location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] }, community: { religion: 'Hindu', language: ['Tamil', 'English'] }, trustScore: 9.0, verified: true, memberCount: 7, connections: [] },
    { id: 'fam_10', name: 'Menon', surname: 'Menon', location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] }, community: { religion: 'Hindu', language: ['Malayalam', 'English'] }, trustScore: 8.5, verified: true, memberCount: 6, connections: [] },

    // International families
    { id: 'fam_11', name: 'Johnson', surname: 'Johnson', location: { city: 'New York', state: 'NY', country: 'USA', coordinates: [40.7128, -74.0060] }, community: { religion: 'Christian', language: ['English'] }, trustScore: 8.3, verified: true, memberCount: 4, connections: [] },
    { id: 'fam_12', name: 'Smith', surname: 'Smith', location: { city: 'London', state: 'England', country: 'UK', coordinates: [51.5074, -0.1278] }, community: { religion: 'Christian', language: ['English'] }, trustScore: 8.1, verified: true, memberCount: 5, connections: [] },
    { id: 'fam_13', name: 'Chen', surname: 'Chen', location: { city: 'Toronto', state: 'Ontario', country: 'Canada', coordinates: [43.6532, -79.3832] }, community: { religion: 'Buddhist', language: ['Mandarin', 'English'] }, trustScore: 8.6, verified: true, memberCount: 6, connections: [] },

    // Extended family members
    { id: 'fam_14', name: 'Kapoor', surname: 'Kapoor', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] }, community: { religion: 'Hindu', language: ['Hindi', 'Punjabi'] }, trustScore: 8.8, verified: true, memberCount: 9, connections: [] },
    { id: 'fam_15', name: 'Malhotra', surname: 'Malhotra', location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] }, community: { religion: 'Hindu', language: ['Hindi', 'Punjabi'] }, trustScore: 8.9, verified: true, memberCount: 7, connections: [] },
    { id: 'fam_16', name: 'Reddy', surname: 'Reddy', location: { city: 'Hyderabad', state: 'Telangana', country: 'India', coordinates: [17.3850, 78.4867] }, community: { religion: 'Hindu', language: ['Telugu', 'Hindi'] }, trustScore: 8.4, verified: true, memberCount: 8, connections: [] },
    { id: 'fam_17', name: 'Nair', surname: 'Nair', location: { city: 'Kochi', state: 'Kerala', country: 'India', coordinates: [9.9312, 76.2673] }, community: { religion: 'Hindu', language: ['Malayalam', 'English'] }, trustScore: 8.7, verified: true, memberCount: 6, connections: [] },
    { id: 'fam_18', name: 'Das', surname: 'Das', location: { city: 'Kolkata', state: 'West Bengal', country: 'India', coordinates: [22.5726, 88.3639] }, community: { religion: 'Hindu', language: ['Bengali', 'Hindi'] }, trustScore: 8.5, verified: true, memberCount: 7, connections: [] },
    { id: 'fam_19', name: 'Joshi', surname: 'Joshi', location: { city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: [18.5204, 73.8567] }, community: { religion: 'Hindu', language: ['Marathi', 'Hindi'] }, trustScore: 8.6, verified: true, memberCount: 5, connections: [] },
    { id: 'fam_20', name: 'Chopra', surname: 'Chopra', location: { city: 'Chandigarh', state: 'Punjab', country: 'India', coordinates: [30.7333, 76.7794] }, community: { religion: 'Sikh', language: ['Punjabi', 'Hindi'] }, trustScore: 8.8, verified: true, memberCount: 8, connections: [] }
]

// Rich connection network with multiple relationship types
const innovativeConnections: Connection[] = [
    // Blood relationships (strongest connections)
    { id: 'conn_01', fromFamilyId: 'fam_01', toFamilyId: 'fam_02', relationshipType: 'blood', specificRelation: 'cousins', strength: 0.95, verified: true, establishedDate: '2015-06-20' },
    { id: 'conn_02', fromFamilyId: 'fam_02', toFamilyId: 'fam_03', relationshipType: 'blood', specificRelation: 'siblings', strength: 0.98, verified: true, establishedDate: '2010-01-01' },
    { id: 'conn_03', fromFamilyId: 'fam_01', toFamilyId: 'fam_14', relationshipType: 'blood', specificRelation: 'uncle', strength: 0.92, verified: true, establishedDate: '2012-03-15' },
    { id: 'conn_04', fromFamilyId: 'fam_05', toFamilyId: 'fam_06', relationshipType: 'blood', specificRelation: 'cousins', strength: 0.88, verified: true, establishedDate: '2018-09-10' },
    { id: 'conn_05', fromFamilyId: 'fam_08', toFamilyId: 'fam_09', relationshipType: 'blood', specificRelation: 'brothers', strength: 0.96, verified: true, establishedDate: '2008-12-25' },

    // Marriage relationships
    { id: 'conn_06', fromFamilyId: 'fam_03', toFamilyId: 'fam_04', relationshipType: 'marriage', specificRelation: 'in-laws', strength: 0.85, verified: true, establishedDate: '2019-02-14' },
    { id: 'conn_07', fromFamilyId: 'fam_07', toFamilyId: 'fam_15', relationshipType: 'marriage', specificRelation: 'daughter_married', strength: 0.90, verified: true, establishedDate: '2020-06-15' },
    { id: 'conn_08', fromFamilyId: 'fam_10', toFamilyId: 'fam_17', relationshipType: 'marriage', specificRelation: 'son_married', strength: 0.87, verified: true, establishedDate: '2021-03-20' },

    // Friendship relationships
    { id: 'conn_09', fromFamilyId: 'fam_01', toFamilyId: 'fam_05', relationshipType: 'friendship', specificRelation: 'family_friends', strength: 0.75, verified: true, establishedDate: '2017-11-08' },
    { id: 'conn_10', fromFamilyId: 'fam_02', toFamilyId: 'fam_08', relationshipType: 'friendship', specificRelation: 'colleagues', strength: 0.70, verified: true, establishedDate: '2019-04-12' },
    { id: 'conn_11', fromFamilyId: 'fam_06', toFamilyId: 'fam_11', relationshipType: 'friendship', specificRelation: 'business_partners', strength: 0.65, verified: true, establishedDate: '2020-01-30' },
    { id: 'conn_12', fromFamilyId: 'fam_09', toFamilyId: 'fam_13', relationshipType: 'friendship', specificRelation: 'neighbors', strength: 0.68, verified: true, establishedDate: '2021-07-22' },

    // Community relationships
    { id: 'conn_13', fromFamilyId: 'fam_04', toFamilyId: 'fam_16', relationshipType: 'community', specificRelation: 'temple_members', strength: 0.60, verified: true, establishedDate: '2016-08-15' },
    { id: 'conn_14', fromFamilyId: 'fam_07', toFamilyId: 'fam_18', relationshipType: 'community', specificRelation: 'cultural_group', strength: 0.55, verified: true, establishedDate: '2018-12-03' },
    { id: 'conn_15', fromFamilyId: 'fam_12', toFamilyId: 'fam_19', relationshipType: 'community', specificRelation: 'professional_network', strength: 0.58, verified: true, establishedDate: '2020-05-18' },

    // Cross-cluster connections
    { id: 'conn_16', fromFamilyId: 'fam_01', toFamilyId: 'fam_11', relationshipType: 'blood', specificRelation: 'son_abroad', strength: 0.82, verified: true, establishedDate: '2015-09-01' },
    { id: 'conn_17', fromFamilyId: 'fam_05', toFamilyId: 'fam_12', relationshipType: 'marriage', specificRelation: 'daughter_married_abroad', strength: 0.78, verified: true, establishedDate: '2018-06-10' },
    { id: 'conn_18', fromFamilyId: 'fam_08', toFamilyId: 'fam_13', relationshipType: 'friendship', specificRelation: 'study_abroad', strength: 0.72, verified: true, establishedDate: '2019-08-25' },
    { id: 'conn_19', fromFamilyId: 'fam_14', toFamilyId: 'fam_20', relationshipType: 'blood', specificRelation: 'cousins', strength: 0.85, verified: true, establishedDate: '2017-03-12' },
    { id: 'conn_20', fromFamilyId: 'fam_15', toFamilyId: 'fam_16', relationshipType: 'community', specificRelation: 'business_association', strength: 0.62, verified: true, establishedDate: '2020-11-05' },

    // Additional connections for rich network
    { id: 'conn_21', fromFamilyId: 'fam_03', toFamilyId: 'fam_17', relationshipType: 'friendship', specificRelation: 'college_friends', strength: 0.68, verified: true, establishedDate: '2016-02-14' },
    { id: 'conn_22', fromFamilyId: 'fam_06', toFamilyId: 'fam_19', relationshipType: 'community', specificRelation: 'social_club', strength: 0.54, verified: true, establishedDate: '2019-10-20' },
    { id: 'conn_23', fromFamilyId: 'fam_09', toFamilyId: 'fam_20', relationshipType: 'blood', specificRelation: 'distant_relatives', strength: 0.73, verified: true, establishedDate: '2018-07-08' },
    { id: 'conn_24', fromFamilyId: 'fam_10', toFamilyId: 'fam_18', relationshipType: 'friendship', specificRelation: 'travel_companions', strength: 0.66, verified: true, establishedDate: '2021-01-15' },
    { id: 'conn_25', fromFamilyId: 'fam_11', toFamilyId: 'fam_13', relationshipType: 'community', specificRelation: 'expatriate_group', strength: 0.59, verified: true, establishedDate: '2020-03-30' }
]

// Dynamic node positioning for organic layout
const getNodePositions = () => {
    const centerX = 400
    const centerY = 350

    return {
        // Core cluster (center)
        fam_01: { x: centerX, y: centerY },
        fam_02: { x: centerX + 120, y: centerY - 80 },
        fam_03: { x: centerX - 100, y: centerY - 60 },
        fam_04: { x: centerX + 80, y: centerY + 100 },

        // Delhi cluster (top right)
        fam_05: { x: centerX + 250, y: centerY - 150 },
        fam_06: { x: centerX + 320, y: centerY - 80 },
        fam_07: { x: centerX + 280, y: centerY + 20 },

        // Bangalore cluster (bottom right)
        fam_08: { x: centerX + 200, y: centerY + 200 },
        fam_09: { x: centerX + 280, y: centerY + 280 },
        fam_10: { x: centerX + 120, y: centerY + 280 },

        // International families (scattered)
        fam_11: { x: centerX - 300, y: centerY - 200 },
        fam_12: { x: centerX - 350, y: centerY + 50 },
        fam_13: { x: centerX - 250, y: centerY + 200 },

        // Extended families (organic spread)
        fam_14: { x: centerX - 80, y: centerY + 120 },
        fam_15: { x: centerX + 180, y: centerY - 20 },
        fam_16: { x: centerX - 150, y: centerY + 80 },
        fam_17: { x: centerX - 200, y: centerY - 100 },
        fam_18: { x: centerX + 50, y: centerY - 200 },
        fam_19: { x: centerX - 120, y: centerY - 180 },
        fam_20: { x: centerX + 350, y: centerY + 100 }
    }
}

interface InnovativeFamilyGraphProps {
    interactive?: boolean
    autoPlay?: boolean
    height?: number
}

export function InnovativeFamilyGraph({
    interactive = true,
    autoPlay = true,
    height = 700
}: InnovativeFamilyGraphProps) {
    const [mounted, setMounted] = useState(false)
    const [selectedFamily, setSelectedFamily] = useState<FamilyNodeType | null>(null)
    const [animationPlaying, setAnimationPlaying] = useState(autoPlay)
    const [connectionPhase, setConnectionPhase] = useState(0)
    const [hoveredFamily, setHoveredFamily] = useState<FamilyNodeType | null>(null)
    const [graphScale, setGraphScale] = useState(1)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const nodePositions = getNodePositions()

    // Animated connection reveal
    useEffect(() => {
        if (!animationPlaying) return

        const timer = setInterval(() => {
            setConnectionPhase(prev => (prev + 1) % (innovativeConnections.length + 1))
        }, 600)

        return () => clearInterval(timer)
    }, [animationPlaying])

    const visibleConnections = animationPlaying
        ? innovativeConnections.slice(0, connectionPhase)
        : innovativeConnections

    // Filter connections for selected family
    const selectedConnections = selectedFamily
        ? innovativeConnections.filter(conn =>
            conn.fromFamilyId === selectedFamily.id || conn.toFamilyId === selectedFamily.id
        )
        : []

    if (!mounted) return null

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Graph Container */}
            <div className="relative w-full h-full flex items-center justify-center">
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
                            <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 0.6 }} />
                        </linearGradient>
                        <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 0.6 }} />
                        </linearGradient>
                    </defs>

                    <InnovativeConnections
                        connections={selectedFamily ? selectedConnections : visibleConnections}
                        nodePositions={nodePositions}
                        animated={animationPlaying}
                        interactive={interactive}
                        selectedFamily={selectedFamily}
                    />
                </svg>

                {/* Family Nodes */}
                <AnimatePresence>
                    {innovativeFamilies.map((family, index) => {
                        const position = nodePositions[family.id]
                        if (!position) return null

                        const isConnected = selectedFamily
                            ? selectedConnections.some(conn =>
                                conn.fromFamilyId === family.id || conn.toFamilyId === family.id
                            )
                            : true

                        return (
                            <motion.div
                                key={family.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    left: position.x,
                                    top: position.y,
                                    opacity: selectedFamily ? (isConnected ? 1 : 0.3) : 1,
                                    scale: selectedFamily ? (isConnected ? 1 : 0.8) : 1,
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: selectedFamily ? (isConnected ? 1 : 0.3) : 1,
                                    scale: selectedFamily ? (isConnected ? 1 : 0.8) : 1,
                                }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.6,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                            >
                                <InnovativeFamilyNode
                                    family={family}
                                    interactive={interactive}
                                    selected={selectedFamily?.id === family.id}
                                    onClick={setSelectedFamily}
                                    onHover={setHoveredFamily}
                                    animationDelay={index * 0.1}
                                />
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {/* Connection Legend */}
                <motion.div
                    className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                >
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Neighborhood Paths</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                            <span className="text-xs text-gray-600">Main Streets (Blood)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Garden Paths (Marriage)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-xs text-gray-600">Sidewalks (Friendship)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Park Trails (Community)</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
} 