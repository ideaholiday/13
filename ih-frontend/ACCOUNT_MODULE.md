# Customer Account Module - Complete Documentation

## 🎉 Module Overview

A comprehensive customer account management system with 8 fully functional pages, built with modern React patterns and beautiful UI.

## ✅ Completed Pages

### 1. Dashboard (`/account/dashboard`)
- Welcome section with personalized greeting
- Quick action cards (Profile, Travellers, Payments)
- Upcoming trips grid with booking details
- Past trips section
- Empty states for no bookings
- **Features**: Framer Motion animations, booking status badges, responsive grid

### 2. Profile (`/account/profile`)
- Editable personal information form
- Address management (street, city, state, postal code, country)
- Preferences (currency, language, newsletter, notifications)
- Avatar with initials fallback
- Edit mode with save/cancel buttons
- **Validation**: React Hook Form + Zod, inline error messages

### 3. Travellers (`/account/travellers`)
- Traveller cards with full information
- Add/Edit traveller modals
- Primary traveller indicator (star icon)
- Passport information (number, expiry, nationality)
- Delete confirmation dialog
- **Features**: CRUD operations, form validation, age calculation

### 4. Payment Methods (`/account/payments`)
- Credit/Debit card management
- UPI payment support
- Default payment method toggle
- Masked card numbers for security
- Delete confirmation
- **Validation**: Card number (16 digits), expiry date (MM/YY), UPI ID format

### 5. Bookings List (`/account/bookings`)
- Tabs: Upcoming / Past bookings
- Flight, Hotel, Package icons
- Status badges (confirmed, pending, cancelled, completed)
- Route, date, traveller, price information
- View details links
- **Features**: Tabbed interface, responsive cards, empty states

### 6. Booking Detail (`/account/bookings/[id]`)
- Complete booking information header
- Trip details with route and dates
- Traveller information
- Price breakdown (base fare + taxes)
- Download invoice & share buttons
- Modify/cancel booking CTAs
- **Features**: Dynamic routing, conditional actions based on booking status

### 7. Support (`/account/support`)
- Create support ticket form
- Ticket list with status tracking
- FAQ sidebar with 5 common questions
- Ticket reply counter
- **Features**: Two-column layout, form validation, status icons

### 8. Settings (`/account/settings`)
- Change password with strength validation
- Two-factor authentication toggle
- Notification preferences (Email, SMS, WhatsApp)
- Account deletion (danger zone)
- **Features**: Password visibility toggle, animated toggles, confirmation states

## 🛠 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **State**: Zustand (with persist middleware)
- **Data Fetching**: React Query (@tanstack/react-query)
- **Notifications**: Sonner
- **UI Components**: Custom components + Radix UI primitives

## 📁 File Structure

```
ih-frontend/src/
├── app/
│   ├── account/
│   │   ├── layout.tsx                 # Account layout with sidebar
│   │   ├── dashboard/page.tsx         # Dashboard page
│   │   ├── profile/page.tsx           # Profile management
│   │   ├── travellers/page.tsx        # Travellers CRUD
│   │   ├── payments/page.tsx          # Payment methods
│   │   ├── bookings/
│   │   │   ├── page.tsx              # Bookings list
│   │   │   └── [id]/page.tsx         # Booking detail
│   │   ├── support/page.tsx           # Support tickets
│   │   └── settings/page.tsx          # Account settings
│   └── auth/
│       ├── login/page.tsx             # Login page
│       └── register/page.tsx          # Registration page
├── components/ui/                      # UI components
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── textarea.tsx
├── data/
│   └── account.ts                     # Mock data
├── hooks/
│   └── use-account.ts                 # React Query hooks (15+ hooks)
├── lib/
│   └── account-api.ts                 # Mock API layer
├── store/
│   └── index.ts                       # Zustand store with AuthStore
└── types/
    └── account.ts                     # TypeScript interfaces

```

## 🧪 Testing the Module

### 1. Access the Login Page
Navigate to: `http://localhost:3000/auth/login`

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `password123`

Or use the mobile/OTP login option.

### 2. Navigate Through Account Pages
After login, visit:
- Dashboard: `/account/dashboard`
- Profile: `/account/profile`
- Travellers: `/account/travellers`
- Payments: `/account/payments`
- Bookings: `/account/bookings`
- Support: `/account/support`
- Settings: `/account/settings`

### 3. Test Key Features

