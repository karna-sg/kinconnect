'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState, useEffect } from 'react'
import { Users, MapPin, Clock, Heart, Zap, Shield, Network, Star, Play, Pause, RotateCcw } from 'lucide-react'

const problemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
}

const solutionVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Family Distance Crisis Timeline Data
const timelinePeriods = [
  {
    year: 1960,
    title: "1960s: All Together",
    description: "Extended families lived in the same village or neighborhood",
    familyPositions: [
      { id: 1, name: 'Grandparents', x: 45, y: 40, icon: '👴', color: '#8b5cf6' },
      { id: 2, name: 'Parents', x: 50, y: 45, icon: '👨', color: '#3b82f6' },
      { id: 3, name: 'Aunt & Uncle', x: 55, y: 40, icon: '👩', color: '#ef4444' },
      { id: 4, name: 'Cousins', x: 48, y: 50, icon: '🧑', color: '#f59e0b' },
      { id: 5, name: 'Children', x: 52, y: 50, icon: '👶', color: '#10b981' }
    ],
    connections: [
      { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }, { from: 3, to: 4 }
    ],
    story: "Sunday dinners brought everyone together. Stories passed down easily."
  },
  {
    year: 1990,
    title: "1990s: Starting to Spread",
    description: "College and career opportunities began separating families",
    familyPositions: [
      { id: 1, name: 'Grandparents', x: 30, y: 40, icon: '👴', color: '#8b5cf6' },
      { id: 2, name: 'Parents', x: 35, y: 45, icon: '👨', color: '#3b82f6' },
      { id: 3, name: 'Aunt & Uncle', x: 65, y: 35, icon: '👩', color: '#ef4444' },
      { id: 4, name: 'Cousins', x: 70, y: 60, icon: '🧑', color: '#f59e0b' },
      { id: 5, name: 'Children', x: 40, y: 65, icon: '👶', color: '#10b981' }
    ],
    connections: [
      { from: 1, to: 2 }, { from: 2, to: 5 }
    ],
    story: "Phone calls on weekends. Some traditions starting to fade."
  },
  {
    year: 2010,
    title: "2010s: Global Dispersion",
    description: "Globalization scattered families across continents for opportunities",
    familyPositions: [
      { id: 1, name: 'Grandparents', x: 20, y: 30, icon: '👴', color: '#8b5cf6' },
      { id: 2, name: 'Parents', x: 25, y: 50, icon: '👨', color: '#3b82f6' },
      { id: 3, name: 'Aunt & Uncle', x: 75, y: 25, icon: '👩', color: '#ef4444' },
      { id: 4, name: 'Cousins', x: 80, y: 70, icon: '🧑', color: '#f59e0b' },
      { id: 5, name: 'Children', x: 50, y: 75, icon: '👶', color: '#10b981' }
    ],
    connections: [],
    story: "Social media updates. Missing family medical history when needed."
  },
  {
    year: 2024,
    title: "2024: Crisis Point",
    description: "Families scattered worldwide, losing touch and traditions",
    familyPositions: [
      { id: 1, name: 'Grandparents', x: 10, y: 20, icon: '👴', color: '#8b5cf6' },
      { id: 2, name: 'Parents', x: 15, y: 60, icon: '👨', color: '#3b82f6' },
      { id: 3, name: 'Aunt & Uncle', x: 85, y: 15, icon: '👩', color: '#ef4444' },
      { id: 4, name: 'Cousins', x: 90, y: 80, icon: '🧑', color: '#f59e0b' },
      { id: 5, name: 'Children', x: 60, y: 85, icon: '👶', color: '#10b981' }
    ],
    connections: [],
    story: "Lost contact. Children don't know their heritage. Health crises without family history."
  },
  {
    year: 2025,
    title: "2025: KinConnect Solution",
    description: "Technology bridges the gap, reconnecting families worldwide",
    familyPositions: [
      { id: 1, name: 'Grandparents', x: 45, y: 30, icon: '👴', color: '#8b5cf6' },
      { id: 2, name: 'Parents', x: 35, y: 50, icon: '👨', color: '#3b82f6' },
      { id: 3, name: 'Aunt & Uncle', x: 55, y: 35, icon: '👩', color: '#ef4444' },
      { id: 4, name: 'Cousins', x: 65, y: 55, icon: '🧑', color: '#f59e0b' },
      { id: 5, name: 'Children', x: 50, y: 65, icon: '👶', color: '#10b981' }
    ],
    connections: [
      { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }, 
      { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 1, to: 5 }, { from: 3, to: 2 }
    ],
    story: "Real-time family updates. Preserved stories. Organized reunions. Stronger bonds than ever."
  }
]

