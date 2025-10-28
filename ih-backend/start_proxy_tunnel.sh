#!/bin/bash
# Start SSH SOCKS5 tunnel for TBO API
# This allows backend to connect to TBO API through whitelisted droplet IP

DROPLET_IP="157.245.100.148"
DROPLET_USER="root"
LOCAL_PORT="1080"

echo "=== Starting SOCKS5 Proxy Tunnel ==="
echo "Droplet: $DROPLET_USER@$DROPLET_IP"
echo "Local Port: $LOCAL_PORT"
echo ""
echo "You will be prompted for the SSH password"
echo "Press Ctrl+C to stop the tunnel"
echo ""

# Check if port is already in use
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $LOCAL_PORT is already in use"
    echo "PID: $(lsof -t -i:$LOCAL_PORT)"
    echo ""
    read -p "Kill existing process and start new tunnel? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $(lsof -t -i:$LOCAL_PORT) 2>/dev/null
        sleep 2
    else
        echo "Using existing tunnel. Exiting."
        exit 0
    fi
fi

# Start SSH tunnel (foreground, so user can see output)
ssh -N -D 0.0.0.0:$LOCAL_PORT \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o StrictHostKeyChecking=no \
    $DROPLET_USER@$DROPLET_IP

echo ""
echo "Tunnel stopped."
