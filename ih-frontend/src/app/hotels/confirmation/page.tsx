'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Download, Mail, Phone, Calendar, Users, MapPin, Star, ArrowLeft } from 'lucide-react'
import { useHotelSearchStore } from '@/lib/stores/hotel-search-store'
import { hotelApi } from '@/lib/api/hotels'

export default function HotelConfirmationPage() {
  const router = useRouter()
  const { 
    searchParams, 
    selectedHotel, 
    selectedRoom,
    guests,
    contact,
    bookingId
  } = useHotelSearchStore()
  
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!searchParams || !selectedHotel || !selectedRoom || !bookingId) {
      router.push('/hotels')
    }
  }, [searchParams, selectedHotel, selectedRoom, bookingId, router])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!searchParams || !selectedHotel || !selectedRoom || !bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Found</h2>
          <p className="text-gray-600 mb-6">Please complete a hotel booking first.</p>
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

  const handleDownloadVoucher = async () => {
    try {
      setLoading(true)
      const response = await hotelApi.generateVoucher(parseInt(bookingId))
      if (response.success) {
        // In a real implementation, you would download the PDF
        alert('Voucher generated successfully! Download will start shortly.')
      }
    } catch (error) {
      console.error('Voucher generation error:', error)
      alert('Failed to generate voucher. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleShareEmail = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would send the voucher via email
      alert('Voucher will be sent to your email shortly.')
    } catch (error) {
      console.error('Email sharing error:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setLoading(false)
    }
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

  const price = selectedRoom.RoomRate[0]?.OfferedFare || 0
  const nights = Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = price * nights

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center border-t-4 border-green-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for booking with Idea Holiday. Your hotel stay is confirmed.
          </p>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 inline-block">
            <div className="text-sm text-gray-800 font-medium">
              Booking Reference: <span className="font-bold text-blue-600">{bookingId}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">A confirmation email with your voucher has been sent to {contact.email}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Itinerary</h2>
              
              {/* Hotel & Room Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                  <img src="/placeholder-hotel-1.jpg" alt={selectedHotel.HotelName} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedHotel.HotelName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    {getStarRating(selectedHotel.StarRating)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center"><MapPin className="w-4 h-4 mr-2" />{searchParams.cityName}, {searchParams.countryName}</div>
                </div>
              </div>

              {/* Booking Dates & Guests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                <div>
                  <div className="text-sm text-gray-500">Check-in</div>
                  <div className="font-semibold text-gray-800">{new Date(searchParams.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div className="text-sm text-gray-500">From 2:00 PM</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Check-out</div>
                  <div className="font-semibold text-gray-800">{new Date(searchParams.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div className="text-sm text-gray-500">Until 12:00 PM</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Guests</div>
                  <div className="font-semibold text-gray-800">{guests.length} Guest{guests.length > 1 && 's'}</div>
                  <div className="text-sm text-gray-500">{searchParams.rooms.length} Room{searchParams.rooms.length > 1 && 's'}</div>
                </div>
              </div>
            </div>

            {/* Guest & Contact Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest & Contact Details</h2>
              <div className="text-sm">
                <div className="font-medium text-gray-800">{guests[0].firstName} {guests[0].lastName}</div>
                <div className="text-gray-600">{contact.email}</div>
                <div className="text-gray-600">{contact.phone}</div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice * 1.18)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Amount Paid</span>
                  <span className="font-medium">{formatPrice(totalPrice * 1.18)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadVoucher}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Voucher
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
