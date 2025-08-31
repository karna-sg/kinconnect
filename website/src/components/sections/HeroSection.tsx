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
        {/* Full Width Earth Globe - 100% of Hero Section */}
        <motion.div
          variants={globeVariants}
          initial="hidden"
          animate={controls}
          className="w-full h-screen relative"
        >
          {/* Main Globe Container - Full Screen */}
          {showGlobe && (
            <motion.div
              className="w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ProfessionalEarthGlobe
                height={typeof window !== 'undefined' ? window.innerHeight : 800}
                width={typeof window !== 'undefined' ? window.innerWidth : 1200}
              />
            </motion.div>
          )}
        </motion.div>

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