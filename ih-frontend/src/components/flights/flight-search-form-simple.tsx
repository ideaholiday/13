'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightSearchStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AirportSelector } from './airport-selector'
import { 
  Plane, 
  ArrowUpDown, 
  Plus, 
  Minus, 
  Calendar,
  MapPin,
  Users,
  X,
  Route
} from 'lucide-react'
import type { TripType, Airport, TravelClass, FlightLeg } from '@/types'

export function FlightSearchForm() {
  const router = useRouter()
  const { 
    tripType,
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    travelClass,
    legs,
    setTripType,
    setOrigin,
    setDestination,
    swapOriginDestination,
    setDepartureDate,
    setReturnDate,
    setPassengers,
    setTravelClass,
    setLegs,
    addLeg,
    removeLeg,
    updateLeg,
    showTravelersPopover,
    setShowTravelersPopover,
    getSearchParams
  } = useFlightSearchStore()

  // Initialize legs for multi-city when switching to multicity
  useEffect(() => {
    if (tripType === 'multicity' && legs.length === 0) {
      // Create initial 2 legs for multi-city
      const leg1: FlightLeg = {
        id: `leg-${Date.now()}-1`,
        origin: origin || null as any,
        destination: destination || null as any,
        departureDate: departureDate ? new Date(departureDate) : new Date()
      }
      const leg2: FlightLeg = {
        id: `leg-${Date.now()}-2`,
        origin: destination || null as any,
        destination: null as any,
        departureDate: departureDate ? new Date(new Date(departureDate).getTime() + 24 * 60 * 60 * 1000) : new Date()
      }
      setLegs([leg1, leg2])
    }
  }, [tripType, legs.length, origin, destination, departureDate, setLegs])

  // Safely convert a Date or date-like value to yyyy-mm-dd for input[type=date]
  const toDateInputValue = (d: unknown): string => {
    if (!d) return ''
    try {
      const date = d instanceof Date ? d : new Date(d as any)
      if (Number.isNaN(date.getTime())) return ''
      // Normalize to UTC to avoid timezone off-by-one in input value
      const y = date.getUTCFullYear()
      const m = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    } catch {
      return ''
    }
  }

  const handleTripTypeChange = (newTripType: TripType) => {
    setTripType(newTripType)
  }

  const handleSwap = () => {
    swapOriginDestination()
  }

  const updateTravelerCount = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    const current = passengers[type]
    const newCount = increment ? current + 1 : Math.max(type === 'adults' ? 1 : 0, current - 1)
    setPassengers({ ...passengers, [type]: newCount })
  }

  const handleSearch = () => {
    // For multi-city, validate legs instead of origin/destination
    if (tripType === 'multicity') {
      if (legs.length < 2) {
        alert('Multi-city search requires at least 2 legs')
        return
      }
      
      // Validate each leg
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i]
        if (!leg.origin || !leg.destination || !leg.departureDate) {
          alert(`Please complete all fields for leg ${i + 1}`)
          return
        }
        if (leg.origin.code === leg.destination.code) {
          alert(`Origin and destination cannot be the same for leg ${i + 1}`)
          return
        }
      }
      
      // Create URL params for multi-city search
      const urlParams = new URLSearchParams({
        tripType: tripType,
        adults: passengers.adults.toString(),
        children: passengers.children.toString(),
        infants: passengers.infants.toString(),
        class: travelClass
      })
      
      // Add leg data
      legs.forEach((leg, index) => {
        urlParams.append(`leg${index + 1}_from`, leg.origin.code)
        urlParams.append(`leg${index + 1}_to`, leg.destination.code)
        urlParams.append(`leg${index + 1}_date`, toDateInputValue(leg.departureDate))
      })
      
      router.push(`/flights/search?${urlParams.toString()}`)
      return
    }
    
    // Regular one-way/round-trip validation
    const searchParams = getSearchParams()
    if (!searchParams) {
      alert('Please fill in all required fields correctly')
      return
    }
    
    if (tripType === 'roundtrip' && !returnDate) {
      alert('Please select a return date')
      return
    }

    // Create URL params for navigation (safe date formatting)
    const dep = toDateInputValue(departureDate as unknown)
    const ret = toDateInputValue(returnDate as unknown)

    const urlParams = new URLSearchParams({
      tripType: tripType,
      from: origin?.code || '',
      to: destination?.code || '',
      departureDate: dep,
      ...(ret ? { returnDate: ret } : {}),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      infants: passengers.infants.toString(),
      class: travelClass
    })

    router.push(`/flights/search?${urlParams.toString()}`)
  }

  const getTotalTravelers = () => {
    return passengers.adults + passengers.children + passengers.infants
  }

  // Multi-city leg management functions
  const handleAddLeg = () => {
    if (legs.length < 6) {
      const lastLeg = legs[legs.length - 1]
      const newLeg: FlightLeg = {
        id: `leg-${Date.now()}`,
        origin: lastLeg?.destination || null as any,
        destination: null as any,
        departureDate: lastLeg?.departureDate ? 
          new Date(new Date(lastLeg.departureDate).getTime() + 24 * 60 * 60 * 1000) : 
          new Date()
      }
      addLeg()
      // Update the actual leg since addLeg creates a basic one
      const updatedLegs = [...legs, newLeg]
      setLegs(updatedLegs)
    }
  }

  const handleRemoveLeg = (index: number) => {
    if (legs.length > 2) {
      const newLegs = legs.filter((_, i) => i !== index)
      setLegs(newLegs)
    }
  }

  const handleUpdateLegOrigin = (index: number, airport: Airport | null) => {
    const newLegs = [...legs]
    if (newLegs[index]) {
      newLegs[index] = { ...newLegs[index], origin: airport as Airport }
      setLegs(newLegs)
    }
  }

  const handleUpdateLegDestination = (index: number, airport: Airport | null) => {
    const newLegs = [...legs]
    if (newLegs[index]) {
      newLegs[index] = { ...newLegs[index], destination: airport as Airport }
      setLegs(newLegs)
    }
  }

  const handleUpdateLegDate = (index: number, date: string) => {
    const newLegs = [...legs]
    if (newLegs[index]) {
      newLegs[index] = { ...newLegs[index], departureDate: new Date(date) }
      setLegs(newLegs)
    }
  }

  const tripTypes: { value: TripType; label: string }[] = [
    { value: 'oneway', label: 'One Way' },
    { value: 'roundtrip', label: 'Round Trip' },
    { value: 'multicity', label: 'Multi City' }
  ]

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-lg">
      <CardContent className="p-8">
        {/* Trip Type Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tripTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTripTypeChange(type.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tripType === type.value
                  ? 'bg-sapphire-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Flight Search Form */}
        {tripType === 'multicity' ? (
          // Multi-city legs interface
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Route className="h-5 w-5 text-sapphire-600" />
              <h3 className="text-lg font-medium text-slate-900">Flight Legs</h3>
              <span className="text-sm text-slate-500">({legs.length} of 6 legs)</span>
            </div>
            
            {legs.map((leg, index) => (
              <Card key={leg.id} className="border-2 border-slate-200 hover:border-sapphire-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900">Leg {index + 1}</h4>
                    {legs.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveLeg(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AirportSelector
                      label="From"
                      value={leg.origin}
                      onChange={(airport) => handleUpdateLegOrigin(index, airport)}
                      placeholder="Origin city"
                    />
                    
                    <AirportSelector
                      label="To"
                      value={leg.destination}
                      onChange={(airport) => handleUpdateLegDestination(index, airport)}
                      placeholder="Destination city"
                    />
                    
                    <div>
                      <Label htmlFor={`leg-${index}-date`} className="text-slate-600 mb-2 block">
                        Departure
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id={`leg-${index}-date`}
                          type="date"
                          value={toDateInputValue(leg.departureDate)}
                          onChange={(e) => handleUpdateLegDate(index, e.target.value)}
                          className="pl-10"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {legs.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLeg}
                className="w-full border-dashed border-2 border-sapphire-300 text-sapphire-600 hover:bg-sapphire-50 py-8"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Another Leg ({legs.length}/6)
              </Button>
            )}
          </div>
        ) : (
          // Regular one-way/round-trip interface
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
            <div className="md:col-span-3">
              <AirportSelector
                label="From"
                value={origin}
                onChange={setOrigin}
                placeholder="Origin city"
              />
            </div>

            <div className="md:col-span-1 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className="h-10 w-10 p-0 rounded-full"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:col-span-3">
              <AirportSelector
                label="To"
                value={destination}
                onChange={setDestination}
                placeholder="Destination city"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="departure" className="text-slate-600 mb-2 block">
                Departure
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="departure"
                  type="date"
                  value={toDateInputValue(departureDate as unknown)}
                  onChange={(e) => setDepartureDate(e.target.value ? new Date(e.target.value) : null)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {tripType === 'roundtrip' && (
              <div className="md:col-span-2">
                <Label htmlFor="return" className="text-slate-600 mb-2 block">
                  Return
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="return"
                    type="date"
                    value={toDateInputValue(returnDate as unknown)}
                    onChange={(e) => setReturnDate(e.target.value ? new Date(e.target.value) : null)}
                    className="pl-10"
                    min={toDateInputValue(departureDate as unknown) || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Travelers and Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Label className="text-slate-600 mb-2 block">Travelers</Label>
            <button
              type="button"
              onClick={() => setShowTravelersPopover(!showTravelersPopover)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sapphire-400 focus:ring-offset-2"
            >
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-slate-400" />
                <span>{getTotalTravelers()} Traveler{getTotalTravelers() !== 1 ? 's' : ''}</span>
              </div>
            </button>

            {showTravelersPopover && (
              <Card className="absolute z-10 mt-2 w-full shadow-lg">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Adults</p>
                        <p className="text-sm text-slate-500">12+ years</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateTravelerCount('adults', false)}
                          disabled={passengers.adults <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{passengers.adults}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateTravelerCount('adults', true)}
                          disabled={getTotalTravelers() >= 9}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Children</p>
                        <p className="text-sm text-slate-500">2-11 years</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateTravelerCount('children', false)}
                          disabled={passengers.children <= 0}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{passengers.children}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateTravelerCount('children', true)}
                          disabled={getTotalTravelers() >= 9}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Infants</p>
                        <p className="text-sm text-slate-500">Under 2 years</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateTravelerCount('infants', false)}
                          disabled={passengers.infants <= 0}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{passengers.infants}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateTravelerCount('infants', true)}
                          disabled={passengers.infants >= passengers.adults}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setShowTravelersPopover(false)}
                      className="w-full"
                      size="sm"
                    >
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Label htmlFor="class" className="text-slate-600 mb-2 block">
              Class
            </Label>
            <Select
              value={travelClass}
              onValueChange={(value) => setTravelClass(value as TravelClass)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="premium_economy">Premium Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSearch}
            size="lg"
            className="bg-gradient-to-r from-ruby-600 to-ruby-700 hover:from-ruby-700 hover:to-ruby-800 px-12 py-3 text-lg font-semibold"
          >
            <Plane className="mr-2 h-5 w-5" />
            Search Flights
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}