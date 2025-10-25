import {
  SearchRequest,
  SearchResponse,
  RepriceRequest,
  RepriceResponse,
  FareRulesResponse,
  BookingRequest,
  BookingResponse,
  TicketRequest,
  TicketResponse,
} from '@/lib/types/flight-booking'
import { mockSearchResponse } from './mock-flights'

// Construct the full base URL with /api/v1 (support both env names)
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
const BASE_URL = apiBase.endsWith('/api/v1') 
  ? apiBase 
  : `${apiBase}/api/v1`

console.log('🔧 API Configuration:', { apiBase, BASE_URL })

// Helper to make authenticated requests
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
  try {
    console.log('API Request:', { url, options })
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    console.log('API Response Status:', response.status, response.statusText)

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`
      try {
        const error = await response.json()
        console.log('Error response body:', error)
        errorMessage = error.message || error.errors || errorMessage
      } catch (e) {
        console.log('Could not parse error response')
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('API Response Data:', data)
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ============================================================================
// SEARCH
// ============================================================================

export async function searchFlights(
  request: SearchRequest
): Promise<SearchResponse> {
  console.log('searchFlights called with:', request)
  
  // Transform to segments format as expected by backend
  const transformedRequest = {
    segments: request.legs.map(leg => ({
      origin: leg.origin,
      destination: leg.destination,
      departureDate: leg.departDate,
    })),
    tripType: request.tripType,
    adults: request.adults,
    children: request.children,
    infants: request.infants,
    cabinClass: request.cabinClass,
  }

  console.log('Transformed request:', transformedRequest)

  try {
    const response = await apiFetch<any>('/flights/search', {
      method: 'POST',
      body: JSON.stringify(transformedRequest),
    })
    
    console.log('Search API Response:', response)
    console.log('API Raw Response:', response)
    console.log('Flights Data Path:', (response as any)?.data?.Response?.Results)
    
    // Normalize response format
    let normalizedResponse: SearchResponse
    
    console.log('🔍 Response normalization check:', {
      hasSuccess: !!response?.success,
      successValue: response?.success,
      hasData: !!response?.data,
      hasResponse: !!response?.data?.Response,
      hasResults: !!response?.data?.Response?.Results,
      isResultsArray: Array.isArray(response?.data?.Response?.Results)
    })
    
    if (response?.success === true && response?.data?.Response?.Results) {
      // Backend returns { success: true, data: { Response: { Results: [...] } } }
      // But Results is a flat array, not nested [[outbound], [return]]
      console.log('✅ Using backend response format')
      
      // Convert flat array to nested array format expected by frontend
      const flatResults = response.data.Response.Results
      const nestedResults = [flatResults] // Wrap in array for outbound flights
      
      normalizedResponse = {
        success: true,
        data: {
          Response: {
            TraceId: response.data.Response.TraceId || '',
            Results: nestedResults
          }
        }
      } as SearchResponse
    } else if (response?.data?.Response) {
      // Alternative format
      console.log('✅ Using alternative response format')
      normalizedResponse = response as SearchResponse
    } else if (Array.isArray(response)) {
      // Array of results - wrap it
      console.log('✅ Wrapping array response')
      normalizedResponse = {
        success: true,
        data: {
          Response: {
            TraceId: '',
            Results: response
          }
        }
      } as unknown as SearchResponse
    } else {
      // Try to use as-is
      console.log('⚠️ Using response as-is')
      normalizedResponse = response as SearchResponse
    }
    
    try {
      const results0Len = normalizedResponse?.data?.Response?.Results?.[0]?.length || 0
      const results1Len = normalizedResponse?.data?.Response?.Results?.[1]?.length || 0
      console.log('✅ Normalized Results:', { results0Len, results1Len, traceId: normalizedResponse?.data?.Response?.TraceId })
    } catch {}

    return normalizedResponse
  } catch (error) {
    console.error('Search flights error:', error)
    
    // Return structured empty response that matches SearchResponse
    return {
      success: false,
      data: {
        Response: {
          TraceId: '',
          Results: [[], []],
        },
      },
    } as SearchResponse
  }
}

// ============================================================================
// FARE RULES
// ============================================================================

export async function getFareRules(
  traceId: string,
  resultId: string
): Promise<FareRulesResponse> {
  return apiFetch('/flights/fare-rules', {
    method: 'POST',
    body: JSON.stringify({ traceId, resultId }),
  })
}

// ============================================================================
// REPRICE
// ============================================================================

export async function repriceFlightFare(
  request: RepriceRequest
): Promise<RepriceResponse> {
  return apiFetch('/flights/reprice', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// ============================================================================
// BOOKING / HOLD
// ============================================================================

export async function bookFlight(
  request: BookingRequest
): Promise<BookingResponse> {
  return apiFetch('/flights/book', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// ============================================================================
// TICKET / CONFIRMATION
// ============================================================================

export async function createTicket(
  request: TicketRequest
): Promise<TicketResponse> {
  return apiFetch('/flights/ticket', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getBooking(id: string): Promise<BookingResponse> {
  return apiFetch(`/flights/booking/${id}`)
}

// ============================================================================
// UTILITY: GET AIRPORTS (for autocomplete)
// ============================================================================

export interface Airport {
  code: string
  name: string
  city: string
  country: string
}

export async function searchAirports(query: string): Promise<Airport[]> {
  return apiFetch(`/airports/search?q=${encodeURIComponent(query)}`)
}
