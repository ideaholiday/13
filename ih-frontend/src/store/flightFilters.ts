import { create } from 'zustand'

interface FiltersState {
  nonStopOnly: boolean
  airlines: string[]
  priceRange: [number, number]
  refundOnly: boolean
  lccOnly: boolean
  setNonStop: (v: boolean) => void
  setAirlines: (a: string[]) => void
  setPriceRange: (p: [number, number]) => void
  setRefundOnly: (v: boolean) => void
  setLccOnly: (v: boolean) => void
}

export const useFlightFilters = create<FiltersState>((set) => ({
  nonStopOnly: false,
  airlines: [],
  priceRange: [0, 100000],
  refundOnly: false,
  lccOnly: false,
  setNonStop: (v: boolean) => set({ nonStopOnly: v }),
  setAirlines: (a: string[]) => set({ airlines: a }),
  setPriceRange: (p: [number, number]) => set({ priceRange: p }),
  setRefundOnly: (v: boolean) => set({ refundOnly: v }),
  setLccOnly: (v: boolean) => set({ lccOnly: v }),
}))