export function ProblemSolutionSection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.2 })
  const [currentPeriod, setCurrentPeriod] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Auto-play timeline when visible
  useEffect(() => {
    if (!isVisible || !isPlaying) return

    const timer = setInterval(() => {
      setCurrentPeriod(prev => {
        if (prev >= timelinePeriods.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 3000) // 3 seconds per period

    return () => clearInterval(timer)
  }, [isVisible, isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentPeriod(0)
    setIsPlaying(false)
  }

  const handlePeriodClick = (index: number) => {
    setCurrentPeriod(index)
    setIsPlaying(false)
  }

  const currentData = timelinePeriods[currentPeriod]

  return (
    <section ref={elementRef} className="py-24 bg-gray-50" id="problem-solution">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The Family Distance Crisis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Watch how families went from close-knit communities to scattered across the globe - and how KinConnect brings them back together.
          </p>

          {/* Interactive Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause Timeline' : 'Play Timeline'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-gray-500 hover:bg-gray-600 text-white transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </motion.div>

        {/* Interactive Family Distance Crisis Visualization */}
        <div className="max-w-6xl mx-auto">
          {/* Timeline Navigation */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {timelinePeriods.map((period, index) => (
              <button
                key={period.year}
                onClick={() => handlePeriodClick(index)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  index === currentPeriod
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : index < currentPeriod
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {period.year}
              </button>
            ))}
          </motion.div>

          {/* Main Visualization */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPeriod}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentData.title}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {currentData.description}
                </p>
                <p className={`text-lg italic font-medium ${
                  currentPeriod === timelinePeriods.length - 1 
                    ? 'text-green-600' 
                    : currentPeriod >= 3 
                    ? 'text-red-600' 
                    : 'text-gray-700'
                }`}>
                  "{currentData.story}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Family Network Visualization */}
            <div className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              {/* Family Connections */}
              <AnimatePresence>
                <svg className="absolute inset-0 w-full h-full">
                  {currentData.connections.map((connection, index) => {
                    const fromMember = currentData.familyPositions.find(m => m.id === connection.from)
                    const toMember = currentData.familyPositions.find(m => m.id === connection.to)
                    if (!fromMember || !toMember) return null

                    return (
                      <motion.line
                        key={`${connection.from}-${connection.to}`}
                        x1={`${fromMember.x}%`}
                        y1={`${fromMember.y}%`}
                        x2={`${toMember.x}%`}
                        y2={`${toMember.y}%`}
                        stroke={currentPeriod === timelinePeriods.length - 1 ? "#10b981" : "#3b82f6"}
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;-10"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </motion.line>
                    )
                  })}
                </svg>
              </AnimatePresence>

              {/* Family Members */}
              <AnimatePresence mode="wait">
                {currentData.familyPositions.map((member, index) => (
                  <motion.div
                    key={`${currentPeriod}-${member.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${member.x}%`,
                      top: `${member.y}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white cursor-pointer"
                      style={{ backgroundColor: member.color }}
                      title={member.name}
                    >
                      {member.icon}
                    </div>
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {member.name}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Crisis Indicator */}
              {currentPeriod === 3 && (
                <motion.div
                  className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  ⚠️ CRISIS POINT
                </motion.div>
              )}

              {/* KinConnect Solution Indicator */}
              {currentPeriod === timelinePeriods.length - 1 && (
                <motion.div
                  className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  ✅ KINCONNECT SOLUTION
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Statistics Section */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {[
            { number: '73%', label: 'Families feel disconnected', color: 'text-red-600' },
            { number: '2.5B', label: 'People living away from family', color: 'text-orange-600' },
            { number: '85%', label: 'Want stronger family bonds', color: 'text-blue-600' },
            { number: '90%', label: 'Trust family recommendations', color: 'text-green-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.7 + index * 0.1, duration: 0.6 }}
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}