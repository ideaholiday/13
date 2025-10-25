# Flight Search Box - Visual & Component Reference

## Layout Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  HERO SECTION (Blue Gradient Gradient)                      │
│  "Your Journey Starts Here"                                 │
│  "Search millions of flights, compare prices..."            │
└─────────────────────────────────────────────────────────────┘

                          ↓ -mt-20 floating effect

┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Trip Type Tabs:  [One Way] [Round Trip] [Multi-City]  │  │
│  │                                                         │  │
│  │  Row 1 (Airports):                                     │  │
│  │  ┌─────────────┐  ┌────┐  ┌─────────────┐            │  │
│  │  │  From: DEL  │  │⇄  │  │  To: BOM    │            │  │
│  │  │ Departure   │  │Swap│  │ Arrival     │            │  │
│  │  └─────────────┘  └────┘  └─────────────┘            │  │
│  │                                                         │  │
│  │  Row 2 (Dates & Passengers):                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────┐ ┌──────┐│  │
│  │  │📅 20 Oct    │  │📅 25 Oct*    │  │👥 2 │ │💼 Eco││  │
│  │  │  Departure  │  │  Return      │  │ Trav.│ │ Class││  │
│  │  └──────────────┘  └──────────────┘  └──────┘ └──────┘│  │
│  │                                    ┌──────────────────┐ │  │
│  │                                    │ 🔍 Search Flights│ │  │
│  │                                    └──────────────────┘ │  │
│  │                                                         │  │
│  │  Quick Links:                                           │  │
│  │  ✈ New York Flights | 🏖 Dubai Holiday | 🏨 Hotels   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Trust Badges:  10M+ Flights | 500+ Airlines | 24/7 Support│
└─────────────────────────────────────────────────────────────┘
```

## Desktop Layout (lg breakpoint: 1024px+)

```
Components per row:
┌─ From (5 cols) ─┐ ┌─ Swap (2 cols) ─┐ ┌─ To (5 cols) ─┐
│  AirportInput   │ │  SwapButton     │ │ AirportInput  │
└─────────────────┘ └─────────────────┘ └───────────────┘

┌─ Depart (3) ─┐ ┌─ Return (3, if RoundTrip) ─┐ ┌─ Trav (2) ─┐ ┌─ Class (2) ─┐ ┌─ Search (2) ─┐
│ DateInput    │ │ DateInput                   │ │Traveller   │ │CabinSelector│ │ Search Button│
│              │ │ (hidden if OneWay/MultiCity)│ │Popover     │ │ Popover     │ │              │
└──────────────┘ └─────────────────────────────┘ └────────────┘ └─────────────┘ └──────────────┘
```

## Tablet Layout (sm breakpoint: 640px)

```
- Abbreviated labels on tabs (use icons more)
- Component spacing: sm:gap-3
- Same grid structure but with tighter spacing
```

## Mobile Layout (320px - 640px)

```
- Full-width stacking (grid-cols-1)
- Stack vertically:
  Row 1: Tabs (full width)
  Row 2: From → To with swap (vertical stacking)
  Row 3: Departure date
  Row 4: Return date (if applicable)
  Row 5: Travellers
  Row 6: Cabin class
  Row 7: Search button (full width)
```

## Component Hierarchy

```
FlightSearchPage
├── Hero section
│   ├── h1: "Your Journey Starts Here"
│   └── p: "Search millions of flights..."
│
└── FlightSearchBox (main unified widget)
    ├── TripTabs (tabs for trip type selection)
    │   └── 3 tab options: OneWay, RoundTrip, MultiCity
    │
    ├── Form inputs (responsive grid)
    │   │
    │   ├── Row 1: Airports
    │   │   ├── AirportInput (From)
    │   │   │   └── Popover
    │   │   │       └── Airport list with search
    │   │   │
    │   │   ├── SwapButton
    │   │   │   └── Swaps origin ↔ destination
    │   │   │
    │   │   └── AirportInput (To)
    │   │       └── Popover
    │   │           └── Airport list with search
    │   │
    │   ├── Row 2: Dates & Passengers
    │   │   ├── DateInput (Departure)
    │   │   │   └── Popover
    │   │   │       └── Calendar component
    │   │   │
    │   │   ├── DateInput (Return, conditional)
    │   │   │   └── Popover
    │   │   │       └── Calendar component
    │   │   │
    │   │   ├── TravellerPopover
    │   │   │   └── +/- counters for ADT/CHD/INF
    │   │   │
    │   │   ├── CabinSelector
    │   │   │   └── Popover
    │   │   │       └── 4 class options (E/W/B/F)
    │   │   │
    │   │   └── Search Button
    │   │       └── Calls searchFlights API
    │   │
    │   └── Validation errors (conditional)
    │       └── Error summary list
    │
    └── Quick Links section
        └── "✈ New York" | "🏖 Dubai" | "🏨 Hotels" | "🎫 Deals"
