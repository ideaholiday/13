import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'

export type TripType = 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY'
export type CabinClass = 'E' | 'PE' | 'B' | 'F'
export type SpecialFare = 'REG' | 'STU' | 'ARM' | 'SEN' | 'DOC'

export interface Airport {
  code: string
  name: string
  city: string
  country: string
}

export interface SelectedFlight {
  resultIndex: number;              // TBO ResultIndex
  provider?: string;                // Source, if present
  raw: any;                         // full TBO item for later SSR / fare-quote
  priced?: {                        // from Reprice/FareQuote
    publishedFare: number;
    offeredFare?: number;
    taxes?: number;
    currency?: string;
  };
}

export interface FlightSearchState {
  // Trip configuration
  tripType: TripType
  
  // Route
  origin: Airport | null
  destination: Airport | null
  
  // Dates
  departDate: string | null
  returnDate: string | null
  
  // Passengers
  passengers: {
    adults: number
    children: number
    infants: number
  }
  
  // Class and fare
  cabin: CabinClass
  specialFare: SpecialFare
  
  // Additional options
  delayProtection: boolean
  
  // Search results and selection
  lastSearchPayload?: any;
  results: any[];
  selected?: SelectedFlight | null;
  
  // Actions
  setTripType: (type: TripType) => void
  setOrigin: (airport: Airport | null) => void
  setDestination: (airport: Airport | null) => void
  setDepartDate: (date: string | null) => void
  setReturnDate: (date: string | null) => void
  setPassengers: (passengers: { adults: number; children: number; infants: number }) => void
  setCabin: (cabin: CabinClass) => void
  setSpecialFare: (fare: SpecialFare) => void
  setDelayProtection: (enabled: boolean) => void
  swapAirports: () => void
  isValid: () => boolean
  getSearchParams: () => URLSearchParams
  
  // Selection actions
  set: (patch: Partial<FlightSearchState>) => void
  resetSelection: () => void
}

const initialState = {
  tripType: 'ONE_WAY' as TripType,
  origin: null,
  destination: null,
  departDate: null,
  returnDate: null,
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabin: 'E' as CabinClass,
  specialFare: 'REG' as SpecialFare,
  delayProtection: false,
  results: [],
  selected: null,
}

export const useFlightSearchStore = create<FlightSearchState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTripType: (type) => {
        set({ tripType: type })
        
        // Handle return date logic
        if (type === 'ONE_WAY') {
          // Keep return date in memory but don't use it
          const state = get()
          if (state.returnDate) {
            // Store in sessionStorage for later restoration
            sessionStorage.setItem('mmt_return_date', state.returnDate)
          }
        } else if (type === 'ROUND_TRIP') {
          // Restore return date if available
          const storedReturnDate = sessionStorage.getItem('mmt_return_date')
          if (storedReturnDate) {
            set({ returnDate: storedReturnDate })
          }
        }
      },

      setOrigin: (airport) => set({ origin: airport }),
      setDestination: (airport) => set({ destination: airport }),
      
      setDepartDate: (date) => set({ departDate: date }),
      setReturnDate: (date) => set({ returnDate: date }),
      
      setPassengers: (passengers) => {
        // Validation: infants <= adults, total <= 9
        const { adults, children, infants } = passengers
        if (infants > adults) {
          throw new Error('Number of infants cannot exceed number of adults')
        }
        if (adults + children + infants > 9) {
          throw new Error('Maximum 9 passengers allowed')
        }
        if (adults < 1) {
          throw new Error('At least 1 adult passenger required')
        }
        set({ passengers })
      },

      setCabin: (cabin) => set({ cabin }),
      setSpecialFare: (fare) => set({ specialFare: fare }),
      setDelayProtection: (enabled) => set({ delayProtection: enabled }),

      swapAirports: () => {
        const state = get()
        set({
          origin: state.destination,
          destination: state.origin,
        })
      },

      isValid: () => {
        const state = get()
        const { origin, destination, departDate, passengers, tripType } = state
        
        // Basic validation
        if (!origin || !destination) return false
        if (origin.code === destination.code) return false
        if (!departDate) return false
        
        // Return date validation for round trip
        if (tripType === 'ROUND_TRIP') {
          if (!state.returnDate) return false
          if (dayjs(state.returnDate).isBefore(dayjs(departDate))) return false
        }
        
        // Passenger validation
        const { adults, children, infants } = passengers
        if (adults < 1) return false
        if (infants > adults) return false
        if (adults + children + infants > 9) return false
        
        return true
      },

      getSearchParams: () => {
        const state = get()
        const params = new URLSearchParams()
        
        if (state.origin) params.set('from', state.origin.code)
        if (state.destination) params.set('to', state.destination.code)
        if (state.departDate) params.set('depart', state.departDate)
        if (state.returnDate) params.set('return', state.returnDate)
        params.set('adt', state.passengers.adults.toString())
        params.set('chd', state.passengers.children.toString())
        params.set('inf', state.passengers.infants.toString())
        params.set('cabin', state.cabin)
        params.set('fare', state.specialFare)
        params.set('prot', state.delayProtection ? '1' : '0')
        
        return params
      },
      
      // Selection actions
      set: (patch) => set(patch),
      resetSelection: () => set({ selected: null }),
    }),
    {
      name: 'ih-flight-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    }
  )
)

// Helper functions
export const getCabinDisplayName = (cabin: CabinClass): string => {
  const names = {
    E: 'Economy',
    PE: 'Premium Economy',
    B: 'Business',
    F: 'First',
  }
  return names[cabin]
}

export const getSpecialFareDisplayName = (fare: SpecialFare): string => {
  const names = {
    REG: 'Regular',
    STU: 'Student',
    ARM: 'Armed Forces',
    SEN: 'Senior Citizen',
    DOC: 'Doctor & Nurses',
  }
  return names[fare]
}

export const getSpecialFareTooltip = (fare: SpecialFare): string => {
  const tooltips = {
    REG: 'Standard fare for all passengers',
    STU: 'Special discounts for students with valid ID',
    ARM: 'Exclusive rates for armed forces personnel',
    SEN: 'Senior citizen discounts (60+ years)',
    DOC: 'Special rates for doctors and nurses',
  }
  return tooltips[fare]
}

// Export alias for compatibility
export const useFlightSearch = useFlightSearchStore
