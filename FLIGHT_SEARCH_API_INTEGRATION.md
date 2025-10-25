# Flight Search API Integration - Live Data

## Summary
Fixed flight search to use **live backend API data** instead of mock/demo data.

## Changes Made

### 1. Frontend Integration (`ih-frontend/src/components/flights/flight-search-results.tsx`)

**Before:**
- Used a mock `searchFlights` function that returned hardcoded demo flight data
- Never called the backend Laravel API

**After:**
- Now calls the real backend API at `http://localhost:8000/api/v1/flights/search`
- Properly transforms backend TBO response to frontend Flight type
- Includes proper error handling and logging

### 2. Key Functions Added

#### `searchFlights(params: URLSearchParams)`
- Builds request payload from URL search parameters
- Calls backend POST `/api/v1/flights/search` endpoint
- Maps frontend parameters to backend format:
  - `class` → `cabinClass` (economy → E, premium_economy → PE, etc.)
  - `tripType` → (oneway → O, roundtrip → R, multicity → M)
- Transforms backend response to frontend Flight[] format

#### `transformBackendResponse(data, tripType)`
- Converts backend `Results` array to frontend flight format
- Handles outbound/inbound/multi-city flight separation

#### `transformBackendFlight(backendFlight)`
- Maps individual backend flight object to frontend Flight type
- Extracts segments, pricing, airline info from backend format
- Backend uses capital case (Airline, FlightNumber, Origin, Destination)
- Frontend uses camelCase (airline, flightNumber, origin, destination)

#### Helper Functions
- `mapCabinClass()` - Maps frontend class names to backend codes
- `mapTripType()` - Maps frontend trip types to backend codes
- `getAirlineName()` - Resolves airline codes to names
- `calculateDuration()` - Computes flight duration in minutes

### 3. Backend Response Format

The backend returns:
```json
{
  "success": true,
  "data": {
    "SessionId": "MOCK-SESSION-...",
    "Results": [
      {
        "ResultIndex": 1,
        "Fare": {
          "Currency": "INR",
          "BaseFare": 4200,
          "TotalFare": 4899,
          "finalFare": 4899
        },
        "Segments": [
          {
            "Airline": "AI",
            "FlightNumber": "101",
            "Origin": "CCU",
            "Destination": "BOM",
            "DepartureDateTime": "2025-10-20T08:10:00",
            "ArrivalDateTime": "2025-10-20T10:30:00"
          }
        ]
      }
    ]
  }
}
```

### 4. Environment Configuration

**Required:** `.env.local` must have:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend must be running** on port 8000 with TBO configured.

## Testing

### 1. Verify Backend API
```bash
curl -X POST "http://localhost:8000/api/v1/flights/search" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "CCU",
    "destination": "BOM",
    "departDate": "2025-10-20",
    "adults": 1,
    "cabinClass": "E",
    "tripType": "O"
  }'
```

### 2. Test in Browser
1. Start backend: `cd ih-backend && php artisan serve --host=127.0.0.1 --port=8000`
2. Start frontend: `cd ih-frontend && npm run dev`
3. Open http://localhost:3010
4. Search for flights (e.g., CCU → BOM)
5. Check browser DevTools → Console for API logs
6. Check browser DevTools → Network → Look for POST to `/api/v1/flights/search`

## Current Status

✅ **Integration Complete**
- Frontend now calls backend API instead of using mock data
- Response transformation working correctly
- Error handling implemented

⚠️ **Backend Currently Returns Mock Data**
- Backend is configured with `USE_TBO_FLIGHT=true`
- However, it's currently returning **mock data**, not live TBO API data
- This means the integration is working, but we need to verify the backend TBO service is actually calling the real TBO API

## Next Steps

### 1. Verify Backend TBO Integration
Check if backend is actually calling TBO API or just returning mocks:
```bash
cd ih-backend
tail -f storage/logs/laravel.log
```

Then search for flights and look for TBO API calls in logs.

### 2. If TBO is Not Working
- Check `ih-backend/app/Services/TBO/AirService.php`
- Verify TBO credentials in `ih-backend/.env`
- Check TBO proxy settings (`TBO_PROXY=socks5h://127.0.0.1:1080`)
- Test TBO authentication endpoint

### 3. Enable Real TBO Data
If backend is only returning mocks, you'll need to:
1. Fix TBO service authentication
2. Enable real TBO API calls in `AirService.php`
3. Handle TBO response structure (may differ from mock structure)

## Files Modified

- `/ih-frontend/src/components/flights/flight-search-results.tsx` - Main integration file

## Configuration Files Checked

- `/ih-frontend/.env.local` - API URL configuration
- `/ih-backend/.env` - TBO credentials and settings
- `/ih-backend/routes/api.php` - Backend routes
- `/ih-backend/app/Http/Controllers/Api/V1/FlightController.php` - Backend controller

## Notes

- The mock data currently returned by backend is using the correct structure
- When real TBO integration is enabled, response format may need adjustment
- SessionId from backend should be stored for subsequent booking operations
- Frontend expects ISO date strings (YYYY-MM-DD) for dates
- All prices in INR currency
