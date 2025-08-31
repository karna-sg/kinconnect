'use client'

import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Home, 
  Users, 
  Network, 
  Globe, 
  Star, 
  Shield, 
  Menu, 
  X,
  ChevronDown,
  Play,
  BookOpen
} from 'lucide-react'

const navigationSections = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'problem-solution', label: 'Solution', icon: Users },
  { id: 'interactive-demo', label: 'Demo', icon: Play },
  { id: 'network-visualization', label: 'Visualization', icon: Globe },
  { id: 'use-cases', label: 'Use Cases', icon: Network },
  { id: 'success-stories', label: 'Stories', icon: Star },
  { id: 'trust-technology', label: 'Security', icon: Shield }
]

export function NavigationBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Track scroll position for navbar visibility
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(latest > 100)
  })

  // Track which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationSections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id),
        offset: 0
      }))

      let currentSection = 'hero'
      const scrollPosition = window.scrollY + 200 // Offset for better UX

      sections.forEach(({ id, element }) => {
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = id
          }
        }
      })

      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = sectionId === 'hero' ? 0 : 80 // Account for navbar height
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Fixed Navigation Bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div
                className="flex items-center cursor-pointer"
                onClick={() => scrollToSection('hero')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    KinConnect
                  </div>
                  <div className="text-xs text-gray-500">Family Network Platform</div>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigationSections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => scrollToSection(section.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </motion.button>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <motion.button
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpen className="w-4 h-4" />
                  Learn More
                </motion.button>
                <motion.button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <motion.div
          className="lg:hidden bg-white border-b border-gray-200 shadow-lg"
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="px-4 py-4 space-y-2">
            {navigationSections.map((section, index) => (
              <motion.button
                key={section.id}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => scrollToSection(section.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: mobileMenuOpen ? 1 : 0, x: mobileMenuOpen ? 0 : -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </motion.button>
            ))}
            
            {/* Mobile CTA */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <motion.button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: mobileMenuOpen ? 1 : 0, y: mobileMenuOpen ? 0 : 20 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform-gpu z-50"
        style={{
          scaleX: useScroll().scrollYProgress,
          transformOrigin: '0%'
        }}
      />

      {/* Section Dots Navigation (Side) */}
      <motion.div
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden xl:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200">
          <div className="space-y-3">
            {navigationSections.map((section, index) => (
              <motion.button
                key={section.id}
                className={`block w-3 h-3 rounded-full transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-500 scale-125'
                    : 'bg-gray-300 hover:bg-blue-300'
                }`}
                onClick={() => scrollToSection(section.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title={section.label}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Back to Top */}
      <motion.button
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          scale: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        onClick={() => scrollToSection('hero')}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        title="Back to top"
      >
        <ChevronDown className="w-6 h-6 rotate-180" />
      </motion.button>
    </>
  )
}