#### Dashboard
- View upcoming and past bookings
- Click quick action cards
- Click "View Details" on bookings

#### Profile
- Click "Edit Profile"
- Modify information
- Test form validation (try invalid email)
- Save changes

#### Travellers
- Click "Add Traveller"
- Fill form with validation
- Set primary traveller
- Edit existing traveller
- Delete traveller (with confirmation)

#### Payments
- Click "Add Card" or "Add UPI"
- Fill payment details (test validation)
- Set default payment
- Delete payment method

#### Bookings
- Switch between Upcoming/Past tabs
- Click on a booking card
- View booking details
- Test modify/cancel buttons (upcoming bookings only)

#### Support
- Read FAQs in sidebar
- Click "New Ticket"
- Create a support ticket
- View ticket list

#### Settings
- Change password (test validation)
- Toggle 2FA
- Enable/disable notification preferences
- Save preferences

## 🎨 UI/UX Features

### Animations
- Page transitions with Framer Motion
- Staggered list animations
- Hover effects on cards
- Smooth toggle switches
- Modal enter/exit animations

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile (account sidebar)
- Responsive grids (1 column mobile, 2-3 desktop)
- Touch-friendly buttons and forms

### Loading States
- Skeleton loaders for all data fetching
- Button loading states ("Saving...", "Creating...")
- Shimmer effects on cards

### Empty States
- Helpful messages when no data
- Clear call-to-action buttons
- Iconography for visual hierarchy

### Form Validation
- Real-time inline validation
- Clear error messages
- Required field indicators
- Type-specific validation (email, phone, card number, UPI ID)

## 🔐 Authentication Flow

1. **Login** → Sets user in Zustand store with persist
2. **Protected Routes** → Account layout checks for authenticated user
3. **Logout** → Clears store and redirects to login

## 📊 Mock Data

Located in `/data/account.ts`:
- 2 demo users
- 5 sample bookings (flights, hotels, packages)
- 3 travellers with passport info
- 3 payment methods (cards + UPI)
- 2 support tickets

## 🔄 React Query Hooks

**Authentication:**
- `useLogin()` - Email/password login
- `useRegister()` - New user registration
- `useLoginWithMobile()` - Mobile/OTP login
- `useSendOTP()` - Send OTP

**User Management:**
- `useUser()` - Get user profile
- `useUpdateUser()` - Update profile

**Bookings:**
- `useBookings()` - Get all bookings
- `useBooking()` - Get single booking
- `useCancelBooking()` - Cancel booking

**Travellers:**
- `useTravellers()` - Get all travellers
- `useAddTraveller()` - Add new traveller
- `useUpdateTraveller()` - Update traveller
- `useDeleteTraveller()` - Delete traveller

**Payments:**
- `usePaymentMethods()` - Get all payment methods
- `useAddPaymentMethod()` - Add payment method
- `useUpdatePaymentMethod()` - Update payment method
- `useDeletePaymentMethod()` - Delete payment method

**Support:**
- `useSupportTickets()` - Get all tickets
- `useCreateTicket()` - Create new ticket

## 🚀 Next Steps

### Backend Integration
When ready to connect to the Laravel backend:

1. Update `src/lib/account-api.ts` to call real API endpoints
2. Replace mock delays with actual fetch/axios calls
3. Update API base URL in environment variables
4. Add JWT token handling
5. Implement real file upload for avatar

### Additional Features to Consider
- Profile picture upload
- Booking modification workflow
- Support ticket replies/chat
- Email verification
- Password reset flow
- Download booking invoice (PDF)
- Share booking via social media
- Advanced filters on bookings list
- Search functionality for travellers/payments
- Export data functionality
- Activity log/history

### Performance Optimizations
- Implement pagination for bookings list
- Add infinite scroll
- Optimize images with Next.js Image
- Code splitting for heavy components
- Memoization for expensive calculations

## 📝 Notes

- All forms include comprehensive validation
- Toast notifications appear for all CRUD operations
- Mock API includes simulated network delays (500-1000ms)
- TypeScript ensures type safety throughout
- Responsive design tested for mobile, tablet, desktop
- Accessibility: Proper ARIA labels, keyboard navigation
- SEO: Page metadata for all routes

## 🎯 Success Metrics

All 8 pages are:
✅ Fully functional
✅ Responsive
✅ Animated
✅ Validated
✅ Type-safe
✅ Well-documented
✅ Production-ready (for mock data)

---

**Built with ❤️ for iHoliday**
