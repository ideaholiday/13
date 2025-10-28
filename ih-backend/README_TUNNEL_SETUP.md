# 🔧 Backend Fixed & Ready - Tunnel Setup Required

## ✅ What Was Fixed

1. **Configuration Bug Fixed**
   - Fixed `USE_MOCK` boolean parsing in `config/services.php`
   - Now correctly reads `USE_MOCK=false` from `.env`

2. **Hotel Service Fixed**
   - Fixed "Array to string conversion" error in authentication
   - Added better error handling

3. **Backend Server Running**
   - API running at `http://localhost:8000`
   - Health endpoint working
   - Config endpoint working

## 🚧 Current Issue: Proxy Tunnel Required

The TBO API requires requests to come from the whitelisted IP `157.245.100.148`. To route backend requests through this IP, you need an SSH tunnel.

### Quick Start (MANUAL STEP REQUIRED)

**Open a new terminal and run:**

```bash
cd /Users/jitendramaury/iholiday/13/ih-backend

# Start the proxy tunnel
ssh -N -D 0.0.0.0:1080 root@157.245.100.148
```

Enter the SSH password when prompted. **Keep this terminal open** - don't close it!

### Or Use the Helper Script

```bash
cd /Users/jitendramaury/iholiday/13/ih-backend
./start_proxy_tunnel.sh
```

## 📋 Verify Setup

Once the tunnel is running, test it:

```bash
# 1. Check tunnel is running
lsof -i:1080

# Should show something like:
# ssh  12345  jitendramaury  7u  IPv6 0x...  TCP *:1080 (LISTEN)

# 2. Test backend health
curl http://localhost:8000/api/v1/health

# Should return: {"ok":true}

# 3. Test config
curl http://localhost:8000/api/v1/debug/config | python3 -m json.tool

# Should show:
# {
#   "config": {
#     "use_mock": false,
#     "enable_flight_api": true,
#     "flight_mode": "rest",
#     "tbo_proxy": "socks5h://127.0.0.1:1080"
#   }
# }
```

## 🧪 Test TBO Flight API

Once tunnel is running:

```bash
# Test flight search
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DEL",
    "destination": "BOM",
    "departDate": "2025-11-01T00:00:00",
    "adults": 1,
    "children": 0,
    "infants": 0
  }' | python3 -m json.tool
```

Expected result:
- If successful: JSON with flight results
- If error: Check tunnel is running

## 🧪 Test TBO Hotel API

```bash
# Test hotel search (need city code first)
curl -X POST http://localhost:8000/api/v1/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "DXB",
    "cityName": "Dubai",
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-04",
    "rooms": [{"adults": 2, "children": 0}]
  }' | python3 -m json.tool
```

## 📊 Status Dashboard

```
Backend Server:        ✅ RUNNING (port 8000)
Configuration:         ✅ FIXED (use_mock=false)
TBO Credentials:       ✅ CONFIGURED
Whitelisted IP:        ✅ 157.245.100.148
Proxy Tunnel:          ⏳ REQUIRES MANUAL START
Flight API:            ⏳ Waiting for tunnel
Hotel API:             ⏳ Waiting for tunnel
```

## 🔍 Troubleshooting

### "Port 1080 already in use"
```bash
# Find what's using the port
lsof -i:1080

# Kill it if needed
kill $(lsof -t -i:1080)
```

### "Permission denied (publickey,password)"
- You need the SSH password for `root@157.245.100.148`
- Or set up SSH keys

### "Connection refused"
- The tunnel isn't running
- Start it using the command above

### "cURL error 97: connection to proxy closed"
- Tunnel dropped
- Restart the tunnel

## 📁 Files Created/Modified

- `config/services.php` - Fixed USE_MOCK parsing
- `app/Services/TBO/HotelService.php` - Fixed auth errors
- `start_proxy_tunnel.sh` - Helper script for tunnel
- `PROXY_SETUP_GUIDE.md` - Detailed setup guide
- `BACKEND_FIX_SUMMARY.md` - Summary of fixes
- `README_TUNNEL_SETUP.md` - This file

## 🎯 Next Steps

1. **Start the tunnel manually** (see command above)
2. **Test the API** using the curl commands above
3. **Check logs** in `storage/logs/tbo/` for TBO API activity
4. **Test from frontend** once backend is working

## 📞 Need Help?

Check these files:
- `PROXY_SETUP_GUIDE.md` - Detailed tunnel instructions
- `BACKEND_FIX_SUMMARY.md` - What was fixed and why
- Logs: `storage/logs/laravel.log` and `storage/logs/tbo/`

Good luck! 🚀
