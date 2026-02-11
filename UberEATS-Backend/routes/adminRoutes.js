/**
 * Admin Routes
 * Admin dashboard, order management, and user management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { idParamValidation } = require('../utils/validators');
const { verifyToken, requireAdmin, requireSuperAdmin, blacklistToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

/**
 * Log admin actions
 */
const logAdminAction = async (admin_email, action, target_user_id = null) => {
  try {
    await db.query(
      'INSERT INTO admin_logs (admin_email, action, target_user_id) VALUES ($1, $2, $3)',
      [admin_email, action, target_user_id]
    );
  } catch (error) {
    logger.error('Error logging admin action', { error: error.message });
  }
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  const totalOrdersResult = await db.query('SELECT COUNT(*) AS total_orders FROM orders');
  const totalOrders = totalOrdersResult.rows;

  const totalRevenueResult = await db.query('SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM orders');
  const totalRevenue = totalRevenueResult.rows;

  const totalUsersResult = await db.query('SELECT COUNT(*) AS total_users FROM users');
  const totalUsers = totalUsersResult.rows;

  const totalRestaurantsResult = await db.query('SELECT COUNT(*) AS total_restaurants FROM restaurants');
  const totalRestaurants = totalRestaurantsResult.rows;

  const topRestaurantsResult = await db.query(`
    SELECT r.name AS restaurant_name, COUNT(o.id) AS order_count, SUM(o.total_price) AS revenue
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    GROUP BY r.id, r.name
    ORDER BY order_count DESC
    LIMIT 5
  `);
  const topRestaurants = topRestaurantsResult.rows;

  const recentOrdersResult = await db.query(`
    SELECT o.id, o.status, o.total_price, o.created_at,
           u.name AS customer_name, r.name AS restaurant_name
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    JOIN restaurants r ON o.restaurant_id = r.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `);
  const recentOrders = recentOrdersResult.rows;

  logger.info('Admin dashboard accessed', { adminEmail: req.user.email });

  return successResponse(res, {
    statistics: {
      total_orders: totalOrders[0].total_orders,
      total_revenue: parseFloat(totalRevenue[0].total_revenue).toFixed(2),
      total_users: totalUsers[0].total_users,
      total_restaurants: totalRestaurants[0].total_restaurants
    },
    top_restaurants: topRestaurants,
    recent_orders: recentOrders
  });
}));

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout
 * @access  Private (Admin)
 */
router.post('/logout', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  await blacklistToken(req.token, req.user.id);
  logger.info('Admin logged out', { adminEmail: req.user.email });
  return successResponse(res, null, 'Logout successful');
}));

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order status (Super Admin only)
 * @access  Private (Super Admin)
 */
router.put('/orders/:id', verifyToken, requireSuperAdmin, idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { status } = req.body;
  const order_id = req.params.id;

  const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return errorResponse(res, 'Invalid status value', 400);
  }

  const orderResult = await db.query('SELECT id FROM orders WHERE id = $1', [order_id]);
  const order = orderResult.rows;

  if (order.length === 0) {
    return errorResponse(res, 'Order not found', 404);
  }

  await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, order_id]);
  await logAdminAction(req.user.email, `Updated Order Status to ${status}`, order_id);

  logger.info('Order status updated by admin', { adminEmail: req.user.email, orderId: order_id, status });

  return successResponse(res, null, `Order status updated to ${status}`);
}));

/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete order (Super Admin only)
 * @access  Private (Super Admin)
 */
router.delete('/orders/:id', verifyToken, requireSuperAdmin, idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const order_id = req.params.id;

  const orderResult2 = await db.query('SELECT id FROM orders WHERE id = $1', [order_id]);
  const order = orderResult2.rows;

  if (order.length === 0) {
    return errorResponse(res, 'Order not found', 404);
  }

  await db.query('DELETE FROM orders WHERE id = $1', [order_id]);
  await logAdminAction(req.user.email, `Deleted Order`, order_id);

  logger.info('Order deleted by admin', { adminEmail: req.user.email, orderId: order_id });

  return successResponse(res, null, 'Order deleted successfully');
}));

/**
 * @route   GET /api/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin)
 */
router.get('/profile', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  let targetEmail = req.user.email;

  // Super admins can view other admin profiles
  if (req.user.role === 'super_admin' && req.query.email) {
    targetEmail = req.query.email;
  } else if (req.query.email && req.query.email !== req.user.email) {
    return errorResponse(res, 'Access denied - cannot view other admin profiles', 403);
  }

  const adminResult = await db.query(
    'SELECT id, email, role, created_at FROM admins WHERE email = $1',
    [targetEmail]
  );
  const admin = adminResult.rows;

  if (admin.length === 0) {
    return errorResponse(res, 'Admin profile not found', 404);
  }

  return successResponse(res, { admin: admin[0] });
}));

/**
 * @route   GET /api/admin/logs
 * @desc    Get admin action logs (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/logs', verifyToken, requireSuperAdmin, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const logsResult = await db.query(
    `SELECT id, admin_email, action, target_user_id, timestamp
     FROM admin_logs
     ORDER BY timestamp DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const logs = logsResult.rows;

  const totalResult = await db.query('SELECT COUNT(*) as count FROM admin_logs');
  const total = totalResult.rows;

  logger.info('Admin logs accessed', { adminEmail: req.user.email });

  return successResponse(res, {
    logs,
    total: total[0].count,
    limit,
    offset
  });
}));

/**
 * @route   POST /api/admin/users
 * @desc    Create new user (Super Admin only)
 * @access  Private (Super Admin)
 */
router.post('/users', verifyToken, requireSuperAdmin, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return errorResponse(res, 'All fields are required', 400);
  }

  if (!['customer', 'restaurant'].includes(role)) {
    return errorResponse(res, 'Invalid role. Must be customer or restaurant', 400);
  }

  // Check if user exists
  const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  const existing = existingResult.rows;

  if (existing.length > 0) {
    return errorResponse(res, 'Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, email, hashedPassword, role]
  );

  const newUserId = result.rows[0].id;

  await logAdminAction(req.user.email, `Created new user: ${email}`, newUserId);

  logger.info('User created by admin', { adminEmail: req.user.email, newUserEmail: email, role });

  return successResponse(res, {
    user: {
      id: newUserId,
      name,
      email,
      role
    }
  }, 'User created successfully', 201);
}));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/users', verifyToken, requireSuperAdmin, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const role = req.query.role;

  let query = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (role && ['customer', 'restaurant'].includes(role)) {
    query += ` AND role = $${paramIndex++}`;
    params.push(role);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const usersResult = await db.query(query, params);
  const users = usersResult.rows;

  const totalResult2 = await db.query('SELECT COUNT(*) as count FROM users');
  const total = totalResult2.rows;

  return successResponse(res, {
    users,
    total: total[0].count,
    limit,
    offset
  });
}));

module.exports = router;
