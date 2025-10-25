import {
  Recommendation,
  Notification,
  Review,
  ForumPost,
  EcoRating,
  CarbonEmission,
  VRTour,
  Image360,
  TrustBadge,
  LanguageOption,
  CurrencyOption
} from '@/types/enhancements'

// AI-Driven Recommendations Mock Data
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_1',
    type: 'package',
    title: 'Romantic Maldives Getaway',
    description: '5 nights in overwater villa with spa treatments',
    destination: 'Maldives',
    price: 125000,
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    tags: ['beach', 'luxury', 'romantic', 'honeymoon'],
    score: 95,
    reason: 'Based on your recent searches for beach destinations'
  },
  {
    id: 'rec_2',
    type: 'flight',
    title: 'Dubai Flash Sale',
    description: 'Direct flights to Dubai - Limited time offer',
    destination: 'Dubai',
    price: 18500,
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    tags: ['city', 'shopping', 'adventure'],
    score: 88,
    reason: 'Popular destination among travellers like you'
  },
  {
    id: 'rec_3',
    type: 'hotel',
    title: 'The Oberoi, Goa',
    description: '4-star luxury resort with private beach access',
    destination: 'Goa',
    price: 12000,
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    tags: ['beach', 'resort', 'family-friendly'],
    score: 85,
    reason: 'Matches your preference for beach resorts'
  },
  {
    id: 'rec_4',
    type: 'package',
    title: 'Singapore Adventure',
    description: '4 nights with Universal Studios and Gardens by the Bay',
    destination: 'Singapore',
    price: 45000,
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
    tags: ['city', 'family', 'adventure', 'theme-park'],
    score: 82,
    reason: 'Perfect for families with kids'
  }
]

// Real-Time Notifications Mock Data
export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    type: 'flight_status',
    title: 'Gate Changed',
    message: 'Your flight AI-203 gate has been changed from G12 to G15',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/account/bookings/BK12345',
    priority: 'high',
    metadata: {
      bookingId: 'BK12345',
      flightNumber: 'AI-203'
    }
  },
  {
    id: 'notif_2',
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: 'Your saved flight to Dubai is now ₹2,500 cheaper!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/flights',
    priority: 'medium',
    metadata: {
      oldPrice: 21000,
      newPrice: 18500
    }
  },
  {
    id: 'notif_3',
    type: 'travel_advisory',
    title: 'Travel Advisory: Bali',
    message: 'Monsoon alert for Bali region. Check weather conditions.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium'
  },
  {
    id: 'notif_4',
    type: 'booking_update',
    title: 'Booking Confirmed',
    message: 'Your hotel booking at The Taj has been confirmed',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/account/bookings/BK12346',
    priority: 'low',
    metadata: {
      bookingId: 'BK12346'
    }
  }
]

// Reviews Mock Data
export const mockReviews: Review[] = [
  {
    id: 'rev_1',
    userId: 'user_1',
    userName: 'Priya Sharma',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    title: 'Amazing experience!',
    content: 'The hotel exceeded all our expectations. The staff was incredibly helpful and the rooms were spotless. The beach view was breathtaking!',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'
    ],
    helpful: 24,
    date: '2025-09-15',
    verified: true,
    tripType: 'couple',
    response: {
      from: 'Hotel Management',
      content: 'Thank you for your wonderful review! We look forward to welcoming you again.',
      date: '2025-09-16'
    }
  },
  {
    id: 'rev_2',
    userId: 'user_2',
    userName: 'Rajesh Kumar',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4,
    title: 'Great value for money',
    content: 'Good location, clean rooms, and excellent breakfast buffet. Only minor issue was slow WiFi in the evening.',
    helpful: 18,
    date: '2025-09-10',
    verified: true,
    tripType: 'business'
  },
  {
    id: 'rev_3',
    userId: 'user_3',
    userName: 'Anita Desai',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    title: 'Perfect family vacation',
    content: 'Kids loved the pool and activities. Staff was very accommodating with our requests. Highly recommend for families!',
    images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400'],
    helpful: 32,
    date: '2025-09-05',
    verified: true,
    tripType: 'family'
  }
]

// Forum Posts Mock Data
export const mockForumPosts: ForumPost[] = [
  {
    id: 'post_1',
    userId: 'user_4',
    userName: 'Travel Guru',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    title: 'Best time to visit Maldives?',
    content: 'Planning my honeymoon. What\'s the ideal time to visit Maldives for best weather and fewer crowds?',
    category: 'question',
    destination: 'Maldives',
    replies: [
      {
        id: 'reply_1',
        userId: 'user_5',
        userName: 'Island Explorer',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        content: 'November to April is the dry season - perfect weather! But it\'s peak season so book early.',
        likes: 12,
        createdAt: '2025-10-10T10:30:00Z'
      },
      {
        id: 'reply_2',
        userId: 'user_6',
        userName: 'Beach Lover',
        userAvatar: 'https://i.pravatar.cc/150?img=10',
        content: 'We went in February and it was magical! Clear skies, calm seas, perfect for diving.',
        likes: 8,
        createdAt: '2025-10-10T12:15:00Z'
      }
    ],
    views: 245,
    likes: 34,
    createdAt: '2025-10-10T09:00:00Z',
    updatedAt: '2025-10-10T12:15:00Z'
  },
  {
    id: 'post_2',
    userId: 'user_7',
    userName: 'Foodie Traveller',
    userAvatar: 'https://i.pravatar.cc/150?img=11',
    title: 'Top 5 restaurants in Dubai',
    content: 'Just returned from Dubai. Here are my must-visit restaurants for authentic Middle Eastern cuisine...',
    category: 'recommendation',
    destination: 'Dubai',
    replies: [],
    views: 156,
    likes: 28,
    createdAt: '2025-10-12T14:00:00Z',
    updatedAt: '2025-10-12T14:00:00Z'
  }
]

