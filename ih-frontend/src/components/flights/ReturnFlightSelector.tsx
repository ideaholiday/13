'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plane, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Filter,
  SortAsc
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useFlightStore, type NormalizedFlight } from '@/lib/stores/consolidated-flight-store'
import { FlightResultCard } from '@/components/flights/FlightResultCard'
import { FiltersPanel, FilterState } from '@/components/flights/FiltersPanel'
import { SortingToolbar } from '@/components/flights/SortingToolbar'
import toast from 'react-hot-toast'

interface ReturnFlightSelectorProps {
  onFlightSelect: (flight: NormalizedFlight) => void
  onBack: () => void
  onSkip: () => void
}

type SortOption = 'price-asc' | 'price-desc' | 'duration' | 'departure' | 'arrival'

export function ReturnFlightSelector({ onFlightSelect, onBack, onSkip }: ReturnFlightSelectorProps) {
  const store = useFlightStore()
  const [sortBy, setSortBy] = useState<SortOption>('price-asc')
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    airlines: [],
    stops: 'all',
    refundableOnly: false,
    departureTimeRange: [0, 24],
    arrivalTimeRange: [0, 24],
  })
  const [showFilters, setShowFilters] = useState(false)

  // Get return flights from store
  const returnFlights = store.returnFlights || []
  const selectedOutbound = store.selectedOutbound
  const selectedReturn = store.selectedReturn

  // Process and filter flights
  const processedFlights = React.useMemo(() => {
    let filtered = [...returnFlights]

    // Apply price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
      filtered = filtered.filter(flight => 
        flight.fare.offeredFare >= filters.priceRange[0] && 
        flight.fare.offeredFare <= filters.priceRange[1]
      )
    }

    // Apply airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        flight.segments.some(segment => 
          filters.airlines.includes(segment.airline.code)
        )
      )
    }

    // Apply stops filter
    if (filters.stops !== 'all') {
      filtered = filtered.filter(flight => {
        const totalSegments = flight.segments.length
        if (filters.stops === 'nonstop') return totalSegments === 1
        if (filters.stops === 'onestop') return totalSegments === 2
        return true
      })
    }

    // Apply refundable filter
    if (filters.refundableOnly) {
      filtered = filtered.filter(flight => flight.isRefundable)
    }

    // Apply time filters
    filtered = filtered.filter(flight => {
      const firstSegment = flight.segments[0]
      if (!firstSegment) return true
      
      const depTime = new Date(`2000-01-01T${firstSegment.departureTime}`).getHours()
      const arrTime = new Date(`2000-01-01T${firstSegment.arrivalTime}`).getHours()
      
      return depTime >= filters.departureTimeRange[0] && 
             depTime <= filters.departureTimeRange[1] &&
             arrTime >= filters.arrivalTimeRange[0] && 
             arrTime <= filters.arrivalTimeRange[1]
    })

    // Sort flights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.fare.offeredFare - b.fare.offeredFare
        case 'price-desc':
          return b.fare.offeredFare - a.fare.offeredFare
        case 'duration':
          const aDuration = a.segments.reduce((sum, seg) => sum + seg.duration, 0)
          const bDuration = b.segments.reduce((sum, seg) => sum + seg.duration, 0)
          return aDuration - bDuration
        case 'departure':
          return a.segments[0]?.departureTime.localeCompare(b.segments[0]?.departureTime || '') || 0
        case 'arrival':
          const aArrival = a.segments[a.segments.length - 1]?.arrivalTime || ''
          const bArrival = b.segments[b.segments.length - 1]?.arrivalTime || ''
          return aArrival.localeCompare(bArrival)
        default:
          return 0
      }
    })

    return filtered
  }, [returnFlights, filters, sortBy])

  // Get available airlines for filter
  const availableAirlines = React.useMemo(() => {
    const map = new Map<string, string>()
    returnFlights.forEach((flight) => {
      flight.segments.forEach((segment) => {
        map.set(segment.airline.code, segment.airline.name || segment.airline.code)
      })
    })
    return Array.from(map, ([code, name]) => ({ code, name })).sort((a, b) => a.code.localeCompare(b.code))
  }, [returnFlights])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleSelectFlight = (flight: NormalizedFlight) => {
    const traceId = store.returnTraceId || 'trace-id-unknown'
    store.selectReturnFlight(flight, traceId)
    toast.success('Return flight selected!')
    onFlightSelect(flight)
  }

  const handleSkipReturn = () => {
    toast('Skipping return flight selection')
    onSkip()
  }

  if (!selectedOutbound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Outbound Flight Selected</h2>
            <p className="text-gray-600 mb-4">Please select an outbound flight first</p>
            <Button onClick={onBack}>Back to Outbound Flights</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Select Return Flight</h1>
                <p className="text-sm text-gray-600">
                  {store.to?.city} → {store.from?.city} • {store.returnDate?.toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSkipReturn}>
              Skip Return Flight
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Outbound Summary */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Outbound Selected</span>
              </div>
              <div className="text-sm text-blue-600">
                {selectedOutbound.segments[0]?.airline.name} • {formatTime(selectedOutbound.segments[0]?.departureTime || '')} - {formatTime(selectedOutbound.segments[selectedOutbound.segments.length - 1]?.arrivalTime || '')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-blue-900">{formatPrice(selectedOutbound.fare.offeredFare)}</div>
              <div className="text-sm text-blue-600">per person</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                <FiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={() => {
                    if (returnFlights.length === 0) {
                      setFilters({
                        priceRange: [0, 10000],
                        airlines: [],
                        stops: 'all',
                        refundableOnly: false,
                        departureTimeRange: [0, 24],
                        arrivalTimeRange: [0, 24],
                      })
                      return
                    }

                    setFilters({
                      priceRange: [
                        Math.min(...returnFlights.map(f => f.fare.offeredFare || 0)),
                        Math.max(...returnFlights.map(f => f.fare.offeredFare || 0)),
                      ],
                      airlines: [],
                      stops: 'all',
                      refundableOnly: false,
                      departureTimeRange: [0, 24],
                      arrivalTimeRange: [0, 24],
                    })
                  }}
                  priceRange={{
                    min: Math.min(...returnFlights.map(f => f.fare.offeredFare || 0)),
                    max: Math.max(...returnFlights.map(f => f.fare.offeredFare || 0)),
                  }}
                  availableAirlines={availableAirlines}
                  resultCount={processedFlights.length}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sorting Toolbar */}
            <div className="mb-6">
              <SortingToolbar
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={processedFlights.length}
                totalCount={returnFlights.length}
              />
            </div>

            {/* Results */}
            {processedFlights.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No return flights found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                  <Button variant="outline" onClick={() => setFilters({
                    priceRange: [0, 100000],
                    airlines: [],
                    stops: 'all',
                    refundableOnly: false,
                    departureTimeRange: [0, 24],
                    arrivalTimeRange: [0, 24],
                  })}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {processedFlights.map((flight) => (
                  <div key={flight.id}>
                    <FlightResultCard
                      flight={flight}
                      isSelected={selectedReturn?.id === flight.id}
                      onSelect={() => handleSelectFlight(flight)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
