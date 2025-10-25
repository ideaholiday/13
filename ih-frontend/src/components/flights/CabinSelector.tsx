"use client"

import React, { useState } from "react"
import { Armchair, Zap, Crown } from "lucide-react"
import { useFlightStore } from "@/lib/stores/flight-store"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CabinClass } from "@/lib/types/flight-booking"

interface CabinOption {
  value: CabinClass
  label: string
  icon: React.ReactNode
  description: string
}

const CABIN_OPTIONS: CabinOption[] = [
  {
    value: CabinClass.Economy,
    label: "Economy",
    icon: <Armchair className="h-4 w-4" />,
    description: "Basic comfort",
  },
  {
    value: CabinClass.PremiumEconomy,
    label: "Premium Economy",
    icon: <Zap className="h-4 w-4" />,
    description: "Extra legroom",
  },
  {
    value: CabinClass.Business,
    label: "Business",
    icon: <Crown className="h-4 w-4" />,
    description: "Premium service",
  },
  {
    value: CabinClass.First,
    label: "First",
    icon: <Crown className="h-4 w-4" />,
    description: "Luxury experience",
  },
]

interface CabinSelectorProps {
  isCompact?: boolean
}

export function CabinSelector({ isCompact = false }: CabinSelectorProps) {
  const { cabinClass, setCabinClass } = useFlightStore()
  const [open, setOpen] = useState(false)

  const selectedCabin = CABIN_OPTIONS.find((c) => c.value === cabinClass)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Armchair className="mr-2 h-4 w-4" />
          <span className="flex-1">
            {isCompact ? selectedCabin?.label.split(" ")[0] : selectedCabin?.label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="space-y-1 p-2">
          {CABIN_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setCabinClass(option.value)
                setOpen(false)
              }}
              className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                cabinClass === option.value
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100 text-gray-900"
              }`}
            >
              <div className="mt-1">{option.icon}</div>
              <div className="text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
              {cabinClass === option.value && (
                <div className="ml-auto mt-1 h-4 w-4 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
