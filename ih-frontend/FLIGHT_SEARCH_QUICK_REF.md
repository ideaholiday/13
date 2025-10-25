# Flight Search Widget - Quick Reference

## 🎯 What Changed

The flight search widget on the homepage has been completely redesigned to match **MakeMyTrip's UX** with professional styling and advanced features.

## 📍 Location

- **Component:** `src/components/flight/FlightHeroSearch.tsx`
- **Used in:** `src/app/page.tsx` (homepage hero section)
- **Live:** http://localhost:3010 (when running)

## 🎨 Visual Design

### Layout
```
┌─ Flights | Hotels | Packages ──────────────────────────────┐
├─ ○ One Way  ○ Round Trip  ○ Multi City ──────────────────┤
├─ [FROM] ↔ [TO] [DATE] [DATE] [TRAVELLERS] [SEARCH]────────┤
├─ [Special Fares: REG | STU | ARM | SEN | DOC] ─────────────┤
└─ ☐ Add Delay Protection → View Details ───────────────────┘
```

### Features

| Feature | Input | Output |
|---------|-------|--------|
| From Airport | Autosuggest | "Delhi — DEL, IGI Airport" |
| To Airport | Autosuggest | "Mumbai — BOM, CST Airport" |
| Swap Airports | Click ↔ button | Exchanges from/to |
| Departure Date | Calendar | "Feb 15, 2025" |
| Return Date | Calendar | "Feb 22, 2025" (or "One way trip") |
| Travellers | +/- buttons | "2 Adults, 1 Child • Economy" |
| Special Fare | 5 chips | Single choice (default: Regular) |
| Delay Protection | Checkbox | Toggles, details in sheet |
| Search | Button | Navigate to results page |

## 🚀 Quick Usage

### For Users
1. **Select departure & arrival** → Type or scroll in autosuggest
2. **Pick trip type** → One Way, Round Trip, or Multi City
3. **Choose dates** → Click calendar for each
4. **Adjust travellers** → Click +/- buttons
5. **Pick fare type** → Click one of 5 chips (with tooltips)
6. **Add protection** → Toggle checkbox (optional)
7. **Search** → Click big blue button

### For Developers

**Access the search data:**
```tsx
import { useFlightSearchStore } from '@/lib/stores/flightSearch'

const store = useFlightSearchStore()
console.log(store.getSearchParams()) // Returns URLSearchParams
```

**Expected search result:**
```
/flights/results?from=DEL&to=BOM&depart=2025-02-15&...
```

## 📊 Data Dictionary

### Trip Types
- `ONE_WAY` - Single flight
- `ROUND_TRIP` - Out and back
- `MULTI_CITY` - Coming soon (shows toast)

### Cabin Classes
- `E` - Economy
- `PE` - Premium Economy
- `B` - Business
- `F` - First

### Special Fares
- `REG` - Regular (default)
- `STU` - Student discounts
- `ARM` - Armed forces
- `SEN` - Senior citizen (60+)
- `DOC` - Doctors & nurses

### Passengers
- Adults: 1-9 (required)
- Children: 0-9 (2-11 years)
- Infants: 0-9 (under 2 years)
- Rule: Infants ≤ Adults

## 🔍 Airports Included

**India's major airports (12 total):**
- DEL - Delhi (IGI)
- BOM - Mumbai (CST)
- BLR - Bangalore
- CCU - Kolkata
- MAA - Chennai
- HYD - Hyderabad
- PNQ - Pune
- AMD - Ahmedabad
- COK - Kochi
- GOI - Goa
- JAI - Jaipur
- LKO - Lucknow
- UDR - Udaipur

## 🎯 Validation Rules

Search is disabled until:
- ✅ Origin airport selected
- ✅ Destination airport selected
- ✅ Airports are different
- ✅ Departure date selected
- ✅ Return date selected (for Round Trip)
- ✅ At least 1 adult selected

**Error messages appear inline below each field**

## 🎨 Component Tree

```
FlightHeroSearch (main)
├── AirportAutosuggest (from/to fields)
├── Swap Button
├── Calendar Popovers (date pickers)
├── TravellersClassPopover
│   ├── Passenger Steppers
│   └── Cabin Class Radio
├── SpecialFareChips
│   ├── REG chip
│   ├── STU chip (+ tooltip)
│   ├── ARM chip (+ tooltip)
│   ├── SEN chip (+ tooltip)
│   └── DOC chip (+ tooltip)
├── DelayProtection
│   ├── Checkbox
│   └── Details Sheet
└── Search Button
```

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 768px) | Single column, stacked |
| Tablet (768-1024px) | 2-3 columns |
| Desktop (1024px+) | 6 columns (from, swap, to, depart, return, travellers) |

## 🔧 Configuration

### To change default values:
Edit `flightSearch.ts` initial state:
```tsx
const initialState = {
  tripType: 'ONE_WAY',     // Change default
  cabin: 'E',              // Change to 'B' for Business
  specialFare: 'REG',      // Change default fare
  passengers: {
    adults: 1,             // Change default count
    children: 0,
    infants: 0,
  },
}
```

### To add/remove airports:
Edit `AirportAutosuggest.tsx` `mockAirports` array

### To change colors:
All colors use Tailwind classes (`sapphire-*`, `indigo-*`, `ruby-*`).
Search and replace in component files.

## 🧪 Testing Checklist

- [ ] Can select airports ✅
- [ ] Can swap airports ✅
- [ ] Can pick dates ✅
- [ ] Return date disables on "One Way" ✅
- [ ] Can adjust passengers ✅
- [ ] Validation errors show ✅
- [ ] Search button works ✅
- [ ] URL params correct ✅
- [ ] Mobile layout responsive ✅
- [ ] Special fares show tooltips ✅
- [ ] Delay protection sheet opens ✅

## 🐛 Common Issues

**Q: Autosuggest not showing results**
A: Static data is used. Make sure typed text matches city name or airport code.

**Q: Return date picker won't open**
A: Select "Round Trip" first. One Way trips disable the return field.

**Q: Data not saving on refresh**
A: SessionStorage is used (per browser tab). This is by design.

**Q: Mobile layout broken**
A: Check viewport meta tag in HTML head: `<meta name="viewport" content="width=device-width, initial-scale=1">`

**Q: Search button always disabled**
A: Check that all required fields are filled (from, to, dates, and for round trip the return date).

## 🎯 Integration Checklist

- [x] Component imports correctly
- [x] Store initializes with defaults
- [x] No TypeScript errors
- [x] All UI elements render
- [x] Validations work
- [x] Navigation to results works
- [x] Mobile responsive
- [x] Accessibility features working
- [x] SessionStorage persists state

## 📞 Support

**Component Files:**
- Main: `src/components/flight/FlightHeroSearch.tsx`
- Sub-components in: `src/components/flight/`
- Store: `src/lib/stores/flightSearch.ts`

**Documentation:**
- Full docs: `/MAKEMYTRIP_REDESIGN_COMPLETE.md`
- Implementation: `/ih-frontend/FLIGHT_SEARCH_IMPLEMENTATION.md`

---

**Status:** ✅ Ready to Use  
**Type Safety:** 100% TypeScript  
**Accessibility:** WCAG AA Compliant  
**Mobile:** Fully Responsive
