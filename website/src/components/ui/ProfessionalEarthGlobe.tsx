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

// Worldwide family locations for comprehensive global network
const worldWideFamilyPoints = [
  // North America
  { lat: 40.7128, lng: -74.0060, name: 'Kumar Family', city: 'New York', country: 'USA', members: 5, color: '#ff6b35' },
  { lat: 34.0522, lng: -118.2437, name: 'Patel Family', city: 'Los Angeles', country: 'USA', members: 4, color: '#4fc3f7' },
  { lat: 43.6532, lng: -79.3832, name: 'Chen Family', city: 'Toronto', country: 'Canada', members: 6, color: '#81c784' },
  { lat: 45.5017, lng: -73.5673, name: 'Rodriguez Family', city: 'Montreal', country: 'Canada', members: 3, color: '#ba68c8' },
  { lat: 41.8781, lng: -87.6298, name: 'Johnson Family', city: 'Chicago', country: 'USA', members: 7, color: '#ffd54f' },
  
  // South America
  { lat: -23.5505, lng: -46.6333, name: 'Silva Family', city: 'São Paulo', country: 'Brazil', members: 8, color: '#ff8a65' },
  { lat: -34.6037, lng: -58.3816, name: 'Garcia Family', city: 'Buenos Aires', country: 'Argentina', members: 5, color: '#a5d6a7' },
  { lat: 4.7110, lng: -74.0721, name: 'Martinez Family', city: 'Bogotá', country: 'Colombia', members: 6, color: '#ffab91' },
  { lat: -12.0464, lng: -77.0428, name: 'Lopez Family', city: 'Lima', country: 'Peru', members: 4, color: '#80cbc4' },
  
  // Europe
  { lat: 51.5074, lng: -0.1278, name: 'Smith Family', city: 'London', country: 'UK', members: 4, color: '#ce93d8' },
  { lat: 48.8566, lng: 2.3522, name: 'Dubois Family', city: 'Paris', country: 'France', members: 5, color: '#f8bbd9' },
  { lat: 52.5200, lng: 13.4050, name: 'Mueller Family', city: 'Berlin', country: 'Germany', members: 6, color: '#b39ddb' },
  { lat: 41.9028, lng: 12.4964, name: 'Rossi Family', city: 'Rome', country: 'Italy', members: 7, color: '#90caf9' },
  { lat: 40.4168, lng: -3.7038, name: 'Fernandez Family', city: 'Madrid', country: 'Spain', members: 5, color: '#a5d6a7' },
  { lat: 55.7558, lng: 37.6176, name: 'Petrov Family', city: 'Moscow', country: 'Russia', members: 6, color: '#ffcc02' },
  
  // Asia
  { lat: 19.0760, lng: 72.8777, name: 'Sharma Family', city: 'Mumbai', country: 'India', members: 8, color: '#ff6b35' },
  { lat: 28.6139, lng: 77.2090, name: 'Singh Family', city: 'Delhi', country: 'India', members: 6, color: '#4fc3f7' },
  { lat: 35.6762, lng: 139.6503, name: 'Tanaka Family', city: 'Tokyo', country: 'Japan', members: 4, color: '#81c784' },
  { lat: 37.5665, lng: 126.9780, name: 'Kim Family', city: 'Seoul', country: 'South Korea', members: 5, color: '#ba68c8' },
  { lat: 39.9042, lng: 116.4074, name: 'Wang Family', city: 'Beijing', country: 'China', members: 7, color: '#ffd54f' },
  { lat: 31.2304, lng: 121.4737, name: 'Li Family', city: 'Shanghai', country: 'China', members: 6, color: '#ff8a65' },
  { lat: 22.3193, lng: 114.1694, name: 'Wong Family', city: 'Hong Kong', country: 'China', members: 4, color: '#a5d6a7' },
  { lat: 1.3521, lng: 103.8198, name: 'Tan Family', city: 'Singapore', country: 'Singapore', members: 5, color: '#ffab91' },
  { lat: 13.7563, lng: 100.5018, name: 'Phan Family', city: 'Bangkok', country: 'Thailand', members: 6, color: '#80cbc4' },
  { lat: -6.2088, lng: 106.8456, name: 'Sari Family', city: 'Jakarta', country: 'Indonesia', members: 7, color: '#ce93d8' },
  
  // Middle East & Africa
  { lat: 25.2048, lng: 55.2708, name: 'Agarwal Family', city: 'Dubai', country: 'UAE', members: 7, color: '#f8bbd9' },
  { lat: 30.0444, lng: 31.2357, name: 'Hassan Family', city: 'Cairo', country: 'Egypt', members: 5, color: '#b39ddb' },
  { lat: 33.6844, lng: 73.0479, name: 'Khan Family', city: 'Islamabad', country: 'Pakistan', members: 6, color: '#90caf9' },
  { lat: -26.2041, lng: 28.0473, name: 'Mthembu Family', city: 'Johannesburg', country: 'South Africa', members: 8, color: '#ffcc02' },
  { lat: 6.5244, lng: 3.3792, name: 'Adebayo Family', city: 'Lagos', country: 'Nigeria', members: 9, color: '#ff6b35' },
  { lat: -1.2921, lng: 36.8219, name: 'Kimani Family', city: 'Nairobi', country: 'Kenya', members: 6, color: '#4fc3f7' },
  
  // Oceania
  { lat: -33.8688, lng: 151.2093, name: 'Gupta Family', city: 'Sydney', country: 'Australia', members: 3, color: '#81c784' },
  { lat: -37.8136, lng: 144.9631, name: 'Wilson Family', city: 'Melbourne', country: 'Australia', members: 4, color: '#ba68c8' },
  { lat: -36.8485, lng: 174.7633, name: 'Taylor Family', city: 'Auckland', country: 'New Zealand', members: 5, color: '#ffd54f' },
]

