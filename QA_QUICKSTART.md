# 🚀 QA & Testing Quick Start Guide

## 📍 You Are Here

This repository now has comprehensive QA and testing infrastructure. Here's how to get started in 5 minutes.

---

## 🎯 What's Available

✅ **Backend Tests** (Laravel/PHPUnit) - API integration tests  
✅ **Frontend Tests** (Jest) - UI and API consumption tests  
✅ **Health Checks** (Bash) - Automated TBO API monitoring  
✅ **Postman Collection** - Manual API testing  
✅ **GitHub Actions** - Automated CI/CD health checks  

---

## ⚡ Quick Start (Choose One)

### Option 1: Run Backend Tests
```bash
cd ih-backend
composer install
cp .env.local .env
php artisan key:generate
touch database/database.sqlite
php artisan test
```

### Option 2: Run Frontend Tests
```bash
cd ih-frontend
npm install --legacy-peer-deps
npm test
```

### Option 3: Run Health Check
```bash
bash qa/scripts/healthcheck.sh
```

### Option 4: Use Postman
1. Open Postman
2. Import `qa/postman/IdeaHoliday-TBO.postman_collection.json`
3. Run collection

---

## 📚 Full Documentation

| Document | Purpose | Link |
|----------|---------|------|
| **QA Infrastructure** | QA tools overview | [qa/README.md](qa/README.md) |
| **Testing Guide** | Complete testing docs | [TESTING_GUIDE.md](TESTING_GUIDE.md) |
| **Implementation Summary** | What was built | [QA_IMPLEMENTATION_COMPLETE.md](QA_IMPLEMENTATION_COMPLETE.md) |
| **Secrets Setup** | GitHub Actions config | [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md) |

---

## 🧪 Test Files Location

### Backend Tests
```
ih-backend/tests/Feature/
├── TboFlightHotelTest.php      # TBO API integration
├── FlightFlowTest.php          # Flight booking flow
└── HotelFlowTest.php           # Hotel booking flow
```

### Frontend Tests
```
ih-frontend/src/__tests__/
├── flightSearch.smoke.test.ts  # Flight API tests
└── hotelSearch.smoke.test.ts   # Hotel API tests
```

### QA Tools
```
qa/
├── postman/
│   └── IdeaHoliday-TBO.postman_collection.json
├── scripts/
│   └── healthcheck.sh
└── README.md
```

### CI/CD
```
.github/workflows/
└── live-tbo-health.yml
```

---

## 🎯 Common Tasks

### Run All Backend Tests
```bash
cd ih-backend
php artisan test
```

### Run Specific Test
```bash
php artisan test --filter TboFlightHotelTest
```

### Run Frontend Tests
```bash
cd ih-frontend
npm test
```

### Run Health Check
```bash
bash qa/scripts/healthcheck.sh
```

### Generate Coverage Report
```bash
# Backend
cd ih-backend
php artisan test --coverage

# Frontend
cd ih-frontend
npm test -- --coverage
```

---

## 🔧 Configuration

### Backend (.env)
```env
USE_MOCK=true                    # Set to false for live API
USE_TBO_FLIGHT=true             # Enable flight API
USE_TBO_HOTEL=true              # Enable hotel API
TBO_CLIENT_ID=your_client_id    # Your TBO credentials
TBO_USERNAME=your_username
TBO_PASSWORD=your_password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### GitHub Actions
Add these secrets in Settings → Secrets:
- `TBO_CLIENT_ID`
- `TBO_USERNAME`
- `TBO_PASSWORD`
- `END_USER_IP`

---

## 🐛 Troubleshooting

### Tests Fail?
```bash
# Backend: Check if dependencies installed
cd ih-backend && composer install

# Frontend: Reinstall dependencies
cd ih-frontend && npm install --legacy-peer-deps

# Both: Check .env files exist
ls -la ih-backend/.env
ls -la ih-frontend/.env.local
```

### Need Help?
1. Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed docs
2. Review [qa/README.md](qa/README.md) for QA tools
3. See troubleshooting sections in docs
4. Create GitHub issue if problem persists

---

## 📊 Test Coverage

### What's Tested

**Flights:**
- ✅ Search (one-way, round-trip)
- ✅ Fare quote
- ✅ Fare rules
- ✅ SSR (baggage, meals)
- ✅ Seat map
- ✅ Calendar fare
- ✅ Booking flow

**Hotels:**
- ✅ Search by city
- ✅ Room details
- ✅ Hotel info
- ✅ Booking flow

**Integration:**
- ✅ Backend APIs
- ✅ Frontend consumption
- ✅ End-to-end flows
- ✅ Error handling

---

## 🚀 Next Steps

1. **Run Tests**: Try the quick start commands above
2. **Read Docs**: Check out the full documentation
3. **Configure**: Set up your TBO credentials
4. **Automate**: Enable GitHub Actions workflow
5. **Monitor**: Use Postman and health checks

---

## 📞 Getting Help

**Documentation:**
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete testing guide
- [qa/README.md](qa/README.md) - QA infrastructure details
- [QA_IMPLEMENTATION_COMPLETE.md](QA_IMPLEMENTATION_COMPLETE.md) - Implementation summary

**Quick Links:**
- Backend tests: `ih-backend/tests/Feature/`
- Frontend tests: `ih-frontend/src/__tests__/`
- Health check: `qa/scripts/healthcheck.sh`
- Postman: `qa/postman/`
- GitHub Actions: `.github/workflows/`

---

**Ready to test?** Pick an option from "Quick Start" above! 🎉
