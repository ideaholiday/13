'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plane,
  Clock,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Star,
  Loader
} from 'lucide-react'
import type { Flight, FlightSearchParams } from '@/types'
import { FlightResultCard } from '@/components/flights/flight-result-card-enhanced'
import type { FlightResult } from '@/types/tbo-flight-data'
import { searchFlights as apiSearchFlights } from '@/lib/flight-api'

// Real flight search API - calls Laravel backend directly
const searchFlights = async (params: URLSearchParams): Promise<{ outbound: Flight[]; inbound: Flight[] | null; multiCity: Flight[][] | null; traceId: string | null }> => {
  const tripType = params.get('tripType') || 'oneway'
  
  console.log('[Flight Search] Calling backend API with params:', Object.fromEntries(params.entries()))

  try {
    // Map URL params to backend API format
    const cabinMap: Record<string, 'E' | 'PE' | 'B' | 'F'> = {
      'economy': 'E',
      'premium_economy': 'PE',
      'business': 'B',
      'first': 'F'
    }
    
    const tripTypeMap: Record<string, 'O' | 'R'> = {
      'oneway': 'O',
      'roundtrip': 'R'
    }
    
    const origin = params.get('from') || params.get('origin') || ''
    const destination = params.get('to') || params.get('destination') || ''
    const departDate = params.get('departureDate') || params.get('departDate') || ''
    const returnDate = params.get('returnDate') || undefined
    const cabin = params.get('class') || params.get('cabinClass') || 'economy'
    const cabinClass = cabinMap[cabin.toLowerCase()] || 'E'
    const trip = params.get('tripType') || 'oneway'
    const mappedTripType = tripTypeMap[trip.toLowerCase()] || 'O'
    
    // Call the direct backend API
    const result = await apiSearchFlights({
      origin,
      destination,
      departDate,
      returnDate,
      tripType: mappedTripType,
      adults: parseInt(params.get('adults') || '1'),
      children: parseInt(params.get('children') || '0'),
      infants: parseInt(params.get('infants') || '0'),
      cabinClass
    })

    console.log('[Flight Search] Backend API Response:', result)

    if (!result.success) {
      throw new Error(result.message || 'Flight search failed')
    }

    // Transform backend response to frontend format
    return transformBackendResponse(result.data, tripType)
  } catch (error) {
    console.error('[Flight Search] Error:', error)
    throw error
  }
}

// Note: cabin/tripType alias mapping is handled server-side in the proxy route

// Transform backend TBO response to frontend Flight format
function transformBackendResponse(data: any, tripType: string): { outbound: Flight[]; inbound: Flight[] | null; multiCity: Flight[][] | null; traceId: string | null } {
  // Prefer flattened alias set by backend AirService::applyMarkupToSearchResults
  let results: any[] = []
  if (Array.isArray(data?.results)) {
    results = data.results
  } else if (Array.isArray(data?.Results)) {
    results = data.Results
  } else if (Array.isArray(data?.Response?.Results)) {
    const raw = data.Response.Results
    // TBO may return 2D array (array of groups) — flatten
    if (Array.isArray(raw[0])) {
      results = raw.flat()
    } else {
      results = raw
    }
  }

  const transformedFlights = results.map((backendFlight: any) => transformBackendFlight(backendFlight))

  const traceId: string | null = data?.traceId || data?.Response?.TraceId || data?.TraceId || data?.SessionId || null

  return {
    outbound: transformedFlights,
    inbound: tripType === 'roundtrip' ? [] : null,
    multiCity: tripType === 'multicity' ? [[]] : null,
    traceId,
  }
}

