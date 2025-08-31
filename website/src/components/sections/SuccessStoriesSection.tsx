'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Star, Heart, Users, Globe, ChevronLeft, ChevronRight, MapPin, Quote } from 'lucide-react'

const successStories = [
  {
    id: 1,
    type: 'Reunion Miracle',
    title: 'Found 47 relatives across 8 countries',
    story: "KinConnect helped us reconnect with family members we hadn't spoken to in decades. We organized our first global family reunion in 15 years with 120+ attendees from Mumbai to San Francisco!",
    author: 'The Patel Network',
    location: 'Gujarat → Global',
    image: '👨‍👩‍👧‍👦',
    stats: {
      families: 47,
      countries: 8,
      reunion: '120+ attendees'
    },
    tags: ['Family Reunion', 'Global Network', 'Heritage']
  },
  {
    id: 2,
    type: 'Life-Saving Connection',
    title: 'Found kidney donor in extended family',
    story: "When my father needed a rare blood type kidney donor, KinConnect helped us find a compatible donor in our extended family network within 48 hours. The surgery was successful and both families are now closer than ever.",
    author: 'Dr. Priya Sharma',
    location: 'Delhi → Jaipur',
    image: '🏥',
    stats: {
      time: '48 hours',
      success: '100%',
      lives: 'saved'
    },
    tags: ['Medical Emergency', 'Family Support', 'Life Saving']
  },
  {
    id: 3,
    type: 'Business Breakthrough',
    title: 'Generated ₹5 Crore through family network',
    story: "Our family business network generated over ₹5 crore in referral business last year. From real estate deals to tech partnerships, our connected families create opportunities for everyone.",
    author: 'Singh Entrepreneurs',
    location: 'Mumbai → Pune → Bangalore',
    image: '💼',
    stats: {
      revenue: '₹5 Cr+',
      deals: '45+',
      growth: '300%'
    },
    tags: ['Business Network', 'Entrepreneurship', 'Growth']
  },
  {
    id: 4,
    type: 'Perfect Match',
    title: 'Found soulmate through trusted connection',
    story: "After 3 years of unsuccessful matches on other platforms, we found each other through a mutual family friend on KinConnect. The family verification and trust score gave both families confidence. Now happily married with a beautiful daughter!",
    author: 'Rahul & Kavitha',
    location: 'Bangalore ❤️ Chennai',
    image: '💑',
    stats: {
      matching: '1st try',
      families: 'both verified',
      happiness: '∞'
    },
    tags: ['Matrimony', 'Trust', 'Love Story']
  },
  {
    id: 5,
    type: 'Educational Success',
    title: 'Scholarship worth $75,000 through network',
    story: "My cousin in California helped me discover scholarship opportunities I never knew existed. Through our family network, I got mentorship, application help, and ultimately a full scholarship to MIT!",
    author: 'Arjun Reddy',
    location: 'Hyderabad → Boston',
    image: '🎓',
    stats: {
      scholarship: '$75K',
      university: 'MIT',
      mentors: '5+'
    },
    tags: ['Education', 'Scholarship', 'Mentorship']
  },
  {
    id: 6,
    type: 'Cultural Preservation',
    title: 'Digitized 200-year family history',
    story: "With help from relatives across India and abroad, we've documented our family's 200-year journey, including recipes, traditions, and stories. Now our grandchildren in America know their roots better than we ever did!",
    author: 'Heritage Keepers',
    location: 'Rajasthan → Worldwide',
    image: '📚',
    stats: {
      years: '200+',
      stories: '500+',
      recipes: '150+'
    },
    tags: ['Heritage', 'Culture', 'Digital Archive']
  }
]

export function SuccessStoriesSection() {
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.2 })
  const [currentStory, setCurrentStory] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-advance stories
  useEffect(() => {
    if (!autoPlay || !isVisible) return
    
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [autoPlay, isVisible])

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % successStories.length)
    setAutoPlay(false)
  }

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + successStories.length) % successStories.length)
    setAutoPlay(false)
  }

  const currentStoryData = successStories[currentStory]

  return (
    <section ref={elementRef} className="py-24 bg-gradient-to-b from-blue-50 to-purple-50" id="success-stories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Real Families, Real Connections
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how KinConnect has transformed lives, reunited families, and created lasting bonds across the globe.
          </p>
        </motion.div>

        {/* Main Story Carousel */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Story Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Story Type Badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">{currentStoryData.image}</span>
                    {currentStoryData.type}
                  </motion.div>

                  {/* Story Title */}
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {currentStoryData.title}
                  </h3>

                  {/* Story Text */}
                  <div className="relative mb-6">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-blue-200" />
                    <p className="text-gray-600 leading-relaxed pl-6">
                      {currentStoryData.story}
                    </p>
                  </div>

                  {/* Author & Location */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {currentStoryData.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {currentStoryData.author}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {currentStoryData.location}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {currentStoryData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stats Visualization */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 lg:p-12 flex flex-col justify-center text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="text-6xl lg:text-8xl mb-4">
                      {currentStoryData.image}
                    </div>
                    <div className="text-lg font-medium opacity-90">
                      Success Metrics
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    {Object.entries(currentStoryData.stats).map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-lg p-3"
                      >
                        <div className="text-xl lg:text-2xl font-bold mb-1">
                          {value}
                        </div>
                        <div className="text-xs lg:text-sm opacity-80 capitalize">
                          {key.replace('_', ' ')}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="text-center pt-4 border-t border-white/20">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                      ))}
                    </div>
                    <div className="text-sm opacity-90">
                      "Life-changing experience"
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevStory}
              className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Story Indicators */}
            <div className="flex gap-2">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStory(index)
                    setAutoPlay(false)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentStory 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStory}
              className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </motion.div>

        {/* Story Preview Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              className={`bg-white rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 ${
                index === currentStory 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
              }`}
              onClick={() => {
                setCurrentStory(index)
                setAutoPlay(false)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{story.image}</div>
                <div className="text-xs font-medium text-gray-900 mb-1 line-clamp-1">
                  {story.type}
                </div>
                <div className="text-xs text-gray-500 line-clamp-2">
                  {story.title}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Write Your Success Story?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of families who have transformed their relationships through KinConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
              </motion.button>
              <motion.button
                className="btn-secondary bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read More Stories
              </motion.button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                50,000+ happy families
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                150+ countries
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                4.9/5 rating
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}