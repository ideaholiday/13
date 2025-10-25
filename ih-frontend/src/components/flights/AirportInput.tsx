'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plane, ArrowRightLeft } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Airport {
  code: string
  name: string
  city: string
  country: string
}

const POPULAR_AIRPORTS: Airport[] = [
  { code: 'DEL', name: 'Indira Gandhi', city: 'Delhi', country: 'India' },
  { code: 'BOM', name: 'Bombay', city: 'Mumbai', country: 'India' },
  { code: 'BLR', name: 'Kempegowda', city: 'Bangalore', country: 'India' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose', city: 'Kolkata', country: 'India' },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
  { code: 'HYD', name: 'Rajiv Gandhi', city: 'Hyderabad', country: 'India' },
  { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India' },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India' },
]

interface AirportInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  onSwap?: () => void
}

export function AirportInput({ value, onChange, placeholder = 'From', label }: AirportInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<Airport[]>(POPULAR_AIRPORTS)

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase()
      setFiltered(
        POPULAR_AIRPORTS.filter(
          a => a.code.toLowerCase().includes(query) ||
                a.name.toLowerCase().includes(query) ||
                a.city.toLowerCase().includes(query)
        )
      )
    } else {
      setFiltered(POPULAR_AIRPORTS)
    }
  }, [search])

  const handleSelect = (airport: Airport) => {
    onChange(airport.code)
    setOpen(false)
    setSearch('')
  }

  const selectedAirport = POPULAR_AIRPORTS.find(a => a.code === value)

  return (
    <div className="w-full">
      {label && <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal px-3 py-2 h-auto border-gray-300 hover:border-gray-400"
          >
            <Plane size={16} className="mr-2 flex-shrink-0 text-gray-600" />
            <div className="text-left">
              {selectedAirport ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedAirport.code}</p>
                  <p className="text-xs text-gray-600">{selectedAirport.city}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">{placeholder}</p>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-2">
            <Input
              placeholder="Search airports, cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
              autoFocus
            />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map(airport => (
                <Button
                  key={airport.code}
                  variant="ghost"
                  className="w-full justify-start h-auto px-2 py-2"
                  onClick={() => handleSelect(airport)}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{airport.code} • {airport.name}</p>
                    <p className="text-xs text-gray-600">{airport.city}, {airport.country}</p>
                  </div>
                </Button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">No airports found</p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
