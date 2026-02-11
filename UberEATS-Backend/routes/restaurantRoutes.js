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
  const restaurantsResult = await db.query(
    'SELECT id FROM restaurants WHERE user_id = $1',
    [req.user.id]
  );
  const restaurants = restaurantsResult.rows;

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  const profileResult = await db.query(
    'SELECT id, name, email, location, phone, cuisine, description, image, rating, total_reviews, created_at FROM restaurants WHERE id = $1',
    [restaurants[0].id]
  );
  const profile = profileResult.rows;

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

  const restaurantsResult2 = await db.query(
    'SELECT id FROM restaurants WHERE user_id = $1',
    [req.user.id]
  );
  const restaurants = restaurantsResult2.rows;

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  await db.query(
    'UPDATE restaurants SET name=$1, location=$2, phone=$3, cuisine=$4, description=$5 WHERE id=$6',
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

  const restaurantsResult3 = await db.query(
    'SELECT id FROM restaurants WHERE user_id = $1',
    [req.user.id]
  );
  const restaurants = restaurantsResult3.rows;

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
  const restaurantsResult4 = await db.query(
    'SELECT id FROM restaurants WHERE user_id = $1',
    [req.user.id]
  );
  const restaurants = restaurantsResult4.rows;

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

  const restaurantsResult5 = await db.query(
    'SELECT id FROM restaurants WHERE user_id = $1',
    [req.user.id]
  );
  const restaurants = restaurantsResult5.rows;

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  // Verify dish belongs to this restaurant
  const dishesResult = await db.query(
    'SELECT id FROM dishes WHERE id = $1 AND restaurant_id = $2',
    [req.params.id, restaurants[0].id]
  );
  const dishes = dishesResult.rows;

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

  const restaurantsResult6 = await db.query(
    'SELECT id FROM restaurants WHERE user_id = $1',
    [req.user.id]
  );
  const restaurants = restaurantsResult6.rows;

  if (restaurants.length === 0) {
    return errorResponse(res, 'Restaurant profile not found', 404);
  }

  const dishesResult2 = await db.query(
    'SELECT id FROM dishes WHERE id = $1 AND restaurant_id = $2',
    [req.params.id, restaurants[0].id]
  );
  const dishes = dishesResult2.rows;

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

  const ratingsResult = await db.query(
    `SELECT
      COALESCE(AVG(rating), 0) AS average_rating,
      COUNT(*) AS total_reviews
     FROM feedbacks
     WHERE restaurant_id = $1`,
    [req.params.id]
  );
  const ratings = ratingsResult.rows;

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

  const restaurantsResult7 = await db.query(
    'SELECT id, name, email, location, phone, cuisine, description, image, rating, total_reviews FROM restaurants WHERE id = $1',
    [req.params.id]
  );
  const restaurants = restaurantsResult7.rows;

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
  let paramIndex = 1;

  if (cuisine) {
    query += ` AND cuisine = $${paramIndex++}`;
    params.push(cuisine);
  }

  if (search) {
    const searchTerm = `%${search}%`;
    query += ` AND (name LIKE $${paramIndex++} OR description LIKE $${paramIndex++} OR cuisine LIKE $${paramIndex++})`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY rating DESC, total_reviews DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(parseInt(limit), parseInt(offset));

  const restaurantsResult8 = await db.query(query, params);
  const restaurants = restaurantsResult8.rows;

  return successResponse(res, { restaurants, count: restaurants.length });
}));

module.exports = router;
