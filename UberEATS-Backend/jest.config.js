/**
 * Jest Configuration
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!utils/logger.js', // Exclude logger from coverage
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],

  // Coverage thresholds (aspirational - can be lowered initially)
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // Timeout for tests
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Force exit after tests complete
  forceExit: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true
};
