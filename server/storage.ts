import {
  type User,
  type InsertUser,
  type Finder,
  type InsertFinder,
  type Find,
  type InsertFind,
  type Proposal,
  type InsertProposal,
  type Contract,
  type InsertContract,
  type Review,
  type InsertReview,
  type Findertoken,
  type InsertFindertoken,
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
  type FinderLevel,
  type InsertFinderLevel,
  type MonthlyTokenDistribution,
  type InsertMonthlyTokenDistribution,
  type TokenGrant,
  type InsertTokenGrant,
  type Strike,
  type InsertStrike,
  type UserRestriction,
  type InsertUserRestriction,
  type Dispute,
  type InsertDispute,
  type BehavioralTraining,
  type InsertBehavioralTraining,
  type TrustedBadge,
  type InsertTrustedBadge,
  type RestrictedWord,
  type InsertRestrictedWord,
  type TokenPackage,
  type InsertTokenPackage,
  type ClientTokenGrant,
  type InsertClientTokenGrant,
  users,
  finders,
  finds,
  proposals,
  contracts,
  reviews,
  findertokens,
  transactions,
  adminSettings,
  conversations,
  messages,
  categories,
  withdrawalSettings,
  withdrawalRequests,
  blogPosts,
  orderSubmissions,
  finderLevels,
  tokenCharges,
  monthlyTokenDistributions,
  tokenGrants,
  clientTokenGrants,
  restrictedWords,
  strikes,
  userRestrictions,
  disputes,
  behavioralTraining,
  trustedBadges,
  tokenPackages,
  supportAgents,
  supportTickets,
  supportTicketMessages,
  supportDepartments,
  type SupportAgent,
  type SupportTicket,
  type SupportTicketMessage,
  type SupportDepartment,
  type InsertSupportAgent,
  type InsertSupportTicket,
  type InsertSupportDepartment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc } from "drizzle-orm";
