import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertRequestSchema, insertProposalSchema, insertReviewSchema, insertMessageSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extended Request interface for authentication
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to verify JWT tokens
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;
      
      // Validate input
      const userData = insertUserSchema.parse({
        email,
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        role
      });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create user
      const user = await storage.createUser(userData);

      // If registering as finder, create finder profile
      if (role === 'finder') {
        await storage.createFinder({
          userId: user.id,
          phone: phone || null,
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: { ...user, password: undefined },
        token
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || user.isBanned) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: { ...user, password: undefined },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profile = null;
      if (user.role === 'finder') {
        profile = await storage.getFinderByUserId(user.id);
      }

      res.json({
        user: { ...user, password: undefined },
        profile
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  app.post("/api/auth/change-password", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Get current user
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await storage.updateUserPassword(req.user.userId, hashedNewPassword);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post("/api/auth/update-profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { firstName, lastName, email, phone } = req.body;
      
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }

      // Check if email is already taken by another user
      if (email !== req.user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user.userId) {
          return res.status(400).json({ message: "Email is already taken by another user" });
        }
      }

      // Update user profile
      const updatedUser = await storage.updateUser(req.user.userId, {
        firstName,
        lastName,
        email,
        phone
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: "Profile updated successfully",
        user: { ...updatedUser, password: undefined }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Request routes
  app.get("/api/requests", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requests = await storage.getAllActiveRequests();
      res.json(requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get("/api/requests/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const request = await storage.getRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({ message: "Failed to fetch request" });
    }
  });

  // Finder-specific routes
  app.get("/api/finder/requests", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can browse requests" });
      }

      const requests = await storage.getAvailableRequestsForFinders();
      res.json(requests);
    } catch (error) {
      console.error('Finder requests error:', error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get("/api/finder/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can view their proposals" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const proposals = await storage.getProposalsByFinderId(finder.id);
      res.json(proposals);
    } catch (error) {
      console.error('Finder proposals error:', error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get("/api/finder/dashboard", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can access finder dashboard" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const tokenBalance = await storage.getTokenBalance(finder.id);
      const proposals = await storage.getProposalsByFinderId(finder.id);
      const recentRequests = await storage.getAllActiveRequests();

      res.json({
        finder,
        tokenBalance: tokenBalance?.balance ?? 0,
        proposalsCount: proposals.length,
        availableRequests: recentRequests.length
      });
    } catch (error) {
      console.error('Finder dashboard error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Client-specific routes
  app.get("/api/client/requests", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view their requests" });
      }

      const requests = await storage.getRequestsByClientId(req.user.userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your requests" });
    }
  });

  app.post("/api/client/requests", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can create requests" });
      }

      const requestData = insertRequestSchema.parse({
        ...req.body,
        clientId: req.user.userId
      });

      const request = await storage.createRequest(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create request", error: error.message });
    }
  });

  app.get("/api/client/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view proposals" });
      }

      const clientRequests = await storage.getRequestsByClientId(req.user.userId);
      const requestIds = clientRequests.map(r => r.id);
      const allProposals = [];
      for (const requestId of requestIds) {
        const proposals = await storage.getProposalsByRequestId(requestId);
        allProposals.push(...proposals);
      }
      res.json(allProposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.post("/api/requests", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can create requests" });
      }

      const requestData = insertRequestSchema.parse({
        ...req.body,
        clientId: req.user.userId
      });

      const request = await storage.createRequest(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create request", error: error.message });
    }
  });

  app.get("/api/requests/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view their requests" });
      }

      const requests = await storage.getRequestsByClientId(req.user.userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your requests" });
    }
  });

  app.get("/api/requests/:id/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const request = await storage.getRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Only the client who posted the request can view ALL proposals
      if (req.user.role === 'client' && request.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // If finder is accessing, they should use /finder/requests/:id/proposals instead
      if (req.user.role === 'finder') {
        return res.status(403).json({ message: "Finders should use finder-specific endpoints" });
      }

      const proposals = await storage.getProposalsByRequestId(id);
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  // Finder-specific route to see only their own proposals for a request (like comments)
  app.get("/api/finder/requests/:id/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can use this endpoint" });
      }

      const request = await storage.getRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Get finder profile
      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      // Get only this finder's proposals for this request (like seeing only your own comments)
      const proposal = await storage.getProposalByFinderAndRequest(finder.id, id);
      res.json(proposal ? [proposal] : []);
    } catch (error) {
      console.error('Finder request proposals error:', error);
      res.status(500).json({ message: "Failed to fetch your proposals" });
    }
  });

  // Proposal routes
  app.post("/api/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can submit proposals" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const proposalData = insertProposalSchema.parse({
        ...req.body,
        finderId: finder.id
      });

      // Check if request has already been accepted by someone else
      const hasAccepted = await storage.hasAcceptedProposal(proposalData.requestId);
      if (hasAccepted) {
        return res.status(400).json({ message: "This request has already been accepted by another finder" });
      }

      // Check if this finder has already submitted a proposal for this request
      const existingProposal = await storage.getProposalByFinderAndRequest(finder.id, proposalData.requestId);
      if (existingProposal) {
        return res.status(400).json({ message: "You have already submitted a proposal for this request" });
      }

      // Check token balance
      const tokenBalance = await storage.getTokenBalance(finder.id);
      if (!tokenBalance || (tokenBalance.balance ?? 0) < 1) {
        return res.status(400).json({ message: "Insufficient tokens to submit proposal" });
      }

      const proposal = await storage.createProposal(proposalData);

      // Deduct token
      await storage.updateTokenBalance(finder.id, (tokenBalance.balance ?? 0) - 1);
      
      // Record transaction
      await storage.createTransaction({
        finderId: finder.id,
        amount: -1,
        type: 'proposal',
        description: `Proposal submitted for request: ${proposal.requestId}`
      });

      res.status(201).json(proposal);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to submit proposal", error: error.message });
    }
  });

  app.get("/api/proposals/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const proposal = await storage.getProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Authorization: only the finder who submitted it or the client who owns the request can view it
      if (req.user.role === 'finder') {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder || proposal.finderId !== finder.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (req.user.role === 'client') {
        const request = await storage.getRequest(proposal.requestId);
        if (!request || request.clientId !== req.user.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(proposal);
    } catch (error) {
      console.error('Get proposal error:', error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  app.get("/api/proposals/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can view their proposals" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const proposals = await storage.getProposalsByFinderId(finder.id);
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your proposals" });
    }
  });

  app.post("/api/proposals/:id/accept", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const proposal = await storage.getProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const request = await storage.getRequest(proposal.requestId);
      if (!request || request.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update proposal status
      await storage.updateProposal(id, { status: 'accepted' });

      // Create contract
      const contract = await storage.createContract({
        requestId: proposal.requestId,
        proposalId: proposal.id,
        clientId: request.clientId,
        finderId: proposal.finderId,
        amount: proposal.price,
        escrowStatus: 'held'
      });

      // Update request status to in progress
      await storage.updateRequest(proposal.requestId, { status: 'in progress' });

      res.json({ proposal, contract });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept proposal" });
    }
  });

  // Contract routes
  app.get("/api/contracts/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let contracts;
      if (req.user.role === 'client') {
        contracts = await storage.getContractsByClientId(req.user.userId);
      } else if (req.user.role === 'finder') {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder) {
          return res.status(404).json({ message: "Finder profile not found" });
        }
        contracts = await storage.getContractsByFinderId(finder.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts/:id/complete", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const contract = await storage.getContract(id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Only the finder can mark as complete
      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder || contract.finderId !== finder.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateContract(id, { 
        escrowStatus: 'completed',
        isCompleted: true,
        completedAt: new Date()
      });

      res.json({ message: "Contract marked as complete" });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete contract" });
    }
  });

  app.post("/api/contracts/:id/release-payment", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const contract = await storage.getContract(id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Only the client can release payment
      if (contract.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateContract(id, { escrowStatus: 'released' });

      // Update finder earnings and job count
      const finder = await storage.getFinder(contract.finderId);
      if (finder) {
        const newTotal = parseFloat(finder.totalEarned ?? "0") + parseFloat(contract.amount.toString());
        await storage.updateFinder(finder.id, {
          totalEarned: newTotal.toFixed(2),
          jobsCompleted: (finder.jobsCompleted ?? 0) + 1
        });
      }

      res.json({ message: "Payment released successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to release payment" });
    }
  });

  // Review routes
  app.post("/api/reviews", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can leave reviews" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        clientId: req.user.userId
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create review", error: error.message });
    }
  });

  // Token routes
  app.get("/api/tokens/balance", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders have token balances" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const tokenBalance = await storage.getTokenBalance(finder.id);
      res.json(tokenBalance || { balance: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token balance" });
    }
  });

  app.get("/api/transactions/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can view transactions" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const transactions = await storage.getTransactionsByFinderId(finder.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({ ...user, password: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/ban", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.updateUser(id, { isBanned: true });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User banned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.get("/api/admin/settings/:key", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key } = req.params;
      const setting = await storage.getAdminSetting(key);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/admin/settings", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key, value } = req.body;
      const setting = await storage.setAdminSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Messaging routes
  // Only clients can initiate conversations
  app.post("/api/messages/conversations", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can initiate conversations" });
      }

      const { proposalId } = req.body;
      const proposal = await storage.getProposal(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Check if conversation already exists
      const existingConversation = await storage.getConversation(req.user.userId, proposalId);
      if (existingConversation) {
        return res.json(existingConversation);
      }

      // Create new conversation
      const conversation = await storage.createConversation({
        clientId: req.user.userId,
        finderId: proposal.finderId,
        proposalId: proposalId
      });

      res.json(conversation);
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Get conversations for logged-in user (client or finder)
  app.get("/api/messages/conversations", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      let conversations;
      
      if (req.user.role === 'client') {
        conversations = await storage.getConversationsByClientId(req.user.userId);
      } else if (req.user.role === 'finder') {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder) {
          return res.status(404).json({ message: "Finder profile not found" });
        }
        conversations = await storage.getConversationsByFinderId(finder.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/messages/conversations/:conversationId/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { conversationId } = req.params;
      
      // Prevent caching of messages
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      // TODO: Add permission check to ensure user is part of the conversation
      const messages = await storage.getMessages(conversationId);
      
      // Mark messages as read for the current user
      await storage.markMessagesAsRead(conversationId, req.user.userId);
      
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/messages/conversations/:conversationId/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // TODO: Add permission check to ensure user is part of the conversation

      const message = await storage.createMessage({
        conversationId,
        senderId: req.user.userId,
        content: content.trim()
      });

      res.json(message);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get finder profile by ID
  app.get("/api/finders/:finderId/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { finderId } = req.params;
      
      const finderProfile = await storage.getFinderProfile(finderId);
      
      if (!finderProfile) {
        return res.status(404).json({ message: "Finder profile not found" });
      }
      
      res.json(finderProfile);
    } catch (error) {
      console.error('Get finder profile error:', error);
      res.status(500).json({ message: "Failed to fetch finder profile" });
    }
  });

  // Admin management routes
  app.get("/api/admin/categories", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, description } = req.body;
      const category = await storage.createCategory({
        name,
        description,
        isActive: true
      });

      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create category", error: error.message });
    }
  });

  app.put("/api/admin/categories/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const category = await storage.updateCategory(id, req.body);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update category", error: error.message });
    }
  });

  app.delete("/api/admin/categories/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to delete category", error: error.message });
    }
  });

  // User management routes
  app.post("/api/admin/users/:id/ban", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Ban reason is required" });
      }

      const user = await storage.banUser(id, reason);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User banned successfully", user });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to ban user", error: error.message });
    }
  });

  app.post("/api/admin/users/:id/unban", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.unbanUser(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User unbanned successfully", user });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to unban user", error: error.message });
    }
  });

  app.post("/api/admin/users/:id/verify", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.verifyUser(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User verified successfully", user });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to verify user", error: error.message });
    }
  });

  app.post("/api/admin/users/:id/unverify", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.unverifyUser(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User unverified successfully", user });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to unverify user", error: error.message });
    }
  });

  // Admin settings routes
  app.get("/api/admin/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const proposalTokenCost = await storage.getAdminSetting('proposal_token_cost');
      
      res.json({
        proposalTokenCost: proposalTokenCost?.value || '1'
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  app.put("/api/admin/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { proposalTokenCost } = req.body;

      if (proposalTokenCost !== undefined) {
        await storage.setAdminSetting('proposal_token_cost', proposalTokenCost.toString());
      }

      res.json({ message: "Settings updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update settings", error: error.message });
    }
  });

  // Withdrawal management routes
  app.get("/api/admin/withdrawals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const withdrawals = await storage.getWithdrawalRequests();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });

  app.put("/api/admin/withdrawals/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!['processing', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const withdrawal = await storage.updateWithdrawalRequest(id, {
        status,
        adminNotes,
        processedBy: req.user.userId
      });

      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal request not found" });
      }

      // If approved, deduct from finder balance
      if (status === 'approved') {
        await storage.updateFinderBalance(withdrawal.finderId, withdrawal.amount);
      }

      res.json({ message: "Withdrawal request updated successfully", withdrawal });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update withdrawal request", error: error.message });
    }
  });

  // Finder withdrawal request
  app.post("/api/finder/withdraw", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can request withdrawals" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const { amount, paymentMethod, paymentDetails } = req.body;

      if (parseFloat(amount) > parseFloat(finder.availableBalance || '0')) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawalRequest({
        finderId: finder.id,
        amount,
        paymentMethod,
        paymentDetails: JSON.stringify(paymentDetails),
        status: 'pending'
      });

      res.status(201).json({ message: "Withdrawal request submitted successfully", withdrawal });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to submit withdrawal request", error: error.message });
    }
  });

  // Additional Finder Profile Management Routes
  app.get('/api/finder/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }
      
      // Get user information as well
      const user = await storage.getUser(req.user.userId);
      
      res.json({
        ...finder,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified
        } : null
      });
    } catch (error) {
      console.error('Error fetching finder profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/finder/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }

      const updatedFinder = await storage.updateFinder(finder.id, req.body);
      res.json(updatedFinder);
    } catch (error) {
      console.error('Error updating finder profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/finder/transactions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }
      
      const transactions = await storage.getTransactionsByFinderId(finder.id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/finder/withdrawal-settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }
      
      const settings = await storage.getWithdrawalSettings(finder.id);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching withdrawal settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/finder/withdrawal-settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }

      const settings = await storage.updateWithdrawalSettings(finder.id, req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating withdrawal settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/finder/withdrawals', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }
      
      const withdrawals = await storage.getWithdrawalsByFinderId(finder.id);
      res.json(withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/finder/security-settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }

      const settings = await storage.updateSecuritySettings(finder.id, req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating security settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
      }

      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.user.userId, { password: hashedNewPassword });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
