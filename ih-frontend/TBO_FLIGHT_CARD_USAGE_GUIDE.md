# Using Enhanced Flight Result Card - Quick Start Guide

**Last Updated**: October 20, 2025
**Component**: `FlightResultCard` (Enhanced TBO Display)

---

## 📌 Quick Overview

The new `FlightResultCard` component displays complete TBO flight information with expandable sections for:

✅ Airline details & flight number
✅ Complete segment information with baggage
✅ Real-time seat availability
✅ Detailed pricing with tax breakdown
✅ Cancellation & reissue charges
✅ Meal availability, refund status
✅ Policy flags & requirements

---

## 🚀 Basic Usage

### Import

```typescript
import { FlightResultCard } from '@/components/flights/flight-result-card-enhanced'
import type { FlightResult } from '@/types/tbo-flight-data'
```

### Simple Display

```tsx
export function FlightResults({ flights }: { flights: FlightResult[] }) {
  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightResultCard
          key={flight.ResultIndex}
          flight={flight}
          onSelect={(selectedFlight) => {
            console.log('User selected:', selectedFlight)
            // Navigate to booking form
          }}
        />
      ))}
    </div>
  )
}
```

### Props

```typescript
interface FlightResultCardProps {
  flight: FlightResult           // The flight data from TBO API
  onSelect?: (flight: FlightResult) => void  // Callback when user clicks Select
  isSelected?: boolean           // Show selection state
}
```

---

## 📊 What Information is Displayed

### Summary View (Always Visible)

```
┌─────────────────────────────────────────┐
│ AI 2425 | Air India                     │
│ 10:30 ━━━━━━━━ 12:55                    │
│ DEL      2h 25m      BOM      ₹6,691    │
│                                         │
│ 15 KG | Free Meal | Refundable | 9 seats│
│ Premium Economy | 🏆 Smart Choice #10   │
│                    [SELECT BUTTON]      │
└─────────────────────────────────────────┘
```

### Expanded View (Click "Show Details")

#### Segments Section
- Each segment on separate card
- Departure/arrival times and airports
- Aircraft type and seat availability
- Duration, terminal info, flight status

#### Fare Breakdown Section
```
Base Fare:       ₹5,771
  - K3 Tax:      ₹297
  - YR Tax:      ₹170
  - Other:       ₹477
Total Tax:       ₹944
────────────────────────
Total Fare:      ₹6,691

Per Passenger:
  Adult x1: ₹5,771 + ₹944 tax
```

#### Cancellation & Reissue Rules Section
```
CANCELLATION CHARGES:
  ADULT- INR 4300.0*
  ✓ Online refund allowed

REISSUE CHARGES:
  ADULT- INR 3000.0*
  Manual reissue only
```

#### Additional Information Section
- Source (GDS/LCC)
- Fare type (RegularFare/RestrictedFare)
- Validating airline
- Last ticket date
- Airline remarks

#### Policies Section
- Free meal
- Refundable
- Upsell allowed
- LCC status

---

## 💡 Common Use Cases

### Use Case 1: Display Search Results

```tsx
'use client'

import { useState } from 'react'
import { FlightResultCard } from '@/components/flights/flight-result-card-enhanced'
import type { FlightResult } from '@/types/tbo-flight-data'

export function SearchResultsPage() {
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [flights, setFlights] = useState<FlightResult[]>([]) // From search

  return (
    <div>
      <h1>Flight Results: DEL → BOM</h1>
      
      <div className="grid gap-4">
        {flights.map((flight) => (
          <FlightResultCard
            key={flight.ResultIndex}
            flight={flight}
            isSelected={selectedFlight?.ResultIndex === flight.ResultIndex}
            onSelect={(selected) => {
              setSelectedFlight(selected)
              // Could also navigate to booking here
            }}
          />
        ))}
      </div>

      {selectedFlight && (
        <button
          onClick={() => navigateToBooking(selectedFlight)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded"
        >
          Proceed to Booking
        </button>
      )}
    </div>
  )
}
```

### Use Case 2: Filtered Results

```tsx
// Show only refundable flights
const refundableFlights = flights.filter(f => f.IsRefundable)

// Show only nonstop flights
const nonstopFlights = flights.filter(f => f.Segments?.length === 1)

// Show flights under ₹10,000
const cheapFlights = flights.filter(
  f => (f.Fare?.OfferedFare || 0) < 10000
)

{cheapFlights.map((flight) => (
  <FlightResultCard key={flight.ResultIndex} flight={flight} />
))}
```

### Use Case 3: Sorting Options

