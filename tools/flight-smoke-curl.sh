#!/usr/bin/env bash
set -euo pipefail

# Curl-only flight smoke test: Search -> FareQuote -> FareRule -> SSR
# Usage:
#   bash tools/flight-smoke-curl.sh
# Optional env: BASE_URL (default http://127.0.0.1:5000/api/v1), ORIGIN, DEST, DATE, X_API_KEY

BASE_URL=${BASE_URL:-http://127.0.0.1:5000/api/v1}
ORIGIN=${ORIGIN:-DEL}
DEST=${DEST:-BOM}

if [[ -z "${DATE:-}" ]]; then
  DATE=$(date -v+30d +%F 2>/dev/null || date -d "+30 days" +%F)
fi

hdrs=(-H "Content-Type: application/json")
if [[ -n "${X_API_KEY:-}" ]]; then
  hdrs+=( -H "X-API-Key: ${X_API_KEY}" )
fi

echo "Base: ${BASE_URL}"
echo "Search: ${ORIGIN} -> ${DEST} on ${DATE}"

search_json=$(curl -sS -m 20 "${BASE_URL}/flights/search" \
  "${hdrs[@]}" \
  -X POST \
  -d "{\"origin\":\"${ORIGIN}\",\"destination\":\"${DEST}\",\"departDate\":\"${DATE}\",\"adults\":1,\"children\":0,\"infants\":0,\"cabinClass\":\"E\",\"tripType\":\"O\"}")


# Print search response safely (avoid exit 141 on broken pipe)
set +e
echo "Search response (truncated):"
echo "$search_json" | head -c 500 || true
set -e
echo

have_jq=0; command -v jq >/dev/null 2>&1 && have_jq=1

if [[ $have_jq -eq 1 ]]; then
  count=$(echo "$search_json" | jq -r '(.data.results // (.data.Response.Results // [])) | if type=="array" then if (.[0]|type=="array") then (map(length)|add) else length end else 0 end')
  traceId=$(echo "$search_json" | jq -r '.data.traceId // .data.Response.TraceId // empty')
  resultIndex=$(echo "$search_json" | jq -r '(.data.results // (.data.Response.Results // [])) | if type=="array" then (if (.[0]|type=="array") then .[0][0].ResultIndex else .[0].ResultIndex end) else empty end')
else
  # Fallback: robust extraction for large JSON and long string ResultIndex
  count=$(echo "$search_json" | grep -o '"ResultIndex"' | wc -l | tr -d ' ')
  traceId=$(echo "$search_json" | grep -o '"TraceId":"[^\"]\{1,80\}"' | head -n1 | sed 's/.*:"\([^\"]*\)".*/\1/')
  # Find the first ResultIndex value (string, possibly long/encoded)
  resultIndex=$(echo "$search_json" | grep -o '"ResultIndex":"[^"]*"' | head -n1 | sed 's/.*:"\([^\"]*\)".*/\1/')
  if [[ -z "$resultIndex" ]]; then
    resultIndex=$(echo "$search_json" | grep -o '"ResultIndex":[0-9]\{1,6\}' | head -n1 | sed 's/.*:\([0-9]*\)/\1/')
  fi
fi

if [[ -z "$traceId" ]]; then
  echo "ERROR: Missing TraceId in search response"; echo "$search_json" | head -c 1000; exit 1;
fi
if [[ -z "$resultIndex" ]]; then
  echo "ERROR: Missing ResultIndex in search response"; echo "$search_json" | head -c 1000; exit 1;
fi
if [[ "${count:-0}" -eq 0 ]]; then
  echo "ERROR: No results found"; echo "$search_json" | head -c 1000; exit 1;
fi

echo "Search OK: count=${count}, traceId=${traceId}, resultIndex=${resultIndex}"

fare_quote_json=$(curl -sS -m 20 "${BASE_URL}/flights/fare-quote" \
  "${hdrs[@]}" -X POST \
  -d "{\"traceId\":\"${traceId}\",\"resultIndex\":\"${resultIndex}\"}")
set +e
echo "FareQuote OK (truncated):"
echo "$fare_quote_json" | head -c 300 || true
set -e
echo

fare_rule_json=$(curl -sS -m 20 "${BASE_URL}/flights/fare-rule" \
  "${hdrs[@]}" -X POST \
  -d "{\"traceId\":\"${traceId}\",\"resultIndex\":\"${resultIndex}\"}")
set +e
echo "FareRule OK (truncated):"
echo "$fare_rule_json" | head -c 300 || true
set -e
echo

ssr_json=$(curl -sS -m 20 "${BASE_URL}/flights/ssr" \
  "${hdrs[@]}" -X POST \
  -d "{\"traceId\":\"${traceId}\",\"resultIndex\":\"${resultIndex}\"}")
set +e
echo "SSR OK (truncated):"
echo "$ssr_json" | head -c 300 || true
set -e
echo

echo "Smoke test completed successfully."
