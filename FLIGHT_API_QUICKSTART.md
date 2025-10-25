# Quick Start: Fixed Flight API Integration

## Problem Solved
✅ "Flight search works in backend but fails on localhost" — **FIXED**

## What Was Done

1. **Backend:** Added `/health`, `/version`, `/bookings/{id}`, and alias routes (`/reprice`, `/fare-rules`)
2. **Frontend:** Created unified `src/lib/flight-api.ts` with clean API helpers
3. **Config:** Fixed `.env.local` to use single consistent API base URL
4. **Testing:** Added scripts to verify backend is working

## Quick Test (30 seconds)

```bash
# 1. Start backend (Terminal 1)
cd ih-backend
php artisan serve

# 2. Test backend works (Terminal 2)
./tools/quick-backend-check.sh

# 3. Start frontend (Terminal 3)
cd ih-frontend
npm run dev

# 4. Visit http://localhost:3000 and search flights
```

## How to Use in Frontend Code

```typescript
import { searchFlights, bookFlight, getBooking } from '@/lib/flight-api'

// Search
const result = await searchFlights({
  origin: 'BOM',
  destination: 'LKO',
  departDate: '2025-11-20',
  tripType: 'O',
  adults: 1,
  cabinClass: 'E'
})

// Book
const booking = await bookFlight({
  resultIndex: result.data.results[0].resultIndex,
  traceId: result.data.traceId,
  passengers: [...],
  contactInfo: { email: '...', phone: '...' }
})

// Get booking
const details = await getBooking(booking.data.bookingId)
```

## Key Files

- **Backend routes:** `ih-backend/routes/api.php`
- **Backend controller:** `ih-backend/app/Http/Controllers/Api/V1/FlightController.php`
- **Frontend API client:** `ih-frontend/src/lib/flight-api.ts` ⭐
- **Environment config:** `ih-frontend/.env.local`
- **Test scripts:** `tools/quick-backend-check.sh`, `tools/test-flight-api.sh`

## Endpoints Available

```
GET  /api/v1/health              → Health check
GET  /api/v1/version             → API version
POST /api/v1/flights/search      → Search flights
POST /api/v1/flights/reprice     → Reprice flight
POST /api/v1/flights/fare-rules  → Get fare rules
POST /api/v1/flights/book        → Book flight
POST /api/v1/flights/ticket      → Issue ticket
GET  /api/v1/bookings/{id}       → Get booking details
```

## Troubleshooting

**Problem:** Backend not responding?
```bash
cd ih-backend
php artisan serve --host=127.0.0.1 --port=8000
curl http://localhost:8000/api/v1/health
```

**Problem:** Frontend calling wrong URL?
- Check `ih-frontend/.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
- Restart Next.js dev server after changing `.env.local`

**Problem:** CORS errors?
- Already fixed in `ih-backend/config/cors.php`
- Make sure frontend is on `http://localhost:3000`

**Problem:** Search returns empty?
- Check backend TBO configuration: `curl http://localhost:8000/api/v1/debug/config`
- Check backend logs: `ih-backend/storage/logs/laravel.log`

## Full Documentation

See `FLIGHT_API_INTEGRATION_FIX.md` for complete details, request/response contracts, and migration guide.

---

**Status:** ✅ Ready to use!  
**Last Updated:** October 20, 2025
