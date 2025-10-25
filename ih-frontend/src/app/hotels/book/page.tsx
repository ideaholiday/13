'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Users, Calendar, ArrowLeft, User, Mail, Phone, CreditCard, Check } from 'lucide-react'
import { useHotelSearchStore } from '@/lib/stores/hotel-search-store'
import { hotelApi } from '@/lib/api/hotels'
import { trackBooking } from '@/lib/track'

export default function HotelBookingPage() {
  const router = useRouter()
  const { 
    searchParams, 
    selectedHotel, 
    selectedRoom,
    traceId,
    guests,
    setGuests,
    contact,
    setContact,
    setBookingId
  } = useHotelSearchStore()
  
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!searchParams || !selectedHotel || !selectedRoom) {
      router.push('/hotels')
    }
  }, [searchParams, selectedHotel, selectedRoom, router])

  useEffect(() => {
    // Initialize guests based on search params
    if (searchParams && guests.length === 0) {
      const totalGuests = searchParams.rooms.reduce((total, room) => total + room.adults + room.children, 0)
      const newGuests = Array.from({ length: totalGuests }, (_, index) => ({
        title: 'Mr',
        firstName: '',
        lastName: '',
        paxType: index < searchParams.rooms.reduce((total, room) => total + room.adults, 0) ? 1 : 2, // 1=Adult, 2=Child
        age: undefined,
        passportNo: '',
        passportExpiry: '',
        nationality: 'IN',
      }))
      setGuests(newGuests)
    }
  }, [searchParams, guests.length, setGuests])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!searchParams || !selectedHotel || !selectedRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Data</h2>
          <p className="text-gray-600 mb-6">Please select a hotel and room first.</p>
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      // Validate guest details
      guests.forEach((guest, index) => {
        if (!guest.firstName.trim()) {
          newErrors[`guest_${index}_firstName`] = 'First name is required'
        }
        if (!guest.lastName.trim()) {
          newErrors[`guest_${index}_lastName`] = 'Last name is required'
        }
        if (guest.paxType === 2 && !guest.age) {
          newErrors[`guest_${index}_age`] = 'Age is required for children'
        }
      })
    }

    if (step === 2) {
      // Validate contact details
      if (!contact.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(contact.email)) {
        newErrors.email = 'Email is invalid'
      }
      if (!contact.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleGuestChange = (index: number, field: string, value: any) => {
    const newGuests = [...guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setGuests(newGuests)
  }

  const handleContactChange = (field: string, value: string) => {
    setContact({ ...contact, [field]: value })
  }

  const handleBooking = async () => {
    if (!validateStep(2)) return

    try {
      setLoading(true)
      
      // Track checkout started event
      const totalAmount = selectedRoom.RoomRate[0]?.OfferedFare || 0
      trackBooking.checkoutStarted('hotel', selectedHotel.HotelCode || 'unknown', totalAmount, guests.length)

      const bookingData = {
        sessionId: traceId || '',
        resultIndex: 1, // Mock result index
        hotelCode: selectedHotel.HotelCode,
        roomDetails: searchParams.rooms.map((room, roomIndex) => ({
          roomIndex: roomIndex + 1,
          ratePlanCode: selectedRoom.RoomTypeCode,
          guests: guests.slice(
            roomIndex === 0 ? 0 : searchParams.rooms.slice(0, roomIndex).reduce((total, r) => total + r.adults + r.children, 0),
            searchParams.rooms.slice(0, roomIndex + 1).reduce((total, r) => total + r.adults + r.children, 0)
          ).map(guest => ({
            title: guest.title,
            firstName: guest.firstName,
            lastName: guest.lastName,
            paxType: guest.paxType,
            age: guest.age,
            passportNo: guest.passportNo,
            passportExpiry: guest.passportExpiry,
            nationality: guest.nationality,
          }))
        })),
        contact: {
          email: contact.email,
          phone: contact.phone,
        },
      }

      // Step 1: Pre-book to verify price and policy
      const prebookResponse = await hotelApi.preBookHotel({
        sessionId: traceId || '',
        resultIndex: 0, // TODO: Get from selected room
        hotelCode: selectedHotel?.HotelCode || '',
        roomDetails: bookingData.roomDetails,
        contact: bookingData.contact,
      })

      if (!prebookResponse.success) {
        alert('Pre-booking verification failed. Please try again.')
        return
      }

      // Check if price or policy changed
      if (prebookResponse.data.Response.IsPriceChanged || prebookResponse.data.Response.IsPolicyChanged) {
        const confirmContinue = confirm(
          'Price or policy has changed. Do you want to continue with the updated booking?'
        )
        if (!confirmContinue) {
          return
        }
      }

      // Step 2: Final booking
      const response = await hotelApi.bookHotel(bookingData)

      if (response.success) {
        // Track payment success event
        const totalAmount = selectedRoom.RoomRate[0]?.OfferedFare || 0
        trackBooking.paymentSuccess('hotel', response.bookingId || 'unknown', totalAmount, 'hotel_api')
        
        setBookingId(response.bookingId || '')
        router.push('/hotels/confirmation')
      } else {
        alert('Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Booking failed. Please try again.')
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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/hotels/details')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hotel
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel & Room Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex-shrink-0">
                  <img src="/placeholder-hotel-1.jpg" alt={selectedHotel.HotelName} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">HOTEL</div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedHotel.HotelName}
                  </h1>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    {getStarRating(selectedHotel.StarRating)}
                    <span className="ml-2">{selectedHotel.StarRating}-Star Hotel</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{searchParams.cityName}, {searchParams.countryName}</div>
                </div>
              </div>
              <div className="border-t my-4"></div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-500">CHECK-IN</div>
                  <div className="font-semibold text-gray-800">{new Date(searchParams.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-gray-500">CHECK-OUT</div>
                  <div className="font-semibold text-gray-800">{new Date(searchParams.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-gray-500">GUESTS</div>
                  <div className="font-semibold text-gray-800">{searchParams.rooms.length} Room, {searchParams.rooms.reduce((t, r) => t + r.adults, 0)} Adults</div>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Traveller Details</h2>
              {guests.map((guest, index) => (
                <div key={index} className="mb-4 border-b pb-4">
                  <h3 className="font-medium text-gray-800 mb-2">Adult {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="First Name" value={guest.firstName} onChange={e => handleGuestChange(index, 'firstName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="text" placeholder="Last Name" value={guest.lastName} onChange={e => handleGuestChange(index, 'lastName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  {errors[`guest_${index}_firstName`] && <p className="text-red-500 text-sm mt-1">{errors[`guest_${index}_firstName`]}</p>}
                  {errors[`guest_${index}_lastName`] && <p className="text-red-500 text-sm mt-1">{errors[`guest_${index}_lastName`]}</p>}
                </div>
              ))}
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="email" placeholder="Email Address" value={contact.email} onChange={e => handleContactChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input type="tel" placeholder="Mobile Number" value={contact.phone} onChange={e => handleContactChange('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              <p className="text-xs text-gray-500 mt-2">Your booking confirmation will be sent to this email address and mobile number.</p>
            </div>

            {/* Special Requests & GST */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Requests</h2>
              <textarea placeholder="Any special requests? (e.g., late check-in, specific room preference)" className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"></textarea>
              
              <div className="mt-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>I have a GST number (optional)</span>
                </label>
              </div>
            </div>

          </div>

          {/* Booking Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h3>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{selectedRoom.RoomTypeName} x {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice * 0.18)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-red-600">{formatPrice(totalPrice * 1.18)}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 mt-6 transition-colors"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}