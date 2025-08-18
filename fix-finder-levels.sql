-- Fix finder_id column conflict in findertokens table
ALTER TABLE findertokens DROP COLUMN IF EXISTS finder_id;

-- Ensure finder_levels table exists with correct structure
CREATE TABLE IF NOT EXISTS finder_levels (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  min_earned_amount VARCHAR DEFAULT '0',
  min_jobs_completed INTEGER DEFAULT 0,
  min_review_percentage INTEGER DEFAULT 0,
  icon VARCHAR DEFAULT 'User',
  icon_url VARCHAR,
  color VARCHAR DEFAULT '#3b82f6',
  "order" INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default finder levels if none exist
INSERT INTO finder_levels (name, description, min_earned_amount, min_jobs_completed, min_review_percentage, icon, color, "order", is_active)
SELECT 'Novice', 'New finders just starting out', '0', 0, 0, 'User', '#10b981', 1, true
WHERE NOT EXISTS (SELECT 1 FROM finder_levels WHERE name = 'Novice');

INSERT INTO finder_levels (name, description, min_earned_amount, min_jobs_completed, min_review_percentage, icon, color, "order", is_active)
SELECT 'Professional', 'Experienced finders with proven track record', '1000', 5, 80, 'Award', '#f59e0b', 2, true  
WHERE NOT EXISTS (SELECT 1 FROM finder_levels WHERE name = 'Professional');

INSERT INTO finder_levels (name, description, min_earned_amount, min_jobs_completed, min_review_percentage, icon, color, "order", is_active)
SELECT 'Expert', 'Top-tier finders with exceptional performance', '5000', 20, 90, 'Crown', '#ef4444', 3, true
WHERE NOT EXISTS (SELECT 1 FROM finder_levels WHERE name = 'Expert');