
-- Add categories column to finders table
ALTER TABLE finders ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Migrate existing category data to categories array
UPDATE finders 
SET categories = ARRAY[category]
WHERE category IS NOT NULL AND category != '' AND (categories IS NULL OR array_length(categories, 1) IS NULL);

-- Add comment explaining the fields
COMMENT ON COLUMN finders.category IS 'Legacy single category field - kept for backward compatibility';
COMMENT ON COLUMN finders.categories IS 'Array of categories that the finder specializes in';
