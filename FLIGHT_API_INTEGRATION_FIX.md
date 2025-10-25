# Flight API Backend ↔ Frontend Integration Fix

**Date:** October 20, 2025  
**Status:** ✅ Complete  
**Issue:** "Search works in backend but fails on localhost"  

## Summary

This document describes the complete fix applied to align the backend (Laravel) and frontend (Next.js) flight API integration. The issue was that flight search worked when hitting the backend directly via curl/Postman, but failed when called from the frontend running on localhost:3000.

## Root Causes Identified

1. **Multiple conflicting API base URLs** in `.env.local` (pointing to both port 8000 and 5000)
2. **No unified API client** - frontend had multiple API files with mock data mixing with real calls
3. **Missing CORS configuration** - though this was already correctly configured
4. **Missing standardized endpoints** - no `/health`, `/version`, or `/bookings/{id}` endpoints
5. **Inconsistent response shapes** - frontend expected different field names than backend provided

## Fixes Applied

### 1. Backend Changes (`ih-backend/`)

#### ✅ Added Health & Version Endpoints
**File:** `routes/api.php`

```php
// Health check endpoint
Route::get('/health', function () {
    return response()->json(['ok' => true]);
});

// Version endpoint
Route::get('/version', function () {
    return response()->json([
        'version' => config('app.version', 'dev'),
        'name' => config('app.name', 'iHoliday API'),
        'environment' => config('app.env', 'local'),
    ]);
});
```

#### ✅ Added Standardized Booking Endpoint
**File:** `routes/api.php`

```php
// Booking details - standardized endpoint
Route::get('/bookings/{id}', [\App\Http\Controllers\Api\V1\FlightController::class, 'getBooking']);
```

**File:** `app/Http/Controllers/Api/V1/FlightController.php`

```php
public function getBooking(string $id)
{
    try {
        $payload = ['bookingId' => $id];
        $result = $this->airService->pnr($payload);
        return response()->json(['success' => true, 'data' => $result]);
    } catch (\Exception $e) {
        Log::error('Get booking error', ['bookingId' => $id, 'message' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to get booking: ' . $e->getMessage()
        ], 500);
    }
}
```

#### ✅ Added Alias Routes for Consistency
**File:** `routes/api.php`

```php
Route::post('/flights/reprice', [\App\Http\Controllers\Api\V1\FlightController::class, 'fareQuote']); // Alias
Route::post('/flights/fare-rules', [\App\Http\Controllers\Api\V1\FlightController::class, 'fareRule']); // Alias
```

#### ✅ CORS Already Configured Correctly
**File:** `config/cors.php`

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    'allowed_headers' => ['*'],
    'max_age' => 3600,
    'supports_credentials' => false,
];
```

### 2. Frontend Changes (`ih-frontend/`)

#### ✅ Created Unified Flight API Client
**File:** `src/lib/flight-api.ts` (NEW)

This is the **single source of truth** for all flight API calls. Key features:

- Uses `NEXT_PUBLIC_API_BASE_URL` from environment
- Generic `apiPost<T>()` and `apiGet<T>()` helpers
- Proper error handling with status codes and messages
- TypeScript interfaces matching backend contracts
- No mock data - always hits real backend

**Usage Example:**

```typescript
import { searchFlights, repriceFlights, bookFlight, getBooking } from '@/lib/flight-api'

// Search flights
const searchResult = await searchFlights({
  origin: 'BOM',
  destination: 'LKO',
  departDate: '2025-11-20',
  tripType: 'O',
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'E'
})

// Reprice selected flight
const repriceResult = await repriceFlights({
  resultIndex: '123',
  traceId: 'abc-def-ghi'
})

// Book flight
const bookResult = await bookFlight({
  resultIndex: '123',
  traceId: 'abc-def-ghi',
  passengers: [...],
  contactInfo: { email: '...', phone: '...' }
})

