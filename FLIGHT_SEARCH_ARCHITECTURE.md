# Flight Search - Architecture & Component Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Homepage (page.tsx)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Hero Section                                 │  │
│  │  "Your Dream Journey Starts Here"                       │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │         FlightHeroSearch Component                 │ │  │
│  │  │  ┌──────────────────────────────────────────────┐  │ │  │
│  │  │  │  Flights | Hotels | Packages [Tabs]        │  │ │  │
│  │  │  └──────────────────────────────────────────────┘  │ │  │
│  │  │  ┌──────────────────────────────────────────────┐  │ │  │
│  │  │  │  ○ One Way ○ Round Trip ○ Multi City      │  │ │  │
│  │  │  └──────────────────────────────────────────────┘  │ │  │
│  │  │  ┌──────────────────────────────────────────────┐  │ │  │
│  │  │  │ [FROM] ↔ [TO] [DATE] [DATE] [TRAVELLERS] │  │ │  │
│  │  │  └──────────────────────────────────────────────┘  │ │  │
│  │  │  ┌──────────────────────────────────────────────┐  │ │  │
│  │  │  │ [FARES] [FARES] [FARES] [FARES] [FARES]  │  │ │  │
│  │  │  └──────────────────────────────────────────────┘  │ │  │
│  │  │  ┌──────────────────────────────────────────────┐  │ │  │
│  │  │  │ ☐ Delay Protection → View Details          │  │ │  │
│  │  │  │                [SEARCH FLIGHTS]             │  │ │  │
│  │  │  └──────────────────────────────────────────────┘  │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            USP Cards, Destinations, Testimonials        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │
           ├─────────────────────────────────────────────┐
           ↓                                             ↓
    ┌─────────────────┐                      ┌──────────────────┐
    │  Zustand Store  │                      │  Flight Results  │
    │ (SessionStorage)│──────────────────────│     Page         │
    └─────────────────┘                      └──────────────────┘
```

## Component Dependency Tree

```
FlightHeroSearch (Main Container)
│
├─ useState (Form state - errors, activeTab)
│
├─ useFlightSearchStore (Zustand)
│  ├─ tripType, origin, destination
│  ├─ departDate, returnDate
│  ├─ passengers, cabin, specialFare
│  ├─ delayProtection
│  ├─ Setters (setTripType, setOrigin, etc.)
│  └─ Methods (swapAirports, isValid, getSearchParams)
│
├─ Router (useRouter for navigation)
│
├─ Tab Section
│  ├─ Tabs Header (Flights | Hotels | Packages)
│  │  ├─ Button: Flights (active)
│  │  ├─ Button: Hotels (disabled)
│  │  └─ Button: Packages (disabled)
│  │
│  └─ Tab Content (Flights)
│     │
│     ├─ Trip Type Selection
│     │  ├─ Radio: One Way → setTripType('ONE_WAY')
│     │  ├─ Radio: Round Trip → setTripType('ROUND_TRIP')
│     │  └─ Radio: Multi City → toast("Coming soon")
│     │
│     ├─ Form Grid
│     │  ├─ AirportInput (FROM)
│     │  │  ├─ useState (input, suggestions, isOpen)
│     │  │  ├─ debounced search
│     │  │  ├─ onChange → setOrigin()
│     │  │  └─ Suggestions dropdown
│     │  │
│     │  ├─ Swap Button
│     │  │  ├─ Icon: ArrowLeftRight
│     │  │  └─ onClick → swapAirports()
│     │  │
│     │  ├─ AirportInput (TO)
│     │  │  ├─ onChange → setDestination()
│     │  │  └─ Suggestions dropdown
│     │  │
│     │  ├─ DatePickerPopover (DEPART)
│     │  │  ├─ Popover
│     │  │  ├─ CalendarComponent
│     │  │  └─ onChange → setDepartDate()
│     │  │
│     │  ├─ DatePickerPopover (RETURN)
│     │  │  ├─ Disabled if ONE_WAY
│     │  │  ├─ CalendarComponent
│     │  │  └─ onChange → setReturnDate()
│     │  │
│     │  └─ TravellersClassPopover
│     │     ├─ Popover
│     │     ├─ PassengerSteppers
│     │     │  ├─ Adults: +/- buttons
│     │     │  ├─ Children: +/- buttons
│     │     │  └─ Infants: +/- buttons
│     │     ├─ Validation (Infants ≤ Adults, Total ≤ 9)
│     │     ├─ RadioGroup (Cabin)
│     │     │  ├─ Economy
│     │     │  ├─ Premium Economy
│     │     │  ├─ Business
│     │     │  └─ First
│     │     └─ Apply Button
│     │
│     ├─ SpecialFareChips
│     │  ├─ Badge: REG (Regular) - default
│     │  ├─ Badge: STU (Student) + Tooltip
│     │  ├─ Badge: ARM (Armed Forces) + Tooltip
│     │  ├─ Badge: SEN (Senior Citizen) + Tooltip
│     │  └─ Badge: DOC (Doctors) + Tooltip
│     │
│     ├─ DelayProtection
│     │  ├─ Checkbox
│     │  ├─ Label "Add Flight Delay Protection"
│     │  ├─ "View Details" Link
│     │  └─ Sheet
│     │     ├─ Coverage details (delays 2h+, meals, hotel)
│     │     ├─ Terms & Conditions
│     │     └─ Legal disclaimer
│     │
│     └─ Search Button
│        ├─ Large gradient button
│        ├─ Icon: Search
│        ├─ Text: "SEARCH"
│        ├─ Disabled until isValid()
│        └─ onClick → handleSearch()
│           └─ Navigation to /flights/results?{params}
```

## Data Flow Diagram

```
User Input
    │
    ├─ Selects Airport FROM
    │      │
    │      └─ AirportInput component
    │            └─ onChange event
    │                 └─ setOrigin(airport)
    │                      └─ Zustand store.origin = airport
    │                           └─ SessionStorage updated
    │                                └─ Component re-renders
    │
    ├─ Selects Date
    │      │
    │      └─ DatePickerPopover
    │            └─ onSelect event
    │                 └─ setDepartDate(dateString)
    │                      └─ Store.departDate = dateString
    │                           └─ Component re-renders
    │
    ├─ Adjusts Passengers
    │      │
    │      └─ TravellersClassPopover
    │            └─ StepperButton +/- click
    │                 └─ setPassengers({...})
    │                      └─ Store.passengers = {...}
    │                           └─ Component re-renders
    │
    └─ Clicks SEARCH
           │
           └─ handleSearch() function
                ├─ Validate all fields
                │  ├─ Check origin/destination
                │  ├─ Check dates
                │  ├─ Check passengers
                │  └─ Set errors if invalid
                │
                ├─ If invalid: Display inline errors
                │
                └─ If valid: 
                   ├─ store.getSearchParams()
                   │  └─ Returns URLSearchParams with all data
                   │
                   └─ router.push(`/flights/results?${params}`)
                      └─ Navigation to results page
                         └─ Results page reads URL params
