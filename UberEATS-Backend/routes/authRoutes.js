/**
 * Authentication Routes
 * Handles user signup, login, logout, and current user
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { signupValidation, loginValidation } = require('../utils/validators');
const { verifyToken, blacklistToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many signup attempts. Please try again later.' }
});

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupLimiter, signupValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { name, email, password, role } = req.body;

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return errorResponse(res, 'Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );

  const token = jwt.sign(
    { id: result.insertId, email, role },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  logger.info('New user registered', { userId: result.insertId, role });

  return successResponse(res, {
    token,
    user: { id: result.insertId, name, email, role }
  }, 'User registered successfully', 201);
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginLimiter, loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { email, password } = req.body;

  const [users] = await db.execute(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const user = users[0];
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  logger.info('User logged in', { userId: user.id, role: user.role });

  return successResponse(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  }, 'Login successful');
}));

/**
 * @route   POST /api/auth/admin-login
 * @desc    Login admin
 * @access  Public
 */
router.post('/admin-login', loginLimiter, loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { email, password } = req.body;

  const [admins] = await db.execute(
    'SELECT id, email, password, role FROM admins WHERE email = ?',
    [email]
  );

  if (admins.length === 0 || !(await bcrypt.compare(password, admins[0].password))) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const admin = admins[0];
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  logger.info('Admin logged in', { adminId: admin.id, role: admin.role });

  return successResponse(res, {
    token,
    user: { id: admin.id, email: admin.email, role: admin.role }
  }, 'Admin login successful');
}));

/**
 * @route   GET /api/auth/current-user
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/current-user', verifyToken, asyncHandler(async (req, res) => {
  const { id, role } = req.user;
  const isAdmin = ['admin', 'super_admin'].includes(role);
  
  const query = isAdmin
    ? 'SELECT id, email, role FROM admins WHERE id = ?'
    : 'SELECT id, name, email, role FROM users WHERE id = ?';

  const [users] = await db.execute(query, [id]);

  if (users.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, { user: users[0], type: role });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout and blacklist token
 * @access  Private
 */
router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  await blacklistToken(req.token, req.user.id);
  logger.info('User logged out', { userId: req.user.id });
  return successResponse(res, null, 'Logout successful');
}));

module.exports = router;
