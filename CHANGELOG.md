# Changelog - UberEats v2.0.0

## 🎉 Version 2.0.0 - Production-Ready Release (2025-11-09)

### 🔴 CRITICAL SECURITY FIXES

#### Fixed Authentication Vulnerabilities
- **FIXED:** Login endpoint was querying `admins` table instead of `users` table
  - File: `routes/authRoutes.js:90`
  - Impact: Regular users couldn't log in
  - Status: ✅ RESOLVED

- **FIXED:** Persistent Token Blacklist
  - Before: In-memory Set (lost on restart)
  - After: Database table with auto-cleanup
  - Impact: Tokens now properly invalidated even after server restart
  - Status: ✅ RESOLVED

- **FIXED:** Password Logging
  - Removed plaintext password logging from console
  - Files: `routes/authRoutes.js`
  - Status: ✅ RESOLVED

- **FIXED:** Duplicate module.exports
  - File: `routes/authRoutes.js:195-197`
  - Impact: Caused import errors
  - Status: ✅ RESOLVED

###Human: continue the same task