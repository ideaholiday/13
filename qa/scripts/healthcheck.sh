#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration from environment with defaults
TBO_BASE="${TBO_BASE:-https://api.tektravels.com}"
AIR_BASE="${AIR_BASE:-$TBO_BASE/BookingEngineService_Air}"
HOTEL_BASE="${HOTEL_BASE:-$TBO_BASE/HotelAPI_V10}"
CLIENT_ID="${TBO_CLIENT_ID:-tboprod}"
USERNAME="${TBO_USERNAME:-Multi.1}"
PASSWORD="${TBO_PASSWORD:-Multi@1234}"
ENDIP="${END_USER_IP:-216.225.197.7}"
DEPART="${DEPART_DATE:-2025-11-20}"
CHECKIN="${CHECKIN:-2025-11-20}"
CITY_ID="${BANGALORE_ID:-115936}"

echo "========================================="
echo "  TBO API Health Check"
echo "========================================="
echo ""

# Step 1: Authentication
echo -e "${YELLOW}⏳ Step 1/3: Authenticating with TBO...${NC}"
AUTH_RESP=$(curl -s -X POST "$TBO_BASE/SharedServices/SharedData.svc/rest/Authenticate" \
  -H "Content-Type: application/json" \
  -d "{\"ClientId\":\"$CLIENT_ID\",\"UserName\":\"$USERNAME\",\"Password\":\"$PASSWORD\",\"EndUserIp\":\"$ENDIP\"}")

TOKEN=$(echo "$AUTH_RESP" | jq -r '.TokenId // empty')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo -e "${RED}❌ Failed to authenticate. Response:${NC}"
  echo "$AUTH_RESP" | jq . || echo "$AUTH_RESP"
  exit 1
fi
echo -e "${GREEN}✅ Authentication successful (Token: ${TOKEN:0:20}...)${NC}"
echo ""

# Step 2: Air Search
echo -e "${YELLOW}⏳ Step 2/3: Testing Air Search (DEL→BOM)...${NC}"
AIR_RESP=$(curl -s -X POST "$AIR_BASE/AirService.svc/rest/Search" \
  -H "Content-Type: application/json" \
  -d "{\"EndUserIp\":\"$ENDIP\",\"TokenId\":\"$TOKEN\",\"AdultCount\":\"1\",\"ChildCount\":\"0\",\"InfantCount\":\"0\",\"JourneyType\":\"1\",\"DirectFlight\":\"false\",\"OneStopFlight\":\"false\",\"Segments\":[{\"Origin\":\"DEL\",\"Destination\":\"BOM\",\"FlightCabinClass\":\"1\",\"PreferredDepartureTime\":\"${DEPART}T00:00:00\",\"PreferredArrivalTime\":\"${DEPART}T00:00:00\"}],\"Sources\":null}")

STATUS=$(echo "$AIR_RESP" | jq -r '.Response.ResponseStatus // empty')
ERROR=$(echo "$AIR_RESP" | jq -r '.Response.Error // empty')
COUNT=$(echo "$AIR_RESP" | jq -r '.Response.Results | length // 0')

if [[ "$STATUS" != "1" ]]; then
  echo -e "${RED}❌ Air search failed. Status: $STATUS, Error: $ERROR${NC}"
  echo "Response:"
  echo "$AIR_RESP" | jq . || echo "$AIR_RESP"
  exit 2
fi

if [[ "$COUNT" -lt 1 ]]; then
  echo -e "${RED}❌ Air search returned no results.${NC}"
  echo "$AIR_RESP" | jq . || echo "$AIR_RESP"
  exit 2
fi

echo -e "${GREEN}✅ Air Search OK ($COUNT result groups found)${NC}"
echo ""

# Step 3: Hotel Search
echo -e "${YELLOW}⏳ Step 3/3: Testing Hotel Search (Bangalore)...${NC}"
HOTEL_RESP=$(curl -s -X POST "$HOTEL_BASE/HotelService.svc/rest/Search" \
  -H "Content-Type: application/json" \
  -d "{\"EndUserIp\":\"$ENDIP\",\"TokenId\":\"$TOKEN\",\"CheckInDate\":\"$CHECKIN\",\"NoOfNights\":\"1\",\"CountryCode\":\"IN\",\"CityId\":\"$CITY_ID\",\"NoOfRooms\":\"1\",\"GuestNationality\":\"IN\",\"RoomGuests\":[{\"NoOfAdults\":\"2\",\"NoOfChild\":\"0\",\"ChildAge\":[]}]}")

# Check if hotel results exist (can be HotelResult, HotelSearchResult, or Results)
if ! echo "$HOTEL_RESP" | jq -e '.HotelResult or .HotelSearchResult or .Results' >/dev/null 2>&1; then
  echo -e "${RED}❌ Hotel search failed or returned no results.${NC}"
  echo "Response:"
  echo "$HOTEL_RESP" | jq . || echo "$HOTEL_RESP"
  exit 3
fi

HOTEL_COUNT=$(echo "$HOTEL_RESP" | jq -r '(.HotelResult // .HotelSearchResult // .Results) | length // 0')
echo -e "${GREEN}✅ Hotel Search OK ($HOTEL_COUNT hotels found)${NC}"
echo ""

# Success
echo "========================================="
echo -e "${GREEN}🎉 All health checks passed!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  ✓ Authentication: Success"
echo "  ✓ Flight Search: $COUNT result groups"
echo "  ✓ Hotel Search: $HOTEL_COUNT hotels"
echo ""

exit 0
