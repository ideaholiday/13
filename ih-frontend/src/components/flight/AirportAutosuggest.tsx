'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, Plane } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Airport } from '@/lib/stores/flightSearch'

interface AirportAutosuggestProps {
  value: Airport | null
  onChange: (airport: Airport | null) => void
  placeholder: string
  label: string
  error?: string
  className?: string
}

// Mock airport data - in production, this would come from an API
const mockAirports: Airport[] = [
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
  { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India' },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India' },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India' },
  { code: 'GOI', name: 'Dabolim Airport', city: 'Goa', country: 'India' },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India' },
  { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', country: 'India' },
  { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India' },
  { code: 'IXB', name: 'Bagdogra Airport', city: 'Siliguri', country: 'India' },
  { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', country: 'India' },
]

export function AirportAutosuggest({
  value,
  onChange,
  placeholder,
  label,
  error,
  className,
}: AirportAutosuggestProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search function
  const searchAirports = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAirports([])
      return
    }

    setLoading(true)
    
    try {
      // In production, this would be an API call
      // const response = await fetch(`/api/meta/airports?q=${encodeURIComponent(query)}`)
      // const data = await response.json()
      
      // For now, use mock data with filtering
      const filtered = mockAirports.filter(airport => 
        airport.city.toLowerCase().includes(query.toLowerCase()) ||
        airport.code.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase())
      )
      
      setAirports(filtered.slice(0, 10)) // Limit to 10 results
    } catch (error) {
      console.error('Error searching airports:', error)
      setAirports([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAirports(searchQuery)
    }, 200)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery, searchAirports])

  const handleSelect = (airport: Airport) => {
    onChange(airport)
    setOpen(false)
    setSearchQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const displayValue = value ? `${value.city} — ${value.code}, ${value.name}` : ''

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-start text-left font-normal h-12 px-4',
              !value && 'text-slate-500',
              error && 'border-red-500 focus-visible:ring-red-500'
            )}
            onKeyDown={handleKeyDown}
          >
            <MapPin className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            <Search className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder="Search airports..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
            />
            <CommandList>
              {loading && (
                <CommandEmpty>Searching airports...</CommandEmpty>
              )}
              {!loading && airports.length === 0 && searchQuery && (
                <CommandEmpty>No airports found.</CommandEmpty>
              )}
              {!loading && airports.length === 0 && !searchQuery && (
                <CommandEmpty>Start typing to search airports...</CommandEmpty>
              )}
              {airports.length > 0 && (
                <CommandGroup>
                  {airports.map((airport) => (
                    <CommandItem
                      key={airport.code}
                      value={`${airport.city} ${airport.code} ${airport.name}`}
                      onSelect={() => handleSelect(airport)}
                      className="flex items-start space-x-3 p-3"
                    >
                      <Plane className="h-4 w-4 mt-0.5 text-slate-500" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">
                          {airport.city} — {airport.code}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {airport.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {airport.country}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
