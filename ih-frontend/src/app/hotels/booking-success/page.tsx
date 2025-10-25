import { Metadata } from 'next'
import { Suspense } from 'react'
import { HotelBookingSuccessPage } from '@/components/hotels/hotel-booking-success-page'

export const metadata: Metadata = {
  title: 'Hotel Booking Confirmed - Idea Holiday',
  description: 'Your hotel booking has been confirmed successfully. Download your voucher and prepare for your stay.',
  keywords: ['hotel booking confirmed', 'hotel confirmation', 'booking voucher', 'accommodation confirmed'],
}

export default function HotelBookingSuccessPageRoute() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 rounded"></div>
                <div className="h-48 bg-slate-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <HotelBookingSuccessPage />
    </Suspense>
  )
}