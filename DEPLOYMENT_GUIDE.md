# 🚀 UberEats Production Deployment Guide

## 📋 What Was Fixed

### Critical Security Fixes
- ✅ Fixed authentication bug (was querying wrong table)
- ✅ Implemented persistent token blacklist (database instead of memory)
- ✅ Standardized to JWT authentication (removed session-based auth confusion)
- ✅ Added rate limiting to all auth endpoints
- ✅ Removed password logging
- ✅ Added comprehensive input validation
- ✅ Added file upload security
- ✅ Fixed duplicate module.exports

### Architecture Improvements
- ✅ Created 11 database migration files with proper schema
- ✅ Fixed multi-item order support with junction table
- ✅ Added Winston logger (replaced console.log)
- ✅ Standardized API response format
- ✅ Added global error handling
- ✅ Created utility modules (validators, response formatters)
- ✅ Updated all dependencies

### Database Schema
- ✅ Proper indexes on all foreign keys
- ✅ Multi-item order support
- ✅ Token blacklist table with auto-cleanup
- ✅ Enhanced user/admin/restaurant relationships

## 🔧 Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+
- Git

## 📥 Installation Steps

### 1. Clone and Setup

```bash
cd /home/user/uber_eats

# Backend setup
cd UberEATS-Backend
npm install

# Frontend setup
cd ../uber-eats-frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
```bash
cd /home/user/uber_eats/UberEATS-Backend
cp .env.example .env
nano .env  # Edit with your values
```

**Required Variables:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ubereats

PORT=5000
NODE_ENV=development

JWT_SECRET=generate-a-secure-random-string-here
JWT_EXPIRATION=24h

SESSION_SECRET=another-secure-random-string

FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

**Generate Secure Secrets:**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend (.env)
```bash
cd /home/user/uber_eats/uber-eats-frontend
cp .env.example .env
nano .env
```

**Required Variables:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Database Migrations

```bash
cd /home/user/uber_eats/UberEATS-Backend
npm run migrate
```

This will:
- Create the database if it doesn't exist
- Create all tables with proper indexes
- Set up foreign key constraints
- Create the token blacklist with auto-cleanup

### 4. Create Admin User

```bash
# First, hash a password
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 12, (err, hash) => console.log(hash));"
```

Then manually insert into MySQL:
```sql
USE ubereats;

INSERT INTO admins (email, password, role) VALUES
('admin@ubereats.com', 'YOUR_HASHED_PASSWORD_HERE', 'super_admin');
```

### 5. Start the Application

#### Backend
```bash
cd /home/user/uber_eats/UberEATS-Backend

# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

Server will start on: `http://localhost:5000`

#### Frontend
```bash
cd /home/user/uber_eats/uber-eats-frontend
npm start
```

Frontend will start on: `http://localhost:3000`

## 🧪 Testing the Application

### Test Backend API

```bash
# Health check
curl http://localhost:5000

# Test user signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "Test@123456",
    "role": "customer"
  }'

# Test login (save the token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test@123456"
  }'

# Test authenticated endpoint
curl http://localhost:5000/api/auth/current-user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend

1. Open browser: `http://localhost:3000`
2. Click "Sign Up" and create a customer account
3. Try logging in
4. Browse restaurants (need to add some via admin or restaurant signup)

## 📂 Project Structure

