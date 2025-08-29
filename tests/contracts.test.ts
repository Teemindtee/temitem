
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Contracts Tests', () => {
  let app: express.Application;
  let server: any;
  let clientToken: string;
  let finderToken: string;
  let proposalId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    // Create users and set up proposal
    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'client-contracts@example.com',
        password: 'password123',
        firstName: 'Client',
        lastName: 'Contracts',
        role: 'client'
      });
    clientToken = clientResponse.body.token;

    const finderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'finder-contracts@example.com',
        password: 'password123',
        firstName: 'Finder',
        lastName: 'Contracts',
        role: 'finder'
      });
    finderToken = finderResponse.body.token;

    // Create find and proposal
    const findResponse = await request(app)
      .post('/api/client/finds')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Contract Test Find',
        description: 'For testing contracts',
        category: 'Technology',
        budgetMin: '1000',
        budgetMax: '2000'
      });

    const proposalResponse = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${finderToken}`)
      .send({
        findId: findResponse.body.id,
        coverLetter: 'Test proposal for contract',
        price: '1500',
        timeline: '1 week'
      });
    proposalId = proposalResponse.body.id;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/proposals/:id/accept', () => {
    it('should accept a proposal and create contract', async () => {
      const response = await request(app)
        .post(`/api/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.contract).toBeDefined();
      expect(response.body.payment.required).toBe(true);
    });

    it('should reject proposal acceptance by non-client', async () => {
      await request(app)
        .post(`/api/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(403);
    });
  });

  describe('GET /api/contracts/my', () => {
    it('should return user\'s contracts', async () => {
      const clientResponse = await request(app)
        .get('/api/contracts/my')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(clientResponse.body)).toBe(true);

      const finderResponse = await request(app)
        .get('/api/contracts/my')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(Array.isArray(finderResponse.body)).toBe(true);
    });

    it('should reject access without authentication', async () => {
      await request(app)
        .get('/api/contracts/my')
        .expect(401);
    });
  });
});
