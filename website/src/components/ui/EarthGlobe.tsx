'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface GlobalFamilyConnection {
  id: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  startCountry: string
  endCountry: string
  familyName: string
  connectionType: 'matrimony' | 'business' | 'reunion' | 'emergency' | 'education'
  strength: number
  verified: boolean
}

interface FamilyMarker {
  id: string
  lat: number
  lng: number
  familyName: string
  city: string
  country: string
  memberCount: number
  trustScore: number
  connectionCount: number
  color: string
}

// Global family connections data (inspired by real diaspora patterns)
const globalConnections: GlobalFamilyConnection[] = [
  // India to USA (Tech diaspora)
  {
    id: 'conn_1', startLat: 19.0760, startLng: 72.8777, endLat: 37.7749, endLng: -122.4194,
    startCountry: 'India', endCountry: 'USA', familyName: 'Patel Network',
    connectionType: 'business', strength: 0.9, verified: true
  },

  // India to UK (Historical connections)
  {
    id: 'conn_2', startLat: 28.6139, startLng: 77.2090, endLat: 51.5074, endLng: -0.1278,
    startCountry: 'India', endCountry: 'UK', familyName: 'Singh Diaspora',
    connectionType: 'reunion', strength: 0.8, verified: true
  },

  // India to Canada (Recent immigration)
  {
    id: 'conn_3', startLat: 12.9716, startLng: 77.5946, endLat: 43.6532, endLng: -79.3832,
    startCountry: 'India', endCountry: 'Canada', familyName: 'Kumar Families',
    connectionType: 'education', strength: 0.7, verified: true
  },

  // India to Australia (Growing diaspora)
  {
    id: 'conn_4', startLat: 22.5726, startLng: 88.3639, endLat: -33.8688, endLng: 151.2093,
    startCountry: 'India', endCountry: 'Australia', familyName: 'Sharma Network',
    connectionType: 'matrimony', strength: 0.85, verified: true
  },

  // USA to Canada (North American connections)
  {
    id: 'conn_5', startLat: 37.7749, startLng: -122.4194, endLat: 43.6532, endLng: -79.3832,
    startCountry: 'USA', endCountry: 'Canada', familyName: 'Inter-Continental Bonds',
    connectionType: 'business', strength: 0.6, verified: true
  },

  // UK to Australia (Commonwealth connections)
  {
    id: 'conn_6', startLat: 51.5074, startLng: -0.1278, endLat: -33.8688, endLng: 151.2093,
    startCountry: 'UK', endCountry: 'Australia', familyName: 'Global Gujarati Network',
    connectionType: 'reunion', strength: 0.75, verified: true
  },

  // Middle East connections (Dubai hub)
  {
    id: 'conn_7', startLat: 19.0760, startLng: 72.8777, endLat: 25.2048, endLng: 55.2708,
    startCountry: 'India', endCountry: 'UAE', familyName: 'Business Hub Network',
    connectionType: 'business', strength: 0.8, verified: true
  },

  // Singapore connections (Asian hub)
  {
    id: 'conn_8', startLat: 12.9716, startLng: 77.5946, endLat: 1.3521, endLng: 103.8198,
    startCountry: 'India', endCountry: 'Singapore', familyName: 'Tech Families',
    connectionType: 'business', strength: 0.85, verified: true
  },
]

