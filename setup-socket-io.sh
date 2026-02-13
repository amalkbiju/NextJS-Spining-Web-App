#!/bin/bash

# Quick Setup Script for Socket.IO Production Fix
# Run this to set up your local Socket.IO server for testing

echo "🚀 Socket.IO Vercel Production Fix Setup"
echo "=========================================="

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
else
    echo "✅ npm packages already installed"
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cat > .env.local << 'EOF'
# Socket.IO Server URL (local development)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Add other environment variables as needed
# MONGODB_URI=...
# JWT_SECRET=...
EOF
    echo "✅ .env.local created. Please update with your actual values."
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📖 Next Steps:"
echo "1. Terminal 1: Run Socket.IO server"
echo "   node SOCKET_SERVER.js"
echo ""
echo "2. Terminal 2: Run Next.js dev server"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For production deployment, see: SOCKET_IO_VERCEL_SETUP.md"
