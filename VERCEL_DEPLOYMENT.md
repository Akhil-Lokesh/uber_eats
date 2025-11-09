# 🚀 Vercel Deployment Guide - UberEats v2.0

## 📋 Deployment Architecture

Since Vercel is optimized for frontend deployments, we'll use this architecture:

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                      │
│  - React App                                            │
│  - Static hosting + CDN                                 │
│  - Custom domain support                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Backend (Railway/Render)                               │
│  - Node.js/Express API                                  │
│  - Always running                                       │
│  - WebSocket support                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Database (Supabase/Neon/Railway)                       │
│  - PostgreSQL Database                                  │
│  - Automated backups                                    │
│  - Scaling support                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Deployment (Recommended)

### Option 1: Frontend on Vercel + Backend on Railway

This is the **easiest and recommended** approach for your Express app.

---

## 📦 Part 1: Deploy Database (Supabase - Free Tier)

### Option A: Supabase (Recommended)

### 1. Create Supabase Account

```bash
# Visit https://supabase.com and sign up (free tier available)
```

### 2. Create Database

1. Click "New Project"
2. Name: `ubereats-production`
3. Database Password: Create a strong password (save it!)
4. Region: Choose closest to your users
5. Click "Create new project"

### 3. Get Connection String

1. Go to Project Settings → Database
2. Under "Connection String" → "URI"
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### 4. Run Migrations

```bash
# On your local machine, set Supabase connection
cd /home/user/uber_eats/UberEATS-Backend

# Create temporary .env for migration
cat > .env.production << 'EOF'
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password-here
DB_NAME=postgres
EOF

# Run migrations
node database/migrate.js
```

### Option B: Neon (Alternative)

1. Visit https://neon.tech
2. Create new project
3. Get connection string from dashboard
4. Update migration script with Neon credentials

---

## 🖥️ Part 2: Deploy Backend (Railway - Free Tier)

### 1. Install Railway CLI (Optional)

```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy via GitHub (Easier)

1. **Push your code to GitHub** (already done ✅)

2. **Go to Railway.app**
   - Visit https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repos
   - Select: `Akhil-Lokesh/uber_eats`

3. **Configure Backend Service**
   - Railway will detect Node.js automatically
   - Set Root Directory: `UberEATS-Backend`

4. **Add Environment Variables**

Click "Variables" and add:

```env
# Database (from Supabase/Neon)
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_NAME=postgres

# Server
PORT=5000
NODE_ENV=production

# JWT (Generate new secrets!)
JWT_SECRET=<generate-new-64-char-random-string>
JWT_EXPIRATION=24h
SESSION_SECRET=<generate-new-64-char-random-string>

# Frontend (will update after Vercel deployment)
FRONTEND_URL=https://your-vercel-domain.vercel.app

# Logging
LOG_LEVEL=info
```

**Generate Secrets:**
```bash
# Run this locally to generate secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

5. **Deploy**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://ubereats-backend-production.up.railway.app`)

6. **Verify Deployment**

```bash
# Test your Railway backend
curl https://your-railway-url.up.railway.app/health
```

---

## 🌐 Part 3: Deploy Frontend (Vercel)

### Method A: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repo: `Akhil-Lokesh/uber_eats`
   - Click "Import"

3. **Configure Project**

   **Framework Preset:** Create React App

   **Root Directory:** `uber-eats-frontend`

   **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Environment Variables**

   Click "Environment Variables" and add:

   ```env
   REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
   REACT_APP_NAME=UberEats
   REACT_APP_VERSION=2.0.0
   ```

   **Important:** Replace `your-railway-backend-url.up.railway.app` with your actual Railway backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Vercel will give you a URL like: `https://uber-eats-123abc.vercel.app`

6. **Update Backend CORS**

   Go back to Railway → Environment Variables → Update:
   ```env
   FRONTEND_URL=https://uber-eats-123abc.vercel.app
   ```

   Railway will automatically redeploy with new CORS settings.

---

### Method B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd /home/user/uber_eats/uber-eats-frontend

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "env": {
    "REACT_APP_API_URL": "https://your-railway-url.up.railway.app/api"
  }
}
EOF

# Deploy
vercel --prod
```

---

## 🎨 Part 4: Custom Domain (Optional)

### For Vercel (Frontend)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `ubereats.yourdomain.com`
3. Follow DNS instructions (add CNAME record)
4. SSL certificate auto-generated

### For Railway (Backend)

1. Go to Railway → Your Project → Settings
2. Click "Generate Domain" for free subdomain
3. Or add custom domain in Settings → Domains

---

## ✅ Post-Deployment Checklist

### 1. Create Admin User

```bash
# SSH into Railway or use their dashboard
# Or run locally with production DB credentials

