'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, Calendar, Search, Plane, Hotel, Package, MapPin, X, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'

import { TravellersClassPopover } from './TravellersClassPopover'
import { SpecialFareChips } from './SpecialFareChips'
import { useFlightSearchStore, TripType } from '@/lib/stores/flightSearch'
import { trackSearch } from '@/lib/track'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'

// Static airport data
const STATIC_AIRPORTS = [
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
  { code: 'BOM', name: 'Bombay High Sea', city: 'Mumbai', country: 'India' },
  { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India' },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
  { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose', city: 'Kolkata', country: 'India' },
  { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India' },
  { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India' },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India' },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel', city: 'Ahmedabad', country: 'India' },
]

interface AirportOption {
  code: string
  name: string
  city: string
  country: string
}

interface UnifiedFlightSearchProps {
  variant?: 'homepage' | 'page'
  className?: string
}

function AirportInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: AirportOption | null
  onChange: (airport: AirportOption | null) => void
  label: string
  placeholder: string
}) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<AirportOption[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)

    if (!val.trim()) {
      setSuggestions([])
      return
    }

    const lowerVal = val.toLowerCase()
    const filtered = STATIC_AIRPORTS.filter(
      (a) => a.city.toLowerCase().includes(lowerVal) || a.code.toLowerCase().includes(lowerVal)
    ).slice(0, 5)
    setSuggestions(filtered)
  }

  const handleSelect = (airport: AirportOption) => {
    onChange(airport)
    setInput(airport.city)
    setIsOpen(false)
    setSuggestions([])
  }

  return (
    <div className="space-y-2 relative">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <MapPin className="w-4 h-4" />
        </div>
        <Input
          type="text"
          value={input || value?.city || ''}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true)
            if (input) handleInputChange({ target: { value: input } } as any)
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-9 pr-8 h-12 rounded-lg border border-slate-200 focus:border-sapphire-500 focus:ring-2 focus:ring-sapphire-100"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => {
              onChange(null)
              setInput('')
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {suggestions.map((airport) => (
            <button
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="w-full px-4 py-3 text-left hover:bg-sapphire-50 border-b border-slate-100 last:border-b-0 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-slate-900 text-sm">{airport.city}</div>
                <div className="text-xs text-slate-500">{airport.code} • {airport.name}</div>
              </div>
              <span className="text-xs font-bold bg-sapphire-100 text-sapphire-700 px-2 py-1 rounded">
                {airport.code}
              </span>
            </button>
          ))}
        </div>
      )}

      {value && (
        <div className="text-sm font-medium text-slate-900">
          {value.city} <span className="text-slate-500">— {value.code}</span>
        </div>
      )}
    </div>
  )
}

