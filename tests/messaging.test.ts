
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Messaging Tests', () => {
  let app: express.Application;
  let server: any;
  let clientToken: string;
  let finderToken: string;
  let proposalId: string;
  let conversationId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app as any);

    // Set up users and proposal
    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'client-messaging@example.com',
        password: 'password123',
        firstName: 'Client',
        lastName: 'Messaging',
        role: 'client'
      });
    clientToken = clientResponse.body.token;

    const finderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'finder-messaging@example.com',
        password: 'password123',
        firstName: 'Finder',
        lastName: 'Messaging',
        role: 'finder'
      });
    finderToken = finderResponse.body.token;

    // Create find and proposal for messaging
    const findResponse = await request(app)
      .post('/api/client/finds')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Messaging Test Find',
        description: 'For testing messaging',
        category: 'Technology',
        budgetMin: '1000',
        budgetMax: '2000'
      });

    const proposalResponse = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${finderToken}`)
      .send({
        findId: findResponse.body.id,
        coverLetter: 'Test proposal for messaging',
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

  describe('POST /api/messages/conversations', () => {
    it('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ proposalId })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      conversationId = response.body.id;
    });

    it('should reject conversation creation by non-client', async () => {
      await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ proposalId })
        .expect(403);
    });
  });

  describe('GET /api/messages/conversations', () => {
    it('should return user\'s conversations', async () => {
      const clientResponse = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(clientResponse.body)).toBe(true);

      const finderResponse = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(Array.isArray(finderResponse.body)).toBe(true);
    });
  });

  describe('POST /api/messages/conversations/:id/messages', () => {
    it('should send a message in conversation', async () => {
      const messageData = {
        content: 'Hello, this is a test message!',
        attachmentPaths: [],
        attachmentNames: []
      };

      const response = await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(messageData)
        .expect(200);

      expect(response.body.content).toBe(messageData.content);
    });

    it('should reject empty messages', async () => {
      await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ content: '', attachmentPaths: [], attachmentNames: [] })
        .expect(400);
    });
  });

  describe('GET /api/messages/conversations/:id/messages', () => {
    it('should return messages in conversation', async () => {
      const response = await request(app)
        .get(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
