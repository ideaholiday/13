'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Utensils,
  Filter,
  SlidersHorizontal
} from 'lucide-react'
import type { Hotel, HotelSearchParams } from '@/types'

// Mock hotel search API
const searchHotels = async (params: URLSearchParams): Promise<Hotel[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock hotel results
  const mockHotels: Hotel[] = [
    {
      id: 'H001',
      name: 'The Grand Palace Hotel',
      description: 'Luxury hotel in the heart of the city with world-class amenities and service.',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      address: 'Central Business District, Mumbai',
      city: 'Mumbai',
      country: 'India',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      starRating: 5,
      guestRating: 4.5,
      reviewCount: 1250,
      amenities: ['wifi', 'pool', 'gym', 'spa', 'restaurant', 'parking', 'room-service'],
      propertyType: 'Hotel',
      rooms: [{
        id: 'R001',
        name: 'Deluxe Room',
        type: 'double',
        description: 'Spacious room with city views and modern amenities',
        images: ['/api/placeholder/300/200'],
        maxOccupancy: 2,
        bedType: 'King Bed',
        size: 350,
        amenities: ['wifi', 'tv', 'minibar', 'ac'],
        mealPlan: 'breakfast',
        pricing: {
          basePrice: 8500,
          taxes: 1530,
          fees: 200,
          total: 10230,
          currency: 'INR',
          perNight: true,
          discountPercent: 15,
          originalPrice: 10000
        },
        available: true,
        freeCancellation: true,
        cancellationDeadline: new Date('2024-12-20')
      }],
      policies: {
        checkInTime: '3:00 PM',
        checkOutTime: '11:00 AM',
        childPolicy: 'Children under 12 stay free',
        petPolicy: 'Pets not allowed',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        paymentPolicy: 'Payment required at booking'
      },
      nearbyAttractions: ['Gateway of India', 'Marine Drive', 'Colaba Causeway']
    },
    {
      id: 'H002',
      name: 'Comfort Inn & Suites',
      description: 'Modern business hotel with excellent connectivity and comfort.',
      images: ['/api/placeholder/400/300'],
      address: 'Andheri East, Mumbai',
      city: 'Mumbai',
      country: 'India',
      coordinates: { lat: 19.1136, lng: 72.8697 },
      starRating: 4,
      guestRating: 4.2,
      reviewCount: 890,
      amenities: ['wifi', 'gym', 'restaurant', 'parking', 'business-center'],
      propertyType: 'Hotel',
      rooms: [{
        id: 'R002',
        name: 'Superior Room',
        type: 'double',
        description: 'Comfortable room with modern amenities',
        images: ['/api/placeholder/300/200'],
        maxOccupancy: 2,
        bedType: 'Queen Bed',
        size: 280,
        amenities: ['wifi', 'tv', 'ac'],
        mealPlan: 'room_only',
        pricing: {
          basePrice: 4500,
          taxes: 810,
          fees: 100,
          total: 5410,
          currency: 'INR',
          perNight: true
        },
        available: true,
        freeCancellation: true
      }],
      policies: {
        checkInTime: '2:00 PM',
        checkOutTime: '12:00 PM',
        childPolicy: 'Children under 8 stay free',
        petPolicy: 'Pets not allowed',
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
        paymentPolicy: 'Payment required at booking'
      }
    },
    {
      id: 'H003',
      name: 'Budget Stay Hotel',
      description: 'Clean and affordable accommodation for budget travelers.',
      images: ['/api/placeholder/400/300'],
      address: 'Kurla West, Mumbai',
      city: 'Mumbai',
      country: 'India',
      coordinates: { lat: 19.0728, lng: 72.8826 },
      starRating: 3,
      guestRating: 3.8,
      reviewCount: 456,
      amenities: ['wifi', 'ac', 'tv'],
      propertyType: 'Hotel',
      rooms: [{
        id: 'R003',
        name: 'Standard Room',
        type: 'double',
        description: 'Basic room with essential amenities',
        images: ['/api/placeholder/300/200'],
        maxOccupancy: 2,
        bedType: 'Double Bed',
        size: 200,
        amenities: ['wifi', 'tv', 'ac'],
        mealPlan: 'room_only',
        pricing: {
          basePrice: 2200,
          taxes: 396,
          fees: 50,
          total: 2646,
          currency: 'INR',
          perNight: true
        },
        available: true,
        freeCancellation: false
      }],
      policies: {
        checkInTime: '1:00 PM',
        checkOutTime: '11:00 AM',
        childPolicy: 'Children under 6 stay free',
        petPolicy: 'Pets not allowed',
        cancellationPolicy: 'Non-refundable',
        paymentPolicy: 'Payment required at booking'
      }
    }
  ]
  
  return mockHotels
}

