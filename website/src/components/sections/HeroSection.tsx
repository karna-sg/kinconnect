'use client'

import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button, CTAButton, SecondaryButton } from '@/components/ui/Button'
import { ProfessionalEarthGlobe } from '@/components/ui/ProfessionalEarthGlobe'
import { Play, ArrowDown, Globe } from 'lucide-react'


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

const globeVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateY: 45 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.8
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
  const [showGlobe, setShowGlobe] = useState(false)
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

  // Trigger globe animation after text loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlobe(true)
      controls.start('visible')
    }, 1200)

    return () => clearTimeout(timer)
  }, [controls])

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

          {/* Right Column - Earth Globe */}
          <motion.div
            variants={globeVariants}
            initial="hidden"
            animate={controls}
            className="relative h-[500px] lg:h-[600px] w-full"
          >
            <div className="relative w-full h-full flex items-center justify-center">

              {/* Main Globe Container */}
              {showGlobe && (
                <motion.div
                  className="w-full h-full flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ProfessionalEarthGlobe
                    height={typeof window !== 'undefined' ? (window.innerWidth < 1024 ? 500 : 600) : 600}
                    width={typeof window !== 'undefined' ? (window.innerWidth < 1024 ? 500 : 600) : 600}
                  />
                </motion.div>
              )}
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