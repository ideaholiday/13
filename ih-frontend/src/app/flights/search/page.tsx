import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FlightSearchResults } from '@/components/flights/flight-search-results'

export const metadata: Metadata = {
  title: 'Flight Search Results',
  description: 'Find the best flight deals for your travel dates.',
}

export default function FlightSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sapphire-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sapphire-600"></div>
          </div>
        }>
          <FlightSearchResults />
        </Suspense>
      </div>
    </div>
  )
}