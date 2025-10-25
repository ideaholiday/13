
# Project Quick Start 🚀

## Backend (Laravel)

1. **Install dependencies:**
  ```bash
  cd ih-backend
  composer install
  npm install
  ```
2. **Set up environment:**
  - Copy `.env.example` to `.env` and update values as needed.
  - Canonical env vars (see `do_all.sh`):
    - `TBO_API_KEY`, `TBO_API_SECRET`, `DB_CONNECTION`, `DB_DATABASE`, etc.
3. **Run migrations:**
  ```bash
  php artisan migrate
  ```
4. **Start backend server:**
  ```bash
  php artisan serve --host=127.0.0.1 --port=8000
  ```
  - Default API port: **8000**
5. **API endpoints:**
  - All under `/api/v1/*` (see `ih-backend/routes/api.php`)

## Frontend (Next.js)

1. **Install dependencies:**
  ```bash
  cd ih-frontend
  npm install
  ```
2. **Set up environment:**
  - Copy `.env.example` to `.env` and update values as needed.
  - Canonical env vars (see `do_all.sh`):
    - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TBO_API_KEY`, etc.
3. **Start frontend dev server:**
  ```bash
  npm run dev
  ```
  - Default port: **3000** (or **3010** if using PM2)
4. **Build for production:**
  ```bash
  npm run build && npm run start
  ```
5. **Integration points:**
  - API calls: `src/lib/api.ts`, `src/lib/flightApi.ts`, etc.
  - Types: `src/types/`

## Troubleshooting

- **Missing env vars:** Check `.env` and `do_all.sh` for required variables.
- **Port conflicts:** Change ports in `.env` or config files if needed.
- **Build errors:** Run `npm run lint` and `npm run build` for diagnostics.
- **API not reachable:** Ensure backend is running on correct port and CORS is configured (see `nginx.conf`).

---

## What's Already Done ✅

I've built the complete **foundation** for all 2025 travel app enhancements:

1. **Types & Interfaces** (`src/types/enhancements.ts`) - All TypeScript definitions
2. **Mock Data** (`src/data/enhancements.ts`) - Realistic sample data for testing
3. **React Query Hooks** (`src/hooks/use-enhancements.ts`) - 20+ hooks for data fetching
4. **State Management** (`src/store/index.ts`) - Locale & notification stores
5. **4 Ready-to-Use Components**:
   - RecommendationsSection
   - NotificationCenter
   - ChatbotWidget
   - VoiceSearchButton

---

## Example Itinerary Prompts & Destinations ⚡

Try these prompts in your trip planner or API for instant results:

### 1. 5 Days Dubai Trip 🏙️
**Prompt:** "5 days in Dubai trip"

**What you get:**
- City exploration: Burj Khalifa, Dubai Mall, Dubai Marina
- Desert safari with dune bashing and BBQ dinner
- Traditional souks and modern shopping
- Beach relaxation at Jumeirah Beach
- Cultural sites: Dubai Museum, Al Fahidi Historical District

**Best for:** Luxury travelers, families, shopping enthusiasts  
**Budget:** ₹120,000 per person  
**Highlights:** World's tallest building, gold souk, desert adventure

---

### 2. 5 Days Thailand Itinerary 🏝️
**Prompt:** "5 days Thailand itinerary"

**What you get:**
- Bangkok: Grand Palace, Wat Pho, floating markets
- Phuket or Pattaya beaches
- Thai cooking class and street food tours
- Island hopping and snorkeling
- Night markets and rooftop bars

**Best for:** Beach lovers, food enthusiasts, couples  
**Budget:** ₹95,000 per person  
**Highlights:** Temples, beaches, authentic Thai cuisine

---

### 3. 4 Days Goa Holiday 🌴
**Prompt:** "4 days Goa holiday"

**What you get:**
- North Goa beaches: Baga, Calangute, Anjuna
- South Goa: Palolem, Agonda (peaceful beaches)
- Old Goa churches and Portuguese heritage
- Water sports and beach shacks
- Sunset cruise and nightlife

**Best for:** Beach parties, relaxation, heritage lovers  
**Budget:** ₹60,000 per person  
**Highlights:** Beaches, seafood, Portuguese architecture

---

### 4. 3 Day Singapore Tour 🌆
**Prompt:** "3 day Singapore tour"

**What you get:**
- Marina Bay Sands and Gardens by the Bay
- Sentosa Island: Universal Studios, beaches
- Chinatown, Little India, Arab Street
- Night Safari and Singapore Zoo
- Hawker centers and local food

**Best for:** Families, city explorers, foodies  
**Budget:** ₹75,000 per person  
**Highlights:** Futuristic gardens, theme parks, diverse culture

---

### 5. Singapore Best Sightseeing 📸
**Prompt:** "Singapore best sightseeing"

**Returns:** Curated list of top attractions with:
- Marina Bay Sands SkyPark
- Gardens by the Bay (Supertree Grove)
- Merlion Park
- Singapore Flyer
- Orchard Road
- Clarke Quay
- Sentosa Island

**Use case:** Quick reference for must-visit spots

---

### 6. Thailand Attraction 🛕
**Prompt:** "Thailand attraction"

**Returns:** Comprehensive guide to top Thailand attractions:
- **Bangkok:** Grand Palace, Wat Arun, Chatuchak Market
- **Phuket:** Phi Phi Islands, Big Buddha, Patong Beach
- **Chiang Mai:** Doi Suthep, Old City temples, night bazaar
- **Ayutthaya:** Ancient ruins and historical park
- **Krabi:** Railay Beach, Tiger Cave Temple

**Use case:** Planning multi-city Thailand trip

---

### 7. List of Sightseeing of Thailand 📋
**Prompt:** "List of sightseeing of Thailand"

**Returns:** Organized list by region:

**Northern Thailand:**
- Chiang Mai: Doi Suthep Temple, Old City
- Chiang Rai: White Temple, Golden Triangle

**Central Thailand:**
- Bangkok: Grand Palace, Wat Pho, Khao San Road
- Ayutthaya: Historical Park

**Southern Thailand:**
- Phuket: Beaches, islands, nightlife
- Krabi: Railay, Ao Nang
- Koh Samui: Beaches, waterfalls

**Use case:** Comprehensive Thailand planning

---

**How to use these prompts:**
1. Enter any prompt in the AI Trip Planner
2. System returns structured itinerary with day-by-day plans
3. Export as PDF or share with travel companions
4. Customize dates, budget, and preferences

**All prompts available in:** `src/data/mock-itineraries.ts` → `promptTemplates` array

---

### Step 1: Add Recommendations to Home Page

**File:** `src/app/page.tsx`

Add this import at the top:
```tsx
import { RecommendationsSection } from '@/components/shared/RecommendationsSection'
```

Add this component anywhere in your JSX (recommended after hero section):
```tsx
<RecommendationsSection />
```

**Result:** Shows 4 personalized travel recommendations with:
- Beautiful images
- Relevance scores
- Pricing
- "Why recommended" explanations

---

### Step 2: Add Notification Center to Header

**File:** `src/components/layout/header.tsx` (or wherever your header is)

Add these imports:
```tsx
import { NotificationCenter } from '@/components/shared/NotificationCenter'
```

Add to your header navigation (near profile/account icons):
```tsx
<NotificationCenter />
```

**Result:** Bell icon with:
- Unread badge counter
- Dropdown panel with notifications
- Real-time updates (polls every 30s)
- Flight status, price drops, advisories

---

### Step 3: Add Chatbot Widget

**File:** `src/app/layout.tsx`

Add import:
```tsx
import { ChatbotWidget } from '@/components/shared/ChatbotWidget'
```

Add before closing `</body>` tag:
```tsx
<ChatbotWidget />
```

**Result:** Floating chat button (bottom-right) with:
- AI-powered FAQ responses
- Quick action buttons
- Chat history
- Beautiful animations

---

### Step 4: Add Voice Search (Optional - for supported browsers)

**File:** Add to any search form (flights, hotels, etc.)

Example for flight search:
```tsx
import { VoiceSearchButton } from '@/components/shared/VoiceSearchButton'

