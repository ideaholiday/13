# TBO API Integration - Complete Guide ✅

**Date:** October 16, 2025  
**Status:** Live API Integration Complete  
**Mode:** TBO Flight API Enabled (Hotels: Mock Mode)

---

## 📋 Overview

This document describes the complete TBO (Travel Boutique Online) API integration for IdeaHoliday platform.

### What's Integrated:
- ✅ **Flight Search** - Live TBO API (AirService)
- ✅ **Flight Booking** - Live TBO API
- ⏳ **Hotel Search** - Mock data (TBO integration structure ready)
- ⏳ **Hotel Booking** - Mock data (TBO integration structure ready)
- 🔜 **Payment Gateway** - Razorpay (deferred for later)

---

## 🔧 Backend Configuration

### Environment Variables (`.env`)

```bash
# TBO API Configuration
USE_MOCK=false                          # Set to false for live TBO API
USE_TBO_FLIGHT=true                     # Enable TBO Flight API
USE_TBO_HOTEL=false                     # Hotels still use mock (set true when ready)

# TBO Credentials
TBO_CLIENT_ID=tboprod
TBO_USERNAME=Multi.1
TBO_PASSWORD=Multi@1234
TBO_ENDUSER_IP=127.0.0.1

# TBO Endpoints
TBO_FLIGHT_AUTH=https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc
TBO_FLIGHT_SEARCH=https://tboapi.travelboutiqueonline.com/BookingEngineService_Air/AirService.svc
TBO_FLIGHT_BOOK=https://booking.travelboutiqueonline.com/BookingEngineService_Air/AirService.svc
TBO_HOTEL_SEARCH=https://api.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc
TBO_HOTEL_BOOK=https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc

# Optional: Proxy (if using SOCKS5 proxy)
TBO_PROXY=socks5h://127.0.0.1:1080

# Optional: Markup (commission %)
IH_MARKUP_FLIGHT_PCT=0                  # Add 0% markup on flight prices
IH_MARKUP_HOTEL_PCT=0                   # Add 0% markup on hotel prices
```

### Service Configuration (`config/services.php`)

Already configured - pulls from .env:

```php
'tbo' => [
    'flight_auth_url' => env('TBO_FLIGHT_AUTH'),
    'flight_search_url' => env('TBO_FLIGHT_SEARCH'),
    'flight_book_url' => env('TBO_FLIGHT_BOOK'),
    'hotel_search_url' => env('TBO_HOTEL_SEARCH'),
    'hotel_book_url' => env('TBO_HOTEL_BOOK'),
    'client_id' => env('TBO_CLIENT_ID'),
    'username' => env('TBO_USERNAME'),
    'password' => env('TBO_PASSWORD'),
    'end_user_ip' => env('TBO_ENDUSER_IP', '127.0.0.1'),
    'use_mock' => env('USE_MOCK', true),
    'enable_hotel_api' => filter_var(env('USE_TBO_HOTEL', false), FILTER_VALIDATE_BOOLEAN),
    'enable_flight_api' => filter_var(env('USE_TBO_FLIGHT', false), FILTER_VALIDATE_BOOLEAN),
    'flight_markup_pct' => (float) env('IH_MARKUP_FLIGHT_PCT', 0),
    'hotel_markup_pct' => (float) env('IH_MARKUP_HOTEL_PCT', 0),
],
```

---

## 🛫 Flight API Endpoints

### 1. Search Flights
**POST** `/api/v1/flights/search`

**Request:**
```json
{
  "origin": "DEL",
  "destination": "BOM",
  "departDate": "2025-10-25",
  "returnDate": "2025-10-30",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E",
  "tripType": "O"
}
```

**Parameters:**
- `origin` (required): IATA airport code (3 letters)
- `destination` (required): IATA airport code (3 letters)
- `departDate` (required): Departure date (YYYY-MM-DD)
- `returnDate` (optional): Return date for round-trip
- `adults` (required): Number of adults (1-9)
- `children` (optional): Number of children (0-8)
- `infants` (optional): Number of infants (0-8)
- `cabinClass` (optional): E=Economy, PE=Premium Economy, B=Business, F=First
- `tripType` (optional): O=One-way, R=Round-trip, M=Multi-city

**Response:**
```json
{
  "success": true,
  "data": {
    "traceId": "TBO_TRACE_123",
    "results": [
      {
        "resultIndex": "1",
        "fare": {
          "currency": "INR",
          "baseFare": 4500,
          "tax": 450,
          "total": 4950
        },
        "segments": [...],
        "airline": {...}
      }
    ]
  }
}
```

