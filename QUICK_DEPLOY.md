# ⚡ Quick Deploy Checklist - 15 Minutes to Production

## 🎯 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free) - https://vercel.com
- [ ] Railway account (free) - https://railway.app
- [ ] PlanetScale account (free) - https://planetscale.com

---

## 📝 Step-by-Step (15 Minutes)

### Step 1: Database (5 min)

1. **Go to PlanetScale** → Create Account
2. **Create Database** → Name: `ubereats-production`
3. **Get Connection Details**:
   - Host: `xxxxx.psdb.cloud`
   - Username: Copy this
   - Password: Copy this
4. **Run Migrations**:
   ```bash
   cd /home/user/uber_eats/UberEATS-Backend

   # Update these values:
   export DB_HOST=your-planetscale-host.psdb.cloud
   export DB_USER=your-username
   export DB_PASSWORD=your-password
   export DB_NAME=ubereats-production

   node database/migrate.js
   ```

✅ **Database Ready!**

---

### Step 2: Backend (5 min)

1. **Go to Railway.app** → Sign in with GitHub
2. **New Project** → Deploy from GitHub → Select: `uber_eats`
3. **Configure**:
   - Root Directory: `UberEATS-Backend`
4. **Add Environment Variables**:

   ```env
   DB_HOST=your-planetscale-host.psdb.cloud
   DB_USER=your-planetscale-user
   DB_PASSWORD=your-planetscale-password
   DB_NAME=ubereats-production
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=RUN_THIS_COMMAND_BELOW
   SESSION_SECRET=RUN_THIS_COMMAND_BELOW
   FRONTEND_URL=https://will-update-later.vercel.app
   LOG_LEVEL=info
   ```

   **Generate Secrets:**
   ```bash
   # Run these locally and copy the output:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Use output for JWT_SECRET

   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Use output for SESSION_SECRET
   ```

5. **Deploy** → Wait 2 minutes
6. **Copy Backend URL**: `https://ubereats-backend-production.up.railway.app`

✅ **Backend Deployed!**

---

### Step 3: Frontend (5 min)

1. **Go to Vercel.com** → Sign in with GitHub
2. **Import Project** → Select: `uber_eats`
3. **Configure**:
   - Framework: Create React App
   - Root Directory: `uber-eats-frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
   REACT_APP_NAME=UberEats
   REACT_APP_VERSION=2.0.0
   ```
   **Replace `YOUR-RAILWAY-URL` with URL from Step 2!**

5. **Deploy** → Wait 2-3 minutes
6. **Copy Frontend URL**: `https://uber-eats-abc123.vercel.app`

✅ **Frontend Deployed!**

---

### Step 4: Connect Frontend & Backend (1 min)

1. **Go back to Railway** → Environment Variables
2. **Update** `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://uber-eats-abc123.vercel.app
   ```
   (Use your actual Vercel URL)

3. Railway will auto-redeploy with new CORS settings

✅ **Connected!**

---

### Step 5: Create Admin User (2 min)

```bash
# Generate password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 12, (err, hash) => console.log(hash));"

# Copy the hash, then:
# 1. Go to PlanetScale Dashboard
# 2. Open Console tab
# 3. Run this SQL (replace YOUR_HASH):

INSERT INTO admins (email, password, role) VALUES
('admin@ubereats.com', 'YOUR_HASH_HERE', 'super_admin');
```

✅ **Admin Created!**

---

## 🎉 You're Live!

**Test Your App:**

1. **Visit Frontend**: `https://your-vercel-url.vercel.app`
2. **Test Signup**: Create a customer account
3. **Test Login**: Log in with your account
4. **Admin Login**: Use `admin@ubereats.com` / `Admin@123`

---

## 📊 Your URLs

- **Live App**: `https://your-app.vercel.app`
- **API**: `https://your-backend.up.railway.app`
- **Admin**: `https://your-app.vercel.app` (login with admin credentials)

---

## 🔄 Future Updates

Just push to GitHub - auto-deploys!

```bash
git add .
git commit -m "New feature"
git push

# Vercel & Railway auto-deploy! ✨
```

---

## 💰 Cost

- **Vercel**: Free
- **Railway**: Free ($5/month credit)
- **PlanetScale**: Free (5GB storage)

**Total: $0/month** for moderate traffic!

---

## 🆘 Quick Troubleshooting

**Can't connect to backend?**
- Check CORS: `FRONTEND_URL` in Railway matches Vercel URL exactly

**Database errors?**
- Verify migrations ran: `node database/migrate.js`
- Check PlanetScale connection string

**Build failed?**
- Check environment variables are set
- Check logs in dashboard

---

**Need detailed instructions?** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**🚀 Deployment Complete! Enjoy your production app!**
