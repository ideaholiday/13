import { proxyGET, proxyPOST } from '../../_lib/proxy'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Normalize common aliases and build JSON body for upstream POST (Laravel may expect POST)
  const url = new URL(req.url)
  const sp = url.searchParams
  const norm = new URL(url.toString())
  const nsp = norm.searchParams

  if (!nsp.get('origin') && sp.get('from')) nsp.set('origin', sp.get('from')!)
  if (!nsp.get('destination') && sp.get('to')) nsp.set('destination', sp.get('to')!)
  if (!nsp.get('departDate') && sp.get('departureDate')) nsp.set('departDate', sp.get('departureDate')!)
  if (!nsp.get('cabinClass') && sp.get('cabin')) nsp.set('cabinClass', sp.get('cabin')!)
  if (!nsp.get('cabinClass') && sp.get('class')) nsp.set('cabinClass', sp.get('class')!)
  const tt = sp.get('tripType')
  if (tt) {
    const up = tt.toUpperCase()
    const mapped = up === 'ONEWAY' ? 'O' : up === 'ROUNDTRIP' ? 'R' : up === 'MULTICITY' || up === 'MULTI' ? 'M' : tt
    nsp.set('tripType', mapped)
  }

  // Build body expected by Laravel controller
  const adults = parseInt(nsp.get('adults') || '1', 10)
  const children = parseInt(nsp.get('children') || '0', 10)
  const infants = parseInt(nsp.get('infants') || '0', 10)
  const cabinRaw = nsp.get('cabinClass') || sp.get('class') || 'E'
  const cabinMap: Record<string, string> = { economy: 'E', premium_economy: 'PE', business: 'B', first: 'F' }
  const cabinClass = cabinMap[(cabinRaw || '').toLowerCase()] || cabinRaw

  const origin = nsp.get('origin')
  const destination = nsp.get('destination')
  const departDate = nsp.get('departDate')
  const segments = [{
    origin,
    destination,
    departureDate: departDate,
  }]
  const payload = {
    origin,
    destination,
    departDate,
    returnDate: nsp.get('returnDate') || undefined,
    adults,
    children,
    infants,
    cabinClass,
    tripType: (nsp.get('tripType') || 'O').toUpperCase(),
    segments,
  }

  const newReq = new Request(url.toString(), {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    body: JSON.stringify(payload),
  })
  return proxyPOST(newReq, '/flights/search')
}

// Add POST handler for programmatic frontend requests
export async function POST(req: Request) {
  // Accepts JSON body from frontend, normalizes, and proxies to backend
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // fallback: try to parse urlencoded or empty
  }
  // Normalize aliases
  const origin = body.origin || body.from
  const destination = body.destination || body.to
  const departDate = body.departDate || body.departureDate
  const returnDate = body.returnDate
  const adults = parseInt(body.adults ?? '1', 10)
  const children = parseInt(body.children ?? '0', 10)
  const infants = parseInt(body.infants ?? '0', 10)
  const cabinRaw = body.cabinClass || body.class || 'E'
  const cabinMap: Record<string, string> = { economy: 'E', premium_economy: 'PE', business: 'B', first: 'F' }
  const cabinClass = cabinMap[(cabinRaw || '').toLowerCase()] || cabinRaw
  let tripType = body.tripType || 'O'
  if (typeof tripType === 'string') {
    const up = tripType.toUpperCase()
    tripType = up === 'ONEWAY' ? 'O' : up === 'ROUNDTRIP' ? 'R' : up === 'MULTICITY' || up === 'MULTI' ? 'M' : up
  }
  const segments = [{
    origin,
    destination,
    departureDate: departDate,
  }]
  const payload = {
    origin,
    destination,
    departDate,
    returnDate,
    adults,
    children,
    infants,
    cabinClass,
    tripType,
    segments,
  }
  const newReq = new Request(req.url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    body: JSON.stringify(payload),
  })
  return proxyPOST(newReq, '/flights/search')
}
