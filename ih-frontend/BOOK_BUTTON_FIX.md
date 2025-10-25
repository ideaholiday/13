# Book Button Fix & Customization Guide

## ✅ What Was Fixed

The "Book Now" button in the Recommendations Section now has working onClick functionality.

## 🔧 Current Implementation

**File:** `src/components/shared/RecommendationsSection.tsx`

```typescript
<Button 
  size="sm" 
  className="bg-gradient-to-r from-sapphire-900 to-emerald-900"
  onClick={() => {
    // Navigate to booking page or contact form
    window.location.href = `/packages/${rec.id}`
  }}
>
  Book Now
</Button>
```

## 📍 What Happens When Clicked

Currently: Redirects to `/packages/{package-id}` page

Example:
- Package ID: `rec_1`
- Redirects to: `/packages/rec_1`

## 🎯 Customization Options

### Option 1: Open Contact Form

```typescript
onClick={() => {
  // Open WhatsApp
  window.open('https://wa.me/919686777391?text=I want to book ' + rec.title, '_blank')
}}
```

### Option 2: Open Email

```typescript
onClick={() => {
  window.location.href = `mailto:support@ideaholiday.com?subject=Booking Inquiry for ${rec.title}`
}}
```

### Option 3: Navigate to Booking Form

```typescript
onClick={() => {
  window.location.href = `/booking?package=${rec.id}&destination=${rec.destination}`
}}
```

### Option 4: Show Popup/Modal

```typescript
const [showBooking, setShowBooking] = useState(false)

// In button
onClick={() => setShowBooking(true)}

// Add modal component
{showBooking && (
  <BookingModal 
    package={rec} 
    onClose={() => setShowBooking(false)} 
  />
)}
```

### Option 5: Add to Cart (Future)

```typescript
onClick={() => {
  // Add to cart
  addToCart(rec)
  toast.success('Package added to cart!')
}}
```

## 📱 Multiple Call-to-Actions

You can add multiple buttons:

```typescript
<div className="flex gap-2">
  <Button 
    size="sm" 
    variant="outline"
    onClick={() => window.location.href = `/packages/${rec.id}`}
  >
    Details
  </Button>
  <Button 
    size="sm" 
    className="bg-gradient-to-r from-sapphire-900 to-emerald-900"
    onClick={() => window.open('https://wa.me/919686777391', '_blank')}
  >
    Book Now
  </Button>
</div>
```

## 🔗 Creating a Package Detail Page

If you want `/packages/{id}` to work, create:

**File:** `src/app/packages/[id]/page.tsx`

```typescript
'use client'

import { useParams } from 'next/navigation'
import { mockRecommendations } from '@/data/enhancements'

export default function PackageDetailPage() {
  const params = useParams()
  const packageId = params.id as string
  
  const package = mockRecommendations.find(r => r.id === packageId)
  
  if (!package) {
    return <div>Package not found</div>
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1>{package.title}</h1>
      <p>{package.description}</p>
      <div className="text-2xl font-bold">₹{package.price.toLocaleString()}</div>
      
      {/* Add booking form here */}
      <button onClick={() => alert('Booking form coming soon!')}>
        Book This Package
      </button>
    </div>
  )
}
```

## 📞 Contact Integration Examples

### WhatsApp

```typescript
const whatsappNumber = '919686777391'
const message = encodeURIComponent(`Hi, I want to book ${rec.title} for ${rec.destination}`)
window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
```

### Phone Call

```typescript
window.location.href = 'tel:+919686777391'
```

### Email

```typescript
const subject = encodeURIComponent(`Booking Inquiry: ${rec.title}`)
const body = encodeURIComponent(`I'm interested in booking ${rec.title} to ${rec.destination}.\n\nPrice: ₹${rec.price}`)
window.location.href = `mailto:support@ideaholiday.com?subject=${subject}&body=${body}`
```

## 🎨 Button Styling Options

### Change Button Color

```typescript
// Green
className="bg-gradient-to-r from-emerald-600 to-emerald-800"

// Red
className="bg-gradient-to-r from-ruby-600 to-ruby-800"

// Blue (current)
className="bg-gradient-to-r from-sapphire-900 to-emerald-900"
```

### Add Icon

```typescript
import { ShoppingCart } from 'lucide-react'

<Button>
  <ShoppingCart className="h-4 w-4 mr-2" />
  Book Now
</Button>
```

## 🚀 Testing the Button

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Scroll to "Personalized for You" section**

4. **Click "Book Now" on any package**

5. **Should redirect to `/packages/{id}`**

## 🐛 Troubleshooting

### Button not clickable?
- Check if there's an overlay element blocking it
- Verify `cursor-pointer` class is present
- Check browser console for errors

### Button doesn't do anything?
- Verify `onClick` handler is present
- Check browser console for JavaScript errors
- Make sure the component re-rendered after changes

### Page not found after clicking?
- Create the package detail page (see above)
- Or change onClick to use WhatsApp/Email instead

## ✅ Quick Test Checklist

- [ ] Button is visible
- [ ] Button is clickable (cursor changes to pointer)
- [ ] Clicking redirects/opens expected action
- [ ] No console errors
- [ ] Works on mobile
- [ ] Works on different browsers

## 📝 Best Practices

1. **Always provide feedback** - Show loading state or confirmation
2. **Track clicks** - Add analytics for booking button clicks
3. **Handle errors** - What if WhatsApp/email doesn't open?
4. **Mobile-first** - Test on mobile devices
5. **Accessibility** - Add aria-labels for screen readers

---

**Updated File:** `src/components/shared/RecommendationsSection.tsx`  
**Current Action:** Redirects to `/packages/{id}`  
**Recommended:** Add WhatsApp integration for instant bookings
