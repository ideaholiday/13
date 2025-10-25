import { useQuery } from '@tanstack/react-query'
import { fetchJSON } from '../lib/api'

export function useFareRule(itineraryKey: string | undefined) {
  return useQuery<any, Error>({
    queryKey: ['flights', 'fare-rule', itineraryKey],
    queryFn: () => fetchJSON(`/api/flights/fare-rule?itineraryKey=${encodeURIComponent(itineraryKey!)}`),
    enabled: !!itineraryKey,
  })
}
