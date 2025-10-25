'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Plane, 
  Building, 
  Package, 
  User, 
  Users, 
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBookings } from '@/hooks/use-account'
import { useAuthStore } from '@/store'
import { Booking } from '@/types/account'

const quickLinks = [
  { name: 'My Profile', href: '/account/profile', icon: User, color: 'from-sapphire-500 to-sapphire-600' },
  { name: 'Travellers', href: '/account/travellers', icon: Users, color: 'from-emerald-500 to-emerald-600' },
  { name: 'Payments', href: '/account/payments', icon: CreditCard, color: 'from-ruby-500 to-ruby-600' }
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: bookings, isLoading } = useBookings()

  const upcomingBookings = bookings?.filter(b => 
    b.status === 'confirmed' && new Date(b.tripDate) > new Date()
  ) || []

  const pastBookings = bookings?.filter(b => 
    b.status === 'completed' || new Date(b.tripDate) < new Date()
  ) || []

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-sapphire-900 to-emerald-900 rounded-2xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-5 w-5 text-gold-400" />
          <span className="text-sm font-medium text-gold-400">Welcome back</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Hello, {user?.name?.split(' ')[0] || 'Traveller'}! 👋
        </h1>
        <p className="text-sapphire-100">
          Ready for your next adventure? Manage your bookings and plan your trips.
        </p>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon
          return (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={link.href}>
                <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{link.name}</h3>
                      <p className="text-sm text-gray-600">Manage {link.name.toLowerCase()}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
          <Link href="/account/bookings">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.slice(0, 4).map((booking, index) => {
              const Icon = getBookingIcon(booking.type)
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/account/bookings/${booking.id}`}>
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-sapphire-900">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-sapphire-100">
                            <Icon className="h-5 w-5 text-sapphire-900" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {booking.type} Booking
                            </h3>
                            <p className="text-sm text-gray-600">ID: {booking.id}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.origin && `${booking.origin} → `}{booking.destination}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(booking.tripDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {booking.primaryTraveller}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{booking.price.toLocaleString()}
                        </span>
                        <Button size="sm" variant="ghost">
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
                No Upcoming Trips
              </h3>
              <p className="text-gray-600 mb-6">
                Start planning your next adventure! Browse our amazing flight and hotel deals.
              </p>
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
            </div>
          </Card>
        )}
      </div>

      {/* Past Trips */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pastBookings.slice(0, 3).map((booking, index) => {
              const Icon = getBookingIcon(booking.type)
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/account/bookings/${booking.id}`}>
                    <Card className="p-5 hover:shadow-lg transition-all duration-300 opacity-80 hover:opacity-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <Icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {booking.destination}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {new Date(booking.tripDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹{booking.price.toLocaleString()}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
