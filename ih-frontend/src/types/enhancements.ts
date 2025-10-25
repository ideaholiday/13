// Enhanced types for 2025 features

// AI-Driven Personalisation
export interface Recommendation {
  id: string
  type: 'flight' | 'hotel' | 'package'
  title: string
  description: string
  destination: string
  price: number
  currency: string
  image: string
  tags: string[]
  score: number // relevance score 0-100
  reason: string // why recommended
}

// Real-Time Notifications
export interface Notification {
  id: string
  type: 'flight_status' | 'price_drop' | 'gate_change' | 'travel_advisory' | 'booking_update' | 'general'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
  metadata?: {
    bookingId?: string
    flightNumber?: string
    oldPrice?: number
    newPrice?: number
  }
}

// Immersive Experiences
export interface Image360 {
  id: string
  url: string
  title: string
  description?: string
  type: 'room' | 'lobby' | 'restaurant' | 'pool' | 'beach' | 'landmark'
}

export interface VRTour {
  id: string
  name: string
  images: Image360[]
  duration: number // seconds
  thumbnailUrl: string
}

// Sustainability & Eco Ratings
export interface EcoRating {
  score: number // 0-100
  level: 'low' | 'medium' | 'high' | 'excellent'
  certifications: string[]
  features: string[] // e.g. "Solar powered", "Water conservation"
  carbonOffset: boolean
}

export interface CarbonEmission {
  totalKg: number
  perPassengerKg: number
  comparison: string // e.g. "20% less than average"
  offsetCost?: number
  offsetAvailable: boolean
}

// Community & Social Features
export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number // 1-5
  title: string
  content: string
  images?: string[]
  helpful: number
  date: string
  verified: boolean
  tripType?: 'solo' | 'couple' | 'family' | 'business'
  response?: {
    from: string
    content: string
    date: string
  }
}

export interface ForumPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  title: string
  content: string
  category: 'tips' | 'question' | 'experience' | 'recommendation'
  destination: string
  replies: ForumReply[]
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

export interface ForumReply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  createdAt: string
}

// Multi-Language & Currency
export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  flag: string
}

export interface CurrencyOption {
  code: string
  symbol: string
  name: string
  rate: number // conversion rate from base currency (INR)
}

export interface LocalePreferences {
  language: string
  currency: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
}

// Chatbot
export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  message: string
  timestamp: string
  options?: ChatOption[]
  metadata?: any
}

export interface ChatOption {
  label: string
  value: string
  action?: 'navigate' | 'search' | 'reply'
}

export interface ChatContext {
  intent?: string
  entities?: Record<string, any>
  lastTopic?: string
}

// Trust & Booking Elements
export interface TrustBadge {
  id: string
  name: string
  icon: string
  description: string
  type: 'secure_payment' | 'verified' | 'refund_policy' | 'customer_support' | 'best_price'
}

export interface BookingProgress {
  currentStep: number
  totalSteps: number
  steps: BookingStep[]
}

export interface BookingStep {
  id: number
  name: string
  description: string
  completed: boolean
  active: boolean
}

// Offline Support
export interface OfflineBooking {
  id: string
  type: 'flight' | 'hotel' | 'package'
  data: any
  lastSynced: string
  syncStatus: 'synced' | 'pending' | 'error'
}

// Extended existing types
export interface EnhancedFlightResult {
  // ... existing flight fields
  carbonEmission?: CarbonEmission
  ecoRating?: EcoRating
}

export interface EnhancedHotelResult {
  // ... existing hotel fields
  ecoRating?: EcoRating
  tours360?: VRTour[]
  reviews?: Review[]
  sustainabilityScore?: number
}

export interface EnhancedPackage {
  // ... existing package fields
  ecoRating?: EcoRating
  carbonEmission?: CarbonEmission
  reviews?: Review[]
  tours360?: VRTour[]
}
