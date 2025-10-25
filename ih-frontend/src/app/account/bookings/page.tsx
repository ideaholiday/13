'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Plane, 
  Building, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Filter
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBookings } from '@/hooks/use-account'
import { Booking } from '@/types/account'

export default function BookingsPage() {
  const { data: bookings, isLoading } = useBookings()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const upcomingBookings = bookings?.filter(b => 
    (b.status === 'confirmed' || b.status === 'pending') && 
    new Date(b.tripDate) > new Date()
  ) || []

  const pastBookings = bookings?.filter(b => 
    b.status === 'completed' || b.status === 'cancelled' || 
    new Date(b.tripDate) < new Date()
  ) || []

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane
      case 'hotel': return Building
      case 'package': return Package
      default: return Calendar
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your bookings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'upcoming'
              ? 'text-sapphire-900 border-b-2 border-sapphire-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'past'
              ? 'text-sapphire-900 border-b-2 border-sapphire-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : displayBookings.length > 0 ? (
        <div className="space-y-4">
          {displayBookings.map((booking, index) => {
            const Icon = getBookingIcon(booking.type)
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/account/bookings/${booking.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-sapphire-500 to-emerald-500 text-white">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg capitalize">
                            {booking.type} Booking
                          </h3>
                          <p className="text-sm text-gray-600">
                            Booking ID: {booking.id}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Destination</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.origin && `${booking.origin} → `}{booking.destination}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Travel Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.tripDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Primary Traveller</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.primaryTraveller}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-xs text-gray-500">Total Amount</span>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{booking.price.toLocaleString()}
                        </p>
                      </div>
                      <Button variant="outline">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="max-w-md mx-auto">
            <div className="mb-4 inline-flex p-4 rounded-full bg-gray-100">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming'
                ? 'You don\'t have any upcoming trips. Start planning your next adventure!'
                : 'You don\'t have any past bookings yet.'}
            </p>
            {activeTab === 'upcoming' && (
              <div className="flex gap-3 justify-center">
                <Link href="/flights">
                  <Button>
                    <Plane className="mr-2 h-4 w-4" />
                    Book Flights
                  </Button>
                </Link>
                <Link href="/hotels">
                  <Button variant="outline">
                    <Building className="mr-2 h-4 w-4" />
                    Book Hotels
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
