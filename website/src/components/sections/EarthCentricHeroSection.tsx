'use client'

import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button, CTAButton, SecondaryButton } from '@/components/ui/Button'
import { ProfessionalEarthGlobe } from '@/components/ui/ProfessionalEarthGlobe'
import { Play, ArrowDown, Globe, Users, Heart, Zap } from 'lucide-react'

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5
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

const earthVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 2,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 1
    }
  }
}

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Storytelling phases that explain KinConnect through Earth
const storyPhases = [
  {
    phase: 1,
    title: "Families Scattered",
    description: "Your loved ones are spread across the globe",
    highlight: "scattered",
    delay: 2
  },
  {
    phase: 2, 
    title: "Connections Form",
    description: "KinConnect reveals the invisible bonds between them",
    highlight: "connections",
    delay: 5
  },
  {
    phase: 3,
    title: "Network Emerges",
    description: "Watch your global family network come alive",
    highlight: "network",
    delay: 8
  }
]

export function EarthCentricHeroSection() {
  const [familyCount, setFamilyCount] = useState(0)
  const [showEarth, setShowEarth] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentStory, setCurrentStory] = useState(0)
  const controls = useAnimationControls()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Story progression
  useEffect(() => {
    if (!mounted) return
    
    const storyTimer = setInterval(() => {
      setCurrentStory(prev => (prev + 1) % storyPhases.length)
    }, 4000)
    
    return () => clearInterval(storyTimer)
  }, [mounted])

  // Animated counter effect
  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      setFamilyCount(prev => {
        if (prev < 50000) {
          return prev + 127
        }
        clearInterval(timer)
        return 50000
      })
    }, 80)

    return () => clearInterval(timer)
  }, [mounted])

  // Trigger Earth animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEarth(true)
      controls.start('visible')
    }, 800)

    return () => clearTimeout(timer)
  }, [controls])

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Cosmic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/30" />
        {/* Twinkling stars */}
        {mounted && [...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${(i * 7.3) % 100}%`,
              top: `${(i * 11.7) % 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        
        {/* Top Section - Minimal Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="absolute top-8 left-8 z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">🌐</span>
            </div>
            <h1 className="text-2xl font-bold text-white">KinConnect</h1>
          </div>
        </motion.div>

        {/* CTA Buttons - Top Right */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="absolute top-8 right-8 z-20 flex gap-4"
        >
          <SecondaryButton
            variant="outline"
            className="border-white/30 text-white hover:bg-white hover:text-blue-900"
            icon={<Play className="w-4 h-4" />}
          >
            Watch Demo
          </SecondaryButton>
          <CTAButton
            className="bg-white text-blue-900 hover:bg-gray-100 shadow-xl"
            icon={<span>🚀</span>}
          >
            Start Free
          </CTAButton>
        </motion.div>

        {/* Main Earth Section - 70% of screen */}
        <div className="flex-1 flex items-center justify-center relative">
          
          {/* Earth Container - Takes 70% of viewport */}
          <motion.div
            variants={earthVariants}
            initial="hidden"
            animate={showEarth ? "visible" : "hidden"}
            className="relative"
            style={{ 
              width: '70vw', 
              height: '70vh',
              minWidth: '600px',
              minHeight: '400px'
            }}
          >
            {/* Pulsing Glow Background */}
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent rounded-full"
              style={{ transform: 'scale(1.2)' }}
            />
            
            {/* Main Earth Globe */}
            {showEarth && (
              <ProfessionalEarthGlobe
                height={typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.7, 600) : 600}
                width={typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.7, 800) : 800}
              />
            )}
            
            {/* Floating Story Elements around Earth */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.6 }}
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    {currentStory === 0 && <Users className="w-6 h-6 text-white" />}
                    {currentStory === 1 && <Zap className="w-6 h-6 text-white" />}
                    {currentStory === 2 && <Heart className="w-6 h-6 text-white" />}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {storyPhases[currentStory].title}
                  </h3>
                  <p className="text-white/80 text-sm max-w-xs">
                    {storyPhases[currentStory].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left Side Stat */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">
                  {familyCount.toLocaleString()}+
                </div>
                <div className="text-white/70 text-xs">
                  Families<br />Connected
                </div>
              </div>
            </motion.div>

            {/* Right Side Stat */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">
                  195
                </div>
                <div className="text-white/70 text-xs">
                  Countries<br />Worldwide
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section - Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-20"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Your Global Family
            <br />
            <span className="gradient-text bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Connected
            </span>
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-2xl">
            Watch as KinConnect reveals the beautiful web of connections 
            linking your family across continents, cultures, and generations.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-white/70 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              100% Free to Start
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Privacy Protected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              2-Min Setup
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center text-white/60 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => {
              document.getElementById('problem-solution')?.scrollIntoView({ 
                behavior: 'smooth' 
              })
            }}
          >
            <span className="text-sm mb-2">Explore Family Networks</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}