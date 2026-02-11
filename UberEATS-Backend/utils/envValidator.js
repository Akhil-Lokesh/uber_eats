/**
 * Environment Variable Validator
 * Ensures all required environment variables are set before starting the server
 */

const logger = require('./logger');

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = {
  // Database
  'DB_HOST': 'Database host address',
  'DB_PORT': 'Database port number',
  'DB_USER': 'Database username',
  'DB_PASSWORD': 'Database password',
  'DB_NAME': 'Database name',
  
  // Security
  'JWT_SECRET': 'JWT signing secret (must be strong in production)',
  'JWT_EXPIRATION': 'JWT token expiration time',
  
  // Server
  'PORT': 'Server port number',
  'NODE_ENV': 'Node environment (development/production)',
  'FRONTEND_URL': 'Frontend URL for CORS'
};

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = {
  'SESSION_SECRET': 'Session secret for express-session',
  'MAX_FILE_SIZE': 'Maximum file upload size',
  'UPLOAD_DIR': 'Directory for file uploads',
  'RATE_LIMIT_WINDOW_MS': 'Rate limit window in milliseconds',
  'RATE_LIMIT_MAX_REQUESTS': 'Maximum requests per window'
};

/**
 * Validate a single environment variable
 * @param {string} key - Environment variable name
 * @param {string} description - Variable description
 * @returns {boolean} - True if valid
 */
const validateEnvVar = (key, description) => {
  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    logger.error(`Missing required environment variable: ${key}`, {
      key,
      description
    });
    return false;
  }

  // Additional validation for specific vars
  if (key === 'JWT_SECRET' && value.length < 32) {
    logger.warn(`JWT_SECRET should be at least 32 characters for security`, {
      currentLength: value.length
    });
  }

  if (key === 'NODE_ENV' && !['development', 'production', 'test'].includes(value)) {
    logger.warn(`NODE_ENV has unusual value: ${value}`, {
      expected: ['development', 'production', 'test']
    });
  }

  if (key === 'DB_PORT' && (isNaN(value) || parseInt(value) < 1 || parseInt(value) > 65535)) {
    logger.error(`DB_PORT must be a valid port number (1-65535)`, {
      currentValue: value
    });
    return false;
  }

  if (key === 'PORT' && (isNaN(value) || parseInt(value) < 1 || parseInt(value) > 65535)) {
    logger.error(`PORT must be a valid port number (1-65535)`, {
      currentValue: value
    });
    return false;
  }

  return true;
};

/**
 * Validate all required environment variables
 * @param {boolean} strict - If true, exits process on validation failure
 * @returns {boolean} - True if all validations pass
 */
const validateEnvironment = (strict = true) => {
  logger.info('Validating environment variables...');

  let isValid = true;
  const missingVars = [];
  const invalidVars = [];

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!validateEnvVar(key, description)) {
      isValid = false;
      if (!process.env[key]) {
        missingVars.push(key);
      } else {
        invalidVars.push(key);
      }
    }
  }

  // Check recommended variables (warnings only)
  const missingRecommended = [];
  for (const [key, description] of Object.entries(RECOMMENDED_ENV_VARS)) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missingRecommended.push(key);
      logger.warn(`Recommended environment variable not set: ${key}`, {
        key,
        description
      });
    }
  }

  // Report results
  if (isValid) {
    logger.info('✅ Environment validation passed', {
      requiredVars: Object.keys(REQUIRED_ENV_VARS).length,
      missingRecommended: missingRecommended.length
    });
  } else {
    logger.error('❌ Environment validation failed', {
      missingVars,
      invalidVars,
      totalRequired: Object.keys(REQUIRED_ENV_VARS).length
    });

    if (strict) {
      console.error('\n❌ Environment validation failed!');
      console.error('Missing required variables:', missingVars);
      if (invalidVars.length > 0) {
        console.error('Invalid variables:', invalidVars);
      }
      console.error('\nPlease set the required environment variables in your .env file');
      console.error('See .env.example for reference\n');
      process.exit(1);
    }
  }

  return isValid;
};

/**
 * Print environment summary (safe - no sensitive values)
 */
const printEnvironmentSummary = () => {
  logger.info('Environment Configuration', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    frontendUrl: process.env.FRONTEND_URL,
    jwtExpiration: process.env.JWT_EXPIRATION,
    // Never log sensitive values like passwords or secrets
  });
};

module.exports = {
  validateEnvironment,
  validateEnvVar,
  printEnvironmentSummary,
  REQUIRED_ENV_VARS,
  RECOMMENDED_ENV_VARS
};
