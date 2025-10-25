#!/bin/bash
set -e

BASE="http://127.0.0.1:8001/api/v1/hotels"
PAY="$(
  echo "$BASE" | sed 's/\/hotels/\/payment/'
)"
KEY="IH_API_2025_DEMO_KEY"

echo "== Hotel Search =="
SEARCH=$(curl -s -X POST "$BASE/search" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d '{
   "cityId": "GOI",
   "cityName": "Goa",
   "checkIn": "2025-10-05",
   "checkOut": "2025-10-07",
   "currency": "INR",
   "nationality": "IN"
 }')
echo "$SEARCH"
SESSION_ID=$(echo "$SEARCH" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("sessionId",""))')
RESULT_INDEX=$(echo "$SEARCH" | python3 -c 'import sys,json; d=json.load(sys.stdin); r=d.get("results") or []; print((r[0] or {}).get("resultIndex","1")) if r else print("1")')
HOTEL_CODE=$(echo "$SEARCH" | python3 -c 'import sys,json; d=json.load(sys.stdin); r=d.get("results") or []; print((r[0] or {}).get("hotelCode","IH-MOCK-101")) if r else print("IH-MOCK-101")')

echo -e "\n== Available Rooms =="
ROOMS=$(curl -s -X POST "$BASE/rooms" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d "{
   \"sessionId\":\"$SESSION_ID\",
   \"resultIndex\":$RESULT_INDEX,
   \"hotelCode\":\"$HOTEL_CODE\"
 }")
echo "$ROOMS"
ROOM_INDEX=$(echo "$ROOMS" | python3 -c 'import sys,json; d=json.load(sys.stdin); r=d.get("rooms") or []; print((r[0] or {}).get("roomIndex",1)) if r else print(1)')
ROOM_JSON=$(echo "$ROOMS" | python3 -c 'import sys,json; d=json.load(sys.stdin); r=(d.get("rooms") or []); import json as j; print(j.dumps(r[0] if r else {}))')

echo -e "\n== Availability & Pricing =="
PRICING=$(curl -s -X POST "$BASE/pricing" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d "{
   \"sessionId\":\"$SESSION_ID\",
   \"resultIndex\":$RESULT_INDEX,
   \"hotelCode\":\"$HOTEL_CODE\",
   \"option\":{\"combinations\":[[$ROOM_INDEX]]}
 }")
echo "$PRICING"

echo -e "\n== Book (voucherBooking=false) =="
BOOK=$(curl -s -X POST "$BASE/book" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d "{
   \"sessionId\":\"$SESSION_ID\",
   \"resultIndex\":$RESULT_INDEX,
   \"hotelCode\":\"$HOTEL_CODE\",
   \"guestNationality\":\"IN\",
   \"rooms\":[ $ROOM_JSON ],
   \"guests\":[{\"title\":\"Mr\",\"firstName\":\"Test\",\"lastName\":\"Guest\",\"age\":30,\"paxType\":\"Adult\"}],
   \"contact\":{\"email\":\"qa@example.com\",\"phone\":\"9999999999\",\"address\":\"India\"},
   \"voucherBooking\": false
 }")
echo "$BOOK"
BOOKING_ID=$(echo "$BOOK" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("bookingId","1"))')
AMOUNT=$(echo "$PRICING" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(int((d.get("priceVerification") or {}).get("finalPrice",5099)))')

echo -e "\n== Payment Order (mock) =="
ORDER=$(curl -s -X POST "$PAY/order" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d "{\"bookingId\":$BOOKING_ID, \"amount\":$AMOUNT}")
echo "$ORDER"

echo -e "\n== Webhook simulate (mark paid) =="
WH=$(curl -s -X POST "$PAY/webhook" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d '{"event":"payment.captured","payload":{"payment":{"entity":{"order_id":"order_mock","id":"pay_mock_hotels"}}}}')
echo "$WH"

echo -e "\n== Voucher =="
VOUCH=$(curl -s -X POST "$BASE/voucher" \
 -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
 -d "{\"bookingId\":$BOOKING_ID, \"confirmationNo\":\"CONF123\"}")
echo "$VOUCH"

echo -e "\n== Booking Detail =="
curl -s "$BASE/booking?bookingId=$BOOKING_ID" -H "X-Api-Key: $KEY"
echo -e "\n\nAll done ✅"
