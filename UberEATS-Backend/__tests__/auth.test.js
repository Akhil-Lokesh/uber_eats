/**
 * Authentication Tests
 * Basic test suite for authentication endpoints
 */

const request = require('supertest');
const app = require('../index');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should reject signup without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
          role: 'customer'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Test@123456',
          role: 'customer'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login without credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Test@123456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/current-user', () => {
    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/current-user');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/current-user')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
