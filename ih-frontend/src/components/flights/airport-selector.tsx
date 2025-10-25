'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { Airport } from '@/types'
import airportsData from '@/data/airports.json'

// Load all airports from the updated airports.json file
const ALL_AIRPORTS: Airport[] = airportsData as Airport[]

// Popular airports for initial display (top Indian cities)
const POPULAR_AIRPORT_CODES = [
  'DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'AMD', 'PNQ', 'GOI', 'COK',
  'GAU', 'LKO', 'IXC', 'JAI', 'ATQ', 'AGR', 'VNS', 'IXR', 'UDR', 'SXR'
]

const POPULAR_AIRPORTS: Airport[] = POPULAR_AIRPORT_CODES
  .map(code => ALL_AIRPORTS.find(a => a.code === code))
  .filter((a): a is Airport => a !== undefined)

interface AirportSelectorProps {
  label: string
  value: Airport | null
  onChange: (airport: Airport | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function AirportSelector({ 
  label, 
  value, 
  onChange, 
  placeholder = "City or Airport",
  className = "",
  disabled = false
}: AirportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value?.city || '')
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>(POPULAR_AIRPORTS)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredAirports(POPULAR_AIRPORTS)
    } else if (searchTerm.length < 2) {
      // For single character, search only popular airports
      const filtered = POPULAR_AIRPORTS.filter(airport =>
        airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAirports(filtered)
    } else {
      // For 2+ characters, search all airports
      const filtered = ALL_AIRPORTS.filter(airport =>
        airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.code.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 50) // Limit to 50 results for performance
      setFilteredAirports(filtered)
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue)
    setIsOpen(true)
    
    // Clear selection if input doesn't match selected airport
    if (value && !value.city.toLowerCase().includes(inputValue.toLowerCase())) {
      onChange(null)
    }
  }

  const handleAirportSelect = (airport: Airport) => {
    setSearchTerm(airport.city)
    onChange(airport)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Label htmlFor={`airport-${label}`} className="text-slate-600 mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          id={`airport-${label}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10"
          disabled={disabled}
        />
        {isOpen && !disabled && (
          <Card className="absolute z-50 mt-1 w-full shadow-lg max-h-64 overflow-y-auto">
            <CardContent className="p-0">
              {filteredAirports.length > 0 ? (
                <div className="py-2">
                  {filteredAirports.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => handleAirportSelect(airport)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{airport.city}</p>
                          <p className="text-sm text-slate-600 truncate">{airport.name}</p>
                        </div>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {airport.code}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No airports found</p>
                  <p className="text-sm">Try searching with city name or airport code</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}