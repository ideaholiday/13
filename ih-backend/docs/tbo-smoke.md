# TBO Smoke Pack

The backend exposes mocked integrations for TBO (Travel Boutique Online) flights and hotels when `USE_TBO_HOTEL=false` and `USE_TBO_FLIGHT=false` (default). The following `curl` snippets exercise the complete flow. Replace `IH_API_2025_DEMO_KEY` with your real API key when available.

All commands assume the backend is running at `http://127.0.0.1:8000`.

## Hotels

### 1. Hotel search
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/hotels/search \
  -d '{
    "cityId": "164025",
    "cityName": "Goa",
    "countryName": "India",
    "checkIn": "2025-06-01",
    "checkOut": "2025-06-04",
    "rooms": [{ "adults": 2, "children": 0 }]
  }'
```

Record `sessionId`, `results[0].resultIndex`, and `results[0].hotelCode`.

### 2. Available rooms
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/hotels/rooms \
  -d '{
    "sessionId": "<SESSION_ID>",
    "resultIndex": <RESULT_INDEX>,
    "hotelCode": "<HOTEL_CODE>"
  }'
```
Pick a `roomIndex` from the response for the next step.

### 3. Pricing & policies
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/hotels/pricing \
  -d '{
    "sessionId": "<SESSION_ID>",
    "resultIndex": <RESULT_INDEX>,
    "hotelCode": "<HOTEL_CODE>",
    "option": { "combinations": [[<ROOM_INDEX>]] }
  }'
```

### 4. Book
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/hotels/book \
  -d '{
    "sessionId": "<SESSION_ID>",
    "resultIndex": <RESULT_INDEX>,
    "hotelCode": "<HOTEL_CODE>",
    "rooms": [{
      "roomIndex": <ROOM_INDEX>,
      "roomTypeName": "Deluxe",
      "roomTypeCode": "DLX",
      "ratePlanCode": "REFUNDABLE",
      "totalFare": 5099,
      "currency": "INR"
    }],
    "guests": [{ "title": "Mr", "firstName": "Test", "lastName": "Guest" }],
    "contact": { "email": "guest@example.com", "phone": "9000000000" }
  }'
```
Mark the `bookingId` and `tbo.confirmationNo`. Update the booking’s payment status to `paid` before requesting a voucher (via database or the payment webhook).

### 5. Voucher
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/hotels/voucher \
  -d '{
    "bookingId": <BOOKING_ID>,
    "confirmationNo": "<CONFIRMATION_NO>"
  }'
```

## Flights

### 1. Flight search
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/flights/search \
  -d '{
    "segments": [{
      "origin": "DEL",
      "destination": "BOM",
      "departureDate": "2025-06-01"
    }],
    "adults": 1
  }'
```
Capture `SessionId` and `Results[0].ResultIndex`.

### 2. Fare quote
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/flights/fare-quote \
  -d '{
    "sessionId": "<SESSION_ID>",
    "resultIndex": <RESULT_INDEX>
  }'
```

### 3. Book flight
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/flights/book \
  -d '{
    "sessionId": "<SESSION_ID>",
    "resultIndex": <RESULT_INDEX>,
    "passengers": [{ "firstName": "Test", "lastName": "Flyer" }],
    "contact": { "email": "flyer@example.com", "phone": "9000000000" }
  }'
```
Note the `bookingId` and mock `tbo.PNR`. Mark the booking as paid before ticketing.

### 4. Issue ticket
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: IH_API_2025_DEMO_KEY" \
  -X POST http://127.0.0.1:8000/api/v1/flights/ticket \
  -d '{
    "bookingId": <BOOKING_ID>,
    "pnr": "<PNR>"
  }'
```

Each step returns mock data, letting you verify the transport layers without live TBO credentials.