// Transform single backend flight to frontend Flight type
function transformBackendFlight(backendFlight: any): Flight {
  // Handle TBO FlightResult structure with nested segments
  // TBO structure: Segments is 2D array [[seg1, seg2], [seg3, seg4]] or flat array
  const segments = backendFlight.Segments || []
  const allSegs = Array.isArray(segments[0]) ? segments.flat() : segments
  
  const firstSeg = allSegs[0] || {}
  const lastSeg = allSegs[allSegs.length - 1] || {}

  // Extract airline information
  const airlineCode = firstSeg?.Airline?.AirlineCode || 'XX'
  const airlineName = firstSeg?.Airline?.AirlineName || getAirlineName(airlineCode)
  
  // Extract pricing information - TBO uses nested Fare structure
  const fare = backendFlight.Fare || {}
  const totalPrice = fare.OfferedFare || fare.PublishedFare || fare.TotalFare || 0
  const baseFare = fare.BaseFare || 0

  return {
    id: backendFlight.ResultIndex?.toString() || Math.random().toString(36),
    airline: {
      code: airlineCode,
      name: airlineName,
      logo: `/api/placeholder/40/40?airline=${airlineCode}`,
    },
    aircraft: {
      code: firstSeg?.Craft || 'B738',
      name: getAircraftName(firstSeg?.Craft || 'B738'),
      manufacturer: 'Aircraft',
    },
    segments: allSegs.map((seg: any) => ({
      id: `seg-${Math.random()}`,
      airline: {
        code: seg?.Airline?.AirlineCode || airlineCode,
        name: seg?.Airline?.AirlineName || getAirlineName(seg?.Airline?.AirlineCode || airlineCode),
        logo: `/api/placeholder/40/40?airline=${seg?.Airline?.AirlineCode}`,
      },
      flightNumber: seg?.Airline?.FlightNumber || 'XX000',
      aircraft: {
        code: seg?.Craft || 'B738',
        name: getAircraftName(seg?.Craft || 'B738'),
        manufacturer: 'Aircraft',
      },
      // FIXED: Extract from TBO's nested Origin/Destination structure
      origin: {
        code: seg?.Origin?.Airport?.AirportCode || '',
        iata: seg?.Origin?.Airport?.AirportCode || '',
        name: seg?.Origin?.Airport?.AirportName || 'Airport',
        city: seg?.Origin?.Airport?.CityCode || '',
        country: seg?.Origin?.Airport?.CountryName || 'India',
        timezone: 'Asia/Kolkata',
      },
      destination: {
        code: seg?.Destination?.Airport?.AirportCode || '',
        iata: seg?.Destination?.Airport?.AirportCode || '',
        name: seg?.Destination?.Airport?.AirportName || 'Airport',
        city: seg?.Destination?.Airport?.CityCode || '',
        country: seg?.Destination?.Airport?.CountryName || 'India',
        timezone: 'Asia/Kolkata',
      },
      // FIXED: Extract from TBO's DepTime/ArrTime
      departure: seg?.Origin?.DepTime ? new Date(seg.Origin.DepTime) : new Date(),
      arrival: seg?.Destination?.ArrTime ? new Date(seg.Destination.ArrTime) : new Date(),
      duration: seg?.Duration || 0,
      stops: [],
      baggage: {
        checkedBags: parseBaggageWeight(seg?.Baggage || '15'),
        cabinBag: parseBaggageWeight(seg?.CabinBaggage || '7'),
        personalItem: 1,
      },
    })),
    price: {
      total: totalPrice,
      base: baseFare,
      taxes: totalPrice - baseFare,
      currency: fare?.Currency || 'INR',
    },
    availability: {
      totalSeats: 180,
      availableSeats: Math.max(1, firstSeg?.NoOfSeatAvailable || 9),
    },
    amenities: [],
    bookingClass: 'economy',
  }
}

// Helper function to get airline name from code
function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'AI': 'Air India',
    '6E': 'IndiGo',
    'SG': 'SpiceJet',
    'UK': 'Vistara',
    'G8': 'Go First',
    '9W': 'Jet Airways',
    'I5': 'AirAsia India',
  }
  return airlines[code] || 'Unknown Airline'
}

// Helper function to get aircraft name from code
function getAircraftName(code: string): string {
  const aircraft: Record<string, string> = {
    'B738': 'Boeing 737-800',
    'B787': 'Boeing 787 Dreamliner',
    'B777': 'Boeing 777',
    'A320': 'Airbus A320',
    'A380': 'Airbus A380',
    'AT76': 'ATR 72-600',
    'Q400': 'Bombardier Q400',
  }
  return aircraft[code] || code || 'Aircraft'
}

// Helper function to parse baggage weight from string (e.g., "15 KG" -> 15)
function parseBaggageWeight(baggage: string): number {
  if (!baggage) return 0
  const match = baggage.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

// Helper function to calculate duration in minutes
function calculateDuration(departure: string, arrival: string): number {
  const dep = new Date(departure)
  const arr = new Date(arrival)
  return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60))
}

