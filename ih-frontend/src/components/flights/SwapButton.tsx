"use client"

import React from "react"
import { ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFlightStore } from "@/lib/stores/flight-store"

interface SwapButtonProps {
  legIndex?: number
  className?: string
}

export function SwapButton({ legIndex = 0, className = "" }: SwapButtonProps) {
  const { legs, setLegs } = useFlightStore()
  const currentLeg = legs[legIndex]

  const handleSwap = () => {
    if (currentLeg) {
      const newLegs = [...legs]
      newLegs[legIndex] = {
        ...currentLeg,
        origin: currentLeg.destination,
        destination: currentLeg.origin,
      }
      setLegs(newLegs)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleSwap}
      className={`rounded-full p-2 hover:bg-blue-50 transition-all ${className}`}
      title="Swap origin and destination"
    >
      <ArrowRightLeft className="h-4 w-4 text-gray-600" />
    </Button>
  )
}
