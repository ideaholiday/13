// Itinerary and Trip Planning Types

export interface Location {
  id: string
  name: string
  city: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string
  duration?: number // minutes
}

export interface Activity {
  id: string
  type: 'attraction' | 'meal' | 'transport' | 'accommodation' | 'shopping' | 'adventure' | 'cultural' | 'relaxation'
  title: string
  description: string
  location: Location
  timeSlot: TimeSlot
  cost?: {
    amount: number
    currency: string
    priceLevel?: 'budget' | 'moderate' | 'premium' | 'luxury'
  }
  images?: string[]
  tags?: string[]
  bookingRequired?: boolean
  bookingUrl?: string
  rating?: number
  reviews?: number
  
  // Enhanced fields for comprehensive itinerary
  openingHours?: string
  estimatedDuration?: string // e.g., "2-3 hours"
  navigationTip?: string // How to get there
  standoutFeature?: string // For meals: signature dish, for attractions: must-see
  localTip?: string // Insider advice
  crowdLevel?: 'low' | 'moderate' | 'high'
  bestTimeToVisit?: string
  alternative?: {
    title: string
    description: string
    reason: string // e.g., "If it rains", "Budget option"
  }
}

export interface DayPlan {
  id: string
  dayNumber: number
  date: string // YYYY-MM-DD format
  title: string
  description?: string
  activities: Activity[]
  dayBullets?: string[]
  
  // Time-block organization
  morning?: Activity[]
  afternoon?: Activity[]
  evening?: Activity[]
  
  accommodation?: {
    id: string
    name: string
    type: 'budget' | 'boutique' | 'resort' | 'heritage' | 'eco' | 'luxury'
    checkIn: string
    checkOut: string
    location: Location
    images?: string[]
    rating?: number
    priceLevel?: 'budget' | 'mid' | 'premium'
    bookingTip?: string
  }
  
  // Transportation for the day
  transportation?: {
    intraCityTips?: string // Metro, auto, walking advice
    interCityConnection?: {
      type: 'train' | 'bus' | 'flight' | 'car'
      from: string
      to: string
      estimatedTime: string
      cost?: number
    }
    mapLink?: string
  }
  
  totalCost?: {
    amount: number
    currency: string
  }
  notes?: string
  safetyTips?: string[] // Especially for solo/women travelers
  localPhrases?: { phrase: string; translation: string; pronunciation?: string }[]
}

export interface Itinerary {
  id: string
  title: string
  description: string
  destination: string
  duration: number // days
  durationNights?: number // e.g., "5 Days / 4 Nights"
  startDate?: string
  endDate?: string
  days: DayPlan[]
  
  // Traveler profiling
  travelerType?: 'solo' | 'couple' | 'family' | 'friends' | 'solo_woman' | 'gen_z' | 'senior'
  themeTags?: ('adventure' | 'beach' | 'culture' | 'food' | 'wellness' | 'shopping' | 'nature' | 'nightlife' | 'photography' | 'spiritual')[]
  
  totalCost?: {
    amount: number
    currency: string
    breakdown?: {
      flights: number
      accommodation: number
      activities: number
      meals: number
      transport: number
    }
  }
  tags: string[]
  difficulty?: 'easy' | 'moderate' | 'challenging'
  pace?: 'relaxed' | 'moderate' | 'fast-paced'
  preferences?: string[]
  
  // Smart enhancements
  weatherConsiderations?: string
  bestMonthsToVisit?: string[]
  scamAlerts?: string[]
  hiddenGems?: { title: string; description: string; dayNumber?: number }[]
  packingList?: string[]
  visaRequirements?: string
  vaccinations?: string[]
  // Documents and support
  documentsRequired?: string[]
  embassyContact?: {
    name: string
    country?: string
    city?: string
    website?: string
    directoryUrl?: string
    emergencyRegistration?: string
    email?: string
    phone?: string
    address?: string
    hours?: string
    notes?: string
  }
  
  // Alternative versions
  alternatives?: {
    budget?: { description: string; estimatedSavings: number }
    luxury?: { description: string; estimatedCost: number }
    rainyDay?: { description: string; swappableActivities: string[] }
  }
  
  createdBy?: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  isPublic?: boolean
  likes?: number
  saves?: number
  views?: number
}

export interface TripPlannerPrompt {
  destination: string
  duration?: number
  interests?: string[]
  budget?: 'budget' | 'moderate' | 'luxury'
  pace?: 'relaxed' | 'moderate' | 'fast-paced'
  travelers?: {
    adults: number
    children?: number
  }
  startDate?: string
  preferences?: string[]
  freeText?: string
}

export interface GenerateItineraryRequest {
  prompt: string
  parsed?: TripPlannerPrompt
}

export interface GenerateItineraryResponse {
  success: boolean
  data?: Itinerary
  error?: string
  suggestions?: string[]
}

// Drag and Drop Types
export interface DragItem {
  type: 'activity'
  activity: Activity
  sourceDayId: string
  sourceIndex: number
}

export interface DropResult {
  targetDayId: string
  targetIndex: number
}
