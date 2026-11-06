-- Add retailer columns to warranty_registrations table
ALTER TABLE warranty_registrations 
ADD COLUMN IF NOT EXISTS retailer_name TEXT,
ADD COLUMN IF NOT EXISTS retailer_location TEXT;
