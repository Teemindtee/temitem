import { 
  type User, 
  type InsertUser, 
  type Finder,
  type InsertFinder,
  type Request,
  type InsertRequest,
  type Proposal,
  type InsertProposal,
  type Contract,
  type InsertContract,
  type Review,
  type InsertReview,
  type Token,
  type InsertToken,
  type Transaction,
  type InsertTransaction,
  type AdminSetting,
  type InsertAdminSetting,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Category,
  type InsertCategory,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type BlogPost,
  type InsertBlogPost,
  type OrderSubmission,
  type InsertOrderSubmission,

  users,
  finders,
  requests,
  proposals,
  contracts,
  reviews,
  tokens,
  transactions,
  adminSettings,
  conversations,
  messages,
  categories,
  withdrawalRequests,
  blogPosts,
  orderSubmissions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<void>;

  // Finder operations
  getFinder(id: string): Promise<Finder | undefined>;
  getFinderByUserId(userId: string): Promise<Finder | undefined>;
  createFinder(finder: InsertFinder): Promise<Finder>;
  updateFinder(id: string, updates: Partial<Finder>): Promise<Finder | undefined>;

  // Request operations
  getRequest(id: string): Promise<Request | undefined>;
  getRequestsByClientId(clientId: string): Promise<Request[]>;
  getAllActiveRequests(): Promise<Request[]>;
  getAvailableRequestsForFinders(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined>;

  // Proposal operations
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByRequestId(requestId: string): Promise<Proposal[]>;
  getProposalsByFinderId(finderId: string): Promise<Proposal[]>;
  getProposalByFinderAndRequest(finderId: string, requestId: string): Promise<Proposal | undefined>;
  hasAcceptedProposal(requestId: string): Promise<boolean>;
  getClientContactForAcceptedProposal(proposalId: string, finderId: string): Promise<{firstName: string, lastName: string, email: string, phone?: string} | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined>;

  // Contract operations
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByClientId(clientId: string): Promise<Contract[]>;
  getContractsByFinderId(finderId: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, updates: Partial<Contract>): Promise<Contract | undefined>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByFinderId(finderId: string): Promise<Review[]>;

  // Token operations
  getTokenBalance(finderId: string): Promise<Token | undefined>;
  createTokenRecord(finderId: string): Promise<Token>;
  updateTokenBalance(finderId: string, newBalance: number): Promise<Token | undefined>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByFinderId(finderId: string): Promise<Transaction[]>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(key: string, value: string): Promise<AdminSetting>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  
  // User management operations
  banUser(userId: string, reason: string): Promise<User | undefined>;
  unbanUser(userId: string): Promise<User | undefined>;
  verifyUser(userId: string): Promise<User | undefined>;
  unverifyUser(userId: string): Promise<User | undefined>;
  
  // Withdrawal operations
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getWithdrawalRequests(): Promise<any[]>;
  updateWithdrawalRequest(id: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined>;
  updateFinderBalance(finderId: string, amount: string): Promise<void>;

  // Messaging operations
  getConversation(clientId: string, proposalId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationsByClientId(clientId: string): Promise<Array<Conversation & {
    proposal: { request: { title: string; }; }; 
    finder: { user: { firstName: string; lastName: string; }; }; 
    lastMessage?: { content: string; createdAt: Date; senderId: string; };
    unreadCount: number;
  }>>;
  getConversationsByFinderId(finderId: string): Promise<Array<Conversation & {
    proposal: { request: { title: string; }; }; 
    client: { firstName: string; lastName: string; }; 
    lastMessage?: { content: string; createdAt: Date; senderId: string; };
    unreadCount: number;
  }>>;
  getMessages(conversationId: string): Promise<Array<Message & { sender: { firstName: string; lastName: string; }; }>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;

  // Blog post operations
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;

  // Order submission operations
  createOrderSubmission(submission: InsertOrderSubmission): Promise<OrderSubmission>;
  getOrderSubmissionByContractId(contractId: string): Promise<OrderSubmission | undefined>;
  updateOrderSubmission(id: string, updates: Partial<OrderSubmission>): Promise<OrderSubmission | undefined>;
  getContractWithSubmission(contractId: string): Promise<(Contract & {orderSubmission?: OrderSubmission}) | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async getFinder(id: string): Promise<Finder | undefined> {
    const [finder] = await db.select().from(finders).where(eq(finders.id, id));
    return finder || undefined;
  }

  async getFinderByUserId(userId: string): Promise<Finder | undefined> {
    const [finder] = await db.select().from(finders).where(eq(finders.userId, userId));
    return finder || undefined;
  }

  async createFinder(insertFinder: InsertFinder): Promise<Finder> {
    const [finder] = await db
      .insert(finders)
      .values(insertFinder)
      .returning();
    
    // Create initial token record
    await this.createTokenRecord(finder.id);
    
    return finder;
  }

  async updateFinder(id: string, updates: Partial<Finder>): Promise<Finder | undefined> {
    const [finder] = await db
      .update(finders)
      .set(updates)
      .where(eq(finders.id, id))
      .returning();
    return finder || undefined;
  }

  async getRequest(id: string): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request || undefined;
  }

  async getRequestsByClientId(clientId: string): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.clientId, clientId))
      .orderBy(desc(requests.createdAt));
  }

  async getAllActiveRequests(): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.status, "open"))
      .orderBy(desc(requests.createdAt));
  }

  async getAvailableRequestsForFinders(): Promise<Request[]> {
    // Get all open requests that don't have any accepted proposals
    const availableRequests = await db
      .select()
      .from(requests)
      .where(eq(requests.status, "open"))
      .orderBy(desc(requests.createdAt));
    
    // Filter out requests that have accepted proposals
    const filteredRequests = [];
    for (const request of availableRequests) {
      const hasAccepted = await this.hasAcceptedProposal(request.id);
      if (!hasAccepted) {
        filteredRequests.push(request);
      }
    }
    
    return filteredRequests;
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const [request] = await db
      .insert(requests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined> {
    const [request] = await db
      .update(requests)
      .set(updates)
      .where(eq(requests.id, id))
      .returning();
    return request || undefined;
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async getProposalsByRequestId(requestId: string): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .where(eq(proposals.requestId, requestId))
      .orderBy(desc(proposals.createdAt));
  }

  async getProposalsForClient(clientId: string): Promise<Array<Proposal & { finderName: string }>> {
    const result = await db
      .select({
        id: proposals.id,
        requestId: proposals.requestId,
        finderId: proposals.finderId,
        approach: proposals.approach,
        price: proposals.price,
        timeline: proposals.timeline,
        notes: proposals.notes,
        status: proposals.status,
        createdAt: proposals.createdAt,
        finderFirstName: users.firstName,
        finderLastName: users.lastName,
      })
      .from(proposals)
      .innerJoin(requests, eq(proposals.requestId, requests.id))
      .innerJoin(finders, eq(proposals.finderId, finders.id))
      .innerJoin(users, eq(finders.userId, users.id))
      .where(eq(requests.clientId, clientId))
      .orderBy(desc(proposals.createdAt));

    return result.map(row => ({
      id: row.id,
      requestId: row.requestId,
      finderId: row.finderId,
      approach: row.approach,
      price: row.price,
      timeline: row.timeline,
      notes: row.notes,
      status: row.status,
      createdAt: row.createdAt,
      finderName: `${row.finderFirstName} ${row.finderLastName}`
    }));
  }

  async getProposalsByFinderId(finderId: string): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .where(eq(proposals.finderId, finderId))
      .orderBy(desc(proposals.createdAt));
  }

  async getProposalByFinderAndRequest(finderId: string, requestId: string): Promise<Proposal | undefined> {
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(eq(proposals.finderId, finderId), eq(proposals.requestId, requestId)));
    return proposal || undefined;
  }

  async hasAcceptedProposal(requestId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(proposals)
      .where(and(eq(proposals.requestId, requestId), eq(proposals.status, 'accepted')))
      .limit(1);
    return !!result;
  }

  async getClientContactForAcceptedProposal(proposalId: string, finderId: string): Promise<{firstName: string, lastName: string, email: string, phone?: string} | undefined> {
    const [result] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone
      })
      .from(proposals)
      .innerJoin(requests, eq(proposals.requestId, requests.id))
      .innerJoin(users, eq(requests.clientId, users.id))
      .where(and(
        eq(proposals.id, proposalId),
        eq(proposals.finderId, finderId),
        eq(proposals.status, 'accepted')
      ));
    
    if (result) {
      return {
        ...result,
        phone: result.phone || undefined
      };
    }
    return undefined;
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const [proposal] = await db
      .insert(proposals)
      .values(insertProposal)
      .returning();
    return proposal;
  }

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined> {
    const [proposal] = await db
      .update(proposals)
      .set(updates)
      .where(eq(proposals.id, id))
      .returning();
    return proposal || undefined;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }

  async getContractsByClientId(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: contracts.id,
        requestId: contracts.requestId,
        proposalId: contracts.proposalId,
        clientId: contracts.clientId,
        finderId: contracts.finderId,
        amount: contracts.amount,
        escrowStatus: contracts.escrowStatus,
        isCompleted: contracts.isCompleted,
        hasSubmission: contracts.hasSubmission,
        createdAt: contracts.createdAt,
        completedAt: contracts.completedAt,
        request: {
          title: requests.title,
          description: requests.description
        },
        finder: {
          name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown Finder')`
        }
      })
      .from(contracts)
      .leftJoin(requests, eq(contracts.requestId, requests.id))
      .leftJoin(finders, eq(contracts.finderId, finders.id))
      .leftJoin(users, eq(finders.userId, users.id))
      .where(eq(contracts.clientId, clientId))
      .orderBy(desc(contracts.createdAt));
  }

  async getContractsByFinderId(finderId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.finderId, finderId))
      .orderBy(desc(contracts.createdAt));
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db
      .insert(contracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract | undefined> {
    const [contract] = await db
      .update(contracts)
      .set(updates)
      .where(eq(contracts.id, id))
      .returning();
    return contract || undefined;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    
    // Update finder's average rating
    const finderReviews = await this.getReviewsByFinderId(insertReview.finderId);
    const avgRating = finderReviews.reduce((sum, r) => sum + r.rating, 0) / finderReviews.length;
    
    const finder = await this.getFinderByUserId(insertReview.finderId);
    if (finder) {
      await this.updateFinder(finder.id, { averageRating: avgRating.toFixed(2) });
    }
    
    return review;
  }

  async getReviewsByFinderId(finderId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.finderId, finderId))
      .orderBy(desc(reviews.createdAt));
  }

  async getTokenBalance(finderId: string): Promise<Token | undefined> {
    const [tokenRecord] = await db.select().from(tokens).where(eq(tokens.finderId, finderId));
    return tokenRecord || undefined;
  }

  async createTokenRecord(finderId: string): Promise<Token> {
    const [tokenRecord] = await db
      .insert(tokens)
      .values({ finderId, balance: 5 }) // Start with 5 free tokens
      .returning();
    return tokenRecord;
  }

  async updateTokenBalance(finderId: string, newBalance: number): Promise<Token | undefined> {
    const [tokenRecord] = await db
      .update(tokens)
      .set({ balance: newBalance })
      .where(eq(tokens.finderId, finderId))
      .returning();
    return tokenRecord || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTransactionsByFinderId(finderId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.finderId, finderId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting || undefined;
  }

  async setAdminSetting(key: string, value: string): Promise<AdminSetting> {
    const existing = await this.getAdminSetting(key);
    
    if (existing) {
      const [setting] = await db
        .update(adminSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(adminSettings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(adminSettings)
        .values({ key, value })
        .returning();
      return setting;
    }
  }

  // Messaging operations implementation
  async getConversation(clientId: string, proposalId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.clientId, clientId), eq(conversations.proposalId, proposalId)));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getConversationsByClientId(clientId: string): Promise<Array<Conversation & {
    proposal: { request: { title: string; }; }; 
    finder: { user: { firstName: string; lastName: string; }; }; 
    lastMessage?: { content: string; createdAt: Date; senderId: string; };
    unreadCount: number;
  }>> {
    const result = await db
      .select({
        conversation: conversations,
        requestTitle: requests.title,
        finderFirstName: users.firstName,
        finderLastName: users.lastName,
        lastMessageContent: sql<string>`(
          SELECT content FROM messages 
          WHERE conversation_id = conversations.id 
          ORDER BY created_at DESC LIMIT 1
        )`.as('lastMessageContent'),
        lastMessageCreatedAt: sql<Date>`(
          SELECT created_at FROM messages 
          WHERE conversation_id = conversations.id 
          ORDER BY created_at DESC LIMIT 1
        )`.as('lastMessageCreatedAt'),
        lastMessageSenderId: sql<string>`(
          SELECT sender_id FROM messages 
          WHERE conversation_id = conversations.id 
          ORDER BY created_at DESC LIMIT 1
        )`.as('lastMessageSenderId'),
        unreadCount: sql<number>`(
          SELECT COUNT(*) FROM messages 
          WHERE conversation_id = conversations.id 
            AND sender_id != ${clientId}
            AND is_read = false
        )`.as('unreadCount')
      })
      .from(conversations)
      .innerJoin(proposals, eq(conversations.proposalId, proposals.id))
      .innerJoin(requests, eq(proposals.requestId, requests.id))
      .innerJoin(finders, eq(conversations.finderId, finders.id))
      .innerJoin(users, eq(finders.userId, users.id))
      .where(eq(conversations.clientId, clientId))
      .orderBy(desc(conversations.lastMessageAt));

    return result.map(row => ({
      ...row.conversation,
      proposal: {
        request: {
          title: row.requestTitle
        }
      },
      finder: {
        user: {
          firstName: row.finderFirstName,
          lastName: row.finderLastName
        }
      },
      lastMessage: row.lastMessageContent ? {
        content: row.lastMessageContent,
        createdAt: row.lastMessageCreatedAt,
        senderId: row.lastMessageSenderId
      } : undefined,
      unreadCount: row.unreadCount
    }));
  }

  async getConversationsByFinderId(finderId: string): Promise<Array<Conversation & {
    proposal: { request: { title: string; }; }; 
    client: { firstName: string; lastName: string; }; 
    lastMessage?: { content: string; createdAt: Date; senderId: string; };
    unreadCount: number;
  }>> {
    const result = await db
      .select({
        conversation: conversations,
        requestTitle: requests.title,
        clientFirstName: users.firstName,
        clientLastName: users.lastName,
        lastMessageContent: sql<string>`(
          SELECT content FROM messages 
          WHERE conversation_id = conversations.id 
          ORDER BY created_at DESC LIMIT 1
        )`.as('lastMessageContent'),
        lastMessageCreatedAt: sql<Date>`(
          SELECT created_at FROM messages 
          WHERE conversation_id = conversations.id 
          ORDER BY created_at DESC LIMIT 1
        )`.as('lastMessageCreatedAt'),
        lastMessageSenderId: sql<string>`(
          SELECT sender_id FROM messages 
          WHERE conversation_id = conversations.id 
          ORDER BY created_at DESC LIMIT 1
        )`.as('lastMessageSenderId'),
        unreadCount: sql<number>`(
          SELECT COUNT(*) FROM messages 
          WHERE conversation_id = conversations.id 
            AND sender_id != (SELECT user_id FROM finders WHERE id = ${finderId})
            AND is_read = false
        )`.as('unreadCount')
      })
      .from(conversations)
      .innerJoin(proposals, eq(conversations.proposalId, proposals.id))
      .innerJoin(requests, eq(proposals.requestId, requests.id))
      .innerJoin(users, eq(conversations.clientId, users.id))
      .where(eq(conversations.finderId, finderId))
      .orderBy(desc(conversations.lastMessageAt));

    return result.map(row => ({
      ...row.conversation,
      proposal: {
        request: {
          title: row.requestTitle
        }
      },
      client: {
        firstName: row.clientFirstName,
        lastName: row.clientLastName
      },
      lastMessage: row.lastMessageContent ? {
        content: row.lastMessageContent,
        createdAt: row.lastMessageCreatedAt,
        senderId: row.lastMessageSenderId
      } : undefined,
      unreadCount: row.unreadCount
    }));
  }

  async getMessages(conversationId: string): Promise<Array<Message & { sender: { firstName: string; lastName: string; }; }>> {
    return await db
      .select({
        message: messages,
        senderFirstName: users.firstName,
        senderLastName: users.lastName
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)
      .then(result => result.map(row => ({
        ...row.message,
        sender: {
          firstName: row.senderFirstName,
          lastName: row.senderLastName
        }
      })));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();

    // Update conversation's lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, insertMessage.conversationId));

    return message;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        sql`sender_id != ${userId}`,
        eq(messages.isRead, false)
      ));
  }

  async getFinderProfile(finderId: string) {
    const result = await db
      .select({
        finder: finders,
        user: users
      })
      .from(finders)
      .innerJoin(users, eq(finders.userId, users.id))
      .where(eq(finders.id, finderId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { finder, user } = result[0];
    return {
      id: finder.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      },
      completedJobs: finder.jobsCompleted || 0,
      totalEarnings: finder.totalEarned || "0.00",
      availableBalance: finder.availableBalance || "0.00",
      rating: parseFloat(finder.averageRating || "5.0"),
      tokens: 10, // Default tokens since not in schema
      createdAt: user.createdAt
    };
  }

  // Categories Management
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category || null;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Finder Profile Management  
  async updateFinder(finderId: string, updates: Partial<Finder>): Promise<Finder | null> {
    const [finder] = await db
      .update(finders)
      .set(updates)
      .where(eq(finders.id, finderId))
      .returning();
    return finder || null;
  }

  async getTransactionsByFinderId(finderId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.finderId, finderId))
      .orderBy(desc(transactions.createdAt));
  }

  async getWithdrawalSettings(finderId: string): Promise<any> {
    // For now, return mock data since withdrawal settings aren't in schema
    return {
      paymentMethod: "bank_transfer",
      minimumThreshold: 50,
      bankDetails: {
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        accountHolder: ""
      },
      paypalDetails: {
        email: ""
      }
    };
  }

  async updateWithdrawalSettings(finderId: string, settings: any): Promise<any> {
    // For now, just return the settings since withdrawal settings aren't in schema
    return settings;
  }

  async getWithdrawalsByFinderId(finderId: string): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.finderId, finderId))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async createWithdrawalRequest(finderId: string, amount: number): Promise<WithdrawalRequest> {
    const [withdrawal] = await db
      .insert(withdrawalRequests)
      .values({
        finderId,
        amount: amount.toString(),
        status: 'pending',
        paymentMethod: 'bank_transfer',
        paymentDetails: '',
        requestedAt: new Date()
      })
      .returning();
    return withdrawal;
  }

  async updateSecuritySettings(finderId: string, settings: any): Promise<any> {
    // For now, just return the settings since security settings aren't in schema
    return settings;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user || null;
  }

  // User Ban Management
  async banUser(userId: string, reason: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        isBanned: true,
        bannedReason: reason,
        bannedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  async unbanUser(userId: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        isBanned: false,
        bannedReason: null,
        bannedAt: null
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  // User Verification
  async verifyUser(userId: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  async unverifyUser(userId: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ isVerified: false })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  // Finder Verification
  async verifyFinder(finderId: string): Promise<Finder | null> {
    const [finder] = await db
      .update(finders)
      .set({ isVerified: true })
      .where(eq(finders.id, finderId))
      .returning();
    return finder || null;
  }

  async unverifyFinder(finderId: string): Promise<Finder | null> {
    const [finder] = await db
      .update(finders)
      .set({ isVerified: false })
      .where(eq(finders.id, finderId))
      .returning();
    return finder || null;
  }

  // Admin Settings
  async getAdminSetting(key: string): Promise<AdminSetting | null> {
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key))
      .limit(1);
    return setting || null;
  }

  async setAdminSetting(key: string, value: string): Promise<AdminSetting> {
    const existing = await this.getAdminSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(adminSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(adminSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  // Withdrawal Requests
  async createWithdrawalRequest(requestData: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [request] = await db
      .insert(withdrawalRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async getWithdrawalRequests(): Promise<Array<WithdrawalRequest & { finder: { user: { firstName: string; lastName: string; email: string; } } }>> {
    return await db
      .select({
        id: withdrawalRequests.id,
        amount: withdrawalRequests.amount,
        status: withdrawalRequests.status,
        paymentMethod: withdrawalRequests.paymentMethod,
        paymentDetails: withdrawalRequests.paymentDetails,
        adminNotes: withdrawalRequests.adminNotes,
        requestedAt: withdrawalRequests.requestedAt,
        processedAt: withdrawalRequests.processedAt,
        finder: {
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        }
      })
      .from(withdrawalRequests)
      .innerJoin(finders, eq(withdrawalRequests.finderId, finders.id))
      .innerJoin(users, eq(finders.userId, users.id))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async updateWithdrawalRequest(id: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | null> {
    const [request] = await db
      .update(withdrawalRequests)
      .set({ ...updates, processedAt: new Date() })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request || null;
  }

  // Update finder balance after withdrawal
  async updateFinderBalance(finderId: string, amount: string): Promise<void> {
    await db
      .update(finders)
      .set({
        availableBalance: sql`available_balance - ${amount}`
      })
      .where(eq(finders.id, finderId));
  }

  // TODO: Implement real withdrawal settings storage
  async getWithdrawalSettings(finderId: string): Promise<any> {
    // For now, return default settings since we don't have a withdrawal_settings table
    return {
      minWithdrawal: 10,
      maxWithdrawal: 1000,
      methods: ['bank_transfer', 'paypal'],
      processingTime: '3-5 business days'
    };
  }

  // Blog post operations
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    return result.length > 0;
  }

  // Order Submission Operations
  async createOrderSubmission(submission: InsertOrderSubmission): Promise<OrderSubmission> {
    // Calculate auto-release date: 5 days from now if no client decision
    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(autoReleaseDate.getDate() + 5);

    const [newSubmission] = await db
      .insert(orderSubmissions)
      .values({
        ...submission,
        autoReleaseDate
      })
      .returning();

    // Update contract to indicate it has a submission
    await db
      .update(contracts)
      .set({ hasSubmission: true })
      .where(eq(contracts.id, submission.contractId));

    return newSubmission;
  }

  async getOrderSubmissionByContractId(contractId: string): Promise<OrderSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(orderSubmissions)
      .where(eq(orderSubmissions.contractId, contractId));
    return submission || undefined;
  }

  async updateOrderSubmission(id: string, updates: Partial<OrderSubmission>): Promise<OrderSubmission | undefined> {
    const [submission] = await db
      .update(orderSubmissions)
      .set({
        ...updates,
        reviewedAt: new Date(),
        // If accepting, set auto-release date to 3 days from now
        ...(updates.status === 'accepted' && {
          autoReleaseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        })
      })
      .where(eq(orderSubmissions.id, id))
      .returning();

    // If accepting submission, update request status to completed and contract
    if (updates.status === 'accepted' && submission) {
      const contract = await this.getContract(submission.contractId);
      if (contract) {
        // Update request status to completed
        await db
          .update(requests)
          .set({ status: 'completed' })
          .where(eq(requests.id, contract.requestId));

        // Update contract as completed
        await db
          .update(contracts)
          .set({ isCompleted: true, completedAt: new Date() })
          .where(eq(contracts.id, submission.contractId));
      }
    }

    return submission || undefined;
  }

  async getContractWithSubmission(contractId: string): Promise<(Contract & {orderSubmission?: OrderSubmission}) | undefined> {
    const [result] = await db
      .select({
        contract: contracts,
        orderSubmission: orderSubmissions
      })
      .from(contracts)
      .leftJoin(orderSubmissions, eq(orderSubmissions.contractId, contracts.id))
      .where(eq(contracts.id, contractId));

    if (!result) return undefined;

    return {
      ...result.contract,
      orderSubmission: result.orderSubmission || undefined
    };
  }
}

export const storage = new DatabaseStorage();