### 2. Get Fare Quote
**POST** `/api/v1/flights/fare-quote`

**Request:**
```json
{
  "resultIndex": "1",
  "traceId": "TBO_TRACE_123"
}
```

### 3. Book Flight
**POST** `/api/v1/flights/book`

**Request:**
```json
{
  "resultIndex": "1",
  "traceId": "TBO_TRACE_123",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "type": "ADT",
      "dateOfBirth": "1990-01-15",
      "gender": "M",
      "passportNo": "A1234567",
      "passportExpiry": "2028-12-31"
    }
  ],
  "contactInfo": {
    "email": "john.doe@example.com",
    "phone": "+919876543210",
    "address": "123 Main Street, Delhi"
  }
}
```

**Passenger Types:**
- `ADT` - Adult (12+ years)
- `CHD` - Child (2-11 years)
- `INF` - Infant (0-2 years)

### 4. Issue Ticket
**POST** `/api/v1/flights/ticket`

**Request:**
```json
{
  "bookingId": "TBO_BOOKING_123",
  "pnr": "ABC123"
}
```

### 5. Get Booking Details
**POST** `/api/v1/flights/booking-details`

**Request:**
```json
{
  "bookingId": "TBO_BOOKING_123",
  "pnr": "ABC123"
}
```

---

## 🏨 Hotel API Endpoints

### 1. Search Hotels
**POST** `/api/v1/hotels/search`

**Request:**
```json
{
  "cityCode": "GOA",
  "checkInDate": "2025-10-25",
  "checkOutDate": "2025-10-28",
  "rooms": [
    {
      "adults": 2,
      "children": 1,
      "childAges": [8]
    }
  ],
  "nationality": "IN",
  "currency": "INR"
}
```

**Current Status:** Returns mock data (USE_TBO_HOTEL=false)

### 2. Get Available Rooms
**POST** `/api/v1/hotels/rooms`

### 3. Get Room Pricing
**POST** `/api/v1/hotels/pricing`

### 4. Book Hotel
**POST** `/api/v1/hotels/book`

### 5. Get Booking Details
**POST** `/api/v1/hotels/booking-details`

---

## 🖥️ Frontend Configuration

### Environment Variables (`.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: API Key (if required in production)
# NEXT_PUBLIC_API_KEY=your-api-key-here
```

### Frontend API Client

Located in: `ih-frontend/src/lib/api-client.ts`

```typescript
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  timeout: 30000,
  retries: 3,
  enableLogging: true
})
```

---

## 🧪 Testing Guide

### Step 1: Start Backend Server

```bash
cd ih-backend
php artisan serve --host=127.0.0.1 --port=8000
```

Server will be available at: `http://localhost:8000`

### Step 2: Test Flight Search (Backend Direct)

```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DEL",
    "destination": "BOM",
    "departDate": "2025-10-25",
    "adults": 1,
    "cabinClass": "E",
    "tripType": "O"
  }'
```

**Expected Response:**
- If `USE_TBO_FLIGHT=true`: Live TBO API data with real flight results
- If `USE_TBO_FLIGHT=false` or `USE_MOCK=true`: Mock flight data

### Step 3: Start Frontend Server

```bash
cd ih-frontend
npm run dev
```

Frontend will be available at: `http://localhost:3010`

### Step 4: Test Flight Search (Frontend)

1. Open: `http://localhost:3010`
2. Enter flight search details:
   - From: Delhi (DEL)
   - To: Mumbai (BOM)
   - Date: Future date
   - Passengers: 1 Adult
3. Click "Search Flights"
4. Check browser Network tab for API calls to `http://localhost:8000/api/v1/flights/search`

### Step 5: Check Logs

```bash
# Backend logs
tail -f ih-backend/storage/logs/laravel.log

# Look for:
# [2025-10-16 ...] local.INFO: Flight search request {"payload":...}
# [2025-10-16 ...] local.INFO: Flight search response {"count":...}
```

---

## 🐛 Troubleshooting

### Issue 1: "Flight search failed"

**Possible Causes:**
1. `USE_TBO_FLIGHT=false` or `USE_MOCK=true` in .env
2. TBO credentials incorrect
3. Network connectivity issues
4. TBO API endpoints down

