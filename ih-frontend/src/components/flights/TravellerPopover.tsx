'use client'

import { useState } from 'react'
import { useFlightStore } from '@/lib/stores/flight-store'
import { Button } from '@/components/ui/button'
import { Users, Plus, Minus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function TravellerPopover() {
  const store = useFlightStore()
  const [open, setOpen] = useState(false)

  const total = store.adults + store.children + store.infants
  const label = `${total} Traveller${total !== 1 ? 's' : ''}`

  const updateTravellers = (adults: number, children: number, infants: number) => {
    store.setTravellers(adults, children, infants)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-between sm:justify-center gap-2 px-3 py-2 h-auto border-gray-300 hover:border-gray-400"
        >
          <Users size={18} />
          <span className="text-sm">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-900">Adults</p>
              <p className="text-xs text-gray-600">Age 12+</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateTravellers(Math.max(1, store.adults - 1), store.children, store.infants)}
                disabled={store.adults <= 1}
              >
                <Minus size={16} />
              </Button>
              <span className="w-6 text-center font-semibold text-sm">{store.adults}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateTravellers(Math.min(9, store.adults + 1), store.children, store.infants)}
                disabled={store.adults >= 9}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-900">Children</p>
              <p className="text-xs text-gray-600">Age 2-11</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateTravellers(store.adults, Math.max(0, store.children - 1), store.infants)}
              >
                <Minus size={16} />
              </Button>
              <span className="w-6 text-center font-semibold text-sm">{store.children}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateTravellers(store.adults, Math.min(9, store.children + 1), store.infants)}
                disabled={store.children >= 9}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-900">Infants</p>
              <p className="text-xs text-gray-600">Below 2</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateTravellers(store.adults, store.children, Math.max(0, store.infants - 1))}
              >
                <Minus size={16} />
              </Button>
              <span className="w-6 text-center font-semibold text-sm">{store.infants}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateTravellers(store.adults, store.children, Math.min(9, store.infants + 1))}
                disabled={store.infants >= 9}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <Button
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
