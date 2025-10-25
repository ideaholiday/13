'use client'

import { useState } from 'react'
import { format, parse, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  ChevronDown,
  Plane,
  Clock,
  Check,
  MapPin,
  Calendar,
} from 'lucide-react'
import type { NormalizedFlight } from '@/lib/stores/consolidated-flight-store'
import toast from 'react-hot-toast'

interface FlightResultCardProps {
  flight: NormalizedFlight
  isSelected?: boolean
  onSelect: (flight: NormalizedFlight) => void
}

export function FlightResultCard({ flight, isSelected, onSelect }: FlightResultCardProps) {
  const [expandedDetails, setExpandedDetails] = useState(false)

  const segments = flight.segments || []
  const firstSegment = segments[0]
  const lastSegment = segments[segments.length - 1]

  if (!firstSegment || !lastSegment) {
    return null
  }

  // Parse times from ISO format
  const departTimeStr = firstSegment.departureTime
  const arrivalTimeStr = lastSegment.arrivalTime

  const departTime = departTimeStr ? parseISO(departTimeStr) : new Date()
  const arrivalTime = arrivalTimeStr ? parseISO(arrivalTimeStr) : new Date()

  // Calculate duration
  const totalDuration = segments.reduce((sum, seg) => sum + (seg.duration || 0), 0)
  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60

  // Extract pricing
  const totalFare = flight.fare.offeredFare || flight.fare.totalFare || 0

  // Count stops
  const stops = Math.max(0, segments.length - 1)
  const hasStops = stops > 0

  // Extract airline info
  const primaryAirline = firstSegment.airline?.name || firstSegment.airline?.code || 'N/A'
  const isLCC = flight.isLCC === true

  // Get origin and destination codes
  const originCode = firstSegment.origin?.code || 'N/A'
  const destinationCode = lastSegment.destination?.code || 'N/A'

  // Build badges array safely
  const badges: string[] = []
  if (!hasStops) badges.push('Direct')
  if (flight.isRefundable) badges.push('Refundable')
  if (isLCC) badges.push('Budget')

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border-2 ${
        isSelected ? 'border-sapphire-600 bg-sapphire-50' : 'border-slate-200 hover:border-sapphire-400'
      }`}
    >
      <div className="p-4 md:p-6">
        {/* Main Flight Info */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-center mb-4">
          {/* Time & Route */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900">
                  {format(departTime, 'HH:mm')}
                </div>
                <div className="text-xs text-slate-600">
                  {originCode}
                </div>
              </div>

              {/* Duration & Stops */}
              <div className="flex-1 flex flex-col items-center">
                <div className="text-xs text-slate-600 mb-1">
                  {hours}h {minutes}m
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-sapphire-300 via-sapphire-500 to-sapphire-300"></div>
                <div className="text-xs text-slate-600 mt-1">
                  {hasStops ? `${stops} stop${stops > 1 ? 's' : ''}` : 'Direct'}
                </div>
              </div>

              {/* Arrival */}
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900">
                  {format(arrivalTime, 'HH:mm')}
                </div>
                <div className="text-xs text-slate-600">
                  {destinationCode}
                </div>
              </div>
            </div>
          </div>

          {/* Airline & Flight Details */}
          <div className="md:col-span-1 space-y-1">
            <div className="text-sm font-semibold text-slate-900">
              {primaryAirline}
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              {segments.map((seg, idx) => (
                <div key={idx} className="bg-slate-100 px-2 py-1 rounded inline-block mr-1">
                  {seg.flightNumber || `Flight ${idx + 1}`}
                </div>
              ))}
            </div>
            {firstSegment.aircraft && (
              <div className="text-xs text-slate-600 flex items-center gap-1">
                <Plane className="w-3 h-3" />
                {firstSegment.aircraft}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="md:col-span-1 flex items-center gap-2 flex-wrap">
            {flight.isRefundable && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 text-xs">
                ✓ Refundable
              </Badge>
            )}
          </div>

          {/* Price & Select */}
            <div className="md:col-span-1 flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-sapphire-600">
                  ₹{totalFare.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">
                  per person
                </div>
              </div>
            <Button
              onClick={() => {
                onSelect(flight)
                toast.success('Flight selected!')
              }}
              className={`${
                isSelected
                  ? 'bg-sapphire-600 hover:bg-sapphire-700'
                  : 'bg-sapphire-500 hover:bg-sapphire-600'
              } text-white font-semibold px-6 h-10`}
              size="sm"
            >
              {isSelected ? 'Selected ✓' : 'Select'}
            </Button>
          </div>
        </div>

        {/* Badges Row */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-200">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Details Toggle */}
        <button
          onClick={() => setExpandedDetails(!expandedDetails)}
          className="w-full flex items-center justify-center gap-2 text-sapphire-600 font-semibold py-2 text-sm"
        >
          {expandedDetails ? 'Hide' : 'Show'} details
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedDetails ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expanded Details */}
        {expandedDetails && (
          <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in-50 duration-200">
            {/* Segment Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">Flight segments:</h4>
              {segments.map((segment, idx) => {
                const segDeptTime = segment.departureTime ? parseISO(segment.departureTime) : new Date()
                const segArrTime = segment.arrivalTime ? parseISO(segment.arrivalTime) : new Date()
                return (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {segment.origin?.code || 'N/A'} → {segment.destination?.code || 'N/A'}
                      </span>
                      <span className="text-xs text-slate-600">
                        {segment.duration ? `${Math.floor(segment.duration / 60)}h ${segment.duration % 60}m` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {format(segDeptTime, 'HH:mm')} →{' '}
                      {format(segArrTime, 'HH:mm')}
                    </div>
                    <div className="text-xs text-slate-600">
                      {segment.airline?.name || segment.airline?.code} • {segment.baggage || 'Baggage TBD'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Price Breakdown */}
            {flight.fare && (
              <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold text-slate-900">Price breakdown:</h4>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Base Fare</span>
                  <span className="font-semibold">₹{(flight.fare.baseFare || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold">₹{(flight.fare.taxes || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs border-t pt-2 font-semibold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-sapphire-600">₹{totalFare.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Booking Info */}
            {flight.fareRules?.cancellation && flight.fareRules.cancellation.length > 0 && (
              <div className="bg-gold-50 p-3 rounded-lg text-sm border border-gold-200">
                <p className="text-gold-900 font-semibold text-xs">
                  🛡 {flight.fareRules.cancellation[0]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
