import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUserSchema, insertFindSchema, insertProposalSchema, insertReviewSchema, insertMessageSchema, insertBlogPostSchema, insertOrderSubmissionSchema, type Find } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { PaystackService, TOKEN_PACKAGES } from "./paymentService";
import { emailService } from "./emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Allow specific file types
    const allowedMimes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

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
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
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

  // Find routes
  app.get("/api/finds", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const finds = await storage.getAllActiveFinds();
      res.json(finds);
    } catch (error) {
      console.error('Failed to fetch finds:', error);
      res.status(500).json({ message: "Failed to fetch finds" });
    }
  });

  app.get("/api/finds/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const find = await storage.getFind(id);
      
      if (!find) {
        return res.status(404).json({ message: "Find not found" });
      }

      res.json(find);
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({ message: "Failed to fetch request" });
    }
  });

  // Finder-specific routes
  app.get("/api/finder/finds", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can browse finds" });
      }

      const finds = await storage.getAvailableFindsForFinders();
      res.json(finds);
    } catch (error) {
      console.error('Finder finds error:', error);
      res.status(500).json({ message: "Failed to fetch finds" });
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

      const findertokenBalance = await storage.getFindertokenBalance(finder.id);
      const proposals = await storage.getProposalsByFinderId(finder.id);
      const recentFinds = await storage.getAllActiveFinds();

      res.json({
        finder,
        findertokenBalance: findertokenBalance?.balance ?? 0,
        proposalsCount: proposals.length,
        availableFinds: recentFinds.length
      });
    } catch (error) {
      console.error('Finder dashboard error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Client-specific routes
  app.get("/api/client/finds", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view their finds" });
      }

      const finds = await storage.getFindsByClientId(req.user.userId);
      res.json(finds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your finds" });
    }
  });

  // Alias for frontend compatibility
  app.get("/api/client/finds", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view their finds" });
      }

      const finds = await storage.getFindsByClientId(req.user.userId);
      res.json(finds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your finds" });
    }
  });

  app.post("/api/client/finds", authenticateToken, upload.array('attachments', 5), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can create finds" });
      }

      // Get uploaded file paths
      const files = req.files as Express.Multer.File[];
      const attachmentPaths = files ? files.map(file => `/uploads/${file.filename}`) : [];

      const requestData = insertFindSchema.parse({
        ...req.body,
        clientId: req.user.userId,
        attachments: attachmentPaths
      });

      const request = await storage.createFind(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create find", error: error.message });
    }
  });

  // Alias for frontend compatibility
  app.post("/api/client/finds", authenticateToken, upload.array('attachments', 5), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can create finds" });
      }

      // Get uploaded file paths
      const files = req.files as Express.Multer.File[];
      const attachmentPaths = files ? files.map(file => `/uploads/${file.filename}`) : [];

      const requestData = insertFindSchema.parse({
        ...req.body,
        clientId: req.user.userId,
        attachments: attachmentPaths
      });

      const request = await storage.createFind(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create find", error: error.message });
    }
  });

  app.get("/api/client/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view proposals" });
      }

      const proposals = await storage.getProposalsForClient(req.user.userId);
      res.json(proposals);
    } catch (error) {
      console.error('Failed to fetch client proposals:', error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.post("/api/finds", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can create finds" });
      }

      const requestData = insertFindSchema.parse({
        ...req.body,
        clientId: req.user.userId
      });

      const request = await storage.createFind(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create find", error: error.message });
    }
  });

  app.get("/api/finds/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view their finds" });
      }

      const finds = await storage.getFindsByClientId(req.user.userId);
      res.json(finds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your finds" });
    }
  });

  app.get("/api/finds/:id/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const request = await storage.getFind(id);
      
      if (!request) {
        return res.status(404).json({ message: "Find not found" });
      }

      // Only the client who posted the request can view ALL proposals
      if (req.user.role === 'client' && request.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // If finder is accessing, they should use /finder/finds/:id/proposals instead
      if (req.user.role === 'finder') {
        return res.status(403).json({ message: "Finders should use finder-specific endpoints" });
      }

      const proposals = await storage.getProposalsByFindId(id);
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  // Finder-specific route to see only their own proposals for a request (like comments)
  app.get("/api/finder/finds/:id/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can use this endpoint" });
      }

      const request = await storage.getFind(id);
      if (!request) {
        return res.status(404).json({ message: "Find not found" });
      }

      // Get finder profile
      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      // Get only this finder's proposals for this request (like seeing only your own comments)
      const proposal = await storage.getProposalByFinderAndFind(finder.id, id);
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
      const hasAccepted = await storage.hasAcceptedProposal(proposalData.findId);
      if (hasAccepted) {
        return res.status(400).json({ message: "This request has already been accepted by another finder" });
      }

      // Check if this finder has already submitted a proposal for this request
      const existingProposal = await storage.getProposalByFinderAndFind(finder.id, proposalData.findId);
      if (existingProposal) {
        return res.status(400).json({ message: "You have already submitted a proposal for this request" });
      }

      // Check findertoken balance
      const findertokenBalance = await storage.getFindertokenBalance(finder.id);
      if (!findertokenBalance || (findertokenBalance.balance ?? 0) < 1) {
        return res.status(400).json({ message: "Insufficient findertokens to submit proposal" });
      }

      const proposal = await storage.createProposal(proposalData);

      // Deduct findertoken
      await storage.updateFindertokenBalance(finder.id, (findertokenBalance.balance ?? 0) - 1);
      
      // Record transaction
      await storage.createTransaction({
        userId: req.user.userId,
        finderId: finder.id,
        amount: -1,
        type: 'proposal',
        description: `Proposal submitted for request: ${proposal.findId}`
      });

      // Send email notification to client about new proposal
      try {
        const request = await storage.getFind(proposal.findId);
        if (request) {
          const clientUser = await storage.getUser(request.clientId);
          const finderUser = await storage.getUser(req.user.userId);
          
          if (clientUser && finderUser) {
            await emailService.notifyClientNewProposal(
              clientUser.email,
              `${finderUser.firstName} ${finderUser.lastName}`,
              request.title,
              proposal.price.toString()
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send new proposal notification email:', emailError);
      }

      res.status(201).json(proposal);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to submit proposal", error: error.message });
    }
  });

  app.get("/api/proposals/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const proposalWithDetails = await storage.getProposalWithDetails(id);
      
      if (!proposalWithDetails) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Authorization: only the finder who submitted it or the client who owns the request can view it
      if (req.user.role === 'finder') {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder || proposalWithDetails.finderId !== finder.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (req.user.role === 'client') {
        const request = await storage.getFind(proposalWithDetails.findId);
        if (!request || request.clientId !== req.user.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(proposalWithDetails);
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

  // Finder contracts endpoint
  app.get("/api/finder/contracts", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can view their contracts" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const contracts = await storage.getContractsByFinderId(finder.id);
      res.json(contracts);
    } catch (error) {
      console.error('Failed to fetch finder contracts:', error);
      res.status(500).json({ message: "Failed to fetch your contracts" });
    }
  });

  app.get("/api/finder/contracts/:contractId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders can view their contracts" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const { contractId } = req.params;
      const contractDetails = await storage.getContractDetails(contractId, finder.id);
      
      if (!contractDetails) {
        return res.status(404).json({ message: "Contract not found" });
      }

      res.json(contractDetails);
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
      res.status(500).json({ message: "Failed to fetch contract details" });
    }
  });

  app.post("/api/proposals/:id/accept", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const proposal = await storage.getProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const request = await storage.getFind(proposal.findId);
      if (!request || request.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get finder and client details for email notification
      const finder = await storage.getFinder(proposal.finderId);
      const finderUser = finder ? await storage.getUser(finder.userId) : null;
      const clientUser = await storage.getUser(request.clientId);

      // Update proposal status
      await storage.updateProposal(id, { status: 'accepted' });

      // Create contract
      const contract = await storage.createContract({
        findId: proposal.findId,
        proposalId: proposal.id,
        clientId: request.clientId,
        finderId: proposal.finderId,
        amount: proposal.price,
        escrowStatus: 'held'
      });

      // Update request status to in progress
      await storage.updateFind(proposal.findId, { status: 'in progress' });

      // Send email notification to finder about being hired
      if (finderUser && clientUser) {
        try {
          await emailService.notifyFinderHired(
            finderUser.email,
            `${clientUser.firstName} ${clientUser.lastName}`,
            request.title,
            proposal.price.toString()
          );
        } catch (emailError) {
          console.error('Failed to send hire notification email:', emailError);
        }
      }

      res.json({ proposal, contract });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept proposal" });
    }
  });

  // Support ticket submission endpoint
  app.post("/api/support/tickets", async (req: Find, res: Response) => {
    try {
      const { name, email, category, priority, subject, message } = req.body;
      
      // In a real application, you would save this to a database or send to a support system
      console.log('Support ticket submitted:', { name, email, category, priority, subject, message });
      
      // For now, just return success
      res.json({ 
        success: true, 
        ticketId: `TICKET-${Date.now()}`,
        message: "Support ticket submitted successfully" 
      });
    } catch (error) {
      console.error('Failed to submit support ticket:', error);
      res.status(500).json({ message: "Failed to submit support ticket" });
    }
  });

  // Token packages endpoint
  app.get("/api/findertokens/packages", (req: Find, res: Response) => {
    res.json(TOKEN_PACKAGES);
  });

  // Initialize payment endpoint
  app.post("/api/payments/initialize", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { packageId } = req.body;
      
      const paystackService = new PaystackService();
      const selectedPackage = TOKEN_PACKAGES.find((pkg: any) => pkg.id === packageId);
      
      if (!selectedPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const reference = paystackService.generateTransactionReference(req.user.userId);
      
      const transaction = await paystackService.initializeTransaction(
        user.email,
        selectedPackage.price,
        reference,
        {
          userId: req.user.userId,
          packageId: packageId,
          tokens: selectedPackage.tokens
        }
      );

      res.json(transaction);
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // Payment webhook endpoint
  app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), async (req: Find, res: Response) => {
    try {
      const paystackService = new PaystackService();
      
      const signature = req.headers['x-paystack-signature'] as string;
      const payload = req.body.toString();
      
      if (!paystackService.verifyWebhookSignature(payload, signature)) {
        return res.status(400).send('Invalid signature');
      }

      const event = JSON.parse(payload);
      
      if (event.event === 'charge.success') {
        const { reference, metadata } = event.data;
        const { userId, tokens } = metadata;
        
        // Update user's findertoken balance
        const finder = await storage.getFinderByUserId(userId);
        if (finder) {
          const currentBalance = finder.findertokenBalance || 0;
          await storage.updateFinder(finder.id, {
            findertokenBalance: currentBalance + tokens
          });

          // Create transaction record
          await storage.createTransaction({
            userId: userId,
            type: 'findertoken_purchase',
            amount: tokens,
            description: `Findertoken purchase - ${tokens} findertokens`,
            reference: reference
          });
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error processing webhook');
    }
  });

  // Payment verification endpoint
  app.get("/api/payments/verify/:reference", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reference } = req.params;
      
      const paystackService = new PaystackService();
      const transaction = await paystackService.verifyTransaction(reference);
      
      if (transaction.status === 'success' && transaction.metadata.userId === req.user.userId) {
        const { tokens } = transaction.metadata;
        
        // Update user's findertoken balance
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (finder) {
          const currentBalance = finder.findertokenBalance || 0;
          await storage.updateFinder(finder.id, {
            findertokenBalance: currentBalance + tokens
          });

          // Create transaction record
          await storage.createTransaction({
            userId: req.user.userId,
            type: 'findertoken_purchase',
            amount: tokens,
            description: `Findertoken purchase - ${tokens} findertokens`,
            reference: reference
          });
        }
      }
      
      res.json(transaction);
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Client-specific contracts endpoint  
  app.get("/api/client/contracts", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view contracts" });
      }

      const contracts = await storage.getContractsByClientId(req.user.userId);
      res.json(contracts);
    } catch (error) {
      console.error('Failed to fetch client contracts:', error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Get specific contract details for client
  app.get("/api/client/contracts/:contractId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view contract details" });
      }

      const { contractId } = req.params;
      const contracts = await storage.getContractsByClientId(req.user.userId);
      const contract = contracts.find(c => c.id === contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found or access denied" });
      }

      res.json(contract);
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
      res.status(500).json({ message: "Failed to fetch contract details" });
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

  // Findertoken routes
  app.get("/api/findertokens/balance", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Only finders have findertoken balances" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const findertokenBalance = await storage.getFindertokenBalance(finder.id);
      res.json(findertokenBalance || { balance: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch findertoken balance" });
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

  // Public categories endpoint for forms
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getActiveCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin routes
  app.get("/api/admin/finder-profile/:userId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const finder = await storage.getFinderByUserId(userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder not found" });
      }

      const user = await storage.getUser(userId);
      res.json({ ...finder, user });
    } catch (error) {
      console.error('Failed to fetch finder profile:', error);
      res.status(500).json({ message: "Failed to fetch finder profile" });
    }
  });

  app.get("/api/admin/finds", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const finds = await storage.getAllFinds();
      res.json(finds);
    } catch (error) {
      console.error('Failed to fetch admin finds:', error);
      res.status(500).json({ message: "Failed to fetch finds" });
    }
  });

  app.get("/api/admin/proposals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const proposals = await storage.getAllProposals();
      res.json(proposals);
    } catch (error) {
      console.error('Failed to fetch admin proposals:', error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

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

  // File upload routes for messaging
  app.post("/api/messages/upload", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Failed to get upload URL:', error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.post("/api/messages/attach", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fileUrl, fileName } = req.body;
      
      if (!fileUrl || !fileName) {
        return res.status(400).json({ message: "File URL and name are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        fileUrl,
        {
          owner: req.user.id,
          visibility: "private", // Message attachments are private
        }
      );

      res.json({ 
        objectPath,
        fileName,
        success: true
      });
    } catch (error) {
      console.error('Failed to set file ACL:', error);
      res.status(500).json({ message: "Failed to process file attachment" });
    }
  });

  // Serve private message attachments
  app.get("/objects/:objectPath(*)", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Check if user can access this file
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: req.user.id,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "File not found" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Upload endpoint for messages
  app.post("/api/messages/upload", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Process attachment after upload
  app.post("/api/messages/attach", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { fileUrl, fileName } = req.body;
      
      if (!fileUrl || !fileName) {
        return res.status(400).json({ message: "File URL and name are required" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Normalize the object path and set ACL policy
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(fileUrl, {
        owner: req.user.id,
        visibility: "private", // Message attachments are private
        aclRules: [] // Only sender and receiver can access
      });

      res.json({
        success: true,
        objectPath,
        fileName
      });
    } catch (error) {
      console.error("Error processing attachment:", error);
      res.status(500).json({ message: "Failed to process attachment" });
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
      const { content, attachmentPaths, attachmentNames } = req.body;

      if ((!content || content.trim().length === 0) && (!attachmentPaths || attachmentPaths.length === 0)) {
        return res.status(400).json({ message: "Message content or attachments are required" });
      }

      // Get conversation details for email notification
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const message = await storage.createMessage({
        conversationId,
        senderId: req.user.userId,
        content: content ? content.trim() : '',
        attachmentPaths: attachmentPaths || [],
        attachmentNames: attachmentNames || []
      });

      // Send email notification to the recipient
      try {
        const senderUser = await storage.getUser(req.user.userId);
        const proposal = await storage.getProposal(conversation.proposalId);
        const request = proposal ? await storage.getFind(proposal.findId) : null;

        if (senderUser && request) {
          // Determine recipient based on sender role
          let recipientUserId: string;
          if (req.user.role === 'client') {
            // Client is sending message to finder
            const finder = await storage.getFinder(conversation.finderId);
            if (finder) {
              recipientUserId = finder.userId;
              const finderUser = await storage.getUser(recipientUserId);
              if (finderUser) {
                await emailService.notifyFinderNewMessage(
                  finderUser.email,
                  `${senderUser.firstName} ${senderUser.lastName}`,
                  request.title
                );
              }
            }
          } else if (req.user.role === 'finder') {
            // Finder is sending message to client
            recipientUserId = conversation.clientId;
            const clientUser = await storage.getUser(recipientUserId);
            if (clientUser) {
              await emailService.notifyClientNewMessage(
                clientUser.email,
                `${senderUser.firstName} ${senderUser.lastName}`,
                request.title
              );
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send message notification email:', emailError);
      }

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

      const withdrawals = await storage.getWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawal finds" });
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

      const withdrawal = await storage.updateWithdrawal(id, {
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

      const withdrawal = await storage.createWithdrawal({
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
      
      // Calculate completed jobs from contracts
      const completedContracts = await storage.getCompletedContractsByFinder(finder.id);
      
      res.json({
        ...finder,
        completedJobs: completedContracts.length,
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

  // Blog Posts routes
  app.get("/api/admin/blog-posts", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog-posts", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Add authorId to request body before validation
      const userId = req.user.userId;
      
      const requestWithAuthor = {
        ...req.body,
        authorId: userId
      };
      
      const blogPostData = insertBlogPostSchema.parse(requestWithAuthor);
      
      const post = await storage.createBlogPost({
        ...blogPostData,
        publishedAt: blogPostData.isPublished ? new Date() : null
      });

      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create blog post", error: error.message });
    }
  });

  // Get single blog post
  app.get("/api/admin/blog-posts/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const post = await storage.getBlogPost(id);

      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to fetch blog post", error: error.message });
    }
  });

  // Update blog post
  app.put("/api/admin/blog-posts/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const userId = req.user.userId;
      
      const requestWithAuthor = {
        ...req.body,
        authorId: userId
      };
      
      const blogPostData = insertBlogPostSchema.parse(requestWithAuthor);
      
      const post = await storage.updateBlogPost(id, {
        ...blogPostData,
        publishedAt: blogPostData.isPublished ? new Date() : null
      });

      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update blog post", error: error.message });
    }
  });

  app.delete("/api/admin/blog-posts/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteBlogPost(id);

      if (!deleted) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json({ message: "Blog post deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to delete blog post", error: error.message });
    }
  });

  // Public blog post route (by slug)
  app.get("/api/blog/:slug", async (req: Find, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);

      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Only return published posts for public access
      if (!post.isPublished) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to fetch blog post", error: error.message });
    }
  });

  // Order submission routes
  app.post('/api/orders/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }

      const submissionData = insertOrderSubmissionSchema.parse({
        ...req.body,
        finderId: finder.id
      });

      const submission = await storage.createOrderSubmission(submissionData);
      
      // Send email notification to client about order submission
      try {
        const contract = await storage.getContract(submissionData.contractId);
        if (contract) {
          const clientUser = await storage.getUser(contract.clientId);
          const finderUser = await storage.getUser(req.user.userId);
          const proposal = await storage.getProposal(contract.proposalId);
          const request = proposal ? await storage.getFind(proposal.findId) : null;
          
          if (clientUser && finderUser && request) {
            await emailService.notifyClientOrderSubmission(
              clientUser.email,
              `${finderUser.firstName} ${finderUser.lastName}`,
              request.title
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send order submission notification email:', emailError);
      }
      
      res.status(201).json(submission);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      res.status(400).json({ message: 'Failed to submit order', error: error.message });
    }
  });

  app.get('/api/orders/contract/:contractId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contractId } = req.params;
      
      const contractWithSubmission = await storage.getContractWithSubmission(contractId);
      if (!contractWithSubmission) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // Check if user has access to this contract
      if (req.user.role === 'finder') {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder || contractWithSubmission.finderId !== finder.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else if (req.user.role === 'client') {
        if (contractWithSubmission.clientId !== req.user.userId) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(contractWithSubmission);
    } catch (error: any) {
      console.error('Error fetching contract with submission:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/orders/submission/:submissionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: 'Access denied. Client role required.' });
      }

      const { submissionId } = req.params;
      const { status, clientFeedback } = req.body;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be "accepted" or "rejected"' });
      }

      const updatedSubmission = await storage.updateOrderSubmission(submissionId, {
        status,
        clientFeedback
      });

      if (!updatedSubmission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // Send email notification to finder about submission status
      try {
        const contract = await storage.getContract(updatedSubmission.contractId);
        if (contract) {
          const finder = await storage.getFinder(contract.finderId);
          const finderUser = finder ? await storage.getUser(finder.userId) : null;
          const clientUser = await storage.getUser(req.user.userId);
          const proposal = await storage.getProposal(contract.proposalId);
          const request = proposal ? await storage.getFind(proposal.findId) : null;

          if (finderUser && clientUser && request) {
            if (status === 'accepted') {
              await emailService.notifyFinderSubmissionApproved(
                finderUser.email,
                `${clientUser.firstName} ${clientUser.lastName}`,
                request.title,
                contract.amount.toString()
              );
            } else if (status === 'rejected') {
              await emailService.notifyFinderSubmissionRejected(
                finderUser.email,
                `${clientUser.firstName} ${clientUser.lastName}`,
                request.title,
                clientFeedback || 'No specific feedback provided'
              );
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send submission status notification email:', emailError);
      }

      res.json(updatedSubmission);
    } catch (error: any) {
      console.error('Error updating submission:', error);
      res.status(400).json({ message: 'Failed to update submission', error: error.message });
    }
  });

  // Object storage routes for file uploads
  app.post('/api/objects/upload', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ message: 'Failed to get upload URL', error: error.message });
    }
  });

  app.get('/objects/:objectPath(*)', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: req.user.userId,
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error('Error accessing object:', error);
      if (error.name === 'ObjectNotFoundError') {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put('/api/objects/acl', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { objectURL, visibility = 'private' } = req.body;
      
      if (!objectURL) {
        return res.status(400).json({ error: 'objectURL is required' });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(objectURL, {
        owner: req.user.userId,
        visibility
      });

      res.json({ objectPath });
    } catch (error: any) {
      console.error('Error setting object ACL:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