// Fallback mock function (only used if backend is not available)
const searchFlightsMock = async (params: URLSearchParams): Promise<{ outbound: Flight[]; inbound: Flight[] | null; multiCity: Flight[][] | null }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Check if this is a multi-city search
  const tripType = params.get('tripType')
  const isMultiCity = tripType === 'multicity'
  
  if (isMultiCity) {
    // Handle multi-city search
    const legs: Flight[][] = []
    let legIndex = 1
    
    while (params.get(`leg${legIndex}_from`)) {
      const from = params.get(`leg${legIndex}_from`)
      const to = params.get(`leg${legIndex}_to`)
      const date = params.get(`leg${legIndex}_date`)
      
      if (from && to && date) {
        // Generate flights for this leg
        const legFlights: Flight[] = [
          {
            id: `FL${legIndex}01`,
            airline: { code: 'AI', name: 'Air India', logo: '/api/placeholder/40/40' },
            aircraft: { code: 'B737', name: 'Boeing 737-800', manufacturer: 'Boeing' },
            segments: [
              {
                id: `SEG${legIndex}01`,
                airline: { code: 'AI', name: 'Air India', logo: '/api/placeholder/40/40' },
                flightNumber: `AI ${100 + legIndex * 10}`,
                aircraft: { code: 'B737', name: 'Boeing 737-800', manufacturer: 'Boeing' },
                origin: { code: from, iata: from, name: `${from} Airport`, city: from, country: 'India', timezone: 'Asia/Kolkata' },
                destination: { code: to, iata: to, name: `${to} Airport`, city: to, country: 'India', timezone: 'Asia/Kolkata' },
                departure: new Date(`${date}T08:00:00`),
                arrival: new Date(`${date}T10:15:00`),
                duration: 135,
                stops: [],
                baggage: { checkedBags: 1, cabinBag: 1, personalItem: 1 }
              }
            ],
            price: { total: 5499 + (legIndex * 200), base: 4200, taxes: 1299, currency: 'INR' },
            availability: { totalSeats: 180, availableSeats: 45 },
            amenities: ['wifi', 'meals', 'entertainment'],
            bookingClass: 'economy'
          },
          {
            id: `FL${legIndex}02`,
            airline: { code: '6E', name: 'IndiGo', logo: '/api/placeholder/40/40' },
            aircraft: { code: 'A320', name: 'Airbus A320', manufacturer: 'Airbus' },
            segments: [
              {
                id: `SEG${legIndex}02`,
                airline: { code: '6E', name: 'IndiGo', logo: '/api/placeholder/40/40' },
                flightNumber: `6E ${120 + legIndex * 10}`,
                aircraft: { code: 'A320', name: 'Airbus A320', manufacturer: 'Airbus' },
                origin: { code: from, iata: from, name: `${from} Airport`, city: from, country: 'India', timezone: 'Asia/Kolkata' },
                destination: { code: to, iata: to, name: `${to} Airport`, city: to, country: 'India', timezone: 'Asia/Kolkata' },
                departure: new Date(`${date}T14:30:00`),
                arrival: new Date(`${date}T16:55:00`),
                duration: 145,
                stops: [],
                baggage: { checkedBags: 1, cabinBag: 1, personalItem: 1 }
              }
            ],
            price: { total: 4899 + (legIndex * 150), base: 3800, taxes: 1099, currency: 'INR' },
            availability: { totalSeats: 180, availableSeats: 67 },
            amenities: ['wifi', 'meals'],
            bookingClass: 'economy'
          }
        ]
        legs.push(legFlights)
      }
      legIndex++
    }
    
    return { outbound: [], inbound: null, multiCity: legs }
  }
  
  // Get origin and destination from search params
  const from = params.get('from') || 'DEL'
  const to = params.get('to') || 'BOM'
  const departureDate = params.get('departureDate') || '2024-01-15'
  const returnDate = params.get('returnDate')
  
  const outbound: Flight[] = [
    {
      id: 'FL001',
      airline: { code: 'AI', name: 'Air India', logo: '/api/placeholder/40/40' },
      aircraft: { code: 'B737', name: 'Boeing 737-800', manufacturer: 'Boeing' },
      segments: [
        {
          id: 'SEG001',
          airline: { code: 'AI', name: 'Air India', logo: '/api/placeholder/40/40' },
          flightNumber: 'AI 101',
          aircraft: { code: 'B737', name: 'Boeing 737-800', manufacturer: 'Boeing' },
          origin: { code: from, iata: from, name: `${from} Airport`, city: from, country: 'India', timezone: 'Asia/Kolkata' },
          destination: { code: to, iata: to, name: `${to} Airport`, city: to, country: 'India', timezone: 'Asia/Kolkata' },
          departure: new Date(`${departureDate}T08:00:00`),
          arrival: new Date(`${departureDate}T10:15:00`),
          duration: 135,
          stops: [],
          baggage: { checkedBags: 1, cabinBag: 1, personalItem: 1 }
        }
      ],
      price: { total: 5499, base: 4200, taxes: 1299, currency: 'INR' },
      availability: { totalSeats: 180, availableSeats: 45 },
      amenities: ['wifi', 'meals', 'entertainment'],
      bookingClass: 'economy'
    },
    {
      id: 'FL002',
      airline: { code: '6E', name: 'IndiGo', logo: '/api/placeholder/40/40' },
      aircraft: { code: 'A320', name: 'Airbus A320', manufacturer: 'Airbus' },
      segments: [
        {
          id: 'SEG002',
          airline: { code: '6E', name: 'IndiGo', logo: '/api/placeholder/40/40' },
          flightNumber: '6E 123',
          aircraft: { code: 'A320', name: 'Airbus A320', manufacturer: 'Airbus' },
          origin: { code: from, iata: from, name: `${from} Airport`, city: from, country: 'India', timezone: 'Asia/Kolkata' },
          destination: { code: to, iata: to, name: `${to} Airport`, city: to, country: 'India', timezone: 'Asia/Kolkata' },
          departure: new Date(`${departureDate}T14:30:00`),
          arrival: new Date(`${departureDate}T16:55:00`),
          duration: 145,
          stops: [],
          baggage: { checkedBags: 1, cabinBag: 1, personalItem: 1 }
        }
      ],
      price: { total: 4899, base: 3800, taxes: 1099, currency: 'INR' },
      availability: { totalSeats: 180, availableSeats: 67 },
      amenities: ['wifi', 'meals'],
      bookingClass: 'economy'
    },
    {
      id: 'FL003',
      airline: { code: 'SG', name: 'SpiceJet', logo: '/api/placeholder/40/40' },
      aircraft: { code: 'B737', name: 'Boeing 737-800', manufacturer: 'Boeing' },
      segments: [
        {
          id: 'SEG003',
          airline: { code: 'SG', name: 'SpiceJet', logo: '/api/placeholder/40/40' },
          flightNumber: 'SG 456',
          aircraft: { code: 'B737', name: 'Boeing 737-800', manufacturer: 'Boeing' },
          origin: { code: from, iata: from, name: `${from} Airport`, city: from, country: 'India', timezone: 'Asia/Kolkata' },
          destination: { code: to, iata: to, name: `${to} Airport`, city: to, country: 'India', timezone: 'Asia/Kolkata' },
          departure: new Date(`${departureDate}T18:45:00`),
          arrival: new Date(`${departureDate}T21:10:00`),
          duration: 145,
          stops: [],
          baggage: { checkedBags: 1, cabinBag: 1, personalItem: 1 }
        }
      ],
      price: { total: 4299, base: 3400, taxes: 899, currency: 'INR' },
      availability: { totalSeats: 189, availableSeats: 23 },
      amenities: ['meals'],
      bookingClass: 'economy'
    }
  ]

  // If returnDate is present, generate inbound flights (swap origin/destination, use returnDate)
  let inbound: Flight[] | null = null
  if (returnDate) {
    // Use the returnDate from params, fallback to a default if not present
    // Format: YYYY-MM-DD, so we can safely use it in new Date()
    inbound = outbound.map((f, i) => {
      // Use the same time offsets as outbound, but on the return date
      // Outbound times: 08:00, 14:30, 18:45
      // We'll use 11:00, 14:00, 16:00 for inbound for variety
      const returnTimes = [
        { dep: '11:00', arr: '13:15' },
        { dep: '14:00', arr: '16:15' },
        { dep: '16:00', arr: '18:15' }
      ]
      const t = returnTimes[i % returnTimes.length]
      return {
        ...f,
        id: f.id + '-R',
        segments: f.segments.map(seg => ({
          ...seg,
          id: seg.id + '-R',
          origin: { ...seg.destination },
          destination: { ...seg.origin },
          departure: new Date(`${returnDate}T${t.dep}:00`),
          arrival: new Date(`${returnDate}T${t.arr}:00`),
        })),
      }
    })
  }
  return { outbound, inbound, multiCity: null }
}