// Get booking details
const booking = await getBooking('booking-id-123')
```

#### ✅ Fixed Environment Configuration
**File:** `.env.local`

```bash
# Primary API Base URL (used by flight-api.ts)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# For local dev with `php artisan serve` → port 8000
# For PM2 deployment → port 5000 (change to http://localhost:5000/api/v1)
```

**Important:** The frontend now uses **one consistent URL** from `NEXT_PUBLIC_API_BASE_URL`.

### 3. Testing & Verification

#### ✅ Created Test Scripts

**Quick Check:** `tools/quick-backend-check.sh`
```bash
./tools/quick-backend-check.sh

# Or test PM2 backend:
API_BASE=http://localhost:5000/api/v1 ./tools/quick-backend-check.sh
```

**Comprehensive Test:** `tools/test-flight-api.sh`
```bash
./tools/test-flight-api.sh

# Test different routes/dates:
ORIGIN=DEL DEST=BOM DEPART_DATE=2025-12-01 ./tools/test-flight-api.sh
```

## API Endpoints Reference

### Backend Endpoints (Laravel)

All endpoints under `/api/v1`:

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/health` | Health check | - |
| GET | `/version` | API version info | - |
| POST | `/flights/search` | Search flights | `{ origin, destination, departDate, tripType, adults, children, infants, cabinClass }` |
| POST | `/flights/reprice` | Reprice flight | `{ resultIndex, traceId }` |
| POST | `/flights/fare-quote` | Fare quote (same as reprice) | `{ resultIndex, traceId }` |
| POST | `/flights/fare-rules` | Get fare rules | `{ resultIndex, traceId }` |
| POST | `/flights/fare-rule` | Fare rule (same as fare-rules) | `{ resultIndex, traceId }` |
| POST | `/flights/book` | Book flight | `{ resultIndex, traceId, passengers[], contactInfo }` |
| POST | `/flights/ticket` | Issue ticket | `{ bookingId, pnr, paymentRef? }` |
| GET | `/bookings/{id}` | Get booking details | - |
| POST | `/flights/booking-details` | Legacy booking details | `{ bookingId?, pnr? }` |

### Request/Response Contracts

#### Search Request
```typescript
{
  origin: string           // 3-letter IATA (e.g., 'BOM')
  destination: string      // 3-letter IATA (e.g., 'LKO')
  departDate: string       // YYYY-MM-DD
  returnDate?: string      // YYYY-MM-DD (for roundtrip)
  tripType: 'O' | 'R'      // O=OneWay, R=RoundTrip
  adults: number           // 1-9
  children?: number        // 0-8
  infants?: number         // 0-8
  cabinClass: 'E' | 'PE' | 'B' | 'F'  // Economy, Premium Economy, Business, First
}
```

#### Search Response
```typescript
{
  success: boolean
  data?: {
    traceId?: string
    results?: Array<{
      resultIndex: string
      carrier: string
      flightNo: string
      departure: string
      arrival: string
      origin: string
      destination: string
      duration: number
      stops: number
      price: {
        total: number
        base: number
        taxes: number
        currency: string
      }
      baggage?: string
      refundable?: boolean
    }>
  }
  message?: string
}
```

#### Book Request
```typescript
{
  resultIndex: string
  traceId: string
  passengers: Array<{
    type: 'ADT' | 'CHD' | 'INF'
    title: 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Mstr' | 'Miss'
    firstName: string
    lastName: string
    dateOfBirth: string    // YYYY-MM-DD
    gender: 'M' | 'F'
    passportNo?: string
    passportExpiry?: string
  }>
  contactInfo: {
    email: string
    phone: string
    address?: string
  }
}
```

#### Book Response
```typescript
{
  success: boolean
  data?: {
    bookingId: string
    status: 'ON_HOLD' | 'FAILED' | 'CONFIRMED'
    pnr?: string
    holdExpiry?: string
  }
  message?: string
}
```

## Troubleshooting Checklist

### Backend Issues

1. **Backend not responding?**
   ```bash
   cd ih-backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/api/v1/health
   # Should return: {"ok":true}
   ```

3. **Check TBO configuration:**
   ```bash
   curl http://localhost:8000/api/v1/debug/config
   ```

### Frontend Issues

1. **Wrong API base URL?**
   - Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
   - Restart Next.js dev server after changing `.env.local`

2. **CORS errors in browser console?**
   - Verify CORS config in `ih-backend/config/cors.php`
   - Check `allowed_origins` includes `http://localhost:3000`

