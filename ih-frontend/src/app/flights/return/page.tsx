'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import { ReturnFlightSelector } from '@/components/flights/ReturnFlightSelector'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ReturnFlightSelectionPage() {
  const router = useRouter()
  const store = useFlightStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Redirect if not a round trip or no outbound flight selected
    if (store.tripType !== 'R') {
      router.push('/flights/results')
      return
    }

    if (!store.selectedOutbound) {
      router.push('/flights/results')
      return
    }

    // If no return flights available, trigger search
    if (!store.returnFlights || store.returnFlights.length === 0) {
      console.log('🔍 No return flights in store, triggering search...')
      if (store.from && store.to && store.departDate && store.returnDate) {
        console.log('🚀 Executing search for return flights')
        store.performSearch().catch(err => {
          console.error('Return flight search failed:', err)
        })
      }
    }
  }, [store.tripType, store.selectedOutbound, store.returnFlights, router])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (store.tripType !== 'R') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Not a Round Trip</h2>
            <p className="text-gray-600 mb-4">This page is only for round trip bookings</p>
            <Button onClick={() => router.push('/flights/results')}>
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!store.selectedOutbound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Outbound Flight Selected</h2>
            <p className="text-gray-600 mb-4">Please select an outbound flight first</p>
            <Button onClick={() => router.push('/flights/results')}>
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFlightSelect = (flight: any) => {
    // Navigate to review page
    router.push('/flights/review')
  }

  const handleBack = () => {
    router.push('/flights/results')
  }

  const handleSkip = () => {
    // Navigate to review page without return flight
    router.push('/flights/review')
  }

  return (
    <ReturnFlightSelector
      onFlightSelect={handleFlightSelect}
      onBack={handleBack}
      onSkip={handleSkip}
    />
  )
}
