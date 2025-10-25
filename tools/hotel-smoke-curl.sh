#!/bin/bash
# hotel-smoke-curl.sh: Smoke test for TBO hotel REST API via backend
# Usage: bash tools/hotel-smoke-curl.sh [API_URL]

set -euo pipefail
API_URL="${1:-http://127.0.0.1:5000/api/v1/hotels}"
API_KEY="test_key_123"

# Defaults for search
CITY_ID=${CITY_ID:-394629} # Mumbai (from local map)
CHECK_IN=${CHECK_IN:-2025-11-01}
CHECK_OUT=${CHECK_OUT:-2025-11-03}

print_json_or_raw() {
  local data="$1"
  if echo "$data" | jq -e . >/dev/null 2>&1; then
    echo "$data" | jq .
  else
    echo "$data"
  fi
}

sanitize_to_json() {
  # macOS/BSD-safe: strip leading noise before first '{'
  awk 'BEGIN{found=0} { if(found==0){ idx=index($0,"{"); if(idx>0){ found=1; print substr($0, idx); } } else { print $0 } }'
}

is_json() {
  local data="$1"
  echo "$data" | jq -e . >/dev/null 2>&1
}

print_section() {
  echo
  echo "==================== $1 ===================="
}

# 1. Hotel Search
echo "[1] Hotel Search..."
SEARCH_PAYLOAD=$(cat <<JSON
{
  "cityId": "${CITY_ID}",
  "checkInDate": "${CHECK_IN}",
  "checkOutDate": "${CHECK_OUT}",
  "rooms": [{"adults": 2}],
  "nationality": "IN",
  "currency": "INR"
}
JSON
)
SEARCH_RAW=$(curl -sS -X POST "$API_URL/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "$SEARCH_PAYLOAD")
SEARCH_RESP=$(echo "$SEARCH_RAW" | sanitize_to_json)
print_json_or_raw "$SEARCH_RESP"

if is_json "$SEARCH_RESP"; then
  RESULT_INDEX=$(echo "$SEARCH_RESP" | jq -r '.data.results[0].resultIndex // empty')
  TRACE_ID=$(echo "$SEARCH_RESP" | jq -r '.data.traceId // .data.sessionId // empty')
else
  RESULT_INDEX=""
  TRACE_ID=""
fi
if [[ -z "$RESULT_INDEX" || -z "$TRACE_ID" ]]; then
  echo "[FAIL] Hotel search did not return resultIndex/traceId"
  exit 1
fi

# 2. Available Rooms
echo "[2] Available Rooms..."
ROOMS_RAW=$(curl -sS -X POST "$API_URL/rooms" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"resultIndex\": $RESULT_INDEX, \"traceId\": \"$TRACE_ID\"}")
ROOMS_RESP=$(echo "$ROOMS_RAW" | sanitize_to_json)
print_json_or_raw "$ROOMS_RESP"

# 3. Pricing (first room)
ROOM_INDEX=$(echo "$ROOMS_RESP" | jq -r '.data.rooms[0].roomIndex // empty')
if [[ -z "$ROOM_INDEX" ]]; then
  echo "[FAIL] No roomIndex in rooms response"
  exit 1
fi

echo "[3] Pricing..."
PRICING_RAW=$(curl -sS -X POST "$API_URL/pricing" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"resultIndex\": $RESULT_INDEX, \"roomIndex\": $ROOM_INDEX, \"traceId\": \"$TRACE_ID\"}")
PRICING_RESP=$(echo "$PRICING_RAW" | sanitize_to_json)
print_json_or_raw "$PRICING_RESP"

# 4. Book (dummy guest)
echo "[4] Book..."
BOOK_RAW=$(curl -sS -X POST "$API_URL/book" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "resultIndex": '"$RESULT_INDEX"',
    "roomIndex": '"$ROOM_INDEX"',
    "traceId": "'$TRACE_ID'",
    "guests": [{
      "title": "Mr",
      "firstName": "Test",
      "lastName": "User",
      "type": "ADT"
    }],
    "contactInfo": {"email": "test@example.com", "phone": "9999999999"}
  }')
BOOK_RESP=$(echo "$BOOK_RAW" | sanitize_to_json)
print_json_or_raw "$BOOK_RESP"

BOOKING_ID=$(echo "$BOOK_RESP" | jq -r '.data.bookingId // empty')
if [[ -z "$BOOKING_ID" ]]; then
  echo "[FAIL] No bookingId in book response"
  exit 1
fi

# 5. Booking Details
echo "[5] Booking Details..."
DETAILS_RAW=$(curl -sS -X POST "$API_URL/booking-details" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"bookingId\": \"$BOOKING_ID\"}")
DETAILS_RESP=$(echo "$DETAILS_RAW" | sanitize_to_json)
print_json_or_raw "$DETAILS_RESP"

echo "[PASS] Hotel smoke test completed."
