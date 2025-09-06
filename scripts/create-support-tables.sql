
-- Create support departments table
CREATE TABLE IF NOT EXISTS support_departments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create support agents table
CREATE TABLE IF NOT EXISTS support_agents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) UNIQUE,
  agent_id VARCHAR NOT NULL UNIQUE,
  department TEXT NOT NULL,
  permissions TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_tickets_per_day INTEGER DEFAULT 20,
  response_time_target INTEGER DEFAULT 24,
  specializations TEXT[],
  languages TEXT[] DEFAULT ARRAY['en'],
  assigned_by VARCHAR NOT NULL REFERENCES users(id),
  suspended_at TIMESTAMP,
  suspension_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR NOT NULL UNIQUE,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_id VARCHAR REFERENCES users(id),
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  department TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  assigned_to VARCHAR REFERENCES support_agents(id),
  assigned_at TIMESTAMP,
  response_time_deadline TIMESTAMP,
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  satisfaction_rating INTEGER,
  satisfaction_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create support ticket messages table
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR NOT NULL REFERENCES support_tickets(id),
  sender_id VARCHAR NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default departments
INSERT INTO support_departments (name, description) VALUES
('general', 'General Support'),
('technical', 'Technical Support'),
('billing', 'Billing & Payments'),
('disputes', 'Disputes & Moderation'),
('verification', 'Account Verification')
ON CONFLICT DO NOTHING;