import { generateId } from "@shared/utils";

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
  getFinderPendingEarnings(finderId: string): Promise<{ pendingAmount: number; contractCount: number; }>;

  // Find operations
  getFind(id: string): Promise<Find | undefined>;
  getFindsByClientId(clientId: string): Promise<Find[]>;
  getAllActiveFinds(): Promise<Find[]>;
  getAllFinds(): Promise<Find[]>;
  getAvailableFindsForFinders(): Promise<Find[]>;
  createFind(find: InsertFind): Promise<Find>;
  updateFind(id: string, updates: Partial<Find>): Promise<Find | undefined>;

  // Proposal operations
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByFindId(findId: string): Promise<Proposal[]>;
  getProposalsByFinderId(finderId: string): Promise<Proposal[]>;
  getAllProposals(): Promise<Proposal[]>;
  getProposalByFinderAndFind(finderId: string, findId: string): Promise<Proposal | undefined>;
  hasAcceptedProposal(findId: string): Promise<boolean>;
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

  // Findertoken operations
  getFindertokenBalance(finderId: string): Promise<Findertoken | undefined>;
  createFindertokenRecord(finderId: string): Promise<Findertoken>;
  updateFindertokenBalance(finderId: string, newBalance: number): Promise<Findertoken | undefined>;
  updateFinderTokenBalance(finderId: string, newBalance: number): Promise<void>;
  syncFinderTokenBalances(): Promise<void>;

  // Transaction operations
  createTransaction(transaction: any): Promise<Transaction>;
  getTransactionsByFinderId(finderId: string): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getTransactionByReference(reference: string): Promise<Transaction | undefined>;
  getAllTransactionsWithUsers(): Promise<any[]>;
  getAllContractsWithUsers(): Promise<any[]>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  getAdminSettings(): Promise<{[key: string]: string}>;
  setAdminSetting(key: string, value: string): Promise<AdminSetting>;

  // Client operations
  getClientProfile(clientId: string): Promise<User | undefined>;
  deductClientFindertokens(clientId: string, amount: number, description: string): Promise<void>;
  addClientFindertokens(clientId: string, amount: number, description: string): Promise<{ success: boolean; newBalance: number; }>;

  // Token charging
  chargeFinderTokens(finderId: string, amount: number, reason: string, chargedBy: string): Promise<boolean>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getActiveCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  // User management operations
  banUser(userId: string, reason: string): Promise<User | undefined>;
  unbanUser(userId: string): Promise<User | undefined>;
  verifyUser(userId: string): Promise<User | undefined>;
  unverifyUser(userId: string): Promise<User | undefined>;
  verifyFinder(finderId: string): Promise<Finder | null>;
  unverifyFinder(finderId: string): Promise<Finder | null>;

  // Withdrawal operations
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getWithdrawalRequests(): Promise<any[]>;
  updateWithdrawalRequest(id: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined>;
  updateFinderBalance(finderId: string, amount: string): Promise<void>;
  releaseFundsToFinder(finderId: string, contractAmount: string): Promise<void>;
  getWithdrawalSettings(finderId: string): Promise<any>;
  updateWithdrawalSettings(finderId: string, settings: any): Promise<any>;
  getWithdrawalsByFinderId(finderId: string): Promise<WithdrawalRequest[]>;

  // Messaging operations
  getConversation(clientId: string, proposalId: string): Promise<Conversation | undefined>;
  getConversationById(conversationId: string): Promise<Conversation | undefined>;
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
  getMessages(conversationId: string): Promise<Array<Message & { sender: { firstName: string; lastName: string; }; quotedMessage?: { content: string; sender: { firstName: string; lastName: string; } } }>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getFinderProfile(finderId: string): Promise<any>;

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
  getContractWithSubmission(contractId: string): Promise<(Contract & {orderSubmission?: OrderSubmission, finder?: any}) | undefined>;

  // Finder level operations
  getFinderLevels(): Promise<FinderLevel[]>;
  getFinderLevel(id: string): Promise<FinderLevel | undefined>;
  createFinderLevel(level: InsertFinderLevel): Promise<FinderLevel>;
  updateFinderLevel(id: string, updates: Partial<FinderLevel>): Promise<FinderLevel | undefined>;
  deleteFinderLevel(id: string): Promise<boolean>;
  calculateFinderLevel(finderId: string): Promise<FinderLevel | undefined>;
  assignFinderLevel(finderId: string, levelId: string): Promise<void>;

  // Monthly token distribution operations
  distributeMonthlyTokens(): Promise<{ distributed: number; alreadyDistributed: number; }>;
  getMonthlyDistributions(month: number, year: number): Promise<MonthlyTokenDistribution[]>;
  hasReceivedMonthlyTokens(finderId: string, month: number, year: number): Promise<boolean>;
  createMonthlyDistribution(distribution: InsertMonthlyTokenDistribution): Promise<MonthlyTokenDistribution>;

  // Token grant operations
  grantTokensToFinder(finderId: string, amount: number, reason: string, grantedBy: string): Promise<TokenGrant>;
  grantTokensToClient(userId: string, amount: number, reason: string, grantedBy: string): Promise<ClientTokenGrant>;
  getTokenGrants(userId?: string): Promise<any[]>;
  getAllFindersForTokens(): Promise<Finder[]>;

  // Strike System operations
  issueStrike(strike: InsertStrike): Promise<Strike>;
  getStrikesByUserId(userId: string): Promise<Strike[]>;
  getActiveStrikesCount(userId: string): Promise<number>;
  updateStrike(id: string, updates: Partial<Strike>): Promise<Strike | undefined>;

  // User Restrictions operations
  createUserRestriction(restriction: InsertUserRestriction): Promise<UserRestriction>;
  getUserActiveRestrictions(userId: string): Promise<UserRestriction[]>;
  updateUserRestriction(id: string, updates: Partial<UserRestriction>): Promise<UserRestriction | undefined>;

  // Dispute operations
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDisputesByUserId(userId: string): Promise<Dispute[]>;
  getAllDisputes(): Promise<Dispute[]>;
  updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute | undefined>;

  // Behavioral Training operations
  assignTraining(training: InsertBehavioralTraining): Promise<BehavioralTraining>;
  getTrainingsByUserId(userId: string): Promise<BehavioralTraining[]>;
  updateTraining(id: string, updates: Partial<BehavioralTraining>): Promise<BehavioralTraining | undefined>;

  // Trusted Badge operations
  awardBadge(badge: InsertTrustedBadge): Promise<TrustedBadge>;
  getUserBadges(userId: string): Promise<TrustedBadge[]>;
  updateBadge(id: string, updates: Partial<TrustedBadge>): Promise<TrustedBadge | undefined>;

  // Strike System Analysis
  getUserStrikeLevel(userId: string): Promise<number>;

  // Token Package operations
  getAllTokenPackages(): Promise<TokenPackage[]>;
  getActiveTokenPackages(): Promise<TokenPackage[]>;
  getTokenPackage(id: string): Promise<TokenPackage | undefined>;
  createTokenPackage(tokenPackage: InsertTokenPackage): Promise<TokenPackage>;
  updateTokenPackage(id: string, updates: Partial<TokenPackage>): Promise<TokenPackage | undefined>;
  deleteTokenPackage(id: string): Promise<boolean>;

  // Restricted Words Management
  addRestrictedWord(word: InsertRestrictedWord): Promise<RestrictedWord>;
  getRestrictedWords(): Promise<RestrictedWord[]>;
  removeRestrictedWord(id: string): Promise<boolean>;
  updateRestrictedWord(id: string, updates: Partial<RestrictedWord>): Promise<RestrictedWord | undefined>;
  checkContentForRestrictedWords(content: string): Promise<string[]>;

  // Support Agent Management
  createSupportAgent(data: InsertSupportAgent & { agentId: string }): Promise<SupportAgent>;
  getSupportAgents(): Promise<Array<SupportAgent & { user: { id: string; firstName: string; lastName: string; email: string; } }>>;
  getSupportAgent(id: string): Promise<SupportAgent & { user: { id: string; firstName: string; lastName: string; email: string; } } | undefined>;
  updateSupportAgent(id: string, data: Partial<InsertSupportAgent>): Promise<SupportAgent | undefined>;
  suspendSupportAgent(id: string, reason: string): Promise<SupportAgent | undefined>;
  reactivateSupportAgent(id: string): Promise<SupportAgent | undefined>;
  deleteSupportAgent(id: string): Promise<boolean>;
  generateAgentId(): Promise<string>;

  // Support Department Management
  getSupportDepartments(): Promise<Array<SupportDepartment & { isActive: boolean; name: string; }>>;
  createSupportDepartment(data: InsertSupportDepartment): Promise<SupportDepartment>;
  updateSupportDepartment(id: string, data: Partial<InsertSupportDepartment>): Promise<SupportDepartment | undefined>;
  deleteSupportDepartment(id: string): Promise<boolean>;

  // Support Agent Check
  getUserSupportAgent(userId: string): Promise<SupportAgent | undefined>;

  // Generate withdrawal request ID
  generateWithdrawalRequestId(): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // Use `db` directly instead of `this.db`
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

    // Create initial findertoken record
    await this.createFindertokenRecord(finder.id);

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

  async getFinderPendingEarnings(finderId: string): Promise<{ pendingAmount: number; contractCount: number; }> {
    const result = await db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${contracts.amount}), 0)`,
        count: sql<number>`COUNT(*)::integer`
      })
      .from(contracts)
      .where(
        and(
          eq(contracts.finderId, finderId),
          eq(contracts.isCompleted, true),
          sql`${contracts.escrowStatus} != 'released'`
        )
      );

    const totalAmount = parseFloat(result[0]?.totalAmount || '0');
    const contractCount = result[0]?.count || 0;

    return {
      pendingAmount: totalAmount,
      contractCount
    };
  }

  async getFind(id: string): Promise<Find | undefined> {
    const [find] = await db.select().from(finds).where(eq(finds.id, id));
    return find || undefined;
  }

  async getFindsByClientId(clientId: string): Promise<Find[]> {
    return await db
      .select()
      .from(finds)
      .where(eq(finds.clientId, clientId))
      .orderBy(desc(finds.createdAt));
  }

  async getAllActiveFinds(): Promise<Find[]> {
    return await db
      .select()
      .from(finds)
      .where(eq(finds.status, "open"))
      .orderBy(desc(finds.createdAt));
  }

  async getAllFinds(): Promise<Find[]> {
    return await db
      .select()
      .from(finds)
      .orderBy(desc(finds.createdAt));
  }

  async getAllProposals(): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .orderBy(desc(proposals.createdAt));
  }

  async getAvailableFindsForFinders(): Promise<Find[]> {
    // Get all open finds that don't have any accepted proposals
    const availableFinds = await db
      .select()
      .from(finds)
      .where(eq(finds.status, "open"))
      .orderBy(desc(finds.createdAt));

    // Filter out finds that have accepted proposals
    const filteredFinds = [];
    for (const find of availableFinds) {
      const hasAccepted = await this.hasAcceptedProposal(find.id);
      if (!hasAccepted) {
        filteredFinds.push(find);
      }
    }

    return filteredFinds;
  }

  async createFind(insertFind: InsertFind): Promise<Find> {
    const [request] = await db
      .insert(finds)
      .values(insertFind)
      .returning();
    return request;
  }

  async updateFind(id: string, updates: Partial<Find>): Promise<Find | undefined> {
    const [request] = await db
      .update(finds)
      .set(updates)
      .where(eq(finds.id, id))
      .returning();
    return request || undefined;
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async getProposalWithDetails(id: string): Promise<any | undefined> {
    const result = await db
      .select({
        // Proposal fields
        id: proposals.id,
        findId: proposals.findId,
        finderId: proposals.finderId,
        approach: proposals.approach,
        price: proposals.price,
        timeline: proposals.timeline,
        notes: proposals.notes,
        status: proposals.status,
        createdAt: proposals.createdAt,
        // Find fields
        requestTitle: finds.title,
        requestDescription: finds.description,
        requestCategory: finds.category,
        requestBudgetMin: finds.budgetMin,
        requestBudgetMax: finds.budgetMax,
        // Finder user fields
        finderFirstName: users.firstName,
        finderLastName: users.lastName,
        finderEmail: users.email,
        // Finder profile fields
        finderCompletedJobs: finders.jobsCompleted,
        finderRating: finders.averageRating,
      })
      .from(proposals)
      .innerJoin(finds, eq(proposals.findId, finds.id))
      .innerJoin(finders, eq(proposals.finderId, finders.id))
      .innerJoin(users, eq(finders.userId, users.id))
      .where(eq(proposals.id, id))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const row = result[0];
    return {
      id: row.id,
      findId: row.findId,
      finderId: row.finderId,
      approach: row.approach,
      price: row.price,
      timeline: row.timeline,
      notes: row.notes,
      status: row.status,
      createdAt: row.createdAt,
      finder: {
        id: row.finderId,
        user: {
          firstName: row.finderFirstName,
          lastName: row.finderLastName,
          email: row.finderEmail,
        },
        completedJobs: row.finderCompletedJobs || 0,
        rating: row.finderRating || 5.0,
      },
      request: {
        title: row.requestTitle,
        description: row.requestDescription,
        category: row.requestCategory,
        budgetMin: row.requestBudgetMin,
        budgetMax: row.requestBudgetMax,
      },
    };
  }

  async getProposalsByFindId(requestId: string): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .where(eq(proposals.findId, requestId))
      .orderBy(desc(proposals.createdAt));
  }

  async getProposalsForClient(clientId: string): Promise<Array<Proposal & { finderName: string }>> {
    const result = await db
      .select({
        id: proposals.id,
        findId: proposals.findId,
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
      .innerJoin(finds, eq(proposals.findId, finds.id))
      .innerJoin(finders, eq(proposals.finderId, finders.id))
      .innerJoin(users, eq(finders.userId, users.id))
      .where(eq(finds.clientId, clientId))
      .orderBy(desc(proposals.createdAt));

    return result.map(row => ({
      id: row.id,
      findId: row.findId,
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

  async getProposalByFinderAndFind(finderId: string, requestId: string): Promise<Proposal | undefined> {
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(eq(proposals.finderId, finderId), eq(proposals.findId, requestId)));
    return proposal || undefined;
  }

  async hasAcceptedProposal(requestId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(proposals)
      .where(and(eq(proposals.findId, requestId), eq(proposals.status, 'accepted')))
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
      .innerJoin(finds, eq(proposals.findId, finds.id))
      .innerJoin(users, eq(finds.clientId, users.id))
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
        requestId: contracts.findId,
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
          title: finds.title,
          description: finds.description
        },
        finder: {
          name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown Finder')`,
          rating: finders.averageRating
        }
      })
      .from(contracts)
      .leftJoin(finds, eq(contracts.findId, finds.id))
      .leftJoin(finders, eq(contracts.finderId, finders.id))
      .leftJoin(users, eq(finders.userId, users.id))
      .where(eq(contracts.clientId, clientId))
      .orderBy(desc(contracts.createdAt));
  }

  async getContractsByFinderId(finderId: string): Promise<any[]> {
    return await db
      .select({
        id: contracts.id,
        requestId: contracts.findId,
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
          title: finds.title,
          description: finds.description
        }
      })
      .from(contracts)
      .leftJoin(finds, eq(contracts.findId, finds.id))
      .where(eq(contracts.finderId, finderId))
      .orderBy(desc(contracts.createdAt));
  }

  async getCompletedContractsByFinder(finderId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.finderId, finderId),
          eq(contracts.isCompleted, true)
        )
      )
      .orderBy(desc(contracts.completedAt));
  }

  async getContractDetails(contractId: string, finderId: string): Promise<any> {
    const result = await db
      .select({
        id: contracts.id,
        requestId: contracts.findId,
        proposalId: contracts.proposalId,
        amount: contracts.amount,
        escrowStatus: contracts.escrowStatus,
        isCompleted: contracts.isCompleted,
        hasSubmission: contracts.hasSubmission,
        createdAt: contracts.createdAt,
        completedAt: contracts.completedAt,
        request: {
          title: finds.title,
          description: finds.description
        }
      })
      .from(contracts)
      .leftJoin(finds, eq(contracts.findId, finds.id))
      .where(
        and(
          eq(contracts.id, contractId),
          eq(contracts.finderId, finderId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const contract = result[0];

    // Get order submission if it exists
    let orderSubmission = null;
    if (contract.hasSubmission) {
      const submissionResult = await db
        .select()
        .from(orderSubmissions)
        .where(eq(orderSubmissions.contractId, contractId))
        .limit(1);

      if (submissionResult.length > 0) {
        orderSubmission = submissionResult[0];
      }
    }

    return {
      ...contract,
      orderSubmission
    };
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

  async getFindertokenBalance(finderId: string): Promise<Findertoken | undefined> {
    const [findertokenRecord] = await db.select().from(findertokens).where(eq(findertokens.finderId, finderId));
    return findertokenRecord || undefined;
  }

  async createFindertokenRecord(finderId: string): Promise<Findertoken> {
    const [findertokenRecord] = await db
      .insert(findertokens)
      .values({ finderId, balance: 5 }) // Start with 5 free findertokens
      .returning();
    return findertokenRecord;
  }

  async updateFindertokenBalance(finderId: string, newBalance: number): Promise<Findertoken | undefined> {
    const [findertokenRecord] = await db
      .update(findertokens)
      .set({ balance: newBalance })
      .where(eq(findertokens.finderId, finderId))
      .returning();
    return findertokenRecord || undefined;
  }

  async updateFinderTokenBalance(finderId: string, newBalance: number): Promise<void> {
    // Get current balance first
    const finder = await db.query.finders.findFirst({
      where: eq(finders.id, finderId),
    });

    if (!finder) return;

    // Update finder balance
    await db
      .update(finders)
      .set({
        findertokenBalance: newBalance
      })
      .where(eq(finders.id, finderId));

    // Also update or create findertokens record for consistency
    const tokenRecord = await db.query.findertokens.findFirst({
      where: eq(findertokens.finderId, finderId),
    });

    if (tokenRecord) {
      await db.update(findertokens)
        .set({ balance: newBalance })
        .where(eq(findertokens.finderId, finderId));
    } else {
      await db.insert(findertokens).values({
        finderId,
        balance: newBalance,
      });
    }
  }

  async syncFinderTokenBalances(): Promise<void> {
    // Sync all finder token balances between finders table and findertokens table
    const allFinders = await this.getAllFindersForTokens();

    for (const finder of allFinders) {
      const tokenRecord = await db.query.findertokens.findFirst({
        where: eq(findertokens.finderId, finder.id),
      });

      if (tokenRecord) {
        // Update finder table with token balance
        await db.update(finders)
          .set({ findertokenBalance: tokenRecord.balance })
          .where(eq(finders.id, finder.id));
      } else {
        // Create missing token record with current finder balance
        const currentBalance = finder.findertokenBalance || 5;
        await db.insert(findertokens).values({
          finderId: finder.id,
          balance: currentBalance,
        });
      }
    }
  }

  async createTransaction(transaction: any): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async addClientFindertokens(clientId: string, amount: number, description: string) {
    // Get current client profile or create one
    let client = await this.getClientProfile(clientId);

    if (!client) {
      // Create a basic client profile
      client = {
        userId: clientId,
        findertokenBalance: 0
      };
    }

    const newBalance = (client?.findertokenBalance || 0) + amount;

    // Update client findertoken balance - since we don't have a dedicated clients table,
    // we'll store this in the users table or create a simple tracking mechanism
    await db.update(users)
      .set({ findertokenBalance: newBalance })
      .where(eq(users.id, clientId));

    // Create transaction record
    await this.createTransaction({
      userId: clientId,
      type: 'findertoken_purchase',
      amount: amount,
      description: description
    });

    return { success: true, newBalance };
  }

  async getTransactionByReference(reference: string): Promise<Transaction | undefined> {
    const results = await db
      .select()
      .from(transactions)
      .where(eq(transactions.reference, reference))
      .limit(1);
    return results[0];
  }

  async getTransactionsByFinderId(finderId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.finderId, finderId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactionsWithUsers() {
    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        finderId: transactions.finderId,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        reference: transactions.reference,
        createdAt: transactions.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role
        },
        finder: {
          user: {
            firstName: sql<string>`finder_users.first_name`,
            lastName: sql<string>`finder_users.last_name`,
            email: sql<string>`finder_users.email`
          }
        }
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(finders, eq(transactions.finderId, finders.id))
      .leftJoin(sql`users as finder_users`, sql`finders.user_id = finder_users.id`)
      .orderBy(desc(transactions.createdAt));
  }

  async getAllContractsWithUsers() {
    return await db
      .select({
        id: contracts.id,
        amount: contracts.amount,
        escrowStatus: contracts.escrowStatus,
        createdAt: contracts.createdAt,
        clientId: contracts.clientId,
        finderId: contracts.finderId,
        client: {
          firstName: sql<string>`client_users.first_name`,
          lastName: sql<string>`client_users.last_name`,
          email: sql<string>`client_users.email`
        },
        finder: {
          user: {
            firstName: sql<string>`finder_users.first_name`,
            lastName: sql<string>`finder_users.last_name`,
            email: sql<string>`finder_users.email`
          }
        }
      })
      .from(contracts)
      .leftJoin(sql`users as client_users`, sql`contracts.client_id = client_users.id`)
      .leftJoin(finders, eq(contracts.finderId, finders.id))
      .leftJoin(sql`users as finder_users`, sql`finders.user_id = finder_users.id`)
      .orderBy(desc(contracts.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    // Add finder data for users with finder role
    const usersWithFinderData = await Promise.all(
      allUsers.map(async (user) => {
        if (user.role === 'finder') {
          const finder = await this.getFinderByUserId(user.id);
          return {
            ...user,
            finders: finder ? [{
              id: finder.id,
              findertokenBalance: finder.findertokenBalance
            }] : []
          };
        }
        return user;
      })
    );

    return usersWithFinderData;
  }



  // Messaging operations implementation
  async getConversation(clientId: string, proposalId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.clientId, clientId), eq(conversations.proposalId, proposalId)));
    return conversation || undefined;
  }

  async getConversationById(conversationId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));
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
        requestTitle: finds.title,
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
      .innerJoin(finds, eq(proposals.findId, finds.id))
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
        requestTitle: finds.title,
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
      .innerJoin(finds, eq(proposals.findId, finds.id))
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

  async getMessages(conversationId: string): Promise<Array<Message & { sender: { firstName: string; lastName: string; }; quotedMessage?: { content: string; sender: { firstName: string; lastName: string; } } }>> {
    const messagesWithSender = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        attachmentPaths: messages.attachmentPaths,
        attachmentNames: messages.attachmentNames,
        quotedMessageId: messages.quotedMessageId,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    // Fetch quoted messages separately
    const messagesWithQuoted = await Promise.all(
      messagesWithSender.map(async (message) => {
        if (!message.quotedMessageId) return message;

        const quotedMessage = await db
          .select({
            id: messages.id,
            content: messages.content,
            sender: {
              firstName: users.firstName,
              lastName: users.lastName,
            }
          })
          .from(messages)
          .innerJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.id, message.quotedMessageId))
          .limit(1);

        return {
          ...message,
          quotedMessage: quotedMessage[0] || null
        };
      })
    );

    return messagesWithQuoted;
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
      totalEarned: finder.totalEarned || "0.00",
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

  async getActiveCategories(): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getWithdrawalSettings(finderId: string): Promise<any> {
    const [result] = await db
      .select()
      .from(withdrawalSettings)
      .limit(1);

    if (!result) {
      // Return default settings if none exist
      return {
        paymentMethod: "bank_transfer",
        minimumThreshold: "50",
        processingFee: "45",
        processingTimeHours: 24,
        isActive: true
      };
    }

    return {
      minimumAmount: result.minimumAmount,
      processingFee: result.processingFee,
      processingTimeHours: result.processingTimeHours,
      isActive: result.isActive
    };
  }

  async updateWithdrawalSettings(finderId: string, settings: any): Promise<any> {
    const updateData = {
      minimumAmount: settings.minimumAmount || "1000",
      processingFee: settings.processingFee || "45",
      processingTimeHours: settings.processingTimeHours || 24,
      isActive: settings.isActive !== false,
      updatedAt: new Date()
    };

    const [existing] = await db
      .select()
      .from(withdrawalSettings)
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(withdrawalSettings)
        .set(updateData)
        .where(eq(withdrawalSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(withdrawalSettings)
        .values(updateData)
        .returning();
      return created;
    }
  }

  async getWithdrawalsByFinderId(finderId: string): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.finderId, finderId))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }


  async updateSecuritySettings(finderId: string, settings: any): Promise<any> {
    // Store security settings in the finder's profile for now
    // In a production app, you'd want a separate security_settings table
    const [updated] = await db
      .update(finders)
      .set({
        // Store security settings as JSON in a metadata field
        // Note: You may need to add a securitySettings column to the finders table
        updatedAt: new Date()
      })
      .where(eq(finders.id, finderId))
      .returning();

    // For now, return the settings as they would be stored
    return {
      twoFactorEnabled: settings.twoFactorEnabled || false,
      emailNotifications: settings.emailNotifications !== false,
      loginAlerts: settings.loginAlerts !== false,
      passwordRequirements: settings.passwordRequirements !== false
    };
  }

  async getSecuritySettings(finderId: string): Promise<any> {
    // Return default security settings for now
    // In production, you'd retrieve from a security_settings table
    return {
      twoFactorEnabled: false,
      emailNotifications: true,
      loginAlerts: true,
      passwordRequirements: true
    };
  }



  // User Ban Management
  async banUser(userId: string, reason: string): Promise<User | undefined> {
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
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    try {
      const [setting] = await db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.key, key))
        .limit(1);
      return setting || undefined;
    } catch (error) {
      console.error('Error getting admin setting:', error);
      return undefined;
    }
  }

  async setAdminSetting(key: string, value: string): Promise<AdminSetting> {
    try {
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
    } catch (error) {
      console.error('Error setting admin setting:', error);
      throw error;
    }
  }

  async getAdminSettings(): Promise<{[key: string]: string}> {
    try {
      const settings = await db.select().from(adminSettings);
      const result: {[key: string]: string} = {};
      settings.forEach(setting => {
        result[setting.key] = setting.value;
      });

      // Convert underscore keys to camelCase for consistency
      if (result['high_budget_threshold']) {
        result['highBudgetThreshold'] = result['high_budget_threshold'];
      }
      if (result['high_budget_token_cost']) {
        result['highBudgetTokenCost'] = result['high_budget_token_cost'];
      }

      // Set defaults if not exist
      const defaults = {
        proposalTokenCost: "1",
        findertokenPrice: "100",
        platformFeePercentage: "10",
        clientPaymentChargePercentage: "2.5",
        finderEarningsChargePercentage: "5",
        highBudgetThreshold: "100000",
        highBudgetTokenCost: "5"
      };

      Object.keys(defaults).forEach(key => {
        if (!result[key]) {
          result[key] = defaults[key as keyof typeof defaults];
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting admin settings:', error);
      return {
        proposalTokenCost: "1",
        findertokenPrice: "100",
        platformFeePercentage: "10",
        clientPaymentChargePercentage: "2.5",
        finderEarningsChargePercentage: "5",
        highBudgetThreshold: "100000",
        highBudgetTokenCost: "5"
      };
    }
  }

  async getClientProfile(clientId: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, clientId))
        .limit(1);
      return user || undefined;
    } catch (error) {
      console.error('Error getting client profile:', error);
      return undefined;
    }
  }

  async deductClientFindertokens(clientId: string, amount: number, description: string): Promise<void> {
    try {
      // First, check current balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, clientId))
        .limit(1);

      if (!user) {
        throw new Error('Client not found');
      }

      const currentBalance = user.findertokenBalance || 0;
      if (currentBalance < amount) {
        throw new Error(`Insufficient findertokens. Required: ${amount}, Available: ${currentBalance}`);
      }

      // Deduct tokens from user balance
      await db
        .update(users)
        .set({
          findertokenBalance: sql`${users.findertokenBalance} - ${amount}`
        })
        .where(eq(users.id, clientId));

      // Record transaction
      await db.insert(transactions).values({
        userId: clientId,
        amount: -amount, // Negative for deduction
        type: 'find_posting',
        description: description
      });

    } catch (error) {
      console.error('Error deducting client findertokens:', error);
      throw error;
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
        requestId: withdrawalRequests.requestId,
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

  async updateWithdrawalRequest(id: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined> {
    const [request] = await db
      .update(withdrawalRequests)
      .set({ ...updates, processedAt: new Date() })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request || undefined;
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

  // Release funds to finder's available balance with fee calculation
  async releaseFundsToFinder(finderId: string, contractAmount: string): Promise<void> {
    // Get current balance
    const finder = await this.getFinder(finderId);
    if (!finder) throw new Error('Finder not found');

    const currentBalance = parseFloat(finder.availableBalance || '0');
    const releaseAmount = parseFloat(contractAmount) / 100; // Convert from kobo to naira
    const newBalance = (currentBalance + releaseAmount).toFixed(2);

    console.log(`Releasing funds to finder ${finderId}: Current balance: ₦${currentBalance}, Release amount: ₦${releaseAmount}, New balance: ₦${newBalance}`);

    // Update available balance
    await db.update(finders)
      .set({ availableBalance: newBalance })
      .where(eq(finders.id, finderId));
  }


  // Finder Levels Management
  async getFinderLevels(): Promise<FinderLevel[]> {
    return await db
      .select()
      .from(finderLevels)
      .orderBy(finderLevels.order);
  }

  async getFinderLevel(id: string): Promise<FinderLevel | undefined> {
    const [level] = await db
      .select()
      .from(finderLevels)
      .where(eq(finderLevels.id, id));
    return level || undefined;
  }

  async createFinderLevel(levelData: InsertFinderLevel): Promise<FinderLevel> {
    const [level] = await db
      .insert(finderLevels)
      .values(levelData)
      .returning();
    return level;
  }

  async updateFinderLevel(id: string, updates: Partial<FinderLevel>): Promise<FinderLevel | undefined> {
    const [level] = await db
      .update(finderLevels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(finderLevels.id, id))
      .returning();
    return level || undefined;
  }

  async deleteFinderLevel(id: string): Promise<boolean> {
    const result = await db
      .delete(finderLevels)
      .where(eq(finderLevels.id, id))
      .returning();
    return result.length > 0;
  }

  async calculateFinderLevel(finderId: string): Promise<FinderLevel | undefined> {
    // Get finder's current stats
    const [finder] = await db
      .select()
      .from(finders)
      .where(eq(finders.id, finderId));

    if (!finder) return undefined;

    const totalEarned = parseFloat(finder.totalEarned || "0");
    const jobsCompleted = finder.jobsCompleted || 0;
    const avgRating = parseFloat(finder.averageRating || "0");

    // Get all levels ordered by requirements (descending)
    const levels = await db
      .select()
      .from(finderLevels)
      .where(eq(finderLevels.isActive, true))
      .orderBy(sql`${finderLevels.order} DESC`);

    // Find the highest level the finder qualifies for
    for (const level of levels) {
      const minEarned = parseFloat(level.minEarnedAmount || "0");
      const minJobs = level.minJobsCompleted || 0;
      const minRating = level.minReviewPercentage || 0;

      if (totalEarned >= minEarned &&
          jobsCompleted >= minJobs &&
          (avgRating * 20) >= minRating) { // Convert 5-star rating to percentage
        return level;
      }
    }

    // Return the lowest level (Novice) if no other level qualifies
    const [noviceLevel] = await db
      .select()
      .from(finderLevels)
      .where(eq(finderLevels.name, "Novice"));

    return noviceLevel || undefined;
  }

  async assignFinderLevel(finderId: string, levelId: string): Promise<void> {
    await db
      .update(finders)
      .set({ currentLevelId: levelId })
      .where(eq(finders.id, finderId));
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

  async getPublishedBlogPosts(): Promise<BlogPost[]>{
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
      .where(eq(orderSubmissions.contractId, contractId))
      .orderBy(desc(orderSubmissions.submittedAt))
      .limit(1);
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

    // If accepting submission, update request status to completed, contract, and release funds
    if (updates.status === 'accepted' && submission) {
      const contract = await this.getContract(submission.contractId);
      if (contract) {
        // Update request status to completed
        await db
          .update(finds)
          .set({ status: 'completed' })
          .where(eq(finds.id, contract.findId));

        // Update contract as completed and released
        await db
          .update(contracts)
          .set({
            isCompleted: true,
            completedAt: new Date(),
            escrowStatus: 'released'
          })
          .where(eq(contracts.id, submission.contractId));

        // Release funds to finder's available balance
        await this.releaseFundsToFinder(contract.finderId, contract.amount);
      }
    }

    return submission || undefined;
  }

  async getContractWithSubmission(contractId: string): Promise<(Contract & {orderSubmission?: OrderSubmission, finder?: any}) | undefined> {
    // Get the contract with finder information
    const [contractData] = await db
      .select({
        id: contracts.id,
        findId: contracts.findId,
        proposalId: contracts.proposalId,
        clientId: contracts.clientId,
        finderId: contracts.finderId,
        amount: contracts.amount,
        escrowStatus: contracts.escrowStatus,
        isCompleted: contracts.isCompleted,
        hasSubmission: contracts.hasSubmission,
        createdAt: contracts.createdAt,
        completedAt: contracts.completedAt,
        finder: {
          name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown Finder')`,
          email: users.email,
          rating: finders.averageRating
        }
      })
      .from(contracts)
      .leftJoin(finders, eq(contracts.finderId, finders.id))
      .leftJoin(users, eq(finders.userId, users.id))
      .where(eq(contracts.id, contractId));

    if (!contractData) return undefined;

    // Then get the latest order submission for this contract
    const latestSubmission = await this.getOrderSubmissionByContractId(contractId);

    return {
      ...contractData,
      orderSubmission: latestSubmission || undefined
    };
  }

  // Token charging method
  async chargeFinderTokens(finderId: string, amount: number, reason: string, chargedBy: string): Promise<boolean> {
    try {
      // Get current token balance
      const tokenRecord = await this.getFindertokenBalance(finderId);
      if (!tokenRecord) {
        return false; // Finder has no token record
      }

      const currentBalance = parseInt(tokenRecord.balance);
      if (currentBalance < amount) {
        return false; // Insufficient balance
      }

      // Update balance
      await this.updateFindertokenBalance(finderId, currentBalance - amount);

      // Create transaction record
      await this.createTransaction({
        finderId,
        amount: amount.toString(),
        type: 'charge',
        description: `Admin charge: ${reason}`,
        status: 'completed'
      });

      return true;
    } catch (error) {
      console.error('Error charging finder tokens:', error);
      return false;
    }
  }

  // Monthly token distribution methods
  async distributeMonthlyTokens(): Promise<{ distributed: number; alreadyDistributed: number; }> {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    const tokensToGrant = 20;

    // Get all active finders
    const allFinders = await this.getAllFindersForTokens();

    let distributed = 0;
    let alreadyDistributed = 0;

    for (const finder of allFinders) {
      // Check if already received tokens this month
      const hasReceived = await this.hasReceivedMonthlyTokens(finder.id, month, year);

      if (!hasReceived) {
        // Grant tokens
        await this.createMonthlyDistribution({
          finderId: finder.id,
          month,
          year,
          tokensGranted: tokensToGrant
        });

        // Update finder token balance
        const currentBalance = finder.findertokenBalance || 0;
        await this.updateFinder(finder.id, {
          findertokenBalance: currentBalance + tokensToGrant
        });

        distributed++;
      } else {
        alreadyDistributed++;
      }
    }

    return { distributed, alreadyDistributed };
  }

  async getMonthlyDistributions(month: number, year: number): Promise<MonthlyTokenDistribution[]>{
    const result = await db
      .select({
        id: monthlyTokenDistributions.id,
        finderId: monthlyTokenDistributions.finderId,
        month: monthlyTokenDistributions.month,
        year: monthlyTokenDistributions.year,
        tokensGranted: monthlyTokenDistributions.tokensGranted,
        distributedAt: monthlyTokenDistributions.distributedAt,
        // Finder fields
        finderId_finder: finders.id,
        // User fields
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(monthlyTokenDistributions)
      .innerJoin(finders, eq(monthlyTokenDistributions.finderId, finders.id))
      .innerJoin(users, eq(finders.userId, users.id))
      .where(and(
        eq(monthlyTokenDistributions.month, month),
        eq(monthlyTokenDistributions.year, year)
      ))
      .orderBy(desc(monthlyTokenDistributions.distributedAt));

    return result.map(row => ({
      id: row.id,
      finderId: row.finderId,
      month: row.month,
      year: row.year,
      tokensGranted: row.tokensGranted,
      distributedAt: row.distributedAt,
      finder: {
        id: row.finderId_finder,
        user: {
          firstName: row.userFirstName,
          lastName: row.userLastName,
          email: row.userEmail,
        },
      },
    }));
  }

  async hasReceivedMonthlyTokens(finderId: string, month: number, year: number): Promise<boolean> {
    const [distribution] = await db
      .select()
      .from(monthlyTokenDistributions)
      .where(and(
        eq(monthlyTokenDistributions.finderId, finderId),
        eq(monthlyTokenDistributions.month, month),
        eq(monthlyTokenDistributions.year, year)
      ))
      .limit(1);

    return !!distribution;
  }

  async createMonthlyDistribution(distribution: InsertMonthlyTokenDistribution): Promise<MonthlyTokenDistribution> {
    const [created] = await db
      .insert(monthlyTokenDistributions)
      .values(distribution)
      .returning();
    return created;
  }

  // Token grant methods
  async grantTokensToFinder(finderId: string, amount: number, reason: string, grantedBy: string): Promise<TokenGrant> {
    // Create grant record
    const [grant] = await db
      .insert(tokenGrants)
      .values({
        finderId,
        amount,
        reason,
        grantedBy
      })
      .returning();

    // Update finder token balance
    const finder = await this.getFinder(finderId);
    if (finder) {
      const currentBalance = finder.findertokenBalance || 0;
      await this.updateFinder(finderId, {
        findertokenBalance: currentBalance + amount
      });
    }

    return grant;
  }

  async grantTokensToClient(userId: string, amount: number, reason: string, grantedBy: string): Promise<ClientTokenGrant> {
    return await db.transaction(async (tx) => {
      // Verify user is a client
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0 || user[0].role !== 'client') {
        throw new Error('Client not found');
      }

      // Create client token grant record
      const [grant] = await tx.insert(clientTokenGrants).values({
        clientId: userId,
        amount,
        reason,
        grantedBy
      }).returning();

      // Update client token balance
      const newBalance = (user[0].findertokenBalance || 0) + amount;
      await tx.update(users)
        .set({ findertokenBalance: newBalance })
        .where(eq(users.id, userId));

      // Create transaction record
      await tx.insert(transactions).values({
        userId,
        finderId: null,
        amount,
        type: 'admin_grant',
        description: `Admin granted tokens to client: ${reason}`
      });

      return grant;
    });
  }

  async getTokenGrants(userId?: string): Promise<any[]> {
    // Get finder grants
    const finderGrants = await db
      .select({
        id: tokenGrants.id,
        userId: users.id,
        userType: sql<string>`'finder'`.as('userType'),
        amount: tokenGrants.amount,
        reason: tokenGrants.reason,
        grantedBy: tokenGrants.grantedBy,
        createdAt: tokenGrants.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(tokenGrants)
      .leftJoin(finders, eq(tokenGrants.finderId, finders.id))
      .leftJoin(users, eq(finders.userId, users.id))
      .where(userId ? eq(users.id, userId) : undefined);

    // Get client grants
    const clientGrants = await db
      .select({
        id: clientTokenGrants.id,
        userId: users.id,
        userType: sql<string>`'client'`.as('userType'),
        amount: clientTokenGrants.amount,
        reason: clientTokenGrants.reason,
        grantedBy: clientTokenGrants.grantedBy,
        createdAt: clientTokenGrants.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(clientTokenGrants)
      .leftJoin(users, eq(clientTokenGrants.clientId, users.id))
      .where(userId ? eq(users.id, userId) : undefined);

    // Combine and sort by creation date
    const allGrants = [...finderGrants, ...clientGrants];
    return allGrants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllFindersForTokens(): Promise<Finder[]> {
    // Get all finders whose users are not banned
    const results = await db
      .select({
        id: finders.id,
        userId: finders.userId,
        jobsCompleted: finders.jobsCompleted,
        totalEarned: finders.totalEarned,
        availableBalance: finders.availableBalance,
        averageRating: finders.averageRating,
        currentLevelId: finders.currentLevelId,
        bio: finders.bio,
        category: finders.category,
        skills: finders.skills,
        hourlyRate: finders.hourlyRate,
        availability: finders.availability,
        phone: finders.phone,
        isVerified: finders.isVerified,
        findertokenBalance: finders.findertokenBalance,
        createdAt: finders.createdAt,
      })
      .from(finders)
      .innerJoin(users, eq(finders.userId, users.id))
      .where(eq(users.isBanned, false));

    return results;
  }

  // Strike System implementations
  async issueStrike(strike: InsertStrike): Promise<Strike> {
    const [newStrike] = await db
      .insert(strikes)
      .values({
        ...strike,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      })
      .returning();
    return newStrike;
  }

  async getStrikesByUserId(userId: string): Promise<Strike[]> {
    return await db
      .select()
      .from(strikes)
      .where(eq(strikes.userId, userId))
      .orderBy(desc(strikes.createdAt));
  }

  async getActiveStrikesCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(strikes)
      .where(and(
        eq(strikes.userId, userId),
        eq(strikes.status, 'active')
      ));
    return result[0]?.count || 0;
  }

  async updateStrike(id: string, updates: Partial<Strike>): Promise<Strike | undefined> {
    const [strike] = await db
      .update(strikes)
      .set(updates)
      .where(eq(strikes.id, id))
      .returning();
    return strike || undefined;
  }

  async createUserRestriction(restriction: InsertUserRestriction): Promise<UserRestriction> {
    const [newRestriction] = await db
      .insert(userRestrictions)
      .values(restriction)
      .returning();
    return newRestriction;
  }

  async getUserActiveRestrictions(userId: string): Promise<UserRestriction[]>{
    return await db
      .select()
      .from(userRestrictions)
      .where(and(
        eq(userRestrictions.userId, userId),
        eq(userRestrictions.isActive, true)
      ))
      .orderBy(desc(userRestrictions.createdAt));
  }

  async updateUserRestriction(id: string, updates: Partial<UserRestriction>): Promise<UserRestriction | undefined> {
    const [restriction] = await db
      .update(userRestrictions)
      .set(updates)
      .where(eq(userRestrictions.id, id))
      .returning();
    return restriction || undefined;
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db
      .insert(disputes)
      .values(dispute)
      .returning();
    return newDispute;
  }

  async getDisputesByUserId(userId: string): Promise<Dispute[]> {
    return await db
      .select()
      .from(disputes)
      .where(eq(disputes.userId, userId))
      .orderBy(desc(disputes.submittedAt));
  }

  async getAllDisputes(): Promise<Dispute[]> {
    return await db
      .select()
      .from(disputes)
      .orderBy(desc(disputes.submittedAt));
  }

  async updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const [dispute] = await db
      .update(disputes)
      .set(updates)
      .where(eq(disputes.id, id))
      .returning();
    return dispute || undefined;
  }

  async assignTraining(training: InsertBehavioralTraining): Promise<BehavioralTraining> {
    const [newTraining] = await db
      .insert(behavioralTraining)
      .values(training)
      .returning();
    return newTraining;
  }

  async getTrainingsByUserId(userId: string): Promise<BehavioralTraining[]> {
    return await db
      .select()
      .from(behavioralTraining)
      .where(eq(behavioralTraining.userId, userId))
      .orderBy(desc(behavioralTraining.assignedDate));
  }

  async updateTraining(id: string, updates: Partial<BehavioralTraining>): Promise<BehavioralTraining | undefined> {
    const [training] = await db
      .update(behavioralTraining)
      .set(updates)
      .where(eq(behavioralTraining.id, id))
      .returning();
    return training || undefined;
  }

  async awardBadge(badge: InsertTrustedBadge): Promise<TrustedBadge> {
    const [newBadge] = await db
      .insert(trustedBadges)
      .values(badge)
      .returning();
    return newBadge;
  }

  async getUserBadges(userId: string): Promise<TrustedBadge[]> {
    return await db
      .select()
      .from(trustedBadges)
      .where(and(
        eq(trustedBadges.userId, userId),
        eq(trustedBadges.isActive, true)
      ))
      .orderBy(desc(trustedBadges.earnedDate));
  }

  async updateBadge(id: string, updates: Partial<TrustedBadge>): Promise<TrustedBadge | undefined> {
    const [badge] = await db
      .update(trustedBadges)
      .set(updates)
      .where(eq(trustedBadges.id, id))
      .returning();
    return badge || undefined;
  }

  async getUserStrikeLevel(userId: string): Promise<number> {
    const activeStrikes = await this.getActiveStrikesCount(userId);
    return Math.min(activeStrikes, 4); // Cap at level 4 for permanent ban
  }

  // Restricted Words Management
  async addRestrictedWord(word: InsertRestrictedWord): Promise<RestrictedWord> {
    const [newWord] = await db
      .insert(restrictedWords)
      .values(word)
      .returning();
    return newWord;
  }

  async getRestrictedWords(): Promise<RestrictedWord[]> {
    return await db
      .select()
      .from(restrictedWords)
      .where(eq(restrictedWords.isActive, true))
      .orderBy(desc(restrictedWords.createdAt));
  }

  async removeRestrictedWord(id: string): Promise<boolean> {
    const result = await db
      .update(restrictedWords)
      .set({ isActive: false })
      .where(eq(restrictedWords.id, id))
      .returning();
    return result.length > 0;
  }

  async updateRestrictedWord(id: string, updates: Partial<RestrictedWord>): Promise<RestrictedWord | undefined> {
    const [word] = await db
      .update(restrictedWords)
      .set(updates)
      .where(eq(restrictedWords.id, id))
      .returning();
    return word || undefined;
  }

  async checkContentForRestrictedWords(content: string): Promise<string[]> {
    const words = await this.getRestrictedWords();
    const foundWords: string[] = [];

    const contentLower = content.toLowerCase();
    words.forEach(restrictedWord => {
      if (contentLower.includes(restrictedWord.word.toLowerCase())) {
        foundWords.push(restrictedWord.word);
      }
    });

    return foundWords;
  }

  // Token Package operations
  async getAllTokenPackages(): Promise<TokenPackage[]> {
    return await db
      .select()
      .from(tokenPackages)
      .orderBy(desc(tokenPackages.createdAt));
  }

  async getActiveTokenPackages(): Promise<TokenPackage[]> {
    return await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.isActive, true))
      .orderBy(desc(tokenPackages.createdAt));
  }

  async getTokenPackage(id: string): Promise<TokenPackage | undefined> {
    const result = await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.id, id))
      .limit(1);
    return result[0];
  }

  async createTokenPackage(tokenPackage: InsertTokenPackage): Promise<TokenPackage> {
    const [result] = await db
      .insert(tokenPackages)
      .values(tokenPackage)
      .returning();
    return result;
  }

  async updateTokenPackage(id: string, updates: Partial<TokenPackage>): Promise<TokenPackage | undefined> {
    const [result] = await db
      .update(tokenPackages)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tokenPackages.id, id))
      .returning();
    return result;
  }

  async deleteTokenPackage(id: string): Promise<boolean> {
    const result = await db
      .delete(tokenPackages)
      .where(eq(tokenPackages.id, id));
    return result.rowCount > 0;
  }

  // Support Agent Management
  async createSupportAgent(data: InsertSupportAgent & { agentId: string }) {
    const [agent] = await db.insert(supportAgents).values({
      ...data,
      updatedAt: new Date()
    }).returning();
    return agent;
  }

  async getSupportAgents() {
    const results = await db
      .select({
        id: supportAgents.id,
        userId: supportAgents.userId,
        agentId: supportAgents.agentId,
        department: supportAgents.department,
        permissions: supportAgents.permissions,
        isActive: supportAgents.isActive,
        maxTicketsPerDay: supportAgents.maxTicketsPerDay,
        responseTimeTarget: supportAgents.responseTimeTarget,
        specializations: supportAgents.specializations,
        languages: supportAgents.languages,
        suspendedAt: supportAgents.suspendedAt,
        suspensionReason: supportAgents.suspensionReason,
        createdAt: supportAgents.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .orderBy(supportAgents.createdAt);

    // Map snake_case to camelCase for frontend
    return results.map(agent => ({
      id: agent.id,
      userId: agent.userId,
      agentId: agent.agentId,
      department: agent.department,
      permissions: agent.permissions,
      isActive: agent.isActive,
      maxTicketsPerDay: agent.maxTicketsPerDay,
      responseTimeTarget: agent.responseTimeTarget,
      specializations: agent.specializations,
      languages: agent.languages,
      suspendedAt: agent.suspendedAt,
      suspensionReason: agent.suspensionReason,
      createdAt: agent.createdAt,
      user: agent.user,
    }));
  }

  async getSupportAgent(id: string) {
    const [agent] = await db
      .select({
        id: supportAgents.id,
        userId: supportAgents.userId,
        agentId: supportAgents.agentId,
        department: supportAgents.department,
        permissions: supportAgents.permissions,
        isActive: supportAgents.isActive,
        maxTicketsPerDay: supportAgents.maxTicketsPerDay,
        responseTimeTarget: supportAgents.responseTimeTarget,
        specializations: supportAgents.specializations,
        languages: supportAgents.languages,
        suspendedAt: supportAgents.suspendedAt,
        suspensionReason: supportAgents.suspensionReason,
        createdAt: supportAgents.createdAt,
        updatedAt: supportAgents.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(eq(supportAgents.id, id));

    if (!agent) return null;

    // Map snake_case to camelCase for frontend
    return {
      id: agent.id,
      userId: agent.userId,
      agentId: agent.agentId,
      department: agent.department,
      permissions: agent.permissions,
      isActive: agent.isActive,
      maxTicketsPerDay: agent.maxTicketsPerDay,
      responseTimeTarget: agent.responseTimeTarget,
      specializations: agent.specializations,
      languages: agent.languages,
      suspendedAt: agent.suspendedAt,
      suspensionReason: agent.suspensionReason,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      user: agent.user,
    };
  }

  async updateSupportAgent(id: string, data: Partial<InsertSupportAgent>) {
    const [agent] = await db
      .update(supportAgents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportAgents.id, id))
      .returning();
    return agent;
  }

  async suspendSupportAgent(id: string, reason: string) {
    return await this.updateSupportAgent(id, {
      isActive: false,
      suspendedAt: new Date(),
      suspensionReason: reason,
    });
  }

  async reactivateSupportAgent(id: string) {
    return await this.updateSupportAgent(id, {
      isActive: true,
      suspendedAt: null,
      suspensionReason: null,
    });
  }

  async deleteSupportAgent(id: string) {
    const result = await db.delete(supportAgents).where(eq(supportAgents.id, id));
    return result.rowCount > 0;
  }

  async generateAgentId(): Promise<string> {
    const agents = await db.select({ agentId: supportAgents.agentId }).from(supportAgents);
    const existingIds = new Set(agents.map(a => a.agentId));

    let counter = 1;
    let agentId: string;

    do {
      agentId = `AGT${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingIds.has(agentId) && counter < 1000);

    return agentId;
  }

  async getSupportDepartments() {
    return await db
      .select()
      .from(supportDepartments)
      .where(eq(supportDepartments.isActive, true))
      .orderBy(supportDepartments.name);
  }

  async createSupportDepartment(data: InsertSupportDepartment) {
    const [department] = await db.insert(supportDepartments).values(data).returning();
    return department;
  }

  async updateSupportDepartment(id: string, data: Partial<InsertSupportDepartment>) {
    const [department] = await db
      .update(supportDepartments)
      .set(data)
      .where(eq(supportDepartments.id, id))
      .returning();
    return department;
  }

  async deleteSupportDepartment(id: string) {
    const result = await db.delete(supportDepartments).where(eq(supportDepartments.id, id));
    return result.rowCount > 0;
  }

  // Support Agent Check
  async getUserSupportAgent(userId: string) {
    const [agent] = await db
      .select()
      .from(supportAgents)
      .where(eq(supportAgents.userId, userId));
    return agent;
  }

  async generateWithdrawalRequestId(): Promise<string> {
    const year = new Date().getFullYear();

    // Get count of withdrawal requests this year
    const yearStart = new Date(year, 0, 1);
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(withdrawalRequests)
      .where(sql`${withdrawalRequests.requestedAt} >= ${yearStart}`);

    const count = result[0]?.count || 0;
    const nextNumber = count + 1;

    return `WR-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Restricted Words Management
  async checkContentForRestrictedWords(content: string): Promise<string[]> {
    try {
      const words = await this.getRestrictedWords();
      const activeWords = words.filter(w => w.isActive);

      const contentLower = content.toLowerCase();
      const flaggedWords: string[] = [];

      for (const wordObj of activeWords) {
        if (contentLower.includes(wordObj.word.toLowerCase())) {
          flaggedWords.push(wordObj.word);
        }
      }

      return flaggedWords;
    } catch (error) {
      console.error('Error checking content for restricted words:', error);
      return [];
    }
  }

  async getRestrictedWords(): Promise<RestrictedWord[]> {
    return await db.select().from(restrictedWords).orderBy(restrictedWords.word);
  }

  async addRestrictedWord(data: InsertRestrictedWord): Promise<RestrictedWord> {
    const [word] = await db.insert(restrictedWords).values(data).returning();
    return word;
  }

  async removeRestrictedWord(id: string): Promise<boolean> {
    const result = await db.delete(restrictedWords).where(eq(restrictedWords.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();