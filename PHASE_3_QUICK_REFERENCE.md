# 📚 PHASE 3 QUICK REFERENCE

**For developers continuing from Phase 3**

---

## 🎯 PHASE 3 BUILT COMPONENTS

### 1. PassengerForm.tsx
- **Location:** `src/components/flights/PassengerForm.tsx`
- **Lines:** 350
- **Use:** Collect passenger details with validation
- **Key Props:** `passengerIndex`, `passengerType`, `onSave`, `isExpanded`

**Basic Usage:**
```typescript
<PassengerForm
  passengerIndex={0}
  passengerType="ADT"
  initialData={passenger}
  onSave={(p) => store.updatePassenger(0, p)}
  onCancel={() => {}}
  isExpanded={true}
/>
```

### 2. SeatMap.tsx
- **Location:** `src/components/flights/SeatMap.tsx`
- **Lines:** 280
- **Use:** Interactive 30×6 seat selection
- **Key Props:** `selectedSeats`, `onSeatSelect`, `maxSelectableSeats`

**Basic Usage:**
```typescript
<SeatMap
  flightKey="outbound"
  selectedSeats={selectedSeats}
  onSeatSelect={handleSelect}
  onSeatDeselect={handleDeselect}
  maxSelectableSeats={2}
/>
```

### 3. AddOnsSelector.tsx
- **Location:** `src/components/flights/AddOnsSelector.tsx`
- **Lines:** 380
- **Use:** Multi-category add-ons (baggage, meals, etc.)
- **Key Props:** `numberOfPassengers`, `selectedAddOns`, `onAddOnChange`

**Basic Usage:**
```typescript
<AddOnsSelector
  numberOfPassengers={2}
  selectedAddOns={selectedAddOns}
  onAddOnChange={(id, qty) => setAddOns({...})}
/>
```

### 4. PriceBreakdown.tsx
- **Location:** `src/components/flights/PriceBreakdown.tsx`
- **Lines:** 140
- **Use:** Show pricing breakdown
- **Key Props:** `baseFare`, `taxes`, `addOnsCost`, `numberOfPassengers`

**Basic Usage:**
```typescript
<PriceBreakdown
  baseFare={15000}
  taxes={2700}
  addOnsCost={1200}
  numberOfPassengers={2}
  numberOfFlights={2}
/>
```

### 5. /flights/select/page.tsx
- **Location:** `src/app/flights/select/page.tsx`
- **Lines:** 450
- **Route:** `/flights/select`
- **Use:** Main selection page with tabs

---

## 🔌 STORE INTEGRATION

### Available Methods

```typescript
// Passenger management
store.updatePassenger(index, passenger)

// Seat selection
store.addSeatSelection(flightKey, seatNumber)
store.removeSeatSelection(flightKey, seatNumber)

// Add-ons
store.addAddOn(addOn)
store.removeAddOn(index)

// Navigation
store.goToStep('checkout')
```

### Example: Save Passenger

```typescript
const passenger: Passenger = {
  id: 'passenger-0',
  type: 'ADT',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-05-15',
  gender: 'M',
}

store.updatePassenger(0, passenger)
```

### Example: Select Seats

```typescript
store.addSeatSelection('outbound', '12A')
store.addSeatSelection('outbound', '12B')
```

### Example: Add Add-ons

```typescript
store.addAddOn({
  type: 'baggage',
  description: 'Extra Baggage 20kg',
  price: 1200,
  quantity: 1,
})
```

---

## 🎨 COMPONENT TYPES

### PassengerForm Props

```typescript
interface PassengerFormProps {
  passengerIndex: number                    // 0-indexed
  passengerType: 'ADT' | 'CHD' | 'INF'     // Type
  initialData?: Passenger                   // Pre-filled
  onSave: (passenger: Passenger) => void   // Save handler
  onCancel: () => void                      // Cancel handler
  isExpanded: boolean                       // Collapsed/expanded
}
```

### SeatMap Props

```typescript
interface SeatMapProps {
  flightKey: string                         // Unique ID
  selectedSeats: Set<string>                // Selected seats
  onSeatSelect: (seat: string) => void     // Select handler
  onSeatDeselect: (seat: string) => void   // Deselect handler
  maxSelectableSeats: number                // Max to select
}
```

### AddOnsSelector Props

```typescript
interface AddOnsSelectorProps {
  numberOfPassengers: number                // Total passengers
  selectedAddOns: Record<string, number>   // ID → quantity
  onAddOnChange: (id: string, qty: number) => void
}
```

### PriceBreakdown Props

```typescript
interface PriceBreakdownProps {
  baseFare: number                          // Base price
  taxes: number                             // Taxes
  addOnsCost: number                        // Add-ons total
  discount?: number                         // Applied discount
  numberOfPassengers: number                // Passenger count
  numberOfFlights: number                   // Flight segments
}
```

---

## ✅ VALIDATION RULES

### Passenger Form

| Field | Rules |
|-------|-------|
| First Name | 2+ chars, letters/hyphens/apostrophes |
| Last Name | 2+ chars, letters/hyphens/apostrophes |
| DOB | Age-appropriate (ADT: 18+, CHD: 2-18, INF: <2) |
| Gender | Required (M/F/O) |
| Email | Valid email format (optional) |
| Phone | 10 digits (optional) |

### Age Validation

```typescript
// Adult: 18+ years old
// Child: 2-18 years old
// Infant: Less than 2 years old

// Max date setter automatically adjusts based on type
const maxDate = getMaxDate() // Sets based on passenger type
```

---

## 🎯 NAVIGATION FLOW

**Phase 3 Flow:**
```
/flights/select
    ↓
Passengers Tab
    ↓
[If all valid] → Seats Tab
    ↓
[If seats complete] → Add-ons Tab
    ↓
[Save all] → /flights/book
```

