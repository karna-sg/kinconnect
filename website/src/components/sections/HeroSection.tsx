'use client'

import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button, CTAButton, SecondaryButton } from '@/components/ui/Button'
import { FamilyNode } from '@/components/ui/FamilyNode'
import { ConnectionLine } from '@/components/ui/ConnectionLine'
import { FamilyNode as FamilyNodeType, Connection } from '@/types'
import { Play, ArrowDown } from 'lucide-react'

// Sample family data for hero animation
const sampleFamilies: FamilyNodeType[] = [
  {
    id: 'fam_1',
    name: 'Sharma',
    surname: 'Sharma',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: [19.0760, 72.8777] },
    community: { religion: 'Hindu', language: ['Hindi', 'Marathi'] },
    trustScore: 8.5,
    verified: true,
    memberCount: 5,
    connections: []
  },
  {
    id: 'fam_2',
    name: 'Patel',
    surname: 'Patel',
    location: { city: 'Ahmedabad', state: 'Gujarat', country: 'India', coordinates: [23.0225, 72.5714] },
    community: { religion: 'Hindu', language: ['Gujarati', 'Hindi'] },
    trustScore: 9.2,
    verified: true,
    memberCount: 7,
    connections: []
  },
  {
    id: 'fam_3',
    name: 'Singh',
    surname: 'Singh',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090] },
    community: { religion: 'Sikh', language: ['Punjabi', 'Hindi'] },
    trustScore: 8.8,
    verified: true,
    memberCount: 6,
    connections: []
  },
  {
    id: 'fam_4',
    name: 'Kumar',
    surname: 'Kumar',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: [12.9716, 77.5946] },
    community: { religion: 'Hindu', language: ['Kannada', 'English'] },
    trustScore: 7.9,
    verified: false,
    memberCount: 4,
    connections: []
  }
]

const sampleConnections: Connection[] = [
  {
    id: 'conn_1',
    fromFamilyId: 'fam_1',
    toFamilyId: 'fam_2',
    relationshipType: 'blood',
    specificRelation: 'cousin',
    strength: 0.8,
    verified: true,
    establishedDate: '2020-01-15'
  },
  {
    id: 'conn_2',
    fromFamilyId: 'fam_2',
    toFamilyId: 'fam_3',
    relationshipType: 'friendship',
    specificRelation: 'family_friend',
    strength: 0.6,
    verified: true,
    establishedDate: '2021-05-20'
  },
  {
    id: 'conn_3',
    fromFamilyId: 'fam_1',
    toFamilyId: 'fam_4',
    relationshipType: 'community',
    specificRelation: 'same_community',
    strength: 0.5,
    verified: false,
    establishedDate: '2022-03-10'
  }
]

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const networkVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
      delayChildren: 0.5
    }
  }
}

// Fixed particle positions to avoid hydration mismatch
const particlePositions = [
  { left: 13.8946, top: 6.2485 },
  { left: 50.7513, top: 18.2723 },
  { left: 81.7891, top: 34.3028 },
  { left: 10.8548, top: 32.4155 },
  { left: 14.2064, top: 1.3197 },
  { left: 42.4352, top: 55.0442 },
  { left: 54.5722, top: 74.8901 },
  { left: 8.8941, top: 2.7453 },
  { left: 29.0522, top: 93.9344 },
  { left: 66.0650, top: 48.6665 },
  { left: 15.3711, top: 57.4936 },
  { left: 73.0968, top: 60.1230 },
  { left: 10.3382, top: 78.7568 },
  { left: 99.3134, top: 18.2371 },
  { left: 28.3282, top: 88.9685 },
  { left: 31.8169, top: 86.4313 },
  { left: 59.8447, top: 61.0457 },
  { left: 78.2634, top: 80.6272 },
  { left: 99.0828, top: 43.7001 },
  { left: 68.6956, top: 30.2130 }
]

