/**
 * 🚀 UNIFIED FLIGHT STORE - Central state management for entire flight booking flow
 * 
 * Handles:
 * - Flight search parameters & results
 * - Flight selection (outbound/return)
 * - Passenger information
 * - Booking details (seats, add-ons)
 * - Payment information
 * - Complete booking state
 */

import { create } from 'zustand'
import { searchFlights as apiSearchFlights } from '../api/flights'
import type { FlightResult } from '@/types/tbo-flight-data'
import type { SearchRequest, SearchResponse, TripType, CabinClass } from '@/lib/types/flight-booking'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Airport {
  code: string
  name: string
  city: string
  country: string
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
  tripType: 'O' | 'R' | 'M' // OneWay, RoundTrip, MultiCity
  from: Airport | null
  to: Airport | null
  departDate: Date | null
  returnDate: Date | null
  adults: number
  children: number
  infants: number
  class: 'E' | 'W' | 'B' | 'F' // Economy, Premium Economy, Business, First

  // === SEARCH RESULTS ===
  outboundFlights: any[]
  returnFlights: any[]
  isSearching: boolean
  searchError: string | null

  // === FLIGHT SELECTION ===
  selectedOutbound: any
  selectedReturn: any
  outboundTraceId: string | null
  returnTraceId: string | null

  // === PASSENGER INFORMATION ===
  passengers: Passenger[]
  contactEmail: string
  contactPhone: string

  // === BOOKING DETAILS ===
  seatSelections: Map<string, string[]> // flightKey -> seat numbers
  addOns: AddOn[]
  insuranceSelected: boolean

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
  class: 'E',

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

export const useFlightBookingStore = create<BookingState & {
  // === SEARCH ACTIONS ===
  setTripType: (type: string) => void
  setOrigin: (airport: Airport) => void
  setDestination: (airport: Airport) => void
  setDepartDate: (date: Date) => void
  setReturnDate: (date: Date | null) => void
  setPassengers: (adults: number, children: number, infants: number) => void
  setCabinClass: (cabin: string) => void

  // === SEARCH EXECUTION ===
  performSearch: () => Promise<void>

  // === FLIGHT SELECTION ===
  selectOutboundFlight: (flight: any, traceId: string) => void
  selectReturnFlight: (flight: any, traceId: string) => void

  // === PASSENGER MANAGEMENT ===
  addPassenger: (passenger: Passenger) => void
  updatePassenger: (index: number, passenger: Passenger) => void
  removePassenger: (index: number) => void
  setContactInfo: (email: string, phone: string) => void

  // === BOOKING ACTIONS ===
  addSeatSelection: (flightKey: string, seat: string) => void
  removeSeatSelection: (flightKey: string, seat: string) => void
  addAddOn: (addOn: AddOn) => void
  removeAddOn: (index: number) => void
  setInsurance: (selected: boolean) => void

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
  setTripType: (type) => set({ tripType: type as any }),
  setOrigin: (airport) => set({ from: airport }),
  setDestination: (airport) => set({ to: airport }),
  setDepartDate: (date) => set({ departDate: date }),
  setReturnDate: (date) => set({ returnDate: date }),
  setPassengers: (adults, children, infants) => set({ adults, children, infants }),
  setCabinClass: (cabin) => set({ class: cabin as any }),

  // === PERFORM SEARCH ===
  performSearch: async () => {
    const state = get()
    if (!state.from || !state.to || !state.departDate) {
      set({ error: 'Please fill all required fields' })
      return
    }

    set({ isSearching: true, searchError: null })

    try {
      // Build the search request according to the API contract
      const legs = [
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

      const searchRequest: SearchRequest = {
        tripType: state.tripType,
        legs: legs as any,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        cabinClass: state.class,
      }

      console.log('Performing search with:', searchRequest)
      const response = await apiSearchFlights(searchRequest)

      console.log('🔎 Search response (store):', response)
      console.log('API Raw Response:', response)
      console.log('Flights Data Path:', (response as any)?.data?.Response?.Results)

      // FIXED: Handle both success and no-results cases
      // The backend wraps TBO response in { success: true/false, data: { Response: { Results: [...] } } }
      const responseData = response?.data
      
      console.log('🔍 DEBUG: responseData structure:', {
        hasData: !!responseData,
        hasResponse: !!responseData?.Response,
        isResultsArray: Array.isArray(responseData?.Response?.Results),
        resultsLength: responseData?.Response?.Results?.length,
        firstResultType: typeof responseData?.Response?.Results?.[0],
        firstResultLength: Array.isArray(responseData?.Response?.Results?.[0]) ? responseData?.Response?.Results?.[0]?.length : 'not array'
      })
      
         if (responseData?.Response && Array.isArray(responseData.Response.Results)) {
           // Response has Results array - could be flat array or nested array
           const results = responseData.Response.Results || []
           const traceId = responseData.Response.TraceId || null
           
           // Handle both flat array and nested array formats
           let outboundFlights: any[] = []
           let returnFlights: any[] = []
           
           if (results.length > 0 && Array.isArray(results[0])) {
             // Nested array format: [[outbound], [return]]
             outboundFlights = results[0] || []
             returnFlights = results[1] || []
           } else {
             // Flat array format: [flight1, flight2, ...]
             outboundFlights = results
             returnFlights = []
           }

           console.log('📊 Results counts:', {
             outbound: outboundFlights.length,
             inbound: returnFlights.length,
             traceId,
           })

           console.log('🚀 Setting store with flights:', {
             outboundFlights: outboundFlights.length,
             returnFlights: returnFlights.length,
             traceId
           })

           set({
             outboundFlights,
             returnFlights: state.tripType === 'R' ? returnFlights : [],
             outboundTraceId: traceId,
             returnTraceId: state.tripType === 'R' ? traceId : null,
             currentStep: 'results',
             searchError: null,
           })

           console.log('✅ Store updated successfully')
         } else {
        console.warn('Unexpected search response shape; treating as no results', {
          hasData: !!responseData,
          hasResponse: !!responseData?.Response,
          isResultsArray: Array.isArray(responseData?.Response?.Results)
        })
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
    const basePrice = state.selectedOutbound?.Fare?.OfferedFare || 0
    const returnPrice = state.selectedReturn?.Fare?.OfferedFare || 0
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
  const state = useFlightBookingStore()
  return {
    tripType: state.tripType,
    from: state.from,
    to: state.to,
    departDate: state.departDate,
    returnDate: state.returnDate,
    adults: state.adults,
    children: state.children,
    infants: state.infants,
    class: state.class,
  }
}

export const useFlightResults = () => {
  const state = useFlightBookingStore()
  return {
    outboundFlights: state.outboundFlights,
    returnFlights: state.returnFlights,
    isSearching: state.isSearching,
    searchError: state.searchError,
  }
}

export const useFlightSelection = () => {
  const state = useFlightBookingStore()
  return {
    selectedOutbound: state.selectedOutbound,
    selectedReturn: state.selectedReturn,
    outboundTraceId: state.outboundTraceId,
    returnTraceId: state.returnTraceId,
  }
}

export const usePassengerInfo = () => {
  const state = useFlightBookingStore()
  return {
    passengers: state.passengers,
    contactEmail: state.contactEmail,
    contactPhone: state.contactPhone,
  }
}

export const useBookingDetails = () => {
  const state = useFlightBookingStore()
  return {
    seatSelections: state.seatSelections,
    addOns: state.addOns,
    insuranceSelected: state.insuranceSelected,
    totalPrice: state.calculateTotalPrice(),
  }
}

export const useBookingStep = () => {
  const state = useFlightBookingStore()
  return {
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    error: state.error,
  }
}
