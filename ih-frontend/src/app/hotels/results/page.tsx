'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Users, Calendar, Wifi, Car, Utensils, Dumbbell, Waves, Coffee, Shield, ArrowLeft, Filter, Building2 } from 'lucide-react'
import { useHotelSearchStore } from '@/lib/stores/hotel-search-store'
import { HotelSearchResult } from '@/lib/stores/hotel-search-store'
import { trackBooking } from '@/lib/track'

export default function HotelResultsPage() {
  const router = useRouter()
  const { 
    searchParams, 
    searchResults, 
    selectedHotel, 
    setSelectedHotel,
    setSelectedRoom,
    traceId 
  } = useHotelSearchStore()
  
  const [isClient, setIsClient] = useState(false)
  const [sortBy, setSortBy] = useState('price')
  const [filters, setFilters] = useState({
    starRating: [] as number[],
    priceRange: [0, 50000] as [number, number],
    amenities: [] as string[],
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!searchParams) {
      router.push('/hotels')
    }
  }, [searchParams, router])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!searchParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Search Results</h2>
          <p className="text-gray-600 mb-6">Please search for hotels first.</p>
          <button
            onClick={() => router.push('/hotels')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Search Hotels
          </button>
        </div>
      </div>
    )
  }

  const hotels = searchResults?.Response?.HotelSearchResult || []
  
  // Show loading state if we have search params but no results yet
  if (searchParams && !searchResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Searching Hotels...</h2>
          <p className="text-gray-600">Please wait while we find the best hotels for you</p>
        </div>
      </div>
    )
  }
  
  const handleHotelSelect = (hotel: HotelSearchResult) => {
    // Track result viewed event
    const price = hotel.HotelRooms[0]?.RoomRate[0]?.OfferedFare || 0
    trackBooking.resultViewed('hotel', hotel.HotelCode || 'unknown', price, {
      hotel_name: hotel.HotelName,
      star_rating: hotel.StarRating,
      city: searchParams.cityName,
      country: searchParams.countryName,
      amenities: [],
      room_count: hotel.HotelRooms.length,
      trace_id: traceId
    })
    
    setSelectedHotel(hotel)
    if (hotel.HotelRooms.length > 0) {
      setSelectedRoom(hotel.HotelRooms[0])
    }
    router.push('/hotels/details')
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      wifi: Wifi,
      parking: Car,
      restaurant: Utensils,
      gym: Dumbbell,
      pool: Waves,
      breakfast: Coffee,
      security: Shield,
    }
    return iconMap[amenity.toLowerCase()] || Utensils
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const sortedHotels = [...hotels].sort((a, b) => {
    const priceA = a.HotelRooms[0]?.RoomRate[0]?.OfferedFare || 0
    const priceB = b.HotelRooms[0]?.RoomRate[0]?.OfferedFare || 0
    
    switch (sortBy) {
      case 'price':
        return priceA - priceB
      case 'rating':
        return b.StarRating - a.StarRating
      case 'name':
        return a.HotelName.localeCompare(b.HotelName)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search Summary */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/hotels')}
                className="flex items-center text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </button>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                  <span className="font-medium">{searchParams.cityName}, {searchParams.countryName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                  <span>{new Date(searchParams.checkIn).toLocaleDateString()} - {new Date(searchParams.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-blue-600" />
                  <span>{searchParams.rooms.reduce((total, room) => total + room.adults + room.children, 0)} guests, {searchParams.rooms.length} room{searchParams.rooms.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-80 bg-white rounded-xl shadow-sm p-6 h-fit border border-gray-200">
            {/* Search Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">{searchParams.cityName}, {searchParams.countryName}</div>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                EXPLORE ON MAP
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-6">
              <span className="font-semibold text-gray-900">{hotels.length}</span> Properties in {searchParams.cityName}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested For You</h3>
            
            {/* Quick Filters */}
            <div className="space-y-3 mb-6">
              {[
                { key: 'lastMinute', label: 'Last Minute Deals' },
                { key: 'freeCancellation', label: 'Free Cancellation' },
                { key: 'breakfastIncluded', label: 'Breakfast Included' },
                { key: 'coupleFriendly', label: 'Couple Friendly' }
              ].map(filter => (
                <label key={filter.key} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3 rounded"
                    checked={filters.amenities.includes(filter.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          amenities: [...prev.amenities, filter.key]
                        }))
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          amenities: prev.amenities.filter(a => a !== filter.key)
                        }))
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{filter.label}</span>
                </label>
              ))}
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Price per night</h4>
              <div className="space-y-2">
                {[
                  { label: '₹ 0 - ₹ 2000', range: [0, 2000] },
                  { label: '₹ 2000 - ₹ 5000', range: [2000, 5000] },
                  { label: '₹ 5000 - ₹ 10000', range: [5000, 10000] },
                  { label: '₹ 10000 - ₹ 15000', range: [10000, 15000] },
                  { label: '₹ 15000+', range: [15000, 50000] }
                ].map((priceRange, index) => (
                  <label key={index} className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" />
                    <span className="text-sm text-gray-700">{priceRange.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-2">Your Budget</div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <button className="w-full mt-2 bg-blue-600 text-white py-1 rounded text-sm font-medium">
                  Apply
                </button>
              </div>
            </div>

            {/* Star Category */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Star Category</h4>
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={filters.starRating.includes(rating)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          starRating: [...prev.starRating, rating]
                        }))
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          starRating: prev.starRating.filter(r => r !== rating)
                        }))
                      }
                    }}
                    className="mr-3 rounded"
                  />
                  <div className="flex items-center">
                    {getStarRating(rating)}
                    <span className="ml-1 text-sm text-gray-600">Star</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Property Type */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h4>
              {['Hotel', 'Resort', 'Homestay', 'Apartment', 'Villa'].map(type => (
                <label key={type} className="flex items-center mb-2">
                  <input type="checkbox" className="mr-3 rounded" />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
              {['AC', 'Wifi', 'Parking', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant'].map(amenity => (
                <label key={amenity} className="flex items-center mb-2">
                  <input type="checkbox" className="mr-3 rounded" />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>

            <button className="w-full text-blue-600 text-sm font-medium hover:underline">
              Clear All
            </button>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {hotels.length} Properties in {searchParams.cityName}
                  </h1>
                  <p className="text-gray-600">Showing results for your search</p>

                  {/* Mock Data Warning */}
                  {searchResults?.usingMockData && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-amber-600 mr-2">⚠️</div>
                        <div className="text-sm text-amber-800">
                          <strong>Limited Inventory:</strong> Showing sample hotels. Full inventory will be available soon.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Applied Filter Chips */}
                  {(filters.amenities.length > 0 || filters.starRating.length > 0 || (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000)) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {filters.amenities.map(amenity => (
                        <span key={amenity} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {amenity === 'lastMinute' ? 'Last Minute' : amenity === 'freeCancellation' ? 'Free Cancellation' : amenity === 'breakfastIncluded' ? 'Breakfast' : 'Couple Friendly'}
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {filters.starRating.map(rating => (
                        <span key={rating} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          {rating}★
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, starRating: prev.starRating.filter(r => r !== rating) }))}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 50000] }))}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="price">Price: Low to High</option>
                    <option value="rating">User Rating</option>
                    <option value="name">Name: A to Z</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-4">
              {sortedHotels.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
                  <button
                    onClick={() => router.push('/hotels')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Modify Search
                  </button>
                </div>
              ) : (
                sortedHotels.map((hotel) => {
                  const room = hotel.HotelRooms[0]
                  const price = room?.RoomRate[0]?.OfferedFare || 0
                  const originalPrice = room?.RoomRate[0]?.TotalFare || price
                  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

                  return (
                    <div
                      key={hotel.HotelCode}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
                    >
                      <div className="flex">
                        {/* Hotel Image */}
                        <div className="w-80 h-64 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center relative">
                          <div className="text-gray-500 text-center">
                            <Building2 className="w-16 h-16 mx-auto mb-2" />
                            <span className="text-sm font-medium">Hotel Image</span>
                          </div>
                          {/* Image Gallery Dots */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {[1, 2, 3, 4].map((dot) => (
                              <div key={dot} className={`w-2 h-2 rounded-full ${dot === 1 ? 'bg-white' : 'bg-white/50'}`}></div>
                            ))}
                          </div>
                        </div>

                        {/* Hotel Details */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {hotel.HotelName}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{searchParams.cityName}, {searchParams.countryName}</span>
                              </div>
                              <div className="flex items-center mb-3">
                                {getStarRating(hotel.StarRating)}
                                <span className="ml-2 text-sm text-gray-600">
                                  {hotel.StarRating} Star Hotel
                                </span>
                              </div>
                              
                              {/* Amenities */}
                              <div className="flex flex-wrap gap-3 mb-4">
                                {['Wifi', 'Parking', 'Restaurant', 'Pool'].map(amenity => (
                                  <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    <span>{amenity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-right ml-6">
                              {discount > 0 && (
                                <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mb-2 font-medium">
                                  {discount}% OFF
                                </div>
                              )}
                              <div className="text-2xl font-bold text-gray-900">
                                {formatPrice(price)}
                              </div>
                              <div className="text-sm text-gray-600">per night</div>
                              {originalPrice > price && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(originalPrice)}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">+ ₹{Math.round(price * 0.18)} taxes</div>
                            </div>
                          </div>

                          {/* Room Details */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Rooms & Rates:</h4>
                            {hotel.HotelRooms.slice(0, 2).map((room, roomIndex) => (
                              <div key={roomIndex} className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="mb-2">
                                  <div className="font-medium text-gray-900 text-sm">{room.RoomTypeName}</div>
                                  <div className="text-xs text-gray-600">{room.MealType}</div>
                                </div>

                                {/* Show all available rates for this room */}
                                <div className="space-y-2">
                                  {room.RoomRate.slice(0, 3).map((rate, rateIndex) => {
                                    const isRefundable = false
                                    const cancellationWindow = 'No info'
                                    const isPayAtHotel = false

                                    return (
                                      <div key={rateIndex} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                              {formatPrice(rate.OfferedFare)}
                                            </span>
                                            <span className="text-xs text-gray-600">per night</span>
                                            {isRefundable && (
                                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                Free Cancellation
                                              </span>
                                            )}
                                            {isPayAtHotel && (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                Pay at Hotel
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {cancellationWindow} • {rate.Currency}
                                          </div>
                                        </div>
                                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                          Select
                                        </button>
                                      </div>
                                    )
                                  })}
                                  {room.RoomRate.length > 3 && (
                                    <div className="text-xs text-blue-600 font-medium">
                                      +{room.RoomRate.length - 3} more rates available
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {hotel.HotelRooms.length > 2 && (
                              <div className="text-xs text-blue-600 font-medium">
                                +{hotel.HotelRooms.length - 2} more room types
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleHotelSelect(hotel)}
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Select Room
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Load More */}
            {sortedHotels.length > 0 && (
              <div className="text-center mt-8">
                <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Load More Hotels
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
