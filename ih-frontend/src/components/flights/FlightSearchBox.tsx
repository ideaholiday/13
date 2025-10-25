"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { useFlightStore } from "@/lib/stores/consolidated-flight-store"
import { Button } from "@/components/ui/button"
import { TripType, SearchRequest } from "@/lib/types/flight-booking"
import { TripTabs } from "./TripTabs"
import { AirportInput } from "./AirportInput"
import { DateInput } from "./DateInput"
import { TravellerPopover } from "./TravellerPopover"
import { CabinSelector } from "./CabinSelector"
import { SwapButton } from "./SwapButton"
import { useRouter } from "next/navigation"
import { validateFlightSearch } from '@/lib/flight-api'

export function FlightSearchBox() {
  const router = useRouter()
  const store = useFlightStore()
  const {
    tripType,
    from,
    to,
    departDate,
    returnDate,
    adults,
    children,
    infants,
    cabinClass,
    multiCityLegs,
  } = store

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const isMultiCity = tripType === TripType.MultiCity
  const buildAirport = (value: string) => ({
    code: value,
    name: value,
    city: value,
    country: value,
  })

  const handleOriginChange = (value: string) => {
    const airport = buildAirport(value)
    store.setOrigin(airport)
    if (isMultiCity) {
      store.setMultiCityLeg(0, { from: airport })
    }
  }

  const handleDestinationChange = (value: string) => {
    const airport = buildAirport(value)
    store.setDestination(airport)
    if (isMultiCity) {
      store.setMultiCityLeg(0, { to: airport })
    }
  }

  const handleDepartDateChange = (value: string) => {
    const date = value ? new Date(value) : null
    if (date) {
      store.setDepartDate(date)
    }
    if (isMultiCity) {
      store.setMultiCityLeg(0, { departDate: date })
    }
  }

  const handleReturnDateChange = (value: string) => {
    const date = value ? new Date(value) : null
    store.setReturnDate(date)
  }

  const handleMultiOriginChange = (index: number, value: string) => {
    const airport = buildAirport(value)
    store.setMultiCityLeg(index, { from: airport })
    if (index === 0) {
      store.setOrigin(airport)
    }
  }

  const handleMultiDestinationChange = (index: number, value: string) => {
    const airport = buildAirport(value)
    store.setMultiCityLeg(index, { to: airport })
    if (index === multiCityLegs.length - 1) {
      store.setDestination(airport)
    }
  }

  const handleMultiDateChange = (index: number, value: string) => {
    const date = value ? new Date(value) : null
    store.setMultiCityLeg(index, { departDate: date })
    if (index === 0 && date) {
      store.setDepartDate(date)
    }
  }

  const handleAddLeg = () => {
    store.addMultiCityLeg()
  }

  const handleRemoveLeg = (index: number) => {
    store.removeMultiCityLeg(index)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (isMultiCity) {
      const completedLegs = multiCityLegs.filter(
        (leg) => leg.from && leg.to && leg.departDate
      )

      if (completedLegs.length < 2) {
        errors.multiCity = 'Please add at least two legs with cities and dates'
      }

      multiCityLegs.forEach((leg, index) => {
        if (!leg.from) {
          errors[`multi-from-${index}`] = `Leg ${index + 1}: select departure`
        }
        if (!leg.to) {
          errors[`multi-to-${index}`] = `Leg ${index + 1}: select destination`
        }
        if (!leg.departDate) {
          errors[`multi-date-${index}`] = `Leg ${index + 1}: pick a date`
        }
        if (leg.from && leg.to && leg.from.code === leg.to.code) {
          errors[`multi-same-${index}`] = `Leg ${index + 1}: departure and arrival must differ`
        }
      })

      if (adults === 0) {
        errors.travellers = 'At least one adult is required'
      }

      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    }

    if (!from) {
      errors.origin = "Please select departure city"
    }
    if (!to) {
      errors.destination = "Please select arrival city"
    }
    if (from && to && from.code === to.code) {
      errors.same = "Departure and arrival cities must be different"
    }
    if (!departDate) {
      errors.departDate = "Please select departure date"
    }

    if (tripType === TripType.RoundTrip && !returnDate) {
      errors.returnDate = "Please select return date"
    }

    if (adults === 0) {
      errors.travellers = "At least one adult is required"
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
      // Extra contract validation for O/R before calling API
      if (!isMultiCity) {
        const contractErrors = validateFlightSearch({
          origin: from?.code || '',
          destination: to?.code || '',
          departDate: departDate ? departDate.toISOString().split('T')[0] : '',
          returnDate: tripType === TripType.RoundTrip && returnDate
            ? returnDate.toISOString().split('T')[0]
            : undefined,
          tripType: (tripType === TripType.RoundTrip ? 'R' : 'O') as 'O' | 'R',
          adults,
          children,
          infants,
          cabinClass: cabinClass as any,
        })
        if (contractErrors.length) {
          setValidationErrors((prev) => ({
            ...prev,
            ...contractErrors.reduce((acc, msg, idx) => {
              acc[`contract-${idx}`] = msg
              return acc
            }, {} as Record<string, string>),
          }))
          setError('Please correct the highlighted issues and try again.')
          setIsLoading(false)
          return
        }
      }

      const legsPayload =
        tripType === TripType.MultiCity
          ? multiCityLegs
              .filter((leg) => leg.from && leg.to && leg.departDate)
              .map((leg) => ({
                origin: leg.from!.code,
                destination: leg.to!.code,
                departDate: leg.departDate!.toISOString().split('T')[0],
              }))
          : [
              {
                origin: from?.code || '',
                destination: to?.code || '',
                departDate: departDate?.toISOString().split('T')[0] || '',
              },
              ...(tripType === TripType.RoundTrip && returnDate
                ? [
                    {
                      origin: to?.code || '',
                      destination: from?.code || '',
                      departDate: returnDate?.toISOString().split('T')[0] || '',
                    },
                  ]
                : []),
            ]

      const searchParams: SearchRequest = {
        tripType,
        legs: legsPayload as any,
        adults,
        children,
        infants,
        cabinClass: cabinClass as any,
      }

      console.log('🔍 Searching flights with params:', searchParams)
      
      // Execute search via store
      await store.performSearch()

      // Navigate to results page
      const originCode =
        tripType === TripType.MultiCity
          ? legsPayload[0]?.origin || ''
          : from?.code || ''
      const destinationCode =
        tripType === TripType.MultiCity
          ? legsPayload[legsPayload.length - 1]?.destination || ''
          : to?.code || ''
      const departDateStr =
        tripType === TripType.MultiCity
          ? legsPayload[0]?.departDate || ''
          : departDate?.toISOString().split('T')[0] || ''
      
      router.push(
        `/flights/results?trip=${tripType}&from=${originCode}&to=${destinationCode}&date=${departDateStr}&adults=${adults}&children=${children}&infants=${infants}`
      )
      return
    } catch (err: any) {
      console.error("❌ Search error details:", err)
      
      // Handle different types of errors
      if (err.response?.data) {
        const errorData = err.response.data
        if (errorData.suggestions) {
          setError(`${errorData.message}. ${errorData.suggestions.join(', ')}`)
        } else {
          setError(errorData.message || "Search failed. Please try again.")
        }
      } else if (err.message?.includes('Network') || err.message?.includes('Failed to fetch')) {
        setError("Connection error. Please check your internet and try again.")
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError("Authentication error. Please refresh and try again.")
      } else if (err.message?.includes('400') || err.message?.includes('validation')) {
        setError("Please check your search criteria and try again.")
      } else {
        setError(`Unable to search flights. ${err.message || 'Please try again.'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const showReturnDate = tripType === TripType.RoundTrip

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const inputVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 backdrop-blur-sm bg-white/95">
          {/* Trip Type Tabs */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <TripTabs />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 shadow-sm"
            >
              <div className="flex-shrink-0 text-red-500 font-bold text-lg">⚠️</div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Search Issue</div>
                <div>{error}</div>
              </div>
            </motion.div>
          )}

          {/* Main Search Form */}
          <form onSubmit={handleSearch}>
            <motion.div
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 sm:space-y-0"
            >
              {/* Route Selection */}
              {isMultiCity ? (
                <motion.div variants={itemVariants} className="space-y-4">
                  {multiCityLegs.map((leg, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end border border-gray-100 rounded-2xl p-4 bg-slate-50/60"
                    >
                      <div className="sm:col-span-1 hidden sm:flex">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                          <span className="text-lg">✈️</span>
                          <span>From</span>
                        </label>
                        <div className="relative group">
                          <AirportInput
                            value={leg.from?.code || ''}
                            onChange={(value) => handleMultiOriginChange(index, value)}
                            placeholder="Departure city"
                          />
                          {leg.from?.code && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-md">
                              {leg.from.code}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-emerald-200 transition-colors pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <span>To</span>
                        </label>
                        <div className="relative group">
                          <AirportInput
                            value={leg.to?.code || ''}
                            onChange={(value) => handleMultiDestinationChange(index, value)}
                            placeholder="Arrival city"
                          />
                          {leg.to?.code && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ruby-600 font-bold text-sm bg-ruby-50 px-2 py-1 rounded-md">
                              {leg.to.code}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-ruby-200 transition-colors pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                          <span className="text-lg">📅</span>
                          <span>Depart</span>
                        </label>
                        <div className="relative group">
                          <DateInput
                            value={
                              leg.departDate
                                ? leg.departDate.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(value) => handleMultiDateChange(index, value)}
                            placeholder="Pick date"
                          />
                          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-colors pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        {multiCityLegs.length > 2 && index >= 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveLeg(index)}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleAddLeg}
                      disabled={multiCityLegs.length >= 5}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      + Add another city
                    </Button>
                    {validationErrors.multiCity && (
                      <span className="text-sm text-red-600 font-medium">
                        {validationErrors.multiCity}
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
                  {/* From */}
                  <div className="sm:col-span-5">
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">✈️</span>
                      <span>From</span>
                      {validationErrors.origin && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    <div className="relative group">
                      <AirportInput
                        value={from?.code || ''}
                        onChange={handleOriginChange}
                        placeholder="Departure city"
                      />
                      {from?.code && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-md">
                          {from.code}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-emerald-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="sm:col-span-2 flex justify-center">
                    <SwapButton legIndex={0} />
                  </div>

                  {/* To */}
                  <div className="sm:col-span-5">
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <span>To</span>
                      {validationErrors.destination && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    <div className="relative group">
                      <AirportInput
                        value={to?.code || ''}
                        onChange={handleDestinationChange}
                        placeholder="Arrival city"
                      />
                      {to?.code && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ruby-600 font-bold text-sm bg-ruby-50 px-2 py-1 rounded-md">
                          {to.code}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-ruby-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Date, Travellers, Class, Search Row */}
              {isMultiCity ? (
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4">
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">👥</span>
                      <span>Travellers</span>
                      {validationErrors.travellers && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    <div className="relative group">
                      <TravellerPopover />
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">💺</span>
                      <span>Class</span>
                    </label>
                    <div className="relative group">
                      <CabinSelector isCompact={true} />
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-[#E0115F] to-[#C70A51] hover:from-[#C70A51] hover:to-[#A60841] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Search className="h-5 w-5" />
                      <span className="text-sm">{isLoading ? 'Searching...' : 'Search Flights'}</span>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={itemVariants}
                  className={`grid grid-cols-1 sm:gap-4 ${
                    showReturnDate ? 'sm:grid-cols-12' : 'sm:grid-cols-10'
                  }`}
                >
                  {/* Departure Date */}
                  <div className={showReturnDate ? 'sm:col-span-2' : 'sm:col-span-2'}>
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">📅</span>
                      <span>Depart</span>
                      {validationErrors.departDate && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    <div className="relative group">
                      <DateInput
                        value={departDate?.toISOString().split('T')[0] || ''}
                        onChange={handleDepartDateChange}
                        placeholder="Pick date"
                      />
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Return Date (if Round Trip) */}
                  {showReturnDate && (
                    <div className="sm:col-span-2">
                      <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                        <span className="text-lg">🔄</span>
                        <span>Return</span>
                        {validationErrors.returnDate && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <div className="relative group">
                        <DateInput
                          value={returnDate?.toISOString().split('T')[0] || ''}
                          onChange={handleReturnDateChange}
                          placeholder="Return date"
                        />
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-colors pointer-events-none"></div>
                      </div>
                    </div>
                  )}

                  {/* Travellers */}
                  <div className={showReturnDate ? 'sm:col-span-2' : 'sm:col-span-2'}>
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">👥</span>
                      <span>Travellers</span>
                      {validationErrors.travellers && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    <div className="relative group">
                      <TravellerPopover />
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Class */}
                  <div className={showReturnDate ? 'sm:col-span-2' : 'sm:col-span-2'}>
                    <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                      <span className="text-lg">💺</span>
                      <span>Class</span>
                    </label>
                    <div className="relative group">
                      <CabinSelector isCompact={true} />
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-200 transition-colors pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className={showReturnDate ? 'sm:col-span-2' : 'sm:col-span-2'}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-[#E0115F] to-[#C70A51] hover:from-[#C70A51] hover:to-[#A60841] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Search className="h-5 w-5" />
                      <span className="text-sm">{isLoading ? 'Searching...' : 'Search Flights'}</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Validation Errors */}
              {Object.keys(validationErrors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 space-y-2 mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-sm"
                >
                  <div className="font-semibold flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <span>Please fix the following issues:</span>
                  </div>
                  <div className="space-y-1">
                    {Object.values(validationErrors).map((err, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </form>

          {/* Quick Links Section */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span>Popular Destinations</span>
              </p>
              <div className="text-xs text-gray-500">Tap to search</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-left transition-all border border-blue-200 hover:border-blue-300 hover:shadow-md group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✈️</div>
                <div className="text-sm font-bold text-gray-800">New York</div>
                <div className="text-xs text-gray-600">From ₹45,000</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-left transition-all border border-purple-200 hover:border-purple-300 hover:shadow-md group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏖️</div>
                <div className="text-sm font-bold text-gray-800">Dubai</div>
                <div className="text-xs text-gray-600">From ₹25,000</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-left transition-all border border-green-200 hover:border-green-300 hover:shadow-md group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏨</div>
                <div className="text-sm font-bold text-gray-800">Hotels</div>
                <div className="text-xs text-gray-600">Best Deals</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-left transition-all border border-amber-200 hover:border-amber-300 hover:shadow-md group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎫</div>
                <div className="text-sm font-bold text-gray-800">Deals</div>
                <div className="text-xs text-gray-600">Today Only</div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
