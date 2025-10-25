import { useQuery } from '@tanstack/react-query'
import { fetchJSON, ApiError } from '../lib/api'
import type { PnrView } from '../types/flights'

export function usePnr(bookingId: string | undefined) {
  return useQuery<PnrView, ApiError>({
    queryKey: ['flights', 'pnr', bookingId],
    queryFn: () => fetchJSON(`/api/flights/pnr/${encodeURIComponent(bookingId!)}`),
    enabled: !!bookingId,
  })
}
