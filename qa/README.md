# QA & Testing Infrastructure

This directory contains comprehensive testing and quality assurance tools for the Idea Holiday platform's integration with TBO (Travel Boutique Online) APIs.

## 📁 Directory Structure

```
qa/
├── postman/                          # Postman collections for API testing
│   └── IdeaHoliday-TBO.postman_collection.json
├── scripts/                          # Automation scripts
│   └── healthcheck.sh               # TBO API health check script
└── README.md                         # This file
```

## 🧪 Testing Components

### 1. Postman Collection

**Location:** `qa/postman/IdeaHoliday-TBO.postman_collection.json`

Comprehensive API collection for testing TBO endpoints:

- **Authentication** - Get TBO API token
- **Flight Search** - DEL→BOM one-way search
- **Fare Quote** - Get detailed fare information
- **Fare Rules** - Cancellation & change policies
- **SSR** - Special Service Requests (baggage, meals)
- **Seat Map** - Seat availability and pricing
- **Calendar Fare** - Date-wise fare matrix
- **Hotel Search** - Bangalore hotel search
- **Hotel Room Details** - Room types and pricing
- **Hotel Info** - Hotel amenities and details

#### How to Use

1. **Import into Postman:**
   - Open Postman
   - Click Import → Upload Files
   - Select `IdeaHoliday-TBO.postman_collection.json`

2. **Configure Variables:**
   - The collection includes default variables
   - Override these in your environment if needed:
     - `TBO_CLIENT_ID`
     - `TBO_USERNAME`
     - `TBO_PASSWORD`
     - `END_USER_IP`

3. **Run Tests:**
   - Click "Run collection" to execute all tests
   - Or run individual requests
   - Tests include automatic assertions

4. **Pre-request Script (Optional):**
   For automatic token refresh, add this to collection pre-request:
   ```javascript
   if (!pm.collectionVariables.get('TOKEN')) {
     pm.sendRequest({
       url: pm.variables.get('TBO_BASE') + '/SharedServices/SharedData.svc/rest/Authenticate',
       method: 'POST',
       header: {'Content-Type': 'application/json'},
       body: {
         mode: 'raw',
         raw: JSON.stringify({
           ClientId: pm.variables.get('TBO_CLIENT_ID'),
           UserName: pm.variables.get('TBO_USERNAME'),
           Password: pm.variables.get('TBO_PASSWORD'),
           EndUserIp: pm.variables.get('END_USER_IP')
         })
       }
     }, (err, res) => {
       if (!err) {
         pm.collectionVariables.set('TOKEN', res.json().TokenId);
       }
     });
   }
   ```

### 2. Bash Health Check Script

**Location:** `qa/scripts/healthcheck.sh`

Automated script to verify TBO API health. Runs authentication, flight search, and hotel search tests.

#### How to Use

**Prerequisites:**
```bash
sudo apt-get install jq curl
```

**Run Locally:**
```bash
cd /home/runner/work/13/13
bash qa/scripts/healthcheck.sh
```

**With Custom Environment:**
```bash
TBO_CLIENT_ID=your_client_id \
TBO_USERNAME=your_username \
TBO_PASSWORD=your_password \
END_USER_IP=your_ip \
bash qa/scripts/healthcheck.sh
```

**Exit Codes:**
- `0` - All checks passed
- `1` - Authentication failed
- `2` - Flight search failed
- `3` - Hotel search failed

### 3. Backend Tests (Laravel/PHPUnit)

**Location:** `ih-backend/tests/Feature/TboFlightHotelTest.php`

Comprehensive backend API tests covering:
- Live flight search results
- Live hotel search results
- Fare rules endpoint
- Fare quote endpoint
- SSR (baggage & meals) endpoint
- Calendar fare endpoint

#### How to Use

**Run All Tests:**
```bash
cd ih-backend
php artisan test
```

**Run Specific Test Suite:**
```bash
php artisan test --testsuite=Feature
```

**Run TBO Tests Only:**
```bash
php artisan test --filter TboFlightHotelTest
```

**Run with Live TBO API:**
```bash
USE_MOCK=false USE_TBO_FLIGHT=true USE_TBO_HOTEL=true php artisan test --filter TboFlightHotelTest
```

**Configuration:**
Edit `ih-backend/phpunit.xml` to change default test settings:
- `USE_MOCK` - Use mock data (default: true)
- `USE_TBO_FLIGHT` - Enable live flight API (default: false)
- `USE_TBO_HOTEL` - Enable live hotel API (default: false)
- `TEST_DEPART_DATE` - Flight departure date
- `TEST_CHECKIN` - Hotel check-in date
- `TEST_CITY_ID` - Hotel city ID for search

### 4. Frontend Tests (Jest)

**Location:** `ih-frontend/src/__tests__/`

Frontend integration tests:
- `flightSearch.smoke.test.ts` - Flight search API integration
- `hotelSearch.smoke.test.ts` - Hotel search API integration

#### How to Use

