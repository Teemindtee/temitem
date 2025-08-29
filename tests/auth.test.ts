
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Authentication Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test2@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const userData = {
        email: 'login-test@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'Test',
        role: 'client'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      // Register and login to get token
      const userData = {
        email: 'me-test@example.com',
        password: 'password123',
        firstName: 'Me',
        lastName: 'Test',
        role: 'client'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const token = registerResponse.body.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe(userData.email);
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });
});
