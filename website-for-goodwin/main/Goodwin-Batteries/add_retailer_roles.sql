-- Add role and parent_dealer_code to dealers table
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'dealer';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS parent_dealer_code TEXT;