**Install Dependencies:**
```bash
cd ih-frontend
npm install
```

**Run All Tests:**
```bash
npm test
```

**Run Specific Test:**
```bash
npm test -- flightSearch.smoke.test.ts
```

**Run with Coverage:**
```bash
npm test -- --coverage
```

**Watch Mode (Development):**
```bash
npm test -- --watch
```

### 5. GitHub Actions Workflow

**Location:** `.github/workflows/live-tbo-health.yml`

Automated CI/CD workflow that:
- Runs every 30 minutes
- Tests TBO API health
- Creates GitHub issues on failure
- Can be triggered manually

#### How to Use

**Required Secrets:**
Add these in GitHub Settings → Secrets:
- `TBO_CLIENT_ID` - Your TBO client ID
- `TBO_USERNAME` - Your TBO username
- `TBO_PASSWORD` - Your TBO password
- `END_USER_IP` - Your server IP address

**Manual Trigger:**
1. Go to Actions tab in GitHub
2. Select "Live TBO API Health Check"
3. Click "Run workflow"

**View Results:**
- Check Actions tab for workflow runs
- Failed runs create issues automatically
- Review logs for detailed error messages

## 🚀 Quick Start

### Local Development Testing

1. **Start Backend:**
   ```bash
   cd ih-backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Run Backend Tests:**
   ```bash
   cd ih-backend
   php artisan test --filter TboFlightHotelTest
   ```

3. **Start Frontend (in another terminal):**
   ```bash
   cd ih-frontend
   npm run dev
   ```

4. **Run Frontend Tests:**
   ```bash
   cd ih-frontend
   npm test
   ```

5. **Run Health Check:**
   ```bash
   bash qa/scripts/healthcheck.sh
   ```

### Testing Live TBO Integration

1. **Update .env files:**
   ```bash
   # ih-backend/.env.local
   USE_MOCK=false
   USE_TBO_FLIGHT=true
   USE_TBO_HOTEL=true
   TBO_CLIENT_ID=your_client_id
   TBO_USERNAME=your_username
   TBO_PASSWORD=your_password
   ```

2. **Run tests with live API:**
   ```bash
   cd ih-backend
   USE_MOCK=false php artisan test --filter TboFlightHotelTest
   ```

3. **Verify with health check:**
   ```bash
   bash qa/scripts/healthcheck.sh
   ```

## 📊 Test Coverage

### Flight Module
- ✅ Flight search (one-way, round-trip, multi-city)
- ✅ Fare quote (price lock)
- ✅ Fare rules (cancellation, date change)
- ✅ SSR (baggage, meals, special requests)
- ✅ Seat map
- ✅ Calendar fare
- ✅ Booking flow
- ✅ Ticket generation

### Hotel Module
- ✅ Hotel search by city
- ✅ Hotel room details
- ✅ Hotel information
- ✅ Price breakup
- ✅ Filters (price, star rating)
- ✅ Booking flow

### Authentication & User Management
- ✅ Guest login/signup
- ✅ Booking history
- ✅ Profile management
- ✅ Admin dashboard
- ✅ Staff dashboard

## 🔧 Troubleshooting

### Common Issues

**1. Tests Failing with "Connection Refused"**
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE` in frontend `.env.local`

**2. TBO API Returns 401 Unauthorized**
- Verify TBO credentials in `.env.local`
- Check if token has expired (re-authenticate)
- Ensure `END_USER_IP` is whitelisted

**3. No Flight/Hotel Results**
- Update test dates to future dates
- Check if TBO API is operational
- Verify proxy settings if using proxy

**4. Jest Tests Timeout**
- Increase timeout in `jest.config.js`
- Check if backend is responding
- Verify API endpoints are correct

**5. PHPUnit Tests Skip with "Mock Required"**
- Set `USE_MOCK=false` in environment
- Enable specific APIs: `USE_TBO_FLIGHT=true`

### Debug Mode

**Enable verbose logging:**
```bash
# Backend
php artisan test --filter TboFlightHotelTest --testdox

# Frontend
npm test -- --verbose

# Health check
bash -x qa/scripts/healthcheck.sh
```

## 📝 Contributing

When adding new tests:

1. **Backend Tests:**
   - Add to `ih-backend/tests/Feature/`
   - Follow existing naming conventions
   - Include proper assertions
   - Add skip conditions for optional tests

2. **Frontend Tests:**
   - Add to `ih-frontend/src/__tests__/`
   - Use descriptive test names
   - Include timeout for API calls
   - Handle different response formats

3. **Postman:**
   - Add to existing collection
   - Include test assertions
   - Document variables needed
   - Update this README

4. **Health Check:**
   - Add checks to `healthcheck.sh`
   - Include error handling
   - Return appropriate exit codes
   - Update documentation

## 📚 Resources

- [TBO API Documentation](https://tektravels.com/api-documentation)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)

## 📞 Support

For issues or questions:
1. Check this README
2. Review test logs
3. Check `.env` configuration
4. Verify TBO API status
5. Create GitHub issue with details
