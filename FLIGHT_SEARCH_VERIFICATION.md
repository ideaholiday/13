# Flight Search - Quick Verification Checklist

Use this checklist to verify the flight search is working correctly.

## ✅ Pre-Flight Checks (5 minutes)

### 1. Backend Health Check
```bash
curl http://localhost:8000/api/v1/health
```
**Expected:** `{"ok":true}`

**If fails:**
```bash
cd ih-backend
php artisan serve --host=127.0.0.1 --port=8000
```

### 2. Frontend Environment
```bash
cd ih-frontend
cat .env.local | grep NEXT_PUBLIC_API_BASE_URL
```
**Expected:** `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`

**If wrong:**
```bash
# Edit .env.local and restart Next.js
npm run dev
```

### 3. Quick Backend Test
```bash
./tools/quick-backend-check.sh
```
**Expected:** All checks ✓ OK

---

## ✅ Flight Search Test (2 minutes)

### 1. Open Frontend
Visit: http://localhost:3000

### 2. Fill Search Form
- **From:** BOM (Mumbai)
- **To:** LKO (Lucknow)  
- **Date:** Tomorrow's date
- **Passengers:** 1 Adult
- **Class:** Economy

### 3. Click "Search Flights"

### 4. Verify Loading State
Should show: "Searching for the best flight deals..."

### 5. Check Results Page
URL should be: `http://localhost:3000/flights/search?tripType=oneway&from=BOM&to=LKO&...`

### 6. Verify Results Display
Should show:
- ✅ Flight cards with airline names
- ✅ Departure/arrival times
- ✅ Prices in ₹
- ✅ "Book Now" or "Select" buttons

---

## ✅ Browser Console Checks

### Open DevTools (F12) → Console Tab

**Good Signs:**
```
[Flight Search] Calling backend API with params: {...}
[Flight Search] Backend API Response: {success: true, data: {...}}
Found X flights for your journey
```

**Bad Signs:**
```
❌ Failed to fetch
❌ CORS error
❌ 404 Not Found
❌ Network error
```

---

## ✅ Network Tab Checks

### Open DevTools (F12) → Network Tab

**Look for request to:**
`http://localhost:8000/api/v1/flights/search`

**Check:**
- ✅ Status: 200 OK
- ✅ Method: POST
- ✅ Response has `success: true`
- ✅ Response has `data.results` array

---

## 🐛 Troubleshooting

### Issue: "Failed to search flights"

**Check 1: Is backend running?**
```bash
curl http://localhost:8000/api/v1/health
```

**Check 2: CORS errors in console?**
- Already fixed in config
- Restart both backend and frontend

**Check 3: Network tab shows 404?**
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- Restart frontend: `npm run dev`

**Check 4: 500 Server Error?**
```bash
# Check backend logs
tail -f ih-backend/storage/logs/laravel.log
```

### Issue: "No flights found"

**Check TBO configuration:**
```bash
curl http://localhost:8000/api/v1/debug/config
```

**Look for:**
- `use_mock: true` → Using mock data (OK for testing)
- `use_mock: false` → Using TBO API (requires credentials)

### Issue: Blank page / Loading forever

**Check browser console** for JavaScript errors

**Check if port 3000 is accessible:**
```bash
curl http://localhost:3000
```

---

## ✅ Success Criteria

All of these should be TRUE:

- [ ] Backend `/health` endpoint returns `{"ok":true}`
- [ ] Frontend loads at http://localhost:3000
- [ ] Search form is visible and responsive
- [ ] Can select airports from dropdown
- [ ] Can select dates
- [ ] Search button works
- [ ] Redirects to results page
- [ ] Results page shows loading spinner
- [ ] Results display (or mock data displays)
- [ ] No CORS errors in console
- [ ] No 404 errors in network tab

---

## 📞 Quick Reference

**Start Backend:**
```bash
cd ih-backend && php artisan serve
```

**Start Frontend:**
```bash
cd ih-frontend && npm run dev
```

**Quick Test:**
```bash
./tools/quick-backend-check.sh
```

**Full Test:**
```bash
./tools/test-flight-api.sh
```

**Check Logs:**
```bash
tail -f ih-backend/storage/logs/laravel.log
```

---

**Last Updated:** October 20, 2025  
**All fixes applied:** ✅ Ready to test!
