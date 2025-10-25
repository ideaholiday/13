import { useQuery } from '@tanstack/react-query'
import { fetchJSON, ApiError } from '../lib/api'

export function useFareQuote(itineraryKey: string | undefined) {
  return useQuery<any, ApiError>({
    queryKey: ['flights', 'fare-quote', itineraryKey],
    queryFn: () => fetchJSON(`/api/flights/fare-quote?itineraryKey=${encodeURIComponent(itineraryKey!)}`),
    enabled: !!itineraryKey,
  })
}
