import { Metadata } from 'next'
import { Suspense } from 'react'
import { BookingManagementDashboard } from '@/components/dashboard/booking-management-dashboard'

export const metadata: Metadata = {
  title: 'My Bookings - Idea Holiday',
  description: 'View and manage all your flight bookings, download tickets, and track booking status.',
  keywords: ['my bookings', 'flight bookings', 'ticket download', 'booking management', 'travel dashboard'],
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-12 bg-slate-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <BookingManagementDashboard />
    </Suspense>
  )
}