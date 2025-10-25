'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Utensils, 
  User, 
  Heart, 
  Baby, 
  Accessibility, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Clock,
  CreditCard,
  FileText,
  Shield,
  Star,
  Zap,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface SSRItem {
  id: string
  type: 'meal' | 'seat' | 'medical' | 'special' | 'baggage' | 'insurance'
  name: string
  description: string
  icon: React.ReactNode
  category: string
  isFree: boolean
  price?: number
  currency?: string
  requiresDocumentation?: boolean
  availability?: 'available' | 'limited' | 'unavailable'
  advanceBookingHours?: number
  airlineRestrictions?: string[]
  passengerTypeRestrictions?: ('ADT' | 'CHD' | 'INF')[]
}

interface SSRBookingData {
  passengerId: string
  ssrId: string
  status: 'requested' | 'confirmed' | 'cancelled'
  price: number
  currency: string
  bookingReference?: string
  confirmationNumber?: string
  notes?: string
  documents?: File[]
}

interface EnhancedSSRSelectorProps {
  passengers: Array<{
    id: string
    firstName: string
    lastName: string
    type: 'ADT' | 'CHD' | 'INF'
    age?: number
  }>
  flightDetails: {
    airline: string
    flightNumber: string
    departureTime: string
    arrivalTime: string
    duration: number
  }
  onSSRChange: (passengerId: string, ssrId: string, data: SSRBookingData) => void
  selectedSSRs: Record<string, Record<string, SSRBookingData>>
  onPriceUpdate: (totalPrice: number) => void
}

