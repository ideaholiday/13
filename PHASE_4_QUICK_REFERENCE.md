# 📚 PHASE 4 QUICK REFERENCE - Developer Guide

## Component APIs at a Glance

### OrderReview Component

```typescript
interface OrderReviewProps {
  outboundFlight: any
  returnFlight?: any
  passengers: Passenger[]
  addOns: AddOn[]
  baseFare: number
  taxes: number
  discount: number
  onEditAddOns?: () => void
  onRemoveAddOn?: (index: number) => void
}

// Usage
<OrderReview
  outboundFlight={store.selectedOutbound}
  returnFlight={store.selectedReturn}
  passengers={store.passengers}
  addOns={store.addOns}
  baseFare={pricing.baseFare}
  taxes={pricing.taxes}
  discount={pricing.discount}
/>
```

**Key Methods:**
- `toggleSection(section)` - Expand/collapse sections
- `getFlightInfo(flight)` - Extract flight details
- `getDuration(flight)` - Calculate flight duration
- `formatTime()` - Format time display
- `formatDate()` - Format date display

**Sections:**
- ✈️ Flights (with duration, times, airlines)
- 👥 Passengers (with type badges)
- 🎁 Add-ons (editable, removable)
- 💰 Pricing (with breakdowns)

---

### PaymentForm Component

```typescript
interface PaymentFormProps {
  onPaymentInfoChange?: (info: Partial<PaymentInfo>) => void
  totalAmount: number
  isProcessing?: boolean
  onSubmit?: (info: Partial<PaymentInfo>) => Promise<void>
}

// Usage
<PaymentForm
  onPaymentInfoChange={(info) => store.setPaymentInfo(info)}
  totalAmount={pricing.total}
  isProcessing={isSubmitting}
  onSubmit={handlePayment}
/>
```

**Payment Methods:**
- 💳 Card: `method: 'card'` with cardData
- 📱 UPI: `method: 'upi'` with upiId
- 🏦 Net Banking: `method: 'netbanking'` (redirects to bank)
- 💰 Wallet: `method: 'wallet'` (redirects to provider)

**Form Fields (Card):**
- `cardNumber`: String (16 digits, auto-formatted)
- `expiryDate`: String (MM/YY format)
- `cvv`: String (3-4 digits, masked)
- `holderName`: String (3+ chars)
- `saveCard`: Boolean

**Validation:**
```typescript
// Card number
- Must be 16 digits
- Must pass Luhn algorithm
- No special characters in check

// Expiry date
- Format: MM/YY
- Cannot be in past
- Month: 01-12, Year: 00-99

// CVV
- 3-4 digits only
- Numeric characters

// Holder name
- 3+ characters
- Letters, spaces, hyphens, apostrophes only
```

**Key Methods:**
- `handleFieldChange(field, value)` - Update form field
- `handleBlur(field)` - Mark field touched and validate
- `validateField(field)` - Validate single field
- `isValidCardNumber(num)` - Luhn validation
- `isFormValid()` - Check all fields valid
- `handleSubmit(e)` - Submit form

---

### PromoCodeInput Component

```typescript
interface PromoCodeInputProps {
  onApply?: (code: string, discount: number) => Promise<boolean>
  appliedCode?: string
  discount?: number
  onRemove?: () => void
  isLoading?: boolean
}

// Usage
<PromoCodeInput
  onApply={handleApplyPromo}
  appliedCode={appliedPromo?.code}
  discount={appliedPromo?.discount}
  onRemove={handleRemovePromo}
  isLoading={isSubmitting}
/>
```

**Demo Codes:**
```
SAVE100  → ₹100 discount
SAVE500  → ₹500 discount
WELCOME20 → 20% discount
EARLY50  → ₹50 discount
LOYAL100 → ₹100 discount
FLASH200 → ₹200 discount
```

**States:**
- **Unapplied:** Input form with quick-click codes
- **Applied:** Display code, discount amount, remove button

**Key Methods:**
- `handleApply()` - Apply promo code
- `handleRemove()` - Remove applied promo
- `handleKeyPress()` - Support Enter key

---

## Book Page Structure

