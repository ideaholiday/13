'use client'

import { useParams } from 'next/navigation'
import { usePnr } from '../../../hooks/usePnr'

export default function BookingPage() {
  const params = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = usePnr(params?.id)

  if (isLoading) return (
    <div className="max-w-3xl mx-auto p-4 animate-pulse">
      <div className="h-24 bg-slate-200 rounded" />
    </div>
  )
  if (isError) return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded">{error.message}</div>
    </div>
  )
  if (!data) return <div className="p-6">Not found</div>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Booking {data.bookingId}</h1>
      <div className="border rounded p-4">
        <div>PNR: <strong>{data.pnr}</strong></div>
        <div>Status: {data.status}</div>
      </div>
    </div>
  )
}
