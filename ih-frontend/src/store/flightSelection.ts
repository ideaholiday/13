import { create } from 'zustand'
import { NormalizedItinerary } from '@/lib/normalizeFlights'

interface SelectionState {
  selected?: { traceId: string; resultIndex: string; item?: NormalizedItinerary }
  setSelected: (sel: SelectionState['selected']) => void
  clear: () => void
}

export const useFlightSelection = create<SelectionState>((set) => ({
  selected: undefined,
  setSelected: (s) => set({ selected: s }),
  clear: () => set({ selected: undefined }),
}))
