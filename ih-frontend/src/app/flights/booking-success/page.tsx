'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle,
  Plane,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Shield,
  ArrowRight,
  Star
} from 'lucide-react'

export default function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bookingId = searchParams?.get('bookingId')
    if (bookingId) {
      const savedBooking = localStorage.getItem('confirmedBooking')
      if (savedBooking) {
        setBookingData(JSON.parse(savedBooking))
      }
    }
    setLoading(false)
  }, [searchParams])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleDownloadTicket = () => {
    // Mock download functionality
    console.log('Downloading ticket for booking:', bookingData?.bookingId)
  }

  const handleEmailTicket = () => {
    // Mock email functionality
    console.log('Emailing ticket to:', bookingData?.contactDetails?.email)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/flights')}>
              Search Flights
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-4">Your flight has been successfully booked</p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Booking ID: {bookingData.bookingId}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outbound Flight */}
            {bookingData.flightDetails?.outbound && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-blue-600" />
                    Outbound Flight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookingData.flightDetails.outbound.segments.map((segment: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{segment.origin.code}</div>
                              <div className="text-sm text-gray-600">{formatTime(segment.departureTime)}</div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-sm text-gray-500">{Math.floor(segment.duration / 60)}h {segment.duration % 60}m</div>
                              <div className="text-xs text-gray-400">{segment.flightNumber}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{segment.destination.code}</div>
                              <div className="text-sm text-gray-600">{formatTime(segment.arrivalTime)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{segment.airline.name}</div>
                            <div className="text-sm text-gray-600">{segment.airline.code}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Return Flight */}
            {bookingData.flightDetails?.return && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-green-600" />
                    Return Flight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookingData.flightDetails.return.segments.map((segment: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{segment.origin.code}</div>
                              <div className="text-sm text-gray-600">{formatTime(segment.departureTime)}</div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-sm text-gray-500">{Math.floor(segment.duration / 60)}h {segment.duration % 60}m</div>
                              <div className="text-xs text-gray-400">{segment.flightNumber}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{segment.destination.code}</div>
                              <div className="text-sm text-gray-600">{formatTime(segment.arrivalTime)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{segment.airline.name}</div>
                            <div className="text-sm text-gray-600">{segment.airline.code}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleDownloadTicket} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Ticket
                  </Button>
                  <Button variant="outline" onClick={handleEmailTicket} className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-gray-900">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium capitalize">{bookingData.payment?.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-medium font-mono text-xs">{bookingData.payment?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-medium">{formatPrice(bookingData.payment?.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date</span>
                      <span className="font-medium">
                        {bookingData.payment?.timestamp ? 
                          new Date(bookingData.payment.timestamp).toLocaleDateString() : 
                          'Today'
                        }
                      </span>
                    </div>
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

                {/* Passengers */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Passengers</h4>
                  <div className="space-y-2">
                    {bookingData.passengers?.slice(0, 3).map((passenger: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </span>
                      </div>
                    ))}
                    {bookingData.passengers?.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{bookingData.passengers.length - 3} more passengers
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Important Information</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Check-in opens 24 hours before departure</li>
                        <li>• Arrive at airport 2 hours before domestic flights</li>
                        <li>• Carry valid ID proof for all passengers</li>
                        <li>• Check baggage allowance before packing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/flights')} 
                    className="w-full"
                  >
                    Book Another Flight
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/')} 
                    className="w-full"
                  >
                    Go to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}