'use client'

import { motion } from 'framer-motion'
import { useScrollReveal, useStaggeredReveal } from '@/hooks/useScrollReveal'
import { 
  Shield, 
  Zap, 
  Database, 
  Globe, 
  Lock, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Server,
  Cpu,
  Network,
  Eye,
  Award,
  Clock
} from 'lucide-react'

const techFeatures = [
  {
    icon: Database,
    title: 'Graph Database Technology',
    description: 'Advanced Neo4j graph database specifically designed for relationship mapping',
    details: ['Neo4j Enterprise', 'Optimized for millions of nodes', 'Sub-second query times'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast Performance',
    description: 'Sub-second response times even with millions of family connections',
    details: ['<100ms for 95% queries', 'Real-time updates', '99.9% uptime'],
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Network,
    title: 'Scalable Infrastructure',
    description: 'Built to grow with your family network from hundreds to millions',
    details: ['Auto-scaling architecture', 'Load balancing', 'Global CDN'],
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Cpu,
    title: 'AI-Powered Connections',
    description: 'Smart algorithms to discover relationships you never knew existed',
    details: ['Machine learning', 'Pattern recognition', 'Intelligent suggestions'],
    color: 'from-purple-500 to-pink-500'
  }
]

const trustFeatures = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your family data is protected with enterprise-level security',
    details: ['End-to-end encryption', 'Multi-factor authentication', 'Regular security audits'],
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description: 'Family-only sharing with granular privacy controls',
    details: ['Family-only visibility', 'Granular permissions', 'No data selling'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Users,
    title: 'Verified Relationships',
    description: 'Multi-layered verification ensures authentic family connections',
    details: ['Identity verification', 'Relationship validation', 'Community endorsements'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Lock,
    title: 'Data Ownership',
    description: 'You own your family data with full control and export capabilities',
    details: ['Full data export', 'Deletion rights', 'Transparent policies'],
    color: 'from-gray-600 to-gray-800'
  }
]

const stats = [
  { number: '99.9%', label: 'Uptime Guarantee', icon: Clock },
  { number: '<100ms', label: 'Average Query Time', icon: Zap },
  { number: '10M+', label: 'Connections Mapped', icon: Network },
  { number: '256-bit', label: 'Encryption Standard', icon: Shield }
]

const certifications = [
  { name: 'SOC 2 Type II', description: 'Security & Availability' },
  { name: 'GDPR Compliant', description: 'Data Protection' },
  { name: 'ISO 27001', description: 'Information Security' },
  { name: 'SSL/TLS 1.3', description: 'Transport Security' }
]

export function TrustTechnologySection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.2 })
  const { elementRef: gridRef, visibleItems } = useStaggeredReveal(8, 100)

  return (
    <section ref={elementRef} className="py-24 bg-gray-900 text-white" id="trust-technology">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Built to Scale. Designed for Privacy.
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Enterprise-grade technology meets family-first privacy. Your connections are secure, fast, and always under your control.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center bg-gray-800 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, backgroundColor: '#374151' }}
            >
              <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology & Trust Grid */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Technology Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 border border-blue-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Built to Scale</h3>
              </div>

              <div className="space-y-6">
                {techFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-700/50"
                    style={{
                      opacity: visibleItems.includes(index) ? 1 : 0
                    }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-100 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-blue-200 mb-3">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {feature.details.map((detail, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-800/50 text-blue-200 px-2 py-1 rounded"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trust & Privacy Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="bg-gradient-to-br from-green-900 to-teal-900 rounded-2xl p-8 border border-green-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Designed for Privacy</h3>
              </div>

              <div className="space-y-6">
                {trustFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-green-900/50 backdrop-blur-sm rounded-xl p-4 border border-green-700/50"
                    style={{
                      opacity: visibleItems.includes(index + 4) ? 1 : 0
                    }}
                    transition={{ delay: (index + 4) * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-100 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-green-200 mb-3">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {feature.details.map((detail, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-800/50 text-green-200 px-2 py-1 rounded"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Certifications & Compliance */}
        <motion.div
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-8 h-8 text-yellow-400" />
              <h3 className="text-2xl font-bold">Certified & Compliant</h3>
            </div>
            <p className="text-gray-400">
              Meeting the highest industry standards for security, privacy, and data protection.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                className="text-center bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, backgroundColor: '#4B5563' }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="font-semibold text-yellow-400 mb-1">
                  {cert.name}
                </div>
                <div className="text-xs text-gray-400">
                  {cert.description}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart Visualization */}
        <motion.div
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Performance at Scale</h3>
            <p className="text-gray-400">
              Real-time performance metrics across different network sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { size: '1K families', time: '0.05ms', memory: '10MB' },
              { size: '10K families', time: '0.3ms', memory: '100MB' },
              { size: '100K families', time: '2ms', memory: '1GB' },
              { size: '1M families', time: '8ms', memory: '10GB' }
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-b from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {metric.size}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">Network Size</div>
                  
                  <div className="space-y-2">
                    <div className="bg-blue-800/50 rounded p-2">
                      <div className="text-xs text-blue-200">Query Time</div>
                      <div className="font-bold text-blue-100">{metric.time}</div>
                    </div>
                    <div className="bg-purple-800/50 rounded p-2">
                      <div className="text-xs text-purple-200">Memory</div>
                      <div className="font-bold text-purple-100">{metric.memory}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Enterprise Technology. Family Values.
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Experience the perfect blend of cutting-edge technology and family-first privacy. 
            Your data is secure, your connections are private, and your family network is always growing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Building Securely
            </motion.button>
            <motion.button
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Security Documentation
            </motion.button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Enterprise Security
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global Infrastructure
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              99.9% Uptime
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}