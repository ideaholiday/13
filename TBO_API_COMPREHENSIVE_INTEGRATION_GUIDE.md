# TBO API Comprehensive Integration Guide
**Complete Developer Reference for Easy TBO Integration**

**Document Date:** October 24, 2025  
**Version:** 2.0 - Complete Integration Documentation  
**Project:** iHoliday Travel Booking Platform

---

## Table of Contents
1. [TBO Credentials Setup](#1-tbo-credentials-setup)
2. [Architecture Overview](#2-architecture-overview)
3. [Flight API Endpoints & Implementation](#3-flight-api-endpoints--implementation)
4. [Hotel API Endpoints & Implementation](#4-hotel-api-endpoints--implementation)
5. [Request/Response Examples](#5-requestresponse-examples)
6. [Authentication Methods](#6-authentication-methods)
7. [Error Handling](#7-error-handling)
8. [Development Setup](#8-development-setup)
9. [Testing & Troubleshooting](#9-testing--troubleshooting)
10. [Best Practices](#10-best-practices)

---

## 1. TBO Credentials Setup

### 1.1 Required Credentials

```bash
# Production Credentials (from TBO Support)
TBO_CLIENT_ID=tboprod
TBO_USERNAME=LKOM258
TBO_PASSWORD=New@api/LKO$582
TBO_ENDUSER_IP=157.245.100.148

# Demo Credentials (for testing)
TBO_CLIENT_ID=demo_client
TBO_USERNAME=demo_user
TBO_PASSWORD=demo_password
TBO_ENDUSER_IP=127.0.0.1
```

### 1.2 Environment Configuration

**Backend `.env.local` Example:**

```bash
# TBO Settings
USE_TBO_HOTEL=false          # Enable hotel API
USE_TBO_FLIGHT=true         # Enable flight API
USE_MOCK=true               # Use mock data for testing

# TBO Credentials
TBO_CLIENT_ID=tboprod
TBO_USERNAME=LKOM258
TBO_PASSWORD=New@api/LKO$582
TBO_ENDUSER_IP=157.245.100.148

# Optional: Proxy for TBO API calls
TBO_PROXY=socks5h://127.0.0.1:1080

# Flight Mode (soap or rest - REST is recommended)
TBO_FLIGHT_MODE=rest

# Markup Percentages
IH_MARKUP_FLIGHT_PCT=3
IH_MARKUP_HOTEL_PCT=5
```

**Frontend `.env.local` Example:**

```bash
# Backend API Connection
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# TBO Live API URLs
TBO_AIR_API=https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc
TBO_AIR_BOOK=https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc
TBO_HOTEL_SEARCH=https://api.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc
TBO_HOTEL_BOOK=https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc

# TBO Credentials
TBO_CLIENT_ID=tboprod
TBO_USERNAME=LKOM258
TBO_PASSWORD=New@api/LKO$582
TBO_ENDUSER_IP=157.245.100.148
```

### 1.3 Backend Configuration File

File: `ih-backend/config/services.php`

**Key TBO Configuration:**

```php
'tbo' => [
    // Flight Mode
    'flight_mode' => env('TBO_FLIGHT_MODE', 'soap'),
    
    // REST Endpoints (Recommended)
    'flight_auth_rest_url' => env('TBO_FLIGHT_AUTH_REST', 
        'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate'),
    
    'flight_search_rest_url' => env('TBO_FLIGHT_SEARCH_REST',
        'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search'),
    
    'flight_book_rest_url' => env('TBO_FLIGHT_BOOK_REST',
        'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Book'),
    
    // Hotel Endpoints
    'hotel_auth_rest_url' => 'http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
    'hotel_search_url' => 'https://affiliate.tektravels.com/HotelAPI/Search',
    'hotel_book_url' => 'https://HotelBE.tektravels.com/hotelservice.svc/rest/book/',
    
    // Credentials
    'client_id' => env('TBO_CLIENT_ID'),
    'username' => env('TBO_USERNAME'),
    'password' => env('TBO_PASSWORD'),
    'end_user_ip' => env('TBO_ENDUSER_IP', '127.0.0.1'),
    
    // Configuration Flags
    'use_mock' => env('USE_MOCK', false),
    'enable_flight_api' => env('USE_TBO_FLIGHT', true),
    'enable_hotel_api' => env('USE_TBO_HOTEL', false),
]
```

---

## 2. Architecture Overview

### 2.1 System Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                           │
│              (ih-frontend/src/lib/flight-api.ts)                    │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                    HTTP/REST
                    /api/v1/*
                         │
┌────────────────────────▼──────────────────────────────────────────┐
│              Backend (Laravel 12 - PHP 8.2+)                      │
│         (ih-backend/app/Http/Controllers/Api/V1)                  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ FlightController / HotelsController                      │    │
│  │  - Validates requests                                    │    │
│  │  - Applies business logic & markups                      │    │
│  │  - Formats responses                                     │    │
│  └────────────────┬───────────────────────────────┬────────┘    │
│                   │                               │               │
│  ┌────────────────▼──────────┐  ┌────────────────▼────────────┐ │
│  │ AirService (SOAP/REST)    │  │ HotelService (REST)         │ │
│  │ - Search                  │  │ - Search                    │ │
│  │ - FareQuote               │  │ - PreBook                   │ │
│  │ - Book                    │  │ - Book                      │ │
│  │ - Ticket                  │  │ - Cancel                    │ │
│  └────────────────┬──────────┘  └────────────────┬────────────┘ │
└────────────────────┼──────────────────────────────┼──────────────┘
                     │                              │
        ┌────────────▼────────────┐  ┌──────────────▼──────────────┐
        │  TBO Flight APIs        │  │  TBO Hotel APIs             │
        ├────────────────────────┤  ├─────────────────────────────┤
        │ Endpoint:              │  │ Endpoint:                   │
        │ https://tboapi.travel  │  │ https://api.travelboutique  │
        │ boutiqueonline.com/    │  │ online.com/HotelAPI_V10/    │
        │ AirAPI_V10/AirService  │  │ HotelService.svc/rest/*     │
        │ .svc/rest/*            │  │                             │
        └────────────────────────┘  └─────────────────────────────┘
```

### 2.2 Service Classes

**Location:** `ih-backend/app/Services/TBO/`

- **AirService.php** (1247 lines)
  - Handles all flight operations
  - Supports SOAP and REST modes
  - Applies flight markup percentages
  - Manages mock data for testing

- **HotelService.php** (616 lines)
  - Handles hotel search, booking, cancellation
  - Authentication with token management
  - Pagination support
  - Static data caching

---

## 3. Flight API Endpoints & Implementation

### 3.1 Flight Search

**Endpoint:** `POST /api/v1/flights/search`

**Service:** `App\Http\Controllers\Api\V1\FlightController::search()`

**Key Features:**
- Supports round-trip and one-way flights
- Multiple passenger types (adults, children, infants)
- Cabin class selection (Economy, Premium, Business, First)
- Flexible date handling

### 3.2 Flight Fare Quote (Reprice)

**Endpoint:** `POST /api/v1/flights/fare-quote` (also `/flights/reprice`)

**Purpose:** Verify price before booking

**Service:** `AirService::fareQuote()`

### 3.3 Flight Booking

**Endpoint:** `POST /api/v1/flights/book`

**Service:** `AirService::book()`

**Process:**
1. Validate passenger information
2. Apply payment rules
3. Book with TBO
4. Generate PNR

### 3.4 Flight Ticketing

**Endpoint:** `POST /api/v1/flights/ticket`

**Service:** `AirService::ticket()`

**Purpose:** Issue tickets after booking confirmation

### 3.5 Booking Details

**Endpoints:**
- `GET /api/v1/bookings/{id}` - Get booking
- `POST /api/v1/flights/booking-details` - Get detailed booking

**Service:** `AirService::pnr()`

### 3.6 Additional Flight Services

| Endpoint | Method | Purpose | Service |
|----------|--------|---------|---------|
| `/flights/fare-rule` | POST | Get cancellation/change policies | `AirService::fareRule()` |
| `/flights/ssr` | POST | Special service requests (seats, meals) | `AirService::ssr()` |
| `/flights/calendar-fare` | POST | Calendar-based pricing | `AirService::getCalendarFare()` |
| `/flights/price-rbd` | POST | RBD (Revenue Base Driving) pricing | `AirService::priceRBD()` |
| `/flights/get-cancellation-charges` | POST | Calculate cancellation fees | `AirService::getCancellationCharges()` |

---

## 4. Hotel API Endpoints & Implementation

### 4.1 Static Data Endpoints

#### Countries List
**Endpoint:** `GET /api/v1/hotels/countries`

```php
Response::json([
    'success' => true,
    'data' => [
        ['id' => 1, 'iso2' => 'AE', 'name' => 'United Arab Emirates', 'tbo_country_code' => 'AE'],
        ['id' => 2, 'iso2' => 'IN', 'name' => 'India', 'tbo_country_code' => 'IN'],
        // ... more countries
    ]
])
```

#### Cities List
**Endpoint:** `GET /api/v1/hotels/cities?country=AE`

```php
Response::json([
    'success' => true,
    'data' => [
        ['id' => 1, 'name' => 'Dubai', 'tbo_city_code' => 'DXB', 'latitude' => 25.2048, 'longitude' => 55.2708],
        ['id' => 2, 'name' => 'Abu Dhabi', 'tbo_city_code' => 'AUH', 'latitude' => 24.4539, 'longitude' => 54.3773],
        // ... more cities
    ]
])
```

#### Hotel Codes
**Endpoint:** `GET /api/v1/hotels/hotel-codes?city=DXB`

```php
Response::json([
    'success' => true,
    'data' => [
        ['id' => 1, 'tbo_hotel_code' => 'ARMANI', 'name' => 'Armani Hotel Dubai', 'star_rating' => 5, 'guest_rating' => 4.8],
        // ... more hotels
    ]
])
```

### 4.2 Search & Booking Endpoints

#### Hotel Search
**Endpoint:** `POST /api/v1/hotels/search`

**Controller:** `HotelsController::search()`

#### PreBook (Price Verification)
**Endpoint:** `POST /api/v1/hotels/prebook`

**Controller:** `HotelsController::preBook()`

**Purpose:** Verify price, policies, and requirements before booking

#### Hotel Booking
**Endpoint:** `POST /api/v1/hotels/book`

**Controller:** `HotelsController::book()`

#### Booking Details
**Endpoint:** `GET /api/v1/hotels/booking/{id}`

**Controller:** `HotelsController::booking()`

#### Cancellation
**Endpoint:** `POST /api/v1/hotels/cancel`

**Controller:** `HotelsController::cancel()`

#### Cancellation Status
**Endpoint:** `GET /api/v1/hotels/cancel-status/{changeRequestId}`

---

## 5. Request/Response Examples

### 5.1 Flight Search Request

```json
{
  "segments": [
    {
      "origin": "BOM",
      "destination": "LKO",
      "departureDate": "2025-12-15"
    }
  ],
  "tripType": "O",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E"
}
```

**Note:** For round-trip, add a second segment:
```json
{
  "segments": [
    {
      "origin": "BOM",
      "destination": "LKO",
      "departureDate": "2025-12-15"
    },
    {
      "origin": "LKO",
      "destination": "BOM",
      "departureDate": "2025-12-22"
    }
  ],
  "tripType": "R",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E"
}
```

### 5.2 Flight Search Response

```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "TraceId": "TRACE-123456-ABC",
      "Origin": "BOM",
      "Destination": "LKO",
      "Results": [
        {
          "ResultIndex": "0",
          "IsLCC": false,
          "IsRefundable": true,
          "Fare": {
            "Currency": "INR",
            "BaseFare": 3500,
            "Tax": 650,
            "OfferedFare": 4150
          },
          "Segments": [
            [
              {
                "DepTime": "2025-12-15T06:00:00",
                "ArrTime": "2025-12-15T08:30:00",
                "Duration": 150,
                "Airline": {
                  "AirlineCode": "6E",
                  "AirlineName": "IndiGo",
                  "FlightNumber": "IE-633"
                },
                "Baggage": "20 KG",
                "CabinBaggage": "6 KG",
                "Origin": {
                  "Airport": {
                    "AirportCode": "BOM",
                    "AirportName": "Bombay"
                  }
                },
                "Destination": {
                  "Airport": {
                    "AirportCode": "LKO",
                    "AirportName": "Lucknow"
                  }
                }
              }
            ]
          ]
        }
      ]
    }
  }
}
```

### 5.3 Flight Fare Quote Request

```json
{
  "resultIndex": "0",
  "traceId": "TRACE-123456-ABC"
}
```

### 5.4 Flight Booking Request

```json
{
  "resultIndex": "0",
  "traceId": "TRACE-123456-ABC",
  "passengers": [
    {
      "type": "ADT",
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "gender": "M",
      "passport": "A12345678",
      "passportExpiry": "2030-06-20",
      "nationality": "IN",
      "mobile": "+91-9876543210",
      "email": "john@example.com"
    }
  ],
  "contactPerson": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+91-9876543210",
    "address": "123 Main St"
  }
}
```

### 5.5 Hotel Search Request

```json
{
  "cityId": "DXB",
  "cityName": "Dubai",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "currency": "AED",
  "nationality": "IN",
  "rooms": [
    {
      "adults": 2,
      "children": 1,
      "childAges": [8]
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

### 5.6 Hotel Search Response

```json
{
  "success": true,
  "data": [
    {
      "id": "HTL123",
      "code": "ARMANI",
      "name": "Armani Hotel Dubai",
      "address": "Downtown Dubai",
      "starRating": 5,
      "guestRating": 4.8,
      "totalRooms": 160,
      "roomTypes": [
        {
          "roomTypeId": "RM001",
          "roomType": "Suite Deluxe",
          "occupancy": 2,
          "price": 450,
          "currency": "AED",
          "availability": "Available",
          "tax": 45,
          "totalPrice": 495
        }
      ]
    }
  ],
  "pagination": {
    "traceId": "HTL_ABC123XYZ",
    "page": 1,
    "pageSize": 20,
    "total": 145,
    "lastPage": 8,
    "from": 1,
    "to": 20
  }
}
```

### 5.7 Hotel PreBook Request

```json
{
  "bookingCode": "ARMANI_001",
  "traceId": "HTL_ABC123XYZ"
}
```

### 5.8 Hotel PreBook Response

```json
{
  "success": true,
  "data": {
    "totalFare": 2475,
    "taxes": 247.50,
    "policies": {
      "cancellation": "Free cancellation up to 48 hours before check-in",
      "isPriceChanged": false,
      "isPolicyChanged": false
    },
    "constraints": {
      "isPanRequired": true,
      "isPassportRequired": false
    }
  }
}
```

### 5.9 Hotel Booking Request

```json
{
  "bookingCode": "ARMANI_001",
  "traceId": "HTL_ABC123XYZ",
  "guest": {
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+971-501234567",
    "nationality": "IN"
  },
  "payment": {
    "method": "CC",
    "currency": "AED"
  }
}
```

---

## 6. Authentication Methods

### 6.1 REST API Authentication

#### Flight API Authentication

```php
// AirService::authenticateRest()
$payload = [
    'ClientId' => config('services.tbo.client_id'),
    'UserName' => config('services.tbo.username'),
    'Password' => config('services.tbo.password'),
    'EndUserIp' => config('services.tbo.end_user_ip'),
];

$response = $client->post(
    'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate',
    ['json' => $payload]
);

// Response contains Token that's used in subsequent requests
$token = $response['Token'];
```

#### Hotel API Authentication

```php
// HotelService::authenticate()
$payload = [
    'ClientId' => config('services.tbo.client_id'),
    'UserName' => config('services.tbo.username'),
    'Password' => config('services.tbo.password'),
    'EndUserIp' => config('services.tbo.end_user_ip'),
];

$response = $client->post(
    'http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
    [
        'json' => $payload,
        'auth' => [config('services.tbo.username'), config('services.tbo.password')],
    ]
);

// Response contains TokenId
$tokenId = $response['TokenId'];
```

### 6.2 SOAP API Authentication

For SOAP endpoints, authentication is typically handled through SOAP headers:

```php
$soapHeaders = new \SoapHeader(
    'http://TekTravel/FlightApi',
    'Authentication',
    [
        'ClientId' => config('services.tbo.client_id'),
        'UserName' => config('services.tbo.username'),
        'Password' => config('services.tbo.password'),
    ],
    false
);

$soapClient = new \SoapClient($wsdl, [
    'trace' => 1,
    'exceptions' => true,
    'connection_timeout' => 30,
]);

$soapClient->__setSoapHeaders($soapHeaders);
```

---

## 7. Error Handling

### 7.1 Common Error Codes

#### Flight API Errors

| Code | Message | Solution |
|------|---------|----------|
| 1 | Success | - |
| -1 | Generic Error | Check request format |
| 100 | Invalid Credentials | Verify TBO_CLIENT_ID, username, password |
| 101 | Session Expired | Re-authenticate |
| 102 | Invalid Request | Check XML/JSON format |
| 103 | No Results | Try different search criteria |
| 104 | Server Error | Contact TBO support |
| 105 | Invalid Segment | Check origin/destination airport codes |

#### Hotel API Errors

| Code | Message | Solution |
|------|---------|----------|
| 0 | Error | Check error details in response |
| 1 | Success | - |
| -1 | Connection Error | Check internet & proxy |
| 500 | Authentication Failed | Verify credentials |
| 501 | Invalid Token | Re-authenticate |
| 502 | No Hotels Found | Try different dates/location |

### 7.2 Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error",
  "suggestions": [
    "Try again later",
    "Contact support"
  ],
  "traceId": "TRACE-ID-FOR-SUPPORT"
}
```

### 7.3 Handling Timeouts

```php
// In configuration
'timeout' => 30, // seconds

// In request
$response = $client->post($url, [
    'timeout' => 30,
    'connect_timeout' => 10,
]);
```

---

## 8. Development Setup

### 8.1 Backend Setup

```bash
# Navigate to backend
cd ih-backend

# Install dependencies
composer install

# Create environment file
cp .env.example .env.local

# Edit .env.local with TBO credentials
# Then run migrations
php artisan migrate

# Start development server
php artisan serve --host=127.0.0.1 --port=8000

# In another terminal: queue listener
php artisan queue:listen --tries=1

# In another terminal: pail (logs)
php artisan pail --timeout=0
```

### 8.2 Frontend Setup

```bash
# Navigate to frontend
cd ih-frontend

# Install dependencies
npm install

# Create .env.local with configuration
cp .env.example .env.local

# Start development server
npm run dev
```

### 8.3 Complete Dev Environment

```bash
# From backend directory
composer run dev

# This runs:
# - php artisan serve
# - php artisan queue:listen
# - php artisan pail
# - npm run dev (frontend)
```

### 8.4 Using PM2 for Production

```bash
# Install PM2 globally
npm install -g pm2

# Start services
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Restart
pm2 restart iholiday-api
pm2 restart iholiday-frontend
```

---

## 9. Testing & Troubleshooting

### 9.1 Mock Mode Testing

```bash
# Enable mock mode in .env
USE_MOCK=true
USE_TBO_FLIGHT=false
USE_TBO_HOTEL=false
```

Mock data is useful for:
- Development without API costs
- Testing UI components
- Rate-limiting protection
- Offline development

### 9.2 Test Flight Search

```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "segments": [{
      "origin": "BOM",
      "destination": "LKO",
      "departureDate": "2025-12-15"
    }],
    "tripType": "O",
    "adults": 1,
    "cabinClass": "E"
  }'
```

### 9.3 Test Hotel Search

```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "DXB",
    "cityName": "Dubai",
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "rooms": [{"adults": 2}]
  }'
```

### 9.4 Debug Configuration

```bash
# Check TBO configuration
curl http://localhost:8000/api/v1/debug/config
```

Response shows:
- Enable/disable flags
- Flight mode (SOAP/REST)
- TBO proxy status
- Mock data status

### 9.5 Common Issues & Solutions

#### Issue: "401 Unauthorized"
```
Solution: Check TBO credentials in .env
- Verify TBO_CLIENT_ID, TBO_USERNAME, TBO_PASSWORD
- Ensure credentials are for the correct environment (prod/demo)
```

#### Issue: "CORS Error"
```
Solution: Check nginx.conf for CORS headers
- Ensure X-API-Key header is allowed
- Verify API_BASE_URL matches backend
```

#### Issue: "Connection Timeout"
```
Solution:
- Increase timeout in config (default: 30s)
- Check internet connection
- Verify TBO API is accessible
- Check if proxy is required
```

#### Issue: "No Results Found"
```
Solution:
- Verify airport codes (IATA 3-letter codes)
- Check dates are in future
- Verify city codes for hotels
- Try nearby airports/cities
```

---

## 10. Best Practices

### 10.1 Request Validation

Always validate input before sending to TBO:

```php
$validator = Validator::make($request->all(), [
    'segments' => 'required|array|min:1',
    'segments.*.origin' => 'required|string|size:3',
    'segments.*.destination' => 'required|string|size:3',
    'segments.*.departureDate' => 'required|date|after_or_equal:today',
    'adults' => 'required|integer|min:1|max:9',
    'children' => 'nullable|integer|min:0|max:8',
    'cabinClass' => 'required|in:E,P,B,F',
]);
```

### 10.2 Rate Limiting

Implement rate limiting to protect against abuse:

```php
// In routes/api.php
Route::middleware('throttle:100,15')->group(function () {
    Route::post('/flights/search', [FlightController::class, 'search']);
});
```

### 10.3 Response Caching

Cache static data to reduce API calls:

```php
// Hotels controller
$countries = Cache::remember('tbo_countries', now()->addDays(7), function () {
    return $this->hotelService->countryList();
});
```

### 10.4 Error Logging

Log all TBO API interactions:

```php
Log::info('Flight search request', [
    'origin' => $origin,
    'destination' => $destination,
    'departDate' => $departDate,
    'timestamp' => now(),
]);

Log::error('TBO API Error', [
    'message' => $e->getMessage(),
    'trace' => $e->getTraceAsString(),
]);
```

### 10.5 Pagination

For large result sets, always use pagination:

```php
$page = $request->get('page', 1);
$pageSize = $request->get('pageSize', 20);
$offset = ($page - 1) * $pageSize;
$paginatedResults = array_slice($results, $offset, $pageSize);
```

### 10.6 Markup Application

Apply markups consistently:

```php
$baseFare = $flight['Fare']['OfferedFare'];
$markupPct = (float) env('IH_MARKUP_FLIGHT_PCT', 3);
$markup = ($baseFare * $markupPct) / 100;
$finalPrice = $baseFare + $markup;
```

### 10.7 Security Best Practices

```php
// Store credentials in .env, never in code
// Use API keys for authentication
// Encrypt sensitive data in database
// Validate all user input
// Use HTTPS in production
// Implement request signing
// Rate limit API endpoints
// Log all transactions
```

### 10.8 Testing Checklist

- [ ] Test with mock data enabled
- [ ] Test flight search (one-way and round-trip)
- [ ] Test hotel search and booking
- [ ] Test error scenarios (invalid dates, invalid codes)
- [ ] Test with real TBO credentials
- [ ] Test booking flow end-to-end
- [ ] Test payment integration
- [ ] Test cancellation flow
- [ ] Load testing with multiple concurrent requests
- [ ] Test with different passenger types
- [ ] Verify markup calculations
- [ ] Test email notifications

---

## Quick Reference URLs

### Flight API Endpoints

```
Authenticate:    https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate
Search:          https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search
FareQuote:       https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareQuote
FareRule:        https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareRule
SSR:             https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SSR
Book:            https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Book
Ticket:          https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Ticket
GetBookingDetails: https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetBookingDetails
```

### Hotel API Endpoints

```
Authenticate:    http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate
CountryList:     http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList
CityList:        http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList
HotelCodes:      http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList
Search:          https://affiliate.tektravels.com/HotelAPI/Search
PreBook:         https://affiliate.tektravels.com/HotelAPI/PreBook
Book:            https://HotelBE.tektravels.com/hotelservice.svc/rest/book/
GetBookingDetail: https://HotelBE.tektravels.com/hotelservice.svc/rest/Getbookingdetail
CancelBooking:   https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/CancelBooking
```

### iHoliday Backend Endpoints

```
Base URL: http://localhost:8000/api/v1
Flight Search: POST /flights/search
Flight FareQuote: POST /flights/fare-quote
Flight Book: POST /flights/book
Flight Ticket: POST /flights/ticket
Hotel Search: POST /hotels/search
Hotel PreBook: POST /hotels/prebook
Hotel Book: POST /hotels/book
Hotel Cancel: POST /hotels/cancel
```

---

## Support & Contact

**For TBO API Issues:**
- Contact TBO Support: support@travelboutiqueonline.com
- Check TBO Documentation: https://www.travelboutiqueonline.com/

**For iHoliday Platform Issues:**
- Contact Development Team
- Review error logs in `/storage/logs/`
- Enable debug mode in `.env`

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Sept 2024 | Initial integration guide |
| 1.5 | Oct 2024 | Added hotel integration details |
| 2.0 | Oct 24, 2025 | Complete comprehensive guide with all endpoints and examples |

---

**Last Updated:** October 24, 2025  
**Maintained By:** iHoliday Development Team  
**Status:** Production Ready
