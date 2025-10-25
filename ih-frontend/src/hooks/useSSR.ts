import { useQuery } from '@tanstack/react-query'
import { fetchJSON, ApiError } from '../lib/api'

export function useSSR(itineraryKey: string | undefined) {
  return useQuery<any, ApiError>({
    queryKey: ['flights', 'ssr', itineraryKey],
    queryFn: () => fetchJSON(`/api/flights/ssr?itineraryKey=${encodeURIComponent(itineraryKey!)}`),
    enabled: !!itineraryKey,
  })
}
