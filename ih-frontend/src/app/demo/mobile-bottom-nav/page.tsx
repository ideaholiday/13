import React from 'react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function MobileBottomNavDemoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">Mobile Bottom Navigation</h1>
      <p className="text-slate-600">Resize to a mobile width to see the nav. This demo shows default items and a custom configuration with badges.</p>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium">Default</h2>
        <p className="text-sm text-slate-600">Appears at the bottom on small screens only.</p>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium">Custom items</h2>
        <p className="mb-3 text-sm text-slate-600">Example with badges for Offers and Bookings.</p>
        <div className="h-40 rounded-md bg-slate-50/80 p-3 text-sm text-slate-500">
          Content area to scroll/test with the sticky bar.
        </div>
      </section>

      {/* Mobile nav bar (visible on mobile only) */}
      <MobileBottomNav />

      {/* Custom items example with badges */}
      <MobileBottomNav
        items={[
          { key: 'home', label: 'Home', href: '/', icon: require('lucide-react').Home },
          { key: 'search', label: 'Search', href: '/flights', icon: require('lucide-react').Search },
          { key: 'bookings', label: 'Bookings', href: '/dashboard/bookings', icon: require('lucide-react').Ticket, badgeCount: 2 },
          { key: 'offers', label: 'Offers', href: '/packages', icon: require('lucide-react').Percent, badgeCount: 5 },
          { key: 'account', label: 'Account', href: '/account', icon: require('lucide-react').User },
        ]}
        className="bottom-16"
      />
    </div>
  )
}
