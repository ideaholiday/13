'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, Search, Building2, AlertCircle } from 'lucide-react'
import { useHotelSearchStore } from '@/lib/stores/hotel-search-store'
import { trackSearch } from '@/lib/track'
import { hotelApi, Country, City } from '@/lib/api/hotels'
import { HotelCitySelector } from '@/components/hotels/hotel-city-selector'
import HotelAutosuggest from '@/components/HotelAutosuggest'

export default function HotelSearchPage() {
  const router = useRouter()
  const { setSearchParams, setSearchResults, setTraceId, clearAll } = useHotelSearchStore()
  
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])

  const guestPopoverRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    country: 'IN', // Default to India
    city: 'BLR',
    cityId: 'BLR',
    cityName: 'Bangalore',
    countryName: 'India',
    checkIn: '',
    checkOut: '',
    rooms: [{ adults: 2, children: 0 }],
    currency: 'INR',
    nationality: 'IN',
  })

  useEffect(() => {
    // Click outside handler for guest popover
    const handleClickOutside = (event: MouseEvent) => {
      if (guestPopoverRef.current && !guestPopoverRef.current.contains(event.target as Node)) {
        setIsGuestPopoverOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    loadCountries()
    // Load cities for India by default
    loadCities('IN')
  }, [])

  useEffect(() => {
    if (formData.country) {
      loadCities(formData.country)
    }
  }, [formData.country])

  const loadCountries = async () => {
    try {
      setLoading(true)
      const response = await hotelApi.getCountries()
      if (response.success) {
        setCountries(response.data)
        setFormData(prev => {
          if (!prev.countryName) {
            const defaultCountry = response.data.find(country => country.iso2 === prev.country) || response.data[0]
            return defaultCountry
              ? { ...prev, country: defaultCountry.iso2, countryName: defaultCountry.name }
              : prev
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCities = async (countryCode: string) => {
    try {
      setLoading(true)
      const response = await hotelApi.getCities(countryCode)
      if (response.success) {
        setCities(response.data)
        setFormData(prev => {
          const currentName = (prev.cityName || '').toLowerCase()
          const matchByName = response.data.find(city => city.name.toLowerCase() === currentName)
          if (matchByName) {
            return {
              ...prev,
              city: matchByName.tbo_city_code,
              cityId: matchByName.tbo_city_code,
            }
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }

      if (field === 'checkIn' && value) {
        if (updated.checkOut && updated.checkOut <= value) {
          const nextDay = new Date(value)
          nextDay.setDate(nextDay.getDate() + 1)
          updated.checkOut = nextDay.toISOString().split('T')[0]
        }
      }

      if (field === 'country') {
        const countryMatch = countries.find(country => country.iso2 === value)
        if (countryMatch) {
          updated.countryName = countryMatch.name
        }
      }

      return updated
    })
  }

  const handleRoomChange = (index: number, field: string, value: number) => {
    const newRooms = [...formData.rooms]
    newRooms[index] = {
      ...newRooms[index],
      [field]: value,
    }
    setFormData(prev => ({
      ...prev,
      rooms: newRooms,
    }))
  }

  const addRoom = () => {
    if (formData.rooms.length < 9) {
      setFormData(prev => ({
        ...prev,
        rooms: [...prev.rooms, { adults: 2, children: 0 }],
      }))
    }
  }

  const removeRoom = (index: number) => {
    if (formData.rooms.length > 1) {
      const newRooms = formData.rooms.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        rooms: newRooms,
      }))
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: string[] = []

    if (!formData.cityId) {
      errors.push('Please select a city from the suggestions')
    }
    if (!formData.checkIn) {
      errors.push('Please choose a check-in date')
    }
    if (!formData.checkOut) {
      errors.push('Please choose a check-out date')
    }
    if (formData.checkIn && formData.checkOut && formData.checkOut <= formData.checkIn) {
      errors.push('Check-out date must be after check-in date')
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors([])

    try {
      setSearching(true)
      
      // Track search event
      trackSearch.performed('hotel', {
        city_id: formData.cityId,
        city_name: formData.cityName,
        country_name: formData.countryName,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        currency: formData.currency,
        nationality: formData.nationality,
        rooms: formData.rooms.map(room => ({
          adults: room.adults,
          children: room.children
        }))
      })
      
      // Clear previous search data
      clearAll()
      
      const searchParams = {
        cityId: formData.cityId,
        cityName: formData.cityName,
        countryName: formData.countryName,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        currency: formData.currency,
        nationality: formData.nationality,
        rooms: formData.rooms,
      }

      const response = await hotelApi.searchHotels(searchParams)
      
      if (response.success) {
        // Store search parameters and results
        setSearchParams(searchParams)
        setSearchResults(response.data.searchResults)
        setTraceId(response.data.traceId)
        router.push('/hotels/results')
      } else {
        setFormErrors(['Hotel search failed. Please try again.'])
      }
    } catch (error) {
      console.error('Search error:', error)
      setFormErrors(['Search failed. Please try again.'])
    } finally {
      setSearching(false)
    }
  }

  const selectedCountry = countries.find(c => c.iso2 === formData.country)
  const selectedCity = cities.find(c => c.tbo_city_code === formData.city)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section with Background */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">
              Find Your Perfect Hotel
          </h1>
            <p className="text-xl opacity-90">
              Book Domestic and International Hotels Online
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">

        {/* Search Form */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            {/* Booking Type Selection */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="upto4rooms"
                  name="bookingType"
                  value="upto4rooms"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="upto4rooms" className="text-sm font-medium text-gray-700">
                  Upto 4 Rooms
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="groupdeals"
                  name="bookingType"
                  value="groupdeals"
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="groupdeals" className="text-sm font-medium text-gray-700">
                  Group Deals
                </label>
                <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                  NEW
                </span>
              </div>
              <div className="ml-auto text-sm text-gray-600">
                <span>To list your property </span>
                <a href="#" className="text-blue-600 hover:underline">Click Here</a>
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Main Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Location */}
                <div className="lg:col-span-2">
                  <HotelCitySelector
                    label="City, Property Name Or Location"
                    value={formData.cityName}
                    onChange={(cityName) => {
                      handleInputChange('cityName', cityName)

                      const normalized = cityName.trim().toLowerCase()
                      const apiCity = cities.find(city => city.name.toLowerCase() === normalized)

                      if (apiCity) {
                        handleInputChange('city', apiCity.tbo_city_code)
                        handleInputChange('cityId', apiCity.tbo_city_code)
                      } else {
                        handleInputChange('city', '')
                        handleInputChange('cityId', '')
                      }

                      if (apiCity) {
                        const inferredCountry = countries.find(country => country.iso2 === formData.country)
                        if (inferredCountry) {
                          handleInputChange('country', inferredCountry.iso2)
                          handleInputChange('countryName', inferredCountry.name)
                        }
                      }
                    }}
                    placeholder="Search cities or hotels..."
                    className="w-full"
                  />
                </div>

                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>

                {/* Rooms & Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Rooms & Guests
                  </label>
                  <div className="relative" ref={guestPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setIsGuestPopoverOpen(!isGuestPopoverOpen)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-left flex items-center justify-between"
                    >
                      <span className="text-gray-700">
                        {formData.rooms.length} Room{formData.rooms.length > 1 ? 's' : ''} {formData.rooms.reduce((sum, room) => sum + room.adults, 0)} Adults
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Rooms & Guests Popover */}
                    {isGuestPopoverOpen && (
                      <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50">
                        <div className="space-y-4">
                          {/* Room Counter */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Room</span>
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => formData.rooms.length > 1 && removeRoom(formData.rooms.length - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={formData.rooms.length <= 1}
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-lg font-medium text-gray-900 w-8 text-center">{formData.rooms.length}</span>
                              <button
                                type="button"
                                onClick={addRoom}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={formData.rooms.length >= 4}
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Adults Counter */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Adults</span>
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => handleRoomChange(0, 'adults', Math.max(1, formData.rooms[0].adults - 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={formData.rooms[0].adults <= 1}
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-lg font-medium text-gray-900 w-8 text-center">{formData.rooms[0].adults}</span>
                              <button
                                type="button"
                                onClick={() => handleRoomChange(0, 'adults', Math.min(6, formData.rooms[0].adults + 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={formData.rooms[0].adults >= 6}
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Children Counter */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Children</span>
                              <p className="text-xs text-gray-500">0 - 17 Years Old</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => handleRoomChange(0, 'children', Math.max(0, formData.rooms[0].children - 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={formData.rooms[0].children <= 0}
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-lg font-medium text-gray-900 w-8 text-center">{formData.rooms[0].children}</span>
                              <button
                                type="button"
                                onClick={() => handleRoomChange(0, 'children', Math.min(4, formData.rooms[0].children + 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={formData.rooms[0].children >= 4}
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500">
                            Please provide right number of children along with their right age for best options and prices.
                          </p>

                          {/* Apply Button */}
                          <button
                            type="button"
                            onClick={() => setIsGuestPopoverOpen(false)}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                          >
                            APPLY
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={searching || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Searching Hotels...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6 mr-3" />
                      SEARCH
                    </>
                  )}
                </button>
                {formErrors.length > 0 && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please fix the following issues:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Hotel Autosuggest Demo */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Hotel Autosuggestion Demo
              </h2>
              <p className="text-lg text-gray-600">
                Try searching for cities or hotels to see the autosuggestion in action
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <HotelAutosuggest 
                onPick={(item) => {
                  const cityCode = item.type === 'city' ? item.code : item.cityCode
                  setFormData(prev => ({
                    ...prev,
                    cityName: item.label,
                    city: cityCode || prev.city,
                    cityId: cityCode || prev.cityId,
                    country: item.country || prev.country,
                    countryName: item.countryName || prev.countryName,
                  }))
                  setFormErrors([])
                }}
                placeholder="Search for cities or hotels..."
                className="mb-6"
              />
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  💡 This component fetches live data from TBO API and provides instant suggestions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Dubai', country: 'AE', city: 'DXB', flag: '🇦🇪' },
              { name: 'Mumbai', country: 'IN', city: 'BOM', flag: '🇮🇳' },
              { name: 'Bangkok', country: 'TH', city: 'BKK', flag: '🇹🇭' },
              { name: 'Singapore', country: 'SG', city: 'SIN', flag: '🇸🇬' },
            ].map((destination) => (
              <button
                key={destination.city}
                onClick={() => {
                  handleInputChange('country', destination.country)
                  setTimeout(() => {
                    handleInputChange('city', destination.city)
                    const city = cities.find(c => c.tbo_city_code === destination.city)
                    if (city) {
                      handleInputChange('cityId', city.tbo_city_code)
                      handleInputChange('cityName', city.name)
                    }
                    const country = countries.find(c => c.iso2 === destination.country)
                    if (country) {
                      handleInputChange('countryName', country.name)
                    }
                  }, 100)
                }}
                className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 hover:border-blue-200 transform hover:scale-105"
              >
                <div className="text-3xl mb-3">{destination.flag}</div>
                <div className="text-xl font-bold text-gray-900">{destination.name}</div>
                <div className="text-sm text-gray-600 mt-1">Popular destination</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
