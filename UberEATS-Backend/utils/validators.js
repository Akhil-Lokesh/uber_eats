/**
 * Input Validation Schemas
 * Uses express-validator for comprehensive input validation
 */

const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .escape(),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['customer', 'restaurant']).withMessage('Invalid role')
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for profile update
 */
const profileUpdateValidation = [
  body('phone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address is too long'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('City name is too long')
    .escape(),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('State name is too long')
    .escape(),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Country name is too long')
    .escape()
];

/**
 * Validation rules for dish creation
 */
const dishValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Dish name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Dish name must be between 2 and 200 characters')
    .escape(),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description is too long'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 100 }).withMessage('Category is too long')
    .escape(),

  body('image')
    .optional()
    .isURL().withMessage('Image must be a valid URL')
];

/**
 * Validation rules for order creation
 */
const orderValidation = [
  body('restaurantId')
    .notEmpty().withMessage('Restaurant ID is required')
    .isInt({ min: 1 }).withMessage('Invalid restaurant ID'),

  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),

  body('items.*.dishId')
    .isInt({ min: 1 }).withMessage('Invalid dish ID'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),

  body('items.*.price')
    .isFloat({ min: 0.01 }).withMessage('Invalid price'),

  body('deliveryAddress')
    .trim()
    .notEmpty().withMessage('Delivery address is required')
    .isLength({ min: 10, max: 500 }).withMessage('Delivery address must be between 10 and 500 characters'),

  body('totalPrice')
    .isFloat({ min: 0.01 }).withMessage('Invalid total price')
];

/**
 * Validation rules for feedback
 */
const feedbackValidation = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment is too long')
];

/**
 * Validation for ID parameters
 */
const idParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID')
];

module.exports = {
  signupValidation,
  loginValidation,
  profileUpdateValidation,
  dishValidation,
  orderValidation,
  feedbackValidation,
  idParamValidation
};
