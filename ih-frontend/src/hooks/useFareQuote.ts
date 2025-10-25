import { useQuery } from '@tanstack/react-query'
import { fetchJSON } from '../lib/api'

export function useFareQuote(itineraryKey: string | undefined) {
  return useQuery<any, Error>({
    queryKey: ['flights', 'fare-quote', itineraryKey],
    queryFn: () => fetchJSON(`/api/flights/fare-quote?itineraryKey=${encodeURIComponent(itineraryKey!)}`),
    enabled: !!itineraryKey,
  })
}
