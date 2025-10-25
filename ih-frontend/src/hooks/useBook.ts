import { useMutation } from '@tanstack/react-query'
import { fetchJSON } from '../lib/api'
import type { BookingInput, BookingResult } from '../types/flights'

export function useBook() {
  return useMutation<BookingResult, Error, BookingInput>({
    mutationFn: async (input) => {
      const res = await fetchJSON<BookingResult>('/api/flights/book', {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      })
      return res
    },
  })
}