```

## Component Props Reference

### TripTabs
```typescript
Props: none (uses Zustand store)
Store: setTripType(value: TripType)
```

### AirportInput
```typescript
Props: {
  value: string          // current airport code
  onChange: (value: string) => void
  placeholder?: string   // "Departure city" or "Arrival city"
  label?: string
}
```

### DateInput
```typescript
Props: {
  value: string          // YYYY-MM-DD format
  onChange: (value: string) => void
  placeholder?: string   // "Pick date"
  label?: string
  minDate?: Date
}
```

### TravellerPopover
```typescript
Props: none (uses Zustand store)
Store: setTravellers(adults, children, infants)
Display: "X Traveller(s)" with Users icon
```

### CabinSelector
```typescript
Props: {
  isCompact?: boolean    // shows abbreviated labels on mobile
}
Store: setCabinClass(cabin: CabinClass)
Options: E (Economy), W (Premium Economy), B (Business), F (First)
```

### SwapButton
```typescript
Props: {
  legIndex?: number      // which leg to swap (default 0)
  className?: string     // additional classes
}
Store: setLegs(newLegs)
Action: Swaps legs[legIndex].origin ↔ destination
```

### FlightSearchBox
```typescript
Props: none (orchestrates all sub-components)
Features:
- Form validation
- Error handling
- Loading state
- Search submission
- Navigation to results page
```

## Design Tokens

```typescript
// Colors
Primary CTA: #E0115F (gradient to #C70A51)
Primary Dark: #0E2C47
Hero Gradient: from-blue-600 to-blue-800
Success Green: #00A86B
Error Red: #DC2626

// Spacing
Gap: sm:gap-3 (12px)
Padding: p-6 sm:p-8 (24px → 32px)
Margin: -mt-20 (floating effect, -80px)

// Typography
Hero Heading: text-4xl sm:text-5xl font-bold
Label: text-xs font-semibold uppercase tracking-wide
Body: text-sm

// Border Radius
Main Box: rounded-2xl (16px)
Buttons: rounded-lg (8px)
Other: rounded (4px)

// Shadows
Main Box: shadow-xl
Quick Links: shadow-sm

// Animations
Container: fade-in 0.6s ease-out
Hero: slide-up 0.8s ease-out
Items: staggered 0.08s per item
Button Hover: scale & shadow
```

## State Flow

```
User Action              Store Update           Component Re-render
─────────────────────────────────────────────────────────────────
Select trip type  ──→  setTripType(type)  ──→  TripTabs updates
                                               Return date shows/hides

Select From airport ──→  setLegs([...])   ──→  AirportInput updates
Select To airport   ──→  setLegs([...])   ──→  AirportInput updates
Click swap button   ──→  setLegs([...])   ──→  Both inputs update

Select dates       ──→  setLegs([...])   ──→  DateInput updates
Select travellers  ──→  setTravellers()  ──→  TravellerPopover updates
Select cabin       ──→  setCabinClass()  ──→  CabinSelector updates

Click Search       ──→  Validate form
                       Call searchFlights API
                       Navigate to /flights/results
```

## Popular Airports Included

```typescript
DEL - Indira Gandhi       (Delhi)
BOM - Bombay International (Mumbai)
BLR - Kempegowda         (Bangalore)
CCU - Netaji Subhas      (Kolkata)
MAA - Chennai            (Chennai)
HYD - Rajiv Gandhi       (Hyderabad)
COK - Cochin             (Kochi)
PNQ - Pune               (Pune)
```

## Validation Rules

```typescript
// Required fields
✓ Departure city required
✓ Arrival city required
✓ Departure date required
✓ Return date required (if Round Trip)
✓ At least 1 adult required

// Business logic
✓ Departure ≠ Arrival cities
✓ Departure date ≥ Today
✓ Return date > Departure date
✓ Max 9 travelers (adults + children)
✓ Max 9 infants per booking

// Error display
- Inline error messages under each input
- Summary error list at form bottom
- Red error styling on inputs
- Non-blocking (user can fix one field at a time)
```

## API Integration Points

```typescript
// On form submit:
POST /api/v1/flights/search
Body: {
  tripType: "O" | "R" | "M",
  legs: [
    {
      origin: string,         // airport code
      destination: string,    // airport code
      departDate: "YYYY-MM-DD"
    },
    // 2nd leg for Round Trip
    // 3+ legs for Multi-City
  ],
  adults: number,
  children: number,
  infants: number,
  cabinClass: "E" | "W" | "B" | "F",
}

// Response:
Success → navigate to /flights/results
Error → show error message in red box
```

## Mobile Responsiveness Testing Checklist

- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12 (390px)
- [ ] Test on iPad (768px)
- [ ] Test on iPad Pro (1024px)
- [ ] Test on Desktop (1440px)
- [ ] Test portrait + landscape orientations
- [ ] Test touch interactions (tap, long press)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test accessibility with screen readers
- [ ] Test with slow network (throttled)

## Browser Compatibility

```
✓ Chrome 90+
✓ Firefox 88+
✓ Safari 14+
✓ Edge 90+
✓ Mobile Safari (iOS 14+)
✓ Chrome Mobile (Android 10+)
```

