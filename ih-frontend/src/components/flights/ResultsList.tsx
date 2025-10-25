'use client'

import { NormalizedItinerary } from '@/lib/normalizeFlights'
import FlightCard from './FlightCardExpedia'
import { useFlightFilters } from '@/store/flightFilters'
import { Plane } from 'lucide-react'
import { useMemo } from 'react'

export default function ResultsList({ items, traceId }: { items: NormalizedItinerary[]; traceId: string }) {
  const filters = useFlightFilters()

  // Use useMemo for instant filtering with no delay
  const filtered = useMemo(() => {
    return items.filter((f) => {
      if (filters.nonStopOnly && f.stops > 0) return false
      if (filters.refundOnly && !f.isRefundable) return false
      if (filters.lccOnly && !f.isLcc) return false
      if (f.total < filters.priceRange[0] || f.total > filters.priceRange[1]) return false
      if (filters.airlines.length > 0 && f.segments.length > 0) {
        if (!filters.airlines.includes(f.segments[0].airlineCode)) return false
      }
      return true
    })
  }, [items, filters.nonStopOnly, filters.refundOnly, filters.lccOnly, filters.priceRange, filters.airlines])

  if (filtered.length === 0)
    return (
      <div className="text-center py-12">
        <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No flights found matching your filters.</p>
      </div>
    )

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600 mb-4">
        Showing {filtered.length} of {items.length} flights
      </div>
      {filtered.map((it) => (
        <FlightCard key={it.resultIndex} item={it} traceId={traceId} />
      ))}
    </div>
  )
}
