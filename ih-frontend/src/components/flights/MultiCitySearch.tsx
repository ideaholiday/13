'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Minus, 
  Plane, 
  MapPin, 
  Calendar, 
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AirportInput } from './AirportInput'
import { DateInput } from './DateInput'
import { useFlightStore } from '@/lib/stores/consolidated-flight-store'

interface MultiCityLeg {
  id: string
  origin: string
  destination: string
  departDate: string
}

interface MultiCitySearchProps {
  className?: string
}

export function MultiCitySearch({ className = '' }: MultiCitySearchProps) {
  const store = useFlightStore()
  const [legs, setLegs] = useState<MultiCityLeg[]>([
    { id: '1', origin: '', destination: '', departDate: '' },
    { id: '2', origin: '', destination: '', departDate: '' }
  ])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const addLeg = () => {
    if (legs.length >= 6) return
    
    const newLeg: MultiCityLeg = {
      id: Date.now().toString(),
      origin: '',
      destination: '',
      departDate: ''
    }
    
    setLegs([...legs, newLeg])
  }

  const removeLeg = (legId: string) => {
    if (legs.length <= 2) return
    
    setLegs(legs.filter(leg => leg.id !== legId))
  }

  const updateLeg = (legId: string, field: keyof MultiCityLeg, value: string) => {
    setLegs(legs.map(leg => 
      leg.id === legId ? { ...leg, [field]: value } : leg
    ))
  }

  const copyPreviousLeg = (legId: string) => {
    const legIndex = legs.findIndex(leg => leg.id === legId)
    if (legIndex === 0) return
    
    const previousLeg = legs[legIndex - 1]
    updateLeg(legId, 'origin', previousLeg.destination)
    updateLeg(legId, 'departDate', previousLeg.departDate)
  }

  const validateLegs = () => {
    const errors: Record<string, string> = {}
    
    legs.forEach((leg, index) => {
      if (!leg.origin) {
        errors[`${leg.id}-origin`] = `Please select departure city for leg ${index + 1}`
      }
      if (!leg.destination) {
        errors[`${leg.id}-destination`] = `Please select arrival city for leg ${index + 1}`
      }
      if (leg.origin === leg.destination) {
        errors[`${leg.id}-same`] = `Departure and arrival cities must be different for leg ${index + 1}`
      }
      if (!leg.departDate) {
        errors[`${leg.id}-date`] = `Please select departure date for leg ${index + 1}`
      }
      
      // Check date sequence
      if (index > 0) {
        const currentDate = new Date(leg.departDate)
        const previousDate = new Date(legs[index - 1].departDate)
        
        if (currentDate <= previousDate) {
          errors[`${leg.id}-sequence`] = `Departure date must be after previous leg`
        }
        
        // Check minimum layover (2 hours)
        const layoverHours = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60)
        if (layoverHours < 2) {
          errors[`${leg.id}-layover`] = `Minimum 2 hours layover required`
        }
        
        // Check maximum layover (24 hours)
        if (layoverHours > 24) {
          errors[`${leg.id}-max-layover`] = `Maximum 24 hours layover allowed`
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const calculateTotalDuration = () => {
    if (legs.length < 2) return ''
    
    const firstDate = new Date(legs[0].departDate)
    const lastDate = new Date(legs[legs.length - 1].departDate)
    const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return `${totalDays} days`
  }

  const calculateTotalDistance = () => {
    // Mock distance calculation
    return `${legs.length * 500} km`
  }

  const legVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Multi-City Trip</h3>
          <p className="text-sm text-gray-600">Plan your journey with multiple stops</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{legs.length} legs</Badge>
          <Badge variant="secondary">{calculateTotalDuration()}</Badge>
        </div>
      </div>

      {/* Legs */}
      <div className="space-y-4">
        <AnimatePresence>
          {legs.map((leg, index) => (
            <motion.div
              key={leg.id}
              variants={legVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Card className="relative">
                <CardContent className="p-6">
                  {/* Leg Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Leg {index + 1}</h4>
                        {index > 0 && (
                          <p className="text-xs text-gray-500">
                            Layover: {calculateLayoverTime(index)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPreviousLeg(leg.id)}
                          className="text-xs"
                        >
                          Copy Previous
                        </Button>
                      )}
                      {legs.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLeg(leg.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Leg Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* From */}
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Plane className="h-4 w-4 text-blue-600" />
                        <span>From</span>
                        {validationErrors[`${leg.id}-origin`] && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <AirportInput
                        value={leg.origin}
                        onChange={(value) => updateLeg(leg.id, 'origin', value)}
                        placeholder="Departure city"
                      />
                    </div>

                    {/* Arrow */}
                    <div className="lg:col-span-1 flex items-end justify-center">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* To */}
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>To</span>
                        {validationErrors[`${leg.id}-destination`] && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <AirportInput
                        value={leg.destination}
                        onChange={(value) => updateLeg(leg.id, 'destination', value)}
                        placeholder="Arrival city"
                      />
                    </div>

                    {/* Date */}
                    <div className="lg:col-span-3">
                      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>Date</span>
                        {validationErrors[`${leg.id}-date`] && <span className="text-red-500 text-xs">*</span>}
                      </label>
                      <DateInput
                        value={leg.departDate}
                        onChange={(value) => updateLeg(leg.id, 'departDate', value)}
                        placeholder="Pick date"
                      />
                    </div>
                  </div>

                  {/* Validation Errors for this leg */}
                  {Object.keys(validationErrors).some(key => key.startsWith(leg.id)) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div className="text-sm text-red-700">
                          {Object.keys(validationErrors)
                            .filter(key => key.startsWith(leg.id))
                            .map(key => validationErrors[key])
                            .map((error, idx) => (
                              <div key={idx}>• {error}</div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Leg Button */}
      {legs.length < 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={addLeg}
            className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Leg ({legs.length}/6)
          </Button>
        </motion.div>
      )}

      {/* Trip Summary */}
      {legs.length >= 2 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Trip Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Total Duration: {calculateTotalDuration()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    <span>Total Distance: {calculateTotalDistance()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Stops: {legs.length - 1}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {legs.length} Legs
                </div>
                <div className="text-sm text-gray-600">
                  Multi-city trip
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Please fix the following issues:</h4>
                <div className="space-y-1 text-sm text-red-700">
                  {Object.values(validationErrors).map((error, idx) => (
                    <div key={idx}>• {error}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  function calculateLayoverTime(index: number): string {
    if (index === 0) return ''
    
    const currentDate = new Date(legs[index].departDate)
    const previousDate = new Date(legs[index - 1].departDate)
    const layoverHours = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60)
    
    if (layoverHours < 24) {
      return `${Math.round(layoverHours)}h`
    } else {
      const days = Math.floor(layoverHours / 24)
      const hours = Math.round(layoverHours % 24)
      return `${days}d ${hours}h`
    }
  }
}
