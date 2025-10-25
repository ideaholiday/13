'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  TripType,
  CabinClass,
  SpecialFareType,
  SearchLeg,
  FlightResult,
  Passenger,
  Contact,
  Ticket,
  FlightSearchState,
} from '@/lib/types/flight-booking'

const initialFilters = {
  stops: 'all' as const,
  airlines: [] as string[],
  timeRange: null as { start: string; end: string } | null,
  refundableOnly: false,
  baggageIncluded: false,
}

const getDefaultDate = () =>
  new Date(Date.now() + 86400000).toISOString().split('T')[0]

interface FlightStoreActions {
  setTripType: (type: TripType) => void
  setLegs: (legs: SearchLeg[]) => void
  setTravellers: (adults: number, children: number, infants: number) => void
  setCabinClass: (cabin: CabinClass) => void
  setSpecialFare: (fare: SpecialFareType | null) => void
  setSearchResults: (traceId: string, results: FlightResult[]) => void
  setSearchLoading: (loading: boolean) => void
  setSearchError: (error: string | null) => void
  selectFlight: (result: FlightResult) => void
  clearSelection: () => void
  setPassengers: (passengers: Passenger[]) => void
  setContact: (contact: Contact) => void
  setBooking: (data: any) => void
  setTicket: (ticket: Ticket) => void
  setStopsFilter: (stops: 'all' | 'nonstop' | 'onestop') => void
  setAirlinesFilter: (airlines: string[]) => void
  setTimeRangeFilter: (range: { start: string; end: string } | null) => void
  setRefundableFilter: (value: boolean) => void
  setBaggageFilter: (value: boolean) => void
  resetFilters: () => void
  resetSearch: () => void
}

export const useFlightStore = create<FlightSearchState & FlightStoreActions>()(
  persist(
    (set) => {
      const initialState: FlightSearchState = {
        tripType: TripType.Oneway,
        legs: [{
          origin: '',
          destination: '',
          departDate: getDefaultDate(),
        }],
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: CabinClass.Economy,
        specialFare: null,
        traceId: null,
        results: [],
        isLoading: false,
        error: null,
        selectedResult: null,
        selectedPassengers: [],
        contact: null,
        booking: null,
        ticket: null,
        filters: initialFilters,
      }

      return {
        ...initialState,
        setTripType: (type) => set({ tripType: type }),
        setLegs: (legs) => set({ legs }),
        setTravellers: (adults, children, infants) =>
          set({ adults, children, infants }),
        setCabinClass: (cabin) => set({ cabinClass: cabin }),
        setSpecialFare: (fare) => set({ specialFare: fare }),
        setSearchResults: (traceId, results) =>
          set({ traceId, results, isLoading: false, error: null }),
        setSearchLoading: (loading) => set({ isLoading: loading }),
        setSearchError: (error) => set({ error, isLoading: false }),
        selectFlight: (result) => set({ selectedResult: result }),
        clearSelection: () => set({ selectedResult: null }),
        setPassengers: (passengers) => set({ selectedPassengers: passengers }),
        setContact: (contact) => set({ contact }),
        setBooking: (data) => set({ booking: data }),
        setTicket: (ticket) => set({ ticket }),
        setStopsFilter: (stops) =>
          set((state) => ({ filters: { ...state.filters, stops } })),
        setAirlinesFilter: (airlines) =>
          set((state) => ({ filters: { ...state.filters, airlines } })),
        setTimeRangeFilter: (range) =>
          set((state) => ({ filters: { ...state.filters, timeRange: range } })),
        setRefundableFilter: (value) =>
          set((state) => ({
            filters: { ...state.filters, refundableOnly: value },
          })),
        setBaggageFilter: (value) =>
          set((state) => ({
            filters: { ...state.filters, baggageIncluded: value },
          })),
        resetFilters: () => set({ filters: initialFilters }),
        resetSearch: () => set(initialState),
      }
    },
    {
      name: 'flight-store',
      partialize: (state) => ({
        tripType: state.tripType,
        legs: state.legs,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        cabinClass: state.cabinClass,
        specialFare: state.specialFare,
      }),
    }
  )
)