```
uber_eats/
├── UberEATS-Backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── database/
│   │   ├── migrations/           # SQL migration files
│   │   └── migrate.js            # Migration runner
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Dish.js
│   │   ├── Order.js              # Multi-item support
│   │   └── CustomerProfile.js
│   ├── routes/
│   │   ├── authRoutes.js         # ✅ Rewritten
│   │   ├── orderRoutes.js        # ✅ Rewritten
│   │   ├── restaurantRoutes.js   # Needs update
│   │   ├── profileRoutes.js      # Needs update
│   │   └── adminRoutes.js        # Needs update
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   ├── responseFormatter.js  # Standardized responses
│   │   ├── validators.js         # Input validation
│   │   └── errorHandler.js       # Error handling
│   ├── logs/                     # Application logs
│   ├── uploads/                  # User uploads
│   ├── .env                      # Environment variables
│   ├── .env.example              # Example config
│   ├── package.json
│   └── index.js                  # Main server file
│
└── uber-eats-frontend/
    ├── src/
    │   ├── api/                  # API service layer
    │   ├── components/           # React components
    │   ├── contexts/             # Context providers
    │   ├── pages/                # Page components
    │   ├── services/             # API services
    │   └── utils/
    ├── .env                      # Frontend config
    ├── .env.example
    └── package.json
```

## 🔐 Security Checklist

### Before Production

- [ ] Change all default secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS properly (not localhost)
- [ ] Enable MySQL event scheduler for token cleanup
- [ ] Set up automated backups
- [ ] Configure rate limiting appropriately
- [ ] Review and remove all debug logs
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up CDN for static assets

### MySQL Event Scheduler

Enable automatic token cleanup:
```sql
SET GLOBAL event_scheduler = ON;

-- Verify it's running
SHOW VARIABLES LIKE 'event_scheduler';
```

## 🐛 Troubleshooting

### Database Connection Fails

```bash
# Check MySQL is running
sudo systemctl status mysql

# Check credentials
mysql -u root -p

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Reinstall dependencies
cd UberEATS-Backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Can't Connect to Backend

1. Check backend is running: `curl http://localhost:5000`
2. Check CORS settings in `index.js`
3. Verify `REACT_APP_API_URL` in frontend `.env`
4. Check browser console for errors

### Token Issues

```bash
# Clear blacklisted tokens
mysql -u root -p
USE ubereats;
DELETE FROM token_blacklist WHERE expires_at < NOW();
```

## 🚀 Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd /home/user/uber_eats/UberEATS-Backend
pm2 start index.js --name "ubereats-backend"

# Build frontend
cd /home/user/uber_eats/uber-eats-frontend
npm run build

# Serve with PM2
pm2 serve build 3000 --name "ubereats-frontend" --spa

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/ubereats

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /home/user/uber_eats/uber-eats-frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables for Production

Update `.env` files:

**Backend:**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=warn
```

**Frontend:**
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

## 📊 Monitoring

### View Logs

```bash
# PM2 logs
pm2 logs ubereats-backend

# Application logs
tail -f /home/user/uber_eats/UberEATS-Backend/logs/combined.log
tail -f /home/user/uber_eats/UberEATS-Backend/logs/error.log
```

### Database Monitoring

```sql
-- Check table sizes
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = "ubereats"
ORDER BY (data_length + index_length) DESC;

-- Check blacklist token count
SELECT COUNT(*) FROM token_blacklist;

-- Check active orders
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

## 🎯 Performance Optimization

1. **Enable MySQL Query Cache**
2. **Add Redis for session storage**
3. **Implement CDN for static assets**
4. **Enable Gzip compression** (already in code)
5. **Database indexes** (already in migrations)
6. **Implement caching layer**

## 📞 Support

For issues or questions:
1. Check logs first
2. Review this guide
3. Check GitHub issues
4. Contact development team

## 📝 Next Steps

1. ✅ Basic setup complete
2. ⏳ Add remaining route updates (restaurantRoutes, profileRoutes, adminRoutes)
3. ⏳ Implement email verification
4. ⏳ Add password reset
5. ⏳ Implement file upload to cloud (S3/Cloudinary)
6. ⏳ Add real-time order tracking (WebSockets)
7. ⏳ Create admin dashboard UI
8. ⏳ Add comprehensive tests
9. ⏳ Set up CI/CD pipeline

---

**Version:** 2.0.0
**Last Updated:** 2025-11-09
**Status:** Production Ready (Core Features)
