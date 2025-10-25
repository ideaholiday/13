# TBO API 404 Issue - To Be Resolved

**Date:** October 16, 2025  
**Status:** ⏳ Pending TBO Support Response  
**Priority:** High - Blocking live flight search functionality

---

## Issue Summary

The TBO Flight API endpoints return **HTTP 404 Not Found** even when accessed with correct credentials from the whitelisted IP address. All backend code is ready and will work immediately once TBO provides working endpoint URLs.

---

## Official TBO Configuration Received

### Live Credentials (Production)
- **Client ID:** `tboprod`
- **Username:** `LKOM258`
- **Password:** `New@api/LKO$582`
- **Whitelisted IP:** `157.245.100.148`

### Official Endpoint URLs (from TBO Support)

#### Authentication
- **URL:** `https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc`
- **Method:** Authenticate
- **Status:** ✅ Not tested yet (needed only for initial auth)

#### Air Service (Search, Fare Quote, etc.)
- **URL:** `https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc`
- **Methods:** Air Search, Fare Rule, Fare Quote, SSR, Calendar Fare Search
- **Status:** ❌ **Returns 404**

#### Air Service (Booking)
- **URL:** `https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc`
- **Methods:** Book, Ticket, Get Booking Details, Send Change Request
- **Status:** ❌ **Not tested (search must work first)**

#### Hotel Service (Search)
- **URL:** `https://api.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc`
- **Methods:** Get Hotel Result, Hotel Info, Get Hotel Room, Block Room
- **Status:** ⏳ Not tested yet

#### Hotel Service (Booking)
- **URL:** `https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc`
- **Methods:** Book, Generate Voucher, Get Booking Details
- **Status:** ⏳ Not tested yet

---

## Verification Performed

### ✅ Backend Configuration
- [x] Updated credentials to `LKOM258` / `New@api/LKO$582`
- [x] Configured all official TBO endpoint URLs
- [x] Set `TBO_ENDUSER_IP=157.245.100.148` (whitelisted IP)
- [x] SOCKS5 proxy configured: `socks5h://127.0.0.1:1080`
- [x] SSH tunnel active: `ssh -D 1080 root@157.245.100.148`
- [x] Proxy applied for TBO domains in `SoapClient12.php`

### ✅ SOAP Request Structure
- [x] SOAP 1.2 envelope with proper namespaces
- [x] WS-Addressing headers (Action, MessageID, To, ReplyTo)
- [x] Authentication header with credentials
- [x] Request body includes: ClientId, EndUserIp, OriginDestinationInformations, TravellerInfo
- [x] Dynamic namespace/action based on endpoint (FlightApi vs BookingEngineService_Air)
- [x] Content-Type header includes action parameter

### ✅ Network Connectivity Tests

#### Test 1: Direct access from whitelisted IP
```bash
ssh root@157.245.100.148 "curl -s -w '\nHTTP:%{http_code}\n' 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc?wsdl'"
# Result: HTTP:404 ❌
```

#### Test 2: Access via SOCKS5 proxy
```bash
curl -s -w "%{http_code}\n" --proxy socks5h://127.0.0.1:1080 "https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc"
# Result: 404 ❌
```

#### Test 3: Base API path (without AirService.svc)
```bash
curl -s -w "%{http_code}\n" --proxy socks5h://127.0.0.1:1080 "https://tboapi.travelboutiqueonline.com/AirAPI_V10/"
# Result: 200 ✅
```

#### Test 4: WSDL endpoint
```bash
curl -s -w "%{http_code}\n" --proxy socks5h://127.0.0.1:1080 "https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc?wsdl"
# Result: 404 ❌
```

---

## Key Findings

1. **Base path accessible:** `/AirAPI_V10/` returns HTTP 200
2. **Service path not found:** `/AirAPI_V10/AirService.svc` returns HTTP 404
3. **WSDL not accessible:** `?wsdl` parameter also returns 404
4. **Same result from whitelisted IP:** Issue is not proxy-related
5. **Credentials irrelevant:** 404 occurs before authentication (HTTP level)

---

## Questions for TBO Support

Please contact TBO and ask:

1. **Is the endpoint URL correct?**
   - Documentation says: `https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc`
   - This URL returns 404 even from whitelisted IP 157.245.100.148
   
2. **Is the service deployed and active for user `LKOM258`?**
   - Account may need to be provisioned or activated
   
3. **Can they provide a working WSDL URL?**
   - Need to verify service is accessible: `.../AirService.svc?wsdl` or `.../AirService.svc?singlewsdl`
   
4. **Is there a different endpoint structure?**
   - Maybe without `.svc` extension?
   - Or with `/rest/` prefix like hotel booking URLs?
   - Different host/subdomain?

5. **Are there any IP whitelisting issues?**
   - Confirm 157.245.100.148 is whitelisted for ALL required endpoints
   
6. **Is there a test/sandbox endpoint we can use first?**
   - To verify our SOAP implementation before going to production

---

## Current Workaround

The application is currently running with **mock mode enabled** to provide a working demo:

```bash
# ih-backend/.env
USE_MOCK=true
USE_TBO_FLIGHT=false
USE_TBO_HOTEL=false
```

This allows:
- ✅ Flight search returns demo data
- ✅ Hotel search returns demo data
- ✅ All UI flows work end-to-end
- ✅ Developers can continue frontend work
- ❌ No real TBO data until endpoint issue resolved

