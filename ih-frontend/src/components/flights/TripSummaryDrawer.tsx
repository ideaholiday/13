'use client'

import React, { useState } from 'react'
import { 
  Plane, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CreditCard,
  Shield,
  Luggage,
  ArrowRight,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useFlightStore, type NormalizedFlight } from '@/lib/stores/consolidated-flight-store'

interface TripSummaryDrawerProps {
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  className?: string
}

export function TripSummaryDrawer({ isOpen, onClose, onEdit, className = '' }: TripSummaryDrawerProps) {
  const store = useFlightStore()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isOpen) return null

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const totalPassengers = store.adults + store.children + store.infants
  const outboundFlight = store.selectedOutbound
  const returnFlight = store.selectedReturn

  // Calculate pricing
  const outboundPrice = outboundFlight?.fare.offeredFare || 0
  const returnPrice = returnFlight?.fare.offeredFare || 0
  const basePrice = (outboundPrice + returnPrice) * totalPassengers
  const addOnsPrice = store.addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
  const insurancePrice = store.insuranceSelected ? 200 : 0
  const totalPrice = basePrice + addOnsPrice + insurancePrice

  const FlightSummary = ({ flight, title, isReturn = false }: { flight: NormalizedFlight; title: string; isReturn?: boolean }) => {
    const firstSegment = flight.segments[0]
    const lastSegment = flight.segments[flight.segments.length - 1]
    const totalDuration = flight.segments.reduce((sum, seg) => sum + seg.duration, 0)

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <Badge variant={isReturn ? "secondary" : "default"}>
            {flight.segments.length === 1 ? 'Non-stop' : `${flight.segments.length - 1} stop`}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{firstSegment.origin.code}</span>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-500">{formatDuration(totalDuration)}</div>
              <div className="text-xs text-gray-400">{firstSegment.flightNumber}</div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{lastSegment.destination.code}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(firstSegment.departureTime)}</span>
            </div>
            <div className="text-xs text-gray-500">{firstSegment.airline.name}</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(lastSegment.arrivalTime)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {formatPrice(flight.fare.offeredFare)} per person
            </div>
            <div className="flex items-center gap-2">
              {flight.isRefundable && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Refundable
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Luggage className="h-3 w-3 mr-1" />
                {flight.fare.baggageAllowance || 'Standard'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${className}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trip Summary</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{store.from?.city} → {store.to?.city}</span>
              {store.tripType === 'R' && <Badge variant="secondary" className="text-xs">Round Trip</Badge>}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{store.departDate && formatDate(store.departDate)}</span>
              {store.returnDate && (
                <>
                  <ArrowRight className="h-3 w-3" />
                  <span>{formatDate(store.returnDate)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}</span>
              <Badge variant="outline" className="text-xs">
                {store.adults}A {store.children > 0 && `${store.children}C`} {store.infants > 0 && `${store.infants}I`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Flights */}
            {outboundFlight && (
              <FlightSummary flight={outboundFlight} title="Outbound Flight" />
            )}

            {returnFlight && (
              <>
                <Separator />
                <FlightSummary flight={returnFlight} title="Return Flight" isReturn />
              </>
            )}

            {/* Add-ons */}
            {(store.addOns.length > 0 || store.insuranceSelected) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Add-ons</h4>
                  <div className="space-y-2">
                    {store.addOns.map((addon, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{addon.description}</span>
                        <span className="font-medium">{formatPrice(addon.price * addon.quantity)}</span>
                      </div>
                    ))}
                    {store.insuranceSelected && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Travel Insurance</span>
                        <span className="font-medium">{formatPrice(200)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Price Breakdown */}
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight Fare</span>
                  <span>{formatPrice(basePrice)}</span>
                </div>
                {addOnsPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Add-ons</span>
                    <span>{formatPrice(addOnsPrice)}</span>
                  </div>
                )}
                {insurancePrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance</span>
                    <span>{formatPrice(insurancePrice)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            {store.paymentInfo.promoCode && (
              <>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Promo Code</span>
                  <span className="text-green-600">-{formatPrice(store.paymentInfo.discountAmount || 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="space-y-3">
            {onEdit && (
              <Button variant="outline" className="w-full" onClick={onEdit}>
                Edit Trip
              </Button>
            )}
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(totalPrice - (store.paymentInfo.discountAmount || 0))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Secure booking with SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for managing trip summary drawer state
export function useTripSummaryDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setIsOpen(false)
  const toggleDrawer = () => setIsOpen(!isOpen)

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}