```

## State Shape (Zustand Store)

```
FlightSearchState = {
  // Trip Configuration
  tripType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY'
  
  // Route
  origin: {
    code: 'DEL',
    name: 'Indira Gandhi International',
    city: 'Delhi',
    country: 'India'
  } | null
  
  destination: {
    code: 'BOM',
    name: 'Chhatrapati Shivaji Maharaj International',
    city: 'Mumbai',
    country: 'India'
  } | null
  
  // Dates (YYYY-MM-DD format)
  departDate: '2025-02-15' | null
  returnDate: '2025-02-22' | null
  
  // Passengers
  passengers: {
    adults: 2,           // 1-9
    children: 1,         // 0-9 (2-11 years)
    infants: 0           // 0-9 (<2 years)
  }
  
  // Class & Fare
  cabin: 'E' | 'PE' | 'B' | 'F'  // Economy to First
  specialFare: 'REG' | 'STU' | 'ARM' | 'SEN' | 'DOC'
  
  // Options
  delayProtection: true | false
  
  // Methods
  setTripType: (type: TripType) => void
  setOrigin: (airport: Airport | null) => void
  setDestination: (airport: Airport | null) => void
  setDepartDate: (date: string | null) => void
  setReturnDate: (date: string | null) => void
  setPassengers: (passengers: Passengers) => void
  setCabin: (cabin: CabinClass) => void
  setSpecialFare: (fare: SpecialFare) => void
  setDelayProtection: (enabled: boolean) => void
  swapAirports: () => void
  isValid: () => boolean
  getSearchParams: () => URLSearchParams
}
```

## Validation Logic Flowchart

```
┌─ User Clicks SEARCH
│
├─ isOriginSelected?
│  ├─ NO → Error: "Please select departure"
│  └─ YES → Continue
│
├─ isDestinationSelected?
│  ├─ NO → Error: "Please select arrival"
│  └─ YES → Continue
│
├─ isDepartureSelected?
│  ├─ NO → Error: "Select departure date"
│  └─ YES → Continue
│
├─ originCode === destinationCode?
│  ├─ YES → Error: "Must be different from departure"
│  └─ NO → Continue
│
├─ tripType === ROUND_TRIP?
│  ├─ YES
│  │  ├─ isReturnSelected?
│  │  │  ├─ NO → Error: "Select return date"
│  │  │  └─ YES → Continue
│  │  │
│  │  └─ returnDate >= departDate?
│  │     ├─ NO → Error: "Invalid date range"
│  │     └─ YES → Continue
│  │
│  └─ NO → Continue (no return date needed)
│
├─ adults >= 1?
│  ├─ NO → Error: "At least 1 adult required"
│  └─ YES → Continue
│
├─ infants <= adults?
│  ├─ NO → Error: "Infants cannot exceed adults"
│  └─ YES → Continue
│
├─ (adults + children + infants) <= 9?
│  ├─ NO → Error: "Maximum 9 passengers"
│  └─ YES → Continue
│
└─ ALL VALID?
   ├─ YES → Navigate to /flights/results?{params}
   └─ NO → Display all errors inline
