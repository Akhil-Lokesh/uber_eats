#!/bin/bash

echo "🚀 Setting up UberEats for Production..."
echo ""

# Create .env file for backend
echo "📝 Creating backend .env file..."
cat > /home/user/uber_eats/UberEATS-Backend/.env << 'ENVEOF'
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=ubereats

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRATION=24h

# Session Configuration
SESSION_SECRET=change-this-session-secret-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
ENVEOF

# Create .env file for frontend
echo "📝 Creating frontend .env file..."
cat > /home/user/uber_eats/uber-eats-frontend/.env << 'FRONTENV'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=UberEats
REACT_APP_VERSION=2.0.0
FRONTENV

echo ""
echo "✅ Environment files created!"
echo ""
echo "⚠️  IMPORTANT: Please update the following in .env files:"
echo "   - DB_PASSWORD: Your MySQL password"
echo "   - JWT_SECRET: Generate a secure random string"
echo "   - SESSION_SECRET: Generate another secure random string"
echo ""
echo "📦 Next steps:"
echo "   1. Update .env files with your configuration"
echo "   2. Run: cd UberEATS-Backend && npm run migrate"
echo "   3. Run: cd UberEATS-Backend && npm start"
echo "   4. Run: cd uber-eats-frontend && npm install && npm start"
echo ""

