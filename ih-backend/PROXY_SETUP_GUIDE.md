# Proxy Tunnel Setup Guide

## Current Status

Your backend is configured to use TBO API through a SOCKS5 proxy tunnel because the droplet IP `157.245.100.148` is whitelisted for TBO API access.

## Quick Start

### Start the Proxy Tunnel

Run this command in a separate terminal:

```bash
cd ih-backend
./start_proxy_tunnel.sh
```

You will be prompted for the SSH password to `root@157.245.100.148`.

**Keep this terminal open** - the tunnel must stay running for the backend to access TBO API.

### Alternative: Manual SSH Tunnel

If the script doesn't work, start the tunnel manually:

```bash
ssh -N -D 0.0.0.0:1080 \
    -o ServerAliveInterval=30 \
    root@157.245.100.148
```

Enter the password when prompted.

## Verify Tunnel is Running

```bash
# Check if port 1080 is listening
lsof -i:1080

# Should show something like:
# ssh  12345  user  7u  IPv6 0x...  TCP *:1080 (LISTEN)
```

## Test Backend with Proxy

Once the tunnel is running, test the backend:

```bash
# Test health
curl http://localhost:8000/api/v1/health

# Test config
curl http://localhost:8000/api/v1/debug/config | python3 -m json.tool

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
  }'
```

## Stop the Tunnel

Press `Ctrl+C` in the terminal running the tunnel, or:

```bash
# Find and kill the process
kill $(lsof -t -i:1080)
```

## Troubleshooting

### "Permission denied (publickey,password)"
- You need to provide the SSH password or set up SSH keys
- Make sure you have access to the droplet

### "Connection refused"
- The tunnel isn't running
- Start it using the instructions above

### "cURL error 97: connection to proxy closed"
- The tunnel dropped
- Restart the tunnel

### Alternative: Disable Proxy (for testing)
If you have another whitelisted IP or want to test without proxy:

1. Comment out `TBO_PROXY` in `.env`:
```bash
# TBO_PROXY=socks5h://127.0.0.1:1080
```

2. Clear config cache:
```bash
php artisan config:cache
```

3. Test again:
```bash
curl http://localhost:8000/api/v1/debug/config
```

## Background Tunnel

To run the tunnel in the background:

```bash
ssh -f -N -D 0.0.0.0:1080 \
    -o ServerAliveInterval=30 \
    root@157.245.100.148
```

The `-f` flag sends it to background.

## Configuration

Current `.env` settings:
```
TBO_PROXY=socks5h://127.0.0.1:1080
TBO_CLIENT_ID=tboprod
TBO_USERNAME=LKOM258
TBO_PASSWORD=New@api/LKO$582
TBO_ENDUSER_IP=157.245.100.148
USE_MOCK=false
USE_TBO_FLIGHT=true
USE_TBO_HOTEL=true
```

## Status

- ✅ Backend server running
- ✅ Configuration correct
- ⏳ Waiting for proxy tunnel to start
- ⏳ Then test TBO API
