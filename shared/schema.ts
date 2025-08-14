import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'client', 'finder', 'admin'
  isVerified: boolean("is_verified").default(false),
  isBanned: boolean("is_banned").default(false),
  bannedReason: text("banned_reason"),
  bannedAt: timestamp("banned_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const finders = pgTable("finders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobsCompleted: integer("jobs_completed").default(0),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0.00"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0.00"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  level: text("level").default("Novice"), // 'Novice', 'Professional', 'Expert', 'Master'
  bio: text("bio"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  balance: integer("balance").default(0),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  budgetMin: text("budget_min"),
  budgetMax: text("budget_max"),
  timeframe: text("timeframe"),
  status: text("status").default("open"), // 'open', 'in_progress', 'completed'
  tokenCost: integer("token_cost").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => requests.id).notNull(),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  approach: text("approach").notNull(),
  price: text("price").notNull(),
  timeline: text("timeline").notNull(),
  notes: text("notes"),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => requests.id).notNull(),
  proposalId: varchar("proposal_id").references(() => proposals.id).notNull(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  escrowStatus: text("escrow_status").default("held"), // 'held', 'in_progress', 'completed', 'released'
  isCompleted: boolean("is_completed").default(false),
  hasSubmission: boolean("has_submission").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'purchase', 'proposal', 'refund'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  proposalId: varchar("proposal_id").references(() => proposals.id).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // 'pending', 'processing', 'approved', 'rejected'
  paymentMethod: text("payment_method").notNull(), // 'bank_transfer', 'paypal', 'crypto'
  paymentDetails: text("payment_details").notNull(), // JSON string with payment info
  adminNotes: text("admin_notes"),
  processedBy: varchar("processed_by").references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderSubmissions = pgTable("order_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  submissionText: text("submission_text"),
  attachmentPaths: text("attachment_paths").array(), // array of file paths
  status: text("status").default("submitted"), // 'submitted', 'accepted', 'rejected'
  clientFeedback: text("client_feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  autoReleaseDate: timestamp("auto_release_date"), // 3 days after acceptance or 5 days after submission
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  finder: one(finders, {
    fields: [users.id],
    references: [finders.userId],
  }),
  requests: many(requests),
  clientContracts: many(contracts, { relationName: "clientContracts" }),
  finderContracts: many(contracts, { relationName: "finderContracts" }),
  clientReviews: many(reviews, { relationName: "clientReviews" }),
  finderReviews: many(reviews, { relationName: "finderReviews" }),
  clientConversations: many(conversations, { relationName: "clientConversations" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
}));

export const findersRelations = relations(finders, ({ one, many }) => ({
  user: one(users, {
    fields: [finders.userId],
    references: [users.id],
  }),
  tokens: one(tokens),
  proposals: many(proposals),
  contracts: many(contracts, { relationName: "finderContracts" }),
  transactions: many(transactions),
  reviews: many(reviews, { relationName: "finderReviews" }),
  finderConversations: many(conversations, { relationName: "finderConversations" }),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  client: one(users, {
    fields: [requests.clientId],
    references: [users.id],
  }),
  proposals: many(proposals),
  contracts: many(contracts),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  request: one(requests, {
    fields: [proposals.requestId],
    references: [requests.id],
  }),
  finder: one(finders, {
    fields: [proposals.finderId],
    references: [finders.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  request: one(requests, {
    fields: [contracts.requestId],
    references: [requests.id],
  }),
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id],
  }),
  client: one(users, {
    fields: [contracts.clientId],
    references: [users.id],
  }),
  finder: one(finders, {
    fields: [contracts.finderId],
    references: [finders.id],
  }),
  orderSubmissions: many(orderSubmissions),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  contract: one(contracts, {
    fields: [reviews.contractId],
    references: [contracts.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
    relationName: "clientReviews",
  }),
  finder: one(users, {
    fields: [reviews.finderId],
    references: [users.id],
    relationName: "finderReviews",
  }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  finder: one(finders, {
    fields: [tokens.finderId],
    references: [finders.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  finder: one(finders, {
    fields: [transactions.finderId],
    references: [finders.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  client: one(users, {
    fields: [conversations.clientId],
    references: [users.id],
    relationName: "clientConversations",
  }),
  finder: one(finders, {
    fields: [conversations.finderId],
    references: [finders.id],
    relationName: "finderConversations",
  }),
  proposal: one(proposals, {
    fields: [conversations.proposalId],
    references: [proposals.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const orderSubmissionsRelations = relations(orderSubmissions, ({ one }) => ({
  contract: one(contracts, {
    fields: [orderSubmissions.contractId],
    references: [contracts.id],
  }),
  finder: one(finders, {
    fields: [orderSubmissions.finderId],
    references: [finders.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Finder = typeof finders.$inferSelect;
export type InsertFinder = typeof finders.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;

// Categories
export const insertCategorySchema = createInsertSchema(categories);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Withdrawal Requests
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFinderSchema = createInsertSchema(finders).omit({
  id: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type InsertFinderType = z.infer<typeof insertFinderSchema>;
export type InsertRequestType = z.infer<typeof insertRequestSchema>;
export type InsertProposalType = z.infer<typeof insertProposalSchema>;
export type InsertContractType = z.infer<typeof insertContractSchema>;
export type InsertReviewType = z.infer<typeof insertReviewSchema>;
export type InsertTokenType = z.infer<typeof insertTokenSchema>;
export type InsertTransactionType = z.infer<typeof insertTransactionSchema>;
export type InsertAdminSettingType = z.infer<typeof insertAdminSettingSchema>;
export type InsertConversationType = z.infer<typeof insertConversationSchema>;
export type InsertMessageType = z.infer<typeof insertMessageSchema>;
export type InsertBlogPostType = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Order Submissions
export const insertOrderSubmissionSchema = createInsertSchema(orderSubmissions).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  autoReleaseDate: true,
});
export type InsertOrderSubmissionType = z.infer<typeof insertOrderSubmissionSchema>;
export type OrderSubmission = typeof orderSubmissions.$inferSelect;
export type InsertOrderSubmission = typeof orderSubmissions.$inferInsert;