'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Plane,
  User,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { PaymentOptions } from './PaymentOptions'
import { TripSummaryLayout } from './TripSummaryLayout'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function EnhancedFlightPaymentPage() {
  const router = useRouter()
  const store = useFlightStore()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    // Load booking data from localStorage or store
    const savedBookingData = localStorage.getItem('pendingBooking')
    if (savedBookingData) {
      setBookingData(JSON.parse(savedBookingData))
    } else if (store.selectedOutbound) {
      // Create booking data from store
      const totalPassengers = store.adults + store.children + store.infants
      const outboundPrice = store.selectedOutbound?.fare.offeredFare || 0
      const returnPrice = store.selectedReturn?.fare.offeredFare || 0
      const basePrice = (outboundPrice + returnPrice) * totalPassengers
      const addOnsPrice = store.addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
      const insurancePrice = store.insuranceSelected ? 200 : 0
      const totalPrice = basePrice + addOnsPrice + insurancePrice

      setBookingData({
        bookingId: `BK${Date.now()}`,
        amount: totalPrice,
        passengers: store.passengers,
        contactDetails: {
          email: store.contactEmail,
          phone: store.contactPhone
        },
        flightDetails: {
          outbound: store.selectedOutbound,
          return: store.selectedReturn
        },
        searchParams: {
          origin: store.from?.city,
          destination: store.to?.city,
          departureDate: store.departDate,
          returnDate: store.returnDate
        }
      })
    } else {
      router.push('/flights/results')
    }
  }, [store, router])

  const handleRazorpayLoad = () => {
    setRazorpayLoaded(true)
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePaymentProceed = async (method: any, details?: any) => {
    if (!bookingData) return

    setPaymentLoading(true)

    try {
      if (method.id === 'razorpay' || method.id === 'card' || method.id === 'netbanking') {
        await initiateRazorpayPayment(method.id)
      } else {
        // Handle other payment methods
        await handleAlternativePayment(method.id, details)
      }
    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentLoading(false)
    }
  }

  const initiateRazorpayPayment = async (method: string) => {
    if (!razorpayLoaded) {
      console.error('Razorpay not loaded')
      setPaymentLoading(false)
      return
    }

    try {
      // Create order on backend (mock for now)
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingData.amount,
          currency: 'INR',
          bookingId: bookingData.bookingId,
          method: method
        })
      }).catch(() => {
        // Mock response for demo
        return {
          json: async () => ({
            id: `order_${Date.now()}`,
            amount: bookingData.amount * 100, // Razorpay expects amount in paise
            currency: 'INR'
          })
        }
      })

      const order = await orderResponse.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount: order.amount,
        currency: order.currency,
        name: 'Idea Holiday',
        description: `Flight Booking - ${bookingData.bookingId}`,
        order_id: order.id,
        method: method,
        handler: function (response: any) {
          handlePaymentSuccess(response, method)
        },
        prefill: {
          name: `${bookingData.passengers[0]?.firstName || 'John'} ${bookingData.passengers[0]?.lastName || 'Doe'}`,
          email: bookingData.contactDetails?.email || 'user@example.com',
          contact: bookingData.contactDetails?.phone || '9876543210'
        },
        notes: {
          bookingId: bookingData.bookingId,
          paymentMethod: method
        },
        theme: {
          color: '#1e40af'
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

  const handleAlternativePayment = async (method: string, details?: any) => {
    // Simulate payment processing for UPI, EMI, Wallet
    setTimeout(() => {
      const mockPaymentResponse = {
        payment_id: `pay_${Date.now()}`,
        order_id: `order_${Date.now()}`,
        method: method,
        details: details
      }
      
      handlePaymentSuccess(mockPaymentResponse, method)
    }, 2000)
  }

  const handlePaymentSuccess = async (paymentResponse: any, method: string) => {
    try {
      // Verify payment on backend (mock for now)
      const verificationResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentResponse.payment_id || paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.order_id || paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          bookingId: bookingData.bookingId,
          method: method
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
            id: paymentResponse.payment_id || paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.order_id || paymentResponse.razorpay_order_id,
            amount: bookingData.amount,
            currency: 'INR',
            method: method,
            timestamp: new Date().toISOString()
          }
        }

        // Store confirmed booking
        localStorage.setItem('confirmedBooking', JSON.stringify(updatedBookingData))
        localStorage.removeItem('pendingBooking')

        // Redirect to success page
        router.push(`/flights/booking-success?bookingId=${bookingData.bookingId}`)
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

  const handleEditTrip = () => {
    router.push('/flights/search')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Booking Data Found</h2>
            <p className="text-gray-600 mb-4">Please start a new flight search and booking.</p>
            <Button onClick={() => router.push('/flights')}>
              Search Flights
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TripSummaryLayout onEditTrip={handleEditTrip}>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleRazorpayLoad}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Complete Your Payment</h1>
                <p className="text-sm text-gray-600">Secure payment processing for your flight booking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Options */}
            <div className="lg:col-span-2">
              <PaymentOptions
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
                onProceed={handlePaymentProceed}
                totalAmount={bookingData.amount}
              />
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-gray-900">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Flight Details */}
                  <div className="space-y-3">
                    {bookingData.flightDetails?.outbound && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Plane className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {bookingData.flightDetails.outbound.segments[0]?.airline.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {bookingData.flightDetails.outbound.segments[0]?.flightNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {bookingData.flightDetails?.return && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plane className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {bookingData.flightDetails.return.segments[0]?.airline.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {bookingData.flightDetails.return.segments[0]?.flightNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Route */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Route</span>
                      <span className="text-sm font-medium">
                        {bookingData.searchParams?.origin} → {bookingData.searchParams?.destination}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm font-medium">
                        {bookingData.searchParams?.departureDate 
                          ? new Date(bookingData.searchParams.departureDate).toLocaleDateString()
                          : 'Dec 15, 2024'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Passengers</span>
                      <span className="text-sm font-medium">{bookingData.passengers?.length || 1}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{bookingData.contactDetails?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{bookingData.contactDetails?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Fare</span>
                      <span>{formatPrice(bookingData.amount * 0.8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>{formatPrice(bookingData.amount * 0.2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-900">{formatPrice(bookingData.amount)}</span>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
                    <p className="font-mono text-sm font-bold text-blue-900">
                      {bookingData.bookingId}
                    </p>
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
            </div>
          </div>
        </div>
      </div>
    </TripSummaryLayout>
  )
}
