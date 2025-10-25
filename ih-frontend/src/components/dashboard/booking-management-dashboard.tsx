'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  Plane,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface Booking {
  id: string
  bookingId: string
  flightDetails: any
  passengers: any[]
  contactDetails: any
  searchParams: any
  amount: number
  status: 'confirmed' | 'pending' | 'cancelled'
  payment: any
  bookingDate: string
}

export function BookingManagementDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [searchTerm, statusFilter, bookings])

  const loadBookings = () => {
    try {
      // Load confirmed bookings from localStorage (in real app, this would be from API)
      const confirmedBooking = localStorage.getItem('confirmedBooking')
      const pendingBooking = localStorage.getItem('pendingBooking')
      
      const mockBookings: Booking[] = []

      // Add confirmed booking if exists
      if (confirmedBooking) {
        const booking = JSON.parse(confirmedBooking)
        mockBookings.push({
          ...booking,
          id: booking.bookingId,
          bookingDate: booking.payment?.timestamp || new Date().toISOString(),
          status: 'confirmed'
        })
      }

      // Add pending booking if exists
      if (pendingBooking) {
        const booking = JSON.parse(pendingBooking)
        mockBookings.push({
          ...booking,
          id: booking.bookingId,
          bookingDate: new Date().toISOString(),
          status: 'pending'
        })
      }

      // Add some mock bookings for demonstration
      const additionalMockBookings: Booking[] = [
        {
          id: 'IH1703501234567',
          bookingId: 'IH1703501234567',
          flightDetails: {
            airline: { name: 'Air India', code: 'AI' },
            flightNumber: 'AI-131',
            departure: { time: '09:30', airport: 'Delhi (DEL)' },
            arrival: { time: '11:45', airport: 'Mumbai (BOM)' },
            duration: '2h 15m',
            price: { base: 18000, taxes: 4500 }
          },
          passengers: [
            { title: 'Mr', firstName: 'Rajesh', lastName: 'Kumar', type: 'Adult' }
          ],
          contactDetails: {
            email: 'rajesh.kumar@example.com',
            phone: '+91 9876543210'
          },
          searchParams: {
            origin: 'DEL',
            destination: 'BOM',
            departureDate: '2024-12-20'
          },
          amount: 22500,
          status: 'confirmed',
          payment: {
            id: 'pay_123456789',
            method: 'razorpay',
            timestamp: '2024-12-15T10:30:00Z'
          },
          bookingDate: '2024-12-15T10:30:00Z'
        },
        {
          id: 'IH1703401234568',
          bookingId: 'IH1703401234568',
          flightDetails: {
            airline: { name: 'SpiceJet', code: 'SG' },
            flightNumber: 'SG-8196',
            departure: { time: '16:20', airport: 'Bangalore (BLR)' },
            arrival: { time: '18:35', airport: 'Chennai (MAA)' },
            duration: '1h 15m',
            price: { base: 12000, taxes: 2800 }
          },
          passengers: [
            { title: 'Ms', firstName: 'Priya', lastName: 'Sharma', type: 'Adult' },
            { title: 'Master', firstName: 'Arjun', lastName: 'Sharma', type: 'Child' }
          ],
          contactDetails: {
            email: 'priya.sharma@example.com',
            phone: '+91 9876543211'
          },
          searchParams: {
            origin: 'BLR',
            destination: 'MAA',
            departureDate: '2024-12-25'
          },
          amount: 29600,
          status: 'confirmed',
          payment: {
            id: 'pay_123456790',
            method: 'razorpay',
            timestamp: '2024-12-14T14:20:00Z'
          },
          bookingDate: '2024-12-14T14:20:00Z'
        }
      ]

      const allBookings = [...mockBookings, ...additionalMockBookings]
      setBookings(allBookings)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load bookings:', error)
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Filter by search term (booking ID, passenger name, route)
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengers.some(p => 
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        `${booking.searchParams?.origin} ${booking.searchParams?.destination}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-slate-100 text-slate-800'}>
        <div className="flex items-center space-x-1">
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
      </Badge>
    )
  }

  const formatPrice = (amount: number) => `₹${amount.toLocaleString()}`
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleViewBooking = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`)
  }

  const handleDownloadTicket = (booking: Booking) => {
    console.log('Downloading ticket for:', booking.bookingId)
    // In real app, this would generate and download PDF
    alert('Ticket download feature will be implemented')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sapphire-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">Manage and track all your flight bookings</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search bookings, passenger names, routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
                >
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No bookings found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria' 
                  : 'You haven\'t made any flight bookings yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => router.push('/flights')}>
                  Book Your First Flight
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Booking Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-sapphire-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-sapphire-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sapphire-900">
                              {booking.flightDetails?.airline?.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {booking.flightDetails?.flightNumber}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Flight Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Route</p>
                          <p className="font-medium">
                            {booking.searchParams?.origin} → {booking.searchParams?.destination}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{formatDate(booking.searchParams?.departureDate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Passengers</p>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{booking.passengers.length} passenger(s)</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>Booking ID: <span className="font-mono font-medium">{booking.bookingId}</span></span>
                          <span>Booked on: {formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="font-bold text-lg text-sapphire-900">
                          {formatPrice(booking.amount)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 lg:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBooking(booking.bookingId)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadTicket(booking)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ticket
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-sapphire-900">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
              <p className="text-sm text-slate-600">Confirmed Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-sapphire-900">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600">Pending Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-sapphire-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plane className="w-6 h-6 text-sapphire-600" />
              </div>
              <p className="text-2xl font-bold text-sapphire-900">{bookings.length}</p>
              <p className="text-sm text-slate-600">Total Bookings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}