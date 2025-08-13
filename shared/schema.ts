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
  role: text("role").notNull(), // 'client', 'finder', 'admin'
  isVerified: boolean("is_verified").default(false),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const finders = pgTable("finders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobsCompleted: integer("jobs_completed").default(0),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0.00"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  level: text("level").default("Novice"), // 'Novice', 'Professional', 'Expert', 'Master'
  bio: text("bio"),
  phone: text("phone"),
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
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  timeframe: text("timeframe"),
  status: text("status").default("active"), // 'active', 'on_hold', 'approved', 'completed'
  tokenCost: integer("token_cost").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => requests.id).notNull(),
  finderId: varchar("finder_id").references(() => finders.id).notNull(),
  approach: text("approach").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
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
  contract: one(contracts),
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
    relationName: "clientContracts",
  }),
  finder: one(users, {
    fields: [contracts.finderId],
    references: [users.id],
    relationName: "finderContracts",
  }),
  reviews: many(reviews),
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

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Finder = typeof finders.$inferSelect;
export type InsertFinder = z.infer<typeof insertFinderSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Token = typeof tokens.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
