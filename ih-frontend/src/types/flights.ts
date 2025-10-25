export type Cabin = 'E' | 'PE' | 'B' | 'F'
export type TripType = 'O' | 'R' | 'M'

export interface SearchParams {
  origin: string
  destination: string
  departDate: string // YYYY-MM-DD
  returnDate?: string
  adults: number
  children?: number
  infants?: number
  cabinClass?: Cabin
  tripType?: TripType
  // Multi-city optional legs (if tripType === 'M')
  legs?: Array<{ origin: string; destination: string; date: string }>
}

export interface Money {
  currency: string
  amount: number
}

export interface FareBreakdown {
  base: Money
  tax: Money
  total: Money
  markupPct?: number
}

export interface Segment {
  marketingCarrier: string
  operatingCarrier?: string
  flightNumber: string
  origin: string
  destination: string
  departure: string // ISO8601
  arrival: string // ISO8601
  durationMinutes: number
  cabin: Cabin
  baggage?: string
  stops?: number
}

export interface Itinerary {
  itineraryKey: string // stable key for quote/book
  resultIndex?: string // if provided by backend
  segments: Segment[] // flattened across legs
  legs: Segment[][] // grouped per leg
  totalDurationMinutes: number
  fare: FareBreakdown
  airlineCodes: string[]
}

export interface SsrItem {
  code: string
  name: string
  price?: Money
}

export interface SsrGroup {
  type: 'MEAL' | 'SEAT' | 'BAGGAGE' | 'OTHER'
  items: SsrItem[]
}

export type PaxType = 'ADT' | 'CHD' | 'INF'

export interface Traveller {
  title: 'Mr' | 'Ms' | 'Mrs' | 'Mstr' | 'Miss'
  firstName: string
  lastName: string
  type: PaxType
  dateOfBirth: string // YYYY-MM-DD
  gender: 'M' | 'F'
  passportNo?: string
  passportExpiry?: string // YYYY-MM-DD
}

export interface ContactInfo {
  email: string
  phone: string
  address?: string
}

export interface BookingInput {
  itineraryKey: string
  travellers: Traveller[]
  contact: ContactInfo
}

export interface BookingResult {
  bookingId: string
  pnr?: string
  status: 'BOOKED' | 'PENDING' | 'FAILED'
  amount: Money
}

export interface TicketResult {
  bookingId: string
  pnr: string
  tickets?: Array<{ paxIndex: number; ticketNumber: string }>
  status: 'TICKETED' | 'PENDING' | 'FAILED'
}

export interface PnrView {
  bookingId: string
  pnr: string
  status: string
  passengers: Array<{ name: string; type: PaxType }>
  fare: FareBreakdown
  segments: Segment[]
}