export function HotelSearchResults() {
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price')
  const [showFilters, setShowFilters] = useState(false)
  
  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ['hotels', searchParams?.toString()],
    queryFn: () => searchHotels(searchParams || new URLSearchParams()),
    enabled: !!searchParams
  })

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      wifi: Wifi,
      parking: Car,
      restaurant: Utensils,
      gym: Dumbbell,
      pool: '🏊',
      spa: '💆',
      coffee: Coffee
    }
    return icons[amenity] || Building
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const formatNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '1 night'
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return `${nights} night${nights !== 1 ? 's' : ''}`
  }

  const sortedHotels = hotels?.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.rooms[0]?.pricing.total || 0) - (b.rooms[0]?.pricing.total || 0)
      case 'rating':
        return b.guestRating - a.guestRating
      case 'distance':
        // Mock distance sorting - in real app would use user location
        return 0
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-emerald-900 mb-2">Searching Hotels...</h2>
            <p className="text-slate-600">Finding the best accommodations for your stay</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Search Error</h2>
        <p className="text-slate-600">Unable to fetch hotel results. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900 mb-2">
                Hotels in {searchParams?.get('location') || 'Your Destination'}
              </h1>
              <p className="text-slate-600">
                {searchParams?.get('checkIn')} - {searchParams?.get('checkOut')} • 
                {formatNights(searchParams?.get('checkIn') || '', searchParams?.get('checkOut') || '')} • 
                {searchParams?.get('rooms') || '1'} Room
              </p>
            </div>
            <Button variant="outline" size="sm">
              Modify Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="price">Price (Low to High)</option>
              <option value="rating">Guest Rating</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          {hotels?.length || 0} hotels found
        </p>
      </div>

      {/* Hotel Results */}
      <div className="space-y-4">
        {sortedHotels?.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Hotel Image */}
                <div className="lg:col-span-3">
                  <div className="aspect-[4/3] bg-gradient-to-br from-emerald-200 to-sapphire-200 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-emerald-900">
                        {hotel.starRating}★ Hotel
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="lg:col-span-6 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-1">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < hotel.starRating
                              ? 'text-gold-500 fill-current'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-emerald-900">
                      {hotel.guestRating}/5
                    </span>
                    <span className="text-sm text-slate-500">
                      ({hotel.reviewCount} reviews)
                    </span>
                  </div>

                  <p className="text-slate-700 text-sm line-clamp-2">{hotel.description}</p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 6).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity === 'wifi' && <Wifi className="w-3 h-3 mr-1" />}
                        {amenity === 'parking' && <Car className="w-3 h-3 mr-1" />}
                        {amenity === 'restaurant' && <Utensils className="w-3 h-3 mr-1" />}
                        {amenity === 'gym' && <Dumbbell className="w-3 h-3 mr-1" />}
                        {amenity.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pricing and Book */}
                <div className="lg:col-span-3 flex flex-col justify-between">
                  <div className="text-right">
                    {hotel.rooms[0]?.pricing.originalPrice && (
                      <p className="text-sm text-slate-500 line-through">
                        {formatPrice(hotel.rooms[0].pricing.originalPrice)}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatPrice(hotel.rooms[0]?.pricing.total || 0)}
                    </p>
                    <p className="text-sm text-slate-600">per night</p>
                    {hotel.rooms[0]?.pricing.discountPercent && (
                      <Badge variant="success" className="mt-1">
                        {hotel.rooms[0].pricing.discountPercent}% OFF
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        const bookingParams = new URLSearchParams({
                          hotelId: hotel.id,
                          hotelName: hotel.name,
                          roomId: hotel.rooms[0]?.id || '',
                          roomName: hotel.rooms[0]?.name || '',
                          basePrice: hotel.rooms[0]?.pricing.basePrice.toString() || '0',
                          taxes: hotel.rooms[0]?.pricing.taxes.toString() || '0',
                          fees: hotel.rooms[0]?.pricing.fees.toString() || '0',
                          total: hotel.rooms[0]?.pricing.total.toString() || '0',
                          checkIn: searchParams?.get('checkIn') || '',
                          checkOut: searchParams?.get('checkOut') || '',
                          rooms: searchParams?.get('rooms') || '1',
                          adults: searchParams?.get('adults') || '2',
                          children: searchParams?.get('children') || '0'
                        })
                        window.location.href = `/hotels/book?${bookingParams.toString()}`
                      }}
                    >
                      Book Now
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {hotel.rooms[0]?.freeCancellation && (
                      <p className="text-xs text-emerald-600 text-center">
                        ✓ Free Cancellation
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {hotels && hotels.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">No hotels found</h2>
          <p className="text-slate-500">Try adjusting your search criteria or dates</p>
        </div>
      )}
    </div>
  )
}