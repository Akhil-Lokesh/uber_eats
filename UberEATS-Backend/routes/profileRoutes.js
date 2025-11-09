/**
 * Profile Routes
 * Customer profile management and file uploads
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const CustomerProfile = require('../models/CustomerProfile');
const logger = require('../utils/logger');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { profileUpdateValidation } = require('../utils/validators');
const { verifyToken, requireCustomer } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile_${req.user.id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   GET /api/profile
 * @desc    Get customer profile
 * @access  Private (Customer)
 */
router.get('/', verifyToken, requireCustomer, asyncHandler(async (req, res) => {
  const profile = await CustomerProfile.getProfile(req.user.id);

  if (!profile) {
    // If profile doesn't exist, create empty one
    await CustomerProfile.createProfile(req.user.id);
    const newProfile = await CustomerProfile.getProfile(req.user.id);
    return successResponse(res, { profile: newProfile });
  }

  return successResponse(res, { profile });
}));

/**
 * @route   PUT /api/profile
 * @desc    Update customer profile
 * @access  Private (Customer)
 */
router.put('/', verifyToken, requireCustomer, profileUpdateValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  const { phone, address, country, state, city } = req.body;

  await CustomerProfile.updateProfile(
    req.user.id,
    phone,
    address,
    country,
    state,
    city
  );

  logger.info('Profile updated', { userId: req.user.id });

  return successResponse(res, null, 'Profile updated successfully');
}));

/**
 * @route   POST /api/profile/upload
 * @desc    Upload profile picture
 * @access  Private (Customer)
 */
router.post('/upload', verifyToken, requireCustomer, upload.single('profile_picture'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400);
  }

  const profile_picture = `/uploads/${req.file.filename}`;

  await CustomerProfile.updateProfilePicture(req.user.id, profile_picture);

  logger.info('Profile picture uploaded', { userId: req.user.id, filename: req.file.filename });

  return successResponse(res, { profile_picture }, 'Profile picture uploaded successfully');
}));

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large. Maximum size is 5MB', 400);
    }
    return errorResponse(res, `Upload error: ${error.message}`, 400);
  } else if (error) {
    return errorResponse(res, error.message, 400);
  }
  next();
});

module.exports = router;