// 100 family connections spanning worldwide
const familyConnections = [
  // Major intercontinental connections
  { startLat: 19.0760, startLng: 72.8777, endLat: 40.7128, endLng: -74.0060, family: 'Mumbai → New York', color: '#ff6b35' },
  { startLat: 51.5074, startLng: -0.1278, endLat: 35.6762, endLng: 139.6503, family: 'London → Tokyo', color: '#4fc3f7' },
  { startLat: 28.6139, startLng: 77.2090, endLat: -33.8688, endLng: 151.2093, family: 'Delhi → Sydney', color: '#81c784' },
  { startLat: 48.8566, startLng: 2.3522, endLat: -23.5505, endLng: -46.6333, family: 'Paris → São Paulo', color: '#ba68c8' },
  { startLat: 25.2048, startLng: 55.2708, endLat: 43.6532, endLng: -79.3832, family: 'Dubai → Toronto', color: '#ffd54f' },
  
  // Asia-Pacific connections
  { startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.9780, family: 'Tokyo → Seoul', color: '#ff8a65' },
  { startLat: 39.9042, startLng: 116.4074, endLat: 31.2304, endLng: 121.4737, family: 'Beijing → Shanghai', color: '#a5d6a7' },
  { startLat: 22.3193, startLng: 114.1694, endLat: 1.3521, endLng: 103.8198, family: 'Hong Kong → Singapore', color: '#ffab91' },
  { startLat: 13.7563, startLng: 100.5018, endLat: -6.2088, endLng: 106.8456, family: 'Bangkok → Jakarta', color: '#80cbc4' },
  { startLat: -33.8688, startLng: 151.2093, endLat: -37.8136, endLng: 144.9631, family: 'Sydney → Melbourne', color: '#ce93d8' },
  
  // European connections
  { startLat: 51.5074, startLng: -0.1278, endLat: 48.8566, endLng: 2.3522, family: 'London → Paris', color: '#f8bbd9' },
  { startLat: 52.5200, startLng: 13.4050, endLat: 41.9028, endLng: 12.4964, family: 'Berlin → Rome', color: '#b39ddb' },
  { startLat: 40.4168, startLng: -3.7038, endLat: 55.7558, endLng: 37.6176, family: 'Madrid → Moscow', color: '#90caf9' },
  { startLat: 48.8566, startLng: 2.3522, endLat: 52.5200, endLng: 13.4050, family: 'Paris → Berlin', color: '#ffcc02' },
  { startLat: 41.9028, startLng: 12.4964, endLat: 40.4168, endLng: -3.7038, family: 'Rome → Madrid', color: '#ff6b35' },
  
  // North American connections
  { startLat: 40.7128, startLng: -74.0060, endLat: 34.0522, endLng: -118.2437, family: 'New York → Los Angeles', color: '#4fc3f7' },
  { startLat: 43.6532, startLng: -79.3832, endLat: 45.5017, endLng: -73.5673, family: 'Toronto → Montreal', color: '#81c784' },
  { startLat: 41.8781, startLng: -87.6298, endLat: 40.7128, endLng: -74.0060, family: 'Chicago → New York', color: '#ba68c8' },
  { startLat: 34.0522, startLng: -118.2437, endLat: 43.6532, endLng: -79.3832, family: 'Los Angeles → Toronto', color: '#ffd54f' },
  { startLat: 45.5017, startLng: -73.5673, endLat: 41.8781, endLng: -87.6298, family: 'Montreal → Chicago', color: '#ff8a65' },
  
  // South American connections
  { startLat: -23.5505, startLng: -46.6333, endLat: -34.6037, endLng: -58.3816, family: 'São Paulo → Buenos Aires', color: '#a5d6a7' },
  { startLat: 4.7110, startLng: -74.0721, endLat: -12.0464, endLng: -77.0428, family: 'Bogotá → Lima', color: '#ffab91' },
  { startLat: -34.6037, startLng: -58.3816, endLat: 4.7110, endLng: -74.0721, family: 'Buenos Aires → Bogotá', color: '#80cbc4' },
  { startLat: -12.0464, startLng: -77.0428, endLat: -23.5505, endLng: -46.6333, family: 'Lima → São Paulo', color: '#ce93d8' },
  
  // Africa-Middle East connections
  { startLat: 30.0444, startLng: 31.2357, endLat: 25.2048, endLng: 55.2708, family: 'Cairo → Dubai', color: '#f8bbd9' },
  { startLat: 6.5244, startLng: 3.3792, endLat: -26.2041, endLng: 28.0473, family: 'Lagos → Johannesburg', color: '#b39ddb' },
  { startLat: -1.2921, startLng: 36.8219, endLat: 30.0444, endLng: 31.2357, family: 'Nairobi → Cairo', color: '#90caf9' },
  { startLat: 33.6844, startLng: 73.0479, endLat: 25.2048, endLng: 55.2708, family: 'Islamabad → Dubai', color: '#ffcc02' },
  
  // Cross-continental connections (India-World)
  { startLat: 19.0760, startLng: 72.8777, endLat: 51.5074, endLng: -0.1278, family: 'Mumbai → London', color: '#ff6b35' },
  { startLat: 28.6139, startLng: 77.2090, endLat: 43.6532, endLng: -79.3832, family: 'Delhi → Toronto', color: '#4fc3f7' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 25.2048, endLng: 55.2708, family: 'Mumbai → Dubai', color: '#81c784' },
  { startLat: 28.6139, startLng: 77.2090, endLat: 35.6762, endLng: 139.6503, family: 'Delhi → Tokyo', color: '#ba68c8' },
  { startLat: 19.0760, startLng: 72.8777, endLat: 48.8566, endLng: 2.3522, family: 'Mumbai → Paris', color: '#ffd54f' },
  
  // More Asia connections
  { startLat: 39.9042, startLng: 116.4074, endLat: 35.6762, endLng: 139.6503, family: 'Beijing → Tokyo', color: '#ff8a65' },
  { startLat: 37.5665, startLng: 126.9780, endLat: 31.2304, endLng: 121.4737, family: 'Seoul → Shanghai', color: '#a5d6a7' },
  { startLat: 1.3521, startLng: 103.8198, endLat: 22.3193, endLng: 114.1694, family: 'Singapore → Hong Kong', color: '#ffab91' },
  { startLat: -6.2088, startLng: 106.8456, endLat: 13.7563, endLng: 100.5018, family: 'Jakarta → Bangkok', color: '#80cbc4' },
  { startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, family: 'Tokyo → Sydney', color: '#ce93d8' },
  
  // Europe-Africa connections
  { startLat: 51.5074, startLng: -0.1278, endLat: 30.0444, endLng: 31.2357, family: 'London → Cairo', color: '#f8bbd9' },
  { startLat: 48.8566, startLng: 2.3522, endLat: 6.5244, endLng: 3.3792, family: 'Paris → Lagos', color: '#b39ddb' },
  { startLat: 41.9028, startLng: 12.4964, endLat: -1.2921, endLng: 36.8219, family: 'Rome → Nairobi', color: '#90caf9' },
  { startLat: 52.5200, startLng: 13.4050, endLat: -26.2041, endLng: 28.0473, family: 'Berlin → Johannesburg', color: '#ffcc02' },
  
  // North America-Asia connections
  { startLat: 34.0522, startLng: -118.2437, endLat: 35.6762, endLng: 139.6503, family: 'Los Angeles → Tokyo', color: '#ff6b35' },
  { startLat: 43.6532, startLng: -79.3832, endLat: 39.9042, endLng: 116.4074, family: 'Toronto → Beijing', color: '#4fc3f7' },
  { startLat: 41.8781, startLng: -87.6298, endLat: 37.5665, endLng: 126.9780, family: 'Chicago → Seoul', color: '#81c784' },
  { startLat: 45.5017, startLng: -73.5673, endLat: 22.3193, endLng: 114.1694, family: 'Montreal → Hong Kong', color: '#ba68c8' },
  
  // South America-Europe connections
  { startLat: -23.5505, startLng: -46.6333, endLat: 51.5074, endLng: -0.1278, family: 'São Paulo → London', color: '#ffd54f' },
  { startLat: -34.6037, startLng: -58.3816, endLat: 48.8566, endLng: 2.3522, family: 'Buenos Aires → Paris', color: '#ff8a65' },
  { startLat: 4.7110, startLng: -74.0721, endLat: 40.4168, endLng: -3.7038, family: 'Bogotá → Madrid', color: '#a5d6a7' },
  { startLat: -12.0464, startLng: -77.0428, endLat: 41.9028, endLng: 12.4964, family: 'Lima → Rome', color: '#ffab91' },
  
  // Australia-Asia connections
  { startLat: -37.8136, startLng: 144.9631, endLat: 1.3521, endLng: 103.8198, family: 'Melbourne → Singapore', color: '#80cbc4' },
  { startLat: -36.8485, startLng: 174.7633, endLat: 13.7563, endLng: 100.5018, family: 'Auckland → Bangkok', color: '#ce93d8' },
  { startLat: -33.8688, startLng: 151.2093, endLat: -6.2088, endLng: 106.8456, family: 'Sydney → Jakarta', color: '#f8bbd9' },
  
  // Middle East connections
  { startLat: 25.2048, startLng: 55.2708, endLat: 30.0444, endLng: 31.2357, family: 'Dubai → Cairo', color: '#b39ddb' },
  { startLat: 33.6844, startLng: 73.0479, endLat: 28.6139, endLng: 77.2090, family: 'Islamabad → Delhi', color: '#90caf9' },
  
  // Additional regional connections
  { startLat: 19.0760, startLng: 72.8777, endLat: 28.6139, endLng: 77.2090, family: 'Mumbai → Delhi', color: '#ffcc02' },
  { startLat: 52.5200, startLng: 13.4050, endLat: 48.8566, endLng: 2.3522, family: 'Berlin → Paris', color: '#ff6b35' },
  { startLat: 40.7128, startLng: -74.0060, endLat: 43.6532, endLng: -79.3832, family: 'New York → Toronto', color: '#4fc3f7' },
  { startLat: 31.2304, startLng: 121.4737, endLat: 22.3193, endLng: 114.1694, family: 'Shanghai → Hong Kong', color: '#81c784' },
  { startLat: -23.5505, startLng: -46.6333, endLat: 4.7110, endLng: -74.0721, family: 'São Paulo → Bogotá', color: '#ba68c8' },
  
  // More intercontinental connections
  { startLat: 55.7558, startLng: 37.6176, endLat: 39.9042, endLng: 116.4074, family: 'Moscow → Beijing', color: '#ffd54f' },
  { startLat: 6.5244, startLng: 3.3792, endLat: 19.0760, endLng: 72.8777, family: 'Lagos → Mumbai', color: '#ff8a65' },
  { startLat: -26.2041, startLng: 28.0473, endLat: -33.8688, endLng: 151.2093, family: 'Johannesburg → Sydney', color: '#a5d6a7' },
  { startLat: -1.2921, startLng: 36.8219, endLat: 25.2048, endLng: 55.2708, family: 'Nairobi → Dubai', color: '#ffab91' },
  { startLat: 34.0522, startLng: -118.2437, endLat: -36.8485, endLng: 174.7633, family: 'Los Angeles → Auckland', color: '#80cbc4' },
  
  // Final connections to reach 100
  { startLat: 45.5017, startLng: -73.5673, endLat: 51.5074, endLng: -0.1278, family: 'Montreal → London', color: '#ce93d8' },
  { startLat: 13.7563, startLng: 100.5018, endLat: 19.0760, endLng: 72.8777, family: 'Bangkok → Mumbai', color: '#f8bbd9' },
  { startLat: 37.5665, startLng: 126.9780, endLat: -37.8136, endLng: 144.9631, family: 'Seoul → Melbourne', color: '#b39ddb' },
  { startLat: 30.0444, startLng: 31.2357, endLat: 55.7558, endLng: 37.6176, family: 'Cairo → Moscow', color: '#90caf9' },
  { startLat: -12.0464, startLng: -77.0428, endLat: 40.7128, endLng: -74.0060, family: 'Lima → New York', color: '#ffcc02' },
  
  { startLat: 1.3521, startLng: 103.8198, endLat: 51.5074, endLng: -0.1278, family: 'Singapore → London', color: '#ff6b35' },
  { startLat: -34.6037, startLng: -58.3816, endLat: 35.6762, endLng: 139.6503, family: 'Buenos Aires → Tokyo', color: '#4fc3f7' },
  { startLat: 41.8781, startLng: -87.6298, endLat: 48.8566, endLng: 2.3522, family: 'Chicago → Paris', color: '#81c784' },
  { startLat: 22.3193, startLng: 114.1694, endLat: -23.5505, endLng: -46.6333, family: 'Hong Kong → São Paulo', color: '#ba68c8' },
  { startLat: 33.6844, startLng: 73.0479, endLat: 43.6532, endLng: -79.3832, family: 'Islamabad → Toronto', color: '#ffd54f' },
  
  { startLat: -6.2088, startLng: 106.8456, endLat: 40.4168, endLng: -3.7038, family: 'Jakarta → Madrid', color: '#ff8a65' },
  { startLat: 41.9028, startLng: 12.4964, endLat: -26.2041, endLng: 28.0473, family: 'Rome → Johannesburg', color: '#a5d6a7' },
  { startLat: -36.8485, startLng: 174.7633, endLat: 31.2304, endLng: 121.4737, family: 'Auckland → Shanghai', color: '#ffab91' },
  { startLat: 4.7110, startLng: -74.0721, endLat: 52.5200, endLng: 13.4050, family: 'Bogotá → Berlin', color: '#80cbc4' },
  { startLat: 6.5244, startLng: 3.3792, endLat: 39.9042, endLng: 116.4074, family: 'Lagos → Beijing', color: '#ce93d8' },
  
  { startLat: -37.8136, startLng: 144.9631, endLat: 25.2048, endLng: 55.2708, family: 'Melbourne → Dubai', color: '#f8bbd9' },
  { startLat: 45.5017, startLng: -73.5673, endLat: 35.6762, endLng: 139.6503, family: 'Montreal → Tokyo', color: '#b39ddb' },
  { startLat: 30.0444, startLng: 31.2357, endLat: -33.8688, endLng: 151.2093, family: 'Cairo → Sydney', color: '#90caf9' },
  { startLat: 13.7563, startLng: 100.5018, endLat: 34.0522, endLng: -118.2437, family: 'Bangkok → Los Angeles', color: '#ffcc02' },
  { startLat: -1.2921, startLng: 36.8219, endLat: 41.8781, endLng: -87.6298, family: 'Nairobi → Chicago', color: '#ff6b35' },
  
  { startLat: 55.7558, startLng: 37.6176, endLat: -12.0464, endLng: -77.0428, family: 'Moscow → Lima', color: '#4fc3f7' },
  { startLat: 37.5665, startLng: 126.9780, endLat: 4.7110, endLng: -74.0721, family: 'Seoul → Bogotá', color: '#81c784' },
  { startLat: 1.3521, startLng: 103.8198, endLat: -34.6037, endLng: -58.3816, family: 'Singapore → Buenos Aires', color: '#ba68c8' },
  { startLat: 33.6844, startLng: 73.0479, endLat: -36.8485, endLng: 174.7633, family: 'Islamabad → Auckland', color: '#ffd54f' },
  { startLat: 22.3193, startLng: 114.1694, endLat: 6.5244, endLng: 3.3792, family: 'Hong Kong → Lagos', color: '#ff8a65' },
  
  // Final 10 connections to complete 100
  { startLat: -6.2088, startLng: 106.8456, endLat: 45.5017, endLng: -73.5673, family: 'Jakarta → Montreal', color: '#a5d6a7' },
  { startLat: 25.2048, startLng: 55.2708, endLat: -37.8136, endLng: 144.9631, family: 'Dubai → Melbourne', color: '#ffab91' },
  { startLat: 31.2304, startLng: 121.4737, endLat: -12.0464, endLng: -77.0428, family: 'Shanghai → Lima', color: '#80cbc4' },
  { startLat: -23.5505, startLng: -46.6333, endLat: 37.5665, endLng: 126.9780, family: 'São Paulo → Seoul', color: '#ce93d8' },
  { startLat: 40.4168, startLng: -3.7038, endLat: -1.2921, endLng: 36.8219, family: 'Madrid → Nairobi', color: '#f8bbd9' },
  
  { startLat: 39.9042, startLng: 116.4074, endLat: -34.6037, endLng: -58.3816, family: 'Beijing → Buenos Aires', color: '#b39ddb' },
  { startLat: 41.8781, startLng: -87.6298, endLat: 13.7563, endLng: 100.5018, family: 'Chicago → Bangkok', color: '#90caf9' },
  { startLat: 48.8566, startLng: 2.3522, endLat: -36.8485, endLng: 174.7633, family: 'Paris → Auckland', color: '#ffcc02' },
  { startLat: 34.0522, startLng: -118.2437, endLat: 30.0444, endLng: 31.2357, family: 'Los Angeles → Cairo', color: '#ff6b35' },
  { startLat: -26.2041, startLng: 28.0473, endLat: 28.6139, endLng: 77.2090, family: 'Johannesburg → Delhi', color: '#4fc3f7' },
]

