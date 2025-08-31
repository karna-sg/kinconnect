'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Html } from '@react-three/drei'
import { Vector3 } from 'three'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Real world coordinates for major cities/family locations
const worldFamilyPoints = [
  { id: 'mumbai', name: 'Sharma Family', lat: 19.0760, lng: 72.8777, members: 8, color: '#e11d48', country: 'India' },
  { id: 'delhi', name: 'Singh Family', lat: 28.6139, lng: 77.2090, members: 6, color: '#3b82f6', country: 'India' },
  { id: 'london', name: 'Patel Family', lat: 51.5074, lng: -0.1278, members: 4, color: '#f59e0b', country: 'UK' },
  { id: 'newyork', name: 'Kumar Family', lat: 40.7128, lng: -74.0060, members: 5, color: '#10b981', country: 'USA' },
  { id: 'sydney', name: 'Gupta Family', lat: -33.8688, lng: 151.2093, members: 3, color: '#8b5cf6', country: 'Australia' },
  { id: 'toronto', name: 'Chen Family', lat: 43.6532, lng: -79.3832, members: 5, color: '#06b6d4', country: 'Canada' },
  { id: 'tokyo', name: 'Tanaka Family', lat: 35.6762, lng: 139.6503, members: 4, color: '#f97316', country: 'Japan' },
  { id: 'dubai', name: 'Agarwal Family', lat: 25.2048, lng: 55.2708, members: 7, color: '#ef4444', country: 'UAE' },
]

// Convert lat/lng to 3D coordinates (proper spherical projection)
function latLngToVector3(lat: number, lng: number, radius = 2): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  
  return new Vector3(x, y, z)
}

