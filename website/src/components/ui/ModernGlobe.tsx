'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Html } from '@react-three/drei'
import { Vector3 } from 'three'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Realistic family data points with relationship types
const familyPoints = [
  { id: 'mumbai', name: 'Sharma Family', lat: 19.0760, lng: 72.8777, members: 8, color: '#e11d48', trustScore: 9.2, relationshipType: 'core' },
  { id: 'delhi', name: 'Singh Family', lat: 28.6139, lng: 77.2090, members: 6, color: '#3b82f6', trustScore: 8.8, relationshipType: 'blood' },
  { id: 'london', name: 'Patel Family', lat: 51.5074, lng: -0.1278, members: 4, color: '#f59e0b', trustScore: 8.5, relationshipType: 'marriage' },
  { id: 'newyork', name: 'Kumar Family', lat: 40.7128, lng: -74.0060, members: 5, color: '#10b981', trustScore: 8.7, relationshipType: 'community' },
  { id: 'sydney', name: 'Gupta Family', lat: -33.8688, lng: 151.2093, members: 3, color: '#8b5cf6', trustScore: 8.1, relationshipType: 'friendship' },
  { id: 'toronto', name: 'Chen Family', lat: 43.6532, lng: -79.3832, members: 5, color: '#06b6d4', trustScore: 8.6, relationshipType: 'marriage' },
  { id: 'tokyo', name: 'Tanaka Family', lat: 35.6762, lng: 139.6503, members: 4, color: '#f97316', trustScore: 8.3, relationshipType: 'friendship' },
  { id: 'dubai', name: 'Agarwal Family', lat: 25.2048, lng: 55.2708, members: 7, color: '#ef4444', trustScore: 9.0, relationshipType: 'blood' }
]

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat: number, lng: number, radius = 1): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  
  return new Vector3(x, y, z)
}

