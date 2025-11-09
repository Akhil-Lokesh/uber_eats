/**
 * UberEats Backend Server
 * Version 2.0.0 - Production Ready
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

const app = express();

// ===========================
// Security Middleware
// ===========================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ===========================
// CORS Configuration
// ===========================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===========================
// Request Logging
// ===========================
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ===========================
// Body Parsing & Compression
// ===========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ===========================
// Serve Static Files
// ===========================
app.use('/uploads', express.static('uploads'));

// ===========================
// Health Check
// ===========================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UberEats API v2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ===========================
// API Routes
// ===========================
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ===========================
// Error Handling
// ===========================
app.use(notFoundHandler);
app.use(errorHandler);

// ===========================
// Start Server
// ===========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}`);
  logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// ===========================
// Graceful Shutdown
// ===========================
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// ===========================
// Unhandled Rejection Handler
// ===========================
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = app;
