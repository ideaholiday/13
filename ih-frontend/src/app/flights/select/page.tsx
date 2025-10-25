'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import { PassengerForm } from '@/components/flights/PassengerForm'
import { SeatMap } from '@/components/flights/SeatMap'
import { AddOnsSelector } from '@/components/flights/AddOnsSelector'
import { SSRSelector } from '@/components/flights/SSRSelector'
import { PriceBreakdown } from '@/components/flights/PriceBreakdown'
import { TripSummaryLayout } from '@/components/flights/TripSummaryLayout'
import type { Passenger, AddOn } from '@/lib/stores/consolidated-flight-store'

type TabType = 'passengers' | 'seats' | 'addons' | 'ssr'

export default function FlightSelectionPage() {
  const router = useRouter()
  const store = useFlightStore()

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('passengers')
  const [expandedPassenger, setExpandedPassenger] = useState<number | null>(0)
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set())
  const [seatCosts, setSeatCosts] = useState<Map<string, number>>(new Map())
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({})
  const [selectedSSRs, setSelectedSSRs] = useState<Record<string, Record<string, string>>>(store.ssrSelections || {})

  // Initialize passengers if not already
  useEffect(() => {
    if (store.passengers.length === 0) {
      // Generate empty passengers based on search
      const newPassengers: Passenger[] = []

      for (let i = 0; i < store.adults; i++) {
        newPassengers.push({
          id: `passenger-${i}`,
          type: 'ADT',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'M',
        })
      }

      for (let i = 0; i < store.children; i++) {
        newPassengers.push({
          id: `passenger-${store.adults + i}`,
          type: 'CHD',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'M',
        })
      }

      for (let i = 0; i < store.infants; i++) {
        newPassengers.push({
          id: `passenger-${store.adults + store.children + i}`,
          type: 'INF',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'M',
        })
      }

      // Initialize the store with these passengers
      newPassengers.forEach((passenger, index) => {
        store.updatePassenger(index, passenger)
      })
    }
  }, [store.passengers.length, store.adults, store.children, store.infants])

  useEffect(() => {
    setSelectedSSRs(store.ssrSelections || {})
  }, [store.ssrSelections])

  // Use passengers directly from store
  const passengers = store.passengers

  const totalPassengers = store.adults + store.children + store.infants
  const totalFlights = store.tripType === 'R' ? 2 : store.tripType === 'M' ? 3 : 1

  // Calculate pricing using TBO Fare structure
  const baseFare = store.selectedOutbound?.fare.offeredFare || 0
  const taxes = store.selectedOutbound?.fare.taxes || 0
  const seatCost = Array.from(seatCosts.values()).reduce((sum, cost) => sum + cost, 0)
  const addOnsCost = Object.entries(selectedAddOns).reduce(
    (total, [addOnId, quantity]) => {
      // Mock: average add-on price
      return total + 500 * quantity
    },
    0
  )

  // Validation
  const isPassengersComplete = passengers.every((p) => p.firstName && p.lastName && p.dateOfBirth)
  const isSeatsComplete = selectedSeats.size === totalPassengers
  const canProceedToCheckout = isPassengersComplete && isSeatsComplete

  // Handlers
  const handlePassengerSave = (index: number, passenger: Passenger) => {
    // Update the passenger in the store
    store.updatePassenger(index, passenger)
    setExpandedPassenger(null)
    toast.success(`${passenger.firstName} ${passenger.lastName} saved`)
  }

  const handleSeatSelect = (seatNumber: string, price: number) => {
    const newSeats = new Set(selectedSeats)
    newSeats.add(seatNumber)
    setSelectedSeats(newSeats)
    
    const newCosts = new Map(seatCosts)
    newCosts.set(seatNumber, price)
    setSeatCosts(newCosts)
    
    toast.success(`Seat ${seatNumber} selected${price > 0 ? ` for ₹${price}` : ' (Free)'}`)
  }

  const handleSeatDeselect = (seatNumber: string, price: number) => {
    const newSeats = new Set(selectedSeats)
    newSeats.delete(seatNumber)
    setSelectedSeats(newSeats)
    
    const newCosts = new Map(seatCosts)
    newCosts.delete(seatNumber)
    setSeatCosts(newCosts)
    
    toast.success(`Seat ${seatNumber} deselected`)
  }

  const handleAddOnChange = (addOnId: string, quantity: number) => {
    setSelectedAddOns((prev) => {
      const updated = { ...prev }
      if (quantity === 0) {
        delete updated[addOnId]
      } else {
        updated[addOnId] = quantity
      }
      return updated
    })
  }

  const handleSSRChange = (passengerId: string, ssrId: string, value: string) => {
    setSelectedSSRs((prev) => {
      const updated = { ...prev }
      if (!updated[passengerId]) {
        updated[passengerId] = {}
      }
      if (value === '') {
        delete updated[passengerId][ssrId]
      } else {
        updated[passengerId][ssrId] = value
      }
      return updated
    })
    store.updatePassengerSSR(passengerId, ssrId, value)
  }

  const handleProceedToCheckout = () => {
    if (!canProceedToCheckout) {
      toast.error('Please complete all required sections')
      return
    }

    // Save seat selections to store
    selectedSeats.forEach((seat) => {
      store.addSeatSelection('outbound', seat)
    })

    // Save add-ons to store (convert from record to AddOn objects)
    Object.entries(selectedAddOns).forEach(([addOnId, quantity]) => {
      for (let i = 0; i < quantity; i++) {
        store.addAddOn({
          type: 'baggage', // TODO: determine type from addOnId
          description: addOnId,
          price: 500,
          quantity: 1,
        })
      }
    })

    toast.success('Moving to checkout...')
    router.push('/flights/book')
  }

  const handleEditTrip = () => {
    router.push('/flights/search')
  }

  return (
    <TripSummaryLayout onEditTrip={handleEditTrip}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Details</h1>
              <p className="text-sm text-gray-600">
                {store.from?.code} → {store.to?.code} • {totalPassengers} passenger
                {totalPassengers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {['passengers', 'seats', 'addons', 'ssr'].map((tab, idx) => (
              <React.Fragment key={tab}>
                <button
                  onClick={() => setActiveTab(tab as TabType)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-sapphire-100 text-sapphire-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'passengers'
                    ? `Passengers (${passengers.filter((p) => p.firstName && p.lastName).length}/${totalPassengers})`
                    : tab === 'seats'
                    ? `Seats (${selectedSeats.size}/${totalPassengers})`
                    : tab === 'addons'
                    ? `Add-ons (${Object.values(selectedAddOns).reduce((a, b) => a + b, 0)})`
                    : `SSR (${Object.values(selectedSSRs).reduce((total, passengerSSRs) => total + Object.keys(passengerSSRs).length, 0)})`}
                </button>
                {idx < 3 && <div className="hidden sm:block text-gray-400">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passengers Tab */}
            {activeTab === 'passengers' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Complete Passenger Details</p>
                    <p>Fill in the details for all passengers. Names should match your travel documents.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {passengers.map((passenger, idx) => (
                    <div key={passenger.id}>
                      {expandedPassenger === idx ? (
                        <PassengerForm
                          passengerIndex={idx}
                          passengerType={passenger.type}
                          initialData={passenger}
                          onSave={(data) => handlePassengerSave(idx, data)}
                          onCancel={() => setExpandedPassenger(null)}
                          isExpanded={true}
                        />
                      ) : (
                        <button
                          onClick={() => setExpandedPassenger(idx)}
                          className="w-full text-left"
                        >
                          <PassengerForm
                            passengerIndex={idx}
                            passengerType={passenger.type}
                            initialData={passenger}
                            onSave={() => {}}
                            onCancel={() => {}}
                            isExpanded={false}
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isPassengersComplete && (
                  <button
                    onClick={() => setActiveTab('seats')}
                    className="w-full py-3 bg-sapphire-600 text-white rounded-lg font-medium hover:bg-sapphire-700 transition-colors"
                  >
                    Continue to Seat Selection →
                  </button>
                )}
              </div>
            )}

            {/* Seats Tab */}
            {activeTab === 'seats' && (
              <div className="space-y-6">
                {!isPassengersComplete && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Complete Passengers First</p>
                      <p>Please fill in all passenger details before selecting seats.</p>
                      <button
                        onClick={() => setActiveTab('passengers')}
                        className="text-amber-700 font-medium hover:underline mt-2"
                      >
                        Go to Passengers Tab
                      </button>
                    </div>
                  </div>
                )}

                {isPassengersComplete && (
                  <SeatMap
                    flightKey={`${store.selectedOutbound?.id || 'outbound'}`}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    onSeatDeselect={handleSeatDeselect}
                    maxSelectableSeats={totalPassengers}
                  />
                )}

                {isSeatsComplete && (
                  <button
                    onClick={() => setActiveTab('addons')}
                    className="w-full py-3 bg-sapphire-600 text-white rounded-lg font-medium hover:bg-sapphire-700 transition-colors"
                  >
                    Continue to Add-ons →
                  </button>
                )}
              </div>
            )}

            {/* Add-ons Tab */}
            {activeTab === 'addons' && (
              <div className="space-y-6">
                <AddOnsSelector
                  numberOfPassengers={totalPassengers}
                  selectedAddOns={selectedAddOns}
                  onAddOnChange={handleAddOnChange}
                />

                <button
                  onClick={() => setActiveTab('ssr')}
                  className="w-full py-3 bg-sapphire-600 text-white rounded-lg font-medium hover:bg-sapphire-700 transition-colors"
                >
                  Continue to SSR →
                </button>
              </div>
            )}

            {/* SSR Tab */}
            {activeTab === 'ssr' && (
              <div className="space-y-6">
                <SSRSelector
                  passengers={passengers}
                  selectedSSRs={selectedSSRs}
                  onSSRChange={handleSSRChange}
                />

                <button
                  onClick={handleProceedToCheckout}
                  disabled={!isPassengersComplete || !isSeatsComplete}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isPassengersComplete && isSeatsComplete
                      ? 'bg-sapphire-600 text-white hover:bg-sapphire-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Flight Info Card */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-3">Your Selection</h3>

                <div className="space-y-2 text-sm mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-medium text-gray-900">{totalPassengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium text-gray-900">
                      {store.from?.code} → {store.to?.code}
                    </span>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-2 text-sm">
                  <div
                    className={`flex items-center gap-2 ${
                      isPassengersComplete ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isPassengersComplete ? 'bg-green-600' : 'bg-gray-300'}`}
                    ></div>
                    <span>Passengers Complete</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      isSeatsComplete ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isSeatsComplete ? 'bg-green-600' : 'bg-gray-300'}`}
                    ></div>
                    <span>Seats Selected ({selectedSeats.size}/{totalPassengers})</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      Object.values(selectedSSRs).reduce((total, passengerSSRs) => total + Object.keys(passengerSSRs).length, 0) > 0 ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${Object.values(selectedSSRs).reduce((total, passengerSSRs) => total + Object.keys(passengerSSRs).length, 0) > 0 ? 'bg-green-600' : 'bg-gray-300'}`}
                    ></div>
                    <span>SSR Requests ({Object.values(selectedSSRs).reduce((total, passengerSSRs) => total + Object.keys(passengerSSRs).length, 0)})</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <PriceBreakdown
                baseFare={baseFare * totalPassengers * totalFlights}
                taxes={taxes * totalPassengers * totalFlights}
                seatCost={seatCost}
                addOnsCost={addOnsCost}
                numberOfPassengers={totalPassengers}
                numberOfFlights={totalFlights}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Price</p>
              <p className="text-2xl font-bold text-sapphire-600">
                ₹{(baseFare * totalPassengers * totalFlights + taxes * totalPassengers * totalFlights + seatCost + addOnsCost).toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={!canProceedToCheckout}
              className={`px-8 py-2 rounded-lg font-medium transition-colors ${
                canProceedToCheckout
                  ? 'bg-sapphire-600 text-white hover:bg-sapphire-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      </div>
    </TripSummaryLayout>
  )
}