```

## Component Interaction Sequence

```
1. User visits homepage
   └─ page.tsx renders
      └─ FlightHeroSearch component loads
         └─ Zustand store initializes from sessionStorage
            └─ Form displays with default values

2. User types in airport field
   └─ handleInputChange fires
      └─ Debounce timer starts (200ms)
         └─ After 200ms: searchAirports() executes
            └─ Filters static data
               └─ Suggestions display

3. User clicks airport suggestion
   └─ handleSelect fires
      └─ onChange callback → setOrigin(airport)
         └─ Zustand updates store
            └─ SessionStorage auto-persists
               └─ Component re-renders
                  └─ Dropdown closes

4. User picks trip type "Round Trip"
   └─ onChange on radio fires
      └─ setTripType('ROUND_TRIP')
         └─ Return date field becomes enabled
            └─ Show hint: "Tap for bigger discounts"

5. User clicks search
   └─ handleSearch() fires
      ├─ Runs validation
      └─ If valid:
         ├─ Gets all form data
         ├─ Builds URLSearchParams
         ├─ Updates store in sessionStorage
         └─ Navigates to /flights/results?{params}

6. Results page loads
   └─ Reads URL params
      └─ Calls flight search API
         └─ Displays matching flights
```

## Mobile vs Desktop Layout

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────────┐
│ Flights | Hotels | Packages                                     │
├─────────────────────────────────────────────────────────────────┤
│ ○ One Way  ○ Round Trip  ○ Multi City                           │
├─────────────────────────────────────────────────────────────────┤
│ [FROM]  ↔  [TO]  [DEPT]  [RETURN]  [TRAVELLERS]  [SEARCH]      │
├─────────────────────────────────────────────────────────────────┤
│     [REG]  [STU]  [ARM]  [SEN]  [DOC]                           │
├─────────────────────────────────────────────────────────────────┤
│ ☐ Delay Protection  View Details                               │
└─────────────────────────────────────────────────────────────────┘

Grid: 6 columns
  [1]FROM   [0.5]SWAP   [1]TO   [1]DEPT   [1]RETURN   [1.5]TRAVELLERS
```

### Mobile (< 768px)
```
┌──────────────────────────────────────┐
│ Flights | Hotels | Packages          │
├──────────────────────────────────────┤
│ ○ One Way                            │
│ ○ Round Trip                         │
│ ○ Multi City                         │
├──────────────────────────────────────┤
│ [FROM]                               │
│ ↔ (button full width)                │
│ [TO]                                 │
│ [DEPART]                             │
│ [RETURN - disabled until RoundTrip]  │
│ [TRAVELLERS & CLASS]                 │
├──────────────────────────────────────┤
│ [REG] [STU] [ARM] [SEN] [DOC]        │
├──────────────────────────────────────┤
│ ☐ Delay Protection                   │
│   View Details                       │
├──────────────────────────────────────┤
│       [SEARCH FLIGHTS]               │
└──────────────────────────────────────┘

Stack: Single column (100% width)
```

## Error Display Pattern

```
User Action: Clicks SEARCH without filling "FROM"
    │
    ├─ Validation fails
    │  └─ errors.origin = "Please select departure"
    │
    ├─ setErrors() updates state
    │  └─ Component re-renders
    │
    └─ Error displays inline
       ┌────────────────────────┐
       │ FROM                   │
       │ [input field - focused]│
       ├────────────────────────┤
       │ ⚠ Please select        │
       │   departure            │
       └────────────────────────┘
       (text-red-600, small font)

User fills field → Validation re-runs → Error disappears
```

---

**Visual Architecture Complete**  
**All components properly documented**  
**Ready for development & maintenance**