// Realistic Earth with proper geography like Google Earth
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  // Create Earth texture using canvas for realistic landmasses
  const createEarthTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    
    // Ocean background with gradient
    const oceanGradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1024)
    oceanGradient.addColorStop(0, '#1e40af') // Lighter center
    oceanGradient.addColorStop(1, '#0f172a') // Darker edges
    ctx.fillStyle = oceanGradient
    ctx.fillRect(0, 0, 2048, 1024)
    
    // Add realistic continent shapes
    ctx.fillStyle = '#15803d' // Forest green
    
    // North America (more realistic shape)
    ctx.beginPath()
    ctx.moveTo(300, 200)
    ctx.bezierCurveTo(200, 180, 150, 250, 180, 320)
    ctx.bezierCurveTo(220, 380, 280, 360, 350, 340)
    ctx.bezierCurveTo(400, 320, 420, 260, 380, 200)
    ctx.bezierCurveTo(360, 180, 330, 190, 300, 200)
    ctx.fill()
    
    // South America
    ctx.beginPath()
    ctx.moveTo(400, 400)
    ctx.bezierCurveTo(360, 380, 340, 450, 360, 520)
    ctx.bezierCurveTo(380, 600, 420, 650, 450, 620)
    ctx.bezierCurveTo(480, 590, 470, 520, 450, 450)
    ctx.bezierCurveTo(440, 420, 420, 400, 400, 400)
    ctx.fill()
    
    // Africa
    ctx.beginPath()
    ctx.moveTo(950, 350)
    ctx.bezierCurveTo(920, 320, 900, 380, 920, 450)
    ctx.bezierCurveTo(940, 520, 980, 580, 1020, 550)
    ctx.bezierCurveTo(1050, 520, 1040, 450, 1020, 380)
    ctx.bezierCurveTo(1000, 340, 970, 340, 950, 350)
    ctx.fill()
    
    // Europe
    ctx.beginPath()
    ctx.moveTo(950, 250)
    ctx.bezierCurveTo(930, 230, 920, 260, 940, 290)
    ctx.bezierCurveTo(960, 310, 990, 300, 1010, 280)
    ctx.bezierCurveTo(1020, 260, 1000, 240, 980, 245)
    ctx.bezierCurveTo(965, 247, 955, 248, 950, 250)
    ctx.fill()
    
    // Asia
    ctx.beginPath()
    ctx.moveTo(1200, 200)
    ctx.bezierCurveTo(1100, 180, 1080, 250, 1120, 320)
    ctx.bezierCurveTo(1160, 380, 1240, 360, 1320, 340)
    ctx.bezierCurveTo(1400, 320, 1420, 260, 1380, 200)
    ctx.bezierCurveTo(1340, 160, 1260, 170, 1200, 200)
    ctx.fill()
    
    // Australia
    ctx.beginPath()
    ctx.ellipse(1500, 680, 90, 50, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Add islands and details
    ctx.fillStyle = '#22c55e' // Lighter green for variety
    
    // Greenland
    ctx.beginPath()
    ctx.ellipse(700, 150, 40, 60, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Madagascar
    ctx.beginPath()
    ctx.ellipse(1100, 550, 15, 40, 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Japan
    ctx.beginPath()
    ctx.ellipse(1450, 280, 20, 30, 0.5, 0, Math.PI * 2)
    ctx.fill()
    
    // Add mountain ranges (darker green)
    ctx.fillStyle = '#166534'
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      const x = Math.random() * 2048
      const y = Math.random() * 1024
      ctx.ellipse(x, y, Math.random() * 30 + 10, Math.random() * 15 + 5, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  // Create realistic cloud texture
  const createCloudTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Clear background
    ctx.clearRect(0, 0, 1024, 512)
    
    // Create realistic cloud formations
    ctx.globalAlpha = 0.8
    
    // Large cloud systems
    const cloudSystems = [
      { x: 200, y: 150, size: 80 }, // North Atlantic
      { x: 600, y: 200, size: 60 }, // Europe
      { x: 300, y: 400, size: 70 }, // Amazon
      { x: 800, y: 300, size: 50 }, // Asia monsoon
      { x: 150, y: 80, size: 40 },  // Arctic
    ]
    
    cloudSystems.forEach(system => {
      const gradient = ctx.createRadialGradient(system.x, system.y, 0, system.x, system.y, system.size)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(system.x, system.y, system.size, system.size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Smaller scattered clouds
    ctx.globalAlpha = 0.6
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 512
      const size = Math.random() * 25 + 10
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.beginPath()
      ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  // Create night lights texture for cities
  const createNightLightsTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    
    // Clear background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(0, 0, 2048, 1024)
    
    // Major city lights
    const cities = [
      { x: 350, y: 300, intensity: 0.9 }, // New York
      { x: 250, y: 250, intensity: 0.7 }, // Los Angeles
      { x: 950, y: 300, intensity: 0.8 }, // London
      { x: 1200, y: 250, intensity: 0.9 }, // Tokyo
      { x: 1300, y: 350, intensity: 0.8 }, // Shanghai
      { x: 1000, y: 400, intensity: 0.7 }, // Lagos
      { x: 400, y: 450, intensity: 0.6 }, // São Paulo
      { x: 1150, y: 400, intensity: 0.8 }, // Mumbai
    ]
    
    cities.forEach(city => {
      const gradient = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, 15)
      gradient.addColorStop(0, `rgba(255, 220, 150, ${city.intensity})`)
      gradient.addColorStop(0.5, `rgba(255, 180, 100, ${city.intensity * 0.6})`)
      gradient.addColorStop(1, 'rgba(255, 150, 50, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(city.x, city.y, 15, 10, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)
  const [cloudTexture, setCloudTexture] = useState<THREE.Texture | null>(null)
  const [nightTexture, setNightTexture] = useState<THREE.Texture | null>(null)
  
  useEffect(() => {
    const earth = createEarthTexture()
    const clouds = createCloudTexture()
    const night = createNightLightsTexture()
    
    setEarthTexture(earth)
    setCloudTexture(clouds)
    setNightTexture(night)
    
    return () => {
      earth.dispose()
      clouds.dispose()
      night.dispose()
    }
  }, [])
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.003 // Realistic rotation speed
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.001 // Slower cloud movement
    }
    if (atmosphereRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.3) * 0.001 + 1.025
      atmosphereRef.current.scale.setScalar(pulse)
    }
  })

  if (!earthTexture || !cloudTexture || !nightTexture) {
    return (
      <Sphere args={[1, 64, 32]}>
        <meshBasicMaterial color="#1e40af" />
      </Sphere>
    )
  }

  return (
    <group>
      {/* Main Earth sphere with realistic day texture */}
      <Sphere ref={earthRef} args={[1, 128, 64]}>
        <meshLambertMaterial
          map={earthTexture}
        />
      </Sphere>
      
      {/* Night side city lights - appears on shadow side */}
      <Sphere args={[1.0005, 128, 64]}>
        <meshBasicMaterial
          map={nightTexture}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Cloud layer with realistic formations */}
      <Sphere ref={cloudsRef} args={[1.008, 64, 32]}>
        <meshBasicMaterial
          map={cloudTexture}
          transparent
          opacity={0.6}
          alphaTest={0.1}
        />
      </Sphere>
      
      {/* Atmosphere layers for realism */}
      <Sphere ref={atmosphereRef} args={[1.025, 32, 16]}>
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer atmosphere rim */}
      <Sphere args={[1.04, 16, 16]}>
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

// Flowing particle component for connection animation
function FlowingParticle({ curve, color, speed = 1, delay = 0 }: { 
  curve: THREE.QuadraticBezierCurve3
  color: string
  speed?: number
  delay?: number 
}) {
  const particleRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (particleRef.current && curve) {
      try {
        const time = (state.clock.elapsedTime * speed + delay) % 4
        const t = (time / 4) % 1
        const point = curve.getPoint(t)
        particleRef.current.position.copy(point)
        
        // Fade in/out effect
        const opacity = Math.sin(t * Math.PI) * 0.6 + 0.4
        const material = particleRef.current.material as THREE.MeshBasicMaterial
        if (material && material.opacity !== undefined) {
          material.opacity = opacity
        }
      } catch (error) {
        // Silently handle any curve calculation errors
      }
    }
  })
  
  return (
    <Sphere ref={particleRef} args={[0.008, 8, 8]}>
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.8} 
      />
    </Sphere>
  )
}

// Enhanced family marker with trust scores and relationship indicators
function FamilyMarker({ point }: { point: typeof familyPoints[0] }) {
  const markerRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  const position = latLngToVector3(point.lat, point.lng, 1.02)
  
  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.lookAt(0, 0, 0)
      markerRef.current.rotateY(Math.PI)
    }
    
    // Pulsing effect based on trust score
    if (pulseRef.current) {
      const pulseSpeed = point.trustScore / 10 // Higher trust = faster pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed * 2) * 0.2
      pulseRef.current.scale.setScalar(scale)
    }
  })

  // Size based on member count and trust score
  const baseSize = 0.02 + (point.members / 100)
  const trustMultiplier = point.trustScore / 10
  const markerSize = baseSize * trustMultiplier

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Pulsing trust indicator */}
      <Sphere ref={pulseRef} args={[markerSize * 2, 16, 16]}>
        <meshBasicMaterial 
          color={point.color} 
          transparent 
          opacity={0.15}
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
      
      {/* Glowing ring */}
      <Sphere args={[markerSize * 1.5, 16, 16]}>
        <meshBasicMaterial 
          color={point.color} 
          transparent 
          opacity={0.3}
        />
      </Sphere>
      
      {/* Relationship type indicator */}
      <Sphere args={[markerSize * 0.5, 8, 8]} position={[0, 0, markerSize * 1.2]}>
        <meshBasicMaterial 
          color={connectionColors[point.relationshipType as keyof typeof connectionColors] || '#ffffff'}
        />
      </Sphere>
      
      {hovered && (
        <Html>
          <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-4 rounded-xl text-sm whitespace-nowrap pointer-events-none transform -translate-x-1/2 -translate-y-16 shadow-xl border border-gray-200">
            <div className="font-bold text-lg mb-2">{point.name}</div>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Members:</span>
                <span className="font-semibold">{point.members}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Trust Score:</span>
                <span className="font-semibold text-green-600">{point.trustScore}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Relation:</span>
                <span className="font-semibold capitalize text-blue-600">{point.relationshipType}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Realistic family connections with different relationship types
const familyConnections = [
  { from: 0, to: 1, type: 'blood', strength: 0.95, relation: 'siblings' },
  { from: 0, to: 2, type: 'marriage', strength: 0.87, relation: 'daughter_married' },
  { from: 0, to: 7, type: 'blood', strength: 0.82, relation: 'cousins' },
  { from: 1, to: 3, type: 'friendship', strength: 0.65, relation: 'family_friends' },
  { from: 2, to: 5, type: 'community', strength: 0.58, relation: 'cultural_group' },
  { from: 3, to: 4, type: 'friendship', strength: 0.72, relation: 'colleagues' },
  { from: 4, to: 6, type: 'marriage', strength: 0.89, relation: 'son_married' },
  { from: 5, to: 1, type: 'blood', strength: 0.78, relation: 'distant_relatives' },
  { from: 6, to: 7, type: 'community', strength: 0.61, relation: 'business_partners' }
]

// Connection line colors based on relationship type
const connectionColors = {
  blood: '#e11d48',
  marriage: '#f59e0b', 
  friendship: '#3b82f6',
  community: '#10b981'
}

// Enhanced connection lines with realistic family relationships
function ConnectionLines() {
  const [animationPhase, setAnimationPhase] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100)
    }, 150)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {familyConnections.map((connection, index) => {
        const startFamily = familyPoints[connection.from]
        const endFamily = familyPoints[connection.to]
        const startPos = latLngToVector3(startFamily.lat, startFamily.lng, 1.01)
        const endPos = latLngToVector3(endFamily.lat, endFamily.lng, 1.01)
        
        // Create more realistic curved path based on distance
        const distance = startPos.distanceTo(endPos)
        const heightFactor = Math.min(distance * 0.8, 0.6) // Adjust curve height based on distance
        
        const curve = new THREE.QuadraticBezierCurve3(
          startPos,
          startPos.clone().lerp(endPos, 0.5).multiplyScalar(1 + heightFactor),
          endPos
        )
        
        const points = curve.getPoints(60)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        // Calculate opacity based on relationship strength and animation
        const baseOpacity = connection.strength * 0.7
        const animatedOpacity = baseOpacity + (Math.sin(animationPhase * 0.1 + index) * 0.2)
        
        return (
          <group key={index}>
            {/* Main connection line */}
            <line geometry={geometry}>
              <lineBasicMaterial 
                color={connectionColors[connection.type]} 
                transparent 
                opacity={Math.max(0.3, animatedOpacity)}
              />
            </line>
            
            {/* Flowing particles along the connection */}
            {index < 4 && ( // Only show particles for first few connections to avoid clutter
              <FlowingParticle 
                curve={curve} 
                color={connectionColors[connection.type]}
                speed={0.8 + connection.strength * 0.4}
                delay={index * 0.5}
              />
            )}
          </group>
        )
      })}
    </>
  )
}