export function UnifiedFlightSearch({ variant = 'homepage', className }: UnifiedFlightSearchProps) {
  const router = useRouter()
  const {
    tripType,
    origin,
    destination,
    departDate,
    returnDate,
    passengers,
    cabin,
    specialFare,
    setTripType,
    setOrigin,
    setDestination,
    setDepartDate,
    setReturnDate,
    setPassengers,
    setCabin,
    setSpecialFare,
    swapAirports,
    isValid,
  } = useFlightSearchStore()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('flights')

  const handleSearch = () => {
    const newErrors: Record<string, string> = {}

    if (!origin) newErrors.origin = 'Please select departure'
    if (!destination) newErrors.destination = 'Please select arrival'
    if (origin && destination && origin.code === destination.code) {
      newErrors.destination = 'Must be different from departure'
    }
    if (!departDate) newErrors.departDate = 'Select departure date'
    if (tripType === 'ROUND_TRIP' && !returnDate) {
      newErrors.returnDate = 'Select return date'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && isValid()) {
      // Track search event
      trackSearch.performed('flight', {
        origin: origin?.code,
        destination: destination?.code,
        trip_type: tripType,
        depart_date: departDate,
        return_date: returnDate,
        passengers: {
          adults: passengers.adults,
          children: passengers.children,
          infants: passengers.infants
        },
        cabin_class: cabin,
        special_fare: specialFare
      })

      // Build search parameters for the API
      const searchParams = new URLSearchParams()
      searchParams.set('from', origin?.code || '')
      searchParams.set('to', destination?.code || '')
      searchParams.set('depart', departDate || '')
      if (returnDate) searchParams.set('return', returnDate)
      searchParams.set('adults', passengers.adults.toString())
      searchParams.set('children', passengers.children.toString())
      searchParams.set('infants', passengers.infants.toString())
      searchParams.set('cabin', cabin)
      searchParams.set('fare', specialFare)
      searchParams.set('trip', tripType)

      router.push(`/flights/results?${searchParams.toString()}`)
    }
  }

  const handleTripTypeChange = (type: TripType) => {
    if (type === 'MULTI_CITY') {
      toast.error('Multi-city search coming soon!')
      return
    }
    setTripType(type)
  }

  const isHomepage = variant === 'homepage'

  return (
    <div className={cn('w-full max-w-7xl mx-auto', className)}>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Service Tabs Header - MakeMyTrip Style */}
        <div className="bg-white px-6 py-4 border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-1 py-2 text-sapphire-600 border-b-2 border-sapphire-600 font-semibold whitespace-nowrap">
              <Plane className="w-5 h-5" />
              <span>Flights</span>
            </button>
            <button className="flex items-center gap-2 px-1 py-2 text-slate-600 hover:text-slate-900 font-medium whitespace-nowrap opacity-60">
              <Hotel className="w-5 h-5" />
              <span>Hotels</span>
            </button>
            <button className="flex items-center gap-2 px-1 py-2 text-slate-600 hover:text-slate-900 font-medium whitespace-nowrap opacity-60">
              <Home className="w-5 h-5" />
              <span>Homestays & Villas</span>
            </button>
            <button className="flex items-center gap-2 px-1 py-2 text-slate-600 hover:text-slate-900 font-medium whitespace-nowrap opacity-60">
              <Package className="w-5 h-5" />
              <span>Holiday Packages</span>
            </button>
            <button className="flex items-center gap-2 px-1 py-2 text-slate-600 hover:text-slate-900 font-medium whitespace-nowrap opacity-60">
              <span>✈</span>
              <span>Trains</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'flights' && (
          <div className="p-8 space-y-6">
            {/* Trip Type Selection - MakeMyTrip Style */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleTripTypeChange('ONE_WAY')}
                className={cn(
                  'flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200',
                  tripType === 'ONE_WAY'
                    ? 'bg-white text-sapphire-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange('ROUND_TRIP')}
                className={cn(
                  'flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200',
                  tripType === 'ROUND_TRIP'
                    ? 'bg-white text-sapphire-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange('MULTI_CITY')}
                className={cn(
                  'flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200',
                  tripType === 'MULTI_CITY'
                    ? 'bg-white text-sapphire-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                Multi City
              </button>
            </div>

            {/* Form Grid - MakeMyTrip Style */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* From Airport */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">From</label>
                <AirportInput
                  value={origin}
                  onChange={setOrigin}
                  label=""
                  placeholder="Departure city"
                />
                {errors.origin && <p className="text-xs text-red-600">{errors.origin}</p>}
              </div>

              {/* Swap Button */}
              <div className="flex items-end justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapAirports}
                  className="h-12 w-12 rounded-full hover:bg-blue-50 hover:border-blue-300 flex-shrink-0"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </Button>
              </div>

              {/* To Airport */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">To</label>
                <AirportInput
                  value={destination}
                  onChange={setDestination}
                  label=""
                  placeholder="Destination city"
                />
                {errors.destination && <p className="text-xs text-red-600">{errors.destination}</p>}
              </div>

              {/* Departure Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Departure</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left h-12 px-4 rounded-lg',
                        !departDate && 'text-slate-500',
                        errors.departDate && 'border-red-500'
                      )}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {departDate ? dayjs(departDate).format('DD MMM\'YY') : 'yyyy-mm-dd'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={departDate ? new Date(departDate) : undefined}
                      onSelect={(date) => {
                        if (date) setDepartDate(dayjs(date).format('YYYY-MM-DD'))
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.departDate && <p className="text-xs text-red-600">{errors.departDate}</p>}
              </div>

              {/* Return Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Return</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left h-12 px-4 rounded-lg',
                        tripType === 'ONE_WAY' && 'opacity-50 cursor-not-allowed bg-slate-50',
                        !returnDate && 'text-slate-500',
                        errors.returnDate && 'border-red-500'
                      )}
                      disabled={tripType === 'ONE_WAY'}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {returnDate ? dayjs(returnDate).format('DD MMM\'YY') : 'yyyy-mm-dd'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={returnDate ? new Date(returnDate) : undefined}
                      onSelect={(date) => {
                        if (date) setReturnDate(dayjs(date).format('YYYY-MM-DD'))
                      }}
                      disabled={(date) => {
                        if (!departDate) return date < new Date()
                        return date < new Date(departDate)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {tripType === 'ROUND_TRIP' && !returnDate && (
                  <p className="text-xs text-blue-600">Tap to add a return date for bigger discounts</p>
                )}
                {errors.returnDate && <p className="text-xs text-red-600">{errors.returnDate}</p>}
              </div>
            </div>

            {/* Travellers & Class Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TravellersClassPopover
                passengers={passengers}
                cabin={cabin}
                onPassengersChange={setPassengers}
                onCabinChange={setCabin}
              />
              <div></div>
            </div>

            {/* Special Fares Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Select a special fare</label>
              <SpecialFareChips
                selectedFare={specialFare}
                onFareChange={setSpecialFare}
              />
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSearch}
                disabled={!isValid()}
                className={cn(
                  'h-14 px-16 text-lg font-bold rounded-lg flex items-center justify-center gap-2',
                  'bg-blue-600 hover:bg-blue-700 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Search className="w-5 h-5" />
                Search Flights
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