// Family markers across the globe
const familyMarkers: FamilyMarker[] = [
  // India
  { id: 'fam_mumbai', lat: 19.0760, lng: 72.8777, familyName: 'Patel', city: 'Mumbai', country: 'India', memberCount: 12, trustScore: 9.2, connectionCount: 15, color: '#e11d48' },
  { id: 'fam_delhi', lat: 28.6139, lng: 77.2090, familyName: 'Singh', city: 'Delhi', country: 'India', memberCount: 8, trustScore: 8.8, connectionCount: 22, color: '#e11d48' },
  { id: 'fam_bangalore', lat: 12.9716, lng: 77.5946, familyName: 'Kumar', city: 'Bangalore', country: 'India', memberCount: 6, trustScore: 8.5, connectionCount: 18, color: '#e11d48' },
  { id: 'fam_kolkata', lat: 22.5726, lng: 88.3639, familyName: 'Sharma', city: 'Kolkata', country: 'India', memberCount: 10, trustScore: 9.0, connectionCount: 20, color: '#e11d48' },

  // USA
  { id: 'fam_sf', lat: 37.7749, lng: -122.4194, familyName: 'Patel-USA', city: 'San Francisco', country: 'USA', memberCount: 5, trustScore: 8.9, connectionCount: 12, color: '#3b82f6' },
  { id: 'fam_ny', lat: 40.7128, lng: -74.0060, familyName: 'Gupta-USA', city: 'New York', country: 'USA', memberCount: 7, trustScore: 8.7, connectionCount: 14, color: '#3b82f6' },

  // UK
  { id: 'fam_london', lat: 51.5074, lng: -0.1278, familyName: 'Singh-UK', city: 'London', country: 'UK', memberCount: 6, trustScore: 8.6, connectionCount: 16, color: '#10b981' },

  // Canada
  { id: 'fam_toronto', lat: 43.6532, lng: -79.3832, familyName: 'Kumar-Canada', city: 'Toronto', country: 'Canada', memberCount: 4, trustScore: 8.4, connectionCount: 10, color: '#f59e0b' },

  // Australia
  { id: 'fam_sydney', lat: -33.8688, lng: 151.2093, familyName: 'Sharma-AUS', city: 'Sydney', country: 'Australia', memberCount: 5, trustScore: 8.8, connectionCount: 11, color: '#8b5cf6' },

  // UAE
  { id: 'fam_dubai', lat: 25.2048, lng: 55.2708, familyName: 'Business Hub', city: 'Dubai', country: 'UAE', memberCount: 8, trustScore: 9.1, connectionCount: 25, color: '#f97316' },

  // Singapore
  { id: 'fam_singapore', lat: 1.3521, lng: 103.8198, familyName: 'Tech Hub', city: 'Singapore', country: 'Singapore', memberCount: 6, trustScore: 8.9, connectionCount: 18, color: '#06b6d4' }
]

const connectionTypeColors = {
  matrimony: '#e11d48',
  business: '#3b82f6',
  reunion: '#10b981',
  emergency: '#f59e0b',
  education: '#8b5cf6'
}

interface EarthGlobeProps {
  autoRotate?: boolean
  showConnections?: boolean
  interactive?: boolean
  height?: number
}