**Solution:**
```bash
# Check .env file
grep -E "USE_MOCK|USE_TBO_FLIGHT|TBO_CLIENT_ID|TBO_USERNAME|TBO_PASSWORD" ih-backend/.env

# Should show:
# USE_MOCK=false
# USE_TBO_FLIGHT=true
# TBO_CLIENT_ID=tboprod
# TBO_USERNAME=Multi.1
# TBO_PASSWORD=Multi@1234
```

### Issue 2: CORS errors in frontend

**Solution:**
Check `ih-backend/config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3010'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### Issue 3: "SQLSTATE[HY000]: General error: 1 no such table"

**Solution:**
```bash
cd ih-backend
php artisan migrate
```

### Issue 4: Frontend shows "No flights found"

**Check:**
1. Backend server running on port 8000
2. Frontend .env.local has correct `NEXT_PUBLIC_API_BASE_URL`
3. Browser console for error messages
4. Network tab shows successful API calls

---

## 📂 File Structure

### Backend
```
ih-backend/
├── .env                              # TBO configuration
├── config/services.php               # TBO service config
├── app/
│   ├── Http/Controllers/Api/V1/
│   │   ├── FlightController.php      # ✅ NEW: Flight API endpoints
│   │   ├── HotelController.php       # ✅ NEW: Hotel API endpoints
│   │   └── ...
│   └── Services/TBO/
│       ├── AirService.php            # TBO Flight API integration
│       ├── HotelService.php          # TBO Hotel API integration
│       ├── SoapClient12.php          # SOAP 1.2 client for TBO
│       └── SoapXmlClient.php         # XML-based SOAP client
└── routes/
    └── api.php                       # ✅ UPDATED: Use controllers instead of closures
```

### Frontend
```
ih-frontend/
├── .env.local                        # API configuration
├── src/
│   ├── lib/
│   │   ├── api-client.ts             # API client wrapper
│   │   └── api.ts                    # API methods
│   └── components/
│       └── flights/
│           ├── airport-selector.tsx  # ✅ UPDATED: Uses 4,858 airports
│           └── flight-search-form.tsx
```

---

## 🚀 Deployment Checklist

### Production Environment Variables

```bash
# Backend (.env)
APP_ENV=production
APP_DEBUG=false
USE_MOCK=false
USE_TBO_FLIGHT=true
USE_TBO_HOTEL=true                    # Enable when hotel API is ready

# Update TBO credentials for production
TBO_CLIENT_ID=your-prod-client-id
TBO_USERNAME=your-prod-username
TBO_PASSWORD=your-prod-password
TBO_ENDUSER_IP=your-production-server-ip

# Add production markup
IH_MARKUP_FLIGHT_PCT=5                # 5% commission
IH_MARKUP_HOTEL_PCT=8                 # 8% commission
```

```bash
# Frontend (.env.production)
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_API_KEY=your-production-api-key
```

### Pre-Deployment Tests

- [ ] Test flight search (DEL to BOM)
- [ ] Test round-trip search
- [ ] Test multi-city search
- [ ] Test booking flow (up to payment)
- [ ] Test hotel search
- [ ] Verify logs for errors
- [ ] Check response times
- [ ] Test with different browsers
- [ ] Test mobile responsiveness

---

## 💡 Next Steps

### Immediate (Demo Ready ✅)
- ✅ Flight search with live TBO API
- ✅ Flight booking (mock passengers)
- ⏳ Payment gateway (deferred)

### Short Term (Production)
1. **Enable Hotel API:**
   - Set `USE_TBO_HOTEL=true`
   - Implement TBO hotel search in `HotelService.php`
   - Test hotel booking flow

2. **Add Payment Gateway:**
   - Integrate Razorpay
   - Test payment flow
   - Add webhook handlers

3. **Error Handling:**
   - Improve error messages
   - Add retry logic
   - Implement fallback mechanisms

4. **Performance:**
   - Add caching for frequent searches
   - Optimize TBO API calls
   - Add rate limiting

### Long Term (Enhancements)
- Multi-currency support
- Price alerts
- Booking management dashboard
- Analytics and reporting
- A/B testing for pricing

---

## 📞 Support

- **TBO API Documentation:** [TBO Developer Portal](https://www.travelboutiqueonline.com)
- **Laravel Logs:** `ih-backend/storage/logs/laravel.log`
- **Frontend Logs:** Browser Console (F12)

---

**Status:** ✅ **TBO Flight API Integration Complete - Ready for Demo**  
**Next:** Test flight search and proceed with payment gateway integration
