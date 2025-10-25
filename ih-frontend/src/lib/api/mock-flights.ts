/**
 * Mock flight data for development and demo purposes
 * These flights appear when the backend is unavailable
 */

import { FlightResult } from '@/lib/types/flight-booking'

export const generateMockFlights = (
  origin: string,
  destination: string,
  departDate: string
): FlightResult[] => {
  const baseTime = new Date(departDate)
  const flights: FlightResult[] = []

  // Generate 5-8 mock flights with variations
  const flightCount = 5 + Math.floor(Math.random() * 4)

  for (let i = 0; i < flightCount; i++) {
    // Random departure time between 6 AM and 11 PM
    const deptHour = 6 + Math.floor(Math.random() * 18)
    const deptMin = Math.floor(Math.random() * 60)

    // Flight duration 2-5 hours
    const durationHours = 2 + Math.floor(Math.random() * 4)
    const durationMin = Math.floor(Math.random() * 60)

    // Airlines
    const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Go First', 'Vistara', 'Qatar Airways']
    const airline = airlines[Math.floor(Math.random() * airlines.length)]

    // Prices vary
    const basePrice = 3000 + Math.floor(Math.random() * 10000)

    const deptTime = new Date(baseTime)
    deptTime.setHours(deptHour, deptMin)

    const arrivalTime = new Date(deptTime)
    arrivalTime.setHours(
      arrivalTime.getHours() + durationHours,
      arrivalTime.getMinutes() + durationMin
    )

    flights.push({
      id: `FL${i + 1}${Math.random().toString(36).substring(7).toUpperCase()}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${1000 + i}`,
      departure: {
        airport: origin,
        time: deptTime.toISOString(),
        terminal: `T${Math.floor(Math.random() * 3) + 1}`
      },
      arrival: {
        airport: destination,
        time: arrivalTime.toISOString(),
        terminal: `T${Math.floor(Math.random() * 3) + 1}`
      },
      duration: `${durationHours}h ${durationMin}m`,
      stops: Math.floor(Math.random() * 3), // 0, 1, or 2 stops
      price: basePrice,
      currency: 'INR',
      availableSeats: 20 + Math.floor(Math.random() * 80),
      cabinClass: 'E',
      baggage: {
        checked: 1,
        cabin: 1
      },
      amenities: [
        Math.random() > 0.5 ? 'WiFi' : undefined,
        Math.random() > 0.5 ? 'Meals' : undefined,
        Math.random() > 0.5 ? 'USB Charging' : undefined,
      ].filter(Boolean) as string[],
      refundable: Math.random() > 0.3,
      rescheduleAllowed: true,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0,
    } as unknown as FlightResult)
  }

  return flights
}

export const mockSearchResponse = (
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string
) => {
  const traceId = `TRACE${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`

  const outbound = generateMockFlights(origin, destination, departDate)
  const results: FlightResult[][] = [outbound]

  if (returnDate) {
    const returnFlights = generateMockFlights(destination, origin, returnDate)
    results.push(returnFlights)
  }

  return {
    success: true,
    data: {
      Response: {
        TraceId: traceId,
        Results: results,
      },
    },
  }
}
