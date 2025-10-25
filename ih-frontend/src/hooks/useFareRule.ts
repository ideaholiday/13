import { useQuery } from '@tanstack/react-query'
import { fetchJSON, ApiError } from '../lib/api'

export function useFareRule(itineraryKey: string | undefined) {
  return useQuery<any, ApiError>({
    queryKey: ['flights', 'fare-rule', itineraryKey],
    queryFn: () => fetchJSON(`/api/flights/fare-rule?itineraryKey=${encodeURIComponent(itineraryKey!)}`),
    enabled: !!itineraryKey,
  })
}
