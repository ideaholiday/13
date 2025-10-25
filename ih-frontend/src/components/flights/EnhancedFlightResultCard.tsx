'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Clock, 
  MapPin, 
  Wifi, 
  Coffee, 
  Luggage, 
  Shield, 
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useFlightStore, type NormalizedFlight } from '@/lib/stores/consolidated-flight-store'

interface FlightResultCardProps {
  flight: NormalizedFlight
  isSelected?: boolean
  onSelect?: () => void
  className?: string
}

export function FlightResultCard({ 
  flight, 
  isSelected = false, 
  onSelect, 
  className = '' 
}: FlightResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSeatMap, setShowSeatMap] = useState(false)

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

  const getAirlineLogo = (airlineCode: string) => {
    const logos: Record<string, string> = {
      '6E': 'https://logos.skyscnr.com/images/airlines/favicon/6E.png', // IndiGo
      'AI': 'https://logos.skyscnr.com/images/airlines/favicon/AI.png', // Air India
      'SG': 'https://logos.skyscnr.com/images/airlines/favicon/SG.png', // SpiceJet
      'UK': 'https://logos.skyscnr.com/images/airlines/favicon/UK.png', // Vistara
      'G8': 'https://logos.skyscnr.com/images/airlines/favicon/G8.png', // GoAir
      'IX': 'https://logos.skyscnr.com/images/airlines/favicon/IX.png', // Air India Express
    }
    return logos[airlineCode] || '/images/airline-default.png'
  }

  const getAirlineName = (airlineCode: string) => {
    const names: Record<string, string> = {
      '6E': 'IndiGo',
      'AI': 'Air India',
      'SG': 'SpiceJet',
      'UK': 'Vistara',
      'G8': 'GoAir',
      'IX': 'Air India Express',
    }
    return names[airlineCode] || airlineCode
  }

  const getAmenities = (airlineCode: string) => {
    const amenities: Record<string, string[]> = {
      '6E': ['WiFi', 'Meals', 'Entertainment'],
      'AI': ['WiFi', 'Meals', 'Entertainment', 'Priority Boarding'],
      'SG': ['Meals', 'Entertainment'],
      'UK': ['WiFi', 'Meals', 'Entertainment', 'Priority Boarding', 'Lounge Access'],
      'G8': ['Meals', 'Entertainment'],
      'IX': ['Meals'],
    }
    return amenities[airlineCode] || ['Meals']
  }

  const getAircraftType = (airlineCode: string) => {
    const aircraft: Record<string, string> = {
      '6E': 'Airbus A320',
      'AI': 'Boeing 787',
      'SG': 'Boeing 737',
      'UK': 'Boeing 737',
      'G8': 'Airbus A320',
      'IX': 'Boeing 737',
    }
    return aircraft[airlineCode] || 'Aircraft'
  }

  const isLivePrice = Math.random() > 0.7 // Mock live price indicator
  const hasDelay = Math.random() > 0.8 // Mock delay indicator
  const isPopular = Math.random() > 0.6 // Mock popularity indicator

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`transition-all duration-200 ${className}`}
    >
      <Card className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:shadow-lg hover:border-gray-300'
      }`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={getAirlineLogo(flight.segments[0]?.airline.code || '')} 
                  alt={getAirlineName(flight.segments[0]?.airline.code || '')}
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/images/airline-default.png'
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {getAirlineName(flight.segments[0]?.airline.code || '')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.segments[0]?.flightNumber} • {getAircraftType(flight.segments[0]?.airline.code || '')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isLivePrice && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    <Zap className="h-3 w-3 mr-1" />
                    Live Price
                  </Badge>
                )}
                {isPopular && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {hasDelay && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Delayed
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(flight.fare.offeredFare)}
              </div>
              <div className="text-sm text-gray-600">per person</div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
            {/* Departure */}
            <div className="lg:col-span-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(flight.segments[0]?.departureTime || '')}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {flight.segments[0]?.origin.code}
                </div>
                <div className="text-xs text-gray-500">
                  {flight.segments[0]?.origin.city || 'City'}
                </div>
              </div>
            </div>

            {/* Flight Path */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500">
                    {formatDuration(flight.segments.reduce((sum, seg) => sum + seg.duration, 0))}
                  </div>
                  <div className="text-xs text-gray-400">
                    {flight.segments.length === 1 ? 'Non-stop' : `${flight.segments.length - 1} stop`}
                  </div>
                  {hasDelay && (
                    <div className="text-xs text-red-500">
                      +15 min delay
                    </div>
                  )}
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>

            {/* Arrival */}
            <div className="lg:col-span-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(flight.segments[flight.segments.length - 1]?.arrivalTime || '')}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {flight.segments[flight.segments.length - 1]?.destination.code}
                </div>
                <div className="text-xs text-gray-500">
                  {flight.segments[flight.segments.length - 1]?.destination.city || 'City'}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Luggage className="h-4 w-4" />
              <span>{flight.fare.baggageAllowance || '7kg cabin + 15kg checked'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>{flight.isRefundable ? 'Refundable' : 'Non-refundable'}</span>
            </div>
            <div className="flex items-center gap-1">
              {getAmenities(flight.segments[0]?.airline.code || '').map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Less Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  More Details
                </>
              )}
            </Button>

            <Button
              onClick={onSelect}
              className={`px-6 ${
                isSelected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Select Flight
                </>
              )}
            </Button>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="space-y-4">
                {/* Segment Details */}
                {flight.segments.map((segment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">
                        Segment {index + 1}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {segment.flightNumber}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Departure</div>
                        <div className="font-semibold">{formatTime(segment.departureTime)}</div>
                        <div className="text-gray-500">{segment.origin.code}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Duration</div>
                        <div className="font-semibold">{formatDuration(segment.duration)}</div>
                        <div className="text-gray-500">{segment.aircraft || 'Aircraft'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600">Arrival</div>
                        <div className="font-semibold">{formatTime(segment.arrivalTime)}</div>
                        <div className="text-gray-500">{segment.destination.code}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Fare Breakdown */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Fare Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Fare</span>
                      <span>{formatPrice(flight.fare.baseFare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span>{formatPrice(flight.fare.taxes)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(flight.fare.totalFare)}</span>
                    </div>
                  </div>
                </div>

                {/* Fare Rules */}
                {flight.fareRules && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Fare Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-800">Cancellation</div>
                        <div className="text-gray-600">{flight.fareRules.cancellation.join(', ')}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Baggage</div>
                        <div className="text-gray-600">{flight.fareRules.baggage.join(', ')}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Changes</div>
                        <div className="text-gray-600">{flight.fareRules.changes.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
