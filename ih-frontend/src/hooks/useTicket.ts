import { useMutation } from '@tanstack/react-query'
import { fetchJSON, ApiError } from '../lib/api'

export function useTicket() {
  return useMutation<any, ApiError, { bookingId: string }>({
    mutationFn: async ({ bookingId }) => {
      return fetchJSON('/api/flights/ticket', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      })
    },
  })
}
