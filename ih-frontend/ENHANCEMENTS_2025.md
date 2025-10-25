# Idea Holiday 2025 Enhancements Documentation

## Overview
This document describes the advanced features added to Idea Holiday's frontend to align with 2025 travel app trends. All features are built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion.

---

## 🚀 Features Implemented

### 1. AI-Driven Personalisation ✅

**Location:** 
- Types: `src/types/enhancements.ts`
- Data: `src/data/enhancements.ts`
- Hooks: `src/hooks/use-enhancements.ts`
- Components: `src/components/shared/RecommendationsSection.tsx`

**Features:**
- Personalized flight, hotel, and package recommendations
- Relevance scoring (0-100) based on user preferences
- Recommendation reasons displayed to users
- Mock data with clear API boundaries for AI integration

**Usage:**
```tsx
import { RecommendationsSection } from '@/components/shared/RecommendationsSection'

<RecommendationsSection />
```

**API Hooks:**
```tsx
const { data: recommendations } = useRecommendations(userId)
const { data: flightRecs } = useRecommendationsByType('flight')
```

---

### 2. Real-Time Updates & Notifications ✅

**Location:**
- Components: `src/components/shared/NotificationCenter.tsx`
- Store: `src/store/index.ts` (useNotificationStore)
- Hooks: `src/hooks/use-enhancements.ts`

**Features:**
- Real-time notification center with polling (every 30s)
- Priority-based notifications (high/medium/low)
- Unread count badge
- Push notification support via Notifications API
- Notification types: flight status, price drops, gate changes, travel advisories

**Usage:**
```tsx
import { NotificationCenter } from '@/components/shared/NotificationCenter'

<NotificationCenter />
```

**Push Notifications:**
```tsx
const requestPush = useRequestPushPermission()
await requestPush.mutateAsync() // Request permission

const sendPush = useSendPushNotification()
await sendPush.mutateAsync({ 
  title: 'Flight Update', 
  body: 'Your gate has changed' 
})
```

---

### 3. Immersive Experiences (360° Tours & VR/AR)

**Location:**
- Types: `src/types/enhancements.ts` (VRTour, Image360)
- Data: `src/data/enhancements.ts` (mockVRTours)
- Hooks: `src/hooks/use-enhancements.ts`

**Features:**
- 360° image viewer for hotel rooms and destinations
- VR tour support with multiple panoramic images
- AR preview placeholder components
- Mock 360° images ready for integration

**Usage:**
```tsx
const { data: tours } = useVRTours(hotelId)
const { data: tour } = useVRTour(tourId)

// Component to be created:
<VRTourViewer tour={tour} />
```

**Integration Points:**
- Add to hotel detail pages
- Add to package destination previews
- Embed in modal overlays

---

### 4. Sustainability & Eco Ratings ✅

**Location:**
- Types: `src/types/enhancements.ts` (EcoRating, CarbonEmission)
- Data: `src/data/enhancements.ts`
- Hooks: `src/hooks/use-enhancements.ts`

**Features:**
- Carbon emission calculator for flights
- Eco-rating badges for hotels (0-100 score)
- Certification display (LEED, Green Key, etc.)
- Carbon offset purchasing
- Green filter for search results

**Usage:**
```tsx
const { data: ecoRating } = useEcoRating(hotelId, 'hotel')
const { data: emissions } = useCarbonEmission(routeId)
const offsetCarbon = useOffsetCarbon()

await offsetCarbon.mutateAsync({ 
  bookingId: 'BK123', 
  amount: 450 
})
```

**Display Components:**
```tsx
// Eco badge
<div className="flex items-center gap-2">
  <span className="text-green-600">🌱</span>
  <span>Eco Score: {ecoRating.score}/100</span>
</div>

// Carbon emissions
<div>
  <p>{emissions.perPassengerKg}kg CO₂ per passenger</p>
  <p className="text-sm text-gray-600">{emissions.comparison}</p>
</div>
```

---

### 5. Voice Search & Conversational UI ✅

**Location:**
- Components: `src/components/shared/VoiceSearchButton.tsx`
- Components: `src/components/shared/ChatbotWidget.tsx`
- Hooks: `src/hooks/use-enhancements.ts`

**Voice Search Features:**
- Web Speech API integration
- Real-time transcript display
- Intent and entity extraction
- Automatic form population

**Usage:**
```tsx
import { VoiceSearchButton } from '@/components/shared/VoiceSearchButton'

<VoiceSearchButton 
  onResult={(transcript, entities) => {
    // Fill search form with entities
    if (entities.origin) setOrigin(entities.origin)
    if (entities.destination) setDestination(entities.destination)
  }}
/>
```

**Chatbot Features:**
- FAQ answering
- Booking assistance
- Quick action buttons
- Mock Q&A data with expansion points

**Usage:**
```tsx
import { ChatbotWidget } from '@/components/shared/ChatbotWidget'

// Add to layout
<ChatbotWidget />
```

---

### 6. Community & Social Features

**Location:**
- Types: `src/types/enhancements.ts` (Review, ForumPost, ForumReply)
- Data: `src/data/enhancements.ts`
- Hooks: `src/hooks/use-enhancements.ts`