// Create realistic Earth texture with accurate country shapes
function createDetailedEarthTexture(): THREE.Texture {
  if (typeof window === 'undefined') {
    // Return empty texture for SSR
    return new THREE.Texture()
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = 4096
  canvas.height = 2048
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.Texture()
  }
  
  // Ocean base - realistic deep blue
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, 2048)
  oceanGradient.addColorStop(0, '#1e3a8a') // Arctic blue
  oceanGradient.addColorStop(0.5, '#1e40af') // Deep ocean
  oceanGradient.addColorStop(1, '#1e3a8a') // Antarctic blue
  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, 0, 4096, 2048)
  
  // Land color variations
  const continentColor = '#166534' // Forest green
  const desertColor = '#a3a3a3' // Desert tan
  const mountainColor = '#0f172a' // Dark mountain
  const plainColor = '#22c55e' // Light green
  
  // North America - realistic outline
  ctx.fillStyle = continentColor
  ctx.beginPath()
  ctx.moveTo(600, 400) // Alaska
  ctx.quadraticCurveTo(400, 350, 500, 500) // Canada
  ctx.quadraticCurveTo(600, 600, 750, 650) // US West
  ctx.quadraticCurveTo(900, 700, 1000, 650) // US East  
  ctx.quadraticCurveTo(950, 550, 850, 450) // Great Lakes
  ctx.quadraticCurveTo(750, 400, 600, 400) // Back to Alaska
  ctx.fill()
  
  // Mexico/Central America
  ctx.beginPath()
  ctx.moveTo(700, 750)
  ctx.quadraticCurveTo(750, 800, 800, 850)
  ctx.quadraticCurveTo(820, 900, 850, 920)
  ctx.quadraticCurveTo(800, 950, 750, 900)
  ctx.quadraticCurveTo(680, 850, 700, 750)
  ctx.fill()
  
  // South America - distinctive shape
  ctx.beginPath()
  ctx.moveTo(850, 950) // Venezuela
  ctx.quadraticCurveTo(900, 1000, 950, 1100) // Brazil
  ctx.quadraticCurveTo(1000, 1300, 950, 1500) // Argentina
  ctx.quadraticCurveTo(900, 1600, 850, 1550) // Chile
  ctx.quadraticCurveTo(800, 1400, 820, 1200) // Peru/Bolivia
  ctx.quadraticCurveTo(830, 1000, 850, 950) // Back to Venezuela
  ctx.fill()
  
  // Europe - detailed
  ctx.fillStyle = plainColor
  ctx.beginPath()
  ctx.moveTo(1950, 450) // Scandinavia
  ctx.quadraticCurveTo(2000, 500, 2100, 550) // Russia
  ctx.quadraticCurveTo(2050, 600, 2000, 650) // Eastern Europe
  ctx.quadraticCurveTo(1950, 700, 1900, 650) // Western Europe
  ctx.quadraticCurveTo(1850, 600, 1900, 500) // UK/Ireland area
  ctx.quadraticCurveTo(1920, 450, 1950, 450)
  ctx.fill()
  
  // Africa - iconic shape
  ctx.fillStyle = continentColor
  ctx.beginPath()
  ctx.moveTo(2000, 750) // North Africa
  ctx.quadraticCurveTo(2100, 800, 2150, 950) // East Africa
  ctx.quadraticCurveTo(2200, 1100, 2150, 1300) // South East
  ctx.quadraticCurveTo(2100, 1400, 2000, 1350) // South Africa
  ctx.quadraticCurveTo(1900, 1300, 1850, 1150) // West Africa
  ctx.quadraticCurveTo(1800, 1000, 1850, 850) // Northwest
  ctx.quadraticCurveTo(1900, 750, 2000, 750)
  ctx.fill()
  
  // Asia - massive continent
  ctx.fillStyle = mountainColor
  ctx.beginPath()
  ctx.moveTo(2200, 400) // Siberia
  ctx.quadraticCurveTo(2800, 350, 3200, 450) // Far East Russia
  ctx.quadraticCurveTo(3400, 550, 3300, 700) // China
  ctx.quadraticCurveTo(3200, 850, 3000, 900) // Southeast Asia
  ctx.quadraticCurveTo(2800, 950, 2600, 850) // India
  ctx.quadraticCurveTo(2400, 750, 2300, 600) // Central Asia
  ctx.quadraticCurveTo(2200, 500, 2200, 400)
  ctx.fill()
  
  // India subcontinent - distinctive triangular shape
  ctx.fillStyle = plainColor
  ctx.beginPath()
  ctx.moveTo(2600, 750) // North India
  ctx.quadraticCurveTo(2700, 850, 2650, 950) // South India
  ctx.quadraticCurveTo(2600, 1000, 2550, 950) // West coast
  ctx.quadraticCurveTo(2500, 850, 2550, 750) // Northwest
  ctx.quadraticCurveTo(2575, 725, 2600, 750)
  ctx.fill()
  
  // Australia - island continent
  ctx.fillStyle = desertColor
  ctx.beginPath()
  ctx.ellipse(3300, 1450, 200, 120, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Major islands
  ctx.fillStyle = continentColor
  
  // Greenland
  ctx.beginPath()
  ctx.ellipse(1400, 250, 80, 120, 0.2, 0, Math.PI * 2)
  ctx.fill()
  
  // Madagascar
  ctx.beginPath()
  ctx.ellipse(2250, 1200, 20, 60, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Japan
  ctx.beginPath()
  ctx.ellipse(3450, 650, 30, 80, 0.3, 0, Math.PI * 2)
  ctx.fill()
  
  // New Zealand
  ctx.beginPath()
  ctx.ellipse(3600, 1600, 25, 50, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // UK/Ireland
  ctx.beginPath()
  ctx.ellipse(1900, 550, 40, 80, 0, 0, Math.PI * 2)
  ctx.fill()
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Realistic cloud texture
function createRealisticClouds(): THREE.Texture {
  if (typeof window === 'undefined') {
    return new THREE.Texture()
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.Texture()
  }
  
  // Clear background
  ctx.clearRect(0, 0, 2048, 1024)
  
  // Create realistic weather patterns
  const weatherSystems = [
    // Major storm systems and cloud formations
    { x: 400, y: 200, size: 150, intensity: 0.7 }, // North Atlantic
    { x: 1200, y: 300, size: 120, intensity: 0.6 }, // Europe
    { x: 500, y: 600, size: 200, intensity: 0.8 }, // Amazon rainforest
    { x: 1600, y: 400, size: 180, intensity: 0.7 }, // Asia monsoon
    { x: 1800, y: 600, size: 100, intensity: 0.5 }, // Indian Ocean
    { x: 200, y: 100, size: 80, intensity: 0.4 },   // Arctic
  ]
  
  weatherSystems.forEach(system => {
    const gradient = ctx.createRadialGradient(system.x, system.y, 0, system.x, system.y, system.size)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${system.intensity})`)
    gradient.addColorStop(0.3, `rgba(255, 255, 255, ${system.intensity * 0.7})`)
    gradient.addColorStop(0.6, `rgba(255, 255, 255, ${system.intensity * 0.3})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(system.x, system.y, system.size, system.size * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // Add scattered realistic cloud formations
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 2048
    const y = Math.random() * 1024
    const size = Math.random() * 40 + 15
    const intensity = Math.random() * 0.4 + 0.3
    
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`
    ctx.beginPath()
    ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Realistic Earth sphere component
function RealisticEarth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)
  const [cloudTexture, setCloudTexture] = useState<THREE.Texture | null>(null)
  
  useEffect(() => {
    const earth = createDetailedEarthTexture()
    const clouds = createRealisticClouds()
    
    setEarthTexture(earth)
    setCloudTexture(clouds)
    
    return () => {
      earth.dispose()
      clouds.dispose()
    }
  }, [])
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002 // Realistic Earth rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.001 // Slower cloud movement
    }
    if (atmosphereRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.01 + 2.05
      atmosphereRef.current.scale.setScalar(pulse)
    }
  })

  if (!earthTexture || !cloudTexture) {
    return (
      <Sphere args={[2, 64, 32]}>
        <meshBasicMaterial color="#1e40af" />
      </Sphere>
    )
  }

  return (
    <group>
      {/* Main realistic Earth */}
      <Sphere ref={earthRef} args={[2, 128, 64]}>
        <meshLambertMaterial
          map={earthTexture}
        />
      </Sphere>
      
      {/* Realistic cloud layer */}
      <Sphere ref={cloudsRef} args={[2.02, 64, 32]}>
        <meshBasicMaterial
          map={cloudTexture}
          transparent
          opacity={0.6}
          alphaTest={0.1}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[2.1, 32, 16]}>
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

// Family marker with realistic positioning
function WorldFamilyMarker({ point }: { point: typeof worldFamilyPoints[0] }) {
  const markerRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  const position = latLngToVector3(point.lat, point.lng, 2.05)
  
  useFrame(() => {
    if (markerRef.current) {
      markerRef.current.lookAt(0, 0, 0)
      markerRef.current.rotateY(Math.PI)
    }
  })

  const markerSize = 0.02 + (point.members / 200)

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Pulsing base */}
      <Sphere args={[markerSize * 2, 16, 16]}>
        <meshBasicMaterial 
          color={point.color} 
          transparent 
          opacity={0.2}
        />
      </Sphere>
      
      {/* Main marker */}
      <Sphere
        ref={markerRef}
        args={[markerSize, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial 
          color={point.color} 
        />
      </Sphere>
      
      {hovered && (
        <Html>
          <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-3 rounded-xl text-sm whitespace-nowrap pointer-events-none transform -translate-x-1/2 -translate-y-16 shadow-xl border border-gray-200">
            <div className="font-bold text-lg mb-1">{point.name}</div>
            <div className="text-gray-600">{point.country}</div>
            <div className="text-blue-600 font-semibold">{point.members} members</div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Connection lines between real world locations
function WorldConnections() {
  const connections = [
    [0, 1], // Mumbai-Delhi
    [0, 2], // Mumbai-London  
    [1, 3], // Delhi-NYC
    [2, 3], // London-NYC
    [3, 5], // NYC-Toronto
    [4, 6], // Sydney-Tokyo
    [5, 6], // Toronto-Tokyo
    [7, 0], // Dubai-Mumbai
  ]

  return (
    <>
      {connections.map(([start, end], index) => {
        const startPos = latLngToVector3(worldFamilyPoints[start].lat, worldFamilyPoints[start].lng, 2.03)
        const endPos = latLngToVector3(worldFamilyPoints[end].lat, worldFamilyPoints[end].lng, 2.03)
        
        // Create great circle path
        const distance = startPos.distanceTo(endPos)
        const heightFactor = Math.min(distance * 0.3, 0.5)
        
        const curve = new THREE.QuadraticBezierCurve3(
          startPos,
          startPos.clone().lerp(endPos, 0.5).multiplyScalar(1 + heightFactor),
          endPos
        )
        
        const points = curve.getPoints(50)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        return (
          <line key={index} geometry={geometry}>
            <lineBasicMaterial 
              color="#4fc3f7" 
              transparent 
              opacity={0.6}
            />
          </line>
        )
      })}
    </>
  )
}

// Main realistic Earth scene
function RealisticEarthScene() {
  return (
    <>
      {/* Realistic space lighting */}
      <ambientLight intensity={0.2} color="#404040" />
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={1.5} 
        color="#ffffff"
        castShadow 
      />
      <directionalLight 
        position={[-3, -2, -4]} 
        intensity={0.3} 
        color="#1e3a8a"
      />
      
      {/* Realistic Earth */}
      <RealisticEarth />
      
      {/* World family markers */}
      {worldFamilyPoints.map((point) => (
        <WorldFamilyMarker key={point.id} point={point} />
      ))}
      
      {/* World connections */}
      <WorldConnections />
      
      {/* Enhanced orbital controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  )
}

interface RealisticEarthGlobeProps {
  height?: number
  autoRotate?: boolean
  interactive?: boolean
}

export function RealisticEarthGlobe({ 
  height = 500, 
  autoRotate = true, 
  interactive = true 
}: RealisticEarthGlobeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <Canvas
        camera={{ 
          position: [4, 2, 4], 
          fov: 50,
          near: 0.1,
          far: 100 
        }}
        style={{ 
          background: 'radial-gradient(ellipse at center, #0f172a 0%, #000000 100%)'
        }}
      >
        <Suspense fallback={null}>
          <RealisticEarthScene />
        </Suspense>
      </Canvas>
      
      {/* World statistics */}
      <motion.div
        className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white rounded-xl p-4 min-w-[200px]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Global Families</span>
            <span className="text-lg font-bold">{worldFamilyPoints.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Total Members</span>
            <span className="text-sm font-semibold">{worldFamilyPoints.reduce((sum, family) => sum + family.members, 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Countries</span>
            <span className="text-sm font-semibold">{new Set(worldFamilyPoints.map(f => f.country)).size}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Connections</span>
            <span className="text-sm font-semibold">8</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}