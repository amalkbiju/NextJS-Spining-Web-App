#!/bin/bash

# Test network connectivity to the spinning wheel app

echo "🧪 Testing Spinning Wheel Network Connectivity"
echo "=============================================="
echo ""

# Get the current IP
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "✅ Local IP: $IP"
echo "🌐 Access app at: http://$IP:3000"
echo ""

# Test port 3000
echo "🔍 Testing port 3000..."
if nc -zw1 $IP 3000 2>/dev/null; then
    echo "✅ Port 3000: OPEN"
else
    echo "❌ Port 3000: CLOSED"
fi

# Test API health
echo ""
echo "🔍 Testing API health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$IP:3000/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API health: OK (HTTP $HTTP_CODE)"
else
    echo "⚠️  API health: $HTTP_CODE"
fi

# Test login page
echo ""
echo "🔍 Testing login page..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$IP:3000/login 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login page: OK (HTTP $HTTP_CODE)"
else
    echo "❌ Login page: Failed (HTTP $HTTP_CODE)"
fi

# Test socket endpoint
echo ""
echo "🔍 Testing Socket.IO endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$IP:3000/api/socket 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Socket.IO endpoint: OK (HTTP $HTTP_CODE)"
else
    echo "⚠️  Socket.IO endpoint: $HTTP_CODE"
fi

echo ""
echo "=============================================="
echo "✅ Instructions:"
echo ""
echo "1️⃣  On your phone, open browser and go to:"
echo "    http://$IP:3000"
echo ""
echo "2️⃣  Login with your credentials"
echo ""
echo "3️⃣  Create or join a room"
echo ""
echo "4️⃣  Open on another device (laptop)"
echo ""
echo "5️⃣  Join the same room on the other device"
echo ""
echo "6️⃣  Click 'Start Spinning' and verify both wheels spin together!"
echo ""
echo "=============================================="
