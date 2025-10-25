# TBO Flight API - Quick Reference & Troubleshooting

## Quick Start

### Backend
```bash
cd /Users/jitendramaury/iholiday/13/ih-backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend
```bash
cd /Users/jitendramaury/iholiday/13/ih-frontend
npm run dev
```

### Test URL
```
http://localhost:3000
Search: From BOM → To DEL → Date 2025-11-20 → Adults 2, Children 1 → Cabin Premium Economy
```

---

## API Endpoints

### Search Flights
```bash
POST /api/v1/flights/search

curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DEL",
    "destination": "BOM",
    "departDate": "2025-11-15",
    "tripType": "O",
    "adults": 1,
    "children": 0,
    "infants": 0,
    "cabinClass": "E"
  }'
```

### Health Check
```bash
GET /api/v1/health

curl http://localhost:8000/api/v1/health
```

### API Version
```bash
GET /api/v1/version

curl http://localhost:8000/api/v1/version
```

---

## Cabin Class Codes
- `E` = Economy
- `PE` = Premium Economy
- `B` = Business
- `F` = First Class

## Trip Type Codes
- `O` = One-Way
- `R` = Round-Trip

---

## Debugging

### Check Backend Logs
```bash
# Last 50 lines
tail -50 /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log

# Watch live logs
tail -f /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log

# Search for TBO entries
tail -100 /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log | grep -i tbo

# Find success messages
tail -100 /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log | grep "TBO Flight Search Success"
```

### What to Look For in Logs
✅ `"TBO Authentication Successful"` → Auth working  
✅ `"TBO Flight Search REST Response"` → API called  
✅ `"results_count": 158` → Flights found  
✅ `"response_status": 1` → TBO success  
❌ `"Please specify Flight Segment"` → Segment format issue  
❌ `"TBO Authentication Failed"` → Credentials issue  

---

## Environment Variables

### Key Settings in `.env`
```
TBO_FLIGHT_MODE=rest                # Use REST (not SOAP)
TBO_CLIENT_ID=tboprod               # TBO account
TBO_USERNAME=LKOM258                # TBO username
TBO_PASSWORD=New@api/LKO$582        # TBO password
TBO_ENDUSER_IP=157.245.100.148      # Endpoint IP
USE_TBO_FLIGHT=true                 # Enable live TBO API
USE_MOCK=true                       # Enable fallback mock
```

### To Enable/Disable Features
```bash
# Edit .env file
nano /Users/jitendramaury/iholiday/13/ih-backend/.env

# Then clear cache
cd /Users/jitendramaury/iholiday/13/ih-backend
php artisan config:clear
php artisan cache:clear
```

---

## Test Scenarios

### Scenario 1: Basic One-Way Search
```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DEL",
    "destination": "BOM",
    "departDate": "2025-11-15",
    "tripType": "O",
    "adults": 1,
    "cabinClass": "E"
  }'
```
Expected: 150+ Economy flights

### Scenario 2: Business Class Search
```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BOM",
    "destination": "BLR",
    "departDate": "2025-11-18",
    "tripType": "O",
    "adults": 1,
    "cabinClass": "B"
  }'
```
Expected: Business class flights with higher pricing

### Scenario 3: Family Search (2 Adults + 1 Child)
```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BOM",
    "destination": "DEL",
    "departDate": "2025-11-20",
    "tripType": "O",
    "adults": 2,
    "children": 1,
    "infants": 0,
    "cabinClass": "PE"
  }'
```
Expected: Premium Economy flights for 3 passengers

### Scenario 4: Round-Trip (Future)
```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DEL",
    "destination": "BOM",
    "departDate": "2025-11-15",
    "returnDate": "2025-11-22",
    "tripType": "R",
    "adults": 1,
    "cabinClass": "E"
  }'
```
Expected: Outbound + return flight options

---

## Common Issues & Solutions

### Issue: "Please specify Flight Segment"
**Cause**: Segment array not being built correctly  
**Check**: 
```bash
tail -50 /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log | grep "Segments"
```
**Should show**: `"Segments":[{"Origin":"DEL",...}]`  
**Not**: `"Segments":[]`

### Issue: Empty Results (results_count: 0)
**Cause**: Invalid date in past or invalid route  
**Check**:
- Date is in future
- Airport codes are valid (3 letters, IATA code)
- At least 1 adult passenger

### Issue: Authentication Failed
**Cause**: Invalid TBO credentials  
**Check**: `.env` file has correct values
```bash
grep "TBO_" /Users/jitendramaury/iholiday/13/ih-backend/.env
```

### Issue: Timeout (>30 seconds)
**Cause**: TBO API slow or down  
**Solution**: Check logs, may fallback to mock data

---

## Performance Tips

1. **Token Caching**: Tokens are cached automatically - first request takes longer
2. **Batch Requests**: If making many searches, they reuse the same token
3. **Date Selection**: Prices vary by date - recommend showing calendar view
4. **Peak Times**: TBO API slower during peak booking hours
5. **Results Limit**: TBO returns 100+ results per page by default

---

## File Locations

| Component | Path |
|-----------|------|
| Backend Code | `/ih-backend/app/Http/Controllers/Api/V1/FlightController.php` |
| Service Layer | `/ih-backend/app/Services/TBO/AirService.php` |
| Config | `/ih-backend/config/services.php` |
| Environment | `/ih-backend/.env` |
| Frontend API Client | `/ih-frontend/src/lib/flight-api.ts` |
| Frontend Component | `/ih-frontend/src/components/flights/flight-search-results.tsx` |
| Backend Logs | `/ih-backend/storage/logs/laravel.log` |
| Documentation | `/TBO_API_LIVE_VERIFICATION_REPORT.md` |

---

## Useful Commands

### Restart Backend
```bash
cd /Users/jitendramaury/iholiday/13/ih-backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Clear Cache
```bash
cd /Users/jitendramaury/iholiday/13/ih-backend
php artisan config:clear
php artisan cache:clear
```

### Check Syntax
```bash
cd /Users/jitendramaury/iholiday/13/ih-backend
php -l app/Http/Controllers/Api/V1/FlightController.php
php -l app/Services/TBO/AirService.php
```

### View Recent Errors
```bash
tail -200 /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log | tail -50
```

### Search Logs
```bash
grep "Flight Search Success" /Users/jitendramaury/iholiday/13/ih-backend/storage/logs/laravel.log | tail -10
```

---

## Response Format

### Successful Response
```json
{
  "success": true,
  "data": {
    "Response": {...},
    "results": [
      {
        "resultIndex": "OB1[TBO]...",
        "Airline": {"AirlineCode": "AI", "FlightNumber": "101"},
        "Segments": [{"Origin": "DEL", "Destination": "BOM", ...}],
        "Fare": {"Currency": "INR", "BaseFare": 14202, "Tax": 1545, ...}
      }
    ],
    "traceId": "760bcd04-..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid origin airport code",
  "errors": {"origin": ["must be 3 characters"]}
}
```

---

## Next Steps

- [ ] Test round-trip flights
- [ ] Test multi-city routing
- [ ] Implement fare quote (reprice)
- [ ] Implement booking
- [ ] Implement ticket issuance
- [ ] Set up monitoring/alerts
- [ ] Configure markup percentage
- [ ] Test with production TBO account

---

## Contact & Support

For issues with TBO API:
1. Check logs: `tail -100 /ih-backend/storage/logs/laravel.log | grep TBO`
2. Verify credentials in `.env`
3. Test with curl command above
4. Check TBO API status with health endpoint

---

**Last Updated**: October 20, 2025  
**Status**: ✅ All systems operational  
**Version**: 1.0 Complete
