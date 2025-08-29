
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

describe('Integration Tests - User Flows', () => {
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

  describe('Complete Client Flow', () => {
    let clientToken: string;
    let findId: string;

    it('should complete full client journey', async () => {
      // 1. Register as client
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration-client@example.com',
          password: 'password123',
          firstName: 'Integration',
          lastName: 'Client',
          role: 'client'
        })
        .expect(201);

      clientToken = registerResponse.body.token;
      expect(registerResponse.body.user.role).toBe('client');

      // 2. Create a find request
      const findResponse = await request(app)
        .post('/api/client/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Integration Test Find',
          description: 'Complete integration test find request',
          category: 'Technology',
          budgetMin: '1000',
          budgetMax: '2000',
          duration: '1 week',
          location: 'Lagos, Nigeria'
        })
        .expect(201);

      findId = findResponse.body.id;
      expect(findResponse.body.status).toBe('open');

      // 3. View own finds
      const findsResponse = await request(app)
        .get('/api/client/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(findsResponse.body.some((f: any) => f.id === findId)).toBe(true);

      // 4. Check proposals (should be empty initially)
      const proposalsResponse = await request(app)
        .get('/api/client/proposals')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(proposalsResponse.body)).toBe(true);
    });
  });

  describe('Complete Finder Flow', () => {
    let finderToken: string;
    let clientToken: string;
    let findId: string;
    let proposalId: string;

    it('should complete full finder journey', async () => {
      // 1. Register as finder
      const finderRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration-finder@example.com',
          password: 'password123',
          firstName: 'Integration',
          lastName: 'Finder',
          role: 'finder'
        })
        .expect(201);

      finderToken = finderRegisterResponse.body.token;
      expect(finderRegisterResponse.body.user.role).toBe('finder');

      // 2. Register client and create find
      const clientRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration-client2@example.com',
          password: 'password123',
          firstName: 'Integration',
          lastName: 'Client2',
          role: 'client'
        });

      clientToken = clientRegisterResponse.body.token;

      const findResponse = await request(app)
        .post('/api/client/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Find for Finder Integration',
          description: 'Find for testing finder flow',
          category: 'Technology',
          budgetMin: '1500',
          budgetMax: '2500',
          duration: '2 weeks'
        });

      findId = findResponse.body.id;

      // 3. Finder views available finds
      const availableFindsResponse = await request(app)
        .get('/api/finder/finds')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(availableFindsResponse.body.some((f: any) => f.id === findId)).toBe(true);

      // 4. Finder submits proposal
      const proposalResponse = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({
          findId: findId,
          coverLetter: 'I am very interested in this project and have the necessary skills.',
          price: '2000',
          timeline: '10 days'
        })
        .expect(201);

      proposalId = proposalResponse.body.id;
      expect(proposalResponse.body.findId).toBe(findId);

      // 5. Finder views own proposals
      const myProposalsResponse = await request(app)
        .get('/api/proposals/my')
        .set('Authorization', `Bearer ${finderToken}`)
        .expect(200);

      expect(myProposalsResponse.body.some((p: any) => p.id === proposalId)).toBe(true);

      // 6. Client accepts proposal
      const acceptResponse = await request(app)
        .post(`/api/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(acceptResponse.body.success).toBe(true);
      expect(acceptResponse.body.contract).toBeDefined();
    });
  });

  describe('Complete Messaging Flow', () => {
    let clientToken: string;
    let finderToken: string;
    let proposalId: string;
    let conversationId: string;

    it('should complete messaging flow', async () => {
      // Setup users and proposal
      const clientResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'msg-client@example.com',
          password: 'password123',
          firstName: 'Msg',
          lastName: 'Client',
          role: 'client'
        });
      clientToken = clientResponse.body.token;

      const finderResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'msg-finder@example.com',
          password: 'password123',
          firstName: 'Msg',
          lastName: 'Finder',
          role: 'finder'
        });
      finderToken = finderResponse.body.token;

      // Create find and proposal
      const findResponse = await request(app)
        .post('/api/client/finds')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Messaging Test Find',
          description: 'For testing messaging flow',
          category: 'Technology',
          budgetMin: '1000',
          budgetMax: '2000'
        });

      const proposalResponse = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({
          findId: findResponse.body.id,
          coverLetter: 'Proposal for messaging test',
          price: '1500',
          timeline: '1 week'
        });
      proposalId = proposalResponse.body.id;

      // 1. Client starts conversation
      const conversationResponse = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ proposalId })
        .expect(200);

      conversationId = conversationResponse.body.id;

      // 2. Client sends message
      const messageResponse = await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          content: 'Hello, I would like to discuss this project further.',
          attachmentPaths: [],
          attachmentNames: []
        })
        .expect(200);

      expect(messageResponse.body.content).toBe('Hello, I would like to discuss this project further.');

      // 3. Finder replies
      await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${finderToken}`)
        .send({
          content: 'Thank you for your interest. I would be happy to discuss the details.',
          attachmentPaths: [],
          attachmentNames: []
        })
        .expect(200);

      // 4. View conversation messages
      const messagesResponse = await request(app)
        .get(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(messagesResponse.body).toHaveLength(2);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle various error scenarios gracefully', async () => {
      // 1. Invalid registration data
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
          firstName: '',
          lastName: '',
          role: 'invalid-role'
        })
        .expect(400);

      // 2. Unauthorized access
      await request(app)
        .get('/api/finds')
        .expect(401);

      // 3. Invalid find creation
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'error-test@example.com',
          password: 'password123',
          firstName: 'Error',
          lastName: 'Test',
          role: 'client'
        });

      await request(app)
        .post('/api/client/finds')
        .set('Authorization', `Bearer ${userResponse.body.token}`)
        .send({
          title: '',
          description: '',
          category: ''
        })
        .expect(400);

      // 4. Access denied scenarios
      const finderResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'error-finder@example.com',
          password: 'password123',
          firstName: 'Error',
          lastName: 'Finder',
          role: 'finder'
        });

      // Finder trying to access client endpoints
      await request(app)
        .get('/api/client/finds')
        .set('Authorization', `Bearer ${finderResponse.body.token}`)
        .expect(403);
    });
  });
});
