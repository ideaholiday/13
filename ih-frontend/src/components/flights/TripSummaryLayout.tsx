'use client'

import React, { useState, useEffect } from 'react'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import { TripSummaryDrawer, useTripSummaryDrawer } from './TripSummaryDrawer'
import { FloatingTripSummary } from './FloatingTripSummary'

interface TripSummaryLayoutProps {
  children: React.ReactNode
  showDrawer?: boolean
  showFloating?: boolean
  onEditTrip?: () => void
}

export function TripSummaryLayout({ 
  children, 
  showDrawer = true, 
  showFloating = true,
  onEditTrip 
}: TripSummaryLayoutProps) {
  const store = useFlightStore()
  const { isOpen, openDrawer, closeDrawer, toggleDrawer } = useTripSummaryDrawer()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-open drawer on desktop when flights are selected
  useEffect(() => {
    if (!isMobile && store.selectedOutbound && showDrawer) {
      openDrawer()
    }
  }, [store.selectedOutbound, isMobile, showDrawer, openDrawer])

  // Don't show if no flights selected
  if (!store.selectedOutbound) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isOpen && !isMobile ? 'mr-96' : ''}`}>
        {children}
      </div>

      {/* Trip Summary Drawer (Desktop) */}
      {showDrawer && !isMobile && (
        <TripSummaryDrawer
          isOpen={isOpen}
          onClose={closeDrawer}
          onEdit={onEditTrip}
          className={`${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        />
      )}

      {/* Floating Trip Summary (Mobile) */}
      {showFloating && isMobile && (
        <FloatingTripSummary
          isOpen={isOpen}
          onToggle={toggleDrawer}
        />
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeDrawer}
          />
          <TripSummaryDrawer
            isOpen={isOpen}
            onClose={closeDrawer}
            onEdit={onEditTrip}
            className="translate-x-0"
          />
        </>
      )}
    </div>
  )
}

// Hook for pages that need trip summary functionality
export function useTripSummary() {
  const store = useFlightStore()
  const { isOpen, openDrawer, closeDrawer, toggleDrawer } = useTripSummaryDrawer()

  const hasSelectedFlights = !!store.selectedOutbound
  const totalPassengers = store.adults + store.children + store.infants

  const calculateTotalPrice = () => {
    const outboundPrice = store.selectedOutbound?.fare.offeredFare || 0
    const returnPrice = store.selectedReturn?.fare.offeredFare || 0
    const basePrice = (outboundPrice + returnPrice) * totalPassengers
    const addOnsPrice = store.addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
    const insurancePrice = store.insuranceSelected ? 200 : 0
    return basePrice + addOnsPrice + insurancePrice - (store.paymentInfo.discountAmount || 0)
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    hasSelectedFlights,
    totalPassengers,
    totalPrice: calculateTotalPrice(),
    outboundFlight: store.selectedOutbound,
    returnFlight: store.selectedReturn,
    tripDetails: {
      from: store.from,
      to: store.to,
      departDate: store.departDate,
      returnDate: store.returnDate,
      tripType: store.tripType,
      adults: store.adults,
      children: store.children,
      infants: store.infants,
    }
  }
}
