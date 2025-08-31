'use client'

import { motion } from 'framer-motion'
import { useStaggeredReveal } from '@/hooks/useScrollReveal'
import { 
  Heart, 
  Calendar, 
  Stethoscope, 
  Briefcase, 
  GraduationCap, 
  Home, 
  DollarSign, 
  BookOpen,
  ArrowRight,
  Star,
  Users
} from 'lucide-react'

const useCases = [
  {
    id: 'matrimony',
    title: 'Matrimony & Marriage',
    description: 'Find life partners through trusted family networks',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    features: ['Verified family backgrounds', 'Cultural compatibility', 'Traditional introductions'],
    testimonial: {
      text: "Found my perfect match through my cousin's connection. The family verification gave us confidence.",
      author: 'Priya & Amit',
      location: 'Delhi → Mumbai'
    }
  },
  {
    id: 'events',
    title: 'Family Reunions & Events',
    description: 'Organize and plan family gatherings',
    icon: Calendar,
    color: 'from-purple-500 to-indigo-500',
    features: ['Event coordination', 'RSVP management', 'Memory sharing'],
    testimonial: {
      text: "Organized our first family reunion in 15 years. Found relatives we didn't know existed!",
      author: 'Sharma Family',
      location: 'Global Reunion'
    }
  },
  {
    id: 'health',
    title: 'Medical History Tracking',
    description: 'Maintain comprehensive family health records',
    icon: Stethoscope,
    color: 'from-green-500 to-emerald-500',
    features: ['Genetic tracking', 'Emergency contacts', 'Health insights'],
    testimonial: {
      text: "Discovered family diabetes pattern early. Helped us take preventive measures for our kids.",
      author: 'Dr. Rajesh Patel',
      location: 'Ahmedabad'
    }
  },
  {
    id: 'professional',
    title: 'Professional Networking',
    description: 'Leverage family connections for career opportunities',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    features: ['Job referrals', 'Mentorship', 'Business opportunities'],
    testimonial: {
      text: "My uncle's referral landed me a dream job at Google. Family networks are powerful!",
      author: 'Kavitha Singh',
      location: 'Bangalore'
    }
  },
  {
    id: 'education',
    title: 'Education & Scholarships',
    description: 'Educational opportunities through family connections',
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-500',
    features: ['Admission guidance', 'Scholarships', 'Academic mentorship'],
    testimonial: {
      text: "Found scholarship opportunities through extended family. Saved $50K on education!",
      author: 'Rohan Gupta',
      location: 'California'
    }
  },
  {
    id: 'property',
    title: 'Property & Real Estate',
    description: 'Real estate transactions within trusted networks',
    icon: Home,
    color: 'from-teal-500 to-green-500',
    features: ['Trusted dealers', 'Investment advice', 'Property recommendations'],
    testimonial: {
      text: "Bought our dream home through family connection. No broker fees, complete trust!",
      author: 'Kumar Family',
      location: 'Pune'
    }
  },
  {
    id: 'financial',
    title: 'Financial Support Networks',
    description: 'Emergency assistance and investment opportunities',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-500',
    features: ['Emergency support', 'Investment groups', 'Financial advice'],
    testimonial: {
      text: "Family investment group helped us start our business. Raised ₹50L in 30 days!",
      author: 'Startup Founders',
      location: 'Hyderabad'
    }
  },
  {
    id: 'heritage',
    title: 'Cultural Preservation',
    description: 'Preserve and share family traditions and heritage',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-500',
    features: ['Family stories', 'Recipe sharing', 'Language preservation'],
    testimonial: {
      text: "Digitized our family's 200-year history. Grandkids now know their roots!",
      author: 'Heritage Keepers',
      location: 'Rajasthan'
    }
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export function UseCasesSection() {
  const { elementRef, visibleItems, isVisible } = useStaggeredReveal(useCases.length, 150)

  return (
    <section ref={elementRef} className="py-24 bg-white" id="use-cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Use Cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From matrimony to business opportunities, KinConnect strengthens family bonds across all aspects of life.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              variants={cardVariants}
              className="group family-card cursor-pointer relative overflow-hidden"
              style={{
                opacity: visibleItems.includes(index) ? 1 : 0
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${useCase.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {useCase.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Testimonial Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 group-hover:bg-blue-50 transition-colors duration-300">
                  <p className="text-xs text-gray-600 italic line-clamp-2 mb-2">
                    "{useCase.testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        {useCase.testimonial.author}
                      </div>
                      <div className="text-xs text-gray-500">
                        {useCase.testimonial.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Learn More */}
                <motion.div
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-colors duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore Your Family Network?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of families who have already discovered the power of connected relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Building Your Network
              </motion.button>
              <motion.button
                className="btn-secondary bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See All Features
              </motion.button>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                50,000+ families connected
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                4.9/5 average rating
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                10,000+ successful matches
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}