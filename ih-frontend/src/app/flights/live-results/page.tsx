'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plane, 
  MapPin, 
  Users, 
  Filter, 
  SortAsc, 
  SortDesc,
  ArrowLeft,
  Search,
  Star,
  Shield,
  Wifi,
  Coffee,
  Luggage,
  Eye,
  EyeOff,
  Download,
  Share2,
  Bell,
  Calendar,
  Globe,
  Award,
  Sparkles
} from 'lucide-react'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import { NoFlightsFound } from '@/components/flights/NoFlightsFound'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

interface LiveFlightData {
  id: string
  airline: {
    code: string
    name: string
    logo: string
  }
  flightNumber: string
  aircraft: string
  origin: {
    code: string
    city: string
    terminal?: string
  }
  destination: {
    code: string
    city: string
    terminal?: string
  }
  departure: {
    time: string
    date: string
    gate?: string
    status: 'on-time' | 'delayed' | 'boarding' | 'departed'
  }
  arrival: {
    time: string
    date: string
    gate?: string
    status: 'on-time' | 'delayed' | 'arrived'
  }
  duration: number
  stops: number
  fare: {
    baseFare: number
    taxes: number
    totalFare: number
    currency: string
    isLivePrice: boolean
    lastUpdated: string
    priceChange?: {
      amount: number
      percentage: number
      direction: 'up' | 'down'
    }
  }
  amenities: {
    wifi: boolean
    meals: boolean
    entertainment: boolean
    power: boolean
    priorityBoarding: boolean
  }
  baggage: {
    cabin: string
    checked: string
    extraCost?: number
  }
  availability: {
    seats: number
    lastChecked: string
    isLimited: boolean
  }
  isRefundable: boolean
  isPopular: boolean
  isBestDeal: boolean
  delayInfo?: {
    minutes: number
    reason: string
  }
}

interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  stops: 'all' | 'nonstop' | 'one-stop'
  departureTime: [number, number]
  arrivalTime: [number, number]
  amenities: string[]
  refundableOnly: boolean
  livePricesOnly: boolean
}

type SortOption = 'price' | 'duration' | 'departure' | 'arrival' | 'popularity' | 'best-deal'

