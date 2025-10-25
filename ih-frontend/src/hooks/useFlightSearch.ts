'use client'

import { useQuery } from '@tanstack/react-query'
import { normalizeTboResults } from '@/lib/normalizeFlights'

export const useFlightSearch = (params: any) =>
  useQuery({
    queryKey: ['flightSearch', params],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      return normalizeTboResults(data)
    },
    staleTime: 1000 * 60 * 60, // 1 hour - data doesn't change
    gcTime: 1000 * 60 * 60, // Keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on remount
  })
