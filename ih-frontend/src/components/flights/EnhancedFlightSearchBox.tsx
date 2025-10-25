'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plane, MapPin, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TripType } from '@/lib/types/flight-booking'
import { TripTabs } from './TripTabs'
import { AirportInput } from './AirportInput'
import { DateInput } from './DateInput'
import { TravellerPopover } from './TravellerPopover'
import { CabinSelector } from './CabinSelector'
import { SwapButton } from './SwapButton'
import { MultiCitySearch } from './MultiCitySearch'
import { useRouter } from 'next/navigation'

export function FlightSearchBox() {
  const router = useRouter()
  const store = useFlightStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleOriginChange = (value: string) => {
    store.setOrigin({ code: value, name: '', city: '', country: '' })
  }

  const handleDestinationChange = (value: string) => {
    store.setDestination({ code: value, name: '', city: '', country: '' })
  }

  const handleDepartDateChange = (value: string) => {
    store.setDepartDate(new Date(value))
  }

  const handleReturnDateChange = (value: string) => {
    store.setReturnDate(new Date(value))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!store.from?.code) {
      errors.origin = 'Please select departure city'
    }
    if (!store.to?.code) {
      errors.destination = 'Please select arrival city'
    }
    if (store.from?.code === store.to?.code) {
      errors.same = 'Departure and arrival cities must be different'
    }
    if (!store.departDate) {
      errors.departDate = 'Please select departure date'
    }

    if (store.tripType === 'R' && !store.returnDate) {
      errors.returnDate = 'Please select return date'
    }

    if (store.adults === 0) {
      errors.travellers = 'At least one adult is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await store.performSearch()
      router.push('/flights/results')
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const showReturnDate = store.tripType === 'R'

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const inputVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="-mt-20 relative z-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Trip Type Tabs */}
            <div className="mb-8">
              <TripTabs />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-900 mb-1">Search Issue</div>
                    <div className="text-red-700 text-sm">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Search Form */}
            <form onSubmit={handleSearch}>
              {store.tripType === 'M' ? (
                <MultiCitySearch />
              ) : (
                <motion.div
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                {/* Route Selection Row */}
                <motion.div variants={itemVariants}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                    {/* From */}
                    <div className="lg:col-span-5">
                      <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                        <Plane className="h-5 w-5 text-blue-600" />
                        <span>From</span>
                        {validationErrors.origin && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <div className="relative group">
                        <AirportInput
                          value={store.from?.code || ''}
                          onChange={handleOriginChange}
                          placeholder="Departure city"
                        />
                        {store.from?.code && (
                          <Badge variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-100 text-green-700">
                            {store.from.code}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="lg:col-span-2 flex justify-center">
                      <SwapButton legIndex={0} />
                    </div>

                    {/* To */}
                    <div className="lg:col-span-5">
                      <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-600" />
                        <span>To</span>
                        {validationErrors.destination && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <div className="relative group">
                        <AirportInput
                          value={store.to?.code || ''}
                          onChange={handleDestinationChange}
                          placeholder="Arrival city"
                        />
                        {store.to?.code && (
                          <Badge variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-100 text-red-700">
                            {store.to.code}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Separator />

                {/* Date, Travellers, Class, Search Row */}
                <motion.div variants={itemVariants}>
                  <div className={`grid grid-cols-1 lg:gap-6 ${
                    showReturnDate ? 'lg:grid-cols-12' : 'lg:grid-cols-10'
                  }`}>
                    {/* Departure Date */}
                    <div className={showReturnDate ? 'lg:col-span-2' : 'lg:col-span-2'}>
                      <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span>Depart</span>
                        {validationErrors.departDate && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <DateInput
                        value={store.departDate?.toISOString().split('T')[0] || ''}
                        onChange={handleDepartDateChange}
                        placeholder="Pick date"
                      />
                    </div>

                    {/* Return Date (if Round Trip) */}
                    {showReturnDate && (
                      <div className="lg:col-span-2">
                        <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <span>Return</span>
                          {validationErrors.returnDate && <span className="text-red-500 text-xs">*</span>}
                        </label>
                        <DateInput
                          value={store.returnDate?.toISOString().split('T')[0] || ''}
                          onChange={handleReturnDateChange}
                          placeholder="Return date"
                        />
                      </div>
                    )}

                    {/* Travellers */}
                    <div className={showReturnDate ? 'lg:col-span-2' : 'lg:col-span-2'}>
                      <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <span>Travellers</span>
                        {validationErrors.travellers && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <TravellerPopover />
                    </div>

                    {/* Class */}
                    <div className={showReturnDate ? 'lg:col-span-2' : 'lg:col-span-2'}>
                      <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                        <Users className="h-5 w-5 text-amber-600" />
                        <span>Class</span>
                      </label>
                      <CabinSelector isCompact={true} />
                    </div>

                    {/* Search Button */}
                    <div className={showReturnDate ? 'lg:col-span-2' : 'lg:col-span-2'}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Searching...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            <span>Search Flights</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Validation Errors */}
                {Object.keys(validationErrors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-900 mb-2">Please fix the following issues:</div>
                        <div className="space-y-1">
                          {Object.values(validationErrors).map((err, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-red-700">
                              <span className="text-red-500">•</span>
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </motion.div>
              )}
            </form>

            <Separator className="my-8" />

            {/* Quick Links Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span>Popular Destinations</span>
                </h3>
                <Badge variant="outline" className="text-xs">Tap to search</Badge>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-left transition-all border border-blue-200 hover:border-blue-300 hover:shadow-md group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">✈️</div>
                  <div className="text-sm font-bold text-gray-800 mb-1">New York</div>
                  <div className="text-xs text-gray-600">From ₹45,000</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-left transition-all border border-purple-200 hover:border-purple-300 hover:shadow-md group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🏖️</div>
                  <div className="text-sm font-bold text-gray-800 mb-1">Dubai</div>
                  <div className="text-xs text-gray-600">From ₹25,000</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-left transition-all border border-green-200 hover:border-green-300 hover:shadow-md group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🏨</div>
                  <div className="text-sm font-bold text-gray-800 mb-1">Hotels</div>
                  <div className="text-xs text-gray-600">Best Deals</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-left transition-all border border-amber-200 hover:border-amber-300 hover:shadow-md group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🎫</div>
                  <div className="text-sm font-bold text-gray-800 mb-1">Deals</div>
                  <div className="text-xs text-gray-600">Today Only</div>
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
