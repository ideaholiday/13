# 🚀 QUICK START - Flight Booking System

**For Developer Working on Phase 2+**

---

## 📍 Current Status

- ✅ **Done:** Architecture, Store, Search UI, Flight Card
- 🔄 **In Progress:** Results Page (Filters + Sorting)
- ⏳ **Next:** Checkout → Confirmation

---

## 🎯 Core Files Reference

### State Management
```
src/lib/stores/unified-flight-store.ts
├── BookingState interface (all properties)
├── useFlightBookingStore() - main hook
├── useFlightSearchParams() - derived selector
├── useFlightResults()
├── useFlightSelection()
├── usePassengerInfo()
├── useBookingDetails()
└── useBookingStep()
```

### Components
```
src/components/flights/
├── AdvancedFlightSearchBox.tsx - Search input (DONE)
└── FlightResultCard.tsx - Flight display (DONE)
```

### Pages
```
src/app/flights/
├── page.tsx - Use AdvancedFlightSearchBox
├── results/ - NEXT TO BUILD
├── select/
├── book/
└── confirmation/
```

---

## 💡 Code Snippets

### Use the Store
```typescript
'use client'

import { useFlightBookingStore, useFlightResults } from '@/lib/stores/unified-flight-store'

export function MyComponent() {
  const store = useFlightBookingStore()
  const { outboundFlights, isSearching } = useFlightResults()
  
  // Access
  console.log(store.from, store.to, store.departDate)
  
  // Update
  store.setOrigin(airport)
  store.setDestination(airport)
  store.setDepartDate(newDate)
  store.performSearch()
  
  // Listen to changes
  const currentStep = store.currentStep
  const selectedFlight = store.selectedOutbound
  
  return <>...</>
}
```

### Create a Page
```typescript
// src/app/flights/results/page.tsx

'use client'

import { useFlightResults, useFlightSelection } from '@/lib/stores/unified-flight-store'
import { FlightResultCard } from '@/components/flights/FlightResultCard'

export default function ResultsPage() {
  const { outboundFlights } = useFlightResults()
  const { selectedOutbound } = useFlightSelection()
  const store = useFlightBookingStore()
  
  return (
    <div>
      <h1>Search Results</h1>
      <div className="space-y-4">
        {outboundFlights.map(flight => (
          <FlightResultCard
            key={flight.ResultIndex}
            flight={flight}
            isSelected={selectedOutbound?.ResultIndex === flight.ResultIndex}
            onSelect={(flight) => {
              store.selectOutboundFlight(flight, 'trace-id')
              // Next step logic
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

### Add a Filter
```typescript
// In results page

const [filters, setFilters] = useState({
  maxPrice: null,
  airlines: [],
  refundable: false
})

const filteredFlights = outboundFlights.filter(flight => {
  // Price filter
  if (filters.maxPrice && flight.Fare?.OfferedFare > filters.maxPrice) {
    return false
  }
  
  // Airline filter
  if (filters.airlines.length > 0 && !filters.airlines.includes(flight.AirlineCode)) {
    return false
  }
  
  // Refundable filter
  if (filters.refundable && !flight.IsRefundable) {
    return false
  }
  
  return true
})
```

---

## 🎨 Tailwind Color System

```typescript
// Primary colors used
sapphire-50/100/.../900   // Main brand blue
ruby-50/100/.../900       // Secondary red
emerald-50/100/.../900    // Success green
gold-50/100/.../900       // Warning/highlights
slate-50/100/.../900      // Neutral grays

// Usage
className="bg-sapphire-600 text-white"      // Button
className="border-2 border-sapphire-200"    // Input
className="text-sapphire-600"               // Text link
```

---

## 📦 Component API Reference

### AdvancedFlightSearchBox
**Props:** None (uses store)  
**Export:** `export function AdvancedFlightSearchBox()`

**What it does:**
- Renders search inputs
- Validates on search
- Calls store.performSearch()
- Redirects to /flights/results

**Subcomponents (Internal):**
- AirportSelector
- DatePicker
- TravelersPopover

### FlightResultCard
**Props:**
```typescript
interface FlightResultCardProps {
  flight: FlightResult              // TBO flight object
  isSelected?: boolean              // Selection state
  onSelect: (flight) => void        // Click handler
}
```

**What it renders:**
- Time display (Depart → Arrive)
- Duration with stops info
- Airline and flight number
- Price (large, highlighted)
- Badges (Direct, Refundable, etc)
- Select button
- Expandable details section

---

## 🔄 Store Method Reference

### Search Phase
```typescript
store.setTripType('O' | 'R' | 'M')
store.setOrigin(airport)
store.setDestination(airport)
store.setDepartDate(date)
store.setReturnDate(date)
store.setPassengers(adults, children, infants)
store.setCabinClass('E' | 'W' | 'B' | 'F')
await store.performSearch()

// Results available in:
store.outboundFlights
store.returnFlights
store.isSearching  // true while searching
store.searchError  // error message if failed
```

### Selection Phase
```typescript
store.selectOutboundFlight(flight, traceId)
store.selectReturnFlight(flight, traceId)

