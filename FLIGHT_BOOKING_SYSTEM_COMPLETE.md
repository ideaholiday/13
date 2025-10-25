# 🚀 Complete Flight Booking System - Architecture & Implementation Guide

## 📋 Overview

This document outlines the complete flight booking system built following best practices from:
- **Expedia** (Search, Results, Filters, Checkout)
- **Skyscanner** (Advanced Filters, Itinerary View)
- **MakeMyTrip** (Indian UX, Mobile-first)
- **Kayak** (Comparison, Analytics)

**Stack:**
- Frontend: Next.js 14 + React 18 + TypeScript + Tailwind CSS + Framer Motion
- State: Zustand (Flight, Passenger, Payment stores)
- API: Laravel backend with TBO integration
- Payments: Razorpay
- UI: Radix UI + Lucide Icons

---

## 🎯 Core Pages & Flows

### 1. **Home Page** (`/`)
**Purpose:** Brand presence + flight search entry point

**Sections:**
```
┌─────────────────────────────────────────────────┐
│  HERO BANNER                                    │
│  "Your Dream Journey Starts Here"               │
│  ┌──────────────────────────────────────────┐   │
│  │ SEARCH WIDGET (Floating over hero)       │   │
│  │ [From] [To] [Dates] [Travelers] [Search] │   │
│  └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  USP CARDS (4-column)                           │
│  ✓ Best Price | ✓ 24/7 Support | ...           │
├─────────────────────────────────────────────────┤
│  POPULAR DESTINATIONS (Grid)                    │
│  Dubai | Singapore | Thailand | Maldives        │
├─────────────────────────────────────────────────┤
│  TESTIMONIALS (Carousel)                        │
│  Real customer reviews with ratings             │
├─────────────────────────────────────────────────┤
│  CTA SECTION                                    │
│  "Ready to Start? Book Flights Now"             │
└─────────────────────────────────────────────────┘
```

**Key Features:**
- Expedia-style gradient hero (Sapphire → Ruby colors)
- Search widget with trip type tabs (One Way, Round Trip, Multi-City)
- Recent searches dropdown
- Quick shortcuts (Popular routes)
- SEO optimized structured data

### 2. **Flights Page** (`/flights`)
**Purpose:** Advanced search interface

**Features:**
- All search widget features from home
- Quick filters (LCC only, Direct flights, Best price)
- Calendar view for price comparison
- Recent search history
- Trending routes section

### 3. **Search Results Page** (`/flights/results`)
**Purpose:** Display and filter flight results

```
┌──────────────────────────────────┬─────────────────┐
│                                  │  FILTERS        │
│  FLIGHT RESULTS (Main)           │  ┌───────────┐  │
│  ┌──────────────────────────────┐│  │ Stops     │  │
│  │ ✈ Flight Card               ││  │ Airlines  │  │
│  │ 08:00 - 13:30 | 5h 30m | $85 ││  │ Price     │  │
│  │ • Stops: Direct              ││  │ Times     │  │
│  │ • Airline: Spicejet          ││  │ Refund    │  │
│  │ • Seats: 5 available         ││  │ Meal      │  │
│  │ • Carbon: 250kg CO2          ││  │ Baggage   │  │
│  │ [Select] ►                   ││  │           │  │
│  └──────────────────────────────┘│  └───────────┘  │
│  (Repeating flight cards)         │                │
└──────────────────────────────────┴─────────────────┘
```

**Features:**
- Smart sorting: Price (default), Duration, Departure time, Arrival time, Airlines
- 8+ advanced filters with real-time updates
- Flight comparison mode (select 2-3 flights to compare)
- Save flights to wishlist
- Price alerts setup
- Carbon emission badges
- "Cheapest" / "Fastest" / "Best Value" badges
- Loading skeleton
- No results state with suggestions

### 4. **Flight Selection & Review Page** (`/flights/select`)
**Purpose:** Confirm selected flight before booking

