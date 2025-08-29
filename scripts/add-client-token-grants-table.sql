
-- Migration: Add client token grants table
-- Date: 2025-01-14

-- Create client_token_grants table
CREATE TABLE IF NOT EXISTS "client_token_grants" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" varchar NOT NULL,
  "amount" integer NOT NULL,
  "reason" text NOT NULL,
  "granted_by" varchar NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "client_token_grants" ADD CONSTRAINT "client_token_grants_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "client_token_grants" ADD CONSTRAINT "client_token_grants_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_client_token_grants_client_id" ON "client_token_grants"("client_id");
CREATE INDEX IF NOT EXISTS "idx_client_token_grants_created_at" ON "client_token_grants"("created_at");
