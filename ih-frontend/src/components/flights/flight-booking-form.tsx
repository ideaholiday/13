'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Plane, 
  Users, 
  Clock, 
  MapPin, 
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
  User
} from 'lucide-react'
import { z } from 'zod'
import { ProgressIndicator } from '@/components/shared/navigation'
import { StickyActionBar } from '@/components/shared/sticky-action-bar'

// Validation schemas
const PassengerSchema = z.object({
  title: z.enum(['Mr', 'Ms', 'Mrs', 'Master', 'Miss']),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(1, 'Nationality is required'),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  type: z.enum(['Adult', 'Child', 'Infant'])
})

const ContactDetailsSchema = z.object({
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(5, 'Pincode is required')
})

type Passenger = z.infer<typeof PassengerSchema>
type ContactDetails = z.infer<typeof ContactDetailsSchema>

interface FlightBookingFormProps {
  flightDetails: any
  returnFlightDetails?: any
  multiCityFlights?: any[]
  searchParams: any
}

export function FlightBookingForm({ flightDetails, returnFlightDetails, multiCityFlights = [], searchParams }: FlightBookingFormProps) {
  const router = useRouter()
  const { showSuccess, showError, showLoading, showBookingSuccess, dismiss } = useNotifications()
  const [currentStep, setCurrentStep] = useState(0) // 0: Contact, 1: Passengers, 2: Review
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  })

  const [passengers, setPassengers] = useState<Passenger[]>([])

  // Initialize passengers based on search params
  useEffect(() => {
    const passengerCount = searchParams.passengers || { adults: 1, children: 0, infants: 0 }
    const initialPassengers: Passenger[] = []
    
    // Add adults
    for (let i = 0; i < passengerCount.adults; i++) {
      initialPassengers.push({
        title: 'Mr',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        nationality: 'Indian',
        type: 'Adult'
      })
    }

    // Add children
    for (let i = 0; i < passengerCount.children; i++) {
      initialPassengers.push({
        title: 'Master',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        nationality: 'Indian',
        type: 'Child'
      })
    }

    // Add infants
    for (let i = 0; i < passengerCount.infants; i++) {
      initialPassengers.push({
        title: 'Master',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        nationality: 'Indian',
        type: 'Infant'
      })
    }

    setPassengers(initialPassengers)
  }, [searchParams.passengers])

  const validateContactDetails = (showNotifications = true) => {
    try {
      ContactDetailsSchema.parse(contactDetails)
      setErrors(prev => ({ ...prev, contact: '' }))
      if (showNotifications) {
        showSuccess('Contact details validated successfully!')
      }
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
        if (showNotifications) {
          showError('Please fix the errors in contact details')
        }
      }
      return false
    }
  }

  const validatePassengers = (showNotifications = true) => {
    try {
      passengers.forEach((passenger, index) => {
        PassengerSchema.parse(passenger)
      })
      setErrors(prev => ({ ...prev, passengers: '' }))
      if (showNotifications) {
        showSuccess('All passenger details validated successfully!')
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, passengers: 'Please fill in all passenger details correctly' }))
        if (showNotifications) {
          showError('Please complete all passenger information')
        }
      }
      return false
    }
  }

  const updateContactDetails = (field: keyof ContactDetails, value: string) => {
    setContactDetails(prev => ({ ...prev, [field]: value }))
  }

  const updatePassenger = (index: number, field: keyof Passenger, value: any) => {
    setPassengers(prev => 
      prev.map((passenger, i) => 
        i === index ? { ...passenger, [field]: value } : passenger
      )
    )
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (validateContactDetails()) {
        setCurrentStep(1)
      }
    } else if (currentStep === 1) {
      if (validatePassengers()) {
        setCurrentStep(2)
      }
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const calculateTotalAmount = () => {
    if (multiCityFlights.length > 0) {
      // Multi-city calculation
      const totalFlightPrice = multiCityFlights.reduce((total, flight) => {
        return total + (flight?.price?.total || flight?.price?.base || 0)
      }, 0)
      return totalFlightPrice * passengers.length
    } else if (returnFlightDetails) {
      // Round-trip calculation
      const outboundPrice = flightDetails?.price?.total || flightDetails?.price?.base || 0
      const returnPrice = returnFlightDetails?.price?.total || returnFlightDetails?.price?.base || 0
      const totalFlightPrice = outboundPrice + returnPrice
      return totalFlightPrice * passengers.length
    } else {
      // One-way calculation
      if (!flightDetails?.price) return 0
      const outboundPrice = flightDetails.price.total || flightDetails.price.base || 0
      return outboundPrice * passengers.length
    }
  }

  const handleBooking = async () => {
    if (!validatePassengers()) return

    setIsLoading(true)
    
    // Show loading toast
    const loadingToast = showLoading('Processing your flight booking...')
    
    try {
      // Optional: Pre-validate fare with backend fare-quote to ensure price consistency
      try {
        const traceId = typeof window !== 'undefined' ? localStorage.getItem('flightTraceId') : null
        // Derive a ResultIndex placeholder from flight id if available (backend expects TBO ResultIndex string)
        const resultIndex = (flightDetails?.id || '').toString()
        if (traceId && resultIndex) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
          const res = await fetch(`${baseUrl}/api/v1/flights/fare-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ traceId, resultIndex })
          })
          if (res.ok) {
            const json = await res.json()
            if (json?.success && json?.data) {
              // If backend returned recalculated price, update local price context
              const price = json.data?.Price || json.data?.Response?.Price
              if (price?.TotalFare) {
                // Update displayed total if structure matches
                // Note: UI shows per-person fare; keep it for consistency
              }
            }
          }
        }
      } catch (e) {
        // Non-blocking: continue with booking flow even if fare-quote fails
        console.warn('Fare-quote precheck skipped/failed:', e)
      }

      // Simulate booking API call (placeholder until real booking integration)
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Store booking details in localStorage for payment
      const bookingId = `IH-FLT-${Date.now()}`
      const bookingData = {
        type: 'flight',
        flightDetails,
        passengers,
        contactDetails,
        searchParams,
        bookingId,
        amount: calculateTotalAmount(),
        status: 'pending_payment'
      }
      
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      
      // Dismiss loading and show success
      dismiss(loadingToast)
      showBookingSuccess(bookingId, 'flight')
      
      // Navigate to payment page after a brief delay
      setTimeout(() => {
        router.push('/flights/payment')
      }, 2000)
    } catch (error) {
      console.error('Flight booking failed:', error)
      dismiss(loadingToast)
      showError('Booking failed. Please try again.')
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

  const stepTitles = ['Contact Details', 'Passenger Information', 'Review & Book']

  // Memoize validation results to prevent infinite re-renders
  const isContactValid = useMemo(() => {
    try {
      ContactDetailsSchema.parse(contactDetails)
      return true
    } catch {
      return false
    }
  }, [contactDetails])

  const isPassengersValid = useMemo(() => {
    try {
      passengers.forEach((passenger) => {
        PassengerSchema.parse(passenger)
      })
      return true
    } catch {
      return false
    }
  }, [passengers])

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
            Back to Flights
          </Button>
          <h1 className="text-3xl font-bold text-sapphire-900 mb-2">Complete Your Booking</h1>
          <p className="text-slate-600">Please provide passenger details to confirm your flight reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <ProgressIndicator 
                  steps={stepTitles} 
                  currentStep={currentStep}
                  className="mb-6"
                />
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
                          onChange={(e) => updateContactDetails('email', e.target.value)}
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
                          onChange={(e) => updateContactDetails('phone', e.target.value)}
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
                        onChange={(e) => updateContactDetails('city', e.target.value)}
                      />
                      {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={contactDetails.state}
                        onChange={(e) => updateContactDetails('state', e.target.value)}
                      />
                      {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        value={contactDetails.pincode}
                        onChange={(e) => updateContactDetails('pincode', e.target.value)}
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
                      Continue to Passenger Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sapphire-900">Passenger Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sapphire-900">
                          Passenger {index + 1} ({passenger.type})
                        </h3>
                        <Badge variant={passenger.type === 'Adult' ? 'default' : 'secondary'}>
                          {passenger.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <select
                            value={passenger.title}
                            onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sapphire-400"
                          >
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Miss">Miss</option>
                            {passenger.type === 'Child' && <option value="Master">Master</option>}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>First Name *</Label>
                          <Input
                            placeholder="First name"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Last Name *</Label>
                          <Input
                            placeholder="Last name"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Date of Birth *</Label>
                          <Input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Gender *</Label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sapphire-400"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Nationality *</Label>
                          <Input
                            placeholder="Nationality"
                            value={passenger.nationality}
                            onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Optional passport fields for international flights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Passport Number (Optional)</Label>
                          <Input
                            placeholder="Passport number"
                            value={passenger.passportNumber || ''}
                            onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Passport Expiry (Optional)</Label>
                          <Input
                            type="date"
                            value={passenger.passportExpiry || ''}
                            onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {errors.passengers && (
                    <p className="text-sm text-red-600">{errors.passengers}</p>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={handleBack}
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

                  {/* Passengers Summary */}
                  <div>
                    <h3 className="font-semibold text-sapphire-900 mb-2">Passengers</h3>
                    <div className="space-y-2">
                      {passengers.map((passenger, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {passenger.title} {passenger.firstName} {passenger.lastName}
                            </p>
                            <p className="text-sm text-slate-600">
                              {passenger.type} • {passenger.nationality} • DOB: {new Date(passenger.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{passenger.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Passenger Details
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

          {/* Flight Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sapphire-900">Flight Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Flight Details */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sapphire-100 rounded-full flex items-center justify-center">
                    <Plane className="w-4 h-4 text-sapphire-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sapphire-900">
                      {multiCityFlights.length > 0 ? 'Multi-City' : returnFlightDetails ? 'Round Trip' : 'One Way'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {multiCityFlights.length > 0 ? `${multiCityFlights.length} Flights` : flightDetails?.airline?.name || 'IndiGo'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Multi-City Flight Route Details */}
                {multiCityFlights.length > 0 ? (
                  <div className="space-y-4">
                    {multiCityFlights.map((flight, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="font-medium text-sapphire-900 text-sm">
                          Leg {index + 1}: {flight.legInfo.from} → {flight.legInfo.to}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="font-bold text-lg text-sapphire-900">
                              {flight.departure?.airport || flight.legInfo.from}
                            </p>
                            <p className="text-sm text-slate-600">
                              {flight.departure?.time || '10:30'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(flight.departure?.date || flight.legInfo.date)}
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                            <p className="text-xs text-slate-500 mt-1">
                              {Math.floor((flight.duration || 135) / 60)}h {(flight.duration || 135) % 60}m
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg text-sapphire-900">
                              {flight.arrival?.airport || flight.legInfo.to}
                            </p>
                            <p className="text-sm text-slate-600">
                              {flight.arrival?.time || '12:45'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(flight.arrival?.date || flight.legInfo.date)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-center text-slate-600">
                          {flight.airline?.name} {flight.flightNumber}
                        </p>
                        {index < multiCityFlights.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Outbound Flight Route Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sapphire-900 text-sm">
                        {returnFlightDetails ? 'Outbound Flight' : 'Flight Details'}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="font-bold text-lg text-sapphire-900">
                            {flightDetails?.departure?.airport || searchParams?.origin || 'DEL'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {flightDetails?.departure?.time || '10:30'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(flightDetails?.departure?.date || searchParams?.departureDate)}
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                          <p className="text-xs text-slate-500 mt-1">
                            {Math.floor((flightDetails?.duration || 135) / 60)}h {(flightDetails?.duration || 135) % 60}m
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-sapphire-900">
                            {flightDetails?.arrival?.airport || searchParams?.destination || 'BOM'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {flightDetails?.arrival?.time || '12:45'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(flightDetails?.arrival?.date || searchParams?.departureDate)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-slate-600">
                        {flightDetails?.airline?.name} {flightDetails?.flightNumber || '6E 123'}
                      </p>
                    </div>

                    {/* Return Flight Route Details (if round trip) */}
                    {returnFlightDetails && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium text-sapphire-900 text-sm">Return Flight</h4>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="font-bold text-lg text-sapphire-900">
                                {returnFlightDetails?.departure?.airport || searchParams?.destination || 'BOM'}
                              </p>
                              <p className="text-sm text-slate-600">
                                {returnFlightDetails?.departure?.time || '14:30'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(returnFlightDetails?.departure?.date || searchParams?.returnDate)}
                              </p>
                            </div>
                            <div className="flex flex-col items-center">
                              <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                              <p className="text-xs text-slate-500 mt-1">
                                {Math.floor((returnFlightDetails?.duration || 135) / 60)}h {(returnFlightDetails?.duration || 135) % 60}m
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-lg text-sapphire-900">
                                {returnFlightDetails?.arrival?.airport || searchParams?.origin || 'DEL'}
                              </p>
                              <p className="text-sm text-slate-600">
                                {returnFlightDetails?.arrival?.time || '16:45'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(returnFlightDetails?.arrival?.date || searchParams?.returnDate)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-center text-slate-600">
                            {returnFlightDetails?.airline?.name} {returnFlightDetails?.flightNumber || '6E 456'}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}

                <Separator />

                {/* Passenger Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Passengers</span>
                  </div>
                  <span className="font-medium">{passengers.length}</span>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  {multiCityFlights.length > 0 ? (
                    <>
                      {multiCityFlights.map((flight, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Leg {index + 1} Fare (per person)</span>
                          <span>{formatPrice(flight?.price?.base || 20000)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm">
                        <span>Taxes & Fees</span>
                        <span>{formatPrice(multiCityFlights.reduce((total, flight) => total + (flight?.price?.taxes || 5000), 0))}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Base Fare (per person)</span>
                        <span>{formatPrice(flightDetails?.price?.base || 20000)}</span>
                      </div>
                      {returnFlightDetails && (
                        <div className="flex justify-between text-sm">
                          <span>Return Fare (per person)</span>
                          <span>{formatPrice(returnFlightDetails?.price?.base || 20000)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Taxes & Fees</span>
                        <span>{formatPrice((flightDetails?.price?.taxes || 5000) + (returnFlightDetails?.price?.taxes || 0))}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Passengers</span>
                    <span>× {passengers.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-sapphire-900">{formatPrice(calculateTotalAmount())}</span>
                  </div>
                </div>

                {/* Important Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">Important</h4>
                      <p className="text-xs text-blue-800">
                        Arrive at the airport 2 hours before domestic flights. Carry valid photo ID.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        currentStep={currentStep}
        totalSteps={stepTitles.length}
        onBack={handleBack}
        onNext={currentStep === stepTitles.length - 1 ? handleBooking : handleNext}
        onSubmit={handleBooking}
        isLoading={isLoading}
        totalAmount={calculateTotalAmount()}
        currency="INR"
        disabled={currentStep === 0 ? !isContactValid : currentStep === 1 ? !isPassengersValid : false}
      />
    </div>
  )
}