export function HeroSection() {
  const [familyCount, setFamilyCount] = useState(0)
  const [showNetwork, setShowNetwork] = useState(false)
  const [mounted, setMounted] = useState(false)
  const controls = useAnimationControls()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animated counter effect
  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      setFamilyCount(prev => {
        if (prev < 10000) {
          return prev + 47 // Fixed increment instead of random
        }
        clearInterval(timer)
        return 10000
      })
    }, 100)

    return () => clearInterval(timer)
  }, [mounted])

  // Trigger network animation after text loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNetwork(true)
      controls.start('visible')
    }, 1500)

    return () => clearTimeout(timer)
  }, [controls])

  const nodePositions = {
    fam_1: { x: 200, y: 150 },
    fam_2: { x: 350, y: 100 },
    fam_3: { x: 500, y: 180 },
    fam_4: { x: 300, y: 250 }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 hero-gradient">
        <div className="absolute inset-0 bg-black/20" />
        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0">
            {particlePositions.map((position, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${position.left}%`,
                  top: `${position.top}%`,
                }}
                animate={{
                  y: [-20, 20],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + (i % 3), // Deterministic duration
                  repeat: Infinity,
                  delay: i * 0.1, // Deterministic delay
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Brand */}
            <motion.div
              variants={textVariants}
              className="flex items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🌐</span>
              </div>
              <h1 className="text-3xl font-bold text-white">KinConnect</h1>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={textVariants} className="mb-6">
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Your Family Network.
                <br />
                <span className="gradient-text bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Reimagined.
                </span>
              </h2>
              <p className="text-xl text-white/90 italic font-light">
                "Where every family connection tells a story"
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={textVariants}
              className="text-xl text-white/80 mb-8 leading-relaxed"
            >
              <span className="font-semibold text-white">DISCOVER. CONNECT. STRENGTHEN.</span>
              <br />
              Your Extended Family Network
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={textVariants}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <CTAButton
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                icon={<span>🚀</span>}
              >
                Start Free
              </CTAButton>
              <SecondaryButton
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                icon={<Play className="w-5 h-5" />}
              >
                Watch Demo
              </SecondaryButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={textVariants}
              className="flex flex-col sm:flex-row items-center gap-4 text-sm text-white/70"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                100% Free to Start
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                No Credit Card
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                2-Min Setup
              </div>
            </motion.div>

            {/* Live Counter */}
            <motion.div
              variants={textVariants}
              className="mt-8 p-4 glass-effect rounded-lg"
            >
              <div className="text-white/80 text-sm mb-1">Connecting families worldwide</div>
              <div className="text-2xl font-bold text-white">
                {familyCount.toLocaleString()}+ families
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Network */}
          <motion.div
            variants={networkVariants}
            initial="hidden"
            animate={controls}
            className="relative h-96 lg:h-[500px]"
          >
            <div className="relative w-full h-full">
              {/* Network Background */}
              <div className="absolute inset-0 glass-effect rounded-2xl" />
              
              {showNetwork && (
                <svg className="absolute inset-0 w-full h-full">
                  {/* Connection Lines */}
                  {sampleConnections.map((connection, index) => {
                    const startPos = nodePositions[connection.fromFamilyId]
                    const endPos = nodePositions[connection.toFamilyId]
                    
                    if (!startPos || !endPos) return null
                    
                    return (
                      <motion.g
                        key={connection.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.3 + 1 }}
                      >
                        <ConnectionLine
                          connection={connection}
                          startPosition={startPos}
                          endPosition={endPos}
                          animated={true}
                        />
                      </motion.g>
                    )
                  })}
                </svg>
              )}

              {/* Family Nodes */}
              {showNetwork && sampleFamilies.map((family, index) => {
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
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.2 + 0.5,
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    <FamilyNode
                      family={family}
                      size="lg"
                      interactive={true}
                      animationDelay={0}
                    />
                  </motion.div>
                )
              })}

              {/* Interaction Hints */}
              <motion.div
                className="absolute bottom-4 right-4 text-white/60 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                Click any family to explore connections →
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center text-white/70 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => {
              document.getElementById('problem-solution')?.scrollIntoView({ 
                behavior: 'smooth' 
              })
            }}
          >
            <span className="text-sm mb-2">Discover More</span>
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}