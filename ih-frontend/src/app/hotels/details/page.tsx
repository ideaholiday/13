'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Users, Calendar, Wifi, Car, Utensils, Dumbbell, Waves, Coffee, Shield, ArrowLeft, Check, X } from 'lucide-react'
import { useHotelSearchStore } from '@/lib/stores/hotel-search-store'
import { HotelSearchResult } from '@/lib/stores/hotel-search-store'

export default function HotelDetailsPage() {
  const router = useRouter()
  const { 
    searchParams, 
    selectedHotel, 
    selectedRoom,
    setSelectedRoom,
    traceId 
  } = useHotelSearchStore()
  
  const [isClient, setIsClient] = useState(false)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!searchParams || !selectedHotel) {
      router.push('/hotels')
    }
  }, [searchParams, selectedHotel, router])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!searchParams || !selectedHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Hotel Selected</h2>
          <p className="text-gray-600 mb-6">Please select a hotel first.</p>
          <button
            onClick={() => router.push('/hotels/results')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Results
          </button>
        </div>
      </div>
    )
  }

  const handleRoomSelect = (roomIndex: number) => {
    setSelectedRoomIndex(roomIndex)
    setSelectedRoom(selectedHotel.HotelRooms[roomIndex])
  }

  const handleBookNow = () => {
    router.push('/hotels/book')
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

  const selectedRoomData = selectedHotel.HotelRooms[selectedRoomIndex]
  const price = selectedRoomData?.RoomRate[0]?.OfferedFare || 0
  const originalPrice = selectedRoomData?.RoomRate[0]?.TotalFare || price
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs & Back Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            <span>Home</span> / <span>Hotels</span> / <span>{searchParams.cityName}</span> / <span className="font-medium text-gray-800">{selectedHotel.HotelName}</span>
          </div>
          <button
            onClick={() => router.push('/hotels/results')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </button>
        </div>

        {/* Hotel Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedHotel.HotelName}
              </h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{searchParams.cityName}, {searchParams.countryName} (1.2 km from center)</span>
              </div>
              <div className="flex items-center">
                {getStarRating(selectedHotel.StarRating)}
                <span className="ml-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">8.5 / 10</span>
                <span className="ml-2 text-sm text-gray-600">(124 ratings)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Starting from</div>
              <div className="text-3xl font-bold text-red-600">
                {formatPrice(price)}
              </div>
              <div className="text-sm text-gray-600">per night</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-3 gap-1">
                <div className="col-span-2 row-span-2 bg-gray-200">
                  <img src="/placeholder-hotel-1.jpg" alt="Main hotel view" className="w-full h-full object-cover" />
                </div>
                <div className="bg-gray-200"><img src="/placeholder-hotel-2.jpg" alt="Hotel room" className="w-full h-full object-cover" /></div>
                <div className="bg-gray-200"><img src="/placeholder-hotel-3.jpg" alt="Hotel amenity" className="w-full h-full object-cover" /></div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['wifi', 'parking', 'restaurant', 'gym', 'pool', 'breakfast', 'security', 'concierge'].map(amenity => {
                  const Icon = getAmenityIcon(amenity)
                  return (
                    <div key={amenity} className="flex items-center">
                      <Icon className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-700 capitalize">{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Room Selection */}
            <div id="rooms" className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Room</h2>
              <div className="space-y-4">
                {selectedHotel.HotelRooms.map((room, index) => {
                  const roomPrice = room.RoomRate[0]?.OfferedFare || 0
                  const isSelected = index === selectedRoomIndex

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1 mb-4 md:mb-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {room.RoomTypeName}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {room.MealType}
                          </div>
                          <ul className="text-sm text-green-600 mt-2 space-y-1">
                            <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> Free Cancellation</li>
                            <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> Pay at Hotel available</li>
                          </ul>
                        </div>
                        <div className="md:text-right">
                          <div className="text-xl font-bold text-red-600">{formatPrice(roomPrice)}</div>
                          <div className="text-sm text-gray-500">per night + taxes</div>
                          <button
                            onClick={() => handleRoomSelect(index)}
                            className={`w-full md:w-auto mt-2 px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${isSelected ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            disabled={isSelected}
                          >
                            {isSelected ? 'Selected' : 'Select Room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Booking Details</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium text-gray-900">{new Date(searchParams.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-gray-900">{new Date(searchParams.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium text-gray-900">{searchParams.rooms.length} Room, {searchParams.rooms.reduce((total, room) => total + room.adults, 0)} Adults</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="font-semibold text-gray-900">{selectedRoomData?.RoomTypeName}</div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">Base price</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">Taxes & fees</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(price * 0.18)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Payable Amount</span>
                  <span className="text-blue-600">{formatPrice(price * 1.18)}</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 mt-6 transition-colors"
              >
                Continue to Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
