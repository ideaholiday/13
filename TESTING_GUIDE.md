# Comprehensive Testing Guide - Idea Holiday Platform

This guide covers all testing infrastructure for the Idea Holiday platform, including backend, frontend, API health checks, and CI/CD integration.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Testing (Laravel/PHPUnit)](#backend-testing)
3. [Frontend Testing (Jest)](#frontend-testing)
4. [API Health Checks](#api-health-checks)
5. [Postman Collections](#postman-collections)
6. [GitHub Actions CI/CD](#github-actions-cicd)
7. [Test Coverage](#test-coverage)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

**Backend:**
```bash
php >= 8.2
composer
sqlite3
```

**Frontend:**
```bash
node >= 18
npm >= 9
```

**Health Checks:**
```bash
curl
jq
bash
```

### Initial Setup

1. **Install Backend Dependencies:**
   ```bash
   cd ih-backend
   composer install
   cp .env.local .env
   php artisan key:generate
   touch database/database.sqlite
   php artisan migrate
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ih-frontend
   npm install --legacy-peer-deps
   ```

3. **Verify Installation:**
   ```bash
   # Backend
   cd ih-backend && php artisan test --filter ExampleTest
   
   # Frontend
   cd ih-frontend && npm test -- --version
   ```

## 🧪 Backend Testing

### Running Tests

**All Tests:**
```bash
cd ih-backend
php artisan test
```

**Specific Test Suite:**
```bash
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit
```

**Specific Test File:**
```bash
php artisan test --filter TboFlightHotelTest
php artisan test --filter FlightFlowTest
php artisan test --filter HotelFlowTest
```

**With Coverage:**
```bash
php artisan test --coverage
php artisan test --coverage-html coverage/
```

**Verbose Output:**
```bash
php artisan test --testdox
```

### TBO Live API Testing

By default, tests use mock data. To test with live TBO APIs:

**Method 1: Environment Variables**
```bash
USE_MOCK=false \
USE_TBO_FLIGHT=true \
USE_TBO_HOTEL=true \
php artisan test --filter TboFlightHotelTest
```

**Method 2: Update phpunit.xml**
```xml
<env name="USE_MOCK" value="false"/>
<env name="USE_TBO_FLIGHT" value="true"/>
<env name="USE_TBO_HOTEL" value="true"/>
```

Then run:
```bash
php artisan test --filter TboFlightHotelTest
```

### Test Files

- `tests/Feature/TboFlightHotelTest.php` - TBO API integration tests
- `tests/Feature/FlightFlowTest.php` - Complete flight booking flow
- `tests/Feature/HotelFlowTest.php` - Complete hotel booking flow
- `tests/Feature/ExampleTest.php` - Basic application tests
- `tests/Unit/ExampleTest.php` - Unit tests

### Writing New Backend Tests

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Testing\Fluent\AssertableJson;

class MyNewTest extends TestCase
{
    public function test_my_feature(): void
    {
        $response = $this->postJson('/api/v1/endpoint', [
            'param' => 'value',
        ]);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->has('success')
                  ->has('data')
            );
    }
}
```

## 🎨 Frontend Testing

### Running Tests

**All Tests:**
```bash
cd ih-frontend
npm test
```

**Watch Mode (Development):**
```bash
npm test -- --watch
```

**Specific Test File:**
```bash
npm test -- flightSearch.smoke.test.ts
npm test -- hotelSearch.smoke.test.ts
```

**With Coverage:**
```bash
npm test -- --coverage
```

**Update Snapshots:**
```bash
npm test -- --updateSnapshot
```

### Test Files

- `src/__tests__/flightSearch.smoke.test.ts` - Flight API integration tests
- `src/__tests__/hotelSearch.smoke.test.ts` - Hotel API integration tests
- `src/lib/api.test.ts` - API utility tests

### Running Tests with Backend

**Terminal 1 - Start Backend:**
```bash
cd ih-backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 - Run Tests:**
```bash
cd ih-frontend
npm test
```

### Writing New Frontend Tests

```typescript
import { describe, expect, test } from '@jest/globals';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

describe('My Feature Tests', () => {
  test('should test something', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({ param: 'value' }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('success');
  }, 30000);
});
```

## 🏥 API Health Checks

### Bash Script

**Location:** `qa/scripts/healthcheck.sh`

**Run Locally:**
```bash
bash qa/scripts/healthcheck.sh
```

**With Custom Credentials:**
```bash
TBO_CLIENT_ID=your_client_id \
TBO_USERNAME=your_username \
TBO_PASSWORD=your_password \
END_USER_IP=your_ip \
bash qa/scripts/healthcheck.sh
```

**What It Checks:**
1. ✅ TBO Authentication
2. ✅ Flight Search (DEL→BOM)
3. ✅ Hotel Search (Bangalore)

**Exit Codes:**
- `0` - All checks passed
- `1` - Authentication failed
- `2` - Flight search failed
- `3` - Hotel search failed

### Automated Scheduling

The health check runs automatically via GitHub Actions:
- **Frequency:** Every 30 minutes
- **On Failure:** Creates GitHub issue automatically
- **Manual Trigger:** Available via Actions tab

## 📮 Postman Collections

### Location

`qa/postman/IdeaHoliday-TBO.postman_collection.json`

### Import into Postman

1. Open Postman
2. Click **Import**
3. Select `IdeaHoliday-TBO.postman_collection.json`
4. Collection will include all endpoints and tests

### Included Endpoints

**Flight APIs:**
- Authenticate
- Air Search (DEL→BOM)
- Fare Quote
- Fare Rules
- SSR (Baggage & Meals)
- Seat Map
- Calendar Fare

**Hotel APIs:**
- Hotel Search (Bangalore)
- Hotel Room Details
- Hotel Info

### Running Collection

**In Postman UI:**
1. Select collection
2. Click "Run collection"
3. View test results

**Via Newman (CLI):**
```bash
npm install -g newman
newman run qa/postman/IdeaHoliday-TBO.postman_collection.json \
  --env-var "TBO_CLIENT_ID=your_client_id" \
  --env-var "TBO_USERNAME=your_username" \
  --env-var "TBO_PASSWORD=your_password"
```

## ⚙️ GitHub Actions CI/CD

### Workflow File

`.github/workflows/live-tbo-health.yml`

### Setup

1. **Add Repository Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `TBO_CLIENT_ID`
     - `TBO_USERNAME`
     - `TBO_PASSWORD`
     - `END_USER_IP`

2. **Enable Workflow:**
   - Go to Actions tab
   - Select "Live TBO API Health Check"
   - Click "Enable workflow" if needed

### Manual Trigger

1. Go to Actions tab
2. Select "Live TBO API Health Check"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

### Viewing Results

- Check Actions tab for workflow runs
- Click on run for detailed logs
- Failed runs create GitHub issues automatically

## 📊 Test Coverage

### Current Coverage

**Flight Module:**
- ✅ Flight search (one-way, round-trip)
- ✅ Fare quote
- ✅ Fare rules
- ✅ SSR (baggage, meals)
- ✅ Calendar fare
- ✅ Complete booking flow
- ⚠️  Seat map (endpoint exists, needs integration)
- ⚠️  Ticket generation (endpoint exists, needs integration)

**Hotel Module:**
- ✅ Hotel search by city
- ✅ Hotel room details
- ✅ Hotel info
- ⚠️  Complete booking flow (needs integration)

**Authentication:**
- ✅ Guest login/signup
- ✅ API key validation
- ⚠️  JWT tokens (if implemented)

### Coverage Reports

**Backend:**
```bash
cd ih-backend
php artisan test --coverage-html coverage/
open coverage/index.html
```

**Frontend:**
```bash
cd ih-frontend
npm test -- --coverage
open coverage/lcov-report/index.html
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Tests Fail with "No APP_KEY"

**Solution:**
```bash
cd ih-backend
cp .env.local .env
php artisan key:generate
```

#### 2. Frontend Tests Fail with "Cannot find module"

**Solution:**
```bash
cd ih-frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 3. Health Check Fails with "Authentication Error"

**Possible Causes:**
- Invalid TBO credentials
- IP not whitelisted
- TBO API is down

**Solution:**
```bash
# Verify credentials
echo $TBO_CLIENT_ID
echo $TBO_USERNAME
# Contact TBO support if needed
```

#### 4. Jest Tests Timeout

**Solution:**
Increase timeout in test:
```typescript
test('my test', async () => {
  // test code
}, 60000); // 60 second timeout
```

Or in jest.config.js:
```javascript
module.exports = {
  testTimeout: 30000,
};
```

#### 5. PHPUnit Tests Skip

**Reason:** Tests are configured to skip when `USE_MOCK=true`

**To run with live API:**
```bash
USE_MOCK=false php artisan test --filter TboFlightHotelTest
```

### Debug Mode

**Backend (Verbose):**
```bash
php artisan test --testdox --verbose
```

**Frontend (Verbose):**
```bash
npm test -- --verbose --detectOpenHandles
```

**Health Check (Debug):**
```bash
bash -x qa/scripts/healthcheck.sh
```

## 📝 Best Practices

### 1. Test Organization

- Keep tests focused and single-purpose
- Use descriptive test names
- Group related tests in describe blocks
- Add comments for complex test logic

### 2. Test Data

- Use future dates for time-sensitive tests
- Update TEST_DEPART_DATE and TEST_CHECKIN regularly
- Don't hardcode sensitive data
- Use factories/faker for mock data

### 3. Assertions

- Test both success and failure cases
- Verify response structure
- Check error messages
- Validate edge cases

### 4. Performance

- Mock external APIs when possible
- Use database transactions
- Clean up test data
- Optimize slow tests

### 5. Maintenance

- Update tests when APIs change
- Remove obsolete tests
- Keep dependencies updated
- Document test requirements

## 📚 Additional Resources

- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Laravel Testing](https://laravel.com/docs/testing)
- [TBO API Documentation](https://tektravels.com/api-documentation)
- [Postman Learning](https://learning.postman.com/)

## 🆘 Getting Help

1. Check this guide
2. Review test logs and error messages
3. Check `.env` configuration
4. Verify TBO API status
5. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Test output/logs

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
