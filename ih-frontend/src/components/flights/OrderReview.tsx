'use client'

import React, { useMemo } from 'react'
import { ChevronDown, ChevronUp, Edit2, Trash2, AlertCircle } from 'lucide-react'
import type { Passenger, AddOn } from '@/lib/stores/unified-flight-store'

interface OrderReviewProps {
  outboundFlight: any
  returnFlight?: any
  passengers: Passenger[]
  addOns: AddOn[]
  baseFare: number
  taxes: number
  discount: number
  onEditAddOns?: () => void
  onRemoveAddOn?: (index: number) => void
}

export default function OrderReview({
  outboundFlight,
  returnFlight,
  passengers,
  addOns,
  baseFare,
  taxes,
  discount,
  onEditAddOns,
  onRemoveAddOn,
}: OrderReviewProps) {
  const [expandedSections, setExpandedSections] = React.useState({
    flights: true,
    passengers: true,
    addOns: true,
    pricing: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Calculate pricing
  const pricing = useMemo(() => {
    const addOnsCost = addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
    const subtotal = baseFare + taxes
    const discountedSubtotal = subtotal - discount
    const total = discountedSubtotal + addOnsCost

    return {
      baseFare,
      taxes,
      addOnsCost,
      subtotal,
      discountedSubtotal,
      discount,
      total,
      pricePerPerson: passengers.length > 0 ? total / passengers.length : 0,
    }
  }, [baseFare, taxes, discount, addOns, passengers.length])

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'N/A'
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const getDuration = (flight: any) => {
    if (!flight?.journeyDuration) return 'N/A'
    const hours = Math.floor(flight.journeyDuration / 60)
    const minutes = flight.journeyDuration % 60
    return `${hours}h ${minutes}m`
  }

  const getFlightInfo = (flight: any) => ({
    airline: flight?.airline?.name || 'Unknown Airline',
    flightNumber: flight?.flightNumber || 'N/A',
    departure: flight?.legs?.[0]?.departureTime || flight?.departureTime,
    arrival: flight?.legs?.[0]?.arrivalTime || flight?.arrivalTime,
    from: flight?.legs?.[0]?.origin?.code || flight?.from || 'N/A',
    to: flight?.legs?.[0]?.destination?.code || flight?.to || 'N/A',
  })

  const outbound = getFlightInfo(outboundFlight)
  const returnInfo = returnFlight ? getFlightInfo(returnFlight) : null

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* FLIGHTS SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('flights')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-sapphire-50 to-sapphire-25 hover:from-sapphire-100 hover:to-sapphire-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-sapphire-900">✈️ Flight Details</span>
            <span className="text-sm px-2 py-1 bg-sapphire-100 text-sapphire-700 rounded-full">
              {returnInfo ? '2 Flights' : '1 Flight'}
            </span>
          </div>
          {expandedSections.flights ? (
            <ChevronUp className="w-5 h-5 text-sapphire-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sapphire-600" />
          )}
        </button>

        {expandedSections.flights && (
          <div className="p-6 space-y-6">
            {/* Outbound Flight */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Outbound Flight</h3>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                  {formatDate(outbound.departure)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">From</p>
                  <p className="text-lg font-bold text-gray-900">{outbound.from}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-center text-gray-600 mb-1">{getDuration(outboundFlight)}</p>
                  <div className="h-0.5 bg-gradient-to-r from-sapphire-300 to-transparent"></div>
                  <p className="text-xs text-center text-gray-600 mt-1">{outbound.airline}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">To</p>
                  <p className="text-lg font-bold text-gray-900">{outbound.to}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Flight #</p>
                  <p className="text-lg font-bold text-sapphire-600">{outbound.flightNumber}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {formatTime(outbound.departure)} → {formatTime(outbound.arrival)}
                </span>
              </div>
            </div>

            {/* Return Flight */}
            {returnInfo && (
              <div className="border-l-4 border-ruby-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Return Flight</h3>
                  <span className="text-xs px-2 py-1 bg-ruby-100 text-ruby-700 rounded">
                    {formatDate(returnInfo.departure)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">From</p>
                    <p className="text-lg font-bold text-gray-900">{returnInfo.from}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-center text-gray-600 mb-1">{getDuration(returnFlight)}</p>
                    <div className="h-0.5 bg-gradient-to-r from-ruby-300 to-transparent"></div>
                    <p className="text-xs text-center text-gray-600 mt-1">{returnInfo.airline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">To</p>
                    <p className="text-lg font-bold text-gray-900">{returnInfo.to}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">Flight #</p>
                    <p className="text-lg font-bold text-ruby-600">{returnInfo.flightNumber}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    {formatTime(returnInfo.departure)} → {formatTime(returnInfo.arrival)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PASSENGERS SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('passengers')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-ruby-50 to-ruby-25 hover:from-ruby-100 hover:to-ruby-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-ruby-900">👥 Passengers</span>
            <span className="text-sm px-2 py-1 bg-ruby-100 text-ruby-700 rounded-full">
              {passengers.length}
            </span>
          </div>
          {expandedSections.passengers ? (
            <ChevronUp className="w-5 h-5 text-ruby-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-ruby-600" />
          )}
        </button>

        {expandedSections.passengers && (
          <div className="p-6 space-y-3">
            {passengers.map((passenger, index) => (
              <div key={passenger.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-gradient-to-br from-sapphire-400 to-sapphire-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        {passenger.type === 'ADT' ? 'Adult' : passenger.type === 'CHD' ? 'Child' : 'Infant'}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      DOB: {formatDate(passenger.dateOfBirth)} • {passenger.gender}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    passenger.type === 'ADT'
                      ? 'bg-emerald-100 text-emerald-700'
                      : passenger.type === 'CHD'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-pink-100 text-pink-700'
                  }`}>
                    {passenger.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD-ONS SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('addOns')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-25 hover:from-emerald-100 hover:to-emerald-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-emerald-900">🎁 Services & Add-ons</span>
            <span className="text-sm px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              {addOns.length}
            </span>
          </div>
          {expandedSections.addOns ? (
            <ChevronUp className="w-5 h-5 text-emerald-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-emerald-600" />
          )}
        </button>

        {expandedSections.addOns && (
          <div className="p-6">
            {addOns.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-600">No add-ons selected</p>
                {onEditAddOns && (
                  <button
                    onClick={onEditAddOns}
                    className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 mx-auto"
                  >
                    <Edit2 className="w-4 h-4" />
                    Add Services
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {addOns.map((addon, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{addon.description}</p>
                      <p className="text-xs text-gray-600">
                        {addon.type.charAt(0).toUpperCase() + addon.type.slice(1)} • Qty: {addon.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">
                        ₹{(addon.price * addon.quantity).toLocaleString('en-IN')}
                      </p>
                      {onRemoveAddOn && (
                        <button
                          onClick={() => onRemoveAddOn(index)}
                          className="p-1 hover:bg-ruby-100 text-ruby-600 rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRICING SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('pricing')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gold-50 to-gold-25 hover:from-gold-100 hover:to-gold-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gold-900">💰 Pricing Summary</span>
          </div>
          {expandedSections.pricing ? (
            <ChevronUp className="w-5 h-5 text-gold-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gold-600" />
          )}
        </button>

        {expandedSections.pricing && (
          <div className="p-6 space-y-3">
            {/* Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Base Fare ({passengers.length} × passengers)</span>
                <span className="font-medium text-gray-900">₹{pricing.baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Taxes & Fees</span>
                <span className="font-medium text-gray-900">₹{pricing.taxes.toLocaleString('en-IN')}</span>
              </div>
              {pricing.addOnsCost > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Services & Add-ons</span>
                  <span className="font-medium text-gray-900">₹{pricing.addOnsCost.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Discount info */}
            {pricing.discount > 0 && (
              <>
                <div className="border-t border-gray-200 pt-3"></div>
                <div className="flex justify-between items-center text-sm bg-emerald-50 p-3 rounded-lg">
                  <span className="text-emerald-700 font-medium">Discount Applied</span>
                  <span className="font-semibold text-emerald-700">-₹{pricing.discount.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center bg-gradient-to-r from-sapphire-50 to-sapphire-25 p-4 rounded-lg">
                <span className="font-semibold text-sapphire-900 text-lg">Total Amount</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-sapphire-700">₹{pricing.total.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    ₹{pricing.pricePerPerson.toLocaleString('en-IN', { maximumFractionDigits: 0 })} per person
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Price is locked once you proceed. Review your selections carefully.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