# Generate password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 12, (err, hash) => console.log(hash));"

# Then connect to PlanetScale and run:
# mysql -h your-host.psdb.cloud -u user -p database

INSERT INTO admins (email, password, role) VALUES
('admin@ubereats.com', 'YOUR_HASHED_PASSWORD', 'super_admin');
```

### 2. Test the Application

```bash
# Test backend
curl https://your-railway-url.up.railway.app/health

# Test signup
curl -X POST https://your-railway-url.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "Test@123456",
    "role": "customer"
  }'

# Visit frontend
# Open https://your-vercel-url.vercel.app in browser
```

### 3. Enable Production Logging

In Railway, check logs:
```bash
railway logs
```

### 4. Set up Monitoring

- **Vercel:** Analytics automatically enabled
- **Railway:** Metrics available in dashboard
- **PlanetScale:** Insights tab for query monitoring

---

## 🔒 Security Checklist

- [x] New JWT_SECRET generated
- [x] New SESSION_SECRET generated
- [x] HTTPS enabled (automatic on Vercel & Railway)
- [x] CORS configured correctly
- [x] Environment variables not in code
- [x] Database credentials secure
- [x] Rate limiting enabled
- [x] No console.logs with sensitive data

---

## 💰 Pricing (Free Tier Limits)

### Vercel (Free)
- ✅ Unlimited bandwidth
- ✅ 100 GB-hours compute
- ✅ SSL included
- ✅ Custom domains

### Railway (Free Trial)
- ✅ $5 credit monthly
- ✅ ~500 hours runtime/month
- ✅ Vertical scaling

### Supabase (Free Tier)
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ 500 MB file storage

### Neon (Free Tier - Alternative)
- ✅ 3 GB storage
- ✅ 1 active project
- ✅ Unlimited queries
- ✅ 100 hours compute/month

**Estimated Cost:** $0/month for low-medium traffic

---

## 🚀 Alternative: Deploy Backend to Vercel Serverless

If you want **everything on Vercel**, you can convert your Express app to serverless functions:

### Create `vercel.json` in Backend Root

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Limitations of Vercel Serverless

⚠️ **Not Recommended for This App Because:**
- 10-second timeout per request
- Cold starts (slower response times)
- No WebSocket support
- Stateless (can't maintain connections)
- More expensive at scale

**Better for:** Static sites, JAMstack, simple APIs
**Not ideal for:** Long-running processes, WebSockets, complex Express apps

---

## 🐛 Troubleshooting

### CORS Errors

```bash
# Check FRONTEND_URL in Railway matches Vercel URL exactly
# Must include https:// and no trailing slash
```

### Database Connection Failed

```bash
# Verify Supabase/Neon connection string
# Check if migrations ran successfully
# Ensure SSL/TLS is enabled in connection
# Check DB_PORT is set to 5432
```

### Build Failed on Vercel

```bash
# Check environment variables are set
# Verify REACT_APP_API_URL is correct
# Check logs in Vercel dashboard
```

### Backend Not Responding

```bash
# Check Railway logs
railway logs

# Verify environment variables
# Check if migrations completed
```

---

## 📊 Monitoring & Logs

### Vercel Logs
```bash
vercel logs https://your-app.vercel.app
```

### Railway Logs
```bash
railway logs --tail
```

### Database Monitoring
- **Supabase**: Database → Logs & Reports
- **Neon**: Monitoring dashboard for query performance
- View connection stats and slow queries

---

## 🔄 Continuous Deployment

Both Vercel and Railway automatically redeploy when you push to GitHub!

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Vercel + Railway will auto-deploy! 🚀
```

---

## 📞 Support

**Vercel:** https://vercel.com/docs
**Railway:** https://docs.railway.app
**Supabase:** https://supabase.com/docs
**Neon:** https://neon.tech/docs

---

## ✨ Your Live URLs

After deployment, you'll have:

- **Frontend:** `https://uber-eats-yourdomain.vercel.app`
- **Backend:** `https://ubereats-backend.up.railway.app`
- **Database:** `db.xxxxxxxxxxxx.supabase.co` (or Neon/Railway PostgreSQL)

**🎉 Deployment Complete!**

---

**Last Updated:** 2025-11-09
**Version:** 2.0.0
**Status:** Production Ready
