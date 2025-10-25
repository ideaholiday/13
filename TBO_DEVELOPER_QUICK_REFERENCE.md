# TBO Integration - Developer Quick Reference Card
**One-Page Reference for Common Tasks**

---

## 🚀 Quick Setup (5 minutes)

```bash
# Backend
cd ih-backend
cp .env.example .env.local
# Add TBO credentials to .env.local
composer install
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000

# Frontend (new terminal)
cd ih-frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1 npm run dev

# Visit http://localhost:3000
```

---

## 📋 TBO Credentials

```
ClientID:    tboprod
Username:    LKOM258
Password:    New@api/LKO$582
Endpoint IP: 157.245.100.148
```

---

## 🔗 Key API Endpoints

### Flight Search
```
POST /api/v1/flights/search
{
  "segments": [{"origin": "BOM", "destination": "LKO", "departureDate": "2025-12-15"}],
  "tripType": "O",
  "adults": 1,
  "cabinClass": "E"
}
```

### Hotel Search
```
POST /api/v1/hotels/search
{
  "cityId": "DXB",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "rooms": [{"adults": 2}]
}
```

### Flight Book
```
POST /api/v1/flights/book
{
  "resultIndex": "0",
  "traceId": "...",
  "passengers": [{
    "type": "ADT",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }]
}
```

### Hotel Book
```
POST /api/v1/hotels/book
{
  "bookingCode": "...",
  "guest": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

---

## 🌍 Airport & City Codes

### Popular Airports
```
BOM = Mumbai/Bombay
DEL = Delhi
LKO = Lucknow
DXB = Dubai
AUH = Abu Dhabi
SFO = San Francisco
JFK = New York
LHR = London
```

### Popular Cities
```
DXB = Dubai
AUH = Abu Dhabi
LKO = Lucknow
DLI = Delhi
MUM = Mumbai
```

---

## 🎟️ Cabin Classes & Trip Types

**Cabin Classes:**
```
E = Economy
P = Premium Economy
B = Business
F = First
```

**Trip Types:**
```
O = One Way
R = Round Trip
```

**Passenger Types:**
```
ADT = Adult
CHD = Child (2-11 years)
INF = Infant (0-2 years)
```

---

## 🔧 Important Files

| File | Purpose |
|------|---------|
| `ih-backend/config/services.php` | TBO configuration |
| `ih-backend/app/Services/TBO/AirService.php` | Flight logic |
| `ih-backend/app/Services/TBO/HotelService.php` | Hotel logic |
| `ih-backend/.env.local` | Backend credentials |
| `ih-frontend/.env.local` | Frontend config |
| `ih-frontend/src/lib/flight-api.ts` | Flight client |

---

## 💡 Common Tasks

### Test Flight Search
```bash
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "segments": [{"origin":"BOM","destination":"LKO","departureDate":"2025-12-15"}],
    "tripType":"O","adults":1,"cabinClass":"E"
  }'
```

### View Real-time Logs
```bash
php artisan pail --timeout=0
```

### Check Configuration
```bash
curl http://localhost:8000/api/v1/debug/config
```

### Enable Debug Mode
```bash
# In .env.local
LOG_LEVEL=debug
APP_DEBUG=true
```

### Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
```

### Test Database
```bash
php artisan tinker
>>> DB::connection()->getPdo()
>>> App\Models\Country::count()
```

---

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| 401 Unauthorized | Check TBO credentials in .env |
| Connection refused | Ensure `php artisan serve` running |
| CORS error | Check `NEXT_PUBLIC_API_BASE_URL` |
| No results | Try different airport codes or dates |
| Database locked | Restart Laravel server |
| Timeout | Increase timeout: `timeout: 30` |

---

## 📊 Response Structure

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "error description",
  "error": "detailed error",
  "suggestions": ["suggestion 1", "suggestion 2"]
}
```

---

## 🎯 Development Workflow

1. **Read Guide** → Start with `TBO_QUICK_START_GUIDE.md`
2. **Setup** → Run setup commands above
3. **Test** → Test APIs with curl commands
4. **Explore** → Review code in `AirService.php`, `HotelService.php`
5. **Build** → Implement your features
6. **Test** → Test end-to-end flows
7. **Deploy** → Use `ecosystem.config.js`

---

## 📚 Documentation

**Complete Guides Available:**
- `TBO_API_COMPREHENSIVE_INTEGRATION_GUIDE.md` - Full reference
- `TBO_QUICK_START_GUIDE.md` - 30-min setup
- `TBO_API_REQUEST_RESPONSE_EXAMPLES.md` - All examples
- `TBO_INTEGRATION_PROJECT_SUMMARY.md` - Project overview

---

## 🔐 Security Checklist

- [ ] Store credentials in `.env.local`
- [ ] Never commit `.env.local` to git
- [ ] Use HTTPS in production
- [ ] Validate all user input
- [ ] Implement rate limiting
- [ ] Log all transactions
- [ ] Use API keys for auth
- [ ] Verify webhook signatures

---

## 🚀 Deployment

### Local Development
```bash
# Terminal 1: Backend
cd ih-backend
php artisan serve

