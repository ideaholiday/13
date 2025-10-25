import { useQuery } from '@tanstack/react-query'
import { fetchJSON } from '../lib/api'

export function useSSR(itineraryKey: string | undefined) {
  return useQuery<any, Error>({
    queryKey: ['flights', 'ssr', itineraryKey],
    queryFn: () => fetchJSON(`/api/flights/ssr?itineraryKey=${encodeURIComponent(itineraryKey!)}`),
    enabled: !!itineraryKey,
  })
}
