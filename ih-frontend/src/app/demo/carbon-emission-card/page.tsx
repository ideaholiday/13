"use client"
import React from 'react'
import { CarbonEmissionCard } from '@/components/shared/CarbonEmissionCard'

export default function CarbonEmissionCardDemo() {
  // Demo: hardcoded flightId and bookingId
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">CarbonEmissionCard Demo</h1>
  <CarbonEmissionCard flightId="flight_del_dxb" bookingId="booking_123" />
    </div>
  )
}
