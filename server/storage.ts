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

  users,
  finders,
  requests,
  proposals,
  contracts,
  reviews,
  tokens,
  transactions,
  adminSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Finder operations
  getFinder(id: string): Promise<Finder | undefined>;
  getFinderByUserId(userId: string): Promise<Finder | undefined>;
  createFinder(finder: InsertFinder): Promise<Finder>;
  updateFinder(id: string, updates: Partial<Finder>): Promise<Finder | undefined>;

  // Request operations
  getRequest(id: string): Promise<Request | undefined>;
  getRequestsByClientId(clientId: string): Promise<Request[]>;
  getAllActiveRequests(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined>;

  // Proposal operations
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByRequestId(requestId: string): Promise<Proposal[]>;
  getProposalsByFinderId(finderId: string): Promise<Proposal[]>;
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
      .where(eq(requests.status, "active"))
      .orderBy(desc(requests.createdAt));
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

  async getProposalsByFinderId(finderId: string): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .where(eq(proposals.finderId, finderId))
      .orderBy(desc(proposals.createdAt));
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

  async getContractsByClientId(clientId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
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
}

export const storage = new DatabaseStorage();
