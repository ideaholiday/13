// Community and Social Features Types
import type { Itinerary } from './itinerary'

export interface User {
  id: string
  name: string
  username: string
  avatar?: string
  bio?: string
  location?: string
  joinedDate: string
  verified?: boolean
  stats?: {
    followers: number
    following: number
    trips: number
    reviews: number
  }
  badges?: Badge[]
}

export interface Badge {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface TravelStory {
  id: string
  title: string
  content: string
  excerpt?: string
  author: User
  destination: string
  images: string[]
  tags: string[]
  publishedAt: string
  likes: number
  comments: number
  saves: number
  readTime?: number // minutes
  featured?: boolean
}

export interface QAThread {
  id: string
  question: string
  description?: string
  author: User
  destination: string
  tags: string[]
  createdAt: string
  updatedAt?: string
  answers: Answer[]
  views: number
  followers: number
  upvotes: number
  isAnswered?: boolean
  bestAnswerId?: string
}

export interface Answer {
  id: string
  content: string
  author: User
  createdAt: string
  updatedAt?: string
  upvotes: number
  downvotes: number
  isBest?: boolean
  helpful?: number
  images?: string[]
}

export interface PublicItinerary {
  id: string
  itinerary: Itinerary
  author: User
  description: string
  visibility: 'public' | 'unlisted' | 'private'
  likes: number
  saves: number
  forks: number // how many times copied
  comments: Comment[]
  tags: string[]
  publishedAt: string
  featured?: boolean
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
  likes: number
  replies?: Comment[]
}

export interface Reaction {
  id: string
  type: 'like' | 'love' | 'helpful' | 'inspiring' | 'wow'
  emoji: string
  userId: string
  timestamp: string
}

export interface FollowRelation {
  followerId: string
  followingId: string
  followedAt: string
}

export interface SavedItem {
  id: string
  userId: string
  itemType: 'itinerary' | 'story' | 'qa' | 'destination'
  itemId: string
  savedAt: string
  collection?: string
}

export interface CommunityStats {
  totalMembers: number
  activeToday: number
  totalTrips: number
  totalStories: number
  totalQuestions: number
}

export interface DestinationCommunity {
  destination: string
  stats: CommunityStats
  featuredItineraries: PublicItinerary[]
  recentStories: TravelStory[]
  activeThreads: QAThread[]
  topContributors: User[]
}
