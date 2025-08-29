
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Payments Tests', () => {
  let app: express.Application;
  let server: any;
  let finderToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    const finderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'finder-payments@example.com',
        password: 'password123',
        firstName: 'Finder',
        lastName: 'Payments',
        role: 'finder'
      });
    finderToken = finderResponse.body.token;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/findertokens/packages', () => {
    it('should return available token packages', async () => {
      const response = await request(app)
        .get('/api/findertokens/packages')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/tokens/purchase', () => {
    it('should initialize token purchase', async () => {
      const purchaseData = {
        tokenAmount: 10,
        amount: 1000
      };

      const response = await request(app)
        .post('/api/tokens/purchase')
        .set('Authorization', `Bearer ${finderToken}`)
        .send(purchaseData)
        .expect(200);

      expect(response.body).toHaveProperty('authorization_url');
      expect(response.body).toHaveProperty('reference');
    });

    it('should reject purchase with invalid data', async () => {
      const invalidData = {
        tokenAmount: -5,
        amount: 0
      };

      await request(app)
        .post('/api/tokens/purchase')
        .set('Authorization', `Bearer ${finderToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/findertokens/balance', () => {
    it('should return finder token balance', async () => {
      const response = await request(app)
        .get('/api/findertokens/balance')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
    });

    it('should reject access from non-finder', async () => {
      // Create client token
      const clientResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'client-balance@example.com',
          password: 'password123',
          firstName: 'Client',
          lastName: 'Balance',
          role: 'client'
        });

      await request(app)
        .get('/api/findertokens/balance')
        .set('Authorization', `Bearer ${clientResponse.body.token}`)
        .expect(403);
    });
  });
});