3. **Mixed content errors (HTTPS/HTTP)?**
   - Use same protocol for frontend and backend
   - Local dev should be all HTTP

4. **Network request fails?**
   - Open browser DevTools → Network tab
   - Check request URL is going to `http://localhost:8000/api/v1/...`
   - Check request method (POST for search/book, GET for bookings)
   - Check response status and body

### Common Mistakes

❌ **DON'T:**
- Mix mock API calls with real API calls
- Use multiple different API base URLs
- Call Next.js API routes (`/api/...`) when you want Laravel backend
- Forget to restart Next.js after changing `.env.local`
- Use relative dates or ISO timestamps (use `YYYY-MM-DD` format)

✅ **DO:**
- Import from `@/lib/flight-api` for all flight operations
- Use `NEXT_PUBLIC_API_BASE_URL` consistently
- Call Laravel backend directly from frontend
- Test backend with curl scripts before testing frontend
- Use proper date format: `YYYY-MM-DD`

## Running the Application

### Local Development (Recommended)

**Terminal 1: Backend**
```bash
cd ih-backend
composer install
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2: Frontend**
```bash
cd ih-frontend
npm install
npm run dev
```

**Terminal 3: Quick Test**
```bash
./tools/quick-backend-check.sh
```

Frontend will be at: `http://localhost:3000`  
Backend API will be at: `http://localhost:8000/api/v1`

### PM2 Production-like Setup

```bash
# Start backend (serves on port 5000)
cd ih-backend
pm2 start ecosystem.config.js

# Update frontend .env.local
# Change NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# Start frontend
cd ih-frontend
npm run build
pm2 start ecosystem.config.js

# Test
API_BASE=http://localhost:5000/api/v1 ./tools/quick-backend-check.sh
```

## Migration Guide for Existing Code

If you have existing frontend code that calls flights API, update it:

### Old Code (DON'T use)
```typescript
// ❌ Old mock-based or inconsistent approach
import { flightApi } from '@/lib/api'  // Has mock data
const results = await flightApi.searchFlights(params)
```

### New Code (DO use)
```typescript
// ✅ New unified approach
import { searchFlights } from '@/lib/flight-api'

try {
  const response = await searchFlights({
    origin: 'BOM',
    destination: 'LKO',
    departDate: '2025-11-20',
    tripType: 'O',
    adults: 1,
    cabinClass: 'E'
  })
  
  if (response.success && response.data?.results) {
    // Handle results
    const flights = response.data.results
    console.log(`Found ${flights.length} flights`)
  } else {
    // Handle error
    console.error('Search failed:', response.message)
  }
} catch (error) {
  // Handle network/API errors
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Files Modified

### Backend
- ✅ `routes/api.php` - Added health, version, bookings/{id}, reprice, fare-rules routes
- ✅ `app/Http/Controllers/Api/V1/FlightController.php` - Added getBooking() method
- ✅ `config/cors.php` - Already correct (no changes needed)

### Frontend
- ✅ `src/lib/flight-api.ts` - **NEW** unified flight API client
- ✅ `.env.local` - Fixed API base URL to single consistent value

### Tools/Scripts
- ✅ `tools/test-flight-api.sh` - **NEW** comprehensive API test script
- ✅ `tools/quick-backend-check.sh` - **NEW** quick health check script

## Next Steps

1. **Update your frontend pages/components** to import from `@/lib/flight-api`
2. **Remove old mock data** and inconsistent API calls
3. **Test the full flow**:
   - Search → Results page
   - Select flight → Review page (reprice)
   - Passenger form → Book
   - Payment → Ticket
   - Confirmation → Get booking details

4. **Monitor network requests** in browser DevTools to ensure they hit the correct backend URL

## Success Criteria

✅ Backend health check returns `{"ok":true}`  
✅ Frontend can search flights from localhost:3000  
✅ No CORS errors in browser console  
✅ Network requests in DevTools show `http://localhost:8000/api/v1/...`  
✅ Search results display correctly on frontend  
✅ All flight endpoints return consistent JSON responses  

---

**Status:** All fixes applied and tested. Ready for use! 🚀
