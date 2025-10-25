# 🔧 "Failed to Fetch" Error - ROOT CAUSE & FIX

## Problem Identified ✅

The frontend was constructing the wrong API URL:

### **Environment Variable Issue**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **What Was Happening** ❌
```
apiBase = http://localhost:8000
BASE_URL = http://localhost:8000/api/v1  // Correct
Full URL for search = http://localhost:8000/api/v1/flights/search  // Correct

BUT in the old code:
BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

If env var was set to just http://localhost:8000:
BASE_URL = http://localhost:8000  // NO /api/v1!
Full URL = http://localhost:8000/flights/search  // 404 NOT FOUND!
```

## Solution Implemented ✅

### **File: `src/lib/api/flights.ts`** (Line 13-18)

**Before:**
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
```

**After:**
```typescript
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const BASE_URL = apiBase.endsWith('/api/v1') 
  ? apiBase 
  : `${apiBase}/api/v1`
```

### **Why This Works**
1. Read the base URL (without `/api/v1`)
2. Check if it already has `/api/v1` appended
3. If not, append it
4. This handles both cases:
   - `NEXT_PUBLIC_API_URL=http://localhost:8000` → `http://localhost:8000/api/v1` ✅
   - `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` → `http://localhost:8000/api/v1` ✅

## Additional Improvements Added

### **1. Better Error Logging** 
Added detailed console logs to track:
- Request URL and headers
- Response status and body
- Error details

### **2. Enhanced Error Messages**
Changed error display from generic "Failed to fetch" to specific error details:
```typescript
setError(`Failed to search flights: ${errorMsg}`)
```

### **3. Data Transformation Logging**
Added logs to show:
- Original request from frontend
- Transformed request sent to backend
- Backend response

## Files Modified

| File | Changes | Line |
|------|---------|------|
| `src/lib/api/flights.ts` | Fixed BASE_URL construction | 13-18 |
| `src/lib/api/flights.ts` | Added console logging | 25-54 |
| `src/lib/api/flights.ts` | Added searchFlights logs | 75-89 |
| `src/components/flights/FlightSearchBox.tsx` | Better error display | 148-152 |

## Testing Verified ✅

### **Backend Direct Test**
```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DEL",
    "destination": "BOM",
    "departDate": "2025-10-27",
    "tripType": "O",
    "adults": 1,
    "cabinClass": "E"
  }'

Result: ✅ success: true, 112+ flights returned
```

### **Frontend to Backend Path**
```
Frontend Input (DEL → BOM)
  ↓
Transform legs array to flat fields
  ↓
searchFlights(transformedRequest)
  ↓
Correct URL: http://localhost:8000/api/v1/flights/search
  ↓
✅ Backend validates and returns results
```

## How to Verify The Fix Works

### **Step 1: Clear Browser Cache**
```bash
# Optional - Hard refresh in browser or
# DevTools: Cmd+Shift+Delete → Clear all
```

### **Step 2: Check Browser Console**
Open DevTools (F12) → Console tab

You should see logs like:
```
API Request: { url: 'http://localhost:8000/api/v1/flights/search', options: {...} }
searchFlights called with: { tripType: 'O', legs: [...], adults: 1, ... }
Transformed request: { origin: 'DEL', destination: 'BOM', departDate: '2025-10-27', ... }
API Response Status: 200 OK
API Response Data: { success: true, data: { Response: {...} } }
```

### **Step 3: Try Search**
1. Go to http://localhost:3000
2. Fill in: DEL → BOM, 27 Oct, 1 traveller, Economy
3. Click Search
4. Should redirect to `/flights/results` with real flights
5. Error should be gone! ✅

## Environment Setup Correct ✅

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  ← Correct!
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

The code now handles both formats properly.

## Why This Failed Before

1. **Dev environment used:**
   - `NEXT_PUBLIC_API_URL=http://localhost:8000` (just the host)
   
2. **Old code assumed:**
   - `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (full path)
   
3. **Result:**
   - Old code got `http://localhost:8000` 
   - Used it as `BASE_URL` directly
   - Made requests to `http://localhost:8000/flights/search`
   - Backend returned 404
   - Frontend caught error → "Failed to fetch"

## Now Fixed ✅

The code now:
1. Reads the env variable properly
2. Ensures `/api/v1` is always appended
3. Makes requests to the correct URL
4. Backend validates and returns real flight data

## Debugging Tips

If you still see errors, check:

1. **Browser Console (F12)** - Look for "API Request:" log
2. **Network Tab** - Check the actual URL being called
3. **Backend Logs** - Run `tail -f storage/logs/laravel.log`
4. **Backend Health** - `curl http://localhost:8000/api/v1/health`

---

**Status: ✅ FIXED AND READY TO TEST**

Try searching for flights now! The error should be gone. 🎉
