# MobileBottomNav Component

A sticky, mobile-first bottom navigation bar with 4–5 primary actions. It appears only on small screens (hidden on md+), supports active states, optional badges, vibration feedback, and safe-area padding for modern phones.

## File
- `src/components/layout/MobileBottomNav.tsx`

## Props
- `items?: { key: string; label: string; href: string; icon: React.ComponentType; badgeCount?: number }[]`
  - Provide custom nav items. Defaults to: Home, Search, Bookings, Offers, Account
- `className?: string` – Additional classes.
- `safeArea?: boolean` – Adds `pb: env(safe-area-inset-bottom)` (default: true)
- `vibrateOnTap?: boolean` – Triggers light haptic feedback on supported devices (default: true)

## Default Items
- Home → `/`
- Search → `/flights`
- Bookings → `/dashboard/bookings`
- Offers → `/packages`
- Account → `/account`

## Usage

Add once in the app layout so it’s available across pages. We already wired this up for you with spacing to avoid overlap.

```tsx
// src/app/layout.tsx
import MobileBottomNav from '@/components/layout/MobileBottomNav'

<main className="flex-1 pb-16 md:pb-0">{children}</main>
<MobileBottomNav />
```

Customizing items:
```tsx
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Home, Search, Hotel, Plane, User } from 'lucide-react'

const items = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'flights', label: 'Flights', href: '/flights', icon: Plane },
  { key: 'hotels', label: 'Hotels', href: '/hotels', icon: Hotel },
  { key: 'search', label: 'Search', href: '/packages', icon: Search, badgeCount: 3 },
  { key: 'account', label: 'Account', href: '/account', icon: User },
]

<MobileBottomNav items={items} />
```

## Active State
The active item is derived from `usePathname()`. When the current path starts with an item’s `href`, it becomes active and receives:
- Rose accent color
- Subtle background and ring
- Icon emphasis

## Badges
Pass `badgeCount` to show a small count bubble (e.g., notifications or bookings). Values over 99 render as `99+`.

## Accessibility
- `aria-label="Primary"` on the `<nav>` element
- Large tap targets (36–44px icons)
- Keyboard focusable via page links

## Animations & Haptics
- Press animation via `framer-motion` (`whileTap` scale)
- Light `navigator.vibrate(10)` when supported and enabled

## Demo
- Page: `/demo/mobile-bottom-nav`

## Notes
- The bar is hidden on `md+` screens via Tailwind’s `md:hidden`
- The layout adds `pb-16` to avoid content being covered on mobile
- Uses `next/link` with `prefetch` enabled
