// Minimal flight smoke test: Search -> FareQuote -> FareRule -> SSR
// Usage:
//   BASE_URL=http://127.0.0.1:5000/api/v1 node tools/flight-smoke.mjs
// Optional env:
//   ORIGIN=DEL DEST=BOM DATE=2025-12-12 X_API_KEY=yourkey

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000/api/v1';
const ORIGIN = (process.env.ORIGIN || 'DEL').toUpperCase();
const DEST = (process.env.DEST || 'BOM').toUpperCase();
const X_API_KEY = process.env.X_API_KEY;

function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEPART = process.env.DATE || datePlus(30);

const headers = { 'Content-Type': 'application/json' };
if (X_API_KEY) headers['X-API-Key'] = X_API_KEY;

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${JSON.stringify(json)}`);
  }
  return json;
}

function flattenResults(data) {
  // Supports top-level alias (results) and REST 2D Response.Results
  if (Array.isArray(data?.data?.results)) return data.data.results;
  const rr = data?.data?.Response?.Results;
  if (Array.isArray(rr)) {
    if (Array.isArray(rr[0])) return rr.flat();
    return rr;
  }
  const r2 = data?.data?.Results;
  if (Array.isArray(r2)) {
    if (Array.isArray(r2[0])) return r2.flat();
    return r2;
  }
  return [];
}

function getTraceId(data) {
  return (
    data?.data?.traceId ||
    data?.data?.Response?.TraceId ||
    data?.data?.TraceId ||
    data?.traceId || null
  );
}

async function main() {
  console.log(`Base: ${BASE_URL}`);
  console.log(`Search: ${ORIGIN} -> ${DEST} on ${DEPART}`);

  const searchBody = {
    origin: ORIGIN,
    destination: DEST,
    departDate: DEPART,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'E',
    tripType: 'O',
  };

  const search = await post('/flights/search', searchBody);
  if (search?.success !== true) throw new Error('Search failed');
  const results = flattenResults(search);
  const count = results.length;
  const traceId = getTraceId(search);
  if (!count) throw new Error('Search returned 0 results');
  if (!traceId) throw new Error('Missing TraceId from search');
  const resultIndex = results[0]?.ResultIndex || results[0]?.resultIndex || 1;
  console.log(`Search OK: count=${count}, traceId=${traceId}, resultIndex=${resultIndex}`);

  const fareQuote = await post('/flights/fare-quote', {
    traceId,
    resultIndex: String(resultIndex),
  });
  if (fareQuote?.success !== true) throw new Error('FareQuote failed');
  const fqPrice = fareQuote?.data?.Response?.Price || fareQuote?.data?.Price;
  console.log(`FareQuote OK: hasPrice=${!!fqPrice}`);

  const fareRule = await post('/flights/fare-rule', {
    traceId,
    resultIndex: String(resultIndex),
  });
  if (fareRule?.success !== true) throw new Error('FareRule failed');
  console.log('FareRule OK');

  const ssr = await post('/flights/ssr', {
    traceId,
    resultIndex: String(resultIndex),
  });
  if (ssr?.success !== true) throw new Error('SSR failed');
  console.log('SSR OK');

  console.log('Smoke test completed successfully.');
}

main().catch((err) => {
  console.error('Smoke test failed:', err?.message || err);
  process.exit(1);
});