```
┌────────────────────────────────────────────────────┐
│  SELECTED FLIGHT SUMMARY                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Delhi (DEL) → Mumbai (BOM)                  │   │
│  │ Oct 27, 2025 at 08:00                       │   │
│  │ Duration: 5h 30m | Non-stop                 │   │
│  │ Spicejet SG 105                             │   │
│  └─────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────┤
│  FARE BREAKDOWN                                    │
│  Base Fare:              ₹5,400                    │
│  Taxes & Fees:           ₹850                      │
│  Discount (if any):      -₹200                     │
│  ─────────────────────────────────────────────     │
│  Total:                  ₹6,050                    │
├────────────────────────────────────────────────────┤
│  FARE RULES & POLICIES                             │
│  ⓘ Refundable | ⓘ Change allowed | ...             │
│  [View detailed rules]                             │
├────────────────────────────────────────────────────┤
│  BAGGAGE INCLUDED                                  │
│  ✓ 20kg Check-in | ✓ 7kg Cabin                    │
│  [Add-on baggage]                                  │
├────────────────────────────────────────────────────┤
│  [Reprice] [Continue to Booking] ►                │
└────────────────────────────────────────────────────┘
```

**Features:**
- Flight overview with timing, aircraft, airline info
- Detailed price breakdown
- Fare rules with accordion
- Baggage information
- Reprice button (check latest price)
- Insurance/Travel protection options
- Add-on options (seat selection preview, meals)

### 5. **Checkout/Booking Page** (`/flights/book`)
**Purpose:** Collect passenger & payment info

**Sections:**
```
STEP 1: PASSENGER DETAILS
├─ Traveler 1 (Adult)
│  ├─ [First Name] [Last Name]
│  ├─ [Date of Birth] [Gender]
│  ├─ [Email] [Phone]
│  └─ [Frequent Flyer] (Optional)
├─ Traveler 2 (Passenger form repeats)
└─ Traveler 3+ (Dynamic add more)

STEP 2: SEAT SELECTION
├─ Seat Map (Interactive grid with visual feedback)
│  ├─ Green: Available
│  ├─ Red: Occupied
│  ├─ Blue: Selected by you
│  └─ Grey: Exit rows (premium price)
└─ [Optional - Auto assign]

STEP 3: ADD-ONS
├─ ☐ Extra Baggage (20kg) - ₹500
├─ ☐ Meal Preference (Non-veg/Veg)
├─ ☐ Seat Selection (if not done)
└─ ☐ Travel Insurance - ₹150

STEP 4: PAYMENT
├─ Payment Method
│  ├─ ○ Credit Card
│  ├─ ○ Debit Card
│  ├─ ○ UPI
│  ├─ ○ Wallet
│  └─ ○ Net Banking
├─ Order Summary (Right sidebar)
│  ├─ Base Fare: ₹6,050
│  ├─ Add-ons: ₹650
│  ├─ Taxes: ₹850
│  └─ Total: ₹7,550
└─ [Terms & Conditions] [Proceed to Pay]
```

**Features:**
- Multi-step form with progress indicator
- Auto-validation at each step
- Passenger form template with reusable values
- Interactive seat map
- Add-ons with real-time price update
- Payment gateway integration (Razorpay)
- SSL/TLS security badges
- Save payment method
- Promotional codes section

### 6. **Confirmation Page** (`/flights/confirmation`)
**Purpose:** Show booking success & provide details

```
┌──────────────────────────────────────────┐
│           ✓ BOOKING CONFIRMED!           │
│                                          │
│  PNR: SG-1234567890                      │
│  Confirmation sent to: user@email.com    │
│                                          │
│  YOUR ITINERARY                          │
│  ──────────────────────────────────────  │
│  ✓ 27 Oct 2025 | DEL → BOM | SG 105      │
│    08:00 - 13:30 | Spicejet              │
│                                          │
│  PASSENGER: Jitendar Maury               │
│  SEAT: 12A                               │
│  TOTAL: ₹7,550                           │
│                                          │
│  [Download eTicket PDF]                  │
│  [Share with Family]                     │
│  [View Booking Details]                  │
│  [Continue Shopping]                     │
└──────────────────────────────────────────┘
```