// Main globe scene with realistic lighting like Google Earth
function GlobeScene() {
  return (
    <>
      {/* Realistic Earth lighting setup */}
      <ambientLight intensity={0.3} color="#404040" />
      
      {/* Sun-like directional light */}
      <directionalLight 
        position={[3, 2, 5]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      
      {/* Subtle fill light to prevent pure black shadows */}
      <directionalLight 
        position={[-2, -1, -3]} 
        intensity={0.3} 
        color="#1e3a8a"
      />
      
      {/* Space ambient light */}
      <pointLight position={[0, 0, 0]} intensity={0.1} color="#000033" />
      
      {/* Earth */}
      <Earth />
      
      {/* Family markers */}
      {familyPoints.map((point) => (
        <FamilyMarker key={point.id} point={point} />
      ))}
      
      {/* Connection lines */}
      <ConnectionLines />
      
      {/* Enhanced controls for better interaction */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.3}
        minDistance={1.8}
        maxDistance={5}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  )
}

// Loading fallback
function GlobeLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <motion.div
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

interface ModernGlobeProps {
  height?: number
  autoRotate?: boolean
  interactive?: boolean
}

export function ModernGlobe({ 
  height = 500, 
  autoRotate = true, 
  interactive = true 
}: ModernGlobeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <GlobeLoader />
  }

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <Canvas
        camera={{ 
          position: [2.5, 1.2, 2.8], 
          fov: 45,
          near: 0.1,
          far: 100 
        }}
        className="Globe js-globe Globe--isAngled"
        style={{ 
          background: 'radial-gradient(ellipse at center, #000428 0%, #004e92 100%)'
        }}
      >
        <Suspense fallback={null}>
          <GlobeScene />
        </Suspense>
      </Canvas>
      
      {/* Enhanced family network stats */}
      <motion.div
        className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm text-white rounded-xl p-4 min-w-[180px]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Family Networks</span>
            <span className="text-lg font-bold">{familyPoints.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Total Members</span>
            <span className="text-sm font-semibold">{familyPoints.reduce((sum, family) => sum + family.members, 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Connections</span>
            <span className="text-sm font-semibold">{familyConnections.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Avg Trust</span>
            <span className="text-sm font-semibold text-green-300">{(familyPoints.reduce((sum, family) => sum + family.trustScore, 0) / familyPoints.length).toFixed(1)}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Connection type legend */}
      <motion.div
        className="absolute bottom-4 right-4 bg-white/15 backdrop-blur-sm text-white rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="text-xs font-semibold mb-2 opacity-90">Connection Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-400 rounded"></div>
            <span className="text-xs opacity-80">Blood Relations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-400 rounded"></div>
            <span className="text-xs opacity-80">Marriage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-400 rounded"></div>
            <span className="text-xs opacity-80">Friendship</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-400 rounded"></div>
            <span className="text-xs opacity-80">Community</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}