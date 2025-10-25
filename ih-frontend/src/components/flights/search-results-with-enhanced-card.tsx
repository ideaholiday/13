/**
 * COMPLETE INTEGRATION EXAMPLE
 * Shows how to integrate FlightResultCard with search flow
 * 
 * This file demonstrates:
 * - Fetching flights from TBO API
 * - Displaying results with enhanced card component
 * - Handling user selection
 * - Sorting and filtering options
 * - Mobile responsive layout
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FlightResultCard } from '@/components/flights/flight-result-card-enhanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { 
  SlidersHorizontal, 
  DollarSign, 
  Clock, 
  Plane, 
  TrendingUp,
  Loader 
} from 'lucide-react'
import { searchFlights } from '@/lib/flight-api'
import type { FlightResult, FlightSearchResponse } from '@/types/tbo-flight-data'

// ============================================================================
// COMPONENT: Flight Search Results with Enhanced Card
// ============================================================================

export default function FlightSearchResultsPage() {
  // ========== STATE ==========
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'ranking'>('price')
  const [filterRefundable, setFilterRefundable] = useState(false)
  const [filterMeal, setFilterMeal] = useState(false)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)

  // ========== EFFECTS ==========

  // Fetch flights on component mount
  useEffect(() => {
    fetchFlights()
  }, [])

  // ========== FUNCTIONS ==========

  async function fetchFlights() {
    try {
      setLoading(true)
      setError(null)

      // Extract search parameters
      const params = searchParams
      if (!params) {
        throw new Error('Invalid search parameters')
      }

      const origin = params.get('origin') || 'DEL'
      const destination = params.get('destination') || 'BOM'
      const departDate = params.get('departDate') || '2025-11-20'
      const returnDate = params.get('returnDate') || undefined
      const tripType = params.get('tripType') === 'roundtrip' ? 'R' : 'O'
      const adults = parseInt(params.get('adults') || '1')
      const children = parseInt(params.get('children') || '0')
      const infants = parseInt(params.get('infants') || '0')
      const cabinClass = (params.get('cabinClass') || 'E') as 'E' | 'PE' | 'B' | 'F'

      // Call search API
      const response = await searchFlights({
        origin,
        destination,
        departDate,
        returnDate,
        tripType,
        adults,
        children,
        infants,
        cabinClass,
      })

      if (!response.success) {
        throw new Error(response.message || 'Search failed')
      }

      if (!response.data?.results) {
        throw new Error('No flights found')
      }

      setFlights(response.data.results)
      toast.success(`Found ${response.data.results.length} flights`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // ========== FILTERING & SORTING ==========

  function getFilteredAndSortedFlights(): FlightResult[] {
    let filtered = [...flights]

    // Apply filters
    if (filterRefundable) {
      filtered = filtered.filter((f) => f.IsRefundable)
    }

    if (filterMeal) {
      filtered = filtered.filter((f) => f.IsFreeMealAvailable)
    }

    if (maxPrice) {
      filtered = filtered.filter(
        (f) => (f.Fare?.OfferedFare || 0) <= maxPrice
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        filtered.sort(
          (a, b) =>
            (a.Fare?.OfferedFare || 0) - (b.Fare?.OfferedFare || 0)
        )
        break

      case 'duration':
        filtered.sort((a, b) => {
          const durA = calculateTotalDuration(a)
          const durB = calculateTotalDuration(b)
          return durA - durB
        })
        break

      case 'ranking':
        filtered.sort(
          (a, b) =>
            (a.SmartChoiceRanking || 999) - (b.SmartChoiceRanking || 999)
        )
        break
    }

    return filtered
  }

  function calculateTotalDuration(flight: FlightResult): number {
    return flight.Segments?.flat().reduce((sum, seg) => sum + seg.Duration, 0) || 0
  }

  function handleSelectFlight(flight: FlightResult) {
    setSelectedFlight(flight)
    toast.success('Flight selected')
  }

  function handleProceedToBooking() {
    if (!selectedFlight) {
      toast.error('Please select a flight')
      return
    }

    // TODO: Navigate to booking form with selected flight
    console.log('Proceeding to booking with:', selectedFlight)
    window.location.href = `/flights/booking?flightId=${selectedFlight.ResultIndex}`
  }

  // ========== RENDERING ==========

  const displayedFlights = getFilteredAndSortedFlights()
  const minPrice = flights.length > 0
    ? Math.min(...flights.map((f) => f.Fare?.OfferedFare || 0))
    : 0
  const maxPriceAvailable = flights.length > 0
    ? Math.max(...flights.map((f) => f.Fare?.OfferedFare || 0))
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flight Results
          </h1>
          {!loading && !error && (
            <p className="text-gray-600">
              Showing {displayedFlights.length} of {flights.length} flights
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Searching for the best flights...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button
              onClick={fetchFlights}
              variant="outline"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Results with Filters */}
        {!loading && flights.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-3">
              {displayedFlights.length > 0 ? (
                <div className="space-y-4">
                  {displayedFlights.map((flight) => (
                    <FlightResultCard
                      key={flight.ResultIndex}
                      flight={flight}
                      isSelected={
                        selectedFlight?.ResultIndex === flight.ResultIndex
                      }
                      onSelect={handleSelectFlight}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plane className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    No flights match your filters
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar: Sorting & Filtering */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 space-y-6 sticky top-4">
                {/* Selected Flight Summary */}
                {selectedFlight && (
                  <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                    <h3 className="font-bold text-sm text-blue-900 mb-2">
                      Selected Flight
                    </h3>
                    <div className="text-xs text-blue-800 space-y-1 mb-3">
                      <p>
                        <strong>{selectedFlight.AirlineCode}</strong>{' '}
                        {selectedFlight.Segments?.[0]?.[0]?.Airline?.FlightNumber}
                      </p>
                      <p>
                        ₹{Math.round(selectedFlight.Fare?.OfferedFare || 0)}
                      </p>
                    </div>
                    <Button
                      onClick={handleProceedToBooking}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Continue to Booking
                    </Button>
                  </div>
                )}

                {/* Sorting */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Sort By
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: 'price', label: 'Lowest Price', icon: DollarSign },
                      { id: 'duration', label: 'Shortest Duration', icon: Clock },
                      { id: 'ranking', label: 'Smart Choice', icon: Plane },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id as any)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                          sortBy === option.id
                            ? 'bg-blue-100 text-blue-900 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </h4>
                  <div className="space-y-3">
                    {/* Refundable */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterRefundable}
                        onChange={(e) =>
                          setFilterRefundable(e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Refundable</span>
                    </label>

                    {/* Free Meal */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterMeal}
                        onChange={(e) => setFilterMeal(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Free Meal
                      </span>
                    </label>

                    {/* Max Price */}
                    <div>
                      <label className="text-sm text-gray-700">
                        Max Price: ₹{maxPrice || maxPriceAvailable}
                      </label>
                      <input
                        type="range"
                        min={Math.floor(minPrice)}
                        max={Math.ceil(maxPriceAvailable)}
                        value={maxPrice || maxPriceAvailable}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value === maxPriceAvailable.toString()
                              ? null
                              : parseInt(e.target.value)
                          )
                        }
                        className="w-full mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <div className="pt-4 border-t">
                  <Badge variant="secondary" className="w-full justify-center">
                    {displayedFlights.length} Results
                  </Badge>
                </div>

                {/* Reset Button */}
                {(filterRefundable || filterMeal || maxPrice) && (
                  <Button
                    onClick={() => {
                      setFilterRefundable(false)
                      setFilterMeal(false)
                      setMaxPrice(null)
                      setSortBy('price')
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Reset All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && flights.length === 0 && !error && (
          <div className="text-center py-12">
            <Plane className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 mb-4">No flights found</p>
            <Button onClick={fetchFlights}>Search Again</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT: This component can be used as a page or standalone component
// ============================================================================

/**
 * USAGE IN APP ROUTER:
 *
 * // app/flights/search/page.tsx
 * import FlightSearchResultsPage from '@/components/flights/search-results-with-card'
 * export default FlightSearchResultsPage
 *
 * NAVIGATION:
 * window.location.href = '/flights/search?origin=DEL&destination=BOM&departDate=2025-11-20'
 */