export default function LiveFlightResultsPage() {
  const router = useRouter()
  const store = useFlightStore()
  
  // State
  const [isClient, setIsClient] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [sortBy, setSortBy] = useState<SortOption>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(false)
  const [liveData, setLiveData] = useState<LiveFlightData[]>([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    airlines: [],
    stops: 'all',
    departureTime: [0, 24],
    arrivalTime: [0, 24],
    amenities: [],
    refundableOnly: false,
    livePricesOnly: false,
  })

  // Mock live flight data generator
  const generateLiveFlightData = useCallback((): LiveFlightData[] => {
    const airlines = [
      { code: '6E', name: 'IndiGo', logo: 'https://logos.skyscnr.com/images/airlines/favicon/6E.png' },
      { code: 'AI', name: 'Air India', logo: 'https://logos.skyscnr.com/images/airlines/favicon/AI.png' },
      { code: 'SG', name: 'SpiceJet', logo: 'https://logos.skyscnr.com/images/airlines/favicon/SG.png' },
      { code: 'UK', name: 'Vistara', logo: 'https://logos.skyscnr.com/images/airlines/favicon/UK.png' },
      { code: 'G8', name: 'GoAir', logo: 'https://logos.skyscnr.com/images/airlines/favicon/G8.png' },
      { code: 'IX', name: 'Air India Express', logo: 'https://logos.skyscnr.com/images/airlines/favicon/IX.png' },
    ]

    const aircraft = ['Airbus A320', 'Boeing 737', 'Airbus A321', 'Boeing 787', 'Airbus A330']
    const statuses = ['on-time', 'delayed', 'boarding', 'departed'] as const
    const delayReasons = ['Weather', 'Air Traffic', 'Technical', 'Crew', 'Late Arrival']

    return Array.from({ length: 15 }, (_, i) => {
      const airline = airlines[Math.floor(Math.random() * airlines.length)]
      const basePrice = Math.floor(Math.random() * 50000) + 20000
      const priceChange = Math.random() > 0.7 ? {
        amount: Math.floor(Math.random() * 2000) - 1000,
        percentage: Math.floor(Math.random() * 20) - 10,
        direction: Math.random() > 0.5 ? 'up' as const : 'down' as const
      } : undefined

      return {
        id: `flight-${i}`,
        airline,
        flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
        aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
        origin: {
          code: store.from?.code || 'BLR',
          city: store.from?.city || 'Bangalore',
          terminal: Math.random() > 0.5 ? `T${Math.floor(Math.random() * 3) + 1}` : undefined
        },
        destination: {
          code: store.to?.code || 'BOM',
          city: store.to?.city || 'Mumbai',
          terminal: Math.random() > 0.5 ? `T${Math.floor(Math.random() * 3) + 1}` : undefined
        },
        departure: {
          time: `${Math.floor(Math.random() * 12) + 6}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          date: store.departDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          gate: Math.random() > 0.7 ? `Gate ${Math.floor(Math.random() * 50) + 1}` : undefined,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        },
        arrival: {
          time: `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          date: store.departDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          gate: Math.random() > 0.7 ? `Gate ${Math.floor(Math.random() * 50) + 1}` : undefined,
          status: 'on-time'
        },
        duration: Math.floor(Math.random() * 180) + 60, // 1-4 hours
        stops: Math.random() > 0.7 ? 1 : 0,
        fare: {
          baseFare: basePrice,
          taxes: Math.floor(basePrice * 0.15),
          totalFare: basePrice + Math.floor(basePrice * 0.15),
          currency: 'INR',
          isLivePrice: Math.random() > 0.3,
          lastUpdated: new Date().toISOString(),
          priceChange
        },
        amenities: {
          wifi: Math.random() > 0.5,
          meals: Math.random() > 0.3,
          entertainment: Math.random() > 0.4,
          power: Math.random() > 0.6,
          priorityBoarding: Math.random() > 0.7
        },
        baggage: {
          cabin: '7kg',
          checked: Math.random() > 0.5 ? '15kg' : '20kg',
          extraCost: Math.random() > 0.8 ? Math.floor(Math.random() * 2000) + 500 : undefined
        },
        availability: {
          seats: Math.floor(Math.random() * 50) + 5,
          lastChecked: new Date().toISOString(),
          isLimited: Math.random() > 0.6
        },
        isRefundable: Math.random() > 0.4,
        isPopular: Math.random() > 0.6,
        isBestDeal: Math.random() > 0.8,
        delayInfo: Math.random() > 0.8 ? {
          minutes: Math.floor(Math.random() * 120) + 15,
          reason: delayReasons[Math.floor(Math.random() * delayReasons.length)]
        } : undefined
      }
    })
  }, [store.from, store.to, store.departDate])

  // Initialize client-side and load data
  useEffect(() => {
    setIsClient(true)
    setLiveData(generateLiveFlightData())
  }, [generateLiveFlightData])

  // Auto-refresh every 30 seconds in live mode
  useEffect(() => {
    if (!isLiveMode) return

    const interval = setInterval(() => {
      setIsRefreshing(true)
      setTimeout(() => {
        setLiveData(generateLiveFlightData())
        setLastRefresh(new Date())
        setIsRefreshing(false)
        toast.success('Flight data refreshed!', { duration: 2000 })
      }, 1000)
    }, 30000)

    return () => clearInterval(interval)
  }, [isLiveMode, generateLiveFlightData])

  // Get unique airlines
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>()
    liveData.forEach(flight => airlines.add(flight.airline.code))
    return Array.from(airlines).map(code => {
      const flight = liveData.find(f => f.airline.code === code)
      return { code, name: flight?.airline.name || code }
    })
  }, [liveData])

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    let result = [...liveData]

    // Price filter
    result = result.filter(flight => 
      flight.fare.totalFare >= filters.priceRange[0] && 
      flight.fare.totalFare <= filters.priceRange[1]
    )

    // Airlines filter
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.airline.code))
    }

    // Stops filter
    if (filters.stops !== 'all') {
      const targetStops = filters.stops === 'nonstop' ? 0 : 1
      result = result.filter(flight => flight.stops === targetStops)
    }

    // Time filters
    result = result.filter(flight => {
      const depHour = parseInt(flight.departure.time.split(':')[0])
      const arrHour = parseInt(flight.arrival.time.split(':')[0])
      
      return depHour >= filters.departureTime[0] && 
             depHour <= filters.departureTime[1] &&
             arrHour >= filters.arrivalTime[0] && 
             arrHour <= filters.arrivalTime[1]
    })

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter(flight => 
        filters.amenities.every(amenity => flight.amenities[amenity as keyof typeof flight.amenities])
      )
    }

    // Refundable filter
    if (filters.refundableOnly) {
      result = result.filter(flight => flight.isRefundable)
    }

    // Live prices filter
    if (filters.livePricesOnly) {
      result = result.filter(flight => flight.fare.isLivePrice)
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'price':
          comparison = a.fare.totalFare - b.fare.totalFare
          break
        case 'duration':
          comparison = a.duration - b.duration
          break
        case 'departure':
          comparison = a.departure.time.localeCompare(b.departure.time)
          break
        case 'arrival':
          comparison = a.arrival.time.localeCompare(b.arrival.time)
          break
        case 'popularity':
          comparison = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
          break
        case 'best-deal':
          comparison = (b.isBestDeal ? 1 : 0) - (a.isBestDeal ? 1 : 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [liveData, filters, sortBy, sortOrder])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-green-600 bg-green-100'
      case 'delayed': return 'text-red-600 bg-red-100'
      case 'boarding': return 'text-blue-600 bg-blue-100'
      case 'departed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLiveData(generateLiveFlightData())
      setLastRefresh(new Date())
      setIsRefreshing(false)
      toast.success('Flight data refreshed!')
    }, 1000)
  }

  const handleSelectFlight = (flight: LiveFlightData) => {
    // Convert to store format and select
    toast.success(`${flight.airline.name} ${flight.flightNumber} selected!`)
    router.push('/flights/review')
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live flight data...</p>
        </div>
      </div>
    )
  }

  if (liveData.length === 0) {
    return <NoFlightsFound />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={isLiveMode ? 'bg-green-100 text-green-700 border-green-300' : ''}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  {isLiveMode ? 'Live Mode' : 'Static Mode'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPriceAlertEnabled(!priceAlertEnabled)}
                className={priceAlertEnabled ? 'bg-blue-100 text-blue-700' : ''}
              >
                <Bell className="h-4 w-4 mr-1" />
                Price Alert
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/flights')}
              >
                <Search size={16} className="mr-2" />
                New Search
              </Button>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plane className="h-6 w-6 text-blue-600" />
                {store.from?.code} → {store.to?.code}
                {isLiveMode && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {store.departDate?.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {store.adults} Adult{store.adults !== 1 ? 's' : ''}
                {store.children > 0 && `, ${store.children} Child${store.children !== 1 ? 'ren' : ''}`}
                {store.infants > 0 && `, ${store.infants} Infant${store.infants !== 1 ? 's' : ''}`}
              </p>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {filteredFlights.length} flights found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sorting and Filter Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== false && v !== 'all') && (
                <Badge variant="secondary" className="ml-1">Active</Badge>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Sort by:</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="departure">Departure</SelectItem>
                  <SelectItem value="arrival">Arrival</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="best-deal">Best Deal</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live Prices
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <Shield className="h-3 w-3 mr-1" />
              Secure Booking
            </Badge>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Flights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium">Price Range</Label>
                      <div className="mt-2">
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) => setFilters({...filters, priceRange: value as [number, number]})}
                          min={0}
                          max={100000}
                          step={1000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formatPrice(filters.priceRange[0])}</span>
                          <span>{formatPrice(filters.priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    {/* Airlines */}
                    <div>
                      <Label className="text-sm font-medium">Airlines</Label>
                      <div className="mt-2 space-y-2">
                        {availableAirlines.map(airline => (
                          <div key={airline.code} className="flex items-center space-x-2">
                            <Checkbox
                              id={airline.code}
                              checked={filters.airlines.includes(airline.code)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({...filters, airlines: [...filters.airlines, airline.code]})
                                } else {
                                  setFilters({...filters, airlines: filters.airlines.filter(a => a !== airline.code)})
                                }
                              }}
                            />
                            <Label htmlFor={airline.code} className="text-sm">{airline.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stops */}
                    <div>
                      <Label className="text-sm font-medium">Stops</Label>
                      <div className="mt-2 space-y-2">
                        {['all', 'nonstop', 'one-stop'].map(stop => (
                          <div key={stop} className="flex items-center space-x-2">
                            <Checkbox
                              id={stop}
                              checked={filters.stops === stop}
                              onCheckedChange={(checked) => {
                                if (checked) setFilters({...filters, stops: stop as any})
                              }}
                            />
                            <Label htmlFor={stop} className="text-sm capitalize">
                              {stop === 'all' ? 'All' : stop === 'nonstop' ? 'Non-stop' : 'One Stop'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <Label className="text-sm font-medium">Amenities</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          { key: 'wifi', label: 'WiFi' },
                          { key: 'meals', label: 'Meals' },
                          { key: 'entertainment', label: 'Entertainment' },
                          { key: 'priorityBoarding', label: 'Priority Boarding' }
                        ].map(amenity => (
                          <div key={amenity.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity.key}
                              checked={filters.amenities.includes(amenity.key)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({...filters, amenities: [...filters.amenities, amenity.key]})
                                } else {
                                  setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity.key)})
                                }
                              }}
                            />
                            <Label htmlFor={amenity.key} className="text-sm">{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        priceRange: [0, 100000],
                        airlines: [],
                        stops: 'all',
                        departureTime: [0, 24],
                        arrivalTime: [0, 24],
                        amenities: [],
                        refundableOnly: false,
                        livePricesOnly: false,
                      })}
                    >
                      Clear All
                    </Button>
                    <Button onClick={() => setShowFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flight Results */}
        <div className="space-y-4">
          {filteredFlights.map((flight, index) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                onClick={() => handleSelectFlight(flight)}
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Airline Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={flight.airline.logo} 
                          alt={flight.airline.name}
                          className="w-8 h-8 rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/images/airline-default.png'
                          }}
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{flight.airline.name}</div>
                          <div className="text-sm text-gray-600">{flight.flightNumber}</div>
                          <div className="text-xs text-gray-500">{flight.aircraft}</div>
                        </div>
                      </div>
                    </div>

                    {/* Flight Route */}
                    <div className="lg:col-span-6">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        {/* Departure */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {flight.departure.time}
                          </div>
                          <div className="text-sm font-semibold text-gray-700">
                            {flight.origin.code}
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.origin.city}
                          </div>
                          {flight.departure.gate && (
                            <div className="text-xs text-blue-600">
                              {flight.departure.gate}
                            </div>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mt-1 ${getStatusColor(flight.departure.status)}`}
                          >
                            {flight.departure.status.replace('-', ' ')}
                          </Badge>
                        </div>

                        {/* Duration & Stops */}
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">
                            {formatDuration(flight.duration)}
                          </div>
                          <div className="w-full h-px bg-gray-300 mb-1"></div>
                          <div className="text-xs text-gray-500">
                            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </div>
                          {flight.delayInfo && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs mt-1">
                              +{flight.delayInfo.minutes}m delay
                            </Badge>
                          )}
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {flight.arrival.time}
                          </div>
                          <div className="text-sm font-semibold text-gray-700">
                            {flight.destination.code}
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.destination.city}
                          </div>
                          {flight.arrival.gate && (
                            <div className="text-xs text-blue-600">
                              {flight.arrival.gate}
                            </div>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mt-1 ${getStatusColor(flight.arrival.status)}`}
                          >
                            {flight.arrival.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="lg:col-span-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(flight.fare.totalFare)}
                        </div>
                        <div className="text-sm text-gray-600">per person</div>
                        
                        {flight.fare.priceChange && (
                          <div className={`text-xs mt-1 ${
                            flight.fare.priceChange.direction === 'up' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {flight.fare.priceChange.direction === 'up' ? '↗' : '↘'} 
                            {formatPrice(Math.abs(flight.fare.priceChange.amount))} 
                            ({flight.fare.priceChange.percentage}%)
                          </div>
                        )}

                        {flight.fare.isLivePrice && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs mt-1">
                            <Zap className="h-3 w-3 mr-1" />
                            Live Price
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Badges & Actions */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {flight.isBestDeal && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <Award className="h-3 w-3 mr-1" />
                            Best Deal
                          </Badge>
                        )}
                        {flight.isPopular && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {flight.isRefundable && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Refundable
                          </Badge>
                        )}
                        {flight.availability.isLimited && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Limited Seats
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {flight.availability.seats} seats
                        </div>
                        <div className="flex items-center gap-1">
                          <Luggage className="h-3 w-3" />
                          {flight.baggage.cabin}/{flight.baggage.checked}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Wifi className={`h-4 w-4 ${flight.amenities.wifi ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={flight.amenities.wifi ? 'text-green-600' : 'text-gray-400'}>WiFi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee className={`h-4 w-4 ${flight.amenities.meals ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={flight.amenities.meals ? 'text-green-600' : 'text-gray-400'}>Meals</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className={`h-4 w-4 ${flight.amenities.entertainment ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={flight.amenities.entertainment ? 'text-green-600' : 'text-gray-400'}>Entertainment</span>
                      </div>
                      {flight.amenities.priorityBoarding && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600">Priority Boarding</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFlights.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No flights match your filters</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
              >
                Adjust Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
