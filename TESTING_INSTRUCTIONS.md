# Testing Instructions for Flight and Hotel Search Fix

## Prerequisites

Before testing, ensure the following are set up:

### 1. Backend Setup (Laravel)

```bash
cd /path/to/ih-backend

# Ensure .env file has TBO credentials
# TBO_CLIENT_ID=your_client_id
# TBO_USERNAME=your_username
# TBO_PASSWORD=your_password
# TBO_ENDUSER_IP=127.0.0.1
# USE_TBO_FLIGHT=true
# USE_TBO_HOTEL=true

# Install dependencies
composer install

# Run migrations
php artisan migrate

# Start backend server
php artisan serve --host=127.0.0.1 --port=8000
```

Backend should be running at: **http://127.0.0.1:8000**

### 2. Frontend Setup (Next.js)

```bash
cd /path/to/ih-frontend

# Create .env.local file with:
# BACKEND_API_URL=http://127.0.0.1:8000
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Install dependencies
npm install --legacy-peer-deps

# Start frontend dev server
npm run dev
```

Frontend should be running at: **http://localhost:3000**

## Test Cases

### Test 1: Flight Search - One Way

1. Navigate to: http://localhost:3000
2. Click on "Flights" tab in search form
3. Enter search criteria:
   - **From**: DEL (Delhi)
   - **To**: BOM (Mumbai)
   - **Departure Date**: Any date 2+ days in future
   - **Passengers**: 1 Adult
   - **Class**: Economy
   - **Trip Type**: One Way
4. Click "Search Flights"

**Expected Result:**
- Page redirects to `/flights/results?from=DEL&to=BOM&...`
- Loading spinner shows "Searching live flights..."
- After 5-10 seconds, flight results display
- Each result shows:
  - Airline name and logo
  - Flight times and route
  - Price in INR
  - "Select" button

**Error Check:**
- ❌ Should NOT see "Search Error"
- ❌ Should NOT see "Request failed with status code 400"
- ❌ Should NOT see "Failed to fetch"

**Console Logs (Browser F12 Console):**
```
[Flight Search Proxy] Received request: {...}
[Flight Search Proxy] Sending to backend: {...}
[Flight Search Proxy] Backend response status: 200
[Flight Search Proxy] Found X results
```

### Test 2: Flight Search - Round Trip

1. Navigate to: http://localhost:3000
2. Select "Round Trip" in search form
3. Enter search criteria:
   - **From**: BOM (Mumbai)
   - **To**: GOI (Goa)
   - **Departure Date**: Any date 2+ days in future
   - **Return Date**: 2-3 days after departure
   - **Passengers**: 2 Adults
   - **Class**: Economy
4. Click "Search Flights"

**Expected Result:**
- Results page shows flights for both directions
- Prices reflect round-trip total
- Can select outbound and return flights separately (if implemented)

### Test 3: Hotel Search

1. Navigate to: http://localhost:3000/hotels
2. Enter search criteria:
   - **Destination**: Select a city (e.g., "Goa")
   - **Check-in**: Any date 2+ days in future
   - **Check-out**: 2-3 days after check-in
   - **Rooms**: 1 room, 2 adults
3. Click "Search Hotels"

**Expected Result:**
- Page redirects to `/hotels/results`
- Loading spinner appears
- Hotel results display with:
  - Hotel name and star rating
  - Price per night
  - Amenities
  - Room details

**Note:** Hotel search was already working correctly, this test verifies it still works.

### Test 4: Error Handling - Invalid Date

1. Navigate to flight search
2. Try to select a date in the past
3. Click "Search Flights"

**Expected Result:**
- Frontend validation prevents search
- OR backend returns 422 error with clear message
- User sees helpful error message

### Test 5: Error Handling - Invalid Route

1. Search for flights with non-existent route:
   - **From**: XXX (invalid code)
   - **To**: YYY (invalid code)
2. Click "Search Flights"

**Expected Result:**
- Validation error: "Invalid origin/destination airport code"
- OR "No flights available" message
- Should NOT crash or show generic error

### Test 6: Backend Connection Failure

1. Stop the Laravel backend server
2. Try to search for flights

**Expected Result:**
- Error message: "Failed to connect to backend API"
- Should NOT freeze or hang indefinitely
- After 30 seconds: "Backend request timeout" error

## Verification Checklist

- [ ] Flight search one-way works
- [ ] Flight search round-trip works
- [ ] Flight results display correctly
- [ ] Hotel search still works
- [ ] Hotel results display correctly
- [ ] No "400 Bad Request" errors
- [ ] No "Failed to fetch" errors
- [ ] Browser console shows successful API calls
- [ ] Backend logs show TBO API calls
- [ ] Date parsing works correctly (no timezone issues)
- [ ] Timeout handling works (if backend is slow/down)

## Network Inspection

Open Browser DevTools → Network tab:

### Expected Requests:

1. **Frontend to Next.js API:**
   - `POST http://localhost:3000/api/air/search`
   - Status: 200
   - Response: JSON with `{ success: true, results: [...] }`

2. **Next.js to Laravel Backend (visible in server logs):**
   - `POST http://127.0.0.1:8000/api/v1/flights/search`
   - Status: 200
   - Response: Backend flight data

3. **Laravel to TBO (visible in backend logs):**
   - TBO authentication call
   - TBO flight search call

## Backend Logs

In the Laravel backend terminal, you should see:

```
Flight search request {"segments":[{"origin":"DEL",...}],...}
TBO: Authenticating...
TBO: Search request sent
TBO: Received 25 results
Flight search completed successfully
```

## Troubleshooting

### Issue: "Failed to connect to backend API"

**Solution:**
- Verify backend is running: `curl http://127.0.0.1:8000/api/v1/health`
- Check firewall settings
- Check CORS config in `ih-backend/config/cors.php`

### Issue: "Request failed with status code 400"

**Solution:**
- Check backend validation rules
- Inspect payload in browser console
- Check backend logs for validation errors

### Issue: "No flights available"

**Solution:**
- Verify TBO credentials are valid
- Check if route actually has flights (try different dates)
- Look for TBO API errors in backend logs

### Issue: Frontend build fails

**Solution:**
```bash
cd ih-frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Success Criteria

✅ **Flight Search Fixed:**
- Frontend successfully calls Next.js API route
- Next.js route proxies to Laravel backend
- Laravel backend calls TBO API
- Results display correctly in frontend
- No 400 errors or "Failed to fetch" errors

✅ **Hotel Search Still Works:**
- Hotel search uses Laravel backend correctly
- Results display as before

✅ **Error Handling:**
- Clear error messages for all failure scenarios
- Timeout after 30 seconds if backend unresponsive
- No crashes or infinite loading states

## Additional Notes

- The fix does NOT change frontend UI or user experience
- Only changes the internal API routing (backend integration)
- Hotel search was already correct, no changes needed
- All TBO API calls now go through Laravel backend (correct architecture)
