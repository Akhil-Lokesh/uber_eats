/**
 * Health Check Utilities
 * Check database connection and system health
 */

const db = require('../config/db');
const logger = require('./logger');

/**
 * Check database connection health
 * @returns {Promise<Object>} Database health status
 */
const checkDatabaseHealth = async () => {
  const startTime = Date.now();

  try {
    // Simple query to check connection
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    const responseTime = Date.now() - startTime;

    const healthData = {
      status: 'healthy',
      connected: true,
      responseTime: `${responseTime}ms`,
      serverTime: result.rows[0].current_time,
      postgresVersion: result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1],
      timestamp: new Date().toISOString()
    };

    // Check connection pool stats if available
    if (db.totalCount !== undefined) {
      healthData.pool = {
        total: db.totalCount,
        idle: db.idleCount,
        waiting: db.waitingCount
      };
    }

    return healthData;
  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error('Database health check failed', {
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });

    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get system health information
 * @returns {Object} System health status
 */
const getSystemHealth = () => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  return {
    status: 'healthy',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    nodejs: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  };
};

/**
 * Complete health check (database + system)
 * @returns {Promise<Object>} Complete health status
 */
const getCompleteHealth = async () => {
  const [dbHealth, systemHealth] = await Promise.all([
    checkDatabaseHealth(),
    Promise.resolve(getSystemHealth())
  ]);

  const overallHealthy = dbHealth.status === 'healthy' && systemHealth.status === 'healthy';

  return {
    status: overallHealthy ? 'healthy' : 'degraded',
    database: dbHealth,
    system: systemHealth,
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };
};

/**
 * Format uptime into human-readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

/**
 * Verify database connection on startup
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 * @returns {Promise<boolean>} True if connected successfully
 */
const verifyDatabaseConnection = async (maxRetries = 5, retryDelay = 2000) => {
  logger.info('Verifying database connection...');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const health = await checkDatabaseHealth();

      if (health.connected) {
        logger.info('✅ Database connection verified', {
          attempt,
          responseTime: health.responseTime,
          postgresVersion: health.postgresVersion
        });
        return true;
      }
    } catch (error) {
      logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed`, {
        error: error.message,
        nextRetry: attempt < maxRetries ? `${retryDelay}ms` : 'none'
      });

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  logger.error('❌ Failed to connect to database after multiple attempts', {
    maxRetries
  });

  return false;
};

module.exports = {
  checkDatabaseHealth,
  getSystemHealth,
  getCompleteHealth,
  verifyDatabaseConnection,
  formatUptime
};