### Layout
```
┌─────────────────────────────────────────┐
│  HEADER (Back | Secure Checkout Badge)  │
├───────────────────┬─────────────────────┤
│   TABS (1 | 2)    │   Price Summary     │
├───────────────────┤   (sticky)          │
│ TAB 1: REVIEW     │   ────────────────  │
│ - OrderReview     │   Base Fare         │
│ - Continue btn    │   Taxes             │
│                   │   Add-ons           │
│ TAB 2: PAYMENT    │   Discount          │
│ - PromoCodeInput  │   ────────────────  │
│ - PaymentForm     │   TOTAL             │
│ - Terms checkbox  │   ────────────────  │
│ - Submit button   │   Travelers         │
│                   │   ────────────────  │
│                   │   Flight Details    │
└───────────────────┴─────────────────────┘
```

### Key Props from Store
```typescript
const store = useFlightBookingStore()

// Data needed
store.selectedOutbound      // Flight object
store.selectedReturn        // Optional return flight
store.passengers            // Passenger[] array
store.addOns                // AddOn[] array
store.seatSelections        // Map<string, string[]>

// Methods needed
store.setPaymentInfo(info)           // Save payment
store.applyPromoCode(code)           // Apply promo
store.setBookingConfirmation(data)   // Save booking
```

---

## Pricing Calculation

### Real-time Calculation
```typescript
const pricing = useMemo(() => {
  // Base fare per person × number of passengers
  const baseFare = (flight.fareAmount * passengers.length)
  
  // 15% tax on base fare
  const taxes = baseFare * 0.15
  
  // Sum of all add-ons with quantities
  const addOnsCost = addOns.reduce(
    (sum, addon) => sum + addon.price * addon.quantity,
    0
  )
  
  // Applied discount from promo
  const discount = appliedPromo?.discount || 0
  
  // Calculate totals
  const subtotal = baseFare + taxes
  const total = subtotal - discount + addOnsCost
  
  return {
    baseFare,
    taxes,
    addOnsCost,
    discount,
    subtotal,
    total,
    pricePerPerson: total / passengers.length,
  }
}, [baseFare, taxes, addOns, appliedPromo, passengers])
```

---

## Payment Flow

### Step 1: User Selects Payment Method
```
User clicks one of 4 buttons:
- Credit/Debit Card
- UPI
- Net Banking
- Digital Wallet
```

### Step 2: Form Displays Based on Method
```
Card: cardNumber, expiryDate, cvv, holderName, saveCard
UPI: upiId
Banking: Display info + redirect notice
Wallet: Display info + redirect notice
```

### Step 3: User Fills Form + Validation
```
Real-time validation on:
- Field change (updates)
- Field blur (validates)
- Form submit (validates all)

Error messages display if invalid
```

### Step 4: Form Submit
```typescript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 1. Validate all fields
  validateField('')
  
  if (!isFormValid()) return
  
  // 2. Prepare payment data
  const paymentData = {
    method: selectedMethod,
    cardData: { ... } or upiId: { ... },
    saveCard: boolean
  }
  
  // 3. Call onSubmit callback
  await onSubmit?.(paymentData)
  
  // 4. Handle response in parent (Book page)
}
```

### Step 5: Process Payment (Book page)
```typescript
const handlePayment = async (paymentInfo) => {
  setIsSubmitting(true)
  
  try {
    // 1. Save to store
    store.setPaymentInfo(paymentInfo)
    
    // 2. Simulate API call (2s)
    await new Promise(r => setTimeout(r, 2000))
    
    // 3. Create confirmation data
    const confirmationData = {
      bookingId: `BK${Date.now()}`,
      passengers: store.passengers,
      flights: { ... },
      seats: { ... },
      addOns: store.addOns,
      paymentMethod: paymentInfo.method,
      totalAmount: pricing.total,
      timestamp: new Date().toISOString(),
    }
    
    // 4. Save confirmation
    store.setBookingConfirmation(confirmationData)
    
    // 5. Show success & navigate
    toast.success('Payment successful!')
    router.push('/flights/confirmation')
    
  } catch (error) {
    toast.error('Payment failed.')
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## Promo Code Flow

### Step 1: User Enters Code
```
Input field for promo code
OR click quick-link demo codes
```

### Step 2: Validation
```typescript
if (!code.trim()) {
  toast.error('Enter a code')
  return
}

if (appliedCode) {
  toast.error('Code already applied')
  return
}

if (!validPromos[code]) {
  toast.error('Invalid code')
  return
}
```

### Step 3: Apply Discount
```typescript
const discountAmount = validPromos[code]

if (onApply) {
  const success = await onApply(code, discountAmount)
  
  if (success) {
    toast.success(`Discount ₹${amount} applied!`)
    setCode('')
  }
}
```

### Step 4: Display Applied State
```
Show:
- Code name
- Discount amount (₹)
- Remove button (X)