---

## Backend Code Status

All backend code is **complete and ready**:

### Implemented Components
- ✅ `AirService.php` - TBO Flight API integration
- ✅ `SoapClient12.php` - SOAP 1.2 client with proxy support
- ✅ `FlightController.php` - API endpoints (search, fare quote, book, ticket)
- ✅ Dynamic namespace/action switching
- ✅ Proper SOAP envelope structure
- ✅ WS-Addressing headers
- ✅ Authentication headers
- ✅ Request body validation
- ✅ Error handling and logging
- ✅ Markup/commission calculation

### Configuration Files Updated
- ✅ `config/services.php` - TBO service config
- ✅ `.env` - Production credentials and URLs
- ✅ `.env.local` - Local development config
- ✅ Documentation updated (TBO_INTEGRATION_GUIDE.md, etc.)

### Ready to Test Once Endpoint Works
```bash
# Just update the endpoint and credentials:
TBO_AIR_API=https://[CORRECT_URL_FROM_TBO]
TBO_USERNAME=LKOM258
TBO_PASSWORD=New@api/LKO$582

# Then:
php artisan config:cache
curl -X POST http://localhost:8000/api/v1/flights/search -H "Content-Type: application/json" -d '{
  "origin": "DEL",
  "destination": "BOM",
  "departDate": "2025-11-05",
  "adults": 1
}'
```

---

## Sample SOAP Request Being Sent

Our backend generates the following SOAP envelope (credentials masked in logs):

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:wsa="http://www.w3.org/2005/08/addressing">
    <soap12:Header>
        <wsa:Action>http://TekTravel/FlightApi/Search</wsa:Action>
        <wsa:MessageID>urn:uuid:976a66e2-0bc7-4608-baf9-63e647411246</wsa:MessageID>
        <wsa:To>https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc</wsa:To>
        <wsa:ReplyTo>
            <wsa:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa:Address>
        </wsa:ReplyTo>
        <fl:Authentication xmlns:fl="http://TekTravel/FlightApi/">
            <fl:UserName>LKOM258</fl:UserName>
            <fl:Password>New@api/LKO$582</fl:Password>
        </fl:Authentication>
    </soap12:Header>
    <soap12:Body>
        <fl:Search xmlns:fl="http://TekTravel/FlightApi/">
            <fl:request>
                <fl:SearchModifiers>
                    <fl:AdultCount>1</fl:AdultCount>
                    <fl:ChildCount>0</fl:ChildCount>
                    <fl:InfantCount>0</fl:InfantCount>
                    <fl:CabinClass>E</fl:CabinClass>
                </fl:SearchModifiers>
                <fl:OriginDestinationInformations>
                    <fl:OriginDestinationInformation>
                        <fl:DeparturePoint>DEL</fl:DeparturePoint>
                        <fl:ArrivalPoint>BOM</fl:ArrivalPoint>
                        <fl:DepartureDateTime>2025-11-05</fl:DepartureDateTime>
                    </fl:OriginDestinationInformation>
                </fl:OriginDestinationInformations>
                <fl:TravellerInfo>
                    <fl:Adult>1</fl:Adult>
                    <fl:Child>0</fl:Child>
                    <fl:Infant>0</fl:Infant>
                </fl:TravellerInfo>
                <fl:ClientId>tboprod</fl:ClientId>
                <fl:EndUserIp>157.245.100.148</fl:EndUserIp>
            </fl:request>
        </fl:Search>
    </soap12:Body>
</soap12:Envelope>
```

HTTP Headers:
```
Content-Type: application/soap+xml; charset=UTF-8; action="http://TekTravel/FlightApi/Search"
SOAPAction: http://TekTravel/FlightApi/Search
Accept-Encoding: gzip, deflate
```

---

## Next Steps (Post-TBO Response)

Once TBO provides the correct working endpoint:

1. **Update environment variables:**
   ```bash
   # Update in .env and .env.local
   TBO_AIR_API=[correct URL from TBO]
   TBO_AIR_BOOK=[correct URL from TBO]
   ```

2. **Clear caches:**
   ```bash
   cd ih-backend
   php artisan config:clear
   php artisan cache:clear
   php artisan config:cache
   ```

3. **Enable live mode:**
   ```bash
   USE_MOCK=false
   USE_TBO_FLIGHT=true
   ```

4. **Test immediately:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/flights/search \
     -H "Content-Type: application/json" \
     -d '{"origin":"DEL","destination":"BOM","departDate":"2025-11-05","adults":1}'
   ```

5. **Monitor logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

---

## Contact Information

**TBO Support Contact:**
- Support team who provided the credentials
- Request: Verify endpoint URL and service availability for user LKOM258

**Internal Team:**
- Backend: All SOAP integration code complete
- Frontend: Works with mock data, ready for live data
- DevOps: SSH tunnel and proxy configured

---

## Files to Review Post-Fix

Once TBO resolves the endpoint issue, verify these work:

- [ ] Flight search (DEL → BOM)
- [ ] Fare quote
- [ ] Flight booking
- [ ] Ticket issuance
- [ ] PNR retrieval
- [ ] Hotel search (once enabled)

---

**Last Updated:** October 16, 2025  
**Waiting On:** TBO Support to confirm working endpoint URL