**Features:**
- User reviews and ratings (1-5 stars)
- Verified traveler badges
- Hotel/property responses to reviews
- Discussion forums by destination
- Q&A sections
- Helpful votes on reviews

**Usage:**
```tsx
const { data: reviews } = useReviews(hotelId, 'hotel')
const submitReview = useSubmitReview()
const { data: forumPosts } = useForumPosts('Maldives')
const createPost = useCreateForumPost()
const addReply = useAddForumReply()

// Submit review
await submitReview.mutateAsync({
  rating: 5,
  title: 'Amazing stay!',
  content: 'Best hotel ever...',
  tripType: 'couple'
})

// Create forum post
await createPost.mutateAsync({
  title: 'Best time to visit?',
  content: 'Planning a trip...',
  category: 'question',
  destination: 'Maldives'
})
```

---

### 7. Multi-Language & Multi-Currency Support ✅

**Location:**
- Store: `src/store/index.ts` (useLocaleStore)
- Data: `src/data/enhancements.ts` (mockLanguages, mockCurrencies)
- Types: `src/types/enhancements.ts`

**Features:**
- 6 language options (English, Hindi, Spanish, French, German, Arabic)
- 6 currency options (INR, USD, EUR, GBP, AED, SGD)
- Date format preferences (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- Time format (12h/24h)
- Persistent preferences via Zustand

**Usage:**
```tsx
import { useLocaleStore } from '@/store'

const { preferences, setLanguage, setCurrency } = useLocaleStore()

// Change language
setLanguage('hi') // Hindi

// Change currency
setCurrency('USD')

// Format price
const formatPrice = (amount: number) => {
  const rate = currencies.find(c => c.code === preferences.currency)?.rate || 1
  const converted = amount * rate
  const symbol = currencies.find(c => c.code === preferences.currency)?.symbol || '₹'
  return `${symbol}${converted.toLocaleString()}`
}
```

**Translation System:**
Create translation dictionaries in `src/lib/translations/`:

```tsx
// src/lib/translations/en.ts
export const en = {
  'search.flights': 'Search Flights',
  'search.hotels': 'Search Hotels',
  // ...
}

// src/lib/translations/hi.ts
export const hi = {
  'search.flights': 'फ्लाइट खोजें',
  'search.hotels': 'होटल खोजें',
  // ...
}
```

---

### 8. Streamlined Booking & Trust Elements

**Location:**
- Types: `src/types/enhancements.ts` (TrustBadge, BookingProgress)
- Data: `src/data/enhancements.ts` (mockTrustBadges)

**Features:**
- Progress bar across booking flows
- Trust badges (Secure Payment, Verified, Refund Policy, 24/7 Support, Best Price)
- Refund policy display
- Customer review highlights
- Mobile-optimized forms

**Usage:**
```tsx
// Progress bar
const steps = [
  { id: 1, name: 'Select', completed: true, active: false },
  { id: 2, name: 'Details', completed: true, active: false },
  { id: 3, name: 'Payment', completed: false, active: true },
  { id: 4, name: 'Confirm', completed: false, active: false }
]

<div className="flex items-center gap-2">
  {steps.map((step, idx) => (
    <div key={step.id} className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        step.completed ? 'bg-green-600' : step.active ? 'bg-sapphire-900' : 'bg-gray-300'
      }`}>
        {step.completed ? '✓' : step.id}
      </div>
      {idx < steps.length - 1 && <div className="w-12 h-0.5 bg-gray-300" />}
    </div>
  ))}
</div>

// Trust badges
import { mockTrustBadges } from '@/data/enhancements'

<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
  {mockTrustBadges.map(badge => (
    <div key={badge.id} className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-3xl mb-2">{badge.icon}</div>
      <div className="font-semibold text-sm">{badge.name}</div>
      <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
    </div>
  ))}
</div>
```

---

### 9. Mobile-First Enhancements

**Features to Implement:**
- Thumb-friendly buttons (min 44x44px touch targets)
- Bottom navigation bar for small screens
- Swipeable carousels for results
- Service Worker for offline access
- Local storage for itineraries

**Bottom Navigation:**
```tsx
// src/components/layout/MobileBottomNav.tsx
'use client'

