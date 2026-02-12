#!/usr/bin/env python3
"""
Network Connectivity Test for Spinning Wheel Game
Checks if the app is accessible from network devices
"""

import subprocess
import socket
import sys
import time

def get_local_ip():
    """Get the local IP address"""
    try:
        # Get the IP by connecting to a public DNS server
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_command(cmd):
    """Run a shell command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def test_port(host, port):
    """Test if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False

def test_http(url):
    """Test if HTTP endpoint responds"""
    try:
        result = subprocess.run(
            f"curl -s -o /dev/null -w '%{{http_code}}' {url}",
            shell=True,
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout.strip()
    except Exception:
        return "000"

def main():
    print("\n" + "="*60)
    print("🧪 Spinning Wheel - Network Connectivity Test")
    print("="*60 + "\n")
    
    # Get local IP
    ip = get_local_ip()
    print(f"✅ Local IP Address: {ip}")
    
    # Test port 3000
    print(f"\n🔍 Testing port 3000 on {ip}...")
    if test_port(ip, 3000):
        print(f"✅ Port 3000: OPEN and LISTENING")
    else:
        print(f"❌ Port 3000: CLOSED or NOT RESPONDING")
        print("   Make sure: npm run dev is running")
        return False
    
    # Test login endpoint
    print(f"\n🔍 Testing login page...")
    code = test_http(f"http://{ip}:3000/login")
    if code == "200":
        print(f"✅ Login page: OK (HTTP {code})")
    else:
        print(f"⚠️  Login page: HTTP {code}")
    
    # Test Socket.IO endpoint
    print(f"\n🔍 Testing Socket.IO endpoint...")
    code = test_http(f"http://{ip}:3000/api/socket")
    if code in ["200", "202"]:
        print(f"✅ Socket.IO endpoint: OK (HTTP {code})")
    else:
        print(f"⚠️  Socket.IO endpoint: HTTP {code}")
    
    print("\n" + "="*60)
    print("✅ NETWORK SETUP READY!")
    print("="*60)
    print(f"\n📱 On your phone/laptop, open browser and go to:")
    print(f"    http://{ip}:3000")
    print("\n📋 Next steps:")
    print("  1. Click 'Register' or 'Login'")
    print("  2. Create an account or use existing credentials")
    print("  3. Click 'Create Room' on home page")
    print("  4. On another device, go to same URL")
    print("  5. Login and join the room")
    print("  6. Click 'Start Spinning' and verify both wheels spin!")
    print("\n" + "="*60 + "\n")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
