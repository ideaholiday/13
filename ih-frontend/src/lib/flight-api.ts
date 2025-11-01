/**
 * Unified Flight API Client
 * Connects frontend to Laravel backend at /api/v1/flights/*
 * Imports comprehensive TBO flight data types with all fields
 */

import type {
  FlightResult,
  FlightSearchResponse as TboFlightSearchResponse,
  FlightDisplayOption,
  FlightDetailsDisplay,
} from '@/types/tbo-flight-data'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// ============================================================================
// Generic API Helpers
// ============================================================================

export class ApiError extends Error {
  status: number
  details?: any
  
  constructor(message: string, status: number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Generic POST request helper
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!res.ok) {
    const text = await res.text()
    let errorMessage = `${res.status} ${res.statusText}`
    let errorDetails = null
    
    try {
      const json = JSON.parse(text)
      errorMessage = json.message || errorMessage
      errorDetails = json.errors || json.details
    } catch {
      errorMessage = text || errorMessage
    }
    
    throw new ApiError(errorMessage, res.status, errorDetails)
  }
  
  return res.json() as Promise<T>
}

/**
 * Generic GET request helper
 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { 
      'Accept': 'application/json',
    },
  })
  
  if (!res.ok) {
    const text = await res.text()
    let errorMessage = `${res.status} ${res.statusText}`
    
    try {
      const json = JSON.parse(text)
      errorMessage = json.message || errorMessage
    } catch {
      errorMessage = text || errorMessage
    }
    
    throw new ApiError(errorMessage, res.status)
  }
  
  return res.json() as Promise<T>
}

// ============================================================================
// Type Definitions (matching backend contracts)
// ============================================================================

export interface FlightSearchRequest {
  origin: string           // 3-letter IATA code (e.g., 'BOM')
  destination: string      // 3-letter IATA code (e.g., 'LKO')
  departDate: string       // YYYY-MM-DD format or any parsable date string
  returnDate?: string      // YYYY-MM-DD format (for roundtrip)
  tripType: 'O' | 'R'      // O = OneWay, R = RoundTrip
  adults: number           // 1-9
  children?: number        // 0-8
  infants?: number         // 0-8
  // Note: Backend expects 'E' | 'W' | 'B' | 'F'. We accept 'PE' (mapped to 'W') and 'W'.
  cabinClass: 'E' | 'PE' | 'W' | 'B' | 'F'  // Economy, Premium Economy, Premium (W), Business, First
}

/**
 * Complete flight search response with full TBO data
 * Includes all fields: airline info, baggage, fare rules, SSR, etc.
 */
export interface FlightSearchResponse {
  success: boolean
  data?: {
    origin: string
    destination: string
    traceId?: string
    markupPct: number
    results: FlightResult[] // Complete TBO flight results with all fields
    Response?: {
      ResponseStatus: number
      Error?: string
      Results?: FlightResult[][]
    }
  }
  message?: string
  errors?: any
}

export interface FareQuoteRequest {
  resultIndex: string
  traceId: string
}

export interface FareQuoteResponse {
  success: boolean
  data?: {
    resultIndex: string
    price: {
      total: number
      base: number
      taxes: number
      currency: string
      breakdown?: any
    }
    ttlSec?: number
  }
  message?: string
}

export interface FareRuleRequest {
  resultIndex: string
  traceId: string
}

export interface FareRuleResponse {
  success: boolean
  data?: {
    resultIndex: string
    rules?: Array<{
      title: string
      body: string
    }>
  }
  message?: string
}

export interface Passenger {
  type: 'ADT' | 'CHD' | 'INF'  // Adult, Child, Infant
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Mstr' | 'Miss'
  firstName: string
  lastName: string
  dateOfBirth: string  // YYYY-MM-DD
  gender: 'M' | 'F'
  passportNo?: string
  passportExpiry?: string  // YYYY-MM-DD
}

export interface ContactInfo {
  email: string
  phone: string
  address?: string
}

export interface BookFlightRequest {
  resultIndex: string
  traceId: string
  passengers: Passenger[]
  contactInfo: ContactInfo
}

export interface BookFlightResponse {
  success: boolean
  data?: {
    bookingId: string
    status: 'ON_HOLD' | 'FAILED' | 'CONFIRMED'
    pnr?: string
    holdExpiry?: string
  }
  message?: string
}

export interface TicketFlightRequest {
  bookingId: string
  pnr: string
  paymentRef?: string
}

export interface TicketFlightResponse {
  success: boolean
  data?: {
    bookingId: string
    status: 'TICKETED' | 'FAILED'
    ticketNos?: string[]
  }
  message?: string
}

export interface BookingDetailsResponse {
  success: boolean
  data?: {
    bookingId: string
    status: string
    pnr?: string
    voucherUrl?: string
    tickets?: any[]
  }
  message?: string
}

// ============================================================================
// Flight API Methods
// ============================================================================

/**
 * Normalize a date input to YYYY-MM-DD
 */