import { Home, Search, Bookmark, User } from 'lucide-react'
import Link from 'next/link'

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Link href="/" className="flex flex-col items-center p-2">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center p-2">
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link href="/saved" className="flex flex-col items-center p-2">
          <Bookmark className="h-6 w-6" />
          <span className="text-xs mt-1">Saved</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center p-2">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Account</span>
        </Link>
      </div>
    </nav>
  )
}
```

**Service Worker for Offline:**
```javascript
// public/sw.js
const CACHE_NAME = 'ih-offline-v1'
const urlsToCache = [
  '/',
  '/offline',
  '/account/bookings'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
```

Register in `src/app/layout.tsx`:
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
}, [])
```

---

## 🎨 Design System Integration

All components follow the existing design language:
- **Colors:** Sapphire-900 (#0C4A6E), Emerald-900 (#064E3B)
- **Glassmorphic cards:** `bg-white/80 backdrop-blur-lg`
- **Animations:** Framer Motion transitions
- **Shadows:** `shadow-2xl` for elevated surfaces
- **Rounded corners:** `rounded-2xl` for modern feel

---

## 🔌 API Integration Points

All features use mock data but have clear API boundaries:

```typescript
// Example: Replace mock data with real API calls

// Before (Mock):
export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      await delay(800)
      return mockRecommendations
    }
  })
}

// After (Real API):
export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/recommendations?userId=${userId}`)
      return response.json()
    }
  })
}
```

---

## 📦 Installation & Setup

### 1. Dependencies
All required dependencies are already in `package.json`:
- `next-auth` - Authentication
- `framer-motion` - Animations
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `date-fns` - Date formatting
- `sonner` - Toast notifications

### 2. Environment Variables
Add to `.env.local`:
```bash
# Google OAuth (for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

# Future AI Integration
AI_API_KEY=your-ai-api-key
AI_API_ENDPOINT=https://api.example.com/v1
```

### 3. Enable Features

Add components to your layout:

```tsx
// src/app/layout.tsx
import { ChatbotWidget } from '@/components/shared/ChatbotWidget'
import { NotificationCenter } from '@/components/shared/NotificationCenter'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* ... existing code ... */}
        <NotificationCenter />
        <ChatbotWidget />
        {children}
      </body>
    </html>
  )
}
```

Add to home page:

```tsx
// src/app/page.tsx
import { RecommendationsSection } from '@/components/shared/RecommendationsSection'

export default function HomePage() {
  return (
    <main>
      {/* ... hero section ... */}
      <RecommendationsSection />
      {/* ... rest of page ... */}
    </main>
  )
}
```

---

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

- **Voice Search:** Fallback to text input always available
- **Keyboard Navigation:** All interactive elements keyboard-accessible
- **ARIA Labels:** Proper labels on all controls
- **Color Contrast:** 4.5:1 minimum ratio
- **Screen Readers:** Semantic HTML and ARIA attributes

Example:
```tsx
<button
  aria-label="Start voice search"
  aria-pressed={isListening}
  onClick={startListening}
>
  <Mic aria-hidden="true" />
</button>
```

---

## 🧪 Testing

Test each feature:

1. **Recommendations:**
   - Visit home page while logged in
   - Check personalized suggestions appear
   - Verify relevance scores display

2. **Notifications:**
   - Click bell icon in header
   - Verify unread count
   - Test "mark all as read"

3. **Chatbot:**
   - Click chat button (bottom-right)
   - Send a message
   - Test quick action buttons

4. **Voice Search:**
   - Click microphone icon
   - Speak a query (e.g., "Find flights to Dubai")
   - Verify transcript appears

5. **Locale:**
   - Change language in header dropdown
   - Verify prices convert when changing currency
   - Check date format changes

---

## 🚀 Future Enhancements

### Phase 2 (Backend Integration):
1. Connect recommendations to ML model
2. Implement real WebSocket for notifications
3. Integrate actual voice-to-text AI
4. Connect chatbot to LLM (OpenAI/Claude)
5. Real carbon emission calculations
6. Actual eco certifications from providers

### Phase 3 (Advanced Features):
1. AR room previews using WebXR
2. Real-time flight tracking on map
3. Social sharing with Open Graph
4. Gamification (loyalty points, badges)
5. Video testimonials
6. Live chat with support agents

---

## 📝 File Structure

```
src/
├── types/
│   └── enhancements.ts          # All new type definitions
├── data/
│   └── enhancements.ts          # Mock data for features
├── hooks/
│   └── use-enhancements.ts      # React Query hooks
├── store/
│   └── index.ts                 # Zustand stores (locale, notifications)
├── components/
│   └── shared/
│       ├── RecommendationsSection.tsx
│       ├── NotificationCenter.tsx
│       ├── ChatbotWidget.tsx
│       └── VoiceSearchButton.tsx
└── lib/
    └── translations/            # (To be created)
        ├── en.ts
        ├── hi.ts
        └── index.ts
```

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review component source code
3. Check React Query devtools for data state
4. Inspect Zustand devtools for store state

---

## ✅ Checklist

- [x] AI-driven personalisation types & hooks
- [x] Real-time notifications with polling
- [x] 360° tour types & mock data
- [x] Sustainability eco ratings & carbon emissions
- [x] Voice search component
- [x] Chatbot widget
- [x] Community reviews & forums hooks
- [x] Multi-language & currency store
- [x] Trust badges data
- [ ] Language selector component (header dropdown)
- [ ] Currency converter utility
- [ ] VR tour viewer component
- [ ] Eco rating badge component
- [ ] Carbon offset purchase flow
- [ ] Review submission form component
- [ ] Forum discussion component
- [ ] Mobile bottom navigation
- [ ] Service worker setup
- [ ] Swipeable carousel component
- [ ] Progress bar component
- [ ] Complete translations (en, hi minimum)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Maintainer:** Idea Holiday Development Team
