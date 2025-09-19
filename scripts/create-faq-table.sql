
-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- Create index on is_active for public queries
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);

-- Insert sample FAQs (only if table is empty)
INSERT INTO faqs (question, answer, category, tags, sort_order) 
SELECT * FROM (VALUES
  ('Who can join FinderMeister?', 'Two roles, one community (you can be both): Clients — Anyone who needs something sourced or a task executed: individuals, students, small businesses/brands, event planners, NGOs, and Nigerians in the diaspora. Clients pay safely via escrow and can optionally boost requests with FinderTokens (required for high-budget finds > ₦50,000). Finders — Resourceful people who can locate items/services or carry out tasks reliably: students, side-hustlers, personal shoppers, couriers, fixers, and professionals.', 'Getting Started', ARRAY['registration', 'client', 'finder', 'community'], 1),
  ('Do I need technical expertise or special skills?', 'No. You don''t need coding or advanced skills. If you''re good at locating items (gadgets, accommodation, groceries, pharmaceuticals, thrift) or handling tasks (errands, delivery, event setup), you qualify.', 'Getting Started', ARRAY['skills', 'requirements', 'finder'], 2),
  ('What exactly is a Find?', 'A Find can be either: Sourcing — Helping a client locate a product, service, or opportunity (e.g., apartment, sneakers, textbooks, medications, tickets). Task Execution — Carrying out an activity on behalf of a client (e.g., groceries, couriering, event setup).', 'Getting Started', ARRAY['find', 'sourcing', 'task', 'service'], 3),
  ('How do payments work?', 'Client pays the contract fee upfront through Flutterwave escrow. Flutterwave adds a small processing fee (1.4% local, capped at ₦2,000; 3.8% for international) — on the client''s side. FinderMeister holds funds until completion. FinderMeister deducts 15% per contract. Finder receives the remaining 85% directly to their account. Example: Client pays ₦20,000 (+ processing fee). FinderMeister charges ₦3,000 (15%). Finder gets ₦17,000.', 'Tokens & Payments', ARRAY['payment', 'escrow', 'fees', 'flutterwave'], 4),
  ('What are FinderTokens?', 'FinderTokens are platform credits used to apply for finds and boost visibility.', 'Tokens & Payments', ARRAY['tokens', 'credits', 'findertokens'], 5)
) AS v(question, answer, category, tags, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);
