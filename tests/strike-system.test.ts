
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Strike System Tests', () => {
  let app: express.Application;
  let server: any;
  let adminToken: string;
  let clientToken: string;
  let finderToken: string;
  let clientUserId: string;
  let finderUserId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    // Create admin
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin-strikes@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Strikes',
        role: 'admin'
      });
    adminToken = adminResponse.body.token;

    // Create client
    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'client-strikes@example.com',
        password: 'password123',
        firstName: 'Client',
        lastName: 'Strikes',
        role: 'client'
      });
    clientToken = clientResponse.body.token;
    clientUserId = clientResponse.body.user.id;

    // Create finder
    const finderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'finder-strikes@example.com',
        password: 'password123',
        firstName: 'Finder',
        lastName: 'Strikes',
        role: 'finder'
      });
    finderToken = finderResponse.body.token;
    finderUserId = finderResponse.body.user.id;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/offenses/:role', () => {
    it('should return client offenses', async () => {
      const response = await request(app)
        .get('/api/offenses/client')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return finder offenses', async () => {
      const response = await request(app)
        .get('/api/offenses/finder')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject access for non-admin', async () => {
      await request(app)
        .get('/api/offenses/client')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/strikes', () => {
    it('should issue a strike to client', async () => {
      const strikeData = {
        userId: clientUserId,
        offenseType: 'Misleading Request Description',
        evidence: 'Test evidence for misleading request',
        userRole: 'client',
        contextId: 'test-context-123'
      };

      const response = await request(app)
        .post('/api/admin/strikes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(strikeData)
        .expect(201);

      expect(response.body.userId).toBe(clientUserId);
      expect(response.body.offenseType).toBe(strikeData.offenseType);
    });

    it('should issue a strike to finder', async () => {
      const strikeData = {
        userId: finderUserId,
        offenseType: 'Low Quality or Incomplete Proposals',
        evidence: 'Test evidence for low quality proposal',
        userRole: 'finder',
        contextId: 'test-context-456'
      };

      const response = await request(app)
        .post('/api/admin/strikes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(strikeData)
        .expect(201);

      expect(response.body.userId).toBe(finderUserId);
      expect(response.body.offenseType).toBe(strikeData.offenseType);
    });

    it('should reject strike issuance by non-admin', async () => {
      const strikeData = {
        userId: clientUserId,
        offenseType: 'Test Offense',
        evidence: 'Test evidence',
        userRole: 'client'
      };

      await request(app)
        .post('/api/admin/strikes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(strikeData)
        .expect(403);
    });
  });

  describe('GET /api/users/:userId/strikes', () => {
    it('should return user\'s own strikes', async () => {
      const response = await request(app)
        .get(`/api/users/${clientUserId}/strikes`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('strikes');
      expect(response.body).toHaveProperty('restrictions');
    });

    it('should allow admin to view any user\'s strikes', async () => {
      const response = await request(app)
        .get(`/api/users/${finderUserId}/strikes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('strikes');
      expect(response.body).toHaveProperty('restrictions');
    });

    it('should reject access to other user\'s strikes', async () => {
      await request(app)
        .get(`/api/users/${finderUserId}/strikes`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });
});
