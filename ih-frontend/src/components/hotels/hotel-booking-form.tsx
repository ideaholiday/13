'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Star,
  Wifi,
  Car,
  Utensils,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { z } from 'zod'

// Validation schemas
const GuestSchema = z.object({
  title: z.enum(['Mr', 'Ms', 'Mrs', 'Dr', 'Master', 'Miss']),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  age: z.number().min(0).max(120),
  type: z.enum(['Adult', 'Child'])
})

const ContactDetailsSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please enter your state'),
  pincode: z.string().min(6, 'Please enter a valid pincode'),
  country: z.string().default('India')
})

type Guest = z.infer<typeof GuestSchema>
type ContactDetails = z.infer<typeof ContactDetailsSchema>

interface HotelBookingFormProps {
  hotelData?: any
}

export function HotelBookingForm({ hotelData: initialHotelData }: HotelBookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hotelData, setHotelData] = useState(initialHotelData)

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [guests, setGuests] = useState<Guest[]>([
    {
      title: 'Mr',
      firstName: '',
      lastName: '',
      age: 25,
      type: 'Adult'
    }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load hotel data from URL params if not provided
  useEffect(() => {
    if (!hotelData && searchParams) {
      const mockHotel = {
        id: searchParams.get('hotelId') || 'H001',
        name: searchParams.get('hotelName') || 'The Grand Palace Hotel',
        address: 'Central Business District, Mumbai',
        starRating: 5,
        guestRating: 4.5,
        reviewCount: 1250,
        images: ['/api/placeholder/400/300'],
        amenities: ['wifi', 'pool', 'gym', 'spa', 'restaurant', 'parking'],
        room: {
          id: searchParams.get('roomId') || 'R001',
          name: searchParams.get('roomName') || 'Deluxe Room',
          type: 'double',
          description: 'Spacious room with city views and modern amenities',
          maxOccupancy: 2,
          bedType: 'King Bed',
          size: 350,
          amenities: ['wifi', 'tv', 'minibar', 'ac'],
          mealPlan: 'breakfast',
          pricing: {
            basePrice: parseInt(searchParams.get('basePrice') || '8500'),
            taxes: parseInt(searchParams.get('taxes') || '1530'),
            fees: parseInt(searchParams.get('fees') || '200'),
            total: parseInt(searchParams.get('total') || '10230'),
            currency: 'INR',
            perNight: true,
            discountPercent: 15,
            originalPrice: 10000
          },
          freeCancellation: true
        },
        searchParams: {
          checkIn: searchParams.get('checkIn'),
          checkOut: searchParams.get('checkOut'),
          rooms: parseInt(searchParams.get('rooms') || '1'),
          adults: parseInt(searchParams.get('adults') || '2'),
          children: parseInt(searchParams.get('children') || '0')
        }
      }
      
      setHotelData(mockHotel)

      // Initialize guests based on search params
      const totalGuests = mockHotel.searchParams.adults + mockHotel.searchParams.children
      const initialGuests: Guest[] = []
      
      for (let i = 0; i < mockHotel.searchParams.adults; i++) {
        initialGuests.push({
          title: i === 0 ? 'Mr' : 'Ms',
          firstName: '',
          lastName: '',
          age: 25,
          type: 'Adult'
        })
      }
      
      for (let i = 0; i < mockHotel.searchParams.children; i++) {
        initialGuests.push({
          title: 'Master',
          firstName: '',
          lastName: '',
          age: 8,
          type: 'Child'
        })
      }
      
      setGuests(initialGuests)
    }
  }, [hotelData, searchParams])

  const validateContactDetails = () => {
    try {
      ContactDetailsSchema.parse(contactDetails)
      setErrors(prev => ({ ...prev, contact: '' }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const validateGuests = () => {
    try {
      guests.forEach((guest, index) => {
        GuestSchema.parse(guest)
      })
      setErrors(prev => ({ ...prev, guests: '' }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, guests: 'Please fill in all guest details correctly' }))
      }
      return false
    }
  }

  const updateGuest = (index: number, field: keyof Guest, value: any) => {
    setGuests(prev => 
      prev.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      )
    )
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (validateContactDetails()) {
        setCurrentStep(1)
      }
    } else if (currentStep === 1) {
      if (validateGuests()) {
        setCurrentStep(2)
      }
    }
  }

  const calculateTotalAmount = () => {
    if (!hotelData?.room?.pricing) return 0
    
    const checkIn = new Date(hotelData.searchParams.checkIn)
    const checkOut = new Date(hotelData.searchParams.checkOut)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    return hotelData.room.pricing.total * nights * hotelData.searchParams.rooms
  }

  const handleBooking = async () => {
    if (!validateGuests()) return

    setIsLoading(true)
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store booking details in localStorage for payment
      const bookingData = {
        type: 'hotel',
        hotelDetails: hotelData,
        guests,
        contactDetails,
        searchParams: hotelData.searchParams,
        bookingId: `IH-HTL-${Date.now()}`,
        amount: calculateTotalAmount(),
        status: 'pending_payment'
      }
      
      localStorage.setItem('pendingHotelBooking', JSON.stringify(bookingData))
      
      // Navigate to payment page
      router.push('/hotels/payment')
    } catch (error) {
      console.error('Hotel booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (amount: number) => `₹${amount.toLocaleString()}`
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateNights = () => {
    if (!hotelData?.searchParams?.checkIn || !hotelData?.searchParams?.checkOut) return 1
    const checkIn = new Date(hotelData.searchParams.checkIn)
    const checkOut = new Date(hotelData.searchParams.checkOut)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (!hotelData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-sapphire-900 mb-2">Hotel Not Found</h2>
          <p className="text-slate-600 mb-4">Please select a hotel to proceed with booking.</p>
          <Button onClick={() => router.push('/hotels')}>
            Search Hotels
          </Button>
        </div>
      </div>
    )
  }

  const stepTitles = ['Contact Details', 'Guest Information', 'Review & Book']

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </Button>
          <h1 className="text-3xl font-bold text-sapphire-900 mb-2">Complete Your Booking</h1>
          <p className="text-slate-600">Please provide guest details to confirm your hotel reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  {stepTitles.map((title, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index <= currentStep
                            ? 'bg-sapphire-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          index <= currentStep ? 'text-sapphire-900' : 'text-slate-500'
                        }`}
                      >
                        {title}
                      </span>
                      {index < stepTitles.length - 1 && (
                        <div
                          className={`w-12 h-0.5 mx-4 ${
                            index < currentStep ? 'bg-sapphire-600' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sapphire-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          value={contactDetails.email}
                          onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="pl-10"
                          value={contactDetails.phone}
                          onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                        />
                      </div>
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={contactDetails.city}
                        onChange={(e) => setContactDetails({ ...contactDetails, city: e.target.value })}
                      />
                      {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={contactDetails.state}
                        onChange={(e) => setContactDetails({ ...contactDetails, state: e.target.value })}
                      />
                      {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        value={contactDetails.pincode}
                        onChange={(e) => setContactDetails({ ...contactDetails, pincode: e.target.value })}
                      />
                      {errors.pincode && <p className="text-sm text-red-600">{errors.pincode}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleNext}
                      className="bg-sapphire-600 hover:bg-sapphire-700"
                      size="lg"
                    >
                      Continue to Guest Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sapphire-900">Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {guests.map((guest, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sapphire-900">
                          Guest {index + 1} ({guest.type})
                        </h3>
                        <Badge variant={guest.type === 'Adult' ? 'default' : 'secondary'}>
                          {guest.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <select
                            value={guest.title}
                            onChange={(e) => updateGuest(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sapphire-400"
                          >
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Dr">Dr</option>
                            <option value="Master">Master</option>
                            <option value="Miss">Miss</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>First Name *</Label>
                          <Input
                            placeholder="First name"
                            value={guest.firstName}
                            onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Last Name *</Label>
                          <Input
                            placeholder="Last name"
                            value={guest.lastName}
                            onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Age *</Label>
                          <Input
                            type="number"
                            min="0"
                            max="120"
                            placeholder="Age"
                            value={guest.age}
                            onChange={(e) => updateGuest(index, 'age', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {errors.guests && (
                    <p className="text-sm text-red-600">{errors.guests}</p>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep(0)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Contact Details
                    </Button>
                    <Button 
                      onClick={handleNext}
                      className="bg-sapphire-600 hover:bg-sapphire-700"
                      size="lg"
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sapphire-900">Review Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Summary */}
                  <div>
                    <h3 className="font-semibold text-sapphire-900 mb-2">Contact Details</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm">{contactDetails.email}</p>
                      <p className="text-sm">{contactDetails.phone}</p>
                      <p className="text-sm">{contactDetails.city}, {contactDetails.state} {contactDetails.pincode}</p>
                    </div>
                  </div>

                  {/* Guests Summary */}
                  <div>
                    <h3 className="font-semibold text-sapphire-900 mb-2">Guests</h3>
                    <div className="space-y-2">
                      {guests.map((guest, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {guest.title} {guest.firstName} {guest.lastName}
                            </p>
                            <p className="text-sm text-slate-600">
                              {guest.type} • Age: {guest.age}
                            </p>
                          </div>
                          <Badge variant="outline">{guest.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Guest Details
                    </Button>
                    <Button 
                      onClick={handleBooking}
                      disabled={isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      size="lg"
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Payment'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Hotel Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sapphire-900">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hotel Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-200 to-sapphire-200 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-sapphire-900">
                      {hotelData.starRating}★ Hotel
                    </Badge>
                  </div>
                </div>

                {/* Hotel Details */}
                <div>
                  <h3 className="font-bold text-sapphire-900 mb-1">{hotelData.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hotelData.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < hotelData.starRating
                              ? 'text-gold-500 fill-current'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{hotelData.guestRating}/5</span>
                    <span className="text-sm text-slate-500">({hotelData.reviewCount} reviews)</span>
                  </div>
                </div>

                <Separator />

                {/* Room Details */}
                <div>
                  <h4 className="font-semibold text-sapphire-900 mb-2">Room Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Room Type</span>
                      <span className="font-medium">{hotelData.room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bed Type</span>
                      <span className="font-medium">{hotelData.room.bedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Room Size</span>
                      <span className="font-medium">{hotelData.room.size} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meal Plan</span>
                      <span className="font-medium capitalize">{hotelData.room.mealPlan?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stay Details */}
                <div>
                  <h4 className="font-semibold text-sapphire-900 mb-2">Stay Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Check-in</span>
                      </div>
                      <span className="font-medium">{formatDate(hotelData.searchParams.checkIn)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Check-out</span>
                      </div>
                      <span className="font-medium">{formatDate(hotelData.searchParams.checkOut)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Guests</span>
                      </div>
                      <span className="font-medium">{hotelData.searchParams.adults + hotelData.searchParams.children}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-medium">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold text-sapphire-900 mb-2">Room Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {hotelData.room.amenities?.slice(0, 4).map((amenity: string) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity === 'wifi' && <Wifi className="w-3 h-3 mr-1" />}
                        {amenity === 'parking' && <Car className="w-3 h-3 mr-1" />}
                        {amenity === 'restaurant' && <Utensils className="w-3 h-3 mr-1" />}
                        {amenity.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Room Rate (per night)</span>
                    <span>{formatPrice(hotelData.room.pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nights</span>
                    <span>× {calculateNights()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rooms</span>
                    <span>× {hotelData.searchParams.rooms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>{formatPrice((hotelData.room.pricing.taxes + hotelData.room.pricing.fees) * calculateNights() * hotelData.searchParams.rooms)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-sapphire-900">{formatPrice(calculateTotalAmount())}</span>
                  </div>
                </div>

                {/* Cancellation Policy */}
                {hotelData.room.freeCancellation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Free Cancellation</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Cancel up to 24 hours before check-in for a full refund
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}