'use client'

import React, { useState } from 'react'
import { 
  Plane, 
  Clock, 
  Shield, 
  Luggage, 
  AlertCircle, 
  CheckCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  Users,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useFlightStore, type NormalizedFlight } from '@/lib/stores/consolidated-flight-store'
import { RoundTripProgress } from './RoundTripProgress'
import { SSR_OPTIONS } from './SSRSelector'

interface FlightReviewProps {
  outboundFlight: NormalizedFlight
  returnFlight?: NormalizedFlight
  passengers: number
  onContinue: () => void
  onBack: () => void
}

export function FlightReview({ 
  outboundFlight, 
  returnFlight, 
  passengers, 
  onContinue, 
  onBack 
}: FlightReviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['fare-rules', 'baggage']))
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const store = useFlightStore()
  const passengerList = store.passengers || []
  const ssrSelections = store.ssrSelections || {}

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const FlightDetails = ({ flight, title }: { flight: NormalizedFlight; title: string }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flight.segments.map((segment, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{segment.origin.code}</div>
                    <div className="text-sm text-gray-600">{formatTime(segment.departureTime)}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-500">{formatDuration(segment.duration)}</div>
                    <div className="text-xs text-gray-400">{segment.flightNumber}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{segment.destination.code}</div>
                    <div className="text-sm text-gray-600">{formatTime(segment.arrivalTime)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{segment.airline.name}</div>
                  <div className="text-sm text-gray-600">{segment.airline.code}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Luggage className="h-4 w-4" />
                  <span>{segment.baggage || 'Standard baggage'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>{flight.isRefundable ? 'Refundable' : 'Non-refundable'}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900">Total Fare</div>
                <div className="text-sm text-blue-700">For {passengers} passenger{passengers > 1 ? 's' : ''}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-900">
                  {formatPrice(flight.fare.offeredFare * passengers)}
                </div>
                <div className="text-sm text-blue-700">
                  {formatPrice(flight.fare.offeredFare)} per person
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FareRulesSection = ({ flight, title }: { flight: NormalizedFlight; title: string }) => (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection(`${title}-fare-rules`)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {title} - Fare Rules & Policies
          </div>
          {expandedSections.has(`${title}-fare-rules`) ? 
            <ChevronUp className="h-5 w-5" /> : 
            <ChevronDown className="h-5 w-5" />
          }
        </CardTitle>
      </CardHeader>
      {expandedSections.has(`${title}-fare-rules`) && (
        <CardContent>
          <div className="space-y-4">
            {/* Cancellation Policy */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                Cancellation Policy
              </h4>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-900">
                      {flight.fare.cancellationWindow || '24 hours before departure'}
                    </div>
                    <div className="text-orange-700 mt-1">
                      {flight.isRefundable ? 
                        'Full refund available' : 
                        'Partial refund only - cancellation fees apply'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Allowance */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Luggage className="h-4 w-4 text-blue-600" />
                Baggage Allowance
              </h4>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">
                      {flight.fare.baggageAllowance || '7kg cabin + 15kg checked'}
                    </div>
                    <div className="text-blue-700 mt-1">
                      Additional baggage can be purchased at the airport
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Policy */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Change Policy
              </h4>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-purple-900">
                      Changes allowed with fee
                    </div>
                    <div className="text-purple-700 mt-1">
                      Date/time changes: ₹500 + fare difference
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Fare Rules */}
            {flight.fareRules && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Detailed Rules</h4>
                <div className="space-y-2">
                  {flight.fareRules.cancellation.map((rule, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      • {rule}
                    </div>
                  ))}
                  {flight.fareRules.baggage.map((rule, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      • {rule}
                    </div>
                  ))}
                  {flight.fareRules.changes.map((rule, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      • {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )

  const AddOnsSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          Add-ons & Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { id: 'extra-baggage', name: 'Extra Baggage (10kg)', price: 1500, description: 'Additional checked baggage allowance' },
            { id: 'seat-selection', name: 'Seat Selection', price: 500, description: 'Choose your preferred seat' },
            { id: 'meal', name: 'Special Meal', price: 800, description: 'Vegetarian/Non-vegetarian meal options' },
            { id: 'travel-insurance', name: 'Travel Insurance', price: 200, description: 'Comprehensive travel protection' },
          ].map((addon) => (
            <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={addon.id}
                  checked={selectedAddOns.has(addon.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedAddOns)
                    if (e.target.checked) {
                      newSelected.add(addon.id)
                    } else {
                      newSelected.delete(addon.id)
                    }
                    setSelectedAddOns(newSelected)
                  }}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">{addon.name}</div>
                  <div className="text-sm text-gray-600">{addon.description}</div>
                </div>
              </div>
              <div className="font-semibold">{formatPrice(addon.price)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const PassengerSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-sapphire-600" />
          Passenger Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {passengerList.length === 0 ? (
          <div className="text-sm text-gray-600">
            Passenger details will be captured on the next step. Please keep passports and date of birth information ready.
          </div>
        ) : (
          <div className="space-y-3">
            {passengerList.map((passenger, index) => {
              const ssrForPassenger = Object.keys(ssrSelections[passenger.id] || {})
              return (
                <div
                  key={passenger.id || index}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sapphire-100 text-sapphire-600 font-semibold">
                        {(passenger.firstName || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {passenger.firstName || 'First Name'} {passenger.lastName || 'Last Name'}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {passenger.type === 'ADT' ? 'Adult' : passenger.type === 'CHD' ? 'Child' : 'Infant'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Passenger {index + 1}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>
                        DOB: {passenger.dateOfBirth ? passenger.dateOfBirth : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span>
                        Passport: {passenger.passport || 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span>Seat: {passenger.seat || 'Assign during checkout'}</span>
                    </div>
                  </div>
                  {ssrForPassenger.length > 0 && (
                    <div className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="font-semibold">SSR:</span>{' '}
                      {ssrForPassenger
                        .map((ssrId) => SSR_OPTIONS.find((ssr) => ssr.id === ssrId)?.name || ssrId)
                        .join(', ')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const totalPrice = (outboundFlight.fare.offeredFare + (returnFlight?.fare.offeredFare || 0)) * passengers
  const addOnsPrice = Array.from(selectedAddOns).reduce((total, addonId) => {
    const addon = [
      { id: 'extra-baggage', price: 1500 },
      { id: 'seat-selection', price: 500 },
      { id: 'meal', price: 800 },
      { id: 'travel-insurance', price: 200 },
    ].find(a => a.id === addonId)
    return total + (addon?.price || 0)
  }, 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Your Flight</h1>
        <p className="text-gray-600">Please review your flight details, fare rules, and add-ons before proceeding</p>
      </div>

      {/* Round Trip Progress */}
      <RoundTripProgress 
        outboundSelected={!!outboundFlight}
        returnSelected={!!returnFlight}
        tripType={store.tripType}
      />

      {/* Flight Details */}
      <FlightDetails flight={outboundFlight} title="Outbound Flight" />
      {returnFlight ? (
        <FlightDetails flight={returnFlight} title="Return Flight" />
      ) : store.tripType === 'R' ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Return Flight Selected</h3>
            <p className="text-gray-600 mb-4">You can select a return flight or continue with one-way booking</p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/flights/return'}
              >
                Select Return Flight
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  // Continue without return flight
                  onContinue()
                }}
              >
                Continue Without Return
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Fare Rules */}
      <FareRulesSection flight={outboundFlight} title="Outbound" />
      {returnFlight && <FareRulesSection flight={returnFlight} title="Return" />}

      {/* Passenger Summary */}
      <PassengerSummary />

      {/* Add-ons */}
      <AddOnsSection />

      {/* Price Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Flight Fare ({passengers} passenger{passengers > 1 ? 's' : ''})</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {addOnsPrice > 0 && (
              <div className="flex justify-between">
                <span>Add-ons</span>
                <span>{formatPrice(addOnsPrice)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice + addOnsPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
        <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700">
          Continue to Passenger Details
        </Button>
      </div>
    </div>
  )
}