**Features:**
- Success animation & celebratory design
- PNR number prominently displayed
- Complete itinerary with timeline
- Passenger and seat assignment details
- Download eTicket (PDF)
- Share booking via email/WhatsApp/SMS
- Emergency contact options
- Hotel booking CTA
- Account login option

---

## 💾 State Management (Zustand Stores)

### 1. **Flight Search Store** (`src/store/flightSearch.ts`)
```typescript
interface FlightSearchStore {
  // Search parameters
  tripType: 'oneway' | 'roundtrip' | 'multicity'
  from: Airport | null
  to: Airport | null
  departDate: Date | null
  returnDate: Date | null
  adults: number
  children: number
  infants: number
  class: 'economy' | 'premium_economy' | 'business' | 'first'
  
  // Results
  outboundFlights: FlightResult[]
  returnFlights: FlightResult[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setTripType: (type: string) => void
  setOrigin: (airport: Airport) => void
  setDestination: (airport: Airport) => void
  setDates: (depart: Date, return?: Date) => void
  setPassengers: (adults, children, infants) => void
  setCabinClass: (cls: string) => void
  search: () => Promise<void>
  reset: () => void
}
```

### 2. **Flight Selection Store** (`src/store/flightSelection.ts`)
```typescript
interface FlightSelectionStore {
  // Selected flights
  outboundFlight: FlightResult | null
  returnFlight: FlightResult | null
  traceId: string | null
  
  // Actions
  selectOutbound: (flight: FlightResult, traceId: string) => void
  selectReturn: (flight: FlightResult) => void
  getRepriceData: () => Promise<void>
  clearSelection: () => void
}
```

### 3. **Passenger Store** (`src/store/passengerStore.ts`)
```typescript
interface PassengerStore {
  passengers: Passenger[]
  contactInfo: {
    email: string
    phone: string
    countryCode: string
  }
  
  // Actions
  addPassenger: (passenger: Passenger) => void
  updatePassenger: (index: number, passenger: Passenger) => void
  removePassenger: (index: number) => void
  setContactInfo: (info) => void
}
```

### 4. **Booking Store** (`src/store/bookingStore.ts`)
```typescript
interface BookingStore {
  // Seat selections
  seatSelections: Map<string, string[]>
  
  // Add-ons
  addOns: {
    extraBaggage: { quantity: number; price: number }[]
    meals: string[]
    insurance: boolean
  }
  
  // Actions
  selectSeat: (flightKey: string, seat: string) => void
  addAddOn: (type: string, item: any) => void
  getTotalPrice: () => number
}
```

### 5. **Payment Store** (`src/store/paymentStore.ts`)
```typescript
interface PaymentStore {
  paymentMethod: PaymentMethod
  promoCode: string | null
  discount: number
  savedCards: SavedCard[]
  
  // Actions
  setPaymentMethod: (method: PaymentMethod) => void
  applyPromoCode: (code: string) => Promise<void>
  validatePayment: () => Promise<boolean>
}
```

---

## 🔌 API Integration

### Endpoints Called Throughout Flow

```typescript
// 1. SEARCH
POST /api/v1/flights/search
{
  tripType, from, to, departDate, returnDate,
  adults, children, infants, class
}
→ { outbound: FlightResult[], return?: FlightResult[] }

// 2. FARE QUOTE (Reprice before booking)
POST /api/v1/flights/fare-quote
{ resultIndex, traceId }
→ { fare: Fare, fareRules: string }

// 3. FARE RULES
POST /api/v1/flights/fare-rule
{ resultIndex, traceId }
→ { rules: FareRule[] }

// 4. SSR (Seat Selection)
POST /api/v1/flights/ssr
{ traceId, segment, seatSelection }
→ { success, price }

// 5. BOOK
POST /api/v1/flights/book
{
  traceId,
  passengers: PassengerInfo[],
  seatSelections,
  addOns,
  contactInfo
}
→ { pnr, bookingId, ticketNumber }

// 6. TICKET
POST /api/v1/flights/ticket
{ bookingId, pnr }
→ { ticketUrl, downloadUrl }
```