Deduct from total in sidebar
```

### Step 5: Remove Promo
```typescript
const handleRemove = () => {
  setCode('')
  onRemove?.()
  toast.success('Promo removed')
}
```

---

## Common Patterns

### Form Field Pattern
```typescript
<input
  value={formData.field}
  onChange={(e) => handleFieldChange('field', e.target.value)}
  onBlur={() => handleBlur('field')}
  className={touched.field && errors.field
    ? 'border-ruby-300 bg-ruby-50'
    : 'border-gray-300'
  }
/>
{touched.field && errors.field && (
  <p className="text-ruby-600 text-sm">{errors.field}</p>
)}
```

### Price Display Pattern
```typescript
<div className="flex justify-between items-center text-sm">
  <span className="text-gray-700">Label</span>
  <span className="font-medium text-gray-900">
    ₹{amount.toLocaleString('en-IN')}
  </span>
</div>
```

### Button Pattern
```typescript
<button
  disabled={isProcessing || !isFormValid()}
  className="bg-sapphire-600 hover:bg-sapphire-700
    disabled:bg-gray-400 disabled:cursor-not-allowed
    text-white font-semibold py-3 rounded-lg
    transition-all"
>
  {isProcessing ? (
    <>
      <Loader className="animate-spin" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>
```

---

## Validation Rules Reference

### Card Number
- Length: Exactly 16 digits
- Format: Auto-formatted with spaces (XXXX XXXX XXXX XXXX)
- Algorithm: Must pass Luhn check
- Example: 4532 1234 5678 9010

### Expiry Date
- Format: MM/YY (auto-formatted)
- Month: 01-12
- Year: 00-99 (2000-2099)
- Validation: Cannot be in past
- Example: 12/25

### CVV
- Length: 3-4 digits (VISA/MC = 3, AmEx = 4)
- Format: Numeric only, no spaces
- Masked: Shows as ••• by default
- Toggle: Eye icon to show/hide

### Holder Name
- Length: 3+ characters
- Format: Letters, spaces, hyphens, apostrophes
- Examples: "John Doe", "Mary O'Brien", "Jean-Claude"

### UPI ID
- Format: name@provider
- Providers: okhdfcbank, okicici, okaxis, okpnb, etc.
- Examples: "john.doe@okhdfcbank", "mary123@okicici"

---

## Testing Demo Data

### Test Cards (in production, use real cards)
```
4532 1234 5678 9010  (Valid test card)
Expiry: 12/25
CVV: 123
Name: Test User
```

### Demo Promo Codes
```
SAVE100   → ₹100 discount
SAVE500   → ₹500 discount
WELCOME20 → 20% discount
EARLY50   → ₹50 discount
```

### Test Passengers
```
Adult: 18+ years
Child: 2-18 years
Infant: <2 years
```

---

## Integration Checklist

- [ ] OrderReview displays all flight details
- [ ] OrderReview lists all passengers
- [ ] OrderReview shows all add-ons
- [ ] Price calculations match store data
- [ ] PaymentForm validates card correctly
- [ ] PaymentForm validates UPI correctly
- [ ] Payment methods switch correctly
- [ ] Form submit calls onSubmit callback
- [ ] PromoCodeInput allows code entry
- [ ] PromoCode validates demo codes
- [ ] Promo displays correct discount
- [ ] Book page combines all components
- [ ] Navigation between tabs works
- [ ] Back button navigates to Phase 3
- [ ] Submit button navigates to Phase 5
- [ ] Loading states display correctly
- [ ] Error messages display correctly
- [ ] Toast notifications show
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

---

## Troubleshooting

### Payment Form Won't Submit
**Check:**
- All required fields filled?
- No validation errors showing?
- Is form actually valid? (`isFormValid()` returns true)
- Click "Pay ₹XXXX" button shows loading spinner?

### Promo Code Won't Apply
**Check:**
- Code exists in `validPromos` object?
- No other promo already applied?
- Backend returns success (in mock mode)?
- Toast notification appears?

### Prices Don't Update
**Check:**
- useMemo dependencies correct?
- Pricing calculation includes all costs?
- Passenger count correct?
- Add-ons summed correctly?

### Navigation Fails
**Check:**
- router.push() called?
- useRouter hook imported?
- Next.js app directory set up?
- Confirmation page exists?

---

**For more details, see PHASE_4_START_HERE.md**