```tsx
// Sort by price (ascending)
const sortByPrice = (a: FlightResult, b: FlightResult) =>
  (a.Fare?.OfferedFare || 0) - (b.Fare?.OfferedFare || 0)

// Sort by duration (ascending)
const sortByDuration = (a: FlightResult, b: FlightResult) => {
  const durA = a.Segments?.flat().reduce((s, seg) => s + seg.Duration, 0) || 0
  const durB = b.Segments?.flat().reduce((s, seg) => s + seg.Duration, 0) || 0
  return durA - durB
}

// Sort by ranking
const sortByRanking = (a: FlightResult, b: FlightResult) =>
  (a.SmartChoiceRanking || 999) - (b.SmartChoiceRanking || 999)

const sorted = flights.sort(sortByPrice)
```

---

## 🎨 Styling & Customization

### Component Uses Shadcn/ui Components

The component uses these shadcn/ui components:
- `Card`, `CardContent`, `CardHeader` - Layout
- `Badge` - Chips and labels
- `Button` - Select button
- Lucide icons - All icons

### Custom Styling

To customize colors or layout, edit `flight-result-card-enhanced.tsx`:

```tsx
// Card border on selection (line 133)
className={`mb-4 overflow-hidden transition-all ${
  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
}`}

// Summary section header colors
className="flex items-center justify-between bg-gray-50 cursor-pointer hover:bg-gray-100"
```

### Dark Mode

The component automatically adapts to dark mode via Tailwind. No additional configuration needed.

---

## 🔌 Integration with Search Form

```tsx
// In your flight search page
'use client'

import { FlightSearchForm } from '@/components/flights/flight-search-form'
import { FlightResultCard } from '@/components/flights/flight-result-card-enhanced'
import { searchFlights } from '@/lib/flight-api'
import type { FlightResult } from '@/types/tbo-flight-data'

export default function FlightSearchPage() {
  const [results, setResults] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(params: SearchParams) {
    setLoading(true)
    try {
      const response = await searchFlights(params)
      if (response.success && response.data?.results) {
        setResults(response.data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Flight search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <FlightSearchForm onSearch={handleSearch} />
      
      {loading && <div>Searching flights...</div>}
      
      <div className="mt-8">
        {results.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">
              Found {results.length} flights
            </h2>
            <div className="space-y-4">
              {results.map((flight) => (
                <FlightResultCard
                  key={flight.ResultIndex}
                  flight={flight}
                  onSelect={(selected) => {
                    // Handle selection
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 📱 Mobile Responsiveness

The component is fully responsive:

- **Desktop**: Full layout with all information visible
- **Tablet**: Slightly compressed but complete information
- **Mobile**: Stacked layout, truncated initially, expandable for details

```tsx
// Mobile-friendly example
<div className="max-w-full sm:max-w-2xl mx-auto">
  {flights.map((flight) => (
    <FlightResultCard key={flight.ResultIndex} flight={flight} />
  ))}
</div>
```

---

## 🐛 Troubleshooting

### Component Not Displaying Data

**Check**:
1. Is `flight` prop provided?
2. Does `flight.Segments` have data?
3. Are `flight.Fare.OfferedFare` values set?

```typescript
console.log('Flight data:', flight)
console.log('Segments:', flight.Segments)
console.log('Fare:', flight.Fare?.OfferedFare)
```

### Missing Styling

**Check**:
1. Are you using Tailwind CSS?
2. Are shadcn/ui components installed?
3. Is the component in a Client Component (`'use client'`)?

### No Results Showing

```typescript
// Verify API response
const response = await searchFlights(params)
console.log('Response:', response)
console.log('Results:', response.data?.results)
console.log('Number of results:', response.data?.results?.length)
```

---

## 📚 Related Components & Files

| File | Purpose |
|------|---------|
| `tbo-flight-data.ts` | Complete TypeScript types |
| `flight-api.ts` | API client with search function |
| `TBO_COMPLETE_DATA_STRUCTURE.md` | Full API documentation |
| `flight-search-form.tsx` | Search form component |
| `flight-booking-form.tsx` | Booking form (next step) |

---

## ✨ Features

✅ **Expandable details** - Users can click to see full information
✅ **Real-time data** - Shows actual seat availability and pricing
✅ **Tax breakdown** - Complete fare and tax details
✅ **Cancellation rules** - Easy to read policy information
✅ **Responsive design** - Works on all screen sizes
✅ **Selection state** - Visual feedback for selected flight
✅ **Icons & badges** - Visual indicators for meal, refund, etc.
✅ **Accessible** - Proper semantic HTML and keyboard navigation
✅ **TypeScript** - Fully typed with TBO data structures
✅ **Dark mode** - Automatic adaptation

---

## 🚦 Next Steps

1. **Integrate** the component into your search results page
2. **Style** to match your design system (if needed)
3. **Test** with real TBO flight data
4. **Implement** booking flow when flight is selected
5. **Add** fare quote/reprice endpoint call before booking

---

## 📞 Support

For questions or issues:
- Check `TBO_COMPLETE_DATA_STRUCTURE.md` for data reference
- Review `flight-result-card-enhanced.tsx` for implementation details
- Run `searchFlights()` in browser console to verify API response

---

**Last Updated**: October 20, 2025
**Status**: ✅ Production Ready
