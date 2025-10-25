'use client'

import React from 'react'
import { 
  Receipt, 
  ChevronUp, 
  ChevronDown,
  Plane,
  Calendar,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'

interface FloatingTripSummaryProps {
  onToggle: () => void
  isOpen: boolean
  className?: string
}

export function FloatingTripSummary({ onToggle, isOpen, className = '' }: FloatingTripSummaryProps) {
  const store = useFlightStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const totalPassengers = store.adults + store.children + store.infants
  const outboundFlight = store.selectedOutbound
  const returnFlight = store.selectedReturn

  // Calculate total price
  const outboundPrice = outboundFlight?.fare.offeredFare || 0
  const returnPrice = returnFlight?.fare.offeredFare || 0
  const basePrice = (outboundPrice + returnPrice) * totalPassengers
  const addOnsPrice = store.addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
  const insurancePrice = store.insuranceSelected ? 200 : 0
  const totalPrice = basePrice + addOnsPrice + insurancePrice - (store.paymentInfo.discountAmount || 0)

  // Don't show if no flights selected
  if (!outboundFlight) return null

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Compact Summary */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Trip Summary</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </Button>
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Plane className="h-3 w-3" />
              <span>{store.from?.city} → {store.to?.city}</span>
              {store.tripType === 'R' && <Badge variant="secondary" className="text-xs ml-1">RT</Badge>}
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{store.departDate && formatDate(store.departDate)}</span>
              {store.returnDate && (
                <span> - {formatDate(store.returnDate)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <div className="px-4 pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="w-full text-xs"
          >
            {isOpen ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </div>
    </div>
  )
}