// Access selected
store.selectedOutbound      // FlightResult object
store.outboundTraceId       // For API calls
store.selectedReturn
store.returnTraceId
```

### Passenger Phase
```typescript
store.addPassenger(passenger)
store.updatePassenger(index, passenger)
store.removePassenger(index)
store.setContactInfo(email, phone)

// Access passengers
store.passengers              // Passenger[] array
store.contactEmail
store.contactPhone
```

### Booking Phase
```typescript
store.addSeatSelection(flightKey, seatNumber)
store.removeSeatSelection(flightKey, seatNumber)
store.addAddOn(addOn)
store.removeAddOn(index)
store.setInsurance(true|false)

// Access booking
store.seatSelections        // Map<string, string[]>
store.addOns                // AddOn[] array
store.insuranceSelected     // boolean
store.totalPrice            // from calculateTotalPrice()
store.calculateTotalPrice() // returns number
```

### Payment Phase
```typescript
store.setPaymentInfo(paymentInfo)
store.applyPromoCode(code)

// Access payment
store.paymentInfo          // Partial<PaymentInfo>
```

### Navigation
```typescript
store.goToStep('search' | 'results' | 'select' | 'review' | 'checkout' | 'payment' | 'confirmation')
store.nextStep()           // Go to next step
store.previousStep()       // Go to previous step

store.currentStep          // Access current step
```

### Completion
```typescript
store.setBookingConfirmation({
  pnr: string,
  bookingId: string,
  ticketNumber?: string
})

// Access result
store.bookingConfirmation  // with PNR, bookingId, timestamp

// Reset for new booking
store.reset()
store.clearError()
```

---

## 🧪 Example: Build Results Page

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useFlightResults, useFlightSelection } from '@/lib/stores/unified-flight-store'
import { useFlightBookingStore } from '@/lib/stores/unified-flight-store'
import { FlightResultCard } from '@/components/flights/FlightResultCard'
import { FiltersPanel } from '@/components/flights/FiltersPanel' // TO BUILD
import { SortingToolbar } from '@/components/flights/SortingToolbar' // TO BUILD
import { ArrowLeft, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ResultsPage() {
  const { outboundFlights, isSearching, searchError } = useFlightResults()
  const { selectedOutbound } = useFlightSelection()
  const store = useFlightBookingStore()

  // Filters state
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure' | 'arrival'>('price')
  const [filters, setFilters] = useState({
    maxPrice: null,
    airlines: new Set<string>(),
    maxStops: 999,
    refundable: false,
    freeMeal: false,
  })

  // Apply filters & sorting
  const processedFlights = useMemo(() => {
    let results = [...outboundFlights]

    // Filters
    results = results.filter(f => {
      if (filters.maxPrice && (f.Fare?.OfferedFare || 0) > filters.maxPrice) return false
      if (filters.airlines.size > 0 && !filters.airlines.has(f.AirlineCode)) return false
      if (filters.refundable && !f.IsRefundable) return false
      if (filters.freeMeal && !f.IsFreeMealAvailable) return false
      return true
    })

    // Sorting
    switch (sortBy) {
      case 'price':
        results.sort((a, b) => (a.Fare?.OfferedFare || 0) - (b.Fare?.OfferedFare || 0))
        break
      case 'duration':
        results.sort((a, b) => {
          const durA = (a.Segments?.[0] || []).reduce((s, seg) => s + (seg.Duration || 0), 0)
          const durB = (b.Segments?.[0] || []).reduce((s, seg) => s + (seg.Duration || 0), 0)
          return durA - durB
        })
        break
      // Add more sort cases...
    }

    return results
  }, [outboundFlights, sortBy, filters])

  if (searchError) {
    return (
      <div className="min-h-screen bg-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-900 font-bold">{searchError}</p>
          <Link href="/flights">
            <Button className="mt-4">Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-sapphire-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/flights">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold">
            {processedFlights.length} flights found
          </h1>
          <div />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              flights={outboundFlights}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-4">
            <SortingToolbar
              sortBy={sortBy}
              onChange={setSortBy}
              count={processedFlights.length}
            />

            {processedFlights.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No flights found. Try adjusting filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processedFlights.map(flight => (
                  <FlightResultCard
                    key={flight.ResultIndex}
                    flight={flight}
                    isSelected={selectedOutbound?.ResultIndex === flight.ResultIndex}
                    onSelect={(f) => {
                      store.selectOutboundFlight(f, store.outboundTraceId || 'default')
                      // Show selection UI or proceed
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 📚 Related Documentation

- `FLIGHT_BOOKING_SYSTEM_COMPLETE.md` - Full UI/UX specs
- `FLIGHT_BOOKING_IMPLEMENTATION_ROADMAP.md` - Timeline & breakdown
- `FLIGHT_BOOKING_PHASE_1_COMPLETE.md` - What's done & next steps

---

## 🐛 Debugging Tips

### Check Store State
```typescript
const store = useFlightBookingStore()
console.log('Full state:', store)
console.log('Results:', store.outboundFlights)
console.log('Selected:', store.selectedOutbound)
```

### Check API Calls
```
Browser DevTools → Network tab
Look for: POST /api/v1/flights/search
Check Request body & Response
```

### Reset Store
```typescript
// In browser console or component
const store = useFlightBookingStore()
store.reset()  // Clears all state
```

---

**Questions? Check the component file comments or see related documentation files.**
