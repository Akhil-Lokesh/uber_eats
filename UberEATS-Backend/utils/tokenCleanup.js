/**
 * Token Blacklist Cleanup Utility
 * Removes expired tokens from the database
 */

const db = require('../config/db');
const logger = require('./logger');

/**
 * Clean up expired tokens from blacklist
 * @returns {Promise<number>} Number of tokens deleted
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = await db.query(
      'DELETE FROM token_blacklist WHERE expires_at < CURRENT_TIMESTAMP'
    );

    const deletedCount = result.rowCount;
    
    if (deletedCount > 0) {
      logger.info('Token blacklist cleanup completed', { 
        deletedCount,
        timestamp: new Date().toISOString()
      });
    }

    return deletedCount;
  } catch (error) {
    logger.error('Token blacklist cleanup failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Start periodic cleanup job
 * @param {number} intervalHours - Hours between cleanup runs (default: 24)
 */
const startCleanupSchedule = (intervalHours = 24) => {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  logger.info('Starting token blacklist cleanup schedule', {
    intervalHours,
    nextRun: new Date(Date.now() + intervalMs).toISOString()
  });

  // Run cleanup immediately on start
  cleanupExpiredTokens().catch(err => {
    logger.error('Initial token cleanup failed', { error: err.message });
  });

  // Then run periodically
  setInterval(() => {
    cleanupExpiredTokens().catch(err => {
      logger.error('Scheduled token cleanup failed', { error: err.message });
    });
  }, intervalMs);
};

module.exports = {
  cleanupExpiredTokens,
  startCleanupSchedule
};