---

## 🎨 Design System

### Colors
```
Primary: Sapphire (#0F5B9B)
Secondary: Ruby (#C0392B)
Gold: (#F59E0B)
Emerald: (#10B981)
Background: Gradient (Sapphire-50 → White → Ruby-50)
Text: Slate-900 (dark), Slate-600 (secondary)
```

### Components
```
- Button (Primary, Secondary, Outline)
- Input (Text, Date, Select, Time)
- Card (Glass morphism effect)
- Badge (Status, Cabin class, Duration)
- Dialog (Modals, Confirmations)
- Toast (Notifications)
- Spinner (Loading states)
- Skeleton (Content loading)
- Alert (Errors, Info)
```

### Animations
- Page transitions: 0.3s ease-out
- Component entrance: Stagger (0.05s per item)
- Hover states: Scale 1.05, shadow increase
- Success animation: Confetti + scale bounce

---

## 📱 Mobile Strategy

**Responsive Breakpoints:**
```
Mobile: 320px - 640px (Full width, stacked layout)
Tablet: 641px - 1024px (2-column, conditional display)
Desktop: 1025px+ (3-4 column, all features)
```

**Mobile-First Features:**
- Simplified header (hamburger menu)
- Bottom sheet for filters instead of sidebar
- Sticky search bar
- Touch-friendly buttons (48px minimum)
- Vertical card layout
- Swipe navigation
- SMS booking confirmation

---

## ✅ Checklist for Implementation

### Phase 1: Foundation
- [x] Design system setup
- [x] Zustand stores
- [x] Type definitions
- [ ] API client wrapper

### Phase 2: Search & Browse
- [ ] Home page complete
- [ ] Flights search page
- [ ] Results page with filters
- [ ] Sorting & filtering logic

### Phase 3: Selection & Checkout
- [ ] Flight selection page
- [ ] Passenger form
- [ ] Seat selection map
- [ ] Payment integration

### Phase 4: Confirmation & Extras
- [ ] Confirmation page
- [ ] Download ticket PDF
- [ ] Email verification
- [ ] Analytics integration

### Phase 5: Polish & Performance
- [ ] A/B testing setup
- [ ] Error recovery
- [ ] Performance optimization
- [ ] SEO optimization

---

## 🚀 Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Core Web Vitals: LCP < 2.5s, CLS < 0.1
- API response: < 2s (search), < 500ms (other)
- Lighthouse score: > 90
- Mobile Performance: > 85

---

## 🔐 Security & Compliance

- ✓ HTTPS/TLS for all data
- ✓ PCI DSS for payment data
- ✓ User data encryption at rest
- ✓ GDPR compliance (data retention, deletion)
- ✓ Input validation & sanitization
- ✓ Rate limiting on API
- ✓ CSRF protection
- ✓ XSS prevention

---

## 📊 Analytics Events

```
flight_search_started
flight_search_completed
flight_selected
flight_reprice_requested
checkout_started
passenger_form_completed
seat_selected
payment_attempted
booking_confirmed
ticket_downloaded
share_booking
```

---

## 🎓 Best Practices Used

1. **UX Patterns:** Based on Expedia, Skyscanner, MakeMyTrip
2. **Performance:** Code splitting, lazy loading, image optimization
3. **Accessibility:** WCAG 2.1 AA, screen reader friendly
4. **Responsive:** Mobile-first approach
5. **Error Handling:** Graceful degradation, helpful error messages
6. **State Management:** Centralized, predictable Zustand stores
7. **API Design:** RESTful, versioned endpoints
8. **Testing:** Component tests, integration tests, E2E scenarios

---

End of Architecture Document
