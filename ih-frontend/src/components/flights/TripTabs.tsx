'use client'

import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import { TripType } from '@/lib/types/flight-booking'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plane, RotateCw, Map } from 'lucide-react'

export function TripTabs() {
  const store = useFlightStore()

  const tripOptions = [
    { value: TripType.Oneway, label: 'One Way', icon: Plane },
    { value: TripType.RoundTrip, label: 'Round Trip', icon: RotateCw },
    { value: TripType.MultiCity, label: 'Multi-City', icon: Map },
  ]

  return (
    <Tabs
      value={store.tripType}
      onValueChange={(value) => store.setTripType(value as TripType)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
        {tripOptions.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