// In your search form:
<div className="flex gap-2">
  <Input {...} />
  <VoiceSearchButton 
    onResult={(transcript, entities) => {
      // Auto-fill form from voice input
      if (entities.origin) setOrigin(entities.origin)
      if (entities.destination) setDestination(entities.destination)
      if (entities.date) setDate(entities.date)
    }}
  />
</div>
```

**Result:** Microphone button that:
- Listens to user speech
- Extracts search parameters
- Auto-fills the form
- Shows real-time transcript

---

## Test It Out 🧪

```bash
### Start dev server
```bash
cd ih-frontend
npm run dev
# Open browser
open http://localhost:3000
```

You should see:
1. **Home page** - Personalized recommendations section
2. **Header** - Notification bell (click to see 4 sample notifications)
3. **Bottom-right** - Chat bubble (click to open chatbot)
4. **Search forms** - Voice search mic button (if added)

---

## What Data Shows Up? 📊

All features use **realistic mock data** so you can see exactly how they'll look:

### Recommendations:
- Maldives romantic getaway (95% match)
- Dubai flash sale (88% match)
- Goa luxury resort (85% match)
- Singapore adventure (82% match)

### Notifications:
- Flight gate change (HIGH priority)
- Price drop alert (MEDIUM priority)
- Travel advisory (MEDIUM priority)
- Booking confirmation (LOW priority)

