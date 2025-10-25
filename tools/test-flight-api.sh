#!/bin/bash

# ============================================================================
# Flight API Verification Script
# Tests the Laravel backend flight endpoints to ensure they work correctly
# ============================================================================

set -e  # Exit on error

# Configuration
API_BASE="${API_BASE:-http://localhost:8000/api/v1}"
ORIGIN="${ORIGIN:-BOM}"
DEST="${DEST:-LKO}"
DEPART_DATE="${DEPART_DATE:-2025-11-20}"

echo "=========================================="
echo "Flight API Verification Script"
echo "=========================================="
echo "API Base: $API_BASE"
echo "Route: $ORIGIN → $DEST"
echo "Date: $DEPART_DATE"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# Test 1: Health Check
# ============================================================================
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $API_BASE/health"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_BASE/health")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ FAILED${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# ============================================================================
# Test 2: Version Check
# ============================================================================
echo -e "${YELLOW}Test 2: Version Check${NC}"
echo "GET $API_BASE/version"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_BASE/version")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ FAILED${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# ============================================================================
# Test 3: Flight Search
# ============================================================================
echo -e "${YELLOW}Test 3: Flight Search${NC}"
echo "POST $API_BASE/flights/search"
echo ""

SEARCH_PAYLOAD=$(cat <<EOF
{
  "origin": "$ORIGIN",
  "destination": "$DEST",
  "departDate": "$DEPART_DATE",
  "tripType": "O",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E"
}
EOF
)

echo "Payload:"
echo "$SEARCH_PAYLOAD" | jq . 2>/dev/null || echo "$SEARCH_PAYLOAD"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$API_BASE/flights/search" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$SEARCH_PAYLOAD")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
  echo "Response (formatted):"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  
  # Extract traceId and resultIndex for subsequent tests
  TRACE_ID=$(echo "$BODY" | jq -r '.data.traceId // empty' 2>/dev/null)
  RESULT_INDEX=$(echo "$BODY" | jq -r '.data.results[0].resultIndex // empty' 2>/dev/null)
  
  if [ -n "$TRACE_ID" ] && [ -n "$RESULT_INDEX" ]; then
    echo ""
    echo "Extracted for next tests:"
    echo "  traceId: $TRACE_ID"
    echo "  resultIndex: $RESULT_INDEX"
  fi
else
  echo -e "${RED}✗ FAILED${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# ============================================================================
# Test 4: Fare Quote (Reprice) - Only if we have traceId and resultIndex
# ============================================================================
if [ -n "$TRACE_ID" ] && [ -n "$RESULT_INDEX" ]; then
  echo -e "${YELLOW}Test 4: Fare Quote (Reprice)${NC}"
  echo "POST $API_BASE/flights/reprice"
  echo ""

  REPRICE_PAYLOAD=$(cat <<EOF
{
  "traceId": "$TRACE_ID",
  "resultIndex": "$RESULT_INDEX"
}
EOF
)

  echo "Payload:"
  echo "$REPRICE_PAYLOAD" | jq . 2>/dev/null || echo "$REPRICE_PAYLOAD"
  echo ""

  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST "$API_BASE/flights/reprice" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$REPRICE_PAYLOAD")

  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

  if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response (formatted):"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  else
    echo -e "${YELLOW}⚠ SKIPPED or FAILED${NC}"
    echo "HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 4: Fare Quote (Reprice) - SKIPPED${NC}"
  echo "Reason: No traceId or resultIndex from search"
  echo ""
fi

# ============================================================================
# Test 5: Fare Rules - Only if we have traceId and resultIndex
# ============================================================================
if [ -n "$TRACE_ID" ] && [ -n "$RESULT_INDEX" ]; then
  echo -e "${YELLOW}Test 5: Fare Rules${NC}"
  echo "POST $API_BASE/flights/fare-rules"
  echo ""

  FARE_RULE_PAYLOAD=$(cat <<EOF
{
  "traceId": "$TRACE_ID",
  "resultIndex": "$RESULT_INDEX"
}
EOF
)

  echo "Payload:"
  echo "$FARE_RULE_PAYLOAD" | jq . 2>/dev/null || echo "$FARE_RULE_PAYLOAD"
  echo ""

  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST "$API_BASE/flights/fare-rules" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$FARE_RULE_PAYLOAD")

  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

  if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response (formatted):"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  else
    echo -e "${YELLOW}⚠ SKIPPED or FAILED${NC}"
    echo "HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 5: Fare Rules - SKIPPED${NC}"
  echo "Reason: No traceId or resultIndex from search"
  echo ""
fi

# ============================================================================
# Summary
# ============================================================================
echo "=========================================="
echo -e "${GREEN}Test Suite Completed${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If health & version passed → backend is running"
echo "2. If search passed → TBO integration works"
echo "3. If reprice/fare-rules passed → full flow operational"
echo ""
echo "To test with different routes/dates:"
echo "  ORIGIN=DEL DEST=BOM DEPART_DATE=2025-12-01 ./test-flight-api.sh"
echo ""
echo "To test against PM2 backend (port 5000):"
echo "  API_BASE=http://localhost:5000/api/v1 ./test-flight-api.sh"
echo ""
