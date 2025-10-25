# TBO API Quick Start Guide
**For Developers - Get Started in 30 Minutes**

---

## 1. Initial Setup (5 minutes)

### Get Your TBO Credentials

Ask TBO support for:
```
ClientID: tboprod
Username: LKOM258
Password: New@api/LKO$582
EndUserIP: your-server-ip
```

### Add to Backend .env.local

```bash
cd ih-backend
cat >> .env.local << 'EOF'

# TBO Configuration
TBO_CLIENT_ID=tboprod
TBO_USERNAME=LKOM258
TBO_PASSWORD=New@api/LKO$582
TBO_ENDUSER_IP=your-server-ip
TBO_FLIGHT_MODE=rest
USE_TBO_FLIGHT=true
USE_TBO_HOTEL=false
USE_MOCK=false

EOF
```

---

## 2. Start Development (5 minutes)

### Backend
```bash
cd ih-backend
composer install
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend (in new terminal)
```bash
cd ih-frontend
npm install
npm run dev
```

---

## 3. Test Flight Search (5 minutes)

### Using cURL

```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "TraceId": "TRACE-ID-HERE",
      "Results": [
        {
          "ResultIndex": "0",
          "Fare": {
            "Currency": "INR",
            "BaseFare": 3500,
            "Tax": 650,
            "OfferedFare": 4150
          },
          "Segments": [[...flight details...]]
        }
      ]
    }
  }
}
```

---

## 4. Test Hotel Search (5 minutes)

### First Get Cities

```bash
curl http://localhost:8000/api/v1/hotels/countries
curl "http://localhost:8000/api/v1/hotels/cities?country=AE"
```

### Then Search Hotels

```bash
curl -X POST http://localhost:8000/api/v1/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "DXB",
    "cityName": "Dubai",
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "currency": "AED",
    "nationality": "IN",
    "rooms": [{"adults": 2, "children": 0}],
    "page": 1,
    "pageSize": 20
  }'
```

---

## 5. Key TBO Parameters

### Airport Codes (Flights)
```
BOM = Bombay/Mumbai
LKO = Lucknow
DEL = Delhi
DXB = Dubai
AUH = Abu Dhabi
```

### City Codes (Hotels)
```
DXB = Dubai
AUH = Abu Dhabi
LKO = Lucknow
DLI = Delhi
```

### Cabin Classes (Flights)
```
E = Economy
P = Premium Economy
B = Business
F = First
```

### Trip Types
```
O = One Way
R = Round Trip
```

---

## 6. Common Requests & Responses

### Request: Round Trip Flight Search

```json
{
  "segments": [
    {
      "origin": "BOM",
      "destination": "DXB",
      "departureDate": "2025-12-15"
    },
    {
      "origin": "DXB",
      "destination": "BOM",
      "departureDate": "2025-12-22"
    }
  ],
  "tripType": "R",
  "adults": 2,
  "children": 1,
  "cabinClass": "E"
}
```

### Request: Flight Booking

```json
{
  "resultIndex": "0",
  "traceId": "TRACE-ID-FROM-SEARCH",
  "passengers": [
    {
      "type": "ADT",
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "gender": "M",
      "email": "john@example.com",
      "mobile": "+91-9876543210"
    }
  ]
}
```

### Request: Hotel PreBook

```json
{
  "bookingCode": "BOOKING-CODE-FROM-SEARCH",
  "traceId": "HTL-TRACE-ID"
}
```

### Request: Hotel Booking

```json
{
  "bookingCode": "BOOKING-CODE",
  "guest": {
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+971-501234567",
    "nationality": "IN"
  }
}
```

---

## 7. Debug Mode

### Enable Debug Logs

```bash
# Add to .env
LOG_LEVEL=debug

# Watch real-time logs
php artisan pail --timeout=0
```

### Check Configuration

```bash
curl http://localhost:8000/api/v1/debug/config

# Response shows:
{
  "env": {
    "USE_MOCK": false,
    "USE_TBO_FLIGHT": true
  },
  "config": {
    "use_mock": false,
    "enable_flight_api": true,
    "flight_mode": "rest",
    "tbo_proxy": null
  }
}
```

---

## 8. Troubleshooting

### Issue: "Connection refused"
```
1. Ensure backend is running: php artisan serve
2. Check port: http://localhost:8000/api/v1/health
3. Verify firewall allows connections
```

### Issue: "401 Unauthorized"
```
1. Check TBO credentials in .env
2. Verify ClientID, Username, Password
3. Ensure IP is whitelisted with TBO
```

### Issue: "No Results Found"
```
1. Try different airport codes
2. Verify dates are in future
3. Check with popular routes (BOM-DEL, BOM-LKO)
```

### Issue: CORS Errors
```
1. Verify backend is running
2. Check NEXT_PUBLIC_API_BASE_URL in frontend .env
3. Should be: http://localhost:8000/api/v1
```

---

## 9. Important Files

### Backend Configuration
- `ih-backend/config/services.php` - TBO API URLs and credentials
- `ih-backend/app/Services/TBO/AirService.php` - Flight API logic
- `ih-backend/app/Services/TBO/HotelService.php` - Hotel API logic
- `ih-backend/app/Http/Controllers/Api/V1/FlightController.php` - Flight endpoints
- `ih-backend/app/Http/Controllers/Api/V1/HotelsController.php` - Hotel endpoints

### Frontend Files
- `ih-frontend/src/lib/flight-api.ts` - Flight API client
- `ih-frontend/src/lib/tboTypes.ts` - TBO data types
- `ih-frontend/src/types/` - TypeScript type definitions

---

## 10. Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] `.env.local` configured with TBO credentials
- [ ] Flight search returns results
- [ ] Hotel search returns results
- [ ] Can see debug config endpoint
- [ ] Logs appear in `pail` command
- [ ] No CORS errors in console
- [ ] Booking endpoint accessible

---

## 11. Next Steps

1. **Read Full Guide:** See `TBO_API_COMPREHENSIVE_INTEGRATION_GUIDE.md`
2. **Explore Code:** Check `AirService.php` and `HotelService.php`
3. **Implement Frontend:** Create search and booking UI components
4. **Integrate Payment:** Connect Razorpay for payments
5. **Test End-to-End:** Complete booking flow
6. **Deploy:** Use `ecosystem.config.js` for production

---

## Command Cheat Sheet

```bash
# Backend
php artisan serve                 # Start server
php artisan migrate              # Run migrations
php artisan queue:listen         # Listen to queues
php artisan pail                 # Stream logs
php artisan tinker              # Interactive shell

# Frontend
npm run dev                      # Dev server
npm run build                    # Build for production
npm run lint                     # Check code style

# Database
php artisan db:seed             # Seed database
php artisan migrate:fresh       # Reset and seed

# Combined
composer run dev                # Start everything

# Testing
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Credentials Summary

| Variable | Value |
|----------|-------|
| TBO_CLIENT_ID | tboprod |
| TBO_USERNAME | LKOM258 |
| TBO_PASSWORD | New@api/LKO$582 |
| Backend Port | 8000 |
| Frontend Port | 3000 |
| API Base URL | http://localhost:8000/api/v1 |

---

## Support

- **Error Logs:** `ih-backend/storage/logs/laravel.log`
- **Real-time Logs:** `php artisan pail --timeout=0`
- **API Health:** `http://localhost:8000/api/v1/health`
- **Configuration:** `http://localhost:8000/api/v1/debug/config`

---

**Happy Coding! 🚀**
