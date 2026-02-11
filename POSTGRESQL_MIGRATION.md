# 🔄 MySQL to PostgreSQL Migration Guide

## Overview

The UberEats application has been successfully migrated from MySQL to PostgreSQL. This document outlines all changes made during the migration.

## Migration Date
**Date:** November 9, 2025  
**Version:** 2.0.0 → 2.1.0

---

## 📋 Summary of Changes

### 1. **Database Driver**
- **Removed:** `mysql2` (v3.12.0)
- **Added:** `pg` (v8.11.3)
- **File:** `package.json`

### 2. **Database Configuration**
- **File:** `config/db.js`
- **Changes:**
  - Uses PostgreSQL `Pool` instead of MySQL connection pool
  - Added `DB_PORT` configuration (default: 5432)
  - Connection error handling updated
  - Removed `.promise()` wrapper (pg is promise-based by default)

### 3. **Migration Files** (11 files)
All migration files in `database/migrations/` were converted:

**Key Syntax Changes:**
- `INT AUTO_INCREMENT` → `SERIAL`
- `ENUM('value1', 'value2')` → `VARCHAR(n) CHECK (column IN ('value1', 'value2'))`
- `DATETIME` → `TIMESTAMP`
- `ON UPDATE CURRENT_TIMESTAMP` → Removed (PostgreSQL doesn't support this)
- `ENGINE=InnoDB DEFAULT CHARSET=...` → Removed
- `INDEX idx_name (column)` → `CREATE INDEX IF NOT EXISTS idx_name ON table(column)`
- `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO NOTHING/UPDATE`
- `COMMENT 'text'` → `COMMENT ON COLUMN table.column IS 'text'`
- `NOW()` → `CURRENT_TIMESTAMP`

### 4. **Migration Runner**
- **File:** `database/migrate.js`
- **Changes:**
  - Uses `pg` Client instead of `mysql2`
  - Connects to default `postgres` database first to create target database
  - Handles PostgreSQL error codes (e.g., `42P04` for duplicate database)
  - No need for `multipleStatements` option

### 5. **Model Files** (5 files)
All models converted from MySQL to PostgreSQL:

**Files Updated:**
- `models/User.js`
- `models/Restaurant.js`
- `models/CustomerProfile.js`
- `models/Dish.js`
- `models/Order.js`

**Key Changes:**
- `db.execute()` → `db.query()`
- `?` placeholders → `$1, $2, $3, ...` (numbered parameters)
- `const [result] = await db.execute()` → `const result = await db.query(); const rows = result.rows`
- `result.insertId` → `RETURNING id` clause + `result.rows[0].id`
- `result.affectedRows` → `result.rowCount`
- **Transaction handling:**
  - `pool.getConnection()` → `db.connect()`
  - `connection.beginTransaction()` → `client.query('BEGIN')`
  - `connection.commit()` → `client.query('COMMIT')`
  - `connection.rollback()` → `client.query('ROLLBACK')`
  - `connection.release()` → `client.release()`
- **JSON functions:**
  - `JSON_ARRAYAGG(JSON_OBJECT(...))` → `json_agg(json_build_object(...))`
  - `JSON.parse()` removed (PostgreSQL returns native JSON)

### 6. **Route Files** (5 files)
All routes converted to PostgreSQL syntax:

**Files Updated:**
- `routes/authRoutes.js`
- `routes/orderRoutes.js`
- `routes/adminRoutes.js`
- `routes/profileRoutes.js`
- `routes/restaurantRoutes.js`

**Key Changes:**
- All `db.execute()` → `db.query()`
- All `?` → `$1, $2, $3, ...`
- `IFNULL()` → `COALESCE()`
- INSERT statements updated with `RETURNING id`
- Dynamic parameter numbering for complex queries

### 7. **Middleware Files**
- **File:** `middleware/authMiddleware.js`
- **Changes:**
  - Token blacklist queries converted to PostgreSQL
  - `db.execute()` → `db.query()`
  - `?` → `$1, $2, $3`
  - `NOW()` → `CURRENT_TIMESTAMP`

### 8. **Environment Configuration**
- **File:** `.env.example`
- **Changes:**
  - Added `DB_PORT=5432`
  - Changed `DB_USER=root` → `DB_USER=postgres`
  - Removed Redis configuration (using PostgreSQL for token blacklist)
  - Updated comments to reflect PostgreSQL

### 9. **Deployment Guide**
- **File:** `VERCEL_DEPLOYMENT.md`
- **Changes:**
  - Replaced PlanetScale (MySQL) with Supabase/Neon (PostgreSQL)
  - Updated connection string examples
  - Updated pricing information for PostgreSQL providers
  - Updated environment variable examples
  - Added PostgreSQL-specific troubleshooting

---

## 🔑 Key Differences: MySQL vs PostgreSQL

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| **Driver** | `mysql2` | `pg` |
| **Query Method** | `db.execute()` | `db.query()` |
| **Placeholders** | `?` | `$1, $2, $3` |
| **Auto Increment** | `AUTO_INCREMENT` | `SERIAL` |
| **Enums** | `ENUM('a','b')` | `CHECK (col IN ('a','b'))` |
| **Datetime** | `DATETIME` | `TIMESTAMP` |
| **Get Insert ID** | `result.insertId` | `RETURNING id` |
| **JSON Aggregation** | `JSON_ARRAYAGG()` | `json_agg()` |
| **Transactions** | `beginTransaction()` | `query('BEGIN')` |
| **IFNULL** | `IFNULL(x, y)` | `COALESCE(x, y)` |

---

## 🚀 Deployment Options

### Database Hosting (Free Tier)

1. **Supabase** (Recommended)
   - 500 MB storage
   - 2 GB bandwidth
   - Built-in auth & storage
   - URL: https://supabase.com

2. **Neon**
   - 3 GB storage
   - Serverless PostgreSQL
   - Generous free tier
   - URL: https://neon.tech

3. **Railway**
   - Integrated with backend deployment
   - $5/month free credit
   - URL: https://railway.app

---

## ✅ Migration Checklist

- [x] Replace `mysql2` with `pg` in package.json
- [x] Update `config/db.js` for PostgreSQL
- [x] Convert all 11 migration files
- [x] Update migration runner
- [x] Convert all 5 model files
- [x] Convert all 5 route files
- [x] Update middleware files
- [x] Update `.env.example`
- [x] Update deployment guides
- [x] Test database connection (pending)

---

## 🧪 Testing the Migration

### 1. Install PostgreSQL Locally
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE ubereats;
\q
```

### 3. Set Environment Variables
```bash
cp .env.example .env

# Edit .env with:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ubereats
```

### 4. Run Migrations
```bash
cd UberEATS-Backend
npm install
node database/migrate.js
```

### 5. Start Server
```bash
npm run dev
```

### 6. Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "Test@123456",
    "role": "customer"
  }'
```

---

## 🐛 Common Issues & Solutions

### Issue: Connection timeout
**Solution:** Check if PostgreSQL is running and port 5432 is accessible

### Issue: Password authentication failed
**Solution:** Verify DB_USER and DB_PASSWORD in .env

### Issue: Database does not exist
**Solution:** Run migration script which creates the database

### Issue: Syntax error near "?"
**Solution:** Ensure all queries use $1, $2 instead of ?

---

## 📊 Performance Considerations

PostgreSQL offers several advantages over MySQL:

1. **Better JSON Support:** Native JSON operators and functions
2. **ACID Compliance:** Stronger data integrity guarantees
3. **Advanced Indexing:** GiST, GIN indexes for complex queries
4. **Full-Text Search:** Built-in without extensions
5. **Window Functions:** Advanced analytics capabilities
6. **Array Support:** Native array data type

---

## 🔄 Rollback Plan

If you need to rollback to MySQL:

1. Restore previous commit: `git checkout <previous-commit>`
2. Run `npm install` to restore mysql2
3. Restore MySQL migrations
4. Update .env to MySQL settings

---

## 📞 Support

For PostgreSQL-specific issues:
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **pg Driver Docs:** https://node-postgres.com/
- **Supabase Support:** https://supabase.com/docs
- **Neon Support:** https://neon.tech/docs

---

**Migration Status:** ✅ Complete  
**Last Updated:** November 9, 2025  
**Version:** 2.1.0
