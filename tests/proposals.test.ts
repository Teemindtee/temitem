
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Proposals Tests', () => {
  let app: express.Application;
  let server: any;
  let clientToken: string;
  let finderToken: string;
  let findId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    // Create client and finder users
    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'client-proposals@example.com',
        password: 'password123',
        firstName: 'Client',
        lastName: 'Proposals',
        role: 'client'
      });
    clientToken = clientResponse.body.token;

    const finderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'finder-proposals@example.com',
        password: 'password123',
        firstName: 'Finder',
        lastName: 'Proposals',
        role: 'finder'
      });
    finderToken = finderResponse.body.token;

    // Create a find request
    const findResponse = await request(app)
      .post('/api/client/finds')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Test Find for Proposals',
        description: 'This is for testing proposals',
        category: 'Technology',
        budgetMin: '1000',
        budgetMax: '2000',
        duration: '1 week'
      });
    findId = findResponse.body.id;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/proposals', () => {
    it('should create a new proposal', async () => {
      const proposalData = {
        findId: findId,
        coverLetter: 'I am interested in this project and have relevant experience.',
        price: '1500',
        timeline: '5 days'
      };

      const response = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${finderToken}`)
        .send(proposalData)
        .expect(201);

      expect(response.body.coverLetter).toBe(proposalData.coverLetter);
      expect(response.body.price).toBe(proposalData.price);
    });

    it('should reject proposal from non-finder', async () => {
      const proposalData = {
        findId: findId,
        coverLetter: 'This should fail',
        price: '1500',
        timeline: '5 days'
      };

      await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(proposalData)
        .expect(403);
    });

    it('should reject duplicate proposals from same finder', async () => {
      const proposalData = {
        findId: findId,
        coverLetter: 'Duplicate proposal attempt',
        price: '1600',
        timeline: '6 days'
      };

      await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${finderToken}`)
        .send(proposalData)
        .expect(400);
    });
  });

  describe('GET /api/proposals/my', () => {
    it('should return finder\'s proposals', async () => {
      const response = await request(app)
        .get('/api/proposals/my')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject access from non-finder', async () => {
      await request(app)
        .get('/api/proposals/my')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('GET /api/client/proposals', () => {
    it('should return client\'s received proposals', async () => {
      const response = await request(app)
        .get('/api/client/proposals')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject access from non-client', async () => {
      await request(app)
        .get('/api/client/proposals')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(403);
    });
  });
});
