import { useMutation } from '@tanstack/react-query'
import { fetchJSON } from '../lib/api'

export function useTicket() {
  return useMutation<any, Error, { bookingId: string }>({
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
