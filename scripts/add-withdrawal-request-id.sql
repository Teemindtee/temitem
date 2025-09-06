
-- Add requestId column to withdrawal_requests table
ALTER TABLE withdrawal_requests ADD COLUMN request_id VARCHAR;

-- Update existing records with generated request IDs
UPDATE withdrawal_requests 
SET request_id = 'WR-2025-' || LPAD((ROW_NUMBER() OVER (ORDER BY requested_at))::text, 3, '0')
WHERE request_id IS NULL;

-- Make the column NOT NULL after populating existing records
ALTER TABLE withdrawal_requests ALTER COLUMN request_id SET NOT NULL;

-- Add unique constraint
ALTER TABLE withdrawal_requests ADD CONSTRAINT withdrawal_requests_request_id_unique UNIQUE (request_id);