// Family location points
const familyPoints = [
  { lat: 19.0760, lng: 72.8777, name: 'Sharma Family', city: 'Mumbai', country: 'India', members: 8, color: '#ff6b35' },
  { lat: 28.6139, lng: 77.2090, name: 'Singh Family', city: 'Delhi', country: 'India', members: 6, color: '#4fc3f7' },
  { lat: 51.5074, lng: -0.1278, name: 'Patel Family', city: 'London', country: 'UK', members: 4, color: '#81c784' },
  { lat: 40.7128, lng: -74.0060, name: 'Kumar Family', city: 'New York', country: 'USA', members: 5, color: '#ba68c8' },
  { lat: -33.8688, lng: 151.2093, name: 'Gupta Family', city: 'Sydney', country: 'Australia', members: 3, color: '#ffd54f' },
  { lat: 43.6532, lng: -79.3832, name: 'Chen Family', city: 'Toronto', country: 'Canada', members: 5, color: '#ff8a65' },
  { lat: 35.6762, lng: 139.6503, name: 'Tanaka Family', city: 'Tokyo', country: 'Japan', members: 4, color: '#a5d6a7' },
  { lat: 25.2048, lng: 55.2708, name: 'Agarwal Family', city: 'Dubai', country: 'UAE', members: 7, color: '#ffab91' },
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

  useEffect(() => {
    setMounted(true)
  }, [])

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
        
        // Points (family locations)
        pointsData={familyPoints}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointAltitude={0}
        pointRadius={0.15}
        pointColor={d => d.color}
        pointResolution={8}
        
        // Arcs (family connections) - exactly like airline routes
        arcsData={familyConnections}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => d.color}
        arcAltitude={0.1}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashInitialGap={(d, i) => (i * 0.5) % 5}
        arcDashAnimateTime={4000}
        
        // Labels for family points
        labelsData={familyPoints}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => `${d.name} (${d.members})`}
        labelSize={0.8}
        labelColor={() => 'rgba(255, 255, 255, 0.9)'}
        labelResolution={3}
        labelAltitude={0.01}
        
        // Enable controls
        enablePointerInteraction={true}
        
        // Control settings
        onGlobeReady={() => {
          if (globeRef.current) {
            // Set initial camera position
            globeRef.current.pointOfView({
              lat: 20,
              lng: 0,
              altitude: 2.5
            }, 1000)
            setGlobeReady(true)
          }
        }}
      />
      
    </div>
  )
}