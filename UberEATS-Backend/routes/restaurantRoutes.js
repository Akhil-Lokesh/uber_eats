/**
 * Restaurant Routes
 * Profile management, dish management, ratings
 */

const express = require('express');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const Dish = require('../models/Dish');
const logger = require('../utils/logger');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { dishValidation, idParamValidation } = require('../utils/validators');
const { verifyToken, requireRestaurant, optionalAuth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/restaurants/profile
 * @desc    Get restaurant profile
 * @access  Private (Restaurant)
 */
router.get('/profile', verifyToken, requireRestaurant, asyncHandler(async (req, res) => {
  const [restaurants] = await db.execute(
    'SELECT id FROM restaurants WHERE user_id = ?',
    [req.user.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  const [profile] = await db.execute(
    'SELECT id, name, email, location, phone, cuisine, description, image, rating, total_reviews, created_at FROM restaurants WHERE id = ?',
    [restaurants[0].id]
  );

  return successResponse(res, { restaurant: profile[0] });
}));

/**
 * @route   PUT /api/restaurants/profile
 * @desc    Update restaurant profile
 * @access  Private (Restaurant)
 */
router.put('/profile', verifyToken, requireRestaurant, asyncHandler(async (req, res) => {
  const { name, location, phone, cuisine, description } = req.body;

  if (!name || !location || !phone || !cuisine) {
    return errorResponse(res, 'All fields are required', 400);
  }

  const [restaurants] = await db.execute(
    'SELECT id FROM restaurants WHERE user_id = ?',
    [req.user.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  await db.execute(
    'UPDATE restaurants SET name=?, location=?, phone=?, cuisine=?, description=? WHERE id=?',
    [name, location, phone, cuisine, description || null, restaurants[0].id]
  );

  logger.info('Restaurant profile updated', { restaurantId: restaurants[0].id });

  return successResponse(res, null, 'Profile updated successfully');
}));

/**
 * @route   POST /api/restaurants/dishes
 * @desc    Add new dish
 * @access  Private (Restaurant)
 */
router.post('/dishes', verifyToken, requireRestaurant, dishValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { name, description, price, category, image } = req.body;

  const [restaurants] = await db.execute(
    'SELECT id FROM restaurants WHERE user_id = ?',
    [req.user.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  await Dish.create(restaurants[0].id, name, description, price, category, image);

  logger.info('Dish added', { restaurantId: restaurants[0].id, dishName: name });

  return successResponse(res, null, 'Dish added successfully', 201);
}));

/**
 * @route   GET /api/restaurants/dishes
 * @desc    Get all dishes for restaurant
 * @access  Private (Restaurant)
 */
router.get('/dishes', verifyToken, requireRestaurant, asyncHandler(async (req, res) => {
  const [restaurants] = await db.execute(
    'SELECT id FROM restaurants WHERE user_id = ?',
    [req.user.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  const dishes = await Dish.getByRestaurant(restaurants[0].id);

  return successResponse(res, { dishes, count: dishes.length });
}));

/**
 * @route   PUT /api/restaurants/dishes/:id
 * @desc    Update dish
 * @access  Private (Restaurant)
 */
router.put('/dishes/:id', verifyToken, requireRestaurant, idParamValidation, dishValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { name, description, price, category, image } = req.body;

  const [restaurants] = await db.execute(
    'SELECT id FROM restaurants WHERE user_id = ?',
    [req.user.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  // Verify dish belongs to this restaurant
  const [dishes] = await db.execute(
    'SELECT id FROM dishes WHERE id = ? AND restaurant_id = ?',
    [req.params.id, restaurants[0].id]
  );

  if (dishes.length === 0) {
    return errorResponse(res, 'Dish not found or access denied', 404);
  }

  await Dish.update(req.params.id, name, description, price, category, image);

  logger.info('Dish updated', { dishId: req.params.id });

  return successResponse(res, null, 'Dish updated successfully');
}));

/**
 * @route   DELETE /api/restaurants/dishes/:id
 * @desc    Delete dish
 * @access  Private (Restaurant)
 */
router.delete('/dishes/:id', verifyToken, requireRestaurant, idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const [restaurants] = await db.execute(
    'SELECT id FROM restaurants WHERE user_id = ?',
    [req.user.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  const [dishes] = await db.execute(
    'SELECT id FROM dishes WHERE id = ? AND restaurant_id = ?',
    [req.params.id, restaurants[0].id]
  );

  if (dishes.length === 0) {
    return errorResponse(res, 'Dish not found or access denied', 404);
  }

  await Dish.delete(req.params.id);

  logger.info('Dish deleted', { dishId: req.params.id });

  return successResponse(res, null, 'Dish deleted successfully');
}));

/**
 * @route   GET /api/restaurants/:id/rating
 * @desc    Get restaurant ratings
 * @access  Public
 */
router.get('/:id/rating', idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const [ratings] = await db.execute(
    `SELECT 
      IFNULL(AVG(rating), 0) AS average_rating,
      COUNT(*) AS total_reviews
     FROM feedbacks
     WHERE restaurant_id = ?`,
    [req.params.id]
  );

  return successResponse(res, {
    restaurant_id: parseInt(req.params.id),
    average_rating: parseFloat(ratings[0].average_rating).toFixed(2),
    total_reviews: ratings[0].total_reviews
  });
}));

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get restaurant details with menu
 * @access  Public
 */
router.get('/:id', optionalAuth, idParamValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const [restaurants] = await db.execute(
    'SELECT id, name, email, location, phone, cuisine, description, image, rating, total_reviews FROM restaurants WHERE id = ?',
    [req.params.id]
  );

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant not found', 404);
  }

  const dishes = await Dish.getByRestaurant(req.params.id);

  return successResponse(res, {
    restaurant: restaurants[0],
    dishes
  });
}));

/**
 * @route   GET /api/restaurants
 * @desc    Get all restaurants
 * @access  Public
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { cuisine, search, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT id, name, location, phone, cuisine, description, image, rating, total_reviews FROM restaurants WHERE 1=1';
  const params = [];

  if (cuisine) {
    query += ' AND cuisine = ?';
    params.push(cuisine);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR cuisine LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY rating DESC, total_reviews DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [restaurants] = await db.execute(query, params);

  return successResponse(res, { restaurants, count: restaurants.length });
}));

module.exports = router;
