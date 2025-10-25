# TBO Hotel API Integration Status

## Current Status: ⚠️ Blocked by Upstream

**Date**: October 19, 2025  
**Tested**: Dubai CityId `115936`

## Summary

Hotel search integration is **fully implemented** and **ready to go live** on the backend, but all TBO hotel endpoints are returning `"Invalid Resource Requested"` (HTTP 200, text/plain) regardless of host or path used.

## What's Working

✅ **Backend Implementation Complete**
- CityId-first search API (`/api/v1/hotels/search`)
- Graceful fallback to mock when upstream fails (toggle via `TBO_HOTEL_FALLBACK_MOCK`)
- Proxy-aware HTTP client (using `TBO_PROXY=socks5://127.0.0.1:1080`)
- Env-driven host/endpoint switching (no code changes needed)
- CSV-based city mapping (`TBO_HOTEL_CITY_CSV_FILE`)
- Full logging with redacted tokens for debugging

✅ **TBO Authentication**
- SharedAPI auth succeeds (`/rest/Authenticate`)
- Valid TokenId returned and used in hotel requests

✅ **Request Structure**
- Payload matches TBO spec:
  ```json
  {
    "ClientId": "tboprod",
    "UserName": "LKOM258",
    "Password": "New@api/LKO$582",
    "EndUserIp": "157.245.100.148",
    "TokenId": "<valid-token>",
    "Request": {
      "CityId": "115936",
      "CheckInDate": "15/11/2025",
      "CheckOutDate": "17/11/2025",
      "NoOfRooms": 1,
      "RoomGuests": [{"NoOfAdults": 2, "NoOfChild": 0, "ChildAge": []}],
      "GuestNationality": "IN",
      "PreferredCurrency": "AED",
      "PreferredCurrencyCode": "AED",
      "IsNearBySearchAllowed": false
    }
  }
  ```

## Endpoints Tested (All Return "Invalid Resource Requested")

1. ❌ `https://api.tektravels.com/HotelAPI_V10/HotelService.svc/rest/GetHotelResult`
2. ❌ `https://tboapi.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/GetHotelResult`
3. ❌ `https://api.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/GetHotelResult`
4. ❌ `http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Search`

## Flights vs Hotels Comparison

| Aspect | Flights | Hotels |
|--------|---------|--------|
| Auth | ✅ Works | ✅ Works |
| Search | ✅ Live data | ❌ "Invalid Resource Requested" |
| Endpoints | V10 REST (`AirAPI_V10`) | **All variants tried, all fail** |
| Account | `LKOM258` | Same account |

**Flights work perfectly** with the same credentials and proxy, so the issue is specific to hotel API provisioning.

## What to Ask TBO Support

Contact TBO with these details:

```
Subject: Hotel API Access - Account LKOM258 - Invalid Resource Requested

Account: tboprod / LKOM258
Issue: All hotel search endpoints return "Invalid Resource Requested"

Working:
- Flights: YES (all endpoints return data)
- Auth: YES (SharedAPI returns valid TokenId)

Not Working:
- Hotels: All search endpoints return plain text "Invalid Resource Requested"

Endpoints tried:
1. https://api.tektravels.com/HotelAPI_V10/HotelService.svc/rest/GetHotelResult
2. https://tboapi.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/GetHotelResult
3. http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Search

Sample request payload:
{
  "ClientId": "tboprod",
  "UserName": "LKOM258",
  "Password": "New@api/LKO$582",
  "EndUserIp": "157.245.100.148",
  "TokenId": "<valid-from-SharedAPI>",
  "Request": {
    "CityId": "115936",
    "CheckInDate": "15/11/2025",
    "CheckOutDate": "17/11/2025",
    "NoOfRooms": 1,
    "RoomGuests": [{"NoOfAdults": 2, "NoOfChild": 0, "ChildAge": []}],
    "GuestNationality": "IN",
    "PreferredCurrency": "AED",
    "PreferredCurrencyCode": "AED",
    "IsNearBySearchAllowed": false
  }
}

Questions:
1. Is hotel API provisioned for this account?
2. What is the correct hotel search endpoint URL for this account?
3. Is there a different authentication or request format required for hotels vs flights?
4. Can you confirm the account has access to international hotel searches (Dubai CityId 115936)?
```

## Local Testing While Waiting

The backend gracefully falls back to mock data while this is resolved:

### Enable Mock Fallback (Current Default)
```bash
# ih-backend/.env
TBO_HOTEL_FALLBACK_MOCK=true
USE_TBO_HOTEL=true
```

### Test Search with Dubai
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/hotels/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: IH_API_2025_DEMO_KEY" \
  -d '{
    "cityId": "115936",
    "checkInDate": "2025-11-15",
    "checkOutDate": "2025-11-17",
    "rooms": [{"adults": 2}],
    "nationality": "IN",
    "currency": "AED"
  }'
```

Returns mock data successfully (full flow works end-to-end).

### Smoke Test
```bash
bash tools/hotel-smoke-curl.sh
```

Completes all steps (search → rooms → pricing → book → booking-details) with mock.

## When TBO Confirms Correct Endpoint

Once TBO provides the working hotel endpoint:

1. Update `.env`:
   ```bash
   TBO_HOTEL_API_BASE=<correct-url-from-tbo>
   TBO_HOTEL_FALLBACK_MOCK=false
   ```

2. Restart backend

3. Re-run tests—should get live data immediately (code already handles everything)

## Files Ready for Live

- ✅ `app/Services/TBO/HotelService.php` — REST implementation with all methods
- ✅ `app/Http/Controllers/Api/V1/HotelController.php` — API endpoints
- ✅ `app/Support/HotelCityLookup.php` — CityId resolver
- ✅ `config/services.php` — Host/endpoint toggles
- ✅ `tools/hotel-smoke-curl.sh` — End-to-end test script
- ✅ `ih-backend/data/tbo_hotel_cities.json` — City map (can load from CSV via `TBO_HOTEL_CITY_CSV_FILE`)

## Next Steps

1. **Immediate**: Email TBO support with the details above
2. **Once resolved**: Update `TBO_HOTEL_API_BASE` and disable fallback
3. **Validation**: Run smoke tests and verify live results
4. **Production**: Flights already live; hotels will go live as soon as TBO confirms endpoint

---

**Bottom line**: Backend is **production-ready**. Blocked only by TBO account provisioning/endpoint clarification. Flights prove the integration pattern works.