# Terminal 2: Frontend
cd ih-frontend
npm run dev
```

### Production with PM2
```bash
pm2 start ecosystem.config.js
pm2 monit
pm2 logs
```

### Check Status
```bash
pm2 list
pm2 show iholiday-api
```

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| TBO Support | support@travelboutiqueonline.com |
| Laravel Docs | https://laravel.com |
| Next.js Docs | https://nextjs.org |
| TBO Docs | https://www.travelboutiqueonline.com/ |

---

## 🎓 Learning Path

**Day 1: Setup**
- [ ] Read TBO_QUICK_START_GUIDE.md
- [ ] Run setup commands
- [ ] Test flight search
- [ ] Test hotel search

**Day 2: Understanding**
- [ ] Read TBO_API_COMPREHENSIVE_INTEGRATION_GUIDE.md
- [ ] Review AirService.php
- [ ] Review HotelService.php
- [ ] Explore FlightController.php

**Day 3: Development**
- [ ] Build search UI
- [ ] Implement booking flow
- [ ] Test end-to-end
- [ ] Deploy

---

## ✅ Testing Checklist

- [ ] Flight search works
- [ ] Hotel search works
- [ ] Flight booking works
- [ ] Hotel booking works
- [ ] Error handling works
- [ ] Pagination works
- [ ] Mock mode works
- [ ] Real TBO API works

---

## 🔄 Environment Variables

**Must Have:**
```
TBO_CLIENT_ID=tboprod
TBO_USERNAME=LKOM258
TBO_PASSWORD=...
TBO_ENDUSER_IP=...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**Optional:**
```
TBO_FLIGHT_MODE=rest
USE_MOCK=false
IH_MARKUP_FLIGHT_PCT=3
IH_MARKUP_HOTEL_PCT=5
LOG_LEVEL=debug
```

---

## 🎨 Frontend Components

**Key Components to Implement:**
- SearchForm (flights + hotels)
- ResultsList (pagination)
- BookingForm (passenger details)
- PaymentForm (Razorpay integration)
- ConfirmationPage (booking details)

**State Management (Zustand):**
```
useFlightStore - Flight search state
useHotelStore - Hotel search state
useBookingStore - Booking state
usePaymentStore - Payment state
```

---

## ⚡ Performance Tips

1. **Cache Static Data** → Countries, cities, hotels (7 days)
2. **Pagination** → Limit results to 20-50 per page
3. **Request Debouncing** → Wait 300ms before search
4. **Response Caching** → Cache search results in browser
5. **Lazy Loading** → Load components on demand
6. **Image Optimization** → Use Next.js Image component
7. **API Monitoring** → Log slow requests (>5s)

---

## 📱 API Rate Limits

**Recommended:**
- Search: 1 req/second per user
- Book: No limit (important operation)
- Static data: 1 req/hour (use cache)
- Overall: 100 req/15 min per IP

**Implementation:**
```php
Route::middleware('throttle:100,15')->group(function () {
    Route::post('/flights/search', ...);
});
```

---

## 🔄 Common Workflows

### Flight Search → Book → Ticket
```
1. POST /flights/search → Get results with TraceId
2. POST /flights/fare-quote → Verify price
3. POST /flights/book → Create booking
4. POST /flights/ticket → Issue ticket
5. GET /flights/booking/{id} → Get confirmation
```

### Hotel Search → PreBook → Book
```
1. POST /hotels/search → Get results with BookingCode
2. POST /hotels/prebook → Verify price (30 min hold)
3. POST /hotels/book → Confirm booking
4. GET /hotels/booking/{id} → Get confirmation
```

---

## 🎯 Next Steps

1. ✅ **Setup** - Complete in 5 minutes
2. ✅ **Test** - Test APIs in 5 minutes
3. ⏭️ **Learn** - Read guides (1-2 hours)
4. ⏭️ **Build** - Implement features (varies)
5. ⏭️ **Deploy** - Go live

---

**Last Updated:** October 24, 2025  
**Quick Reference v2.0**
