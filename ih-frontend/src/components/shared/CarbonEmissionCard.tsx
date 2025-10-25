import React from 'react'
import { Leaf, ArrowDownCircle, Info, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useCarbonEmission, useOffsetCarbon } from '@/hooks/use-enhancements'

export interface CarbonEmissionCardProps {
  flightId: string
  bookingId?: string
  className?: string
}

export const CarbonEmissionCard: React.FC<CarbonEmissionCardProps> = ({ flightId, bookingId, className }) => {
  const { data, isLoading, isError } = useCarbonEmission(flightId)
  const offset = useOffsetCarbon()

  if (isLoading) {
    return <div className={clsx('rounded-xl border bg-white p-6 shadow-sm flex items-center justify-center', className)}><Loader2 className="animate-spin mr-2" /> Calculating emissions...</div>
  }
  if (isError || !data) {
    return <div className={clsx('rounded-xl border bg-white p-6 shadow-sm text-red-600', className)}>Failed to load carbon data.</div>
  }

  return (
    <section className={clsx('rounded-xl border bg-white p-6 shadow-sm space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Leaf className="text-green-600" size={28} />
        <div>
          <div className="font-semibold text-lg text-slate-800">Carbon Emissions</div>
          <div className="text-xs text-slate-500">for this flight (per passenger)</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="text-3xl font-bold text-green-700">{data.perPassengerKg} kg</div>
        <div className="text-xs text-slate-500">CO₂</div>
        <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">{data.comparison}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <ArrowDownCircle className="text-blue-400" size={18} />
        <span>Total for all passengers: <span className="font-medium text-slate-800">{data.totalKg} kg</span></span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Info size={14} />
        <span>Equivalent to planting <span className="font-semibold text-green-700">{Math.round(data.totalKg / 21)}</span> trees</span>
      </div>
      {data.offsetAvailable && (
        <form
          onSubmit={e => {
            e.preventDefault()
            if (data.offsetCost) {
              offset.mutate({ flightId, amountKg: data.totalKg, price: data.offsetCost })
            }
          }}
          className="mt-4"
        >
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2 disabled:opacity-60"
            disabled={offset.isPending}
          >
            {offset.isPending ? <Loader2 className="animate-spin" size={18} /> : null}
            Offset my carbon ({data.offsetCost ? `₹${data.offsetCost}` : 'Free'})
          </button>
          {offset.isSuccess && <div className="text-xs text-green-700 mt-2">Thank you for offsetting your carbon footprint!</div>}
          {offset.isError && <div className="text-xs text-red-600 mt-2">Failed to process offset. Please try again.</div>}
        </form>
      )}
    </section>
  )
}

export default CarbonEmissionCard
