import { TboFlightSearchResponse } from './tboTypes'

export interface SegmentDetail {
  airlineCode: string
  airlineName?: string
  flightNumber?: string
  origin: string
  destination: string
  depTime: string
  arrTime: string
  durationMins?: number
  baggage?: string
  cabinBaggage?: string
  seatAvailable?: number
  cabin?: string
}

export interface FareRuleDetail {
  type: string // "Cancellation", "Reissue", "Refund", "Date Change"
  details: string
  days?: number
  charges?: number
}

export interface SsrOption {
  type: string // "MEAL", "SEAT", "BAGGAGE"
  description: string
  price?: number
  included?: boolean
}

export interface NormalizedItinerary {
  resultIndex: string
  currency: string
  baseFare: number
  tax: number
  yq: number
  otherTaxes: number
  total: number
  isRefundable: boolean
  isLcc: boolean
  source?: number
  airlineRemark?: string
  segments: SegmentDetail[]
  stops: number
  departTime: string
  arriveTime: string
  durationTotalMins: number
  // New fields for Expedia-style display
  baggage: string
  cabinBaggage: string
  seatAvailable: number
  fareRules: FareRuleDetail[]
  ssrOptions: SsrOption[]
  isFreeMealAvailable: boolean
  isBookableIfSeatNotAvailable: boolean
}

export function normalizeTboResults(payload: TboFlightSearchResponse) {
  if (!payload.success) throw new Error('Search failed')
  const res = payload.data?.Response
  if (!res || res.ResponseStatus !== 1)
    throw new Error(res?.Error?.ErrorMessage || 'No valid results')

  const traceId = res.TraceId
  const origin = res.Origin
  const destination = res.Destination

  const rawResults: any[] = Array.isArray(res.Results)
    ? res.Results.flat(2)
    : []

  const items: NormalizedItinerary[] = rawResults.map((r) => {
    const segs: any[] = Array.isArray(r.Segments)
      ? Array.isArray(r.Segments[0])
        ? (r.Segments as any[]).flat()
        : (r.Segments as any[])
      : []

    const first = segs[0] || {}
    const last = segs[segs.length - 1] || {}
    const dep = new Date(first.Origin?.DepTime || Date.now())
    const arr = new Date(last.Destination?.ArrTime || Date.now())
    const duration =
      (arr.getTime() - dep.getTime()) / 60000 || r.Duration || 0

    const fare = r.Fare || {}
    const total =
      (fare.BaseFare || 0) +
      (fare.Tax || 0) +
      (fare.YQTax || 0) +
      (fare.OtherTaxes || 0)

    // Extract baggage info from first segment
    const firstSeg = segs[0] || {}
    const baggage = firstSeg.Baggage || 'Not specified'
    const cabinBaggage = firstSeg.CabinBaggage || 'Not specified'
    const seatAvailable = firstSeg.NoOfSeatAvailable || 0

    // Extract fare rules from MiniFareRules
    const fareRules: FareRuleDetail[] = []
    if (r.MiniFareRules && Array.isArray(r.MiniFareRules)) {
      const rulesArray = r.MiniFareRules.flat()
      rulesArray.forEach((rule: any) => {
        if (rule && rule.Type) {
          fareRules.push({
            type: rule.Type,
            details: rule.Details || '',
            days: rule.From || undefined,
            charges: undefined,
          })
        }
      })
    }

    // Extract SSR options (Meals, Seats, Baggage)
    const ssrOptions: SsrOption[] = []
    
    // Check for meal availability
    if (r.IsFreeMealAvailable) {
      ssrOptions.push({
        type: 'MEAL',
        description: 'Complimentary meals',
        included: true,
      })
    }

    // Add baggage option
    if (baggage && baggage !== 'Not specified') {
      ssrOptions.push({
        type: 'BAGGAGE',
        description: `${baggage} checked baggage`,
        included: true,
      })
    }

    // Add seat availability option
    if (seatAvailable > 0) {
      ssrOptions.push({
        type: 'SEAT',
        description: `${seatAvailable} seats available`,
        included: true,
      })
    }

    return {
      resultIndex: String(r.ResultIndex || '').replace(/\s+/g, ''),
      currency: fare.Currency || 'INR',
      baseFare: fare.BaseFare || 0,
      tax: fare.Tax || 0,
      yq: fare.YQTax || 0,
      otherTaxes: fare.OtherTaxes || 0,
      total,
      isRefundable: !!r.IsRefundable,
      isLcc: !!r.IsLCC,
      source: r.Source,
      airlineRemark: r.AirlineRemark,
      segments: segs.map((s) => ({
        airlineCode: s.Airline?.AirlineCode || '',
        airlineName: s.Airline?.AirlineName,
        flightNumber: s.Airline?.FlightNumber,
        origin: s.Origin?.Airport?.AirportCode || '',
        destination: s.Destination?.Airport?.AirportCode || '',
        depTime: s.Origin?.DepTime || '',
        arrTime: s.Destination?.ArrTime || '',
        durationMins: s.Duration,
        baggage: s.Baggage,
        cabinBaggage: s.CabinBaggage,
        seatAvailable: s.NoOfSeatAvailable,
        cabin: s.CabinClass === 1 ? 'Economy' : s.CabinClass === 2 ? 'Premium Economy' : s.CabinClass === 3 ? 'Business' : 'First',
      })),
      stops: Math.max(segs.length - 1, 0),
      departTime: first.Origin?.DepTime || '',
      arriveTime: last.Destination?.ArrTime || '',
      durationTotalMins: duration,
      baggage,
      cabinBaggage,
      seatAvailable,
      fareRules,
      ssrOptions,
      isFreeMealAvailable: !!r.IsFreeMealAvailable,
      isBookableIfSeatNotAvailable: !!r.IsBookableIfSeatNotAvailable,
    }
  })

  return { items, meta: { traceId, origin, destination } }
}