export function EarthGlobe({
  autoRotate = true,
  showConnections = true,
  interactive = true,
  height = 600
}: EarthGlobeProps) {
  const globeRef = useRef(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [selectedFamily, setSelectedFamily] = useState<FamilyMarker | null>(null)
  const [highlightedConnections, setHighlightedConnections] = useState<string[]>([])
  const [flowAnimationActive, setFlowAnimationActive] = useState(true)

  useEffect(() => {
    if (globeRef.current && globeReady) {
      // Set initial camera position to show beautiful Earth view
      (globeRef.current as any).pointOfView({ lat: 15, lng: 45, altitude: 3.8 })

      // Set camera controls for optimal family network viewing
      const controls = (globeRef.current as any).controls()
      controls.minDistance = 180
      controls.maxDistance = 500
      controls.enableZoom = true
      controls.enablePan = true
      controls.enableDamping = true
      controls.dampingFactor = 0.05

      // Auto-rotate for showcasing global family connections
      if (autoRotate) {
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.4
      }
    }
  }, [globeReady, autoRotate])

  const handleMarkerClick = (point: object) => {
    const marker = point as FamilyMarker
    setSelectedFamily(marker)

    // Highlight connections for this family
    const familyConnections = globalConnections
      .filter(conn =>
        (conn.startLat === marker.lat && conn.startLng === marker.lng) ||
        (conn.endLat === marker.lat && conn.endLng === marker.lng)
      )
      .map(conn => conn.id)

    setHighlightedConnections(familyConnections)

      // Focus on the selected marker
      (globeRef.current as any)?.pointOfView({
        lat: marker.lat,
        lng: marker.lng,
        altitude: 1.5
      }, 1000)
  }

  const getMarkerSize = (marker: FamilyMarker) => {
    return Math.max(0.1, marker.connectionCount * 0.02)
  }

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      {typeof window !== 'undefined' && (
        <Globe
          ref={globeRef}
          // High-quality Earth textures for realistic appearance
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          specularImageUrl="https://unpkg.com/three-globe/example/img/earth-water.png"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          backgroundColor="rgba(5, 8, 22, 0.8)"

          // Family markers - Enhanced visibility
          pointsData={familyMarkers}
          pointLat="lat"
          pointLng="lng"
          pointColor={(point: object) => (point as FamilyMarker).color}
          pointAltitude={0.05}
          pointRadius={0.8}
          pointResolution={12}
          onPointClick={interactive ? handleMarkerClick : undefined}
          pointLabel={(point: object) => {
            const marker = point as FamilyMarker
            return `
              <div class="bg-black/90 text-white p-3 rounded-lg shadow-xl max-w-xs">
                <div class="font-bold text-lg mb-2">${marker.familyName} Family</div>
                <div class="text-sm space-y-1">
                  <div>📍 ${marker.city}, ${marker.country}</div>
                  <div>👥 ${marker.memberCount} members</div>
                  <div>⭐ Trust Score: ${marker.trustScore}/10</div>
                  <div>🔗 ${marker.connectionCount} connections</div>
                </div>
              </div>
            `
          }}

          // Connection arcs - Enhanced family connections
          arcsData={showConnections ? globalConnections : []}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={(arc: object) => {
            const connection = arc as GlobalFamilyConnection
            return highlightedConnections.includes(connection.id)
              ? '#ffd700'
              : connection.connectionType === 'matrimony' ? '#ff6b9d'
                : connection.connectionType === 'business' ? '#4fc3f7'
                  : connection.connectionType === 'reunion' ? '#81c784'
                    : connection.connectionType === 'education' ? '#ba68c8'
                      : '#ff8a65'
          }}
          arcAltitude={0.25}
          arcStroke={1.2}
          arcDashLength={0.6}
          arcDashGap={0.1}
          arcDashAnimateTime={3000}
          arcLabel={(arc: object) => {
            const connection = arc as GlobalFamilyConnection
            return `
              <div class="bg-black/90 text-white p-3 rounded-lg shadow-xl">
                <div class="font-bold mb-2">${connection.familyName}</div>
                <div class="text-sm space-y-1">
                  <div>🔗 ${connection.startCountry} ↔ ${connection.endCountry}</div>
                  <div>📊 Connection Strength: ${(connection.strength * 100).toFixed(0)}%</div>
                  <div>✅ ${connection.verified ? 'Verified' : 'Pending'}</div>
                  <div class="capitalize">🎯 ${connection.connectionType} connection</div>
                </div>
              </div>
            `
          }}

          // Animated family pulse rings
          ringsData={flowAnimationActive ? familyMarkers : []}
          ringLat="lat"
          ringLng="lng"
          ringMaxRadius={1.5}
          ringPropagationSpeed={1.2}
          ringRepeatPeriod={4000}
          ringColor={(point: object) => `${(point as FamilyMarker).color}80`}

          // Enhanced visual effects - Realistic Earth atmosphere
          atmosphereColor="rgba(135, 206, 235, 0.4)"
          atmosphereAltitude={0.12}
          enablePointerInteraction={interactive}

          onGlobeReady={() => setGlobeReady(true)}
          width={height}
          height={height}
        />
      )}

      {/* Family Details Panel */}
      {selectedFamily && (
        <motion.div
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-200 max-w-sm"
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => setSelectedFamily(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500"
          >
            ×
          </button>

          <div className="text-center mb-4">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: selectedFamily.color }}
            >
              {selectedFamily.familyName.charAt(0)}
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {selectedFamily.familyName} Family
            </h3>
            <p className="text-sm text-gray-600">
              {selectedFamily.city}, {selectedFamily.country}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Members:</span>
              <span className="font-medium">{selectedFamily.memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trust Score:</span>
              <span className="font-medium text-green-600">{selectedFamily.trustScore}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connections:</span>
              <span className="font-medium text-blue-600">{selectedFamily.connectionCount}</span>
            </div>
          </div>

          <button className="w-full mt-4 btn-primary text-sm py-2">
            Connect with Family
          </button>
        </motion.div>
      )}

    </div>
  )
}

// Loading component for globe
export function GlobeLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <div className="ml-4">
        <div className="text-lg font-medium text-gray-700">Loading Global Family Network...</div>
        <div className="text-sm text-gray-500">Connecting families worldwide</div>
      </div>
    </div>
  )
}