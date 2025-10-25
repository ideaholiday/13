# 🎯 Expedia Flight UI - Visual Test & Demo Guide

Complete step-by-step walkthrough to see the Expedia-style flight interface in action.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Start Backend

```bash
cd /Users/jitendramaury/iholiday/13/ih-backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Expected output:**
```
Server running on [http://127.0.0.1:8000]
```

### Step 2: Start Frontend

```bash
cd /Users/jitendramaury/iholiday/13/ih-frontend
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.x.x
  - Local: http://localhost:3002
```

### Step 3: Open Browser

Navigate to:
```
http://localhost:3002/flights/results?origin=DEL&destination=BOM&departDate=2025-11-20&tripType=O&adults=1&children=0&infants=0&cabinClass=E
```

---

## 📸 What You Should See

### Page 1: Flight Results

```
┌─────────────────────────────────────────────────────────────┐
│  Flights DEL → BOM                                          │
│  112 flights available • Sorted by price                    │
└─────────────────────────────────────────────────────────────┘

┌────────────────┐  ┌────────────────────────────────────────┐
│   FILTERS      │  │         FLIGHT CARD 1                  │
│                │  │                                        │
│ ☐ Non-stop     │  │ [✈] Air India                ₹5,715   │
│ ☐ Refundable   │  │      AI 2425              ✓ Refundable│
│ ☐ LCC          │  │                                        │
│ Price Min/Max  │  │  10:30 [DEL] ←-3h15m→ [BOM] 12:55    │
│ Airlines:      │  │              Nonstop                   │
│ ☐ AI           │  │  [Select]                              │
│ ☐ 6E           │  │                                        │
│ ☐ SG           │  └────────────────────────────────────────┘
│                │
│                │  ┌────────────────────────────────────────┐
│                │  │         FLIGHT CARD 2                  │
│                │  │  [✈] IndiGo                  ₹5,289   │
│                │  │      6E 5431              ✓ Refundable│
│                │  │                                        │
│                │  │  11:00 [DEL] ←-3h20m→ [BOM] 14:20    │
│                │  │              Nonstop                   │
│                │  │  [Select]                              │
│                │  └────────────────────────────────────────┘
│                │
│                │  [... 110 more flights ...]
└────────────────┘
```

---

## 🎮 Interactive Tests

### Test 1: Load & Display

**Action:** Page loads automatically  
**Expected:** 
- ✅ 112 flights display in 2-3 seconds
- ✅ Each card shows: airline, time, duration, stops, price
- ✅ Refundable badge appears on eligible flights
- ✅ Sidebar filters show on desktop (hidden on mobile)

### Test 2: Filter by Price

**Action:** 
1. Find "Price" section in sidebar
2. Change Max Price from 100000 to 6000

**Expected:**
- ✅ Results instantly filter
- ✅ Count shows "Showing 45 of 112 flights"
- ✅ Only flights ≤ ₹6,000 displayed

### Test 3: Filter by Non-Stop

**Action:**
1. Check "☐ Non-stop only" checkbox

**Expected:**
- ✅ Results update immediately
- ✅ Count shows "Showing 67 of 112 flights"
- ✅ All flights show "Nonstop" (not "1 stop" or "2 stops")

### Test 4: Filter by Refundable

**Action:**
1. Check "☐ Refundable flights only" checkbox

**Expected:**
- ✅ Results update
- ✅ All flights display green "✓ Refundable" badge
- ✅ Count drops to ~95 flights

### Test 5: Filter by Airline

**Action:**
1. Find "Airlines" section at bottom of sidebar
2. Uncheck all airlines except "AI"

**Expected:**
- ✅ Only Air India flights (AI) display
- ✅ Count shows "Showing 35 of 112 flights"
- ✅ All cards show "Air India" airline name

### Test 6: Select a Flight

**Action:**
1. Click [Select] button on any flight card

**Expected:**
- ✅ Page navigates to `/flights/review`
- ✅ URL shows flight selection stored
- ✅ Review page loads (see Test 7 below)

---

## 📄 Review Page Details

### Page 2: Flight Review

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back  Review Flight                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✈ Air India                                                │
│                                                              │
│   10:30              3h 15m              12:55              │
│   DEL              Nonstop               BOM                │
│                                                              │
│  Flight: AI 2425  | Aircraft: Boeing 737  | Stops: 0       │
│                    | Baggage: 15kg                          │
│                                                              │
│  [✓ Refundable]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Price Breakdown                          💳                │
│                                                              │
│  Base Fare                        ₹5,400                    │
│  Taxes & Fees                     ₹315                      │
│  ─────────────────────────────────────────                  │
│  Total Price                      ₹5,715                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                  ┌──────────────────────────┐
                  │ Back to Results          │
                  └──────────────────────────┘
              ┌──────────────────────────────────┐
              │ Continue to Booking              │
              └──────────────────────────────────┘
```

---

## ✨ Test 7: Review Page Features

### Action: View Flight Details

**Expected on review page:**
- ✅ Large departure time (10:30) and arrival time (12:55)
- ✅ Origin (DEL) and destination (BOM) codes below times
- ✅ Duration (3h 15m) in center
- ✅ Flight number: "AI 2425"
- ✅ Stops: "0" (or "None")
- ✅ Baggage info: "15kg"
- ✅ Green "✓ Refundable" badge

### Action: Check Fare Breakdown

**Expected:**
- ✅ Base Fare: ₹5,400
- ✅ Taxes & Fees: ₹315
- ✅ Total: ₹5,715 (in large, bold font)

### Action: Click "Back to Results"

**Expected:**
- ✅ Returns to `/flights/results` page
- ✅ Previous filters remain applied
- ✅ Can select another flight

### Action: Click "Continue to Booking"

**Expected:**
- ✅ Shows alert: "Proceeding to booking..."
- ✅ Ready for booking page integration

---

## 🔍 Advanced Tests

### Test 8: Responsive Design

**Desktop (1920px):**
- ✅ Sidebar filters visible (left, 280px wide)
- ✅ Flight cards span full width minus sidebar
- ✅ Grid layout shows ~1 card at a time

**Tablet (768px):**
- ✅ Sidebar hidden
- ✅ Flight cards wider
- ✅ Filters accessible via collapsible menu (if added)

**Mobile (375px):**
- ✅ Full-width cards
- ✅ Sidebar hidden
- ✅ Times stack vertically
- ✅ [Select] button full width

### Test 9: Empty Results

**Action:**
1. Change URL to invalid search:
```
http://localhost:3002/flights/results?origin=DEL&destination=XYZ&departDate=2025-12-31&tripType=O&adults=1&cabinClass=E
```

**Expected:**
- ✅ Backend returns error or empty results
- ✅ Page shows: "No flights found matching your filters."
- ✅ Airplane icon and message displayed

### Test 10: Error Handling

**Action:**
1. Stop backend server
2. Try to search again

**Expected:**
- ✅ Loading spinner shows initially
- ✅ Error card appears: "Search Failed"
- ✅ Error message displayed
- ✅ [Try Again] button visible

---

## 📊 Data Verification

### Check Real Flight Data

**Open browser DevTools** (F12):

1. Go to **Network** tab
2. Click any [Select] button
3. Check **Request/Response**:

**Request sent to backend:**
```json
{
  "origin": "DEL",
  "destination": "BOM",
  "departDate": "2025-11-20",
  "tripType": "O",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E"
}
```

**Response from backend:**
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "TraceId": "...",
      "Origin": "DEL",
      "Destination": "BOM",
      "Results": [
        [{
          "ResultIndex": "...",
          "Fare": { "BaseFare": 5771, "Tax": 944, "Currency": "INR" },
          "Segments": [[{
            "Airline": { "AirlineCode": "AI", "AirlineName": "Air India" },
            "DepTime": "2025-11-20T10:30:00",
            "ArrTime": "2025-11-20T12:55:00",
            ...
          }]],
          "IsRefundable": true
        }]
      ]
    }
  }
}
```

---

## 🎨 Visual Checklist

- [ ] **Airline Section**: Shows logo + name + flight number
- [ ] **Time Section**: 
  - [ ] Left: Departure time (large, bold)
  - [ ] Center: Duration + stops info
  - [ ] Right: Arrival time (large, bold)
- [ ] **Badges**:
  - [ ] Green "✓ Refundable" appears
  - [ ] Orange "LCC" appears (if applicable)
- [ ] **Price**:
  - [ ] Shows as "₹5,715" in blue
  - [ ] "per person" label below
- [ ] **Colors**:
  - [ ] Blue buttons: #2563eb
  - [ ] Green badges: #16a34a
  - [ ] Orange badges: #ea580c
  - [ ] Slate text: #64748b
- [ ] **Spacing**:
  - [ ] Cards: 12px padding internal
  - [ ] Gap between cards: 12px
  - [ ] Sidebar width: 280px (fixed)
  - [ ] Main content max-width: 7xl

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Page shows "Loading..." forever | Restart backend: `php artisan serve` |
| 502 Bad Gateway error | Backend not responding at `localhost:8000` |
| No flights displayed | Check URL parameters: all 8 required |
| Filters don't work | Refresh page, clear browser cache |
| Review page blank | Select a flight from results first |
| Styles look broken | Clear `.next` folder: `rm -rf ih-frontend/.next` |
| TypeScript errors | `npm install` in `ih-frontend` root |

---

## 📞 Support

**Backend logs:** `tail -f ih-backend/storage/logs/laravel.log`  
**Frontend logs:** Check browser DevTools Console (F12)  
**Query params:** All 8 required in URL:
- origin, destination, departDate, tripType, adults, children, infants, cabinClass

---

## 🎉 Success Criteria

✅ Page loads in <3 seconds  
✅ 100+ flights displayed  
✅ Filters work instantly  
✅ Click select → review page works  
✅ Fare breakdown shows correct totals  
✅ Responsive on mobile/tablet/desktop  
✅ No console errors  
✅ No TypeScript errors during build  

**All criteria met? Your Expedia-style flight UI is production-ready! 🚀**
