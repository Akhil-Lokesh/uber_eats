/**
 * Enhanced Authentication Middleware
 * JWT-based authentication with persistent token blacklist
 */

const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logger = require('../utils/logger');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseFormatter');

/**
 * Verify JWT token and check blacklist
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No token provided', { ip: req.ip, path: req.path });
      return unauthorizedResponse(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1].trim();

    // Check if token is blacklisted
    const [blacklisted] = await db.execute(
      'SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (blacklisted.length > 0) {
      logger.warn('Blacklisted token used', { ip: req.ip, path: req.path });
      return forbiddenResponse(res, 'Token has been invalidated');
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

      // Attach user and token to request
      req.user = decoded;
      req.token = token;

      logger.info('Token verified successfully', {
        userId: decoded.id,
        role: decoded.role
      });

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('Expired token used', { ip: req.ip });
        return unauthorizedResponse(res, 'Token has expired');
      }

      logger.error('Invalid token', { error: error.message });
      return forbiddenResponse(res, 'Invalid token');
    }
  } catch (error) {
    logger.error('Token verification error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

/**
 * Require customer role
 */
const requireCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') {
    logger.warn('Non-customer access attempt', {
      userId: req.user ? req.user.id : 'unknown',
      role: req.user ? req.user.role : 'unknown',
      path: req.path
    });
    return forbiddenResponse(res, 'Access restricted to customers only');
  }
  next();
};

/**
 * Require restaurant role
 */
const requireRestaurant = (req, res, next) => {
  if (!req.user || req.user.role !== 'restaurant') {
    logger.warn('Non-restaurant access attempt', {
      userId: req.user ? req.user.id : 'unknown',
      role: req.user ? req.user.role : 'unknown',
      path: req.path
    });
    return forbiddenResponse(res, 'Access restricted to restaurants only');
  }
  next();
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    logger.warn('Non-admin access attempt', {
      userId: req.user ? req.user.id : 'unknown',
      role: req.user ? req.user.role : 'unknown',
      path: req.path
    });
    return forbiddenResponse(res, 'Access restricted to administrators only');
  }
  next();
};

/**
 * Require super admin role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    logger.warn('Non-super-admin access attempt', {
      userId: req.user ? req.user.id : 'unknown',
      role: req.user ? req.user.role : 'unknown',
      path: req.path
    });
    return forbiddenResponse(res, 'Access restricted to super administrators only');
  }
  next();
};

/**
 * Blacklist a token
 */
const blacklistToken = async (token, userId) => {
  try {
    // Decode to get expiry time
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await db.execute(
      'INSERT INTO token_blacklist (token, user_id, expires_at) VALUES (?, ?, ?)',
      [token, userId, expiresAt]
    );

    logger.info('Token blacklisted', { userId, expiresAt });
    return true;
  } catch (error) {
    logger.error('Failed to blacklist token', { error: error.message, userId });
    throw error;
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1].trim();

    // Check if token is blacklisted
    const [blacklisted] = await db.execute(
      'SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (blacklisted.length > 0) {
      return next();
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      req.user = decoded;
      req.token = token;
    } catch (error) {
      // Invalid/expired token, but we don't fail - just continue without auth
    }

    next();
  } catch (error) {
    logger.error('Optional auth error', { error: error.message });
    next();
  }
};

module.exports = {
  verifyToken,
  requireCustomer,
  requireRestaurant,
  requireAdmin,
  requireSuperAdmin,
  blacklistToken,
  optionalAuth
};