### Chatbot FAQs:
- "How do I cancel my booking?"
- "What payment methods do you accept?"
- "How do I add baggage?"
- "Is travel insurance included?"
- "How do I check flight status?"

---

## Customize the Data 🎨

Want to change the mock data? Edit:

**File:** `src/data/enhancements.ts`

```typescript
// Change recommendations
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_1',
    type: 'package',
    title: 'Your Custom Title',
    destination: 'Your Destination',
    price: 99999,
    // ... etc
  }
]

// Change notifications
export const mockNotifications: Notification[] = [
  // Your custom notifications
]

// Change chatbot responses
export const mockChatbotFAQs = [
  // Your custom Q&A
]
```

---

## Next: Build More UI Components 🎯

The foundation is ready. Now build these UI components:

### Priority 1 (Most Visible):
1. **Language/Currency Selector** - Header dropdown
2. **Eco Rating Badge** - Green score for hotels
3. **Review Cards** - User testimonials
4. **Mobile Bottom Nav** - 4 icons for mobile users

### Priority 2 (Booking Flow):
5. **Progress Bar** - Show booking steps
6. **Trust Badges** - Security icons
7. **Carbon Emission Card** - Sustainability info
8. **VR Tour Viewer** - 360° photos

### Priority 3 (Community):
9. **Forum Posts** - Discussion threads
10. **Review Form** - Submit reviews

Each component should:
- Import types from `@/types/enhancements`
- Use hooks from `@/hooks/use-enhancements`
- Follow the existing design (glassmorphic, rounded, gradients)
- Work on mobile

---

## Full Documentation 📚

**Detailed docs:** `ENHANCEMENTS_2025.md`
- All features explained
- Code examples for every hook
- API integration points
- Accessibility guidelines

**Implementation status:** `IMPLEMENTATION_STATUS.md`
- What's done vs. what's left
- Component templates
- Time estimates
- Checklist

**Account module:** `ACCOUNT_MODULE.md`
- Login/signup flows
- Dashboard, profile, bookings
- Settings, support, travelers
- Payment methods

---

## Quick Wins for Demo 🎉

Want to impress in 10 minutes? Do this:

1. **Add all 4 components** (Steps 1-4 above)
2. **Customize mock data** with your brand's actual destinations
3. **Test each feature** and take screenshots
4. **Show live demo**:
   - Click recommendations → beautiful cards
   - Click notifications → real-time updates
   - Click chatbot → instant replies
   - Use voice search → magic form filling

---

## Need Help? 🤝

1. **Check docs** - `ENHANCEMENTS_2025.md` has all details
2. **See examples** - Look at existing components for patterns
3. **Use hooks** - All data fetching is ready, just call hooks
4. **Follow types** - TypeScript will guide you

---

## File Checklist ✅

Before you start, verify these files exist:

```bash
✅ src/types/enhancements.ts
✅ src/data/enhancements.ts
✅ src/hooks/use-enhancements.ts
✅ src/store/index.ts (updated with locale & notification stores)
✅ src/components/shared/RecommendationsSection.tsx
✅ src/components/shared/NotificationCenter.tsx
✅ src/components/shared/ChatbotWidget.tsx
✅ src/components/shared/VoiceSearchButton.tsx
✅ ENHANCEMENTS_2025.md
✅ IMPLEMENTATION_STATUS.md
```


All there? **You're ready to go! 🚀**

---


**Start with Steps 1-3 above. You'll have 3 working features in 5 minutes.**

Good luck! 🎯
