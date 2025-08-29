
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Admin Tests', () => {
  let app: express.Application;
  let server: any;
  let adminToken: string;
  let regularUserToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
    adminToken = adminResponse.body.token;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'regular@example.com',
        password: 'password123',
        firstName: 'Regular',
        lastName: 'User',
        role: 'client'
      });
    regularUserToken = userResponse.body.token;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/admin/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject access for non-admin users', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('GET /api/admin/finds', () => {
    it('should return all finds for admin', async () => {
      const response = await request(app)
        .get('/api/admin/finds')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/admin/users/:id/ban', () => {
    it('should ban a user', async () => {
      // First get a user ID to ban
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const regularUser = usersResponse.body.find((u: any) => u.email === 'regular@example.com');

      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test ban reason' })
        .expect(200);

      expect(response.body.message).toContain('banned');
    });
  });

  describe('GET /api/admin/settings', () => {
    it('should return admin settings', async () => {
      const response = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('proposalTokenCost');
      expect(response.body).toHaveProperty('findertokenPrice');
    });
  });

  describe('PUT /api/admin/settings', () => {
    it('should update admin settings', async () => {
      const settingsData = {
        proposalTokenCost: '2',
        findertokenPrice: '150'
      };

      const response = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settingsData)
        .expect(200);

      expect(response.body.message).toContain('updated');
    });
  });
});