const ENHANCED_SSRS: SSRItem[] = [
  // Meal Preferences
  {
    id: 'meal-veg',
    type: 'meal',
    name: 'Vegetarian Meal',
    description: 'Fresh vegetarian meal with seasonal vegetables',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
    availability: 'available',
    advanceBookingHours: 24,
  },
  {
    id: 'meal-nonveg',
    type: 'meal',
    name: 'Non-Vegetarian Meal',
    description: 'Chicken or meat meal with sides',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
    availability: 'available',
    advanceBookingHours: 24,
  },
  {
    id: 'meal-vegan',
    type: 'meal',
    name: 'Vegan Meal',
    description: 'Plant-based meal without animal products',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
    availability: 'limited',
    advanceBookingHours: 48,
  },
  {
    id: 'meal-gluten-free',
    type: 'meal',
    name: 'Gluten-Free Meal',
    description: 'Certified gluten-free meal',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
    availability: 'limited',
    advanceBookingHours: 48,
  },
  {
    id: 'meal-kosher',
    type: 'meal',
    name: 'Kosher Meal',
    description: 'Meal prepared according to Jewish dietary laws',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
    availability: 'limited',
    advanceBookingHours: 72,
  },
  {
    id: 'meal-halal',
    type: 'meal',
    name: 'Halal Meal',
    description: 'Meal prepared according to Islamic dietary laws',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
    availability: 'limited',
    advanceBookingHours: 72,
  },

  // Seat Preferences
  {
    id: 'seat-window',
    type: 'seat',
    name: 'Window Seat',
    description: 'Window seat with outside view',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Selection',
    isFree: false,
    price: 500,
    currency: 'INR',
    availability: 'available',
  },
  {
    id: 'seat-aisle',
    type: 'seat',
    name: 'Aisle Seat',
    description: 'Aisle seat with easy access',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Selection',
    isFree: false,
    price: 500,
    currency: 'INR',
    availability: 'available',
  },
  {
    id: 'seat-exit-row',
    type: 'seat',
    name: 'Exit Row Seat',
    description: 'Extra legroom seat in exit row',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Selection',
    isFree: false,
    price: 1500,
    currency: 'INR',
    availability: 'limited',
    passengerTypeRestrictions: ['ADT'],
  },
  {
    id: 'seat-front-row',
    type: 'seat',
    name: 'Front Row Seat',
    description: 'Front row seat with extra legroom',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Selection',
    isFree: false,
    price: 1000,
    currency: 'INR',
    availability: 'limited',
  },

  // Baggage Options
  {
    id: 'baggage-extra-15kg',
    type: 'baggage',
    name: 'Extra 15kg Baggage',
    description: 'Additional 15kg checked baggage allowance',
    icon: <Heart className="w-5 h-5" />,
    category: 'Baggage',
    isFree: false,
    price: 2000,
    currency: 'INR',
    availability: 'available',
  },
  {
    id: 'baggage-extra-20kg',
    type: 'baggage',
    name: 'Extra 20kg Baggage',
    description: 'Additional 20kg checked baggage allowance',
    icon: <Heart className="w-5 h-5" />,
    category: 'Baggage',
    isFree: false,
    price: 3000,
    currency: 'INR',
    availability: 'available',
  },
  {
    id: 'baggage-sports',
    type: 'baggage',
    name: 'Sports Equipment',
    description: 'Special handling for sports equipment',
    icon: <Heart className="w-5 h-5" />,
    category: 'Baggage',
    isFree: false,
    price: 2500,
    currency: 'INR',
    availability: 'limited',
    advanceBookingHours: 48,
  },

  // Special Assistance
  {
    id: 'wheelchair-assistance',
    type: 'medical',
    name: 'Wheelchair Assistance',
    description: 'Wheelchair assistance at airport and aircraft',
    icon: <Accessibility className="w-5 h-5" />,
    category: 'Special Assistance',
    isFree: true,
    availability: 'available',
    requiresDocumentation: true,
    advanceBookingHours: 48,
  },
  {
    id: 'mobility-assistance',
    type: 'medical',
    name: 'Mobility Assistance',
    description: 'Assistance for passengers with mobility issues',
    icon: <Accessibility className="w-5 h-5" />,
    category: 'Special Assistance',
    isFree: true,
    availability: 'available',
    requiresDocumentation: true,
    advanceBookingHours: 48,
  },
  {
    id: 'medical-assistance',
    type: 'medical',
    name: 'Medical Assistance',
    description: 'Medical assistance during flight',
    icon: <Accessibility className="w-5 h-5" />,
    category: 'Special Assistance',
    isFree: true,
    availability: 'limited',
    requiresDocumentation: true,
    advanceBookingHours: 72,
  },

  // Special Services
  {
    id: 'infant-bassinet',
    type: 'special',
    name: 'Infant Bassinet',
    description: 'Bassinet for infant passengers (under 2 years)',
    icon: <Baby className="w-5 h-5" />,
    category: 'Special Services',
    isFree: true,
    availability: 'limited',
    passengerTypeRestrictions: ['INF'],
    advanceBookingHours: 24,
  },
  {
    id: 'unaccompanied-minor',
    type: 'special',
    name: 'Unaccompanied Minor',
    description: 'Special service for children traveling alone (5-17 years)',
    icon: <Baby className="w-5 h-5" />,
    category: 'Special Services',
    isFree: false,
    price: 3000,
    currency: 'INR',
    availability: 'limited',
    requiresDocumentation: true,
    passengerTypeRestrictions: ['CHD'],
    advanceBookingHours: 72,
  },
  {
    id: 'pet-in-cabin',
    type: 'special',
    name: 'Pet in Cabin',
    description: 'Small pet allowed in cabin (max 8kg)',
    icon: <Heart className="w-5 h-5" />,
    category: 'Special Services',
    isFree: false,
    price: 5000,
    currency: 'INR',
    availability: 'limited',
    requiresDocumentation: true,
    advanceBookingHours: 72,
  },

  // Travel Insurance
  {
    id: 'travel-insurance',
    type: 'insurance',
    name: 'Travel Insurance',
    description: 'Comprehensive travel insurance coverage',
    icon: <Shield className="w-5 h-5" />,
    category: 'Insurance',
    isFree: false,
    price: 1500,
    currency: 'INR',
    availability: 'available',
  },
]

const CATEGORIES = ['All', 'Meals', 'Seat Selection', 'Baggage', 'Special Assistance', 'Special Services', 'Insurance']

