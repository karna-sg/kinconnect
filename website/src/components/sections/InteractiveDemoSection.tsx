'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { FamilyNode } from '@/components/ui/FamilyNode'
import { Connections } from '@/components/ui/ConnectionLine'
import { FamilyNode as FamilyNodeType, Connection } from '@/types'
import { Play, Filter, Maximize2, Users, Star, MapPin } from 'lucide-react'

// Extended demo family network
const demoFamilies: FamilyNodeType[] = [
  {
    id: 'demo_1',
    name: 'Sharma',
    surname: 'Sharma',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] },
    community: { religion: 'Hindu', language: ['Hindi', 'Marathi'] },
    trustScore: 9.2,
    verified: true,
    memberCount: 6,
    connections: []
  },
  {
    id: 'demo_2',
    name: 'Patel',
    surname: 'Patel',
    location: { city: 'Ahmedabad', state: 'Gujarat', country: 'India', coordinates: [23.0225, 72.5714] },
    community: { religion: 'Hindu', language: ['Gujarati', 'Hindi'] },
    trustScore: 8.8,
    verified: true,
    memberCount: 8,
    connections: []
  },
  {
    id: 'demo_3',
    name: 'Singh',
    surname: 'Singh',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] },
    community: { religion: 'Sikh', language: ['Punjabi', 'Hindi'] },
    trustScore: 9.5,
    verified: true,
    memberCount: 5,
    connections: []
  },
  {
    id: 'demo_4',
    name: 'Kumar',
    surname: 'Kumar',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] },
    community: { religion: 'Hindu', language: ['Kannada', 'English'] },
    trustScore: 7.9,
    verified: false,
    memberCount: 4,
    connections: []
  },
  {
    id: 'demo_5',
    name: 'Gupta',
    surname: 'Gupta',
    location: { city: 'Kolkata', state: 'West Bengal', country: 'India', coordinates: [22.5726, 88.3639] },
    community: { religion: 'Hindu', language: ['Bengali', 'Hindi'] },
    trustScore: 8.3,
    verified: true,
    memberCount: 7,
    connections: []
  },
  {
    id: 'demo_6',
    name: 'Reddy',
    surname: 'Reddy',
    location: { city: 'Hyderabad', state: 'Telangana', country: 'India', coordinates: [17.3850, 78.4867] },
    community: { religion: 'Hindu', language: ['Telugu', 'English'] },
    trustScore: 8.6,
    verified: true,
    memberCount: 6,
    connections: []
  }
]

const demoConnections: Connection[] = [
  {
    id: 'demo_conn_1',
    fromFamilyId: 'demo_1',
    toFamilyId: 'demo_2',
    relationshipType: 'blood',
    specificRelation: 'cousin',
    strength: 0.9,
    verified: true,
    establishedDate: '2018-03-15'
  },
  {
    id: 'demo_conn_2',
    fromFamilyId: 'demo_2',
    toFamilyId: 'demo_3',
    relationshipType: 'marriage',
    specificRelation: 'in-law',
    strength: 0.8,
    verified: true,
    establishedDate: '2019-12-10'
  },
  {
    id: 'demo_conn_3',
    fromFamilyId: 'demo_1',
    toFamilyId: 'demo_5',
    relationshipType: 'friendship',
    specificRelation: 'family_friend',
    strength: 0.6,
    verified: true,
    establishedDate: '2020-07-22'
  },
  {
    id: 'demo_conn_4',
    fromFamilyId: 'demo_3',
    toFamilyId: 'demo_6',
    relationshipType: 'community',
    specificRelation: 'business_partner',
    strength: 0.7,
    verified: true,
    establishedDate: '2021-01-05'
  },
  {
    id: 'demo_conn_5',
    fromFamilyId: 'demo_4',
    toFamilyId: 'demo_5',
    relationshipType: 'friendship',
    specificRelation: 'college_friend',
    strength: 0.5,
    verified: false,
    establishedDate: '2022-09-18'
  }
]

