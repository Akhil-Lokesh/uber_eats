/**
 * UberEats Backend Server
 * Version 2.1.0 - Production Ready with PostgreSQL
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const { validateEnvironment, printEnvironmentSummary } = require('./utils/envValidator');
const { verifyDatabaseConnection, getCompleteHealth } = require('./utils/healthCheck');
const { startCleanupSchedule } = require('./utils/tokenCleanup');

// ===========================
// Environment Validation
// ===========================
validateEnvironment(process.env.NODE_ENV === 'production');
printEnvironmentSummary();

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
// Health Check Endpoints
// ===========================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UberEats API v2.1.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'PostgreSQL'
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

// Detailed health check with database status
app.get('/health/detailed', async (req, res) => {
  try {
    const health = await getCompleteHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
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
// Start Server with Health Checks
// ===========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection
    logger.info('🔍 Performing startup checks...');
    const dbConnected = await verifyDatabaseConnection(5, 2000);

    if (!dbConnected && process.env.NODE_ENV === 'production') {
      logger.error('❌ Cannot start server: Database connection failed');
      process.exit(1);
    }

    if (!dbConnected) {
      logger.warn('⚠️  Starting server without database connection (development mode)');
    }

    // Start token cleanup schedule (runs every 24 hours)
    startCleanupSchedule(24);

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info('✅ Server startup complete!');
      logger.info(`🚀 Server listening on port ${PORT}`);
      logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      logger.info(`💾 Database: PostgreSQL`);
      logger.info(`🧹 Token cleanup: Every 24 hours`);
    });
  } catch (error) {
    logger.error('❌ Server startup failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Start the server
startServer();

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
