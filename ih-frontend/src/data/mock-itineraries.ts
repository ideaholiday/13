import type { Itinerary, Activity, DayPlan } from '@/types/itinerary'

// Mock itineraries for different destinations
export const mockItineraries: Record<string, Itinerary> = {
  dubai: {
    id: 'itin-dubai-5d',
    title: '5 Days in Dubai: City, Culture & Adventure',
    description: 'Explore Dubai’s top sights, shopping, and desert adventures.',
    destination: 'Dubai',
    duration: 5,
    tags: ['city', 'shopping', 'adventure', 'culture'],
    days: [], // Fill with day plans as needed
    totalCost: { amount: 120000, currency: 'INR' },
    createdAt: '2025-10-17T10:00:00Z',
    updatedAt: '2025-10-17T10:00:00Z',
    isPublic: true
  },
  thailand: {
    id: 'itin-thailand-5d',
    title: '5 Days in Thailand: Beaches & Temples',
    description: 'Discover Thailand’s best beaches, temples, and street food.',
    destination: 'Thailand',
    duration: 5,
    tags: ['beach', 'temple', 'food', 'adventure'],
    days: [],
    totalCost: { amount: 95000, currency: 'INR' },
    createdAt: '2025-10-17T10:00:00Z',
    updatedAt: '2025-10-17T10:00:00Z',
    isPublic: true
  },

  bali: {
    id: 'itin-bali-7d',
    title: '7 Days in Bali: Wellness & Adventure',
    description: 'Perfect balance of relaxation, culture, and adventure in the Island of Gods',
    destination: 'Bali',
    duration: 7,
    tags: ['wellness', 'adventure', 'culture', 'beach', 'yoga'],
    difficulty: 'moderate',
    pace: 'relaxed',
  days: [],
    totalCost: {
      amount: 85000,
      currency: 'INR',
      breakdown: {
        flights: 25000,
        accommodation: 28000,
        activities: 18000,
        meals: 10000,
        transport: 4000
      }
    },
    createdAt: '2025-10-16T10:00:00Z',
    updatedAt: '2025-10-16T10:00:00Z',
    isPublic: true
  },
}

// Prompt templates for quick suggestions
export const promptTemplates = [
  '5 days in Dubai trip',
  '5 days Thailand itinerary',
  '4 days Goa holiday',
  '3 day Singapore tour',
  'Singapore best sightseeing',
  'Thailand attraction',
  'List of sightseeing of Thailand',
  '5 days in Japan with food and anime',
  '7 days romantic Bali honeymoon',
  '10 days adventure in New Zealand',
  '3 days shopping and sightseeing in Dubai',
  '14 days backpacking through Southeast Asia',
  '5 days family-friendly Singapore',
  '4 days luxury Paris getaway'
]

// AI-generated activity suggestions (mock)
export const activitySuggestions: Record<string, Activity[]> = {
  tokyo: [
    {
      id: 'sug-tk-1',
      type: 'attraction',
      title: 'Tokyo Skytree',
      description: 'Tallest structure in Japan with observation decks',
      location: {
        id: 'loc-skytree',
        name: 'Tokyo Skytree',
        city: 'Tokyo',
        country: 'Japan'
      },
      timeSlot: { start: '10:00', end: '12:00' },
      cost: { amount: 2100, currency: 'JPY' },
      rating: 4.7,
      reviews: 45231,
      tags: ['views', 'landmark', 'photo-spot']
    },
    {
      id: 'sug-tk-2',
      type: 'cultural',
      title: 'Senso-ji Temple',
      description: 'Tokyo\'s oldest and most famous Buddhist temple',
      location: {
        id: 'loc-sensoji',
        name: 'Senso-ji Temple',
        city: 'Tokyo',
        country: 'Japan'
      },
      timeSlot: { start: '09:00', end: '11:00' },
      rating: 4.8,
      reviews: 67890,
      tags: ['temple', 'culture', 'history', 'free']
    }
  ]
}
