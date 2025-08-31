'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useScrollReveal, useStaggeredReveal } from '@/hooks/useScrollReveal'
import { EnhancedFamilyGraph } from '@/components/ui/EnhancedFamilyGraph'
import { EarthGlobe, GlobeLoader } from '@/components/ui/EarthGlobe'
import { 
  Globe2, 
  Network, 
  Zap, 
  Eye, 
  BarChart3,
  Users,
  ArrowRight,
  Play,
  Maximize2,
  RefreshCcw,
  Settings
} from 'lucide-react'

const visualizationFeatures = [
  {
    icon: Globe2,
    title: 'Global Family Diaspora',
    description: 'Visualize how your family has spread across continents with interactive 3D globe',
    details: ['Real-time connection flows', 'Country-wise family hubs', 'Migration patterns']
  },
  {
    icon: Network,
    title: 'Interactive Relationship Graph',
    description: 'Explore complex family connections with advanced network visualization',
    details: ['Multi-generation mapping', 'Relationship filtering', 'Connection strength analysis']
  },
  {
    icon: Zap,
    title: 'Live Connection Tracking',
    description: 'Watch family connections form and strengthen in real-time',
    details: ['Animated data flows', 'Connection notifications', 'Activity streams']
  },
  {
    icon: Eye,
    title: 'Smart Family Discovery',
    description: 'AI-powered suggestions for potential family connections',
    details: ['Pattern recognition', 'Similarity matching', 'Verification assistance']
  }
]

const networkStats = [
  { label: 'Active Families', value: '15,247', trend: '+12%' },
  { label: 'Countries', value: '89', trend: '+3%' },
  { label: 'Connections Made', value: '45,892', trend: '+23%' },
  { label: 'Success Rate', value: '94.2%', trend: '+2.1%' }
]

export function NetworkVisualizationSection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.1 })
  const { elementRef: featuresRef, visibleItems } = useStaggeredReveal(4, 150)
  const [activeView, setActiveView] = useState<'graph' | 'globe'>('graph')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section 
      ref={elementRef}
      className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" 
      id="network-visualization"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="network-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="#3b82f6" opacity="0.3"/>
                <line x1="50" y1="50" x2="100" y2="50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2"/>
                <line x1="50" y1="50" x2="50" y2="100" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network-pattern)"/>
          </svg>
        </div>
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
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Network className="w-4 h-4" />
            Revolutionary Network Visualization
          </motion.div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            See Your Family Network
            <br />
            <span className="text-blue-600">Come Alive</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the most advanced family network visualization ever created. 
            Watch connections flow, discover patterns, and explore your global family diaspora in stunning detail.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {networkStats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              >
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-xs text-green-600 font-medium mt-1">{stat.trend}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {visualizationFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              style={{
                opacity: visibleItems.includes(index) ? 1 : 0,
                transform: visibleItems.includes(index) ? 'translateY(0)' : 'translateY(20px)'
              }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <ul className="space-y-1">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Visualization Area */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Visualization Controls */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">Interactive Network Explorer</h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === 'graph' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveView('graph')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Network className="w-4 h-4 mr-2 inline" />
                    Family Graph
                  </motion.button>
                  <motion.button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === 'globe' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveView('globe')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Globe2 className="w-4 h-4 mr-2 inline" />
                    Global View
                  </motion.button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RefreshCcw className="w-4 h-4 text-gray-600" />
                </motion.button>
                <motion.button
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                </motion.button>
                <motion.button
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Visualization Container */}
          <div className="relative" style={{ height: isFullscreen ? '80vh' : '700px' }}>
            {activeView === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <EnhancedFamilyGraph 
                  interactive={true}
                  autoPlay={true}
                  showStats={true}
                  height={isFullscreen ? (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 700) : 700}
                />
              </motion.div>
            )}
            
            {activeView === 'globe' && (
              <motion.div
                key="globe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <Suspense fallback={<GlobeLoader />}>
                  <EarthGlobe 
                    autoRotate={true}
                    showConnections={true}
                    interactive={true}
                    height={isFullscreen ? (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 700) : 700}
                  />
                </Suspense>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Interactive Guide */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Demo</h3>
            <p className="text-gray-600 text-sm mb-4">
              Click on any family node to explore their connections, or switch to globe view to see global patterns.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Try it now <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Analytics</h3>
            <p className="text-gray-600 text-sm mb-4">
              Watch as connections strengthen, new families join, and your network grows with live data visualization.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              View insights <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Suggestions</h3>
            <p className="text-gray-600 text-sm mb-4">
              AI-powered family discovery helps you find potential relatives and strengthen existing connections.
            </p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              Discover families <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Ready to Visualize Your Family Network?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of families already using KinConnect to map, discover, and strengthen their family bonds through revolutionary network visualization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Mapping Your Network
            </motion.button>
            <motion.button
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
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