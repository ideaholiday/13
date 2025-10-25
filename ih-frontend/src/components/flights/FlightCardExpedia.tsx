'use client'

import { NormalizedItinerary } from '@/lib/normalizeFlights'
import { formatINR, formatTime, formatDuration } from '@/lib/time'
import { useFlightSelection } from '@/store/flightSelection'
import { useRouter } from 'next/navigation'
import { Plane, ChevronDown, Utensils, Armchair, Briefcase, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { memo, useState } from 'react'

function FlightCard({ item, traceId }: { item: NormalizedItinerary; traceId: string }) {
  const router = useRouter()
  const { setSelected } = useFlightSelection()
  const [expanded, setExpanded] = useState(false)

  const seg = item.segments[0] || {}
  const lastSeg = item.segments[item.segments.length - 1] || {}
  const airline = seg.airlineCode || 'XX'

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        {/* Main Flight Info - Always Visible */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Airline & Flight Number */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{seg.airlineName || airline}</div>
                  <div className="text-xs text-slate-500">{seg.flightNumber || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Time & Route */}
            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <div className="text-center">
                <div className="font-bold text-lg text-slate-900">{formatTime(item.departTime)}</div>
                <div className="text-xs text-slate-500">{seg.origin}</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="text-xs text-slate-600 mb-1 font-medium">{formatDuration(item.durationTotalMins)}</div>
                <div className="w-full border-t-2 border-dashed border-slate-300"></div>
                <div className="text-xs text-slate-600 mt-1">
                  {item.stops === 0 ? 'Nonstop' : `${item.stops} stop${item.stops > 1 ? 's' : ''}`}
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-slate-900">{formatTime(item.arriveTime)}</div>
                <div className="text-xs text-slate-500">{lastSeg.destination}</div>
              </div>
            </div>

            {/* Details & Amenities */}
            <div className="md:col-span-1 flex flex-wrap gap-2">
              {item.isRefundable && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-xs">
                  Refundable
                </Badge>
              )}
              {item.isFreeMealAvailable && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Meals
                </Badge>
              )}
              {item.isLcc && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs">
                  LCC
                </Badge>
              )}
            </div>

            {/* Price & Action */}
            <div className="md:col-span-1 flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{formatINR(item.total, item.currency)}</div>
                <div className="text-xs text-slate-500">per person</div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-none"
                  onClick={() => setExpanded(!expanded)}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelected({ traceId, resultIndex: item.resultIndex, item })
                    router.push('/flights/review')
                  }}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details Section */}
        {expanded && (
          <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Baggage Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-slate-900">Baggage</h4>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="text-slate-600 text-xs font-medium">Checked Baggage</div>
                    <div className="text-slate-900 font-medium">{item.baggage}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-slate-600 text-xs font-medium">Cabin Baggage</div>
                    <div className="text-slate-900 font-medium">{item.cabinBaggage}</div>
                  </div>
                </div>
              </div>

              {/* Seats & Availability */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Armchair className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-slate-900">Seats</h4>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="text-slate-600 text-xs font-medium">Available</div>
                    <div className="text-slate-900 font-medium">{item.seatAvailable} seats available</div>
                  </div>
                  {item.isBookableIfSeatNotAvailable && (
                    <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                      Bookable even if sold out
                    </div>
                  )}
                </div>
              </div>

              {/* Meals & Services */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-slate-900">Services</h4>
                </div>
                <div className="space-y-2">
                  {item.isFreeMealAvailable ? (
                    <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                      ✓ Meals included
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">Meals available for purchase</div>
                  )}
                </div>
              </div>
            </div>

            {/* Fare Rules */}
            {item.fareRules && item.fareRules.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-slate-900">Fare Rules</h4>
                </div>
                <div className="space-y-2">
                  {item.fareRules.map((rule, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                      <div className="font-medium text-slate-900">{rule.type}</div>
                      <div className="text-slate-600 text-xs mt-1">{rule.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(FlightCard)
