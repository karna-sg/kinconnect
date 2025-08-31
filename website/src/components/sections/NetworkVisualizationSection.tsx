'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { InnovativeFamilyGraph } from '@/components/ui/InnovativeFamilyGraph'
import {
  Network,
  Zap,
  Heart,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Maximize2
} from 'lucide-react'

export function NetworkVisualizationSection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.1 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationPlaying, setAnimationPlaying] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      ref={elementRef}
      className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden"
      id="network-visualization"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Connection lines background */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
          {[...Array(15)].map((_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * 100}
              y1={Math.random() * 100}
              x2={Math.random() * 100}
              y2={Math.random() * 100}
              stroke="url(#bgGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <Sparkles className="w-4 h-4" />
            Revolutionary Family Network Explorer
          </motion.div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Your Family Network
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Brought to Life
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the most innovative family network visualization ever created.
            Watch your family connections flow with stunning animations and discover the beauty of your family tree.
          </p>
        </motion.div>

        {/* Main Interactive Network Explorer */}
        <motion.div
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Floating Controls */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            <motion.button
              className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${animationPlaying
                  ? 'bg-red-500/90 text-white hover:bg-red-600'
                  : 'bg-green-500/90 text-white hover:bg-green-600'
                }`}
              onClick={() => setAnimationPlaying(!animationPlaying)}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            >
              {animationPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>

            <motion.button
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </motion.button>

            <motion.button
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
              onClick={() => setIsFullscreen(!isFullscreen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
            >
              <Maximize2 className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Interactive Hint */}
          <motion.div
            className="absolute top-6 left-6 z-20 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Click any family to explore connections
          </motion.div>

          {/* Main Graph Container */}
          <div className="relative" style={{ height: isFullscreen ? '80vh' : '700px' }}>
            <InnovativeFamilyGraph
              interactive={true}
              autoPlay={animationPlaying}
              height={isFullscreen ? (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 700) : 700}
            />
          </div>
        </motion.div>

        {/* Interactive Guide */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Exploration</h3>
            <p className="text-gray-600 text-sm mb-4">
              Click on any family node to explore their connections and discover the intricate web of relationships.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Try it now <Zap className="w-4 h-4 ml-2" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
              <Network className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Beautiful Animations</h3>
            <p className="text-gray-600 text-sm mb-4">
              Watch as connections flow with stunning animations and see your family network come alive in real-time.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              Watch the magic <Sparkles className="w-4 h-4 ml-2" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100/50 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Family Bonds</h3>
            <p className="text-gray-600 text-sm mb-4">
              Discover the strength of family connections and see how love and relationships create beautiful patterns.
            </p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              Explore bonds <Heart className="w-4 h-4 ml-2" />
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Ready to See Your Family Network?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of families already using KinConnect to visualize, discover, and celebrate their family connections through our revolutionary network explorer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Family Network
            </motion.button>
            <motion.button
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo Video
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}