export function FlightSearchResults() {
  const [traceId, setTraceId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null)
  const [selectedInbound, setSelectedInbound] = useState<Flight | null>(null)
  const [selectedMultiCityFlights, setSelectedMultiCityFlights] = useState<(Flight | null)[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [detailsFlight, setDetailsFlight] = useState<Flight | null>(null)
  
  const tripType = searchParams?.get('tripType') || 'oneway'
  const isMultiCity = tripType === 'multicity'
  
  const { data, isLoading, error } = useQuery<{ outbound: Flight[]; inbound: Flight[] | null; multiCity: Flight[][] | null; traceId: string | null }>({
    queryKey: ['flights', searchParams?.toString()],
    queryFn: async () => {
      toast.loading('Searching for the best flight deals...', { id: 'flight-search' })
      try {
        const results = await searchFlights(searchParams || new URLSearchParams())
        setTraceId(results.traceId || null)
        const total = results.outbound.length + (results.inbound?.length || 0)
        toast.success(`Found ${total} flights for your journey`, { id: 'flight-search' })
        return results
      } catch (error) {
        toast.error('Failed to search flights. Please try again.', { id: 'flight-search' })
        throw error
      }
    },
    enabled: !!searchParams
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const handleSelectFlight = (flight: Flight, type: 'outbound' | 'inbound') => {
    if (type === 'outbound') {
      setSelectedOutbound(flight)
    } else {
      setSelectedInbound(flight)
    }
  }

  const handleSelectMultiCityFlight = (legIndex: number, flight: Flight) => {
    const newSelections = [...selectedMultiCityFlights]
    newSelections[legIndex] = flight
    setSelectedMultiCityFlights(newSelections)
  }

  const getMultiCityRouteInfo = () => {
    const legs: Array<{ from: string | null; to: string | null; date: string | null }> = []
    let legIndex = 1
    while (searchParams?.get(`leg${legIndex}_from`)) {
      legs.push({
        from: searchParams.get(`leg${legIndex}_from`),
        to: searchParams.get(`leg${legIndex}_to`),
        date: searchParams.get(`leg${legIndex}_date`)
      })
      legIndex++
    }
    return legs
  }

  const handleBookMultiCity = () => {
    const routeInfo = getMultiCityRouteInfo()
    
    // Check if all legs have selected flights
    if (selectedMultiCityFlights.length !== routeInfo.length || 
        selectedMultiCityFlights.some(flight => !flight)) {
      alert('Please select flights for all legs')
      return
    }

    try {
      const bookingParams = new URLSearchParams({
        tripType: 'multicity',
        adults: searchParams?.get('adults') || '1',
        children: searchParams?.get('children') || '0',
        infants: searchParams?.get('infants') || '0',
        class: searchParams?.get('class') || 'economy'
      })

      // Add leg data
      routeInfo.forEach((leg, index) => {
        if (leg.from && leg.to && leg.date) {
          bookingParams.append(`leg${index + 1}_from`, leg.from)
          bookingParams.append(`leg${index + 1}_to`, leg.to)
          bookingParams.append(`leg${index + 1}_date`, leg.date)
          bookingParams.append(`leg${index + 1}_flightId`, selectedMultiCityFlights[index]!.id)
        }
      })

  // Store selected flights and trace context for booking
      localStorage.setItem('selectedMultiCityFlights', JSON.stringify(selectedMultiCityFlights))
  if (traceId) localStorage.setItem('flightTraceId', traceId)
      
      toast.success('Selected all flights. Redirecting to booking...')
      router.push(`/flights/book?${bookingParams.toString()}`)
    } catch (error) {
      toast.error('Unable to proceed with booking. Please try again.')
      console.error('Multi-city booking error:', error)
    }
  }

  const handleBookRoundTrip = () => {
    if (!selectedOutbound || !selectedInbound) {
      alert('Please select both outbound and return flights')
      return
    }

    try {
      const bookingParams = new URLSearchParams({
        outboundFlightId: selectedOutbound.id,
        inboundFlightId: selectedInbound.id,
        origin: searchParams?.get('from') || selectedOutbound.segments[0].origin.code,
        destination: searchParams?.get('to') || selectedOutbound.segments[0].destination.code,
        departureDate: searchParams?.get('departureDate') || selectedOutbound.segments[0].departure.toISOString().split('T')[0],
        returnDate: searchParams?.get('returnDate') || selectedInbound.segments[0].departure.toISOString().split('T')[0],
        adults: searchParams?.get('adults') || '1',
        children: searchParams?.get('children') || '0',
        infants: searchParams?.get('infants') || '0',
        class: searchParams?.get('class') || 'economy'
      })

  // Store both flights and trace context for booking
      localStorage.setItem('selectedOutboundFlight', JSON.stringify(selectedOutbound))
      localStorage.setItem('selectedInboundFlight', JSON.stringify(selectedInbound))
  if (traceId) localStorage.setItem('flightTraceId', traceId)
      
      toast.success('Selected both flights. Redirecting to booking...')
      router.push(`/flights/book?${bookingParams.toString()}`)
    } catch (error) {
      toast.error('Unable to proceed with booking. Please try again.')
      console.error('Booking error:', error)
    }
  }

  const handleBookFlight = (flight: Flight) => {
    try {
      // Store selected flight and search params for booking
      const bookingParams = new URLSearchParams({
        flightId: flight.id,
        origin: searchParams?.get('from') || flight.segments[0].origin.code,
        destination: searchParams?.get('to') || flight.segments[0].destination.code,
        departureDate: searchParams?.get('departureDate') || flight.segments[0].departure.toISOString().split('T')[0],
        ...(searchParams?.get('returnDate') ? { returnDate: searchParams.get('returnDate') as string } : {}),
        adults: searchParams?.get('adults') || '1',
        children: searchParams?.get('children') || '0',
        infants: searchParams?.get('infants') || '0',
        class: searchParams?.get('class') || 'economy'
      })

  // Store flight data and trace context in localStorage for the booking page
      localStorage.setItem('selectedFlight', JSON.stringify(flight))
  if (traceId) localStorage.setItem('flightTraceId', traceId)
      
      // Show success toast
      toast.success(`Selected ${flight.airline.name} flight. Redirecting to booking...`)
      
      // Navigate to booking page
      router.push(`/flights/book?${bookingParams.toString()}`)
    } catch (error) {
      toast.error('Unable to proceed with booking. Please try again.')
      console.error('Booking error:', error)
    }
  }

  const handleModifySearch = () => {
    // Redirect back to flights page with current search parameters
    const currentParams = new URLSearchParams()
    
    // Add all current search parameters
    if (searchParams) {
      searchParams.forEach((value, key) => {
        currentParams.set(key, value)
      })
    }
    
    // Navigate to flights page with search parameters
    router.push(`/flights?${currentParams.toString()}`)
  }

  const handleViewDetails = (flight: Flight) => {
    setDetailsFlight(flight)
    setShowDetails(true)
  }

  const sortedOutbound = useMemo(() => {
    if (!data?.outbound) return [] as Flight[]
    const copy = [...data.outbound]
    copy.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.total - b.price.total
        case 'duration':
          return a.segments[0].duration - b.segments[0].duration
        case 'departure':
          return a.segments[0].departure.getTime() - b.segments[0].departure.getTime()
        default:
          return 0
      }
    })
    return copy
  }, [data, sortBy])

  const sortedInbound = useMemo(() => {
    if (!data?.inbound) return null
    const copy = [...data.inbound]
    copy.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.total - b.price.total
        case 'duration':
          return a.segments[0].duration - b.segments[0].duration
        case 'departure':
          return a.segments[0].departure.getTime() - b.segments[0].departure.getTime()
        default:
          return 0
      }
    })
    return copy
  }, [data, sortBy])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sapphire-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-sapphire-900 mb-2">Searching Flights...</h2>
            <p className="text-slate-600">Finding the best deals for your journey</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Search Error</h2>
        <p className="text-slate-600">Unable to fetch flight results. Please try again.</p>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-sapphire-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Searching for the best flight deals...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    const errorMessage = error ? (error as any)?.message || 'An error occurred while searching for flights. Please try again.' : 'Unknown error'
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Flight Search Failed</h2>
            <p className="text-red-700 mb-4">
              {errorMessage}
            </p>
            <Button 
              onClick={handleModifySearch}
              className="w-full bg-ruby-600 hover:bg-ruby-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Flight Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flight Details</DialogTitle>
          </DialogHeader>
          {detailsFlight ? (
            <div>
              <div className="mb-2 font-semibold text-sapphire-900">{detailsFlight.airline.name} {detailsFlight.segments[0].flightNumber}</div>
              <div className="mb-1 text-sm text-slate-700">{detailsFlight.segments[0].origin.code} → {detailsFlight.segments[0].destination.code}</div>
              <div className="mb-1 text-sm">Departure: {formatTime(detailsFlight.segments[0].departure)} | Arrival: {formatTime(detailsFlight.segments[0].arrival)}</div>
              <div className="mb-1 text-sm">Duration: {formatDuration(detailsFlight.segments[0].duration)}</div>
              <div className="mb-1 text-sm">Aircraft: {detailsFlight.aircraft.name}</div>
              <div className="mb-1 text-sm">Amenities: {detailsFlight.amenities.join(', ')}</div>
              <div className="mb-1 text-sm">Price: ₹{detailsFlight.price.total.toLocaleString()} {detailsFlight.price.currency}</div>
            </div>
          ) : null}
          <DialogClose asChild>
            <button className="mt-4 px-4 py-2 rounded bg-sapphire-600 text-white hover:bg-sapphire-700">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {/* Search Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              {isMultiCity ? (
                <div>
                  <h1 className="text-2xl font-bold text-sapphire-900 mb-2">Multi-City Flight Search</h1>
                  <div className="text-slate-600">
                    {getMultiCityRouteInfo().map((leg, index) => (
                      <div key={index} className="text-sm">
                        {leg.from} → {leg.to} ({leg.date})
                      </div>
                    ))}
                    <div className="mt-1">
                      {searchParams?.get('adults')} Adult
                      {parseInt(searchParams?.get('adults') || '1') > 1 ? 's' : ''} • {searchParams?.get('class')}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-sapphire-900 mb-2">
                    {searchParams?.get('from')} → {searchParams?.get('to')}
                    {searchParams?.get('returnDate') && (
                      <span className="text-lg font-normal text-slate-600 ml-2">
                        (Round Trip)
                      </span>
                    )}
                  </h1>
                  <p className="text-slate-600">
                    {searchParams?.get('departureDate')}
                    {searchParams?.get('returnDate') ? ` → ${searchParams.get('returnDate')}` : ''}
                    {' '}• {searchParams?.get('adults')} Adult
                    {parseInt(searchParams?.get('adults') || '1') > 1 ? 's' : ''} • {searchParams?.get('class')}
                  </p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleModifySearch}>
              Modify Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sapphire-400"
            >
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration</option>
              <option value="departure">Departure Time</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          {isMultiCity ? 
            `${data?.multiCity?.reduce((acc, leg) => acc + leg.length, 0) || 0} flights found` :
            `${(sortedOutbound.length || 0) + (sortedInbound?.length || 0)} flights found`
          }
        </p>
      </div>

      {/* Multi-City Results */}
      {isMultiCity && data?.multiCity && (
        <div className="space-y-6">
          {data.multiCity.map((legFlights, legIndex) => {
            const routeInfo = getMultiCityRouteInfo()
            const legInfo = routeInfo[legIndex]
            if (!legInfo) return null
            
            return (
              <div key={legIndex} className="space-y-4">
                <h2 className="text-lg font-semibold text-sapphire-800 mb-2">
                  Leg {legIndex + 1}: {legInfo.from} → {legInfo.to} ({legInfo.date})
                </h2>
                {legFlights.map((flight) => (
                  <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Airline Info */}
                        <div className="lg:col-span-2 flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Plane className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sapphire-900">{flight.airline.name}</p>
                            <p className="text-sm text-slate-500">{flight.segments[0].flightNumber}</p>
                          </div>
                        </div>
                        {/* Flight Times */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-lg font-bold text-sapphire-900">
                                {formatTime(flight.segments[0].departure)}
                              </p>
                              <p className="text-sm text-slate-500">{flight.segments[0].origin.code}</p>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="flex items-center justify-center text-slate-400">
                                <div className="flex-1 border-t border-dashed"></div>
                                <div className="mx-2 text-xs bg-slate-100 px-2 py-1 rounded">
                                  {formatDuration(flight.segments[0].duration)}
                                </div>
                                <div className="flex-1 border-t border-dashed"></div>
                              </div>
                              <p className="text-center text-xs text-slate-500 mt-1">Non-stop</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-sapphire-900">
                                {formatTime(flight.segments[0].arrival)}
                              </p>
                              <p className="text-sm text-slate-500">{flight.segments[0].destination.code}</p>
                            </div>
                          </div>
                        </div>
                        {/* Amenities */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {flight.amenities.includes('wifi') && (
                              <Badge variant="secondary" className="text-xs">WiFi</Badge>
                            )}
                            {flight.amenities.includes('meals') && (
                              <Badge variant="secondary" className="text-xs">Meals</Badge>
                            )}
                            {flight.amenities.includes('entertainment') && (
                              <Badge variant="secondary" className="text-xs">Entertainment</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {flight.availability.availableSeats} seats left
                          </p>
                        </div>
                        {/* Price and Select */}
                        <div className="lg:col-span-4 flex items-center justify-between">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-sapphire-900">
                              ₹{flight.price.total.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-500">per person</p>
                          </div>
                          <div className="flex flex-col gap-2 ml-6">
                            <Button 
                              size="sm" 
                              className={`${selectedMultiCityFlights[legIndex]?.id === flight.id ? 'bg-green-600 hover:bg-green-700' : 'bg-ruby-600 hover:bg-ruby-700'}`}
                              onClick={() => handleSelectMultiCityFlight(legIndex, flight)}
                            >
                              {selectedMultiCityFlights[legIndex]?.id === flight.id ? 'Selected' : 'Select'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(flight)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Regular Outbound Results (for one-way and round-trip) */}
      {!isMultiCity && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-sapphire-800 mb-2">Outbound Flight</h2>
          {sortedOutbound.map((flight) => (
          <Card key={flight.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Airline Info */}
                <div className="lg:col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sapphire-900">{flight.airline.name}</p>
                    <p className="text-sm text-slate-500">{flight.segments[0].flightNumber}</p>
                  </div>
                </div>
                {/* Flight Times */}
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-lg font-bold text-sapphire-900">
                        {formatTime(flight.segments[0].departure)}
                      </p>
                      <p className="text-sm text-slate-500">{flight.segments[0].origin.code}</p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-center text-slate-400">
                        <div className="flex-1 border-t border-dashed"></div>
                        <div className="mx-2 text-xs bg-slate-100 px-2 py-1 rounded">
                          {formatDuration(flight.segments[0].duration)}
                        </div>
                        <div className="flex-1 border-t border-dashed"></div>
                      </div>
                      <p className="text-center text-xs text-slate-500 mt-1">Non-stop</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-sapphire-900">
                        {formatTime(flight.segments[0].arrival)}
                      </p>
                      <p className="text-sm text-slate-500">{flight.segments[0].destination.code}</p>
                    </div>
                  </div>
                </div>
                {/* Amenities */}
                <div className="lg:col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {flight.amenities.includes('wifi') && (
                      <Badge variant="secondary" className="text-xs">WiFi</Badge>
                    )}
                    {flight.amenities.includes('meals') && (
                      <Badge variant="secondary" className="text-xs">Meals</Badge>
                    )}
                    {flight.amenities.includes('entertainment') && (
                      <Badge variant="secondary" className="text-xs">Entertainment</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {flight.availability.availableSeats} seats left
                  </p>
                </div>
                {/* Price and Book */}
                <div className="lg:col-span-4 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-sapphire-900">
                      ₹{flight.price.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">per person</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    {searchParams?.get('returnDate') ? (
                      <Button 
                        size="sm" 
                        className={`${selectedOutbound?.id === flight.id ? 'bg-green-600 hover:bg-green-700' : 'bg-ruby-600 hover:bg-ruby-700'}`}
                        onClick={() => handleSelectFlight(flight, 'outbound')}
                      >
                        {selectedOutbound?.id === flight.id ? 'Selected' : 'Select'}
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-ruby-600 hover:bg-ruby-700"
                        onClick={() => handleBookFlight(flight)}
                      >
                        Book Now
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(flight)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Inbound Results (if roundtrip) */}
      {!isMultiCity && searchParams?.get('returnDate') && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-sapphire-800 mb-2">Return Flight</h2>
          {sortedInbound && sortedInbound.length > 0 ? (
            sortedInbound.map((flight) => (
              <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Airline Info */}
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Plane className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sapphire-900">{flight.airline.name}</p>
                        <p className="text-sm text-slate-500">{flight.segments[0].flightNumber}</p>
                      </div>
                    </div>
                    {/* Flight Times */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-lg font-bold text-sapphire-900">
                            {formatTime(flight.segments[0].departure)}
                          </p>
                          <p className="text-sm text-slate-500">{flight.segments[0].origin.code}</p>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center justify-center text-slate-400">
                            <div className="flex-1 border-t border-dashed"></div>
                            <div className="mx-2 text-xs bg-slate-100 px-2 py-1 rounded">
                              {formatDuration(flight.segments[0].duration)}
                            </div>
                            <div className="flex-1 border-t border-dashed"></div>
                          </div>
                          <p className="text-center text-xs text-slate-500 mt-1">Non-stop</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-sapphire-900">
                            {formatTime(flight.segments[0].arrival)}
                          </p>
                          <p className="text-sm text-slate-500">{flight.segments[0].destination.code}</p>
                        </div>
                      </div>
                    </div>
                    {/* Amenities */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {flight.amenities.includes('wifi') && (
                          <Badge variant="secondary" className="text-xs">WiFi</Badge>
                        )}
                        {flight.amenities.includes('meals') && (
                          <Badge variant="secondary" className="text-xs">Meals</Badge>
                        )}
                        {flight.amenities.includes('entertainment') && (
                          <Badge variant="secondary" className="text-xs">Entertainment</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {flight.availability.availableSeats} seats left
                      </p>
                    </div>
                    {/* Price and Book */}
                    <div className="lg:col-span-4 flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-sapphire-900">
                          ₹{flight.price.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500">per person</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-6">
                        <Button 
                          size="sm" 
                          className={`${selectedInbound?.id === flight.id ? 'bg-green-600 hover:bg-green-700' : 'bg-ruby-600 hover:bg-ruby-700'}`}
                          onClick={() => handleSelectFlight(flight, 'inbound')}
                        >
                          {selectedInbound?.id === flight.id ? 'Selected' : 'Select'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(flight)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-600 mb-2">No return flights found</h2>
              <p className="text-slate-500">Try adjusting your search criteria or dates</p>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!isMultiCity && sortedOutbound.length === 0 && (!sortedInbound || sortedInbound.length === 0) && (
        <div className="text-center py-12">
          <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">No flights found</h2>
          <p className="text-slate-500">Try adjusting your search criteria or dates</p>
        </div>
      )}

      {/* Multi-city No Results */}
      {isMultiCity && (!data?.multiCity || data.multiCity.length === 0) && (
        <div className="text-center py-12">
          <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">No multi-city flights found</h2>
          <p className="text-slate-500">Try adjusting your search criteria or dates</p>
        </div>
      )}

      {/* Round-trip Booking Summary */}
      {!isMultiCity && searchParams?.get('returnDate') && (selectedOutbound || selectedInbound) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-sm">
                  <p className="font-medium text-sapphire-900">Round Trip Selection</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className={`flex items-center gap-2 ${selectedOutbound ? 'text-green-600' : 'text-slate-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${selectedOutbound ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                      <span>Outbound {selectedOutbound ? '✓' : ''}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${selectedInbound ? 'text-green-600' : 'text-slate-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${selectedInbound ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                      <span>Return {selectedInbound ? '✓' : ''}</span>
                    </div>
                  </div>
                </div>
                {selectedOutbound && selectedInbound && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-sapphire-900">
                      Total: ₹{(selectedOutbound.price.total + selectedInbound.price.total).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">for {searchParams?.get('adults') || '1'} adult(s)</p>
                  </div>
                )}
              </div>
              <Button 
                size="lg"
                className="bg-ruby-600 hover:bg-ruby-700"
                onClick={handleBookRoundTrip}
                disabled={!selectedOutbound || !selectedInbound}
              >
                Book Round Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-city Booking Summary */}
      {isMultiCity && selectedMultiCityFlights.some(flight => flight !== null) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-sm">
                  <p className="font-medium text-sapphire-900">Multi-City Selection</p>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {getMultiCityRouteInfo().map((leg, index) => (
                      <div key={index} className={`flex items-center gap-2 ${selectedMultiCityFlights[index] ? 'text-green-600' : 'text-slate-500'}`}>
                        <div className={`w-3 h-3 rounded-full ${selectedMultiCityFlights[index] ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                        <span>Leg {index + 1} {selectedMultiCityFlights[index] ? '✓' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedMultiCityFlights.every(flight => flight !== null) && selectedMultiCityFlights.length > 0 && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-sapphire-900">
                      Total: ₹{selectedMultiCityFlights.reduce((total, flight) => total + (flight?.price.total || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">for {searchParams?.get('adults') || '1'} adult(s)</p>
                  </div>
                )}
              </div>
              <Button 
                size="lg"
                className="bg-ruby-600 hover:bg-ruby-700"
                onClick={handleBookMultiCity}
                disabled={!selectedMultiCityFlights.every(flight => flight !== null) || selectedMultiCityFlights.length === 0}
              >
                Book Multi-City
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}