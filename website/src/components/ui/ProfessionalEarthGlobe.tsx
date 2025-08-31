'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamic import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-900">
      <div className="flex items-center gap-3 text-white">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
        <div>Loading Earth Visualization...</div>
      </div>
    </div>
  )
})

// Family homes with meaningful names and stories
const worldWideFamilyPoints = [
  // North America - The Patels (Grandparents generation)
  { lat: 40.7128, lng: -74.0060, name: 'Patel Grandparents', city: 'New York', country: 'USA', members: 2, generation: 'grandparents', activity: 'Celebrating 50th Anniversary!', color: '#ff6b35', icon: '🏠' },
  { lat: 34.0522, lng: -118.2437, name: 'Patel Family West Coast', city: 'Los Angeles', country: 'USA', members: 4, generation: 'parents', activity: 'Kids graduated college!', color: '#ff6b35', icon: '🏡' },
  { lat: 43.6532, lng: -79.3832, name: 'Young Patel Couple', city: 'Toronto', country: 'Canada', members: 3, generation: 'children', activity: 'New baby born!', color: '#ff6b35', icon: '🏘️' },
  
  // Europe - The Smith Family Network
  { lat: 51.5074, lng: -0.1278, name: 'Smith Family Estate', city: 'London', country: 'UK', members: 6, generation: 'grandparents', activity: 'Annual Family Reunion', color: '#4fc3f7', icon: '🏰' },
  { lat: 48.8566, lng: 2.3522, name: 'Smith Dubois Branch', city: 'Paris', country: 'France', members: 4, generation: 'parents', activity: 'Planning wedding!', color: '#4fc3f7', icon: '🏡' },
  { lat: 52.5200, lng: 13.4050, name: 'Berlin Smiths', city: 'Berlin', country: 'Germany', members: 5, generation: 'children', activity: 'Starting new business', color: '#4fc3f7', icon: '🏠' },
  
  // Asia - The Chen Dynasty
  { lat: 35.6762, lng: 139.6503, name: 'Chen Family Tokyo', city: 'Tokyo', country: 'Japan', members: 7, generation: 'grandparents', activity: 'Teaching family traditions 📚', color: '#81c784', icon: '🏯' },
  { lat: 39.9042, lng: 116.4074, name: 'Original Chen Home', city: 'Beijing', country: 'China', members: 8, generation: 'great-grandparents', activity: 'Preserving family history 📜', color: '#81c784', icon: '🏮' },
  { lat: 22.3193, lng: 114.1694, name: 'Chen Business Hub', city: 'Hong Kong', country: 'China', members: 5, generation: 'parents', activity: 'Family business thriving! 📈', color: '#81c784', icon: '🏢' },
  { lat: 1.3521, lng: 103.8198, name: 'Young Chen Professionals', city: 'Singapore', country: 'Singapore', members: 2, generation: 'children', activity: 'Just got engaged! 💍', color: '#81c784', icon: '🏠' },
  
  // South America - The Rodriguez Connection  
  { lat: -23.5505, lng: -46.6333, name: 'Rodriguez Family São Paulo', city: 'São Paulo', country: 'Brazil', members: 9, generation: 'grandparents', activity: 'Huge family gathering! 🎊', color: '#ba68c8', icon: '🏘️' },
  { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires Rodriguez', city: 'Buenos Aires', country: 'Argentina', members: 6, generation: 'parents', activity: 'Kids learning music 🎵', color: '#ba68c8', icon: '🏡' },
  { lat: 4.7110, lng: -74.0721, name: 'Rodriguez Origins', city: 'Bogotá', country: 'Colombia', members: 4, generation: 'great-grandparents', activity: 'Sharing family recipes 👩‍🍳', color: '#ba68c8', icon: '🏠' },
  
  // India - The Sharma Network
  { lat: 19.0760, lng: 72.8777, name: 'Sharma Family Mumbai', city: 'Mumbai', country: 'India', members: 12, generation: 'grandparents', activity: 'Festival celebrations! 🎆', color: '#ffd54f', icon: '🏛️' },
  { lat: 28.6139, lng: 77.2090, name: 'Delhi Sharma Branch', city: 'Delhi', country: 'India', members: 8, generation: 'parents', activity: 'Kids got scholarships! 🎓', color: '#ffd54f', icon: '🏘️' },
  { lat: 25.2048, lng: 55.2708, name: 'Sharma Dubai Office', city: 'Dubai', country: 'UAE', members: 3, generation: 'children', activity: 'Growing tech startup 💻', color: '#ffd54f', icon: '🏢' },
  
  // Africa - The Hassan Family
  { lat: 30.0444, lng: 31.2357, name: 'Hassan Family Cairo', city: 'Cairo', country: 'Egypt', members: 7, generation: 'grandparents', activity: 'Teaching Arabic culture 📖', color: '#ff8a65', icon: '🕌' },
  { lat: 6.5244, lng: 3.3792, name: 'Hassan Lagos Branch', city: 'Lagos', country: 'Nigeria', members: 10, generation: 'parents', activity: 'Community leaders! 👑', color: '#ff8a65', icon: '🏘️' },
  { lat: -1.2921, lng: 36.8219, name: 'Hassan Kenya Connection', city: 'Nairobi', country: 'Kenya', members: 5, generation: 'children', activity: 'Wildlife conservation work 🦁', color: '#ff8a65', icon: '🏡' },
  
  // Australia/Oceania - The Wilson Global Family
  { lat: -33.8688, lng: 151.2093, name: 'Wilson Family Sydney', city: 'Sydney', country: 'Australia', members: 4, generation: 'parents', activity: 'Beach family vacation 🏖️', color: '#a5d6a7', icon: '🏄' },
  { lat: -37.8136, lng: 144.9631, name: 'Melbourne Wilsons', city: 'Melbourne', country: 'Australia', members: 6, generation: 'grandparents', activity: 'Grandkids visiting! 👴👵', color: '#a5d6a7', icon: '🏡' },
  
  // Additional meaningful connections
  { lat: 37.5665, lng: 126.9780, name: 'Kim Family Seoul', city: 'Seoul', country: 'South Korea', members: 5, generation: 'parents', activity: 'K-pop dance night! 💃', color: '#ffab91', icon: '🏠' },
  { lat: 55.7558, lng: 37.6176, name: 'Volkov Family Moscow', city: 'Moscow', country: 'Russia', members: 4, generation: 'grandparents', activity: 'Winter family games ❄️', color: '#80cbc4', icon: '🏘️' },
  { lat: 41.9028, lng: 12.4964, name: 'Romano Family Rome', city: 'Rome', country: 'Italy', members: 8, generation: 'parents', activity: 'Cooking traditional meals 🍝', color: '#ce93d8', icon: '🏛️' },
  { lat: 40.4168, lng: -3.7038, name: 'García Family Madrid', city: 'Madrid', country: 'Spain', members: 6, generation: 'grandparents', activity: 'Flamenco lessons! 💃', color: '#f8bbd9', icon: '🏘️' },
  { lat: 41.8781, lng: -87.6298, name: 'Johnson Family Chicago', city: 'Chicago', country: 'USA', members: 5, generation: 'children', activity: 'College reunion planned 🎓', color: '#b39ddb', icon: '🏠' },
]

// Meaningful family connections showing relationships
const familyConnections = [
  // Patel Family Network (Grandparents → Children → Grandchildren)
  { startLat: 40.7128, startLng: -74.0060, endLat: 34.0522, endLng: -118.2437, family: 'Grandparents → Son\'s Family', relationship: 'Parents to Children', color: '#ff6b35' },
  { startLat: 34.0522, startLng: -118.2437, endLat: 43.6532, endLng: -79.3832, family: 'Parents → New Parents', relationship: 'Cousins Connection', color: '#ff6b35' },
  { startLat: 40.7128, startLng: -74.0060, endLat: 43.6532, endLng: -79.3832, family: 'Great-Grandparents → New Baby', relationship: 'Great-Grandparents to Great-Grandchild', color: '#ff6b35' },
  
  // Smith Family Network (Multi-generational European family)
  { startLat: 51.5074, startLng: -0.1278, endLat: 48.8566, endLng: 2.3522, family: 'Family Estate → Wedding Planning', relationship: 'Parents to Daughter', color: '#4fc3f7' },
  { startLat: 48.8566, startLng: 2.3522, endLat: 52.5200, endLng: 13.4050, family: 'Wedding → Business Venture', relationship: 'Siblings Support', color: '#4fc3f7' },
  { startLat: 51.5074, startLng: -0.1278, endLat: 52.5200, endLng: 13.4050, family: 'Grandparents → Entrepreneurs', relationship: 'Grandparents to Grandchildren', color: '#4fc3f7' },
  
  // Chen Dynasty Connections (Multi-generational Asian family)
  { startLat: 39.9042, startLng: 116.4074, endLat: 35.6762, endLng: 139.6503, family: 'Ancestral Home → Family Traditions', relationship: 'Great-Grandparents to Grandchildren', color: '#81c784' },
  { startLat: 35.6762, startLng: 139.6503, endLat: 22.3193, endLng: 114.1694, family: 'Traditional Family → Business Success', relationship: 'Parents to Children', color: '#81c784' },
  { startLat: 22.3193, startLng: 114.1694, endLat: 1.3521, endLng: 103.8198, family: 'Business Family → Young Love', relationship: 'Siblings to Cousins', color: '#81c784' },
  { startLat: 39.9042, startLng: 116.4074, endLat: 1.3521, endLng: 103.8198, family: 'Ancestors Blessing Engagement', relationship: 'Great-Grandparents Blessing', color: '#81c784' },
  
  // Rodriguez Family Network (Latin American connections)
  { startLat: 4.7110, startLng: -74.0721, endLat: -23.5505, endLng: -46.6333, family: 'Family Recipes → Big Gathering', relationship: 'Grandparents to Children', color: '#ba68c8' },
  { startLat: -23.5505, startLng: -46.6333, endLat: -34.6037, endLng: -58.3816, family: 'Family Gathering → Music Lessons', relationship: 'Cousins Connection', color: '#ba68c8' },
  { startLat: 4.7110, startLng: -74.0721, endLat: -34.6037, endLng: -58.3816, family: 'Grandma\'s Recipes → Grandkids', relationship: 'Grandparents to Grandchildren', color: '#ba68c8' },
  
  // Sharma Family Network (Indian diaspora)
  { startLat: 19.0760, startLng: 72.8777, endLat: 28.6139, endLng: 77.2090, family: 'Festival Celebration → Scholarship News', relationship: 'Extended Family Support', color: '#ffd54f' },
  { startLat: 28.6139, startLng: 77.2090, endLat: 25.2048, endLng: 55.2708, family: 'Proud Parents → Tech Startup', relationship: 'Parents to Entrepreneur Child', color: '#ffd54f' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 25.2048, endLng: 55.2708, family: 'Family Blessings → Business Success', relationship: 'Grandparents Supporting Dreams', color: '#ffd54f' },
  
  // Hassan Family Network (African connections)
  { startLat: 30.0444, startLng: 31.2357, endLat: 6.5244, endLng: 3.3792, family: 'Cultural Heritage → Community Leadership', relationship: 'Parents to Children', color: '#ff8a65' },
  { startLat: 6.5244, startLng: 3.3792, endLat: -1.2921, endLng: 36.8219, family: 'Community Leaders → Conservation Work', relationship: 'Siblings Support', color: '#ff8a65' },
  { startLat: 30.0444, startLng: 31.2357, endLat: -1.2921, endLng: 36.8219, family: 'Teaching Culture → Protecting Nature', relationship: 'Grandparents to Grandchildren', color: '#ff8a65' },
  
  // Wilson Family Network (Australian family)
  { startLat: -37.8136, startLng: 144.9631, endLat: -33.8688, endLng: 151.2093, family: 'Grandkids Visit → Beach Vacation', relationship: 'Grandparents to Children', color: '#a5d6a7' },
  
  // Cross-family connections (Marriage and friendship bonds)
  { startLat: 40.7128, startLng: -74.0060, endLat: 51.5074, endLng: -0.1278, family: 'Patel-Smith Family Friendship', relationship: 'Family Friends', color: '#e1bee7' },
  { startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.9780, family: 'Chen-Kim Family Bond', relationship: 'Marriage Connection', color: '#f3e5f5' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 30.0444, endLng: 31.2357, family: 'Sharma-Hassan Cultural Exchange', relationship: 'Cultural Friendship', color: '#fce4ec' },
  { startLat: -23.5505, startLng: -46.6333, endLat: 41.9028, endLng: 12.4964, family: 'Rodriguez-Romano Cooking Exchange', relationship: 'Recipe Sharing', color: '#e8f5e8' },
  { startLat: 41.8781, startLng: -87.6298, endLat: 40.4168, endLng: -3.7038, family: 'Johnson-García College Friends', relationship: 'College Reunion Friends', color: '#fff3e0' },
  
  // Modern connections (Social media and video calls)
  { startLat: 43.6532, startLng: -79.3832, endLat: -37.8136, endLng: 144.9631, family: 'New Parents → Grandparent Advice', relationship: 'Video Call Support', color: '#e3f2fd' },
  { startLat: 1.3521, endLat: 55.7558, startLng: 103.8198, endLng: 37.6176, family: 'Young Couple → Winter Family', relationship: 'Social Media Connection', color: '#f1f8e9' },
  { startLat: 25.2048, startLng: 55.2708, endLat: 41.8781, endLng: -87.6298, family: 'Tech Startup → College Reunion', relationship: 'LinkedIn Professional Network', color: '#fce4ec' },
  
  // Additional heartwarming connections
  { startLat: 40.4168, startLng: -3.7038, endLat: 41.9028, endLng: 12.4964, family: 'Flamenco Lessons → Traditional Cooking', relationship: 'Grandparents Sharing Culture', color: '#fff3e0' },
  { startLat: 37.5665, startLng: 126.9780, endLat: 55.7558, endLng: 37.6176, family: 'K-pop Night → Winter Games', relationship: 'Cultural Exchange', color: '#f3e5f5' },
]


interface ProfessionalEarthGlobeProps {
  height?: number
  width?: number
}

export function ProfessionalEarthGlobe({ 
  height = 500,
  width 
}: ProfessionalEarthGlobeProps) {
  const globeRef = useRef<any>()
  const [mounted, setMounted] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  const [activeConnections, setActiveConnections] = useState(familyConnections.slice(0, 20))
  const [pulsingPoints, setPulsingPoints] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animate connections - gradually show more connections
  useEffect(() => {
    if (!globeReady) return
    
    const connectionTimer = setInterval(() => {
      setActiveConnections(prev => {
        if (prev.length >= familyConnections.length) {
          return familyConnections.slice(0, 15) // Reset to show dynamic flow
        }
        return familyConnections.slice(0, prev.length + 3) // Add 3 more connections gradually
      })
    }, 4000) // New connections every 4 seconds for smoother progression

    return () => clearInterval(connectionTimer)
  }, [globeReady])

  // Animate pulsing points - simulate live family activity
  useEffect(() => {
    if (!globeReady) return
    
    const pulseTimer = setInterval(() => {
      // Randomly select 3-5 family points to pulse
      const randomPoints = worldWideFamilyPoints
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 3)
        .map(point => ({
          ...point,
          pulseIntensity: Math.random() * 0.5 + 0.5, // Random pulse intensity
          timestamp: Date.now()
        }))
      
      setPulsingPoints(randomPoints)
    }, 3000) // New pulse pattern every 3 seconds for gentler animation

    return () => clearInterval(pulseTimer)
  }, [globeReady])

  // Removed the problematic useEffect that was causing control errors

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
          <div>Loading Earth Visualization...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative" style={{ height: `${height}px`, width: width || '100%' }}>
      <Globe
        ref={globeRef}
        height={height}
        width={width}
        backgroundColor="rgba(0,0,0,0)"
        
        // Earth appearance - night texture like the reference
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        
        // Atmosphere
        atmosphereColor="#4fc3f7"
        atmosphereAltitude={0.1}
        
        // Camera controls
        showGraticules={false}
        showAtmosphere={true}
        
        // Custom HTML Elements for Family Houses
        htmlElementsData={worldWideFamilyPoints}
        htmlLat={d => d.lat}
        htmlLng={d => d.lng}
        htmlAltitude={0.01}
        htmlElement={d => {
          const isPulsing = pulsingPoints.find(p => p.lat === d.lat && p.lng === d.lng)
          const size = isPulsing ? '32px' : '24px'
          const opacity = isPulsing ? '1' : '0.8'
          const scale = isPulsing ? 'scale(1.2)' : 'scale(1)'
          
          const el = document.createElement('div')
          el.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${size};
              height: ${size};
              font-size: ${size};
              opacity: ${opacity};
              transform: ${scale};
              transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
              text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
              filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));
              ${isPulsing ? 'animation: pulse 2s ease-in-out infinite;' : ''}
            ">
              ${d.icon}
            </div>
          `
          
          // Add CSS animation for pulsing effect
          if (isPulsing && !document.getElementById('pulse-keyframes')) {
            const style = document.createElement('style')
            style.id = 'pulse-keyframes'
            style.textContent = `
              @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
              }
            `
            document.head.appendChild(style)
          }
          
          return el
        }}
        
        // Arcs (family connections) - smooth animated connections
        arcsData={activeConnections}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => d.color}
        arcAltitude={0.1} // Consistent height for smoother look
        arcStroke={0.6} // Consistent thickness for better visibility
        arcDashLength={0.6}
        arcDashGap={1.5}
        arcDashInitialGap={(d, i) => (i * 0.2) % 3}
        arcDashAnimateTime={3000} // Consistent smooth animation speed
        
        // Arc Labels - show relationship types on connections
        arcLabel={d => d.relationship}
        arcLabelResolution={2}
        arcLabelColor={() => 'rgba(255, 255, 255, 0.9)'}
        arcLabelDotRadius={1}
        
        // Labels for family points - show family activities and relationships
        labelsData={pulsingPoints}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => `${d.name}\n${d.activity}\n${d.members} family members`}
        labelSize={1.2}
        labelColor={() => 'rgba(255, 255, 255, 1)'}
        labelResolution={3}
        labelAltitude={0.02}
        
        // Enable controls
        enablePointerInteraction={true}
        
        // Control settings with auto-rotation
        onGlobeReady={() => {
          if (globeRef.current) {
            // Set initial camera position
            globeRef.current.pointOfView({
              lat: 20,
              lng: 0,
              altitude: 2.5
            }, 1000)
            
            // Add subtle auto-rotation to show global connections
            globeRef.current.controls().autoRotate = true
            globeRef.current.controls().autoRotateSpeed = 0.5 // Very slow rotation
            
            setGlobeReady(true)
          }
        }}
      />
      
    </div>
  )
}