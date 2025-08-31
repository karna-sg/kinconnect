'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamic import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-900">
      <div className="flex items-center gap-3 text-white">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
        <div>Loading Earth Visualization...</div>
      </div>
    </div>
  )
})

// Family connection data matching the airline routes format
const familyConnections = [
  // From Mumbai (central hub)
  { startLat: 19.0760, startLng: 72.8777, endLat: 28.6139, endLng: 77.2090, family: 'Mumbai → Delhi', color: '#ff6b35' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 51.5074, endLng: -0.1278, family: 'Mumbai → London', color: '#4fc3f7' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 40.7128, endLng: -74.0060, family: 'Mumbai → New York', color: '#81c784' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 25.2048, endLng: 55.2708, family: 'Mumbai → Dubai', color: '#ba68c8' },
  
  // From Delhi
  { startLat: 28.6139, startLng: 77.2090, endLat: 43.6532, endLng: -79.3832, family: 'Delhi → Toronto', color: '#ffd54f' },
  { startLat: 28.6139, startLng: 77.2090, endLat: 35.6762, endLng: 139.6503, family: 'Delhi → Tokyo', color: '#ff8a65' },
  
  // From London
  { startLat: 51.5074, startLng: -0.1278, endLat: 40.7128, endLng: -74.0060, family: 'London → New York', color: '#a5d6a7' },
  { startLat: 51.5074, startLng: -0.1278, endLat: -33.8688, endLng: 151.2093, family: 'London → Sydney', color: '#ffab91' },
  
  // From New York  
  { startLat: 40.7128, startLng: -74.0060, endLat: 43.6532, endLng: -79.3832, family: 'New York → Toronto', color: '#80cbc4' },
  { startLat: 40.7128, startLng: -74.0060, endLat: -33.8688, endLng: 151.2093, family: 'New York → Sydney', color: '#ce93d8' },
  
  // From Tokyo
  { startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, family: 'Tokyo → Sydney', color: '#f8bbd9' },
  
  // From Dubai (regional hub)
  { startLat: 25.2048, startLng: 55.2708, endLat: 51.5074, endLng: -0.1278, family: 'Dubai → London', color: '#b39ddb' },
]

// Family location points
const familyPoints = [
  { lat: 19.0760, lng: 72.8777, name: 'Sharma Family', city: 'Mumbai', country: 'India', members: 8, color: '#ff6b35' },
  { lat: 28.6139, lng: 77.2090, name: 'Singh Family', city: 'Delhi', country: 'India', members: 6, color: '#4fc3f7' },
  { lat: 51.5074, lng: -0.1278, name: 'Patel Family', city: 'London', country: 'UK', members: 4, color: '#81c784' },
  { lat: 40.7128, lng: -74.0060, name: 'Kumar Family', city: 'New York', country: 'USA', members: 5, color: '#ba68c8' },
  { lat: -33.8688, lng: 151.2093, name: 'Gupta Family', city: 'Sydney', country: 'Australia', members: 3, color: '#ffd54f' },
  { lat: 43.6532, lng: -79.3832, name: 'Chen Family', city: 'Toronto', country: 'Canada', members: 5, color: '#ff8a65' },
  { lat: 35.6762, lng: 139.6503, name: 'Tanaka Family', city: 'Tokyo', country: 'Japan', members: 4, color: '#a5d6a7' },
  { lat: 25.2048, lng: 55.2708, name: 'Agarwal Family', city: 'Dubai', country: 'UAE', members: 7, color: '#ffab91' },
]

interface ProfessionalEarthGlobeProps {
  height?: number
  width?: number
}

export function ProfessionalEarthGlobe({ 
  height = 500,
  width 
}: ProfessionalEarthGlobeProps) {
  const globeRef = useRef<any>()
  const [mounted, setMounted] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Removed the problematic useEffect that was causing control errors

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
          <div>Loading Earth Visualization...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative" style={{ height: `${height}px`, width: width || '100%' }}>
      <Globe
        ref={globeRef}
        height={height}
        width={width}
        backgroundColor="rgba(0,0,0,0)"
        
        // Earth appearance - night texture like the reference
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        
        // Atmosphere
        atmosphereColor="#4fc3f7"
        atmosphereAltitude={0.1}
        
        // Camera controls
        showGraticules={false}
        showAtmosphere={true}
        
        // Points (family locations)
        pointsData={familyPoints}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointAltitude={0}
        pointRadius={0.15}
        pointColor={d => d.color}
        pointResolution={8}
        
        // Arcs (family connections) - exactly like airline routes
        arcsData={familyConnections}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => d.color}
        arcAltitude={0.1}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashInitialGap={(d, i) => (i * 0.5) % 5}
        arcDashAnimateTime={4000}
        
        // Labels for family points
        labelsData={familyPoints}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => `${d.name} (${d.members})`}
        labelSize={0.8}
        labelColor={() => 'rgba(255, 255, 255, 0.9)'}
        labelResolution={3}
        labelAltitude={0.01}
        
        // Enable controls
        enablePointerInteraction={true}
        
        // Control settings
        onGlobeReady={() => {
          if (globeRef.current) {
            // Set initial camera position
            globeRef.current.pointOfView({
              lat: 20,
              lng: 0,
              altitude: 2.5
            }, 1000)
            setGlobeReady(true)
          }
        }}
      />
      
    </div>
  )
}