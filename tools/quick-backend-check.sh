#!/bin/bash

# Quick Backend Health Check
# Tests if Laravel backend is responding correctly

API_BASE="${API_BASE:-http://localhost:8000/api/v1}"

echo "Testing backend at: $API_BASE"
echo ""

# Test 1: Health
echo -n "Health check... "
HEALTH=$(curl -s "$API_BASE/health")
if echo "$HEALTH" | grep -q '"ok":true'; then
  echo "✓ OK"
else
  echo "✗ FAILED"
  echo "Response: $HEALTH"
  exit 1
fi

# Test 2: Version
echo -n "Version check... "
VERSION=$(curl -s "$API_BASE/version")
if echo "$VERSION" | grep -q '"version"'; then
  echo "✓ OK"
  VERSION_INFO=$(echo "$VERSION" | jq -r '.version // "unknown"' 2>/dev/null || echo "unknown")
  echo "  Version: $VERSION_INFO"
else
  echo "✗ FAILED"
  echo "Response: $VERSION"
  exit 1
fi

# Test 3: Simple Search
echo -n "Flight search... "
SEARCH=$(curl -s -X POST "$API_BASE/flights/search" \
  -H "Content-Type: application/json" \
  -d '{"origin":"BOM","destination":"LKO","departDate":"2025-11-20","tripType":"O","adults":1,"children":0,"infants":0,"cabinClass":"E"}')

if echo "$SEARCH" | grep -q '"success"'; then
  SUCCESS=$(echo "$SEARCH" | jq -r '.success' 2>/dev/null)
  if [ "$SUCCESS" = "true" ]; then
    echo "✓ OK"
    RESULT_COUNT=$(echo "$SEARCH" | jq -r '.data.results | length' 2>/dev/null || echo "0")
    echo "  Results: $RESULT_COUNT flights"
  else
    echo "⚠ API responded but search failed"
    echo "$SEARCH" | jq . 2>/dev/null || echo "$SEARCH"
  fi
else
  echo "✗ FAILED"
  echo "Response: $SEARCH"
  exit 1
fi

echo ""
echo "=========================================="
echo "All checks passed! Backend is operational."
echo "=========================================="
echo ""
echo "Frontend can now use: $API_BASE"
echo ""
