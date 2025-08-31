// KinConnect Type Definitions

export interface FamilyNode {
  id: string
  name: string
  surname: string
  location: {
    city: string
    state: string
    country: string
    coordinates: [number, number]
  }
  community: {
    caste?: string
    religion?: string
    language: string[]
  }
  trustScore: number
  verified: boolean
  memberCount: number
  avatar?: string
  connections: Connection[]
}

export interface Person {
  id: string
  familyId: string
  firstName: string
  lastName: string
  age: number
  gender: 'male' | 'female' | 'other'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  eligibleForMarriage: boolean
  education?: {
    degree: string
    institution: string
    field: string
  }
  profession?: {
    title: string
    company: string
    industry: string
  }
  avatar?: string
}

export interface Connection {
  id: string
  fromFamilyId: string
  toFamilyId: string
  relationshipType: 'blood' | 'marriage' | 'friendship' | 'community'
  specificRelation: string
  strength: number // 0-1
  verified: boolean
  establishedDate: string
  mutualConnections?: number
}

export interface ConnectionPath {
  path: FamilyNode[]
  degree: number
  pathStrength: number
  relationshipTypes: string[]
  isValid: boolean
}

export interface UseCase {
  id: string
  title: string
  description: string
  icon: string
  color: string
  features: string[]
  testimonial?: {
    text: string
    author: string
    location: string
  }
}

export interface AnimationConfig {
  duration: number
  delay: number
  easing: string
  stagger?: number
}

export interface NetworkStats {
  totalFamilies: number
  totalConnections: number
  averageConnections: number
  strongestPath: number
  verifiedConnections: number
}

export interface InteractiveState {
  selectedNode: FamilyNode | null
  hoveredNode: FamilyNode | null
  filterBy: 'all' | 'blood' | 'marriage' | 'friendship' | 'community'
  connectionStrength: number
  showPaths: boolean
}