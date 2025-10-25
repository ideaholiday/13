import { z } from 'zod'

/**
 * Flight Booking Type Definitions
 * Covers entire flow: search → results → reprice → checkout → confirm
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum TripType {
  Oneway = 'O',
  RoundTrip = 'R',
  MultiCity = 'M',
}

export enum CabinClass {
  Economy = 'E',
  PremiumEconomy = 'W',
  Business = 'B',
  First = 'F',
}

export enum PassengerType {
  Adult = 'ADT',
  Child = 'CHD',
  Infant = 'INF',
}

export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'O',
}

export enum SpecialFareType {
  Student = 'STU',
  Senior = 'SEN',
  ArmedForces = 'ARM',
  Doctor = 'DOC',
  Military = 'MIL',
}

// ============================================================================
// SEARCH MODELS
// ============================================================================

export const SearchLegSchema = z.object({
  origin: z.string().length(3, 'Origin must be 3-letter IATA code'),
  destination: z.string().length(3, 'Destination must be 3-letter IATA code'),
  departDate: z.string().refine(d => new Date(d) > new Date(), 'Date must be in future'),
  returnDate: z.string().optional(),
})

export type SearchLeg = z.infer<typeof SearchLegSchema>

export const SearchRequestSchema = z.object({
  tripType: z.enum(['O', 'R', 'M']),
  legs: z.array(SearchLegSchema).min(1).max(5),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9),
  infants: z.number().int().min(0).max(9),
  cabinClass: z.enum(['E', 'W', 'B', 'F']),
  specialFare: z.enum(['STU', 'SEN', 'ARM', 'DOC', 'MIL']).nullable().optional(),
})

export type SearchRequest = z.infer<typeof SearchRequestSchema>

// ============================================================================
// FLIGHT SEGMENT & RESULT MODELS
// ============================================================================

export interface Segment {
  origin: string
  destination: string
  originName?: string
  destinationName?: string
  departTime: string
  arrivalTime: string
  duration: number // minutes
  airline: string
  flightNumber: string
  aircraft?: string
  terminal?: {
    departure?: string
    arrival?: string
  }
  stops?: number
}

export interface Fare {
  base: number
  tax: number
  yq?: number
  otherTaxes?: number
  grandTotal: number
  currency: string
  serviceFee?: number
}

export interface FlightResult {
  resultId: string
  traceId: string
  carrier: string
  flightNumber: string
  segments: Segment[][]
  duration: number
  stops: number
  refundable: boolean
  fareBrand?: string
  baggage?: {
    pieces?: number
    weight?: number
    unit?: string
  }
  fare: Fare
  lastTicketDate?: string
}

export interface SearchResponse {
  success: boolean
  data: {
    Response: {
      TraceId: string
      Results: FlightResult[][]
    }
  }
}

// ============================================================================
// FARE RULES & REPRICE
// ============================================================================

export interface FareRule {
  type: 'CANCELLATION' | 'RESCHEDULE' | 'NO_SHOW' | 'BAGGAGE' | 'CHANGES'
  description: string
  chargeAmount?: number
  timeWindow?: string
}

export interface FareRulesResponse {
  success: boolean
  data: {
    rules: FareRule[]
    inclusions: string[]
    exclusions?: string[]
  }
}

export interface RepriceRequest {
  traceId: string
  resultId: string
  adults: number
  children: number
  infants: number
}

export interface RepriceResponse {
  success: boolean
  data: {
    resultId: string
    traceId: string
    fare: Fare
    baggage: {
      checked?: number
      cabin?: number
    }
    seatsAvailable: number
    priceMatch: boolean
  }
}

// ============================================================================
// PASSENGER & BOOKING
// ============================================================================

export const PassengerSchema = z.object({
  type: z.enum(['ADT', 'CHD', 'INF']),
  title: z.enum(['MR', 'MRS', 'MS', 'MSTR', 'DR', 'PROF']),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  dateOfBirth: z.string().optional(), // required for CHD/INF
  gender: z.enum(['M', 'F', 'O']),
  nationality: z.string().optional(),
  passport: z.object({
    number: z.string().optional(),
    expiryDate: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
})

export type Passenger = z.infer<typeof PassengerSchema>

export const ContactSchema = z.object({
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone required'),
  country: z.string().default('IN'),
})

export type Contact = z.infer<typeof ContactSchema>

export interface SeatPreference {
  segmentIndex: number
  seatNumber: string
  type?: 'WINDOW' | 'AISLE' | 'MIDDLE'
}

export interface BaggageOption {
  segmentIndex: number
  type: 'CHECKED' | 'CABIN'
  weight: number
  price: number
}

export const BookingRequestSchema = z.object({
  traceId: z.string(),
  resultId: z.string(),
  contact: ContactSchema,
  passengers: z.array(PassengerSchema).min(1),
  seatPreferences: z.array(z.any()).optional(),
  baggage: z.array(z.any()).optional(),
})

export type BookingRequest = z.infer<typeof BookingRequestSchema>

export interface BookingResponse {
  success: boolean
  data: {
    pnr: string
    orderId: string
    bookingReference: string
    itinerary: {
      segments: Segment[][]
      passengers: Passenger[]
      fare: Fare
    }
    ticketingDeadline: string
  }
}

// ============================================================================
// TICKET & CONFIRMATION
// ============================================================================

export interface TicketRequest {
  pnr: string
  orderId: string
  paymentId?: string
}

export interface Ticket {
  pnr: string
  orderId: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  passengers: (Passenger & { ticketNumber?: string })[]
  itinerary: {
    segments: Segment[][]
    duration: number
  }
  fare: Fare
  contact: Contact
  bookingDate: string
  ticketingDeadline: string
  locatorCode?: string
}

export interface TicketResponse {
  success: boolean
  data: Ticket
}

// ============================================================================
// STORE STATE
// ============================================================================

export interface FlightSearchState {
  // Search inputs
  tripType: TripType
  legs: SearchLeg[]
  adults: number
  children: number
  infants: number
  cabinClass: CabinClass
  specialFare: SpecialFareType | null

  // Search results
  traceId: string | null
  results: FlightResult[]
  isLoading: boolean
  error: string | null

  // Selected flight
  selectedResult: FlightResult | null
  selectedPassengers: Passenger[]
  contact: Contact | null

  // Booking data
  booking: BookingResponse | null
  ticket: Ticket | null

  // UI state
  filters: {
    stops: 'all' | 'nonstop' | 'onestop'
    airlines: string[]
    timeRange: { start: string; end: string } | null
    refundableOnly: boolean
    baggageIncluded: boolean
  }
}
