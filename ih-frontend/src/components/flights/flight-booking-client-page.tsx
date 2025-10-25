'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { NavigationHeader } from '@/components/shared/navigation'
import { FlightBookingForm } from './flight-booking-form'
import type { Flight } from '@/types'

interface FlightBookingClientPageProps {
  searchParams: {
    flightId?: string
    origin?: string
    destination?: string
    departureDate?: string
    returnDate?: string
    adults?: string
    children?: string
    infants?: string
    class?: string
    tripType?: string
  }
}

export function FlightBookingClientPage({ searchParams }: FlightBookingClientPageProps) {
  const router = useRouter()
  const [flightDetails, setFlightDetails] = useState<any>(null)
  const [returnFlightDetails, setReturnFlightDetails] = useState<any>(null)
  const [multiCityFlights, setMultiCityFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isRoundTrip = !!searchParams.returnDate
  const isMultiCity = searchParams.tripType === 'multicity'

  useEffect(() => {
    if (isMultiCity) {
      // Handle multi-city bookings
      const multiCityData = localStorage.getItem('selectedMultiCityFlights')
      
      if (multiCityData) {
        try {
          const multiCityFlights: Flight[] = JSON.parse(multiCityData)
          const convertedFlights = multiCityFlights.map((flight, index) => {
            if (!flight) return null
            return {
              ...convertFlightToBookingFormat(flight),
              legIndex: index + 1,
              legInfo: {
                from: searchParams[`leg${index + 1}_from` as keyof typeof searchParams] || flight.segments[0].origin.code,
                to: searchParams[`leg${index + 1}_to` as keyof typeof searchParams] || flight.segments[0].destination.code,
                date: searchParams[`leg${index + 1}_date` as keyof typeof searchParams] || flight.segments[0].departure.toISOString().split('T')[0]
              }
            }
          }).filter(Boolean)
          
          setMultiCityFlights(convertedFlights)
          // Set the first flight as primary for navigation display
          if (convertedFlights.length > 0) {
            setFlightDetails(convertedFlights[0])
          }
        } catch (error) {
          console.error('Error parsing multi-city flights:', error)
          setFlightDetails(getMockFlightDetails())
        }
      } else {
        console.warn('Multi-city flights not found in localStorage')
        setFlightDetails(getMockFlightDetails())
      }
    } else if (isRoundTrip) {
      // Handle round-trip bookings
      const outboundData = localStorage.getItem('selectedOutboundFlight')
      const inboundData = localStorage.getItem('selectedInboundFlight')
      
      if (outboundData && inboundData) {
        try {
          const outboundFlight: Flight = JSON.parse(outboundData)
          const inboundFlight: Flight = JSON.parse(inboundData)
          
          setFlightDetails(convertFlightToBookingFormat(outboundFlight))
          setReturnFlightDetails(convertFlightToBookingFormat(inboundFlight))
        } catch (error) {
          console.error('Error parsing round-trip flights:', error)
          setFlightDetails(getMockFlightDetails())
        }
      } else {
        console.warn('Round-trip flights not found in localStorage')
        setFlightDetails(getMockFlightDetails())
      }
    } else {
      // Handle one-way bookings
      const selectedFlightData = localStorage.getItem('selectedFlight')
      
      if (selectedFlightData) {
        try {
          const selectedFlight: Flight = JSON.parse(selectedFlightData)
          setFlightDetails(convertFlightToBookingFormat(selectedFlight))
        } catch (error) {
          console.error('Error parsing selected flight:', error)
          setFlightDetails(getMockFlightDetails())
        }
      } else {
        setFlightDetails(getMockFlightDetails())
      }
    }
    
    setLoading(false)
  }, [isRoundTrip, isMultiCity])

  const convertFlightToBookingFormat = (flight: Flight) => {
    return {
      id: flight.id,
      airline: {
        code: flight.airline.code,
        name: flight.airline.name,
        logo: flight.airline.logo
      },
      flightNumber: flight.segments[0].flightNumber,
      aircraft: flight.aircraft?.name || 'Aircraft',
      departure: {
        airport: flight.segments[0].origin.code,
        time: new Date(flight.segments[0].departure).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        date: new Date(flight.segments[0].departure).toISOString().split('T')[0],
        terminal: 'T2'
      },
      arrival: {
        airport: flight.segments[0].destination.code,
        time: new Date(flight.segments[0].arrival).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        date: new Date(flight.segments[0].arrival).toISOString().split('T')[0],
        terminal: 'T2'
      },
      duration: flight.segments[0].duration,
      price: {
        base: flight.price.base,
        taxes: flight.price.taxes,
        total: flight.price.total,
        currency: flight.price.currency
      },
      baggage: flight.segments[0].baggage || {
        checkedBags: 1,
        cabinBag: 1,
        weight: '15kg'
      },
      amenities: flight.amenities || [],
      refundable: false,
      bookingClass: flight.bookingClass || 'economy'
    }
  }

  const getMockFlightDetails = () => {
    return {
      id: searchParams.flightId || 'flight-1',
      airline: {
        code: '6E',
        name: 'IndiGo',
        logo: '/images/airlines/indigo.png'
      },
      flightNumber: '6E 123',
      aircraft: 'Airbus A320',
      departure: {
        airport: searchParams.origin || 'DEL',
        time: '10:30',
        date: searchParams.departureDate || '2024-12-15',
        terminal: 'T2'
      },
      arrival: {
        airport: searchParams.destination || 'BOM',
        time: '12:45',
        date: searchParams.departureDate || '2024-12-15',
        terminal: 'T2'
      },
      duration: 135,
      price: {
        base: 20000,
        taxes: 5000,
        total: 25000,
        currency: 'INR'
      },
      baggage: {
        checkedBags: 1,
        cabinBag: 1,
        weight: '15kg'
      },
      amenities: ['Wi-Fi', 'In-flight Entertainment', 'Meals'],
      refundable: false,
      bookingClass: searchParams.class || 'economy'
    }
  }

  // Parse passengers from URL params
  const parsedPassengers = {
    adults: parseInt(searchParams.adults || '1'),
    children: parseInt(searchParams.children || '0'),
    infants: parseInt(searchParams.infants || '0')
  }

  const formattedSearchParams = {
    ...searchParams,
    passengers: parsedPassengers
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-64 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavigationHeader
        title="Complete Your Booking"
        subtitle={
          <div>
            Enter passenger details to proceed with your flight reservation
            <div className="flex items-center mt-2 text-sm text-slate-500">
              {isMultiCity ? (
                <>
                  <span>Multi-City Journey</span>
                  <span className="mx-2">•</span>
                  <span>{multiCityFlights.length} Flights</span>
                </>
              ) : isRoundTrip ? (
                <>
                  <span>{flightDetails.departure.airport} ⇄ {flightDetails.arrival.airport}</span>
                  <span className="mx-2">•</span>
                  <span>{flightDetails.departure.date} - {returnFlightDetails?.departure.date}</span>
                  <span className="mx-2">•</span>
                  <span>Round Trip</span>
                </>
              ) : (
                <>
                  <span>{flightDetails.departure.airport} → {flightDetails.arrival.airport}</span>
                  <span className="mx-2">•</span>
                  <span>{flightDetails.departure.date}</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span>{parsedPassengers.adults + parsedPassengers.children + parsedPassengers.infants} Passenger(s)</span>
            </div>
            {isMultiCity && (
              <div className="mt-1 text-xs text-slate-500">
                {multiCityFlights.map((flight, index) => (
                  <span key={index}>
                    {flight.legInfo.from} → {flight.legInfo.to}
                    {index < multiCityFlights.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        }
        backLabel="Back to Search Results"
      >
        <div className="text-right">
          <p className="text-sm text-slate-500">Booking Reference</p>
          <p className="font-mono text-sapphire-900">{flightDetails.id.toUpperCase()}</p>
        </div>
      </NavigationHeader>

      <FlightBookingForm 
        flightDetails={flightDetails}
        returnFlightDetails={returnFlightDetails}
        multiCityFlights={multiCityFlights}
        searchParams={formattedSearchParams}
      />
    </>
  )
}