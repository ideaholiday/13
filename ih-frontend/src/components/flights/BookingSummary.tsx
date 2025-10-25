'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar, Users, MapPin, Plane, DollarSign } from 'lucide-react'
import type { Passenger, AddOn } from '@/lib/stores/unified-flight-store'

interface BookingSummaryProps {
  bookingId: string
  outboundFlight: any
  returnFlight?: any
  passengers: Passenger[]
  addOns: AddOn[]
  baseFare: number
  taxes: number
  totalAmount: number
  bookingDate: string
  travelDate: string
  returnTravelDate?: string
}

export default function BookingSummary({
  bookingId,
  outboundFlight,
  returnFlight,
  passengers,
  addOns,
  baseFare,
  taxes,
  totalAmount,
  bookingDate,
  travelDate,
  returnTravelDate,
}: BookingSummaryProps) {
  const [expandedSections, setExpandedSections] = useState({
    booking: true,
    flights: true,
    passengers: true,
    addOns: addOns.length > 0,
    pricing: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

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
      return date.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
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

  const addOnsCost = addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
  const discount = baseFare + taxes - (totalAmount - addOnsCost)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* BOOKING ID SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('booking')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-sapphire-50 to-sapphire-25 hover:from-sapphire-100 hover:to-sapphire-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div className="text-left">
              <p className="text-sm text-sapphire-600 font-medium">YOUR BOOKING ID</p>
              <p className="text-lg font-bold text-sapphire-900 font-mono">{bookingId}</p>
            </div>
          </div>
          {expandedSections.booking ? (
            <ChevronUp className="w-5 h-5 text-sapphire-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sapphire-600" />
          )}
        </button>

        {expandedSections.booking && (
          <div className="px-6 py-4 space-y-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Booked On</p>
                <p className="font-semibold text-gray-900">{formatDate(bookingDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Travel Date</p>
                <p className="font-semibold text-gray-900">{formatDate(travelDate)}</p>
              </div>
              {returnTravelDate && (
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Return Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(returnTravelDate)}</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex gap-2">
              <span className="text-emerald-600">✓</span>
              <p className="text-sm text-emerald-800">
                Your booking is confirmed. Check your email for ticket details and itinerary.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FLIGHTS SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('flights')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-25 hover:from-emerald-100 hover:to-emerald-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-emerald-900">Flight Details</span>
            <span className="text-sm px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              {returnInfo ? '2 Flights' : '1 Flight'}
            </span>
          </div>
          {expandedSections.flights ? (
            <ChevronUp className="w-5 h-5 text-emerald-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-emerald-600" />
          )}
        </button>

        {expandedSections.flights && (
          <div className="p-6 space-y-6 border-t border-gray-200">
            {/* Outbound Flight */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Outbound Flight</h3>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                  {formatDate(outbound.departure)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">From</p>
                  <p className="text-xl font-bold text-gray-900">{outbound.from}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-center text-gray-600 mb-1">{getDuration(outboundFlight)}</p>
                  <div className="h-0.5 bg-gradient-to-r from-emerald-300 to-transparent"></div>
                  <p className="text-xs text-center text-gray-600 mt-1">{outbound.airline}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">To</p>
                  <p className="text-xl font-bold text-gray-900">{outbound.to}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Flight #</p>
                  <p className="text-lg font-bold text-emerald-600 font-mono">{outbound.flightNumber}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {formatTime(outbound.departure)} → {formatTime(outbound.arrival)}
                </span>
                <span className="text-xs px-2 py-1 bg-sapphire-100 text-sapphire-700 rounded">Confirmed</span>
              </div>
            </div>

            {/* Return Flight */}
            {returnInfo && (
              <div className="border-l-4 border-ruby-500 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Return Flight</h3>
                  <span className="text-xs px-2 py-1 bg-ruby-100 text-ruby-700 rounded">
                    {formatDate(returnInfo.departure)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">From</p>
                    <p className="text-xl font-bold text-gray-900">{returnInfo.from}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-center text-gray-600 mb-1">{getDuration(returnFlight)}</p>
                    <div className="h-0.5 bg-gradient-to-r from-ruby-300 to-transparent"></div>
                    <p className="text-xs text-center text-gray-600 mt-1">{returnInfo.airline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">To</p>
                    <p className="text-xl font-bold text-gray-900">{returnInfo.to}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Flight #</p>
                    <p className="text-lg font-bold text-ruby-600 font-mono">{returnInfo.flightNumber}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    {formatTime(returnInfo.departure)} → {formatTime(returnInfo.arrival)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-sapphire-100 text-sapphire-700 rounded">Confirmed</span>
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
            <Users className="w-5 h-5 text-ruby-600" />
            <span className="text-lg font-semibold text-ruby-900">Passengers</span>
            <span className="text-sm px-2 py-1 bg-ruby-100 text-ruby-700 rounded-full">{passengers.length}</span>
          </div>
          {expandedSections.passengers ? (
            <ChevronUp className="w-5 h-5 text-ruby-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-ruby-600" />
          )}
        </button>

        {expandedSections.passengers && (
          <div className="p-6 space-y-3 border-t border-gray-200">
            {passengers.map((passenger, index) => (
              <div key={passenger.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-gradient-to-br from-sapphire-400 to-sapphire-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        {passenger.type === 'ADT' ? 'Adult' : passenger.type === 'CHD' ? 'Child' : 'Infant'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      DOB: {formatDate(passenger.dateOfBirth)} • Gender: {passenger.gender}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      passenger.type === 'ADT'
                        ? 'bg-emerald-100 text-emerald-700'
                        : passenger.type === 'CHD'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {passenger.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD-ONS SECTION */}
      {addOns.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => toggleSection('addOns')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gold-50 to-gold-25 hover:from-gold-100 hover:to-gold-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span className="text-lg font-semibold text-gold-900">Services & Add-ons</span>
              <span className="text-sm px-2 py-1 bg-gold-100 text-gold-700 rounded-full">{addOns.length}</span>
            </div>
            {expandedSections.addOns ? (
              <ChevronUp className="w-5 h-5 text-gold-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gold-600" />
            )}
          </button>

          {expandedSections.addOns && (
            <div className="p-6 space-y-3 border-t border-gray-200">
              {addOns.map((addon, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{addon.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {addon.type.charAt(0).toUpperCase() + addon.type.slice(1)} • Qty: {addon.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{(addon.price * addon.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRICING SECTION */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('pricing')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-sapphire-50 to-sapphire-25 hover:from-sapphire-100 hover:to-sapphire-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sapphire-600" />
            <span className="text-lg font-semibold text-sapphire-900">Price Summary</span>
          </div>
          {expandedSections.pricing ? (
            <ChevronUp className="w-5 h-5 text-sapphire-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sapphire-600" />
          )}
        </button>

        {expandedSections.pricing && (
          <div className="p-6 space-y-3 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Base Fare ({passengers.length} × passengers)</span>
                <span className="font-medium text-gray-900">₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Taxes & Fees</span>
                <span className="font-medium text-gray-900">₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              {addOnsCost > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Services & Add-ons</span>
                  <span className="font-medium text-gray-900">₹{addOnsCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded-lg">
                  <span className="text-emerald-700 font-medium">Discount Applied</span>
                  <span className="font-semibold text-emerald-700">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-end bg-gradient-to-r from-sapphire-50 to-sapphire-25 p-4 rounded-lg">
                <span className="font-bold text-gray-900 text-lg">Total Amount Paid</span>
                <p className="text-3xl font-bold text-sapphire-700">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
