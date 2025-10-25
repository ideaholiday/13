'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plane,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react'
import Script from 'next/script'
import { useHotelSearchStore } from '@/lib/stores/hotel-search-store'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface UniversalPaymentPageProps {
  bookingData?: any
  bookingType?: 'flight' | 'hotel'
}

export function UniversalPaymentPage({ bookingData: initialBookingData, bookingType }: UniversalPaymentPageProps) {
  const router = useRouter()
  
  // Hotel-specific state from Zustand
  const hotelStore = useHotelSearchStore()

  const [bookingData, setBookingData] = useState(initialBookingData)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay')

  useEffect(() => {
    if (!bookingData) {
      if (bookingType === 'hotel' && hotelStore.selectedHotel && hotelStore.searchParams && hotelStore.selectedRoom) {
        const nights = Math.ceil((new Date(hotelStore.searchParams.checkOut).getTime() - new Date(hotelStore.searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
        const price = hotelStore.selectedRoom.RoomRate[0]?.OfferedFare || 0
        const totalPrice = price * nights * 1.18 // Including 18% tax

        const newBookingData = {
          type: 'hotel',
          amount: Math.round(totalPrice),
          bookingId: `IH-HOTEL-${Date.now()}`,
          hotelDetails: {
            id: hotelStore.selectedHotel.HotelCode,
            name: hotelStore.selectedHotel.HotelName,
            room: {
              name: hotelStore.selectedRoom.RoomTypeName,
              pricing: {
                basePrice: price * nights,
                taxes: price * nights * 0.18,
              }
            }
          },
          searchParams: hotelStore.searchParams,
          guests: hotelStore.guests,
          contactDetails: hotelStore.contact,
        }
        setBookingData(newBookingData)
      } else {
        const savedFlightBooking = localStorage.getItem('pendingBooking')
        if (savedFlightBooking) {
          setBookingData(JSON.parse(savedFlightBooking))
        } else {
          router.push('/')
        }
      }
    }
  }, [bookingData, router, bookingType, hotelStore])

  const getBookingType = () => {
    if (bookingType) return bookingType
    if (bookingData?.type === 'hotel') return 'hotel'
    if (bookingData?.hotelDetails) return 'hotel'
    return 'flight'
  }

  const isHotelBooking = getBookingType() === 'hotel'

  const handleRazorpayLoad = () => {
    setRazorpayLoaded(true)
  }

  const initiateRazorpayPayment = async () => {
    if (!razorpayLoaded || !bookingData) {
      console.error('Razorpay not loaded or no booking data')
      return
    }

    setPaymentLoading(true)

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/v1/hotels/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingData.amount,
          currency: 'INR',
          bookingId: bookingData.bookingId,
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const order = await orderResponse.json();

      if (!order.success) {
        throw new Error('Order creation was not successful');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo', // Demo key
        amount: order.amount,
        currency: order.currency,
        name: 'Idea Holiday',
        description: `${isHotelBooking ? 'Hotel' : 'Flight'} Booking - ${bookingData.bookingId}`,
        order_id: order.id,
        handler: function (response: any) {
          handlePaymentSuccess(response)
        },
        prefill: {
          name: isHotelBooking 
            ? `${bookingData.guests?.[0]?.firstName} ${bookingData.guests?.[0]?.lastName}`
            : `${bookingData.passengers?.[0]?.firstName} ${bookingData.passengers?.[0]?.lastName}`,
          email: bookingData.contactDetails?.email,
          contact: bookingData.contactDetails?.phone
        },
        notes: {
          bookingId: bookingData.bookingId,
          type: getBookingType(),
          ...(isHotelBooking ? 
            { hotelId: bookingData.hotelDetails?.id } : 
            { flightId: bookingData.flightDetails?.id }
          )
        },
        theme: {
          color: '#1e40af' // Sapphire color
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        handlePaymentFailure(response.error)
      })

      rzp.open()
    } catch (error) {
      console.error('Payment initiation failed:', error)
      setPaymentLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      // Verify payment on backend (mock for now)
      const verificationResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          bookingId: bookingData.bookingId,
          type: getBookingType()
        })
      }).catch(() => {
        // Mock success response
        return { json: async () => ({ success: true }) }
      })

      const verification = await verificationResponse.json()

      if (verification.success) {
        // Update booking status
        const updatedBookingData = {
          ...bookingData,
          status: 'confirmed',
          payment: {
            id: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            amount: bookingData.amount,
            currency: 'INR',
            method: 'razorpay',
            timestamp: new Date().toISOString()
          }
        }

        // Store confirmed booking
        if (isHotelBooking) {
          localStorage.setItem('confirmedHotelBooking', JSON.stringify(updatedBookingData))
          localStorage.removeItem('pendingHotelBooking')
          // Redirect to hotel booking success page
          router.push(`/hotels/booking-success?bookingId=${bookingData.bookingId}`)
        } else {
          localStorage.setItem('confirmedBooking', JSON.stringify(updatedBookingData))
          localStorage.removeItem('pendingBooking')
          // Redirect to flight booking success page
          router.push(`/flights/booking-success?bookingId=${bookingData.bookingId}`)
        }
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      setPaymentLoading(false)
    }
  }

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error)
    setPaymentLoading(false)
    // Show error message to user
  }

  const handleMockPayment = async () => {
    setPaymentLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      const mockPaymentResponse = {
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_order_id: `order_${Date.now()}`,
        razorpay_signature: 'mock_signature'
      }
      
      handlePaymentSuccess(mockPaymentResponse)
    }, 2000)
  }

  if (!bookingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-sapphire-900 mb-2">No Booking Data Found</h2>
          <p className="text-slate-600 mb-4">Please start a new booking.</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (amount: number) => `₹${amount.toLocaleString()}`

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleRazorpayLoad}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-sapphire-900 mb-2">Complete Your Payment</h1>
            <p className="text-slate-600">Secure payment processing for your {isHotelBooking ? 'hotel' : 'flight'} booking</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Razorpay Payment */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'razorpay' 
                        ? 'border-sapphire-500 bg-sapphire-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('razorpay')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          checked={selectedPaymentMethod === 'razorpay'}
                          onChange={() => setSelectedPaymentMethod('razorpay')}
                          className="w-4 h-4"
                        />
                        <div>
                          <h3 className="font-medium">Credit/Debit Card, UPI, Net Banking</h3>
                          <p className="text-sm text-slate-600">Secure payment via Razorpay</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <img src="/images/payments/visa.png" alt="Visa" className="h-6" />
                        <img src="/images/payments/mastercard.png" alt="Mastercard" className="h-6" />
                        <img src="/images/payments/upi.png" alt="UPI" className="h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Mock Payment for Demo */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'mock' 
                        ? 'border-sapphire-500 bg-sapphire-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('mock')}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        checked={selectedPaymentMethod === 'mock'}
                        onChange={() => setSelectedPaymentMethod('mock')}
                        className="w-4 h-4"
                      />
                      <div>
                        <h3 className="font-medium">Demo Payment</h3>
                        <p className="text-sm text-slate-600">For demonstration purposes only</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">Demo</Badge>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Secure Payment</h4>
                        <p className="text-sm text-green-700">
                          Your payment is protected by 256-bit SSL encryption and PCI DSS compliance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Action */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-sapphire-900">{formatPrice(bookingData.amount)}</span>
                    </div>
                    
                    <Button
                      onClick={selectedPaymentMethod === 'razorpay' ? initiateRazorpayPayment : handleMockPayment}
                      disabled={paymentLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
                      size="lg"
                    >
                      {paymentLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing Payment...</span>
                        </div>
                      ) : (
                        <>Pay {formatPrice(bookingData.amount)}</>
                      )}
                    </Button>

                    <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>This booking will expire in 15 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-sapphire-900">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service Icon & Details */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sapphire-100 rounded-full flex items-center justify-center">
                      {isHotelBooking ? (
                        <Building className="w-4 h-4 text-sapphire-600" />
                      ) : (
                        <Plane className="w-4 h-4 text-sapphire-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sapphire-900">
                        {isHotelBooking 
                          ? bookingData.hotelDetails?.name 
                          : bookingData.flightDetails?.airline?.name
                        }
                      </p>
                      <p className="text-sm text-slate-600">
                        {isHotelBooking 
                          ? `Room: ${bookingData.hotelDetails?.room?.name}`
                          : bookingData.flightDetails?.flightNumber
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  {isHotelBooking ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Hotel</span>
                        <span className="text-sm font-medium">{bookingData.hotelDetails?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Check-in</span>
                        <span className="text-sm font-medium">{formatDate(bookingData.searchParams?.checkIn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Check-out</span>
                        <span className="text-sm font-medium">{formatDate(bookingData.searchParams?.checkOut)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Guests</span>
                        <span className="text-sm font-medium">{bookingData.guests?.length || 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Route</span>
                        <span className="text-sm font-medium">
                          {bookingData.searchParams?.origin} → {bookingData.searchParams?.destination}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Date</span>
                        <span className="text-sm font-medium">{formatDate(bookingData.searchParams?.departureDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Passengers</span>
                        <span className="text-sm font-medium">{bookingData.passengers?.length || 1}</span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Contact Details */}
                  <div>
                    <h4 className="font-medium text-sapphire-900 mb-2">Contact Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600">{bookingData.contactDetails?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600">{bookingData.contactDetails?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Guests/Passengers */}
                  <div>
                    <h4 className="font-medium text-sapphire-900 mb-2">
                      {isHotelBooking ? 'Guests' : 'Passengers'}
                    </h4>
                    <div className="space-y-2">
                      {(isHotelBooking ? bookingData.guests : bookingData.passengers)?.slice(0, 3).map((person: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">
                            {person.title} {person.firstName} {person.lastName}
                          </span>
                        </div>
                      ))}
                      {(isHotelBooking ? bookingData.guests : bookingData.passengers)?.length > 3 && (
                        <p className="text-xs text-slate-500">
                          +{(isHotelBooking ? bookingData.guests : bookingData.passengers).length - 3} more
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{isHotelBooking ? 'Room Charges' : 'Base Fare'}</span>
                      <span>{formatPrice((isHotelBooking ? bookingData.hotelDetails?.room?.pricing?.basePrice : bookingData.flightDetails?.price?.base) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>{formatPrice((isHotelBooking ? bookingData.hotelDetails?.room?.pricing?.taxes : bookingData.flightDetails?.price?.taxes) || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-sapphire-900">{formatPrice(bookingData.amount)}</span>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Booking Reference</p>
                    <p className="font-mono text-sm font-bold text-sapphire-900">
                      {bookingData.bookingId}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}