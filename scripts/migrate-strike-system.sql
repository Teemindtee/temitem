
-- Migration to add strike system tables

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;

-- Add updated_at column to strikes table if it doesn't exist
ALTER TABLE strikes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create user_restrictions table
CREATE TABLE IF NOT EXISTS user_restrictions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  restriction_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  strike_id VARCHAR NOT NULL REFERENCES strikes(id),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  resolution TEXT,
  reviewed_by VARCHAR REFERENCES users(id),
  reviewed_at TIMESTAMP
);

-- Create behavioral_training table
CREATE TABLE IF NOT EXISTS behavioral_training (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  module_type TEXT NOT NULL,
  status TEXT DEFAULT 'assigned',
  assigned_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  score INTEGER
);

-- Create trusted_badges table
CREATE TABLE IF NOT EXISTS trusted_badges (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  badge_type TEXT NOT NULL,
  awarded_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strikes_user_id ON strikes(user_id);
CREATE INDEX IF NOT EXISTS idx_strikes_status ON strikes(status);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_user_id ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_active ON user_restrictions(is_active);
CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_behavioral_training_user_id ON behavioral_training(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_badges_user_id ON trusted_badges(user_id);
