'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VoucherGenerator } from '@/lib/voucher-generator'
import { toast } from 'react-hot-toast'
import { 
  CheckCircle,
  Download,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  User,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
  Star,
  Wifi,
  Car,
  Utensils
} from 'lucide-react'

export function HotelBookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams?.get('bookingId')
  
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [emailingPDF, setEmailingPDF] = useState(false)

  useEffect(() => {
    // Load confirmed hotel booking from localStorage
    const confirmedBooking = localStorage.getItem('confirmedHotelBooking')
    
    if (confirmedBooking) {
      const booking = JSON.parse(confirmedBooking)
      if (booking.bookingId === bookingId) {
        setBookingData(booking)
      }
    }
    
    setLoading(false)
  }, [bookingId])

  // Convert booking data to voucher format
  const convertToVoucherData = (booking: any) => {
    const checkIn = new Date(booking.searchParams?.checkIn || '')
    const checkOut = new Date(booking.searchParams?.checkOut || '')
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1
    
    return {
      bookingId: booking.bookingId,
      bookingDate: booking.payment?.timestamp ? new Date(booking.payment.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
      guestName: `${booking.guests?.[0]?.firstName || ''} ${booking.guests?.[0]?.lastName || ''}`.trim() || 'Guest',
      email: booking.contactDetails?.email || '',
      phone: booking.contactDetails?.phone || '',
      
      hotel: {
        name: booking.hotelDetails?.name || 'Hotel Name',
        address: booking.hotelDetails?.address || '',
        city: booking.hotelDetails?.location || booking.hotelDetails?.city || 'City',
        checkIn: booking.searchParams?.checkIn || '',
        checkOut: booking.searchParams?.checkOut || '',
        nights: nights,
        rooms: parseInt(booking.searchParams?.rooms) || 1,
        roomType: booking.hotelDetails?.room?.name || 'Deluxe Room',
        guests: parseInt(booking.searchParams?.guests) || 2
      },
      
      totalAmount: booking.amount || 0,
      currency: 'INR',
      status: 'Confirmed',
      confirmationNumber: booking.bookingId
    }
  }

  const handleDownloadVoucher = async () => {
    if (!bookingData) return
    
    setDownloadingPDF(true)
    try {
      const voucherData = convertToVoucherData(bookingData)
      const pdfBlob = await VoucherGenerator.generateHotelVoucher(voucherData)
      VoucherGenerator.downloadPDF(pdfBlob, `hotel-voucher-${bookingData.bookingId}.pdf`)
      toast.success('Hotel voucher downloaded successfully!')
    } catch (error) {
      console.error('Error downloading voucher:', error)
      toast.error('Failed to download voucher. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleEmailVoucher = async () => {
    if (!bookingData || !bookingData.contactDetails?.email) {
      toast.error('Email address not found in booking details.')
      return
    }
    
    setEmailingPDF(true)
    try {
      const voucherData = convertToVoucherData(bookingData)
      const pdfBlob = await VoucherGenerator.generateHotelVoucher(voucherData)
      
      // For now, we'll download the PDF and show a message about email
      // In production, this would integrate with an email service
      VoucherGenerator.downloadPDF(pdfBlob, `hotel-voucher-${bookingData.bookingId}.pdf`)
      toast.success(`Voucher prepared for email to ${bookingData.contactDetails.email}. Download started for your reference.`)
      
      // TODO: Integrate with email service
      // await VoucherGenerator.emailPDF(pdfBlob, bookingData.contactDetails.email, bookingData.bookingId, 'hotel')
    } catch (error) {
      console.error('Error preparing voucher for email:', error)
      toast.error('Failed to prepare voucher for email. Please try again.')
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
          <Button onClick={() => router.push('/hotels')}>
            Search Hotels
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (amount: number) => `₹${amount.toLocaleString()}`
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateNights = () => {
    if (!bookingData.searchParams?.checkIn || !bookingData.searchParams?.checkOut) return 1
    const checkIn = new Date(bookingData.searchParams.checkIn)
    const checkOut = new Date(bookingData.searchParams.checkOut)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-sapphire-900 mb-2">Hotel Booking Confirmed!</h1>
          <p className="text-lg text-slate-600 mb-4">
            Your hotel reservation has been successfully confirmed. Booking reference: 
            <span className="font-mono font-bold text-sapphire-900 ml-2">{bookingData.bookingId}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={handleDownloadVoucher} 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={downloadingPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadingPDF ? 'Generating...' : 'Download Voucher'}
            </Button>
            <Button 
              onClick={handleEmailVoucher} 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={emailingPDF}
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailingPDF ? 'Preparing...' : 'Email Voucher'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-sapphire-600" />
                  <span>Hotel Details</span>
                  <Badge className="ml-auto bg-green-100 text-green-800">Confirmed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hotel Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-200 to-sapphire-200 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-sapphire-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-sapphire-900">
                      {bookingData.hotelDetails?.name || 'Hotel Name'}
                    </h3>
                    <div className="flex items-center space-x-2 text-slate-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{bookingData.hotelDetails?.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (bookingData.hotelDetails?.starRating || 5)
                                ? 'text-gold-500 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-sapphire-900">
                        {bookingData.hotelDetails?.guestRating || 4.5}/5
                      </span>
                      <span className="text-sm text-slate-500">
                        ({bookingData.hotelDetails?.reviewCount || 1250} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Room Details */}
                <div>
                  <h4 className="font-semibold text-sapphire-900 mb-3">Room Information</h4>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Room Type</span>
                      <span className="font-medium">{bookingData.hotelDetails?.room?.name || 'Deluxe Room'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Bed Type</span>
                      <span className="font-medium">{bookingData.hotelDetails?.room?.bedType || 'King Bed'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Room Size</span>
                      <span className="font-medium">{bookingData.hotelDetails?.room?.size || 350} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Meal Plan</span>
                      <span className="font-medium capitalize">
                        {bookingData.hotelDetails?.room?.mealPlan?.replace('_', ' ') || 'Breakfast Included'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stay Details */}
                <div>
                  <h4 className="font-semibold text-sapphire-900 mb-3">Stay Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-sapphire-900">Check-in</span>
                      </div>
                      <p className="text-lg font-bold text-sapphire-900">
                        {formatDate(bookingData.searchParams?.checkIn)}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>From 3:00 PM onwards</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-sapphire-900">Check-out</span>
                      </div>
                      <p className="text-lg font-bold text-sapphire-900">
                        {formatDate(bookingData.searchParams?.checkOut)}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Until 11:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium text-blue-900">Total Duration</span>
                    <span className="font-bold text-blue-900">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-sapphire-600" />
                  <span>Guest Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingData.guests?.map((guest: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sapphire-900">
                          {guest.title} {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {guest.type} • Age: {guest.age}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Primary Guest
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

                {/* Room Amenities */}
                <div>
                  <h4 className="font-medium text-sapphire-900 mb-2">Room Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.hotelDetails?.room?.amenities?.slice(0, 4).map((amenity: string) => (
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

                {/* Important Information */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Important Information</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Check-in starts at 3:00 PM</li>
                    <li>• Check-out is by 11:00 AM</li>
                    <li>• Carry a valid photo ID for check-in</li>
                    <li>• Contact hotel for early check-in requests</li>
                    <li>• Cancellation policy as per booking terms</li>
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
                    onClick={() => router.push('/hotels')}
                  >
                    <span>Book Another Hotel</span>
                    <Building className="w-4 h-4" />
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
                <p className="text-sm text-slate-600">Check your email for detailed booking confirmation and voucher</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-sapphire-900 mb-1">Contact Hotel</h3>
                <p className="text-sm text-slate-600">Call the hotel for special requests or early check-in arrangements</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-sapphire-900 mb-1">Check-in Day</h3>
                <p className="text-sm text-slate-600">Arrive at the hotel with valid ID and booking confirmation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}