export function EnhancedSSRSelector({ 
  passengers, 
  flightDetails, 
  onSSRChange, 
  selectedSSRs, 
  onPriceUpdate 
}: EnhancedSSRSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSSR, setSelectedSSR] = useState<{passengerId: string, ssrId: string} | null>(null)
  const [bookingNotes, setBookingNotes] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)

  const filteredSSRs = selectedCategory === 'All' 
    ? ENHANCED_SSRS 
    : ENHANCED_SSRS.filter(ssr => ssr.category === selectedCategory)

  const getPassengerSSRs = (passengerId: string) => {
    return selectedSSRs[passengerId] || {}
  }

  const handleSSRChange = (passengerId: string, ssrId: string, status: 'requested' | 'confirmed' | 'cancelled') => {
    const ssr = ENHANCED_SSRS.find(s => s.id === ssrId)
    if (!ssr) return

    const bookingData: SSRBookingData = {
      passengerId,
      ssrId,
      status,
      price: ssr.price || 0,
      currency: ssr.currency || 'INR',
      notes: bookingNotes,
    }

    onSSRChange(passengerId, ssrId, bookingData)
    updateTotalPrice()
  }

  const updateTotalPrice = () => {
    const total = Object.values(selectedSSRs).reduce((sum, passengerSSRs) => {
      return sum + Object.values(passengerSSRs).reduce((passengerSum, ssr) => {
        return passengerSum + (ssr.status === 'confirmed' ? ssr.price : 0)
      }, 0)
    }, 0)
    setTotalPrice(total)
    onPriceUpdate(total)
  }

  useEffect(() => {
    updateTotalPrice()
  }, [selectedSSRs])

  const getTotalSSRs = (): number => {
    return Object.values(selectedSSRs).reduce((total, passengerSSRs) => {
      return total + Object.keys(passengerSSRs).length
    }, 0)
  }

  const getConfirmedSSRs = (): number => {
    return Object.values(selectedSSRs).reduce((total, passengerSSRs) => {
      return total + Object.values(passengerSSRs).filter(ssr => ssr.status === 'confirmed').length
    }, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Available</Badge>
      case 'limited':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Limited</Badge>
      case 'unavailable':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Unavailable</Badge>
      default:
        return null
    }
  }

  const openBookingModal = (passengerId: string, ssrId: string) => {
    setSelectedSSR({ passengerId, ssrId })
    setShowBookingModal(true)
    setBookingNotes('')
  }

  const confirmBooking = () => {
    if (!selectedSSR) return
    
    handleSSRChange(selectedSSR.passengerId, selectedSSR.ssrId, 'confirmed')
    setShowBookingModal(false)
    setSelectedSSR(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-blue-600" />
            Special Service Requests (SSR)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enhance your flight experience with personalized services
          </p>
        </CardHeader>
        <CardContent>
          {/* Flight Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">{flightDetails.airline} {flightDetails.flightNumber}</h4>
                <div className="text-sm text-blue-700">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {flightDetails.departureTime} - {flightDetails.arrivalTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {Math.floor(flightDetails.duration / 60)}h {flightDetails.duration % 60}m
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                SSR Available
              </Badge>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">{getTotalSSRs()}</p>
              <p className="text-xs text-gray-600">Total Requests</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">{getConfirmedSSRs()}</p>
              <p className="text-xs text-gray-600">Confirmed</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{passengers.length}</p>
              <p className="text-xs text-gray-600">Passengers</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-orange-600">{formatPrice(totalPrice)}</p>
              <p className="text-xs text-gray-600">Total Cost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passengers */}
      <div className="space-y-4">
        {passengers.map((passenger) => {
          const passengerSSRs = getPassengerSSRs(passenger.id)
          const isExpanded = expandedPassenger === passenger.id

          return (
            <Card key={passenger.id} className="overflow-hidden">
              {/* Passenger Header */}
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedPassenger(isExpanded ? null : passenger.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {passenger.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{passenger.firstName} {passenger.lastName}</h3>
                      <p className="text-sm text-gray-600">{passenger.type} {passenger.age && `(${passenger.age} years)`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {Object.keys(passengerSSRs).length} request{Object.keys(passengerSSRs).length !== 1 ? 's' : ''}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
              </CardHeader>

              {/* Passenger SSR Options */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {filteredSSRs.map((ssr) => {
                          const currentBooking = passengerSSRs[ssr.id]
                          const isEligible = !ssr.passengerTypeRestrictions || ssr.passengerTypeRestrictions.includes(passenger.type)

                          return (
                            <div key={ssr.id} className={`p-4 border rounded-lg transition-all ${
                              !isEligible ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    ssr.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {ssr.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-gray-900">{ssr.name}</h4>
                                      {ssr.isFree ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">Free</Badge>
                                      ) : (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                          {formatPrice(ssr.price || 0)}
                                        </Badge>
                                      )}
                                      {getAvailabilityBadge(ssr.availability || 'available')}
                                      {ssr.requiresDocumentation && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                          <FileText className="h-3 w-3 mr-1" />
                                          Docs Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{ssr.description}</p>
                                    {ssr.advanceBookingHours && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Must be booked {ssr.advanceBookingHours}h before departure
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {currentBooking ? (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className={
                                        currentBooking.status === 'confirmed' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-yellow-100 text-yellow-700'
                                      }>
                                        {currentBooking.status === 'confirmed' ? 'Confirmed' : 'Requested'}
                                      </Badge>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSSRChange(passenger.id, ssr.id, 'cancelled')}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openBookingModal(passenger.id, ssr.id)}
                                      disabled={!isEligible || ssr.availability === 'unavailable'}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      {ssr.isFree ? 'Request' : 'Book'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Current Requests Summary */}
                      {Object.keys(passengerSSRs).length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Current Requests</h4>
                          <div className="space-y-2">
                            {Object.entries(passengerSSRs).map(([ssrId, booking]) => {
                              const ssr = ENHANCED_SSRS.find(s => s.id === ssrId)
                              if (!ssr) return null
                              return (
                                <div key={ssrId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1 rounded bg-green-100 text-green-700">
                                      {ssr.icon}
                                    </div>
                                    <div>
                                      <span className="text-sm font-semibold text-green-800">{ssr.name}</span>
                                      {!ssr.isFree && (
                                        <span className="text-xs text-green-600 ml-2">
                                          {formatPrice(booking.price)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className={
                                    booking.status === 'confirmed' 
                                      ? 'bg-green-200 text-green-800' 
                                      : 'bg-yellow-200 text-yellow-800'
                                  }>
                                    {booking.status === 'confirmed' ? 'Confirmed' : 'Requested'}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedSSR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm SSR Request</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookingModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {(() => {
                const ssr = ENHANCED_SSRS.find(s => s.id === selectedSSR.ssrId)
                const passenger = passengers.find(p => p.id === selectedSSR.passengerId)
                if (!ssr || !passenger) return null

                return (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded bg-blue-100 text-blue-700">
                          {ssr.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{ssr.name}</h4>
                          <p className="text-sm text-gray-600">for {passenger.firstName} {passenger.lastName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{ssr.description}</p>
                      {!ssr.isFree && (
                        <div className="mt-2 text-lg font-semibold text-orange-600">
                          {formatPrice(ssr.price || 0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="Any special requirements or notes..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    {ssr.requiresDocumentation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">Documentation Required</p>
                            <p className="text-xs mt-1">
                              Please ensure you have the necessary medical certificates or documentation ready.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowBookingModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={confirmBooking}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {ssr.isFree ? 'Request Service' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Important SSR Information</p>
              <ul className="space-y-1 text-xs">
                <li>• SSR requests must be made at least 24 hours before departure</li>
                <li>• Some services may have limited availability and advance booking requirements</li>
                <li>• Medical certificates may be required for special assistance</li>
                <li>• Paid services will be charged separately and are non-refundable</li>
                <li>• Confirmation of requests will be sent via email</li>
                <li>• Seat selection is subject to availability and airline policies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
