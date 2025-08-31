'use client'

import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Users, MapPin, Clock, Heart, Zap, Shield, Network, Star } from 'lucide-react'

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

const floatingPhotos = [
  { id: 1, name: 'Sharma Family', x: 10, y: 20, delay: 0 },
  { id: 2, name: 'Patel Family', x: 70, y: 15, delay: 0.2 },
  { id: 3, name: 'Singh Family', x: 30, y: 60, delay: 0.4 },
  { id: 4, name: 'Kumar Family', x: 80, y: 70, delay: 0.6 },
  { id: 5, name: 'Gupta Family', x: 15, y: 80, delay: 0.8 }
]

export function ProblemSolutionSection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.2 })

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
            The Modern Family Challenge
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Traditional family connections are weakening in our digital age. We're here to bridge that gap.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problem Side */}
          <motion.div
            variants={problemVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="relative"
          >
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">THE REALITY</h3>
              </div>

              <motion.div variants={itemVariants} className="space-y-4 mb-8">
                {[
                  { icon: MapPin, text: 'Families spread across continents' },
                  { icon: Users, text: 'Lost touch with cousins & relatives' },
                  { icon: Heart, text: 'Missing family medical history' },
                  { icon: Clock, text: 'Struggling to organize reunions' },
                  { icon: Star, text: "Children don't know their heritage" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <item.icon className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Scattered Family Photos Animation */}
              <div className="relative h-40 bg-red-100 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-red-600 font-medium">
                  Families Disconnected & Scattered
                </div>
                {floatingPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    className="absolute w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      left: `${photo.x}%`,
                      top: `${photo.y}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isVisible ? {
                      scale: 1,
                      opacity: 0.8,
                      y: [0, -10, 0],
                    } : {}}
                    transition={{
                      delay: photo.delay,
                      duration: 0.6,
                      y: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {photo.name.charAt(0)}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Solution Side */}
          <motion.div
            variants={solutionVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="relative"
          >
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">THE KINCONNECT WAY</h3>
              </div>

              <motion.div variants={itemVariants} className="space-y-4 mb-8">
                {[
                  { icon: Network, text: 'Map your entire family network' },
                  { icon: Zap, text: 'Rediscover forgotten connections' },
                  { icon: Heart, text: 'Share stories across generations' },
                  { icon: Users, text: 'Organize events effortlessly' },
                  { icon: Shield, text: 'Preserve family legacy forever' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Connected Family Network Animation */}
              <div className="relative h-40 bg-blue-100 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-medium">
                  Families Connected & Thriving
                </div>
                
                {/* Network connections */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* Connection lines */}
                  {[
                    { x1: 15, y1: 30, x2: 75, y2: 25 },
                    { x1: 75, y1: 25, x2: 35, y2: 70 },
                    { x1: 35, y1: 70, x2: 85, y2: 80 },
                    { x1: 20, y1: 85, x2: 35, y2: 70 }
                  ].map((line, index) => (
                    <motion.line
                      key={index}
                      x1={`${line.x1}%`}
                      y1={`${line.y1}%`}
                      x2={`${line.x2}%`}
                      y2={`${line.y2}%`}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={isVisible ? { pathLength: 1 } : {}}
                      transition={{ delay: 1 + index * 0.2, duration: 0.8 }}
                    />
                  ))}
                </svg>

                {floatingPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg"
                    style={{
                      left: `${photo.x}%`,
                      top: `${photo.y}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isVisible ? {
                      scale: 1,
                      opacity: 1,
                    } : {}}
                    transition={{
                      delay: 0.8 + photo.delay,
                      duration: 0.6,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {photo.name.charAt(0)}
                  </motion.div>
                ))}

                {/* Trust indicators */}
                <motion.div
                  className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 2, duration: 0.5 }}
                >
                  <Shield className="w-3 h-3" />
                  Verified
                </motion.div>
              </div>
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