'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle,
  Download,
  Mail,
  Phone,
  Plane,
  Calendar,
  Clock,
  User,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
  Loader2
} from 'lucide-react'
import { VoucherGenerator, type FlightVoucherData } from '@/lib/voucher-generator'
import toast from 'react-hot-toast'

export function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams?.get('bookingId')
  
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [emailingPDF, setEmailingPDF] = useState(false)

  useEffect(() => {
    // Load confirmed booking from localStorage
    const confirmedBooking = localStorage.getItem('confirmedBooking')
    
    if (confirmedBooking) {
      const booking = JSON.parse(confirmedBooking)
      if (booking.bookingId === bookingId) {
        setBookingData(booking)
      }
    }
    
    setLoading(false)
  }, [bookingId])

  // Convert booking data to voucher format
  const convertToVoucherData = (booking: any): FlightVoucherData => {
    const isMultiCity = booking.multiCityFlights && booking.multiCityFlights.length > 0
    const isRoundTrip = booking.returnFlightDetails && !isMultiCity
    
    let flights: Array<{
      airline: string
      flightNumber: string
      from: string
      to: string
      departure: string
      arrival: string
      date: string
      duration: string
      class: string
    }> = []
    
    if (isMultiCity) {
      flights = booking.multiCityFlights.map((flight: any, index: number) => ({
        airline: flight.airline?.name || 'Unknown Airline',
        flightNumber: flight.flightNumber || 'N/A',
        from: flight.legInfo?.from || flight.departure?.airport || 'N/A',
        to: flight.legInfo?.to || flight.arrival?.airport || 'N/A',
        departure: flight.departure?.time || 'N/A',
        arrival: flight.arrival?.time || 'N/A',
        date: flight.legInfo?.date || flight.departure?.date || 'N/A',
        duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
        class: flight.bookingClass || booking.class || 'Economy'
      }))
    } else {
      // Add outbound flight
      if (booking.flightDetails) {
        flights.push({
          airline: booking.flightDetails.airline?.name || 'Unknown Airline',
          flightNumber: booking.flightDetails.flightNumber || 'N/A',
          from: booking.flightDetails.departure?.airport || booking.origin || 'N/A',
          to: booking.flightDetails.arrival?.airport || booking.destination || 'N/A',
          departure: booking.flightDetails.departure?.time || 'N/A',
          arrival: booking.flightDetails.arrival?.time || 'N/A',
          date: booking.flightDetails.departure?.date || booking.departureDate || 'N/A',
          duration: booking.flightDetails.duration ? `${Math.floor(booking.flightDetails.duration / 60)}h ${booking.flightDetails.duration % 60}m` : 'N/A',
          class: booking.flightDetails.bookingClass || booking.class || 'Economy'
        })
      }
      
      // Add return flight if round trip
      if (isRoundTrip && booking.returnFlightDetails) {
        flights.push({
          airline: booking.returnFlightDetails.airline?.name || 'Unknown Airline',
          flightNumber: booking.returnFlightDetails.flightNumber || 'N/A',
          from: booking.returnFlightDetails.departure?.airport || booking.destination || 'N/A',
          to: booking.returnFlightDetails.arrival?.airport || booking.origin || 'N/A',
          departure: booking.returnFlightDetails.departure?.time || 'N/A',
          arrival: booking.returnFlightDetails.arrival?.time || 'N/A',
          date: booking.returnFlightDetails.departure?.date || booking.returnDate || 'N/A',
          duration: booking.returnFlightDetails.duration ? `${Math.floor(booking.returnFlightDetails.duration / 60)}h ${booking.returnFlightDetails.duration % 60}m` : 'N/A',
          class: booking.returnFlightDetails.bookingClass || booking.class || 'Economy'
        })
      }
    }

    return {
      bookingId: booking.bookingId || 'N/A',
      bookingDate: booking.bookingDate || new Date().toISOString(),
      passengerName: booking.contactDetails?.firstName ? 
        `${booking.contactDetails.firstName} ${booking.contactDetails.lastName}` : 
        booking.passengerName || 'N/A',
      email: booking.contactDetails?.email || booking.email || 'N/A',
      phone: booking.contactDetails?.phone || booking.phone || 'N/A',
      flights,
      totalAmount: booking.amount || booking.totalAmount || 0,
      currency: '₹',
      status: booking.status || 'confirmed',
      pnr: booking.pnr || undefined
    }
  }

  const handleDownloadTicket = async () => {
    if (!bookingData) return
    
    setDownloadingPDF(true)
    try {
      const voucherData = convertToVoucherData(bookingData)
      const pdfBlob = await VoucherGenerator.generateFlightVoucher(voucherData)
      VoucherGenerator.downloadPDF(pdfBlob, `flight-voucher-${bookingData.bookingId}.pdf`)
      toast.success('Flight voucher downloaded successfully!')
    } catch (error) {
      console.error('Error downloading voucher:', error)
      toast.error('Failed to download voucher. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleEmailTicket = async () => {
    if (!bookingData) return
    
    setEmailingPDF(true)
    try {
      const voucherData = convertToVoucherData(bookingData)
      const pdfBlob = await VoucherGenerator.generateFlightVoucher(voucherData)
      const result = await VoucherGenerator.emailPDF(
        pdfBlob, 
        voucherData.email, 
        bookingData.bookingId, 
        'flight'
      )
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error('Failed to email voucher. Please try again.')
      }
    } catch (error) {
      console.error('Error emailing voucher:', error)
      toast.error('Failed to email voucher. Please try again.')
    } finally {
      setEmailingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-sapphire-900 mb-2">Booking Not Found</h1>
          <p className="text-slate-600 mb-6">
            We couldn't find the booking details. Please check your booking reference.
          </p>
          <Button onClick={() => router.push('/flights')}>
            Search New Flight
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (amount: number) => `₹${amount.toLocaleString()}`
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-sapphire-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-slate-600 mb-4">
            Your flight has been successfully booked. Booking reference: 
            <span className="font-mono font-bold text-sapphire-900 ml-2">{bookingData.bookingId}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={handleDownloadTicket} variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button onClick={handleEmailTicket} variant="outline" className="w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              Email Ticket
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-sapphire-600" />
                  <span>Flight Details</span>
                  <Badge className="ml-auto bg-green-100 text-green-800">Confirmed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Airline Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-sapphire-100 rounded-lg flex items-center justify-center">
                    <Plane className="w-6 h-6 text-sapphire-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-sapphire-900">
                      {bookingData.flightDetails?.airline?.name || 'IndiGo'}
                    </h3>
                    <p className="text-slate-600">
                      {bookingData.flightDetails?.flightNumber || '6E-2156'} • {bookingData.flightDetails?.aircraft || 'Airbus A320'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Route and Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-sapphire-900">Departure</span>
                    </div>
                    <p className="text-2xl font-bold text-sapphire-900">
                      {bookingData.searchParams?.origin || 'DEL'}
                    </p>
                    <p className="text-slate-600">
                      {bookingData.flightDetails?.departure?.airport || 'Indira Gandhi International Airport'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDateTime(bookingData.searchParams?.departureDate || new Date().toISOString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{bookingData.flightDetails?.departure?.time || '14:30'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-sapphire-900">Arrival</span>
                    </div>
                    <p className="text-2xl font-bold text-sapphire-900">
                      {bookingData.searchParams?.destination || 'BOM'}
                    </p>
                    <p className="text-slate-600">
                      {bookingData.flightDetails?.arrival?.airport || 'Chhatrapati Shivaji International Airport'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDateTime(bookingData.searchParams?.departureDate || new Date().toISOString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{bookingData.flightDetails?.arrival?.time || '16:45'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Journey Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">{bookingData.flightDetails?.duration || '2h 15m'}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600">Class:</span>
                    <span className="font-medium">{bookingData.flightDetails?.class || 'Economy'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-sapphire-600" />
                  <span>Passenger Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingData.passengers?.map((passenger: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sapphire-900">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {passenger.type} • Date of Birth: {new Date(passenger.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Seat: {`${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-sapphire-600" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Payment ID</p>
                    <p className="font-mono text-sm font-medium">{bookingData.payment?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Method</p>
                    <p className="font-medium capitalize">{bookingData.payment?.method || 'Razorpay'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount Paid</p>
                    <p className="font-bold text-lg text-green-600">{formatPrice(bookingData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Date</p>
                    <p className="font-medium">
                      {new Date(bookingData.payment?.timestamp || new Date()).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sapphire-900">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Details */}
                <div>
                  <h4 className="font-medium text-sapphire-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{bookingData.contactDetails?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{bookingData.contactDetails?.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Important Information */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Important Information</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Please arrive at the airport 2 hours before domestic flights</li>
                    <li>• Carry a valid photo ID for check-in</li>
                    <li>• Check baggage allowance policy</li>
                    <li>• Web check-in opens 48 hours before departure</li>
                  </ul>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => router.push('/dashboard/bookings')}
                  >
                    <span>View All Bookings</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => router.push('/flights')}
                  >
                    <span>Book Another Flight</span>
                    <Plane className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => router.push('/')}
                  >
                    <span>Back to Home</span>
                    <Home className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-sapphire-900 mb-1">Confirmation Email</h3>
                <p className="text-sm text-slate-600">Check your email for detailed booking confirmation and e-ticket</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plane className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-sapphire-900 mb-1">Web Check-in</h3>
                <p className="text-sm text-slate-600">Complete web check-in 48 hours before your flight departure</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-sapphire-900 mb-1">Travel Day</h3>
                <p className="text-sm text-slate-600">Arrive early at the airport with valid ID and boarding pass</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}