'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import citiesData from '@/data/cities.json'

// City type based on our generated cities.json
interface City {
  name: string
  country: string
  airportCode: string
  airportName: string
  type: string
}

// Load all cities from the updated cities.json file
const ALL_CITIES: City[] = citiesData as City[]

// Popular Indian cities for initial display
const POPULAR_CITY_NAMES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Kochi', 'Thiruvananthapuram',
  'Guwahati', 'Lucknow', 'Chandigarh', 'Indore', 'Coimbatore', 'Varanasi',
  'Udaipur', 'Amritsar', 'Agra', 'Srinagar', 'Manali'
]

// Popular international destinations
const POPULAR_INTERNATIONAL = [
  'Dubai', 'Singapore', 'Bangkok', 'Kuala Lumpur', 'Maldives',
  'Bali', 'Phuket', 'Kathmandu', 'Colombo', 'London', 'Paris'
]

const POPULAR_CITIES: City[] = [
  ...POPULAR_CITY_NAMES.map(name => ALL_CITIES.find(c => c.name === name && c.country === 'India')),
  ...POPULAR_INTERNATIONAL.map(name => ALL_CITIES.find(c => c.name === name))
].filter((c): c is City => c !== undefined)

interface CitySelectorProps {
  label?: string
  value: string
  onChange: (city: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CitySelector({ 
  label = "Destination",
  value, 
  onChange, 
  placeholder = "City, Hotel, or Area",
  className = "",
  disabled = false
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value || '')
  const [filteredCities, setFilteredCities] = useState<City[]>(POPULAR_CITIES)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredCities(POPULAR_CITIES)
    } else if (searchTerm.length < 2) {
      // For single character, search only popular cities
      const filtered = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCities(filtered)
    } else {
      // For 2+ characters, search all cities
      const filtered = ALL_CITIES.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 50) // Limit to 50 results for performance
      setFilteredCities(filtered)
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

  useEffect(() => {
    // Update search term when value prop changes
    setSearchTerm(value || '')
  }, [value])

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue)
    setIsOpen(true)
    onChange(inputValue) // Update parent with typed value
  }

  const handleCitySelect = (city: City) => {
    const cityName = city.name
    setSearchTerm(cityName)
    onChange(cityName)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Label htmlFor="city-destination" className="text-slate-600 mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          id="city-destination"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10"
          disabled={disabled}
        />
        {isOpen && !disabled && (
          <Card className="absolute z-50 mt-1 w-full shadow-lg max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              {filteredCities.length > 0 ? (
                <div className="py-2">
                  {/* Group by country for better UX */}
                  {filteredCities.reduce((acc, city) => {
                    const country = city.country
                    if (!acc[country]) {
                      acc[country] = []
                    }
                    acc[country].push(city)
                    return acc
                  }, {} as Record<string, City[]>).India && (
                    <>
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase">India</p>
                      </div>
                      {filteredCities.filter(c => c.country === 'India').map((city) => (
                        <button
                          key={`${city.name}-${city.airportCode}`}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{city.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                <Building className="inline h-3 w-3 mr-1" />
                                {city.airportName || 'Hotels & Resorts'}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">
                              {city.airportCode}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {filteredCities.filter(c => c.country !== 'India').length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase">International</p>
                      </div>
                      {filteredCities.filter(c => c.country !== 'India').map((city) => (
                        <button
                          key={`${city.name}-${city.airportCode}`}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{city.name}</p>
                                <span className="text-xs text-slate-500">· {city.country}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                <Building className="inline h-3 w-3 mr-1" />
                                {city.airportName || 'Hotels & Resorts'}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">
                              {city.airportCode}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No cities found</p>
                  <p className="text-sm">Try searching with city name or country</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