// Eco Ratings Mock Data
export const mockEcoRatings: Record<string, EcoRating> = {
  hotel_1: {
    score: 85,
    level: 'excellent',
    certifications: ['Green Key Certified', 'LEED Gold'],
    features: [
      'Solar-powered energy',
      'Water conservation system',
      'Organic waste composting',
      'Local sourcing',
      'Plastic-free policy'
    ],
    carbonOffset: true
  },
  hotel_2: {
    score: 65,
    level: 'medium',
    certifications: ['Energy Star Certified'],
    features: [
      'LED lighting',
      'Recycling program',
      'Energy-efficient appliances'
    ],
    carbonOffset: false
  }
}

// Carbon Emissions Mock Data
export const mockCarbonEmissions: Record<string, CarbonEmission> = {
  flight_del_dxb: {
    totalKg: 580,
    perPassengerKg: 290,
    comparison: '15% less than average for this route',
    offsetCost: 450,
    offsetAvailable: true
  },
  flight_del_sin: {
    totalKg: 1240,
    perPassengerKg: 620,
    comparison: 'Average emissions for this route',
    offsetCost: 850,
    offsetAvailable: true
  }
}

// 360° Tours Mock Data
export const mockVRTours: VRTour[] = [
  {
    id: 'tour_1',
    name: 'Luxury Suite Tour',
    duration: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    images: [
      {
        id: '360_1',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
        title: 'Master Bedroom',
        description: 'Spacious bedroom with king-size bed and ocean view',
        type: 'room'
      },
      {
        id: '360_2',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200',
        title: 'Luxury Bathroom',
        description: 'Marble bathroom with rain shower and bathtub',
        type: 'room'
      },
      {
        id: '360_3',
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
        title: 'Private Balcony',
        description: 'Breathtaking ocean views from your private terrace',
        type: 'room'
      }
    ]
  },
  {
    id: 'tour_2',
    name: 'Hotel Facilities',
    duration: 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    images: [
      {
        id: '360_4',
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
        title: 'Infinity Pool',
        description: 'Stunning infinity pool overlooking the ocean',
        type: 'pool'
      },
      {
        id: '360_5',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
        title: 'Fine Dining',
        description: 'Award-winning restaurant with international cuisine',
        type: 'restaurant'
      },
      {
        id: '360_6',
        url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
        title: 'Beach Access',
        description: 'Private beach with white sand and crystal-clear water',
        type: 'beach'
      }
    ]
  }
]

// Trust Badges Mock Data
export const mockTrustBadges: TrustBadge[] = [
  {
    id: 'badge_1',
    name: 'Secure Payment',
    icon: '🔒',
    description: '256-bit SSL encryption for all transactions',
    type: 'secure_payment'
  },
  {
    id: 'badge_2',
    name: 'Verified Partner',
    icon: '✓',
    description: 'All hotels and airlines are verified partners',
    type: 'verified'
  },
  {
    id: 'badge_3',
    name: '100% Refund',
    icon: '↩️',
    description: 'Free cancellation up to 24 hours before departure',
    type: 'refund_policy'
  },
  {
    id: 'badge_4',
    name: '24/7 Support',
    icon: '💬',
    description: 'Round-the-clock customer service in your language',
    type: 'customer_support'
  },
  {
    id: 'badge_5',
    name: 'Best Price Guarantee',
    icon: '💰',
    description: 'We match any lower price you find elsewhere',
    type: 'best_price'
  }
]

// Language Options Mock Data
export const mockLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' }
]

// Currency Options Mock Data
export const mockCurrencies: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0095 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.044 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 0.016 }
]

// Chatbot Q&A Mock Data
export const mockChatbotFAQs = [
  {
    question: 'How do I cancel my booking?',
    answer: 'You can cancel your booking from the "My Bookings" section in your account. Most bookings offer free cancellation up to 24 hours before departure.',
    category: 'booking'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards (Visa, Mastercard, Amex), UPI, net banking, and digital wallets like Paytm and Google Pay.',
    category: 'payment'
  },
  {
    question: 'How do I add baggage to my flight?',
    answer: 'You can add extra baggage during booking or later from your booking details page. Charges vary by airline and route.',
    category: 'flights'
  },
  {
    question: 'Is travel insurance included?',
    answer: 'Travel insurance is optional. You can add it during checkout for comprehensive coverage including trip cancellation, medical emergencies, and lost baggage.',
    category: 'insurance'
  },
  {
    question: 'How do I check my flight status?',
    answer: 'Visit the "My Bookings" page and click on your flight booking to see real-time status updates including gate information and delays.',
    category: 'flights'
  }
]
