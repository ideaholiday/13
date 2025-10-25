'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Building, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { fetchAutocomplete, transformToAutocompleteItems, AutocompleteItem } from '@/lib/api'

// Hotel city type based on API response
interface HotelCity {
  id: number
  name: string
  country: string
  stateProvince: string
  countryCode: string
  type: string
}

// Popular Indian cities for initial display (hardcoded for performance)
const POPULAR_INDIAN_CITIES = [
  { id: 1, name: 'Mumbai', country: 'India', countryCode: 'IN', stateProvince: 'Maharashtra', type: 'city' },
  { id: 2, name: 'Delhi', country: 'India', countryCode: 'IN', stateProvince: 'Delhi', type: 'city' },
  { id: 3, name: 'Bangalore', country: 'India', countryCode: 'IN', stateProvince: 'Karnataka', type: 'city' },
  { id: 4, name: 'Kolkata', country: 'India', countryCode: 'IN', stateProvince: 'West Bengal', type: 'city' },
  { id: 5, name: 'Chennai', country: 'India', countryCode: 'IN', stateProvince: 'Tamil Nadu', type: 'city' },
  { id: 6, name: 'Hyderabad', country: 'India', countryCode: 'IN', stateProvince: 'Telangana', type: 'city' },
  { id: 7, name: 'Pune', country: 'India', countryCode: 'IN', stateProvince: 'Maharashtra', type: 'city' },
  { id: 8, name: 'Ahmedabad', country: 'India', countryCode: 'IN', stateProvince: 'Gujarat', type: 'city' },
  { id: 9, name: 'Jaipur', country: 'India', countryCode: 'IN', stateProvince: 'Rajasthan', type: 'city' },
  { id: 10, name: 'Goa', country: 'India', countryCode: 'IN', stateProvince: 'Goa', type: 'city' }
]

// Popular international destinations
const POPULAR_INTERNATIONAL_CITIES = [
  { id: 11, name: 'Dubai', country: 'UAE', countryCode: 'AE', stateProvince: '', type: 'city' },
  { id: 12, name: 'Singapore', country: 'Singapore', countryCode: 'SG', stateProvince: '', type: 'city' },
  { id: 13, name: 'Bangkok', country: 'Thailand', countryCode: 'TH', stateProvince: '', type: 'city' },
  { id: 14, name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', stateProvince: '', type: 'city' },
  { id: 15, name: 'Maldives', country: 'Maldives', countryCode: 'MV', stateProvince: '', type: 'city' },
  { id: 16, name: 'Bali', country: 'Indonesia', countryCode: 'ID', stateProvince: '', type: 'city' },
  { id: 17, name: 'Phuket', country: 'Thailand', countryCode: 'TH', stateProvince: '', type: 'city' },
  { id: 18, name: 'Kathmandu', country: 'Nepal', countryCode: 'NP', stateProvince: '', type: 'city' },
  { id: 19, name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', stateProvince: '', type: 'city' },
  { id: 20, name: 'London', country: 'UK', countryCode: 'GB', stateProvince: '', type: 'city' }
]

const POPULAR_CITIES: HotelCity[] = [...POPULAR_INDIAN_CITIES, ...POPULAR_INTERNATIONAL_CITIES]

interface HotelCitySelectorProps {
  label?: string
  value: string
  onChange: (city: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function HotelCitySelector({ 
  label = "City, Property Name Or Location",
  value, 
  onChange, 
  placeholder = "Search cities or hotels...",
  className = "",
  disabled = false
}: HotelCitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value || '')
  const [filteredCities, setFilteredCities] = useState<HotelCity[]>(POPULAR_CITIES)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.length === 0) {
        setFilteredCities(POPULAR_CITIES)
        setIsLoading(false)
      } else if (searchTerm.length < 2) {
        // For single character, search only popular cities
        const filtered = POPULAR_CITIES.filter(city =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.country.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredCities(filtered)
        setIsLoading(false)
      } else {
        // For 2+ characters, search via API with loading state
        setIsLoading(true)

        try {
          const response = await fetchAutocomplete(searchTerm)
          const items = transformToAutocompleteItems(response)

          // Convert to our HotelCity format for compatibility
          const convertedCities: HotelCity[] = items.map(item => ({
            id: parseInt(item.code) || 0,
            name: item.label,
            country: item.countryName || '',
            stateProvince: '',
            countryCode: item.country || '',
            type: item.type
          }))

          setFilteredCities(convertedCities.slice(0, 100)) // Limit to 100 results
        } catch (error) {
          console.error('Autocomplete error:', error)
          setFilteredCities([])
        } finally {
          setIsLoading(false)
        }
      }
    }, 200)

    return () => clearTimeout(timeoutId)
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

  const handleCitySelect = (city: HotelCity) => {
    const cityName = city.name
    setSearchTerm(cityName)
    onChange(cityName)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const getCountryFlag = (countryCode: string) => {
    // Simple flag emoji mapping for common countries
    const flags: Record<string, string> = {
      'IN': '🇮🇳',
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'AU': '🇦🇺',
      'CA': '🇨🇦',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'JP': '🇯🇵',
      'CN': '🇨🇳',
      'KR': '🇰🇷',
      'SG': '🇸🇬',
      'TH': '🇹🇭',
      'MY': '🇲🇾',
      'ID': '🇮🇩',
      'PH': '🇵🇭',
      'VN': '🇻🇳',
      'AE': '🇦🇪',
      'SA': '🇸🇦',
      'EG': '🇪🇬',
      'ZA': '🇿🇦',
      'BR': '🇧🇷',
      'AR': '🇦🇷',
      'MX': '🇲🇽',
      'RU': '🇷🇺',
      'TR': '🇹🇷',
      'NL': '🇳🇱',
      'CH': '🇨🇭',
      'AT': '🇦🇹',
      'BE': '🇧🇪',
      'SE': '🇸🇪',
      'NO': '🇳🇴',
      'DK': '🇩🇰',
      'FI': '🇫🇮',
      'PL': '🇵🇱',
      'CZ': '🇨🇿',
      'HU': '🇭🇺',
      'GR': '🇬🇷',
      'PT': '🇵🇹',
      'IE': '🇮🇪',
      'NZ': '🇳🇿',
      'LK': '🇱🇰',
      'BD': '🇧🇩',
      'PK': '🇵🇰',
      'NP': '🇳🇵',
      'BT': '🇧🇹',
      'MV': '🇲🇻'
    }
    return flags[countryCode] || '🌍'
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Label htmlFor="hotel-city-destination" className="text-slate-600 mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          id="hotel-city-destination"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10"
          disabled={disabled}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        )}
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
                  }, {} as Record<string, HotelCity[]>).India && (
                    <>
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase">🇮🇳 India</p>
                      </div>
                      {filteredCities.filter(c => c.country === 'India').map((city) => (
                        <button
                          key={`${city.name}-${city.id}`}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{city.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                <Building className="inline h-3 w-3 mr-1" />
                                {city.stateProvince ? `${city.stateProvince}, India` : 'Hotels & Resorts'}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">
                              {city.id}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {filteredCities.filter(c => c.country !== 'India').length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase">🌍 International</p>
                      </div>
                      {filteredCities.filter(c => c.country !== 'India').map((city) => (
                        <button
                          key={`${city.name}-${city.id}`}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{city.name}</p>
                                <span className="text-xs text-slate-500">
                                  {getCountryFlag(city.countryCode)} {city.country}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                <Building className="inline h-3 w-3 mr-1" />
                                {city.stateProvince ? `${city.stateProvince}` : 'Hotels & Resorts'}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">
                              {city.id}
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
