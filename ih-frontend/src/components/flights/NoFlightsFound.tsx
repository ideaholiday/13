'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Plane, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SuggestionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action: string
  onClick: () => void
  color: string
}

function SuggestionCard({ icon, title, description, action, onClick, color }: SuggestionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={`border-l-4 ${color} hover:shadow-md transition-all duration-200`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 mb-3">{description}</p>
              <Button variant="outline" size="sm" className="text-xs">
                {action}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function NoFlightsFound() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Extract search parameters (guard null)
  const from = searchParams?.get('from') ?? 'BLR'
  const to = searchParams?.get('to') ?? 'BOM'
  const date = searchParams?.get('date') ?? '2025-11-01'
  const adults = searchParams?.get('adults') ?? '1'
  const children = searchParams?.get('children') ?? '0'
  const infants = searchParams?.get('infants') ?? '0'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleNewSearch = () => {
    router.push('/flights')
  }

  const handleModifySearch = () => {
    router.push(`/flights?from=${from}&to=${to}&date=${date}&adults=${adults}&children=${children}&infants=${infants}`)
  }

  const handleFlexibleDates = () => {
    const currentDate = new Date(date)
    const newDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days
    router.push(`/flights/results?from=${from}&to=${to}&date=${newDate.toISOString().split('T')[0]}&adults=${adults}&children=${children}&infants=${infants}`)
  }

  const handleNearbyAirports = () => {
    // Mock nearby airports logic
    const nearbyAirports = {
      'BLR': ['MYS', 'COK', 'TRV'],
      'BOM': ['PNQ', 'GOI', 'BDQ']
    }
    
    const alternatives = nearbyAirports[from as keyof typeof nearbyAirports] || ['DEL', 'HYD']
    const alternativeAirport = alternatives[0]
    
    router.push(`/flights/results?from=${alternativeAirport}&to=${to}&date=${date}&adults=${adults}&children=${children}&infants=${infants}`)
  }

  const handlePopularRoutes = () => {
    const popularRoutes = [
      { from: 'DEL', to: 'BOM', name: 'Delhi to Mumbai' },
      { from: 'BLR', to: 'DEL', name: 'Bangalore to Delhi' },
      { from: 'HYD', to: 'BOM', name: 'Hyderabad to Mumbai' }
    ]
    
    const route = popularRoutes[0]
    router.push(`/flights/results?from=${route.from}&to=${route.to}&date=${date}&adults=${adults}&children=${children}&infants=${infants}`)
  }

  const handleSubscribePriceAlert = async () => {
    if (!email) return
    
    // Mock subscription
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  const suggestions = [
    {
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      title: 'Try Flexible Dates',
      description: 'Search ±3 days from your selected date for better availability',
      action: 'Search Flexible Dates',
      onClick: handleFlexibleDates,
      color: 'border-l-blue-500'
    },
    {
      icon: <MapPin className="h-6 w-6 text-green-600" />,
      title: 'Check Nearby Airports',
      description: 'Consider alternative airports within 100km radius',
      action: 'Search Nearby',
      onClick: handleNearbyAirports,
      color: 'border-l-green-500'
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: 'Adjust Passenger Count',
      description: 'Try different passenger combinations for better availability',
      action: 'Modify Passengers',
      onClick: handleModifySearch,
      color: 'border-l-purple-500'
    },
    {
      icon: <Plane className="h-6 w-6 text-orange-600" />,
      title: 'Popular Routes',
      description: 'Explore trending destinations with guaranteed availability',
      action: 'View Popular Routes',
      onClick: handlePopularRoutes,
      color: 'border-l-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Flights Found</h1>
          <p className="text-lg text-gray-600 mb-6">
            We couldn't find any flights matching your search criteria
          </p>
          
          {/* Search Summary */}
          <Card className="max-w-md mx-auto mb-8">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Route</span>
                  <span className="font-semibold">{from} → {to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="font-semibold">{formatDate(date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Passengers</span>
                  <span className="font-semibold">
                    {adults}A {Number(children) > 0 && `${children}C`} {Number(infants) > 0 && `${infants}I`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Suggestions</h2>
            <p className="text-gray-600">Try these alternatives to find your perfect flight</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <SuggestionCard {...suggestion} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Price Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Set Price Alert</h3>
                <p className="text-gray-600 mb-6">
                  Get notified when prices drop for this route
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSubscribePriceAlert}
                      disabled={!email || isSubscribed}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubscribed ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Subscribed!</span>
                        </div>
                      ) : (
                        'Set Alert'
                      )}
                    </Button>
                  </div>
                  {isSubscribed && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Price alert set! We'll notify you when prices change.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleNewSearch}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              <Search className="h-5 w-5 mr-2" />
              New Search
            </Button>
            <Button
              onClick={handleModifySearch}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Modify Search
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Need help? <span className="text-blue-600 cursor-pointer hover:underline">Contact Support</span> • 
            <span className="text-blue-600 cursor-pointer hover:underline ml-2">Live Chat</span> • 
            <span className="text-blue-600 cursor-pointer hover:underline ml-2">Call +91 9696 777 391</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