const nodePositions = {
  demo_1: { x: 150, y: 120 },
  demo_2: { x: 350, y: 80 },
  demo_3: { x: 550, y: 140 },
  demo_4: { x: 200, y: 280 },
  demo_5: { x: 400, y: 260 },
  demo_6: { x: 500, y: 320 }
}

export function InteractiveDemoSection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.3 })
  const [selectedFamily, setSelectedFamily] = useState<FamilyNodeType | null>(null)
  const [connectionFilter, setConnectionFilter] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)

  const filteredConnections = demoConnections.filter(conn => 
    connectionFilter === 'all' || conn.relationshipType === connectionFilter
  )

  return (
    <section ref={elementRef} className="py-24 bg-gradient-to-b from-gray-50 to-white" id="interactive-demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See Your Family Network Come Alive
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore how KinConnect maps and visualizes family relationships. Click any family to see their connections.
          </p>
          
          {/* Demo Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              className="btn-primary text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetails(!showDetails)}
            >
              <Play className="w-4 h-4 mr-2" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </motion.button>
            
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={connectionFilter}
                onChange={(e) => setConnectionFilter(e.target.value)}
                className="text-sm border-none outline-none bg-transparent"
              >
                <option value="all">All Connections</option>
                <option value="blood">Blood Relations</option>
                <option value="marriage">Marriage</option>
                <option value="friendship">Friendship</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Interactive Network Visualization */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ height: '500px' }}
        >
          {/* Network Canvas */}
          <div className="relative w-full h-full p-8">
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <Connections
                connections={filteredConnections}
                nodePositions={nodePositions}
                animated={isVisible}
                interactive={false}
              />
            </svg>

            {/* Family Nodes */}
            {demoFamilies.map((family, index) => {
              const position = nodePositions[family.id]
              if (!position) return null

              return (
                <motion.div
                  key={family.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: position.x,
                    top: position.y
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <FamilyNode
                    family={family}
                    size="lg"
                    interactive={true}
                    selected={selectedFamily?.id === family.id}
                    onClick={setSelectedFamily}
                    animationDelay={0}
                  />
                </motion.div>
              )
            })}

            {/* Interactive Hint */}
            <motion.div
              className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded-lg border border-blue-200"
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.5 }}
            >
              Click any family to explore connections →
            </motion.div>

            {/* Legend */}
            <motion.div
              className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2 }}
            >
              <div className="text-xs font-medium text-gray-700 mb-2">Connection Types:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-red-500 rounded" />
                  Blood Relations
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-yellow-500 rounded" />
                  Marriage
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-blue-500 rounded" />
                  Friendship
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-green-500 rounded" />
                  Community
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Selected Family Details */}
        {selectedFamily && showDetails && (
          <motion.div
            className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Family Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {selectedFamily.name} Family
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {selectedFamily.location.city}, {selectedFamily.location.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {selectedFamily.memberCount} family members
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    Trust Score: {selectedFamily.trustScore}/10
                  </div>
                </div>
              </div>

              {/* Connections */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Connected Families
                </h4>
                <div className="space-y-2">
                  {filteredConnections
                    .filter(conn => 
                      conn.fromFamilyId === selectedFamily.id || 
                      conn.toFamilyId === selectedFamily.id
                    )
                    .map(conn => {
                      const connectedFamilyId = conn.fromFamilyId === selectedFamily.id 
                        ? conn.toFamilyId 
                        : conn.fromFamilyId
                      const connectedFamily = demoFamilies.find(f => f.id === connectedFamilyId)
                      
                      return (
                        <div key={conn.id} className="text-sm flex items-center justify-between">
                          <span>{connectedFamily?.surname} Family</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {conn.specificRelation}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Available Actions
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded border border-blue-200 transition-colors">
                    View Family Tree
                  </button>
                  <button className="w-full text-left text-sm bg-green-50 hover:bg-green-100 text-green-700 p-2 rounded border border-green-200 transition-colors">
                    Find Connections
                  </button>
                  <button className="w-full text-left text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 p-2 rounded border border-purple-200 transition-colors">
                    Send Introduction
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          <p className="text-gray-600 mb-6">
            This could be YOUR family network
          </p>
          <motion.button
            className="btn-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Build My Network →
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}