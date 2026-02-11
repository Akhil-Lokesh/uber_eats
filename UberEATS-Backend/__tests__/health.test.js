/**
 * Health Check Tests
 */

const request = require('supertest');
const app = require('../index');

describe('Health Check Endpoints', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return numeric uptime', async () => {
      const response = await request(app).get('/health');

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('system');
    });

    it('should include database connection status', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.body.database).toHaveProperty('connected');
      expect(response.body.database).toHaveProperty('responseTime');
    });

    it('should include system memory information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system.memory).toHaveProperty('heapUsed');
    });
  });
});
