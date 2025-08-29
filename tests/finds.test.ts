
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Finds/Requests Tests', () => {
  let app: express.Application;
  let server: any;
  let clientToken: string;
  let finderToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    // Create client user
    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'client-finds@example.com',
        password: 'password123',
        firstName: 'Client',
        lastName: 'Test',
        role: 'client'
      });
    clientToken = clientResponse.body.token;

    // Create finder user
    const finderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'finder-finds@example.com',
        password: 'password123',
        firstName: 'Finder',
        lastName: 'Test',
        role: 'finder'
      });
    finderToken = finderResponse.body.token;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/client/finds', () => {
    it('should create a new find request', async () => {
      const findData = {
        title: 'Test Find Request',
        description: 'This is a test find request description',
        category: 'Technology',
        budgetMin: '1000',
        budgetMax: '2000',
        duration: '1 week',
        location: 'Lagos, Nigeria'
      };

      const response = await request(app)
        .post('/api/client/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(findData)
        .expect(201);

      expect(response.body.title).toBe(findData.title);
      expect(response.body.status).toBe('open');
    });

    it('should reject find creation without authentication', async () => {
      const findData = {
        title: 'Unauthorized Find',
        description: 'This should fail',
        category: 'Technology',
        budgetMin: '1000',
        budgetMax: '2000'
      };

      await request(app)
        .post('/api/client/finds')
        .send(findData)
        .expect(401);
    });

    it('should reject find creation with invalid data', async () => {
      const invalidFindData = {
        title: '', // Empty title
        description: 'Valid description',
        category: 'Technology'
      };

      await request(app)
        .post('/api/client/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidFindData)
        .expect(400);
    });
  });

  describe('GET /api/finds', () => {
    it('should return list of finds for authenticated users', async () => {
      const response = await request(app)
        .get('/api/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject access without authentication', async () => {
      await request(app)
        .get('/api/finds')
        .expect(401);
    });
  });

  describe('GET /api/finder/finds', () => {
    it('should return available finds for finders', async () => {
      const response = await request(app)
        .get('/api/finder/finds')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject access for non-finder users', async () => {
      await request(app)
        .get('/api/finder/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });
});
