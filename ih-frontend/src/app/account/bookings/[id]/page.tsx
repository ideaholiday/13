'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plane, 
  Building, 
  Package, 
  Calendar, 
  Clock,
  MapPin,
  User,
  Users,
  Mail,
  Phone,
  CreditCard,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBooking } from '@/hooks/use-account'

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = (params?.id as string) || ''
  const { data: booking, isLoading } = useBooking(bookingId)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The booking you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/account/bookings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </Card>
      </div>
    )
  }

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane
      case 'hotel': return Building
      case 'package': return Package
      default: return Calendar
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle
      case 'cancelled': return XCircle
      case 'completed': return CheckCircle
      default: return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800'
      case 'pending': return 'bg-gold-100 text-gold-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const Icon = getBookingIcon(booking.type)
  const StatusIcon = getStatusIcon(booking.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/account/bookings')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bookings
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-r from-sapphire-900 to-emerald-900 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold capitalize">
                  {booking.type} Booking
                </h1>
                <p className="text-sapphire-100 mt-1">
                  Booking ID: {booking.id}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {booking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-sapphire-200 text-sm">Booking Date</p>
              <p className="font-semibold">
                {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sapphire-200 text-sm">Travel Date</p>
              <p className="font-semibold">
                {new Date(booking.tripDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sapphire-200 text-sm">Total Amount</p>
              <p className="text-2xl font-bold">₹{booking.price.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <Button className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share Booking
        </Button>
      </motion.div>

      {/* Trip Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Trip Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-sapphire-900 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Route</p>
                <p className="font-semibold text-gray-900">
                  {booking.origin ? `${booking.origin} → ${booking.destination}` : booking.destination}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-sapphire-900 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Travel Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.tripDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {booking.type === 'flight' && booking.details?.flightNumber && (
              <div className="flex items-start space-x-3">
                <Plane className="h-5 w-5 text-sapphire-900 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Flight Number</p>
                  <p className="font-semibold text-gray-900">{booking.details.flightNumber}</p>
                </div>
              </div>
            )}

            {booking.type === 'hotel' && booking.details?.hotelName && (
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-sapphire-900 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Hotel Name</p>
                  <p className="font-semibold text-gray-900">{booking.details.hotelName}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Traveller Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Traveller Information
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-sapphire-900 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Primary Traveller</p>
                <p className="font-semibold text-gray-900">{booking.primaryTraveller}</p>
              </div>
            </div>

            {booking.details?.travellers && (
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-sapphire-900 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Total Travellers</p>
                  <p className="font-semibold text-gray-900">
                    {booking.details.travellers} {booking.details.travellers === 1 ? 'Person' : 'People'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Price Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Price Breakdown
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-700">
              <span>Base Fare</span>
              <span>₹{(booking.price * 0.85).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span>Taxes & Fees</span>
              <span>₹{(booking.price * 0.15).toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex items-center justify-between text-lg font-bold text-gray-900">
              <span>Total Amount</span>
              <span>₹{booking.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-lg flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div className="text-sm text-emerald-800">
              <p className="font-semibold">Payment Successful</p>
              <p>Paid via {booking.details?.paymentMethod || 'Card'}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Cancel/Modify Actions */}
      {booking.status === 'confirmed' && new Date(booking.tripDate) > new Date() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-gold-200 bg-gold-50">
            <h3 className="font-semibold text-gray-900 mb-4">Need to make changes?</h3>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Modify Booking
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                Cancel Booking
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              * Cancellation charges may apply as per the booking terms
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
