import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUserSchema, insertFindSchema, insertProposalSchema, insertReviewSchema, insertMessageSchema, insertBlogPostSchema, insertOrderSubmissionSchema, type Find, finders, faqs } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
// Payment service imports removed - Paystack and Opay services disabled
import { FlutterwaveService, FLUTTERWAVE_TOKEN_PACKAGES } from "./flutterwaveService";

// Paystack and Opay services successfully removed - Flutterwave-only payment processing
import { emailService } from "./emailService";
import { strikeService } from "./strikeService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// --- Middleware ---
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

// Dummy requireAuth and requireAdmin functions for the sake of compilation,
// assuming they are defined elsewhere and handle authentication and authorization.
// In a real application, these would be properly implemented middleware.
const requireAuth = authenticateToken;
async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
}
// --- End Middleware ---

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


export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // --- Authentication Routes ---
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

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      console.log(`Password reset requested for email: ${email}`);

      // Check if user exists
      const user = await storage.getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        console.log(`No user found for email: ${email}`);
        return res.json({ message: "If an account with that email exists, we've sent you a password reset link." });
      }

      console.log(`User found: ${user.id} - ${user.firstName} ${user.lastName}`);

      // Generate reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
      console.log(`Generated reset link: ${resetLink}`);

      // Send reset email
      try {
        const emailSent = await emailService.sendPasswordResetEmail(user.email, `${user.firstName} ${user.lastName}`, resetLink);

        if (!emailSent) {
          console.error('Email service returned false for password reset email');
          return res.status(500).json({ message: "Failed to send reset email. Please check your email configuration." });
        }

        console.log(`Password reset email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({ message: "Failed to send reset email. Please check your email configuration." });
      }

      res.json({ message: "If an account with that email exists, we've sent you a password reset link." });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Verify reset token
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type');
        }
      } catch (jwtError) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Get user and update password
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.updateUser(decoded.userId, { password: hashedPassword });

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/auth/change-password", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
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
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password using updateUser method
      await storage.updateUser(req.user.userId, { password: hashedNewPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // --- Finder Routes ---
  app.get("/api/finder/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'finder') {
        return res.status(403).json({ message: "Access denied. Only finders can access this endpoint." });
      }

      const finder = await storage.getFinderByUserId(user.id);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      res.json({
        ...finder,
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error('Get finder profile error:', error);
      res.status(500).json({ message: "Failed to get finder profile" });
    }
  });

  app.patch("/api/finder/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bio, category, skills, availability } = req.body;

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'finder') {
        return res.status(403).json({ message: "Access denied. Only finders can update their profile." });
      }

      const finder = await storage.getFinderByUserId(user.id);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      // Update finder profile
      const updatedFinder = await storage.updateFinder(finder.id, {
        bio,
        category,
        skills,
        availability
      });

      if (!updatedFinder) {
        return res.status(404).json({ message: "Failed to update finder profile" });
      }

      res.json({ 
        message: "Profile updated successfully",
        profile: updatedFinder
      });
    } catch (error) {
      console.error('Update finder profile error:', error);
      res.status(500).json({ message: "Failed to update finder profile" });
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

  // --- Find Routes ---
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

  // --- Client Routes ---
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

      console.log('Create find request body:', req.body);
      console.log('Create find files:', req.files);

      // Get admin settings for high budget posting
      const settings = await storage.getAdminSettings();
      const highBudgetThreshold = parseInt(settings.highBudgetThreshold || "100000");
      const highBudgetTokenCost = parseInt(settings.highBudgetTokenCost || "5");

      // Check if this is a high budget request
      const maxBudget = parseInt(req.body.budgetMax || "0");
      const isHighBudget = maxBudget >= highBudgetThreshold;

      // If high budget, check if client has enough findertokens
      if (isHighBudget) {
        const client = await storage.getClientProfile(req.user.userId);
        if (!client) {
          return res.status(404).json({ message: "Client profile not found" });
        }

        const clientBalance = client.findertokenBalance || 0;
        if (clientBalance < highBudgetTokenCost) {
          return res.status(400).json({ 
            message: `Insufficient findertokens. You need ${highBudgetTokenCost} findertokens for high-budget postings but only have ${clientBalance}. Please purchase findertokens to post this find.`,
            requiredTokens: highBudgetTokenCost,
            currentBalance: clientBalance,
            needsToPurchaseTokens: true,
            purchaseUrl: "/client/tokens"
          });
        }
      }

      // Get uploaded file paths
      const files = req.files as Express.Multer.File[];
      const attachmentPaths = files ? files.map(file => `/uploads/${file.filename}`) : [];

      // Check for restricted words in title and description
      const contentToCheck = `${req.body.title || ''} ${req.body.description || ''}`;
      const flaggedWords = await storage.checkContentForRestrictedWords(contentToCheck);

      const requestData = insertFindSchema.parse({
        ...req.body,
        clientId: req.user.userId,
        attachments: attachmentPaths,
        status: flaggedWords.length > 0 ? 'under_review' : 'open',
        flaggedWords: flaggedWords.length > 0 ? flaggedWords : undefined,
        reviewReason: flaggedWords.length > 0 ? `Find contains restricted words: ${flaggedWords.join(', ')}` : undefined,
        isHighBudget: isHighBudget
      });

      const request = await storage.createFind(requestData);

      // If high budget, deduct findertokens
      if (isHighBudget) {
        await storage.deductClientFindertokens(req.user.userId, highBudgetTokenCost, `High-budget find posting: ${request.title}`);
      }

      // If flagged, notify the client that their find is under review
      if (flaggedWords.length > 0) {
        return res.status(202).json({
          ...request,
          message: "Your find has been submitted for review due to content restrictions and will be published once approved by our admin team."
        });
      }

      const responseMessage = isHighBudget 
        ? `Find posted successfully! ${highBudgetTokenCost} findertokens have been deducted for this high-budget posting.`
        : "Find posted successfully!";

      res.status(201).json({
        ...request,
        message: responseMessage
      });
    } catch (error: any) {
      console.error('Create find error:', error);
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

  app.get("/api/client/transactions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view transactions" });
      }

      const transactions = await storage.getTransactionsByUserId(req.user.userId);
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch client transactions:', error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/client/balance", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can view balance" });
      }

      const client = await storage.getClientProfile(req.user.userId);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      res.json({ 
        balance: client.findertokenBalance || 0 
      });
    } catch (error) {
      console.error('Failed to fetch client balance:', error);
      res.status(500).json({ message: "Failed to fetch balance" });
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

  // --- Proposal Routes ---
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
      const tokenCost = await storage.getAdminSetting('proposal_token_cost');
      const requiredTokens = parseInt(tokenCost?.value || '1');

      if ((finder.findertokenBalance ?? 0) < requiredTokens) {
        return res.status(400).json({ message: `Insufficient findertokens to submit proposal. Required: ${requiredTokens}, Available: ${finder.findertokenBalance ?? 0}` });
      }

      const proposal = await storage.createProposal(proposalData);

      // Deduct findertoken - update finder balance directly  
      const newBalance = (finder.findertokenBalance ?? 0) - requiredTokens;
      await storage.updateFinderTokenBalance(finder.id, newBalance);

      // Record transaction
      await storage.createTransaction({
        userId: req.user.userId,
        finderId: finder.id,
        amount: -requiredTokens,
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

  // --- Finder Contracts ---
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

      // Create contract with pending escrow status (payment required)
      const contract = await storage.createContract({
        findId: proposal.findId,
        proposalId: proposal.id,
        clientId: request.clientId,
        finderId: proposal.finderId,
        amount: proposal.price,
        escrowStatus: 'pending'
      });

      // Send email notification to finder about being hired (pending payment)
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

      res.json({ 
        success: true,
        message: "Proposal accepted and contract created. Please complete payment to start work.",
        proposal, 
        contract: {
          ...contract,
          findTitle: request.title,
          finderName: finderUser ? `${finderUser.firstName} ${finderUser.lastName}` : 'Unknown Finder'
        },
        payment: {
          required: true,
          amount: proposal.price,
          contractId: contract.id
        }
      });
    } catch (error) {
      console.error('Accept proposal error:', error);
      res.status(500).json({ message: "Failed to accept proposal and create contract" });
    }
  });

  // --- Support Ticket ---
  // Support ticket submission endpoint
  app.post("/api/support/tickets", async (req: Request, res: Response) => {
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

  // --- Contract Payment ---
  // Contract payment initialization endpoint
  app.post("/api/contracts/:contractId/payment", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contractId } = req.params;

      // Get contract details
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Verify user is the client for this contract
      if (contract.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if contract is already funded
      console.log(`Contract ${contractId} escrow status: ${contract.escrowStatus}`);
      if (contract.escrowStatus === 'funded' || contract.escrowStatus === 'held') {
        return res.status(400).json({ 
          message: "Contract is already funded",
          escrowStatus: contract.escrowStatus 
        });
      }

      // Get user details for payment
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Payment services have been removed
      return res.status(503).json({ 
        message: "Payment services are currently unavailable. Please contact support.",
        error: "Payment services removed"
      });

    } catch (error) {
      console.error('Contract payment initialization error:', error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // Flutterwave token packages endpoint
  app.get("/api/findertokens/flutterwave-packages", (req: Request, res: Response) => {
    res.json(FLUTTERWAVE_TOKEN_PACKAGES);
  });

  // Support ticket submission endpoint (duplicate - already defined above)
  // app.post("/api/support/tickets", async (req: Request, res: Response) => { ... });

  // Contract payment initialization endpoint (duplicate - already defined above)
  // app.post("/api/contracts/:contractId/payment", authenticateToken, async (req: AuthenticatedRequest, res: Response) => { ... });

  // Escrow payment verification endpoint
  app.post("/api/contracts/:contractId/verify-payment", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contractId } = req.params;
      const { reference } = req.body;

      // Get contract details
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Verify user is the client for this contract
      if (contract.clientId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify payment with Paystack
      const paystackService = new PaystackService(); // Assuming PaystackService is available
      const paymentData = await paystackService.verifyTransaction(reference);

      if (paymentData.status === 'success') {
        // Update contract escrow status to 'held'
        await storage.updateContract(contractId, { escrowStatus: 'held' });

        // Update the find status to 'in progress'
        await storage.updateFind(contract.findId, { status: 'in_progress' });

        // Send email notification to finder that work can begin
        try {
          const finder = await storage.getFinder(contract.finderId);
          const finderUser = finder ? await storage.getUser(finder.userId) : null;
          const clientUser = await storage.getUser(contract.clientId);
          const request = await storage.getFind(contract.findId);

          if (finderUser && clientUser && request) {
            await emailService.notifyFinderWorkCanBegin(
              finderUser.email,
              `${clientUser.firstName} ${clientUser.lastName}`,
              request.title,
              contract.amount.toString()
            );
          }
        } catch (emailError) {
          console.error('Failed to send work begin notification email:', emailError);
        }

        res.json({
          success: true,
          message: "Payment verified and escrow funded successfully. Work can now begin.",
          contract: { ...contract, escrowStatus: 'held' }
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed"
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Get contract payment status
  app.get("/api/contracts/:contractId/payment-status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contractId } = req.params;

      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Verify user has access to this contract
      if (contract.clientId !== req.user.userId && contract.finderId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({
        contractId: contract.id,
        escrowStatus: contract.escrowStatus,
        amount: contract.amount,
        paymentRequired: contract.escrowStatus === 'pending'
      });
    } catch (error) {
      console.error('Failed to get payment status:', error);
      res.status(500).json({ message: "Failed to get payment status" });
    }
  });

  // Token packages endpoint
  app.get("/api/findertokens/packages", (req: Request, res: Response) => {
    res.json(TOKEN_PACKAGES); // Assuming TOKEN_PACKAGES is defined elsewhere
  });

  // Opay token packages endpoint - REMOVED

  // FinderToken™ Purchase endpoint
  app.post("/api/tokens/purchase", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tokenAmount, amount } = req.body;

      if (!tokenAmount || !amount || tokenAmount <= 0 || amount <= 0) {
        return res.status(400).json({ message: "Invalid token amount or price" });
      }

      const paystackService = new PaystackService(); // Assuming PaystackService is available
      const user = await storage.getUser(req.user.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const reference = paystackService.generateTransactionReference(req.user.userId);

      // Create callback URL for after payment
      const callbackUrl = `${req.protocol}://${req.get('host')}/finder/payment-success?payment=success&reference=${reference}`;

      const transaction = await paystackService.initializeTransaction(
        user.email,
        amount, // Amount in naira
        reference,
        {
          userId: req.user.userId,
          tokens: tokenAmount,
          package_type: 'findertoken_special'
        },
        callbackUrl
      );

      res.json(transaction);
    } catch (error) {
      console.error('Token purchase initialization error:', error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // Initialize payment endpoint
  app.post("/api/payments/initialize", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { packageId } = req.body;

      const paystackService = new PaystackService(); // Assuming PaystackService is available
      const selectedPackage = TOKEN_PACKAGES.find((pkg: any) => pkg.id === packageId); // Assuming TOKEN_PACKAGES is defined

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

  // Initialize Opay payment endpoint - REMOVED

  // Check Flutterwave configuration
  app.get("/api/payments/flutterwave/config", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const flutterwaveService = new FlutterwaveService();
      res.json({ 
        isConfigured: flutterwaveService.isConfigured(),
        hasSecretKey: !!process.env.FLUTTERWAVE_SECRET_KEY,
        hasPublicKey: !!process.env.FLUTTERWAVE_PUBLIC_KEY
      });
    } catch (error) {
      console.error('Error checking Flutterwave configuration:', error);
      res.status(500).json({ message: "Failed to check Flutterwave configuration" });
    }
  });

  // Initialize Flutterwave payment endpoint
  app.post("/api/payments/flutterwave/initialize", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { packageId, phone, customerName } = req.body;

      const flutterwaveService = new FlutterwaveService();
      const selectedPackage = FLUTTERWAVE_TOKEN_PACKAGES.find((pkg: any) => pkg.id === packageId); // Assuming FLUTTERWAVE_TOKEN_PACKAGES is defined

      if (!selectedPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const reference = flutterwaveService.generateTransactionReference(req.user.userId);

      const transaction = await flutterwaveService.initializeTransaction(
        user.email,
        selectedPackage.price,
        reference,
        {
          userId: req.user.userId,
          packageId: packageId,
          tokens: selectedPackage.tokens,
          phone: phone,
          customerName: customerName || `${user.firstName} ${user.lastName}`
        }
      );

      res.json(transaction);
    } catch (error) {
      console.error('Flutterwave payment initialization error:', error);
      res.status(500).json({ message: "Failed to initialize Flutterwave payment" });
    }
  });

  // Client token purchase with Flutterwave
  app.post("/api/client/tokens/flutterwave/initialize", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can purchase tokens" });
      }

      const { packageId, phone, customerName } = req.body;
      const flutterwaveService = new FlutterwaveService();

      // Get token packages from storage instead of hardcoded packages
      const tokenPackages = await storage.getActiveTokenPackages();
      const selectedPackage = tokenPackages.find(pkg => pkg.id === packageId);

      if (!selectedPackage) {
        console.log('Available packages:', tokenPackages.map(p => ({ id: p.id, name: p.name })));
        console.log('Requested package ID:', packageId);
        return res.status(404).json({ message: "Package not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const reference = flutterwaveService.generateTransactionReference(req.user.userId);

      const transaction = await flutterwaveService.initializeTransaction(
        user.email,
        parseFloat(selectedPackage.price),
        reference,
        {
          userId: req.user.userId,
          packageId: packageId,
          tokens: selectedPackage.tokenCount,
          phone: phone,
          customerName: customerName || `${user.firstName} ${user.lastName}`,
          userRole: 'client'
        }
      );

      res.json(transaction);
    } catch (error) {
      console.error('Client Flutterwave payment initialization error:', error);
      res.status(500).json({ message: "Failed to initialize Flutterwave payment" });
    }
  });

  // Client token purchase verification
  app.get("/api/client/tokens/flutterwave/verify/:reference", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: "Only clients can verify token purchases" });
      }

      const { reference } = req.params;
      const flutterwaveService = new FlutterwaveService();

      const transaction = await flutterwaveService.verifyTransaction(reference);

      if (transaction.status === 'success') {
        // Check if transaction already processed
        const existingTransaction = await storage.getTransactionByReference(reference);

        if (!existingTransaction) {
          // For clients, we need to add to their findertoken balance
          // First check if they have a client profile or create one
          let client = await storage.getClientProfile(req.user.userId);

          // Get tokens from metadata or amount mapping
          const { getTokensFromAmount } = require('./flutterwaveService'); // Assuming this helper exists
          const tokens = transaction.metadata?.tokens || getTokensFromAmount(transaction.amount) || 10;

          // Add tokens to client balance
          await storage.addClientFindertokens(req.user.userId, tokens, `FinderToken™ purchase via Flutterwave - ${tokens} tokens`);

          // Create transaction record
          await storage.createTransaction({
            userId: req.user.userId,
            type: 'findertoken_purchase',
            amount: tokens,
            description: `FinderToken™ purchase via Flutterwave - ${tokens} tokens`,
            reference: reference
          });

          console.log(`Flutterwave client verification: Added ${tokens} tokens to client ${req.user.userId}`);
        } else {
          console.log(`Flutterwave client verification: Transaction ${reference} already processed`);
        }

        res.json({ 
          status: 'success', 
          data: transaction 
        });
      } else {
        res.json({ 
          status: 'failed', 
          message: 'Payment was not successful' 
        });
      }
    } catch (error) {
      console.error('Client Flutterwave payment verification error:', error);
      res.status(500).json({ message: "Failed to verify Flutterwave payment" });
    }
  });

  // Payment verification endpoint
  app.get("/api/payments/verify/:reference", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reference } = req.params;
      const paystackService = new PaystackService(); // Assuming PaystackService is available

      const transaction = await paystackService.verifyTransaction(reference);

      if (transaction.status === 'success') {
        const { metadata } = transaction;
        const { userId, tokens } = metadata;

        // Verify this transaction belongs to the requesting user
        if (userId !== req.user.userId) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Update user's findertoken balance if not already done
        const finder = await storage.getFinderByUserId(userId);
        if (finder) {
          // Check if transaction already processed
          const existingTransaction = await storage.getTransactionByReference(reference);

          if (!existingTransaction) {
            // Update balance and create transaction record
            const currentBalance = finder.findertokenBalance || 0;
            await storage.updateFinder(finder.id, {
              findertokenBalance: currentBalance + tokens
            });

            await storage.createTransaction({
              userId: userId,
              finderId: finder.id,
              type: 'findertoken_purchase',
              amount: tokens,
              description: `FinderToken™ purchase - ${tokens} tokens`,
              reference: reference
            });
          }
        }

        res.json({ 
          status: 'success', 
          data: transaction 
        });
      } else {
        res.json({ 
          status: 'failed', 
          message: 'Payment was not successful' 
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Flutterwave payment verification endpoint
  app.get("/api/payments/flutterwave/verify/:reference", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reference } = req.params;
      const flutterwaveService = new FlutterwaveService();

      const transaction = await flutterwaveService.verifyTransaction(reference);

      if (transaction.status === 'success') {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder) {
          return res.status(404).json({ message: "Finder profile not found" });
        }

        // Check if transaction already processed
        const existingTransaction = await storage.getTransactionByReference(reference);

        if (!existingTransaction) {
          // Import the helper function
          const { getTokensFromAmount } = require('./flutterwaveService'); // Assuming this helper exists

          // Determine tokens from the amount or metadata
          const tokens = transaction.metadata?.tokens || getTokensFromAmount(transaction.amount) || 10;

          // Update balance and create transaction record
          const currentBalance = finder.findertokenBalance || 0;
          await storage.updateFinder(finder.id, {
            findertokenBalance: currentBalance + tokens
          });

          await storage.createTransaction({
            userId: req.user.userId,
            finderId: finder.id,
            type: 'findertoken_purchase',
            amount: tokens,
            description: `FinderToken™ purchase via Flutterwave - ${tokens} tokens`,
            reference: reference
          });

          console.log(`Flutterwave verification: Added ${tokens} tokens to user ${req.user.userId}`);
        } else {
          console.log(`Flutterwave verification: Transaction ${reference} already processed`);
        }

        res.json({ 
          status: 'success', 
          data: transaction 
        });
      } else {
        res.json({ 
          status: 'failed', 
          message: 'Payment was not successful' 
        });
      }
    } catch (error) {
      console.error('Flutterwave payment verification error:', error);
      res.status(500).json({ message: "Failed to verify Flutterwave payment" });
    }
  });

  // Flutterwave webhook endpoint
  app.post("/api/payments/flutterwave/webhook", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    try {
      const flutterwaveService = new FlutterwaveService();

      const signature = req.headers['verif-hash'] as string;
      const payload = req.body.toString();

      if (!flutterwaveService.verifyWebhookSignature(payload, signature)) {
        console.log('Invalid Flutterwave webhook signature');
        return res.status(400).send('Invalid signature');
      }

      const event = JSON.parse(payload);

      if (event.event === 'charge.completed' && event.data.status === 'successful') {
        const { tx_ref, amount, meta } = event.data;
        const { userId, tokens } = meta || {};

        if (!userId || !tokens) {
          console.log('Missing userId or tokens in Flutterwave webhook metadata');
          return res.status(400).send('Missing required metadata');
        }

        // Check if transaction already processed
        const existingTransaction = await storage.getTransactionByReference(tx_ref);

        if (!existingTransaction) {
          const finder = await storage.getFinderByUserId(userId);
          if (finder) {
            const currentBalance = finder.findertokenBalance || 0;
            await storage.updateFinder(finder.id, {
              findertokenBalance: currentBalance + tokens
            });

            await storage.createTransaction({
              userId: userId,
              finderId: finder.id,
              type: 'findertoken_purchase',
              amount: tokens,
              description: `FinderToken™ purchase via Flutterwave - ${tokens} tokens`,
              reference: tx_ref
            });

            console.log(`Flutterwave webhook: Added ${tokens} tokens to user ${userId}`);
          } else {
            console.log(`Flutterwave webhook: Finder not found for user ${userId}`);
          }
        } else {
          console.log(`Flutterwave webhook: Transaction ${tx_ref} already processed`);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Flutterwave webhook error:', error);
      res.status(500).send('Error processing Flutterwave webhook');
    }
  });


  // --- Client Contracts ---
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

      // Check if already released
      if (contract.escrowStatus === 'released') {
        return res.status(400).json({ message: "Payment has already been released" });
      }

      await storage.updateContract(id, { escrowStatus: 'released' });

      // Release funds to finder's available balance
      await storage.releaseFundsToFinder(contract.finderId, contract.amount.toString());

      res.json({ message: "Payment released successfully" });
    } catch (error) {
      console.error('Release payment error:', error);
      res.status(500).json({ message: "Failed to release payment" });
    }
  });

  // --- Review Routes ---
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

  // --- Findertoken Routes ---
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

  // --- Public Categories ---
  // Public categories endpoint for forms
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getActiveCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // --- Admin Routes ---
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

  // Get finder profile by name slug (for name-based URLs)
  app.get("/api/admin/finder-profile/by-slug/:nameSlug", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { nameSlug } = req.params;

      // Extract the ID part from the name slug (last 8 characters)
      const match = nameSlug.match(/([a-f0-9]{8})$/);
      if (!match) {
        return res.status(400).json({ message: "Invalid name slug format" });
      }

      const idPrefix = match[1];

      // Get all users and find the one with matching ID prefix
      const users = await storage.getAllUsers();
      const user = users.find(u => u.id.startsWith(idPrefix));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the finder profile for this user
      const finder = await storage.getFinderByUserId(user.id);
      if (!finder) {
        return res.status(404).json({ message: "Finder not found" });
      }

      // Remove password from user data
      const { password, ...userWithoutPassword } = user;
      res.json({ ...finder, user: userWithoutPassword });
    } catch (error) {
      console.error('Error fetching finder profile by slug:', error);
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
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get specific user by ID (for admin profile viewing)
  app.get("/api/admin/users/:userId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user by name slug (for name-based URLs)
  app.get("/api/admin/users/by-slug/:nameSlug", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { nameSlug } = req.params;

      // Extract the ID part from the name slug (last 8 characters)
      const match = nameSlug.match(/([a-f0-9]{8})$/);
      if (!match) {
        return res.status(400).json({ message: "Invalid name slug format" });
      }

      const idPrefix = match[1];

      // Get all users and find the one with matching ID prefix
      const users = await storage.getAllUsers();
      const user = users.find(u => u.id.startsWith(idPrefix));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user by slug:', error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  // Upload endpoint for messages (duplicate - already defined above)
  // app.post("/api/messages/upload", authenticateToken, async (req: AuthenticatedRequest, res) => { ... });

  // Process attachment after upload (duplicate - already defined above)
  // app.post("/api/messages/attach", authenticateToken, async (req: AuthenticatedRequest, res) => { ... });

  // --- Messaging Routes ---
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

  // Get a specific conversation by ID
  app.get("/api/messages/conversations/:conversationId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { conversationId } = req.params;

      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // TODO: Add permission check to ensure user is part of the conversation

      res.json(conversation);
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ message: "Failed to fetch conversation" });
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
  app.post("/api/messages/conversations/:conversationId/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { content, attachmentPaths, attachmentNames, quotedMessageId } = req.body;

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
        attachmentNames: attachmentNames || [],
        quotedMessageId,
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

  // --- Financial Dashboard ---
  app.get("/api/admin/transactions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all transactions with user details
      const transactions = await storage.getAllTransactionsWithUsers();
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch admin transactions:', error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/contracts", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all contracts with client and finder details
      const contracts = await storage.getAllContractsWithUsers();
      res.json(contracts);
    } catch (error) {
      console.error('Failed to fetch admin contracts:', error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // --- Admin Management Routes ---
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

  // --- Token Package Admin Routes ---
  app.get("/api/admin/token-packages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tokenPackages = await storage.getAllTokenPackages();
      res.json(tokenPackages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token packages" });
    }
  });

  app.post("/api/admin/token-packages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, description, price, tokenCount, isActive = true } = req.body;

      // Input validation
      if (!name || !price || !tokenCount || price <= 0 || tokenCount <= 0) {
        return res.status(400).json({ message: "Name, price, and token count are required and must be positive" });
      }

      const tokenPackage = await storage.createTokenPackage({
        name,
        description,
        price: price.toString(),
        tokenCount,
        isActive
      });

      res.status(201).json(tokenPackage);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create token package", error: error.message });
    }
  });

  app.put("/api/admin/token-packages/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { name, description, price, tokenCount, isActive } = req.body;

      // Input validation
      if (price && price <= 0) {
        return res.status(400).json({ message: "Price must be positive" });
      }
      if (tokenCount && tokenCount <= 0) {
        return res.status(400).json({ message: "Token count must be positive" });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price) updates.price = price.toString();
      if (tokenCount) updates.tokenCount = tokenCount;
      if (isActive !== undefined) updates.isActive = isActive;

      const tokenPackage = await storage.updateTokenPackage(id, updates);

      if (!tokenPackage) {
        return res.status(404).json({ message: "Token package not found" });
      }

      res.json(tokenPackage);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update token package", error: error.message });
    }
  });

  app.delete("/api/admin/token-packages/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const success = await storage.deleteTokenPackage(id);

      if (!success) {
        return res.status(404).json({ message: "Token package not found" });
      }

      res.json({ message: "Token package deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to delete token package", error: error.message });
    }
  });

  // --- Public Token Packages ---
  // Public active token packages endpoint (for finders to purchase)
  app.get("/api/token-packages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only return active packages for finders to purchase
      const activePackages = await storage.getActiveTokenPackages();
      res.json(activePackages);
    } catch (error) {
      console.error('Error fetching active token packages:', error);
      res.status(500).json({ message: "Failed to fetch token packages" });
    }
  });

  // --- Token Purchase Payment Routes ---
  app.post("/api/payments/initialize-token-purchase", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { packageId } = req.body;

      if (!packageId) {
        return res.status(400).json({ message: "Package ID is required" });
      }

      // Get the token package
      const tokenPackage = await storage.getTokenPackage(packageId);
      if (!tokenPackage || !tokenPackage.isActive) {
        return res.status(404).json({ message: "Token package not found or inactive" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Initialize payment with Paystack
      const paymentService = new PaystackService(); // Assuming PaystackService is available
      const reference = paymentService.generateTransactionReference(user.id);

      const paymentData = await paymentService.initializeTransaction(
        user.email,
        parseFloat(tokenPackage.price),
        reference,
        {
          packageId: tokenPackage.id,
          tokenCount: tokenPackage.tokenCount,
          userId: user.id,
          type: 'token_purchase'
        }
      );

      res.json({
        success: true,
        paymentUrl: paymentData.authorization_url,
        reference: reference,
        amount: tokenPackage.price,
        tokenCount: tokenPackage.tokenCount
      });
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ message: "Failed to initialize payment", error: error.message });
    }
  });

  app.post("/api/payments/verify-token-purchase", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reference } = req.body;

      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
      }

      // Verify payment with Paystack
      const paymentService = new PaystackService(); // Assuming PaystackService is available
      const verification = await paymentService.verifyTransaction(reference);

      if (verification.status === 'success') {
        const metadata = verification.metadata;
        const finder = await storage.getFinderByUserId(req.user.userId);

        if (!finder) {
          return res.status(404).json({ message: "Finder profile not found" });
        }

        // Add tokens to finder balance
        await storage.updateFinderTokenBalance(finder.id, metadata.tokenCount);

        // Create transaction record
        await storage.createTransaction({
          userId: req.user.userId,
          finderId: finder.id,
          amount: metadata.tokenCount,
          type: 'findertoken_purchase',
          description: `Purchased ${metadata.tokenCount} findertokens`,
          reference: reference
        });

        res.json({
          success: true,
          message: "Payment verified and tokens added to your account",
          tokensAdded: metadata.tokenCount
        });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Failed to verify payment", error: error.message });
    }
  });

  // --- Finder Levels Admin Routes ---
  app.get("/api/admin/finder-levels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const levels = await storage.getFinderLevels();
      res.json(levels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finder levels" });
    }
  });

  app.post("/api/admin/finder-levels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      console.log('Creating finder level with data:', req.body);
      const level = await storage.createFinderLevel(req.body);
      console.log('Created finder level:', level);
      res.status(201).json(level);
    } catch (error: any) {
      console.error('Error creating finder level:', error);
      res.status(400).json({ message: "Failed to create finder level", error: error.message });
    }
  });

  app.put("/api/admin/finder-levels/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const level = await storage.updateFinderLevel(id, req.body);

      if (!level) {
        return res.status(404).json({ message: "Finder level not found" });
      }

      res.json(level);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update finder level", error: error.message });
    }
  });

  app.delete("/api/admin/finder-levels/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteFinderLevel(id);

      if (!deleted) {
        return res.status(404).json({ message: "Finder level not found" });
      }

      res.json({ message: "Finder level deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to delete finder level", error: error.message });
    }
  });

  app.post("/api/admin/calculate-finder-level/:finderId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { finderId } = req.params;
      const calculatedLevel = await storage.calculateFinderLevel(finderId);

      if (!calculatedLevel) {
        return res.status(404).json({ message: "Could not calculate level for this finder" });
      }

      // Auto-assign the calculated level
      await storage.assignFinderLevel(finderId, calculatedLevel.id);

      res.json({ message: "Finder level calculated and assigned", level: calculatedLevel });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to calculate finder level", error: error.message });
    }
  });

  // --- User Management Routes ---
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

  // --- Admin Settings Routes ---
  app.get("/api/admin/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const proposalTokenCost = await storage.getAdminSetting('proposal_token_cost');
      const findertokenPrice = await storage.getAdminSetting('findertoken_price');
      const platformFeePercentage = await storage.getAdminSetting('platform_fee_percentage');
      const clientPaymentChargePercentage = await storage.getAdminSetting('client_payment_charge_percentage');
      const finderEarningsChargePercentage = await storage.getAdminSetting('finder_earnings_charge_percentage');
      const highBudgetThreshold = await storage.getAdminSetting('high_budget_threshold');
      const highBudgetTokenCost = await storage.getAdminSetting('high_budget_token_cost');

      res.json({
        proposalTokenCost: proposalTokenCost?.value || '1',
        findertokenPrice: findertokenPrice?.value || '100', // Default 100 per token in kobo/cents
        platformFeePercentage: platformFeePercentage?.value || '10',
        clientPaymentChargePercentage: clientPaymentChargePercentage?.value || '2.5',
        finderEarningsChargePercentage: finderEarningsChargePercentage?.value || '5',
        highBudgetThreshold: highBudgetThreshold?.value || '100000',
        highBudgetTokenCost: highBudgetTokenCost?.value || '5'
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

      const { 
        proposalTokenCost, 
        findertokenPrice, 
        platformFeePercentage, 
        clientPaymentChargePercentage, 
        finderEarningsChargePercentage,
        highBudgetThreshold,
        highBudgetTokenCost
      } = req.body;

      if (proposalTokenCost !== undefined) {
        await storage.setAdminSetting('proposal_token_cost', proposalTokenCost.toString());
      }

      if (findertokenPrice !== undefined) {
        await storage.setAdminSetting('findertoken_price', findertokenPrice.toString());
      }

      if (platformFeePercentage !== undefined) {
        await storage.setAdminSetting('platform_fee_percentage', platformFeePercentage.toString());
      }

      if (clientPaymentChargePercentage !== undefined) {
        await storage.setAdminSetting('client_payment_charge_percentage', clientPaymentChargePercentage.toString());
      }

      if (finderEarningsChargePercentage !== undefined) {
        await storage.setAdminSetting('finder_earnings_charge_percentage', finderEarningsChargePercentage.toString());
      }

      if (highBudgetThreshold !== undefined) {
        await storage.setAdminSetting('high_budget_threshold', highBudgetThreshold.toString());
      }

      if (highBudgetTokenCost !== undefined) {
        await storage.setAdminSetting('high_budget_token_cost', highBudgetTokenCost.toString());
      }

      res.json({ message: "Settings updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update settings", error: error.message });
    }
  });

  // --- Token charge endpoints --- Admin can charge finders tokens
  app.post("/api/admin/charge-tokens", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { finderId, amount, reason } = req.body;

      if (!finderId || !amount || !reason) {
        return res.status(400).json({ message: "Finder ID, amount, and reason are required" });
      }

      // Get finder to verify they exist
      const finder = await storage.getFinder(finderId);
      if (!finder) {
        return res.status(404).json({ message: "Finder not found" });
      }

      // Charge tokens from finder's balance
      const success = await storage.chargeFinderTokens(finderId, Math.abs(amount), reason, req.user.userId);

      if (!success) {
        return res.status(400).json({ message: "Insufficient token balance" });
      }

      res.json({ message: "Tokens charged successfully" });
    } catch (error) {
      console.error('Charge tokens error:', error);
      res.status(500).json({ message: "Failed to charge tokens" });
    }
  });

  // Monthly token distribution - Admin can distribute monthly tokens to all finders
  app.post("/api/admin/distribute-monthly-tokens", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = await storage.distributeMonthlyTokens();

      res.json({
        message: "Monthly token distribution completed",
        distributed: result.distributed,
        alreadyDistributed: result.alreadyDistributed
      });
    } catch (error) {
      console.error('Monthly token distribution error:', error);
      res.status(500).json({ message: "Failed to distribute monthly tokens" });
    }
  });

  // Grant tokens to a specific user (finder or client)
  app.post("/api/admin/grant-tokens", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, userRole, amount, reason, finderId } = req.body;

      // Support both old API (finderId) and new API (userId + userRole)
      if (finderId && !userId) {
        // Legacy support for existing calls
        if (!finderId || !amount || !reason) {
          return res.status(400).json({ message: "Finder ID, amount, and reason are required" });
        }

        if (amount <= 0) {
          return res.status(400).json({ message: "Amount must be positive" });
        }

        // Verify finder exists
        const finder = await storage.getFinder(finderId);
        if (!finder) {
          return res.status(404).json({ message: "Finder not found" });
        }

        // Grant tokens to finder
        const grant = await storage.grantTokensToFinder(finderId, amount, reason, req.user.userId);

        return res.json({
          message: "Tokens granted successfully",
          grant
        });
      }

      // New API for both finders and clients
      if (!userId || !userRole || !amount || !reason) {
        return res.status(400).json({ message: "User ID, user role, amount, and reason are required" });
      }

      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }

      if (!['finder', 'client'].includes(userRole)) {
        return res.status(400).json({ message: "User role must be 'finder' or 'client'" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== userRole) {
        return res.status(400).json({ message: "User role mismatch" });
      }

      let grant;
      if (userRole === 'finder') {
        // Grant tokens to finder
        const finder = await storage.getFinderByUserId(userId);
        if (!finder) {
          return res.status(404).json({ message: "Finder profile not found" });
        }
        grant = await storage.grantTokensToFinder(finder.id, amount, reason, req.user.userId);
      } else {
        // Grant tokens to client
        grant = await storage.grantTokensToClient(userId, amount, reason, req.user.userId);
      }

      res.json({
        message: `Tokens granted successfully to ${userRole}`,
        grant
      });
    } catch (error) {
      console.error('Grant tokens error:', error);
      res.status(500).json({ message: "Failed to grant tokens" });
    }
  });

  // Get tokens grants history
  app.get("/api/admin/token-grants", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, finderId } = req.query;
      // Support both userId (new) and finderId (legacy) parameters
      const queryUserId = userId || finderId;
      const grants = await storage.getTokenGrants(queryUserId as string);

      res.json(grants);
    } catch (error) {
      console.error('Get token grants error:', error);
      res.status(500).json({ message: "Failed to fetch token grants" });
    }
  });

  // Get monthly distribution history
  app.get("/api/admin/monthly-distributions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const now = new Date();
      const month = parseInt(req.query.month as string) || (now.getMonth() + 1);
      const year = parseInt(req.query.year as string) || now.getFullYear();

      const distributions = await storage.getMonthlyDistributions(month, year);

      res.json(distributions);
    } catch (error) {
      console.error('Get monthly distributions error:', error);
      res.status(500).json({ message: "Failed to fetch monthly distributions" });
    }
  });

  // Sync token balances - Admin only
  app.post("/api/admin/sync-token-balances", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.syncFinderTokenBalances();

      res.json({ message: "Token balances synchronized successfully" });
    } catch (error) {
      console.error('Token balance sync error:', error);
      res.status(500).json({ message: "Failed to sync token balances" });
    }
  });

  // Get pricing info for token purchases
  app.get("/api/tokens/pricing", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const findertokenPrice = await storage.getAdminSetting('findertoken_price');
      const pricePerToken = parseFloat(findertokenPrice?.value || '100'); // Default 100 kobo per token

      res.json({
        pricePerToken, // in kobo/cents
        currency: 'NGN'
      });
    } catch (error) {
      console.error('Get pricing error:', error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // --- Withdrawal management routes ---
  app.get("/api/admin/withdrawals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const withdrawals = await storage.getWithdrawalRequests();
      res.json(withdrawals);
    } catch (error) {
      console.error('Withdrawals API error:', error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests", error: (error as Error).message });
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

      // If approved, deduct from finder balance - but check balance first
      if (status === 'approved') {
        const finder = await storage.getFinder(withdrawal.finderId);
        const currentBalance = parseFloat(finder?.availableBalance || '0');
        const withdrawalAmount = parseFloat(withdrawal.amount);

        if (finder && currentBalance >= withdrawalAmount) {
          // Deduct the withdrawal amount from available balance
          const newBalance = (currentBalance - withdrawalAmount).toFixed(2);
          await db.update(finders)
            .set({ availableBalance: newBalance })
            .where(eq(finders.id, withdrawal.finderId));
        } else {
          return res.status(400).json({ 
            message: "Cannot approve withdrawal: Insufficient finder balance",
            availableBalance: finder?.availableBalance,
            requestedAmount: withdrawal.amount
          });
        }
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

      const currentBalance = parseFloat(finder.availableBalance || '0');
      const requestedAmount = parseFloat(amount);

      if (requestedAmount > currentBalance) {
        return res.status(400).json({ 
          message: "Insufficient balance",
          availableBalance: currentBalance,
          requestedAmount: requestedAmount
        });
      }

      // Generate unique request ID
      const requestId = await storage.generateWithdrawalRequestId();

      const withdrawal = await storage.createWithdrawalRequest({
        requestId,
        finderId: finder.id,
        amount,
        paymentMethod,
        paymentDetails: JSON.stringify(paymentDetails),
        status: 'pending'
      });

      res.status(201).json({ message: "Withdrawal request submitted successfully", withdrawal });
    } catch (error: any) {
      console.error('Withdrawal request error:', error);
      res.status(400).json({ message: "Failed to submit withdrawal request", error: error.message });
    }
  });

  // Get finder pending earnings
  app.get('/api/finder/pending-earnings', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: "Access denied" });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: "Finder profile not found" });
      }

      const pendingEarnings = await storage.getFinderPendingEarnings(finder.id);

      // Get admin fee to calculate net earnings
      const finderEarningsCharge = await storage.getAdminSetting('finder_earnings_charge_percentage');
      const feePercentage = parseFloat(finderEarningsCharge?.value || '5');

      const grossAmount = pendingEarnings.pendingAmount;
      const feeAmount = grossAmount * (feePercentage / 100);
      const netAmount = grossAmount - feeAmount;

      res.json({
        grossAmount,
        feeAmount,
        netAmount,
        feePercentage,
        contractCount: pendingEarnings.contractCount
      });
    } catch (error) {
      console.error('Error fetching pending earnings:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Additional Finder Profile Management Routes ---
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

  app.get('/api/finder/security-settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'finder') {
        return res.status(403).json({ message: 'Access denied. Finder role required.' });
      }

      const finder = await storage.getFinderByUserId(req.user.userId);
      if (!finder) {
        return res.status(404).json({ message: 'Finder profile not found' });
      }

      const settings = await storage.getSecuritySettings(finder.id);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching security settings:', error);
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


  // --- Email system monitoring (Admin only) ---
  app.get("/api/admin/email-status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { emailQueue } = await import('./emailQueue'); // Assuming emailQueue is in './emailQueue'
      const status = emailQueue.getQueueStatus();

      // Check if logs directory exists and count recent emails
      const fs = require('fs').promises;
      const path = require('path');

      let recentEmails = 0;
      let failedEmails = 0;

      try {
        const emailsDir = path.join(process.cwd(), 'logs', 'emails');
        const failedDir = path.join(process.cwd(), 'logs', 'failed-emails');

        // Count recent emails (last 24 hours)
        try {
          const emailFiles = await fs.readdir(emailsDir);
          const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

          for (const file of emailFiles) {
            const filePath = path.join(emailsDir, file);
            const stats = await fs.stat(filePath);
            if (stats.mtime.getTime() > oneDayAgo) {
              recentEmails++;
            }
          }
        } catch (e) {
          // Directory doesn't exist yet
        }

        // Count failed emails
        try {
          const failedFiles = await fs.readdir(failedDir);
          failedEmails = failedFiles.length;
        } catch (e) {
          // Directory doesn't exist yet
        }

      } catch (error) {
        console.warn('Could not read email logs:', error);
      }

      res.json({
        queue: status,
        statistics: {
          recentEmails,
          failedEmails,
        },
        transportInfo: {
          configured: !!(process.env.SMTP_HOST || process.env.GMAIL_USER),
          type: process.env.SMTP_HOST ? 'SMTP' : process.env.GMAIL_USER ? 'Gmail' : 'Local/Development'
        }
      });
    } catch (error) {
      console.error('Email status error:', error);
      res.status(500).json({ message: "Failed to get email status" });
    }
  });

  // Test email endpoint (Admin only)
  app.post("/api/admin/test-email", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({ message: "To, subject, and message are required" });
      }

      const { emailQueue } = await import('./emailQueue'); // Assuming emailQueue is in './emailQueue'

      const emailId = await emailQueue.addToQueue({
        to,
        subject: subject || 'Test Email from FinderMeister',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Test Email</h2>
            <p>${message}</p>
            <p><small>Sent at: ${new Date().toISOString()}</small></p>
            <p>Best regards,<br>FinderMeister Email System</p>
          </div>
        `
      }, 'high');

      res.json({ 
        success: true, 
        message: "Test email queued successfully",
        emailId 
      });
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // --- Object Storage API ---
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // --- Blog Posts routes ---
  app.get("/api/admin/blog-posts", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetchblog posts" });
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
  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
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

  // --- Auto-release endpoint ---
  app.post("/api/orders/auto-release", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { autoReleaseService } = await import('./autoReleaseService'); // Assuming autoReleaseService is in './autoReleaseService'
      const result = await autoReleaseService.manualRelease();

      res.json({ 
        message: `Auto-release process completed: ${result.released} contracts released`,
        released: result.released 
      });
    } catch (error) {
      console.error('Auto-release error:', error);
      res.status(500).json({ message: "Failed to process auto-releases" });
    }
  });

  // Manual contract release endpoint
  app.post("/api/admin/contracts/:contractId/manual-release", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { contractId } = req.params;
      const { autoReleaseService } = await import('./autoReleaseService'); // Assuming autoReleaseService is in './autoReleaseService'

      const result = await autoReleaseService.manualRelease(contractId);
      res.json(result);
    } catch (error) {
      console.error('Manual release error:', error);
      res.status(500).json({ message: error.message || "Failed to release contract" });
    }
  });

  // --- Order submission routes ---
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

  // Review order submission (PUT /api/orders/submission/:submissionId)
  app.put('/api/orders/submission/:submissionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'client') {
        return res.status(403).json({ message: 'Access denied. Client role required.' });
      }

      const { submissionId } = req.params;
      const { status, clientFeedback } = req.body;

      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected".' });
      }

      const submission = await storage.updateOrderSubmission(submissionId, {
        status,
        clientFeedback
      });

      if (!submission) {
        return res.status(404).json({ message: 'Order submission not found' });
      }

      res.json(submission);
    } catch (error: any) {
      console.error('Error reviewing submission:', error);
      res.status(400).json({ message: 'Failed to review submission', error: error.message });
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

      if (!status || !['accepted', 'rejected'].includes(status)) {
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

  // --- Object storage routes for file uploads ---
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

  // --- Strike System Routes ---
  // Admin route to issue a strike
  app.post('/api/admin/strikes', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }

      const { userId, offenseType, evidence, userRole, contextId } = req.body;

      if (!userId || !offenseType || !evidence || !userRole) {
        return res.status(400).json({ message: 'userId, offenseType, evidence, and userRole are required' });
      }

      // Only clients and finders can receive strikes, not admins
      if (userRole === 'admin') {
        return res.status(400).json({ message: 'Strikes cannot be issued to admin users' });
      }

      if (userRole !== 'client' && userRole !== 'finder') {
        return res.status(400).json({ message: 'Strikes can only be issued to clients and finders' });
      }

      // Verify the user exists and has the correct role
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (targetUser.role !== userRole) {
        return res.status(400).json({ message: 'User role does not match specified role' });
      }

      const result = await strikeService.issueStrikeByOffense(
        userId,
        offenseType,
        evidence,
        req.user.userId,
        userRole,
        contextId
      );

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error issuing strike:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's strike information
  app.get('/api/users/:userId/strikes', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Users can only view their own strikes, or admins can view any
      if (req.user.role !== 'admin' && req.user.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const strikes = await storage.getStrikesByUserId(userId);
      const restrictions = await strikeService.getUserRestrictions(userId);

      res.json({ strikes, restrictions });
    } catch (error: any) {
      console.error('Error fetching strikes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Submit a dispute
  app.post('/api/strikes/:strikeId/dispute', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { strikeId } = req.params;
      const { description, evidence } = req.body;

      if (!description) {
        return res.status(400).json({ message: 'Description is required' });
      }

      const dispute = await strikeService.submitDispute(
        req.user.userId,
        strikeId,
        description,
        evidence
      );

      res.status(201).json(dispute);
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Submit a contract dispute
  app.post('/api/contracts/:contractId/dispute', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contractId } = req.params;
      const { description, evidence, type } = req.body;

      if (!description) {
        return res.status(400).json({ message: 'Description is required' });
      }

      if (!type) {
        return res.status(400).json({ message: 'Dispute type is required' });
      }

      // Verify the user has access to this contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // Check if user is either the client or finder on this contract
      const isClient = req.user.role === 'client' && contract.clientId === req.user.userId;
      const isContractFinder = req.user.role === 'finder';

      if (isContractFinder) {
        const finder = await storage.getFinderByUserId(req.user.userId);
        if (!finder || contract.finderId !== finder.id) {
          return res.status(403).json({ message: 'Access denied. You are not part of this contract.' });
        }
      } else if (!isClient) {
        return res.status(403).json({ message: 'Access denied. You are not part of this contract.' });
      }

      const dispute = await storage.createDispute({
        userId: req.user.userId,
        contractId: contractId,
        type: type, // 'contract_dispute' or 'payment_dispute'
        description,
        evidence: evidence || null
      });

      res.status(201).json(dispute);
    } catch (error: any) {
      console.error('Error submitting contract dispute:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin route to get all disputes
  app.get('/api/admin/disputes', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }

      const disputes = await storage.getAllDisputes();
      res.json(disputes);
    } catch (error: any) {
      console.error('Error fetching disputes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin route to update dispute status
  app.patch('/api/admin/disputes/:disputeId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }

      const { disputeId } = req.params;
      const updates = req.body;

      const dispute = await storage.updateDispute(disputeId, updates);
      res.json(dispute);
    } catch (error: any) {
      console.error('Error updating dispute:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get offense types for a role
  app.get('/api/offenses/:role', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      const { role } = req.params;
      const offenses = strikeService.getOffenseTypes(role);
      res.json(offenses);
    } catch (error: any) {
      console.error('Error fetching offense types:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin route to get strike statistics
  app.get('/api/admin/strike-stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      const stats = await strikeService.getStrikeStatistics();
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching strike statistics:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // --- Support Agent Management Routes ---
  app.get('/api/admin/support-agents', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const agents = await storage.getSupportAgents();
      res.json(agents);
    } catch (error: any) {
      console.error('Error fetching support agents:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/support-agents', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { 
        email, 
        firstName, 
        lastName, 
        department, 
        permissions, 
        maxTicketsPerDay, 
        responseTimeTarget, 
        specializations, 
        languages 
      } = req.body;

      if (!email || !firstName || !lastName || !department || !permissions) {
        return res.status(400).json({ message: 'Email, first name, last name, department, and permissions are required' });
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(email);

      if (user) {
        // Check if user is already a support agent
        const existingAgent = await storage.getUserSupportAgent(user.id);
        if (existingAgent) {
          return res.status(400).json({ message: "User is already a support agent" });
        }
      } else {
        // Create new user account for the support agent
        const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);

        user = await storage.createUser({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'admin' // Support agents get admin role for system access
        });
      }

      // Generate unique agent ID
      const agentId = await storage.generateAgentId();

      // Create support agent record
      const agent = await storage.createSupportAgent({
        userId: user.id,
        agentId,
        department,
        permissions: permissions || [],
        isActive: true,
        maxTicketsPerDay: maxTicketsPerDay || 20,
        responseTimeTarget: responseTimeTarget || 24,
        specializations: specializations || [],
        languages: languages || ['en'],
        assignedBy: req.user.userId
      });

      // Get the created agent with user details
      const agentWithUser = await storage.getSupportAgent(agent.id);

      res.status(201).json(agentWithUser);
    } catch (error: any) {
      console.error('Create support agent error:', error);
      res.status(500).json({ 
        message: "Failed to create support agent", 
        error: error.message 
      });
    }
  });

  app.get('/api/admin/support-agents/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const agent = await storage.getSupportAgent(id);

      if (!agent) {
        return res.status(404).json({ message: 'Support agent not found' });
      }

      res.json(agent);
    } catch (error: any) {
      console.error('Error fetching support agent:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/admin/support-agents/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.id;
      delete updates.userId;
      delete updates.agentId;
      delete updates.createdAt;
      delete updates.assignedBy;

      const agent = await storage.updateSupportAgent(id, updates);

      if (!agent) {
        return res.status(404).json({ message: 'Support agent not found' });
      }

      res.json(agent);
    } catch (error: any) {
      console.error('Error updating support agent:', error);
      res.status(500).json({ message: 'Failed to update support agent' });
    }
  });

  app.post('/api/admin/support-agents/:id/suspend', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: 'Suspension reason is required' });
      }

      const agent = await storage.suspendSupportAgent(id, reason);

      if (!agent) {
        return res.status(404).json({ message: 'Support agent not found' });
      }

      res.json({ message: 'Support agent suspended successfully', agent });
    } catch (error: any) {
      console.error('Error suspending support agent:', error);
      res.status(500).json({ message: 'Failed to suspend support agent' });
    }
  });

  app.post('/api/admin/support-agents/:id/reactivate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const agent = await storage.reactivateSupportAgent(id);

      if (!agent) {
        return res.status(404).json({ message: 'Support agent not found' });
      }

      res.json({ message: 'Support agent reactivated successfully', agent });
    } catch (error: any) {
      console.error('Error reactivating support agent:', error);
      res.status(500).json({ message: 'Failed to reactivate support agent' });
    }
  });

  app.delete('/api/admin/support-agents/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const success = await storage.deleteSupportAgent(id);

      if (!success) {
        return res.status(404).json({ message: 'Support agent not found' });
      }

      res.json({ message: 'Support agent deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting support agent:', error);
      res.status(500).json({ message: 'Failed to delete support agent' });
    }
  });

  // --- Support Department Management ---
  app.get('/api/admin/support-departments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const departments = await storage.getSupportDepartments();
      res.json(departments);
    } catch (error: any) {
      console.error('Error fetching support departments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/support-departments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { name, description, color, maxResponseTime } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Department name is required' });
      }

      const department = await storage.createSupportDepartment({
        name,
        description,
        color: color || '#3B82F6',
        maxResponseTime: maxResponseTime || 24,
        isActive: true,
        autoAssignments: true,
      });

      res.status(201).json(department);
    } catch (error: any) {
      console.error('Error creating support department:', error);
      res.status(500).json({ message: 'Failed to create support department' });
    }
  });

  // --- Restricted Words Management ---
  // Admin find status management
  app.put('/api/admin/finds/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['open', 'in_progress', 'completed', 'cancelled', 'under_review'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Get the find to ensure it exists
      const find = await storage.getFind(id);
      if (!find) {
        return res.status(404).json({ message: 'Find not found' });
      }

      // Update find status
      const updatedFind = await storage.updateFind(id, { status });
      res.json(updatedFind);
    } catch (error) {
      console.error('Error updating find status:', error);
      res.status(500).json({ message: 'Failed to update find status' });
    }
  });

  // --- Strike system endpoints ---
  app.get('/api/offenses/:role', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { role } = req.params;

      // Predefined offenses for different user roles
      const offenseTypes = {
        client: [
          { offense: 'Misleading Request Description', strikeLevel: 1, applicableRoles: ['client'], resolution: 'Warning and request clarification' },
          { offense: 'Inappropriate Content in Request', strikeLevel: 2, applicableRoles: ['client'], resolution: 'Content removal and warning' },
          { offense: 'Non-payment or Payment Disputes', strikeLevel: 2, applicableRoles: ['client'], resolution: 'Payment resolution required' },
          { offense: 'Harassment of Finders', strikeLevel: 3, applicableRoles: ['client'], resolution: 'Immediate account review' },
          { offense: 'Fraudulent Activity', strikeLevel: 3, applicableRoles: ['client'], resolution: 'Account suspension' }
        ],
        finder: [
          { offense: 'Low Quality or Incomplete Proposals', strikeLevel: 1, applicableRoles: ['finder'], resolution: 'Training and guidance provided' },
          { offense: 'Missing Deadlines Without Communication', strikeLevel: 1, applicableRoles: ['finder'], resolution: 'Communication improvement required' },
          { offense: 'Inappropriate Communication', strikeLevel: 2, applicableRoles: ['finder'], resolution: 'Communication standards training' },
          { offense: 'Delivering Substandard Work', strikeLevel: 2, applicableRoles: ['finder'], resolution: 'Quality standards review' },
          { offense: 'Fraudulent Claims or Credentials', strikeLevel: 3, applicableRoles: ['finder'], resolution: 'Account verification required' },
          { offense: 'Harassment of Clients', strikeLevel: 3, applicableRoles: ['finder'], resolution: 'Immediate account review' }
        ]
      };

      const roleOffenses = offenseTypes[role as keyof typeof offenseTypes] || [];
      res.json(roleOffenses);
    } catch (error) {
      console.error('Error fetching offense types:', error);
      res.status(500).json({ message: 'Failed to fetch offense types' });
    }
  });

  app.post('/api/admin/strikes', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { userId, offenseType, evidence, userRole, contextId } = req.body;

      if (!userId || !offenseType || !evidence || !userRole) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // For now, we'll just return a success response
      // In a full implementation, this would save to database
      const strike = {
        id: Date.now().toString(),
        userId,
        offenseType,
        evidence,
        userRole,
        contextId,
        issuedBy: req.user.id,
        issuedAt: new Date().toISOString(),
        status: 'active'
      };

      res.status(201).json(strike);
    } catch (error) {
      console.error('Error issuing strike:', error);
      res.status(500).json({ message: 'Failed to issue strike' });
    }
  });

  app.get('/api/admin/restricted-words', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }

      console.log('Fetching restricted words...');
      const words = await storage.getRestrictedWords();
      console.log('Retrieved restricted words:', words.length, 'words found');
      res.json(words);
    } catch (error: any) {
      console.error('Error fetching restricted words:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/restricted-words', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }

      const { word, category, severity } = req.body;
      console.log('Received restricted word request:', { word, category, severity, userId: req.user.userId });

      if (!word || typeof word !== 'string') {
        return res.status(400).json({ message: 'Word is required and must be a string' });
      }

      const wordData = {
        word: word.toLowerCase().trim(),
        category: category || 'general',
        severity: severity || 'flag',
        addedBy: req.user.userId,
        isActive: true
      };

      console.log('Adding restricted word with data:', wordData);
      const restrictedWord = await storage.addRestrictedWord(wordData);
      console.log('Successfully added restricted word:', restrictedWord);

      res.status(201).json(restrictedWord);
    } catch (error: any) {
      console.error('Error adding restricted word:', error);
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: 'This word is already in the restricted list' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/admin/restricted-words/:wordId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }

      const { wordId } = req.params;
      const success = await storage.removeRestrictedWord(wordId);

      if (!success) {
        return res.status(404).json({ message: 'Restricted word not found' });
      }

      res.json({ message: 'Restricted word removed successfully' });
    } catch (error: any) {
      console.error('Error removing restricted word:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // --- FAQ Management Routes ---
  // Admin FAQ management
  app.get("/api/admin/faqs", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const allFaqs = await db.select().from(faqs).orderBy(faqs.sortOrder, faqs.createdAt);
      res.json(allFaqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  });

  app.post("/api/admin/faqs", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { insertFAQSchema } = await import('@shared/schema');
      const faqData = insertFAQSchema.parse(req.body);

      const newFaq = await db.insert(faqs).values({
        ...faqData,
        tags: faqData.tags || [],
        isActive: faqData.isActive ?? true,
        sortOrder: faqData.sortOrder || 0
      }).returning();

      res.json(newFaq[0]);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Failed to create FAQ', details: error.message });
    }
  });

  app.put("/api/admin/faqs/:id", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { question, answer, category, tags, isActive, sortOrder } = req.body;

      const updated = await db
        .update(faqs)
        .set({
          question,
          answer,
          category,
          tags: tags || [],
          isActive: isActive ?? true,
          sortOrder: sortOrder || 0,
          updatedAt: new Date()
        })
        .where(eq(faqs.id, id))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: 'FAQ not found' });
      }

      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Failed to update FAQ' });
    }
  });

  app.delete("/api/admin/faqs/:id", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const deleted = await db.delete(faqs).where(eq(faqs.id, id)).returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: 'FAQ not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Failed to delete FAQ' });
    }
  });

  // Public FAQs endpoint
  app.get("/api/public/faqs", async (req, res) => {
    try {
      const activeFaqs = await db
        .select()
        .from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(faqs.sortOrder, faqs.createdAt);

      res.json(activeFaqs);
    } catch (error) {
      console.error('Error fetching public FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  });

  // --- Admin Withdrawal Settings ---
  // Admin withdrawal settings
  app.get("/api/admin/withdrawal-settings", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await db.select().from(withdrawalSettings).limit(1);
      res.json(settings[0] || {
        minimumAmount: "1000",
        processingFee: "45", 
        processingTimeHours: 24,
        isActive: true
      });
    } catch (error) {
      console.error('Error fetching withdrawal settings:', error);
      res.status(500).json({ error: 'Failed to fetch withdrawal settings' });
    }
  });

  app.put("/api/admin/withdrawal-settings/:id", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await db
        .update(withdrawalSettings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(withdrawalSettings.id, id))
        .returning();

      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating withdrawal settings:', error);
      res.status(500).json({ error: 'Failed to update withdrawal settings' });
    }
  });

  // --- Blog Post Routes ---
  // Public blog post route
  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);
  return httpServer;
}