-- FinderMeister Database Export
-- Generated on: $(date)
-- Database: FinderMeister Service Marketplace Platform

SET session_replication_role = replica;

-- Table: users
DROP TABLE IF EXISTS "users" CASCADE;

-- Table: finders
DROP TABLE IF EXISTS "finders" CASCADE;

-- Table: tokens
DROP TABLE IF EXISTS "tokens" CASCADE;

-- Table: requests
DROP TABLE IF EXISTS "requests" CASCADE;

-- Table: proposals
DROP TABLE IF EXISTS "proposals" CASCADE;

-- Table: contracts
DROP TABLE IF EXISTS "contracts" CASCADE;

-- Table: conversations
DROP TABLE IF EXISTS "conversations" CASCADE;

-- Table: messages
DROP TABLE IF EXISTS "messages" CASCADE;

-- Table: order_submissions
DROP TABLE IF EXISTS "order_submissions" CASCADE;

-- Table: reviews
DROP TABLE IF EXISTS "reviews" CASCADE;

-- Table: transactions
DROP TABLE IF EXISTS "transactions" CASCADE;

-- Table: withdrawal_requests
DROP TABLE IF EXISTS "withdrawal_requests" CASCADE;

-- Table: withdrawal_settings
DROP TABLE IF EXISTS "withdrawal_settings" CASCADE;

-- Table: categories
DROP TABLE IF EXISTS "categories" CASCADE;

-- Table: blog_posts
DROP TABLE IF EXISTS "blog_posts" CASCADE;

-- Table: admin_settings
DROP TABLE IF EXISTS "admin_settings" CASCADE;

SET session_replication_role = DEFAULT;
