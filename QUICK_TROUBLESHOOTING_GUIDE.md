# Quick Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue: "TBO API Authentication Failed"
**Symptoms:** `Client-TBO_CLIENT_ID is not Valid` in logs
**Solution:**
```bash
cd ih-backend
php artisan config:clear
php artisan config:cache
# Verify: curl http://localhost:8000/api/v1/debug/config
```

### Issue: "USE_MOCK still showing true"
**Symptoms:** Debug config shows `use_mock: true` despite setting `USE_MOCK=false`
**Solution:**
```bash
# Check .env.local file (it overrides .env)
cat .env.local | grep USE_MOCK
# Should show: USE_MOCK=false

# Clear cache and test
php artisan config:clear
curl http://localhost:8000/api/v1/debug/config
```

### Issue: "Backend server not responding"
**Symptoms:** Connection refused on port 8000
**Solution:**
```bash
# Check if server is running
ps aux | grep "php artisan serve"

# Restart if needed
pkill -f "php artisan serve"
php artisan serve --port=8000 --host=0.0.0.0 &
```

### Issue: "No flight search results"
**Symptoms:** Empty or error response from flight search
**Solution:**
```bash
# Test TBO API directly
cd ih-backend && php test_tbo_no_proxy.php

# If that works, test via API
curl -X POST http://localhost:8000/api/v1/flights/search \
-H "Content-Type: application/json" \
-d '{"origin": "DEL", "destination": "BOM", "departDate": "2025-11-01", "adults": 1, "children": 0, "infants": 0}'
```

## 🔧 Essential Commands

### Configuration Management
```bash
# Clear all cached config
php artisan config:clear

# Cache current config
php artisan config:cache

# View current environment
php artisan tinker --execute="dump([env('USE_MOCK'), env('TBO_CLIENT_ID')]);"
```

### Service Management
```bash
# Check running services
ps aux | grep -E "(php|nginx|node)"

# Restart Laravel server
pkill -f "php artisan serve" && php artisan serve --port=8000 --host=0.0.0.0 &

# Check logs
tail -50 ih-backend/storage/logs/laravel.log
```

### API Testing
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Configuration debug
curl http://localhost:8000/api/v1/debug/config | jq

# Direct TBO test
cd ih-backend && php test_tbo_no_proxy.php
```

## 📋 Pre-Deployment Checklist

1. **Environment Setup**
   - [ ] `.env.local` has `USE_MOCK=false`
   - [ ] TBO credentials are correct
   - [ ] No proxy settings enabled

2. **Dependencies**
   - [ ] `composer install` completed
   - [ ] `npm install` completed (if frontend changes)

3. **Configuration**
   - [ ] `php artisan config:clear` executed
   - [ ] `php artisan config:cache` executed
   - [ ] Debug endpoint shows correct values

4. **Testing**
   - [ ] Health endpoint responding
   - [ ] TBO authentication working
   - [ ] Flight search returns results

## 🆘 Emergency Recovery

If everything breaks, use this sequence:

```bash
# 1. Go to project directory
cd /var/www/iholiday/backend/ih-backend

# 2. Kill all related processes
pkill -f "php artisan serve"

# 3. Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# 4. Verify environment
cat .env.local | grep -E "(USE_MOCK|TBO_CLIENT_ID)"

# 5. Cache fresh config
php artisan config:cache

# 6. Start server
php artisan serve --port=8000 --host=0.0.0.0 &

# 7. Test basic functionality
curl http://localhost:8000/api/v1/health
php test_tbo_no_proxy.php
```

## 📞 Support Information

- **Droplet IP:** 157.245.100.148 (whitelisted with TBO)
- **Laravel Log:** `/var/www/iholiday/backend/ih-backend/storage/logs/laravel.log`
- **TBO Test Script:** `/var/www/iholiday/backend/ih-backend/test_tbo_no_proxy.php`
- **Health Check:** `http://localhost:8000/api/v1/health`

---
**Last Updated:** October 31, 2025