function toYMD(input?: string): string | undefined {
  if (!input) return undefined
  const s = String(input).trim()
  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // strip time component if present
  if (s.includes('T')) return s.split('T')[0]
  const d = new Date(s)
  if (isNaN(d.getTime())) return undefined
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Map cabin class from frontend to backend contract */
function mapCabinClass(c: FlightSearchRequest['cabinClass']): 'E' | 'W' | 'B' | 'F' {
  if (c === 'PE') return 'W' // Premium Economy -> W per backend
  if (c === 'B' || c === 'F' || c === 'E' || c === 'W') return c
  return 'E'
}

/** Basic client-side validation to avoid 400s */
export function validateFlightSearch(params: FlightSearchRequest): string[] {
  const errors: string[] = []
  const iata = /^[A-Z]{3}$/
  const origin = params.origin?.toUpperCase?.()
  const destination = params.destination?.toUpperCase?.()
  const depart = toYMD(params.departDate)
  const ret = params.tripType === 'R' ? toYMD(params.returnDate) : undefined

  if (!origin || !iata.test(origin)) errors.push('origin must be a 3-letter IATA code')
  if (!destination || !iata.test(destination)) errors.push('destination must be a 3-letter IATA code')
  if (!depart) errors.push('departDate must be a valid date (YYYY-MM-DD)')
  if (params.tripType === 'R' && !ret) errors.push('returnDate is required for roundtrip and must be valid (YYYY-MM-DD)')

  const adults = Number(params.adults)
  const children = Number(params.children ?? 0)
  const infants = Number(params.infants ?? 0)
  if (!Number.isFinite(adults) || adults < 1) errors.push('adults must be a number >= 1')
  if (!Number.isFinite(children) || children < 0) errors.push('children must be a number >= 0')
  if (!Number.isFinite(infants) || infants < 0) errors.push('infants must be a number >= 0')
  if (adults + children + infants > 9) errors.push('total passengers must be <= 9')

  return errors
}

/**
 * Search for flights
 * POST /api/v1/flights/search
 */
export async function searchFlights(
  params: FlightSearchRequest
): Promise<FlightSearchResponse> {
  // Validate and normalize before sending to backend
  const errors = validateFlightSearch(params)
  if (errors.length) {
    throw new ApiError('Validation failed', 400, errors)
  }

  const origin = params.origin.toUpperCase()
  const destination = params.destination.toUpperCase()
  const depart = toYMD(params.departDate)!
  const ret = toYMD(params.returnDate)
  const cabin = mapCabinClass(params.cabinClass)

  // Transform to backend contract
  // Backend expects: origin, destination, departDate, tripType, adults, children, infants, class
  const payload: any = {
    origin,
    destination,
    departDate: depart,
    tripType: params.tripType,
    adults: Number(params.adults),
    children: Number(params.children ?? 0),
    infants: Number(params.infants ?? 0),
    class: cabin === 'E' ? 'Economy' : cabin === 'W' ? 'Premium' : cabin === 'B' ? 'Business' : 'First',
  }

  // Add return date for round-trip
  if (params.tripType === 'R' && ret) {
    payload.returnDate = ret
  }

  return apiPost<FlightSearchResponse>('/flights/search', payload)
}

/**
 * Get fare quote (reprice) for selected flight
 * POST /api/v1/flights/reprice (or /flights/fare-quote)
 */
export async function repriceFlights(
  params: FareQuoteRequest
): Promise<FareQuoteResponse> {
  return apiPost<FareQuoteResponse>('/flights/reprice', params)
}

/**
 * Get fare rules for selected flight
 * POST /api/v1/flights/fare-rules (or /flights/fare-rule)
 */
export async function getFareRules(
  params: FareRuleRequest
): Promise<FareRuleResponse> {
  return apiPost<FareRuleResponse>('/flights/fare-rules', params)
}

/**
 * Book flight (create PNR/HOLD)
 * POST /api/v1/flights/book
 */
export async function bookFlight(
  params: BookFlightRequest
): Promise<BookFlightResponse> {
  return apiPost<BookFlightResponse>('/flights/book', params)
}

/**
 * Issue ticket after payment
 * POST /api/v1/flights/ticket
 */
export async function ticketFlight(
  params: TicketFlightRequest
): Promise<TicketFlightResponse> {
  return apiPost<TicketFlightResponse>('/flights/ticket', params)
}

/**
 * Get booking details by ID (standardized endpoint)
 * GET /api/v1/bookings/{id}
 */
export async function getBooking(
  bookingId: string
): Promise<BookingDetailsResponse> {
  return apiGet<BookingDetailsResponse>(`/bookings/${bookingId}`)
}

/**
 * Get booking details (legacy endpoint)
 * POST /api/v1/flights/booking-details
 */
export async function getBookingDetails(params: {
  bookingId?: string
  pnr?: string
}): Promise<BookingDetailsResponse> {
  return apiPost<BookingDetailsResponse>('/flights/booking-details', params)
}

// ============================================================================
// Health & Version Checks
// ============================================================================

/**
 * Health check
 * GET /api/v1/health
 */
export async function healthCheck(): Promise<{ ok: boolean }> {
  return apiGet<{ ok: boolean }>('/health')
}

/**
 * Get API version
 * GET /api/v1/version
 */
export async function getVersion(): Promise<{
  version: string
  name: string
  environment: string
}> {
  return apiGet<{
    version: string
    name: string
    environment: string
  }>('/version')
}

// ============================================================================
// Convenience Re-exports
// ============================================================================

export const flightApi = {
  search: searchFlights,
  reprice: repriceFlights,
  fareRules: getFareRules,
  book: bookFlight,
  ticket: ticketFlight,
  getBooking,
  getBookingDetails,
  health: healthCheck,
  version: getVersion,
}

export default flightApi
