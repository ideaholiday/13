import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HotelSearchResults } from '@/components/hotels/hotel-search-results'

export const metadata: Metadata = {
  title: 'Hotel Search Results',
  description: 'Browse available hotels for your travel dates.',
}

export default function HotelSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          </div>
        }>
          <HotelSearchResults />
        </Suspense>
      </div>
    </div>
  )
}