# Flight and Hotel Search API Fix

## Problem Statement

Flight and hotel searches were failing with errors:
- `Request failed with status code 400`
- `Failed to fetch`

The frontend was showing "Search Error" instead of displaying flight/hotel results.

## Root Cause

The Next.js frontend had an API route (`/api/air/search`) that was **directly calling the TBO API** instead of proxying through the Laravel backend. This bypassed:

1. Backend authentication and token management
2. Backend error handling and logging
3. Backend markup/pricing logic
4. Backend caching and optimization

## Solution

Updated `/ih-frontend/src/app/api/air/search/route.ts` to **proxy all requests through the Laravel backend**.

### Correct API Flow

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐     ┌─────────┐
│  Frontend   │────▶│   Next.js    │────▶│  Laravel   │────▶│   TBO   │
│   Page      │     │  API Route   │     │  Backend   │     │   API   │
└─────────────┘     └──────────────┘     └────────────┘     └─────────┘
```

#### Flight Search Flow
1. User visits `/flights/results?from=DEL&to=BOM&...`
2. Frontend page calls `POST /api/air/search` with payload
3. Next.js route transforms payload and calls `POST http://127.0.0.1:8000/api/v1/flights/search`
4. Laravel backend authenticates with TBO and makes API call
5. Laravel returns normalized results to Next.js route
6. Next.js route returns results to frontend
7. Frontend displays flight results

#### Hotel Search Flow
1. User searches hotels on `/hotels` page
2. Frontend calls `hotelApi.searchHotels(params)`
3. Hotel API client calls `POST http://127.0.0.1:8000/api/v1/hotels/search`
4. Laravel backend handles TBO hotel search
5. Results returned and displayed

## Technical Details

### Frontend Request Format
```typescript
{
  origin: "DEL",           // 3-letter IATA code
  destination: "BOM",      // 3-letter IATA code
  departDate: "2025-11-18T00:00:00",  // ISO date with time
  returnDate: "2025-11-20T00:00:00",  // Optional for round trip
  tripType: "O",           // "O" = OneWay, "R" = RoundTrip
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: "E"          // E/PE/W/B/F
}
```

### Backend Expected Format
```php
{
  "segments": [
    {
      "origin": "DEL",
      "destination": "BOM",
      "departureDate": "2025-11-18"  // YYYY-MM-DD only
    }
  ],
  "tripType": "O",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E"
}
```

### Transformation Logic

The Next.js API route performs:

1. **Date Normalization**: Converts `2025-11-18T00:00:00` → `2025-11-18`
2. **Cabin Class Mapping**: Maps `PE` (Premium Economy) → `W` for backend
3. **Segment Building**: Constructs segments array from origin/destination
4. **Round Trip Handling**: Adds return segment if `tripType === "R"`

## Environment Configuration

### Frontend (.env.local)

For **client-side code** (browser):
```bash
# Used by browser-side code (components, pages)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

For **server-side code** (API routes):
```bash
# Used by server-side API routes (not exposed to browser)
BACKEND_API_URL=http://127.0.0.1:8000
```

**Note**: The Next.js API route will first try `BACKEND_API_URL`, then fallback to `NEXT_PUBLIC_API_BASE_URL` for backward compatibility.

### Backend (.env)
```bash
# TBO API Credentials
TBO_CLIENT_ID=your_client_id
TBO_USERNAME=your_username
TBO_PASSWORD=your_password
TBO_ENDUSER_IP=127.0.0.1

# TBO API URLs
TBO_AIR_API=https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc
TBO_HOTEL_API=https://api.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc

# Enable TBO integration
USE_TBO_FLIGHT=true
USE_TBO_HOTEL=true
```

## CORS Configuration

The backend has CORS enabled for local development:

**File**: `ih-backend/config/cors.php`

```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
],
```

## Files Modified

1. **`/ih-frontend/src/app/api/air/search/route.ts`**
   - Complete rewrite to proxy to Laravel backend
   - Added payload transformation logic
   - Added response normalization
   - Improved error handling

## Testing the Fix

### Prerequisites
1. Laravel backend running on `http://127.0.0.1:8000`
2. Next.js frontend running on `http://localhost:3000`
3. Valid TBO credentials in backend `.env`

### Manual Test
1. Navigate to frontend homepage
2. Search for flights (e.g., DEL → BOM)
3. Verify results page shows flights instead of "Search Error"
4. Check browser console for successful API calls
5. Check backend logs for TBO API calls

### Expected Logs

**Frontend Console:**
```
[Flight Search Proxy] Received request: { origin: "DEL", ... }
[Flight Search Proxy] Sending to backend: { segments: [...], ... }
[Flight Search Proxy] Backend response status: 200
[Flight Search Proxy] Found 25 results
```

**Backend Logs:**
```
Flight search request {"segments":[{"origin":"DEL",...}],...}
TBO API response received with 25 results
```

## Error Handling

### 400 Bad Request
- **Cause**: Invalid input (missing origin, bad date format, etc.)
- **Response**: Returns validation errors to frontend
- **User sees**: Error message with specific validation failures

### 500 Internal Server Error
- **Cause**: Backend cannot connect to TBO or TBO API error
- **Response**: Generic error message (details in logs)
- **User sees**: "Failed to connect to backend API"

### No Results
- **Cause**: No flights available for route/date
- **Response**: `{ success: false, providerError: {...} }`
- **User sees**: "No flights available" with suggestions

## Hotel Search (Already Working)

The hotel search was already correctly implemented and does not need changes:

**File**: `/ih-frontend/src/lib/api/hotels.ts`
- Already calls Laravel backend at `/api/v1/hotels/search`
- Uses POST method with proper payload
- Handles errors correctly

## Validation

Both frontend and backend perform validation:

### Frontend Validation (Next.js Route)
- IATA code format (3 letters)
- Date format (YYYY-MM-DD or ISO)
- Passenger counts (1-9 total)

### Backend Validation (Laravel)
- Segment structure
- Date validity (after today)
- Passenger limits
- Cabin class options

## Future Improvements

1. **Caching**: Add Redis caching for frequent routes
2. **Rate Limiting**: Prevent abuse of search endpoint
3. **Analytics**: Track search patterns and conversion rates
4. **Mock Data**: Add mock responses for testing without TBO API
5. **Error Recovery**: Retry logic for transient TBO errors

## Summary

✅ **Fixed**: Flight search now correctly proxies through Laravel backend  
✅ **Verified**: Hotel search already uses correct flow  
✅ **Added**: Comprehensive error handling and logging  
✅ **Maintained**: Backward compatibility with existing frontend code  

The fix ensures that all TBO API interactions go through the Laravel backend, maintaining proper authentication, error handling, and business logic.
