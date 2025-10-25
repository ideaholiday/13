/**
 * 🚀 CONSOLIDATED FLIGHT STORE - Single source of truth for flight booking
 * 
 * This replaces both useFlightStore and useFlightBookingStore with a unified approach:
 * - Normalizes TBO API responses to consistent internal format
 * - Handles complete booking flow from search to confirmation
 * - Provides typed selectors for different parts of the flow
 * - Eliminates data shape inconsistencies between stores
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { searchFlights as apiSearchFlights } from '../api/flights'
import type { TboItinerary, TboFare, TboSegment } from '@/lib/tboTypes'
import type { SearchRequest, SearchResponse, TripType, CabinClass } from '@/lib/types/flight-booking'

// ============================================================================
// NORMALIZED INTERNAL TYPES (consistent across the app)
// ============================================================================

export interface NormalizedAirport {
  code: string
  name: string
  city: string
  country: string
}

export interface NormalizedFare {
  baseFare: number
  taxes: number
  totalFare: number
  currency: string
  offeredFare: number
  refundable: boolean
  cancellationWindow?: string
  baggageAllowance?: string
}

export interface NormalizedSegment {
  origin: NormalizedAirport
  destination: NormalizedAirport
  departureTime: string
  arrivalTime: string
  duration: number
  flightNumber: string
  airline: {
    code: string
    name: string
    flightNumber?: string
  }
  aircraft?: string
  baggage?: string
}

export interface NormalizedFlight {
  id: string
  traceId: string
  resultIndex: string
  fare: NormalizedFare
  segments: NormalizedSegment[]
  isLCC: boolean
  isRefundable: boolean
  airlineRemark?: string
  fareRules?: {
    cancellation: string[]
    baggage: string[]
    changes: string[]
  }
}

export interface MultiCityLeg {
  from: NormalizedAirport | null
  to: NormalizedAirport | null
  departDate: Date | null
}

export interface Passenger {
  id: string
  type: 'ADT' | 'CHD' | 'INF'
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'O'
  passport?: string
  nationality?: string
  email?: string
  phone?: string
  frequentFlyerNumber?: string
  seat?: string
}

export interface AddOn {
  type: 'baggage' | 'meal' | 'seat' | 'insurance'
  description: string
  price: number
  quantity: number
}

export interface PaymentInfo {
  method: 'card' | 'upi' | 'netbanking' | 'wallet'
  cardData?: {
    cardNumber: string
    expiryDate: string
    cvv: string
    holderName: string
  }
  upiId?: string
  saveCard: boolean
  promoCode?: string
  discountAmount: number
}

export interface BookingState {
  // === SEARCH PARAMETERS ===
  tripType: 'O' | 'R' | 'M'
  from: NormalizedAirport | null
  to: NormalizedAirport | null
  departDate: Date | null
  returnDate: Date | null
  adults: number
  children: number
  infants: number
  cabinClass: 'E' | 'W' | 'B' | 'F'
  multiCityLegs: MultiCityLeg[]

  // === SEARCH RESULTS (normalized) ===
  outboundFlights: NormalizedFlight[]
  returnFlights: NormalizedFlight[]
  isSearching: boolean
  searchError: string | null

  // === FLIGHT SELECTION ===
  selectedOutbound: NormalizedFlight | null
  selectedReturn: NormalizedFlight | null
  outboundTraceId: string | null
  returnTraceId: string | null

  // === PASSENGER INFORMATION ===
  passengers: Passenger[]
  contactEmail: string
  contactPhone: string

  // === BOOKING DETAILS ===
  seatSelections: Map<string, string[]>
  addOns: AddOn[]
  insuranceSelected: boolean
  ssrSelections: Record<string, Record<string, string>>

  // === PAYMENT ===
  paymentInfo: Partial<PaymentInfo>
  totalPrice: number
  fareBreakdown: {
    baseFare: number
    taxes: number
    fees: number
    discount: number
  }

  // === UI STATE ===
  currentStep: 'search' | 'results' | 'select' | 'review' | 'checkout' | 'payment' | 'confirmation'
  isLoading: boolean
  error: string | null

  // === BOOKING RESULT ===
  bookingConfirmation: {
    pnr: string
    bookingId: string
    ticketNumber?: string
    timestamp: Date
  } | null
}

const createDefaultMultiCityLegs = (): MultiCityLeg[] => (
  [
    { from: null, to: null, departDate: null },
    { from: null, to: null, departDate: null },
  ]
)

// ============================================================================
// TBO DATA NORMALIZATION FUNCTIONS
// ============================================================================

function normalizeTboFare(tboFare: TboFare | any): NormalizedFare {
  const offeredFare = tboFare.OfferedFare ?? (tboFare.BaseFare || 0) + (tboFare.Tax || 0)
  return {
    baseFare: tboFare.BaseFare || 0,
    taxes: tboFare.Tax || 0,
    totalFare: (tboFare.BaseFare || 0) + (tboFare.Tax || 0),
    currency: tboFare.Currency || 'INR',
    offeredFare,
    refundable: true, // Default, will be updated from fare rules
    cancellationWindow: '24 hours', // Default, will be updated from fare rules
    baggageAllowance: '7kg cabin + 15kg checked', // Default, will be updated from fare rules
  }
}

function normalizeTboSegment(tboSegment: TboSegment | any): NormalizedSegment {
  const originAirport = (tboSegment as any).Origin?.Airport ?? {}
  const destinationAirport = (tboSegment as any).Destination?.Airport ?? {}
  const depTime =
    (tboSegment as any).Origin?.DepTime ||
    (tboSegment as any).DepTime ||
    ''
  const arrTime =
    (tboSegment as any).Destination?.ArrTime ||
    (tboSegment as any).ArrTime ||
    ''
  return {
    origin: {
      code: originAirport.AirportCode || (tboSegment as any).Origin || '',
      name: originAirport.AirportName || '',
      city: originAirport.CityName || '',
      country: originAirport.CountryName || '',
    },
    destination: {
      code: destinationAirport.AirportCode || (tboSegment as any).Destination || '',
      name: destinationAirport.AirportName || '',
      city: destinationAirport.CityName || '',
      country: destinationAirport.CountryName || '',
    },
    departureTime: depTime,
    arrivalTime: arrTime,
    duration: tboSegment.Duration || 0,
    flightNumber: tboSegment.Airline?.FlightNumber || '',
    airline: {
      code: tboSegment.Airline?.AirlineCode || '',
      name: tboSegment.Airline?.AirlineName || '',
      flightNumber: tboSegment.Airline?.FlightNumber,
    },
    aircraft: (tboSegment as any).Craft || '',
    baggage: tboSegment.Baggage || (tboSegment as any).CabinBaggage || '',
  }
}

function normalizeTboItinerary(tboItinerary: TboItinerary | any, traceId: string): NormalizedFlight {
  const segments = Array.isArray(tboItinerary.Segments) 
    ? tboItinerary.Segments.flat() 
    : tboItinerary.Segments || []

  return {
    id: `${traceId}_${tboItinerary.ResultIndex}`,
    traceId,
    resultIndex: tboItinerary.ResultIndex,
    fare: normalizeTboFare(tboItinerary.Fare),
    segments: segments.map(normalizeTboSegment),
    isLCC: tboItinerary.IsLCC || false,
    isRefundable: tboItinerary.IsRefundable || false,
    airlineRemark: tboItinerary.AirlineRemark,
    fareRules: {
      cancellation: ['Free cancellation up to 24 hours before departure'],
      baggage: ['7kg cabin baggage included', '15kg checked baggage included'],
      changes: ['Changes allowed with fee'],
    },
  }
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: BookingState = {
  tripType: 'R',
  from: null,
  to: null,
  departDate: null,
  returnDate: null,
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'E',
  multiCityLegs: createDefaultMultiCityLegs(),

  outboundFlights: [],
  returnFlights: [],
  isSearching: false,
  searchError: null,

  selectedOutbound: null,
  selectedReturn: null,
  outboundTraceId: null,
  returnTraceId: null,

  passengers: [],
  contactEmail: '',
  contactPhone: '',

  seatSelections: new Map(),
  addOns: [],
  insuranceSelected: false,
  ssrSelections: {},

  paymentInfo: {},
  totalPrice: 0,
  fareBreakdown: {
    baseFare: 0,
    taxes: 0,
    fees: 0,
    discount: 0,
  },

  currentStep: 'search',
  isLoading: false,
  error: null,

  bookingConfirmation: null,
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useFlightStore = create<BookingState & {
  // === SEARCH ACTIONS ===
  setTripType: (type: string) => void
  setOrigin: (airport: NormalizedAirport) => void
  setDestination: (airport: NormalizedAirport) => void
  setDepartDate: (date: Date) => void
  setReturnDate: (date: Date | null) => void
  setPassengers: (adults: number, children: number, infants: number) => void
  setCabinClass: (cabin: string) => void
  setMultiCityLeg: (index: number, leg: Partial<MultiCityLeg>) => void
  addMultiCityLeg: () => void
  removeMultiCityLeg: (index: number) => void

  // === SEARCH EXECUTION ===
  performSearch: () => Promise<void>

  // === FLIGHT SELECTION ===
  selectOutboundFlight: (flight: NormalizedFlight, traceId: string) => void
  selectReturnFlight: (flight: NormalizedFlight, traceId: string) => void

  // === PASSENGER MANAGEMENT ===
  addPassenger: (passenger: Passenger) => void
  updatePassenger: (index: number, passenger: Passenger) => void
  removePassenger: (index: number) => void
  setContactInfo: (email: string, phone: string) => void
  setPassengerDetails: (passengers: Passenger[]) => void

  // === BOOKING ACTIONS ===
  addSeatSelection: (flightKey: string, seat: string) => void
  removeSeatSelection: (flightKey: string, seat: string) => void
  addAddOn: (addOn: AddOn) => void
  removeAddOn: (index: number) => void
  setInsurance: (selected: boolean) => void
  updatePassengerSSR: (passengerId: string, ssrId: string, value: string) => void
  clearSSRSelections: () => void

  // === PAYMENT ACTIONS ===
  setPaymentInfo: (info: Partial<PaymentInfo>) => void
  applyPromoCode: (code: string) => void

  // === NAVIGATION ===
  goToStep: (step: BookingState['currentStep']) => void
  nextStep: () => void
  previousStep: () => void

  // === BOOKING COMPLETION ===
  setBookingConfirmation: (confirmation: any) => void

  // === UTILITIES ===
  calculateTotalPrice: () => number
  reset: () => void
  clearError: () => void
}>((set, get) => ({
  ...initialState,

  // === SEARCH SETTERS ===
  setTripType: (type) =>
    set((state) => {
      const updates: Partial<BookingState> = {
        tripType: type as any,
      }

      if (type === 'M') {
        updates.multiCityLegs = state.multiCityLegs.length > 0
          ? state.multiCityLegs
          : createDefaultMultiCityLegs()
      } else {
        updates.multiCityLegs = createDefaultMultiCityLegs()
      }

      if (type !== 'R') {
        updates.returnDate = null
        updates.selectedReturn = null
        updates.returnFlights = []
      }

      return updates
    }),
  setOrigin: (airport) => set({ from: airport }),
  setDestination: (airport) => set({ to: airport }),
  setDepartDate: (date) => set({ departDate: date }),
  setReturnDate: (date) => set({ returnDate: date }),
  setPassengers: (adults, children, infants) => set({ adults, children, infants }),
  setCabinClass: (cabin) => set({ cabinClass: cabin as any }),
  setMultiCityLeg: (index, leg) =>
    set((state) => {
      const updated = [...state.multiCityLegs]
      if (!updated[index]) {
        updated[index] = { from: null, to: null, departDate: null }
      }
      updated[index] = { ...updated[index], ...leg }
      return { multiCityLegs: updated }
    }),
  addMultiCityLeg: () =>
    set((state) => {
      if (state.multiCityLegs.length >= 5) return state
      return {
        multiCityLegs: [
          ...state.multiCityLegs,
          { from: null, to: null, departDate: null },
        ],
      }
    }),
  removeMultiCityLeg: (index) =>
    set((state) => {
      if (state.multiCityLegs.length <= 2) return state
      const updated = state.multiCityLegs.filter((_, i) => i !== index)
      return { multiCityLegs: updated }
    }),

  // === PERFORM SEARCH ===
  performSearch: async () => {
    const state = get()
    set({ isSearching: true, searchError: null })

    try {
      // Build the search request according to the API contract
      let legs: { origin: string; destination: string; departDate: string }[] = []

      if (state.tripType === 'M') {
        legs = state.multiCityLegs
          .filter((leg) => leg.from && leg.to && leg.departDate)
          .map((leg) => ({
            origin: leg.from!.code,
            destination: leg.to!.code,
            departDate: leg.departDate!.toISOString().split('T')[0],
          }))

        if (legs.length < 2) {
          set({
            isSearching: false,
            error: 'Please add at least two legs with cities and dates',
          })
          return
        }
      } else {
        if (!state.from || !state.to || !state.departDate) {
          set({ error: 'Please fill all required fields', isSearching: false })
          return
        }

        legs = [
          {
            origin: state.from.code,
            destination: state.to.code,
            departDate: state.departDate.toISOString().split('T')[0],
          },
        ]

        // Add return leg for round trip
        if (state.tripType === 'R' && state.returnDate) {
          legs.push({
            origin: state.to.code,
            destination: state.from.code,
            departDate: state.returnDate.toISOString().split('T')[0],
          })
        }
      }

      const searchRequest: SearchRequest = {
        tripType: state.tripType,
        legs: legs as any,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        cabinClass: state.cabinClass,
      }

      console.log('Performing search with:', searchRequest)
      const response = await apiSearchFlights(searchRequest)

      console.log('🔎 Search response (store):', response)

      // Normalize TBO response to our internal format
      const responseData = response?.data
      
      if (responseData?.Response && Array.isArray(responseData.Response.Results)) {
        const results = responseData.Response.Results || []
        const traceId = responseData.Response.TraceId || ''
        
        // Handle both flat array and nested array formats
        let outboundFlights: NormalizedFlight[] = []
        let returnFlights: NormalizedFlight[] = []
        
        if (results.length > 0 && Array.isArray(results[0])) {
          // Nested array format: [[outbound], [return]]
          outboundFlights = (results[0] || []).map((itinerary: any) => 
            normalizeTboItinerary(itinerary, traceId)
          )
          returnFlights = (results[1] || []).map((itinerary: any) => 
            normalizeTboItinerary(itinerary, traceId)
          )
        } else {
          // Flat array format: [flight1, flight2, ...]
          outboundFlights = results.map((itinerary: any) => 
            normalizeTboItinerary(itinerary, traceId)
          )
          returnFlights = []
        }

        console.log('📊 Normalized Results:', {
          outbound: outboundFlights.length,
          inbound: returnFlights.length,
          traceId,
        })

        set({
          outboundFlights,
          returnFlights: state.tripType === 'R' ? returnFlights : [],
          outboundTraceId: traceId,
          returnTraceId: state.tripType === 'R' ? traceId : null,
          currentStep: 'results',
          searchError: null,
        })

        console.log('✅ Store updated successfully with normalized data')
      } else {
        console.warn('Unexpected search response shape; treating as no results')
        set({ outboundFlights: [], returnFlights: [], currentStep: 'results', searchError: null })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Search failed'
      set({ searchError: errorMsg, error: errorMsg })
    } finally {
      set({ isSearching: false })
    }
  },

  // === FLIGHT SELECTION ===
  selectOutboundFlight: (flight, traceId) => {
    set({
      selectedOutbound: flight,
      outboundTraceId: traceId,
      currentStep: get().tripType === 'O' ? 'review' : 'results',
    })
  },

  selectReturnFlight: (flight, traceId) => {
    set({
      selectedReturn: flight,
      returnTraceId: traceId,
      currentStep: 'review',
    })
  },

  // === PASSENGER MANAGEMENT ===
  addPassenger: (passenger) => {
    const passengers = get().passengers
    const id = `passenger_${passengers.length + 1}`
    set({
      passengers: [...passengers, { ...passenger, id }],
    })
  },

  updatePassenger: (index, passenger) => {
    const passengers = [...get().passengers]
    passengers[index] = passenger
    set({ passengers })
  },

  removePassenger: (index) => {
    const passengers = get().passengers.filter((_, i) => i !== index)
    set({ passengers })
  },

  setContactInfo: (email, phone) => {
    set({ contactEmail: email, contactPhone: phone })
  },

  setPassengerDetails: (passengers) => set({ passengers }),

  // === BOOKING ACTIONS ===
  addSeatSelection: (flightKey, seat) => {
    const selections = new Map(get().seatSelections)
    const current = selections.get(flightKey) || []
    selections.set(flightKey, [...current, seat])
    set({ seatSelections: selections })
  },

  removeSeatSelection: (flightKey, seat) => {
    const selections = new Map(get().seatSelections)
    const current = selections.get(flightKey) || []
    selections.set(flightKey, current.filter((s) => s !== seat))
    set({ seatSelections: selections })
  },

  addAddOn: (addOn) => {
    set({
      addOns: [...get().addOns, addOn],
    })
  },

  removeAddOn: (index) => {
    set({
      addOns: get().addOns.filter((_, i) => i !== index),
    })
  },

  setInsurance: (selected) => {
    set({ insuranceSelected: selected })
  },
  updatePassengerSSR: (passengerId, ssrId, value) => {
    set((state) => {
      const updated = { ...state.ssrSelections }
      if (!updated[passengerId]) {
        updated[passengerId] = {}
      }
      if (value === '') {
        delete updated[passengerId][ssrId]
        if (Object.keys(updated[passengerId]).length === 0) {
          delete updated[passengerId]
        }
      } else {
        updated[passengerId][ssrId] = value
      }
      return { ssrSelections: updated }
    })
  },
  clearSSRSelections: () => set({ ssrSelections: {} }),

  // === PAYMENT ===
  setPaymentInfo: (info) => {
    set({ paymentInfo: { ...get().paymentInfo, ...info } })
  },

  applyPromoCode: async (code) => {
    // TODO: Validate promo code against backend
    const discountAmount = 100 // Mock
    set({
      paymentInfo: { ...get().paymentInfo, promoCode: code, discountAmount },
    })
  },

  // === NAVIGATION ===
  goToStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const steps: BookingState['currentStep'][] = [
      'search',
      'results',
      'select',
      'review',
      'checkout',
      'payment',
      'confirmation',
    ]
    const currentIndex = steps.indexOf(get().currentStep)
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] })
    }
  },

  previousStep: () => {
    const steps: BookingState['currentStep'][] = [
      'search',
      'results',
      'select',
      'review',
      'checkout',
      'payment',
      'confirmation',
    ]
    const currentIndex = steps.indexOf(get().currentStep)
    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] })
    }
  },

  // === BOOKING COMPLETION ===
  setBookingConfirmation: (confirmation) => {
    set({
      bookingConfirmation: {
        pnr: confirmation.pnr,
        bookingId: confirmation.bookingId,
        ticketNumber: confirmation.ticketNumber,
        timestamp: new Date(),
      },
      currentStep: 'confirmation',
    })
  },

  // === UTILITIES ===
  calculateTotalPrice: () => {
    const state = get()
    const basePrice = state.selectedOutbound?.fare.offeredFare || 0
    const returnPrice = state.selectedReturn?.fare.offeredFare || 0
    const addOnsPrice = state.addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
    const insurancePrice = state.insuranceSelected ? 200 : 0

    const total = basePrice + returnPrice + addOnsPrice + insurancePrice
    const discount = state.paymentInfo.discountAmount || 0

    return Math.max(0, total - discount)
  },

  reset: () => set(initialState),

  clearError: () => set({ error: null, searchError: null }),
}))

// ============================================================================
// DERIVED STATE & SELECTORS
// ============================================================================

export const useFlightSearchParams = () => {
  const state = useFlightStore()
  return {
    tripType: state.tripType,
    from: state.from,
    to: state.to,
    departDate: state.departDate,
    returnDate: state.returnDate,
    adults: state.adults,
    children: state.children,
    infants: state.infants,
    cabinClass: state.cabinClass,
    multiCityLegs: state.multiCityLegs,
  }
}

export const useFlightResults = () => {
  const state = useFlightStore()
  return {
    outboundFlights: state.outboundFlights,
    returnFlights: state.returnFlights,
    isSearching: state.isSearching,
    searchError: state.searchError,
  }
}

export const useFlightSelection = () => {
  const state = useFlightStore()
  return {
    selectedOutbound: state.selectedOutbound,
    selectedReturn: state.selectedReturn,
    outboundTraceId: state.outboundTraceId,
    returnTraceId: state.returnTraceId,
  }
}

export const usePassengerInfo = () => {
  const state = useFlightStore()
  return {
    passengers: state.passengers,
    contactEmail: state.contactEmail,
    contactPhone: state.contactPhone,
  }
}

export const useBookingDetails = () => {
  const state = useFlightStore()
  return {
    seatSelections: state.seatSelections,
    addOns: state.addOns,
    insuranceSelected: state.insuranceSelected,
    ssrSelections: state.ssrSelections,
    totalPrice: state.calculateTotalPrice(),
  }
}

export const useBookingStep = () => {
  const state = useFlightStore()
  return {
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    error: state.error,
  }
}

// ============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// ============================================================================

// Export the old store name for backward compatibility
export const useFlightBookingStore = useFlightStore
