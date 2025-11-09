/**
 * Order Routes
 * Handles order placement, tracking, and feedback
 */

const express = require('express');
const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const db = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { orderValidation, feedbackValidation, idParamValidation } = require('../utils/validators');
const { verifyToken, requireCustomer, requireRestaurant } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Place a new order
 * @access  Private (Customer)
 */
router.post('/', verifyToken, requireCustomer, orderValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { restaurantId, items, totalPrice, deliveryAddress, deliveryPhone, notes } = req.body;
  const customer_id = req.user.id;

  // Verify all dishes exist and belong to the restaurant
  const dishIds = items.map(item => item.dishId);
  const placeholders = dishIds.map(() => '?').join(',');

  const [dishes] = await db.execute(
    `SELECT id, price, restaurant_id, name FROM dishes
     WHERE id IN (${placeholders}) AND restaurant_id = ?`,
    [...dishIds, restaurantId]
  );

  if (dishes.length !== items.length) {
    return errorResponse(res, 'Some dishes are invalid or not available', 400);
  }

  // Verify prices
  const dishMap = {};
  dishes.forEach(d => { dishMap[d.id] = d; });

  let calculatedTotal = 0;
  for (const item of items) {
    const dish = dishMap[item.dishId];
    if (!dish) {
      return errorResponse(res, `Dish ID ${item.dishId} not found`, 400);
    }

    const expectedPrice = parseFloat(dish.price);
    const providedPrice = parseFloat(item.price);

    if (Math.abs(expectedPrice - providedPrice) > 0.01) {
      return errorResponse(res, `Price mismatch for ${dish.name}. Please refresh and try again`, 400);
    }

    calculatedTotal += expectedPrice * item.quantity;
  }

  // Verify total price
  if (Math.abs(calculatedTotal - parseFloat(totalPrice)) > 0.01) {
    return errorResponse(res, 'Total price mismatch. Please refresh and try again', 400);
  }

  const orderData = {
    customer_id,
    restaurant_id: restaurantId,
    total_price: totalPrice,
    delivery_address: deliveryAddress,
    delivery_phone: deliveryPhone,
    notes,
    items
  };

  const result = await Order.create(orderData);

  logger.info('Order placed', { orderId: result.orderId, customerId: customer_id, restaurantId });

  return successResponse(res, { orderId: result.orderId }, 'Order placed successfully', 201);
}));

/**
 * @route   GET /api/orders
 * @desc    Get all orders for current user
 * @access  Private
 */
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const { id, role } = req.user;

  let orders;
  if (role === 'customer') {
    orders = await Order.getByCustomer(id);
  } else if (role === 'restaurant') {
    const [restaurants] = await db.execute('SELECT id FROM restaurants WHERE user_id = ?', [id]);
    if (restaurants.length === 0) {
      return errorResponse(res, 'Restaurant profile not found', 404);
    }
    orders = await Order.getByRestaurant(restaurants[0].id);
  } else {
    return errorResponse(res, 'Invalid user role', 403);
  }

  return successResponse(res, { orders, count: orders.length });
}));

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private
 */
router.get('/:id', verifyToken, idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const orderId = req.params.id;
  const { id: userId, role } = req.user;

  const order = role === 'customer'
    ? await Order.getById(orderId, userId)
    : await Order.getById(orderId);

  if (!order) {
    return errorResponse(res, 'Order not found or access denied', 404);
  }

  if (role === 'restaurant') {
    const [restaurants] = await db.execute('SELECT id FROM restaurants WHERE user_id = ?', [userId]);
    if (restaurants.length === 0 || restaurants[0].id !== order.restaurant_id) {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  return successResponse(res, { order });
}));

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Restaurant)
 */
router.put('/:id/status', verifyToken, requireRestaurant, idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return errorResponse(res, 'Invalid status value', 400);
  }

  const order = await Order.getById(orderId);
  if (!order) {
    return errorResponse(res, 'Order not found', 404);
  }

  const [restaurants] = await db.execute('SELECT id FROM restaurants WHERE user_id = ?', [req.user.id]);
  if (restaurants.length === 0 || restaurants[0].id !== order.restaurant_id) {
    return errorResponse(res, 'Access denied', 403);
  }

  await Order.updateStatus(orderId, status);
  logger.info('Order status updated', { orderId, status });

  return successResponse(res, null, `Order status updated to ${status}`);
}));

/**
 * @route   POST /api/orders/:id/feedback
 * @desc    Submit feedback
 * @access  Private (Customer)
 */
router.post('/:id/feedback', verifyToken, requireCustomer, idParamValidation, feedbackValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const orderId = req.params.id;
  const { rating, comment } = req.body;
  const customerId = req.user.id;

  const order = await Order.getById(orderId, customerId);
  if (!order) {
    return errorResponse(res, 'Order not found', 404);
  }

  if (order.status !== 'Delivered') {
    return errorResponse(res, 'Can only review delivered orders', 400);
  }

  const [existing] = await db.execute(
    'SELECT id FROM feedbacks WHERE order_id = ? AND customer_id = ?',
    [orderId, customerId]
  );

  if (existing.length > 0) {
    return errorResponse(res, 'Feedback already submitted', 409);
  }

  await db.execute(
    'INSERT INTO feedbacks (order_id, customer_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [orderId, customerId, order.restaurant_id, rating, comment || null]
  );

  logger.info('Feedback submitted', { orderId, rating });

  return successResponse(res, null, 'Feedback submitted successfully', 201);
}));

/**
 * @route   GET /api/orders/:id/feedback
 * @desc    Get feedback for an order
 * @access  Public
 */
router.get('/:id/feedback', idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const [feedback] = await db.execute(
    `SELECT f.rating, f.comment, f.created_at, u.name AS customer_name
     FROM feedbacks f
     JOIN users u ON f.customer_id = u.id
     WHERE f.order_id = ?`,
    [req.params.id]
  );

  if (feedback.length === 0) {
    return errorResponse(res, 'No feedback found', 404);
  }

  return successResponse(res, { feedback: feedback[0] });
}));

module.exports = router;