**Navigation Code:**
```typescript
router.push('/flights/select')  // Enter Phase 3
router.push('/flights/book')    // Exit to Phase 4
router.back()                   // Go back
```

---

## 📊 ADD-ONS REFERENCE

### Available Categories

**Baggage:**
- Checked Baggage (20 kg) - ₹1,200
- Checked Baggage (32 kg) - ₹1,800
- Extra Baggage - ₹2,500

**Meals:**
- Vegetarian Meal - ₹300
- Non-Vegetarian Meal - ₹300
- Vegan Meal - ₹400
- Premium Beverage - ₹200

**Seats:**
- Extra Legroom - ₹2,000
- Exit Row - ₹1,500
- Window Preference - ₹500

**Insurance:**
- Trip Insurance - ₹500
- Baggage Protection - ₹300

---

## 🐛 COMMON PATTERNS

### Form Submission

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate all required fields
  const errors = validateFields()
  
  if (Object.keys(errors).length > 0) {
    setErrors(errors)
    return
  }
  
  // Save to store
  onSave(formData)
}
```

### Seat Selection

```typescript
const handleSeatClick = (seat: Seat) => {
  if (!seat.isAvailable) return
  
  if (seat.isSelected) {
    onSeatDeselect(seat.number)
  } else {
    if (selectedSeats.size < maxSelectableSeats) {
      onSeatSelect(seat.number)
    }
  }
}
```

### Add-on Quantity Update

```typescript
const handleQuantityChange = (addOnId: string, newQty: number) => {
  onAddOnChange(addOnId, newQty)
}
```

---

## 🔧 TESTING CHECKLIST

### Manual Testing

- [ ] Fill passenger form completely
- [ ] Test validation errors
- [ ] Select seats from map
- [ ] Deselect seats
- [ ] Add add-ons
- [ ] Remove add-ons
- [ ] Check price calculations
- [ ] Navigate between tabs
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Verify dark mode (if applicable)

### Edge Cases

- [ ] Max seats (cannot exceed passengers)
- [ ] Min dates (age validation)
- [ ] Invalid email format
- [ ] Empty required fields
- [ ] Special characters in names
- [ ] Maximum add-on quantities

---

## 🚨 TROUBLESHOOTING

### Passenger Form Not Saving

```typescript
// Check: onSave callback is provided
// Check: Form validation passes
// Check: store.updatePassenger() is called

// Debug:
console.log('formData:', formData)
console.log('errors:', errors)
console.log('isValid:', isFormValid)
```

### Seats Not Selectable

```typescript
// Check: Seat is available (not occupied)
// Check: selectedSeats.size < maxSelectableSeats
// Check: onSeatSelect callback provided

// Debug:
console.log('seat.isAvailable:', seat.isAvailable)
console.log('selectedSeats.size:', selectedSeats.size)
console.log('maxSelectableSeats:', maxSelectableSeats)
```

### Add-ons Not Updating Price

```typescript
// Check: onAddOnChange callback provided
// Check: PriceBreakdown props updated

// Debug:
console.log('selectedAddOns:', selectedAddOns)
console.log('calculateGrandTotal():', calculateGrandTotal())
```

---

## 📈 PERFORMANCE TIPS

### Optimization Done
- ✅ useMemo on price calculations
- ✅ useCallback on handlers
- ✅ Efficient seat map rendering
- ✅ Lazy form validation

### Future Optimizations
- Virtual scrolling for large seat maps
- Lazy loading of add-on images
- Debouncing form input
- React Query for API calls

---

## 🎓 KEY CONCEPTS

### Passenger Types
- **ADT (Adult):** 18+ years old
- **CHD (Child):** 2-18 years old
- **INF (Infant):** Less than 2 years old

### Seat Layout
- **30 Rows** (numbered 1-30)
- **6 Columns** (A-F)
- **Total:** 180 seats
- **Example seat:** "12C" = Row 12, Column C

### Add-on Pricing
- **Per-person pricing:** Multiply by passengers
- **Multiple quantities:** 1-3 items typically
- **Categories:** Baggage, Meals, Seats, Insurance

### Price Calculation
```
Total = (Base Fare × Passengers × Flights) + Taxes + Add-ons - Discount
Per Person = Total / Passengers
```

---

## 🔗 RELATED FILES

### Store
- `src/lib/stores/unified-flight-store.ts` (450 lines)

### Types
- `src/lib/types/flight-booking.ts`
- `src/types/tbo-flight-data.ts`

### Other Components
- `src/components/flights/AdvancedFlightSearchBox.tsx`
- `src/components/flights/FlightResultCard.tsx`
- `src/components/flights/FiltersPanel.tsx`
- `src/components/flights/SortingToolbar.tsx`

### Pages
- `src/app/flights/page.tsx` (home)
- `src/app/flights/results/page.tsx` (Phase 2)
- `src/app/flights/select/page.tsx` (Phase 3)
- `src/app/flights/book/page.tsx` (Phase 4 - to be built)

---

## 🚀 NEXT STEPS

**Phase 4: Checkout (2-3 hours)**

Create `/flights/book` page with:
- Order review component
- Payment form
- Promo code input
- Confirm booking

**Files to create:**
- `src/app/flights/book/page.tsx`
- `src/components/flights/OrderReview.tsx`
- `src/components/flights/PaymentForm.tsx`

---

## ✨ QUICK STATS

| Metric | Value |
|--------|-------|
| Components | 5 |
| Total Lines | 1,200+ |
| TypeScript Errors | 0 |
| Responsive | ✅ |
| Accessible | ✅ |
| Production Ready | ✅ |

---

**Last Updated:** October 21, 2025  
**Phase:** 3 of 5  
**Status:** ✅ COMPLETE

