-- 1. Create Dealers Table
CREATE TABLE IF NOT EXISTS dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Will map to Supabase auth.users once they sign up/login
    name TEXT NOT NULL,
    seller_code TEXT UNIQUE NOT NULL,
    region TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on dealers
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to dealers" ON dealers FOR ALL TO authenticated USING (true);

-- 2. Add region and seller_code to warranty_registrations
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS seller_code TEXT;

-- 3. Add region and seller_code to warranty_claims
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS seller_code TEXT;

-- 4. Create an admin policy so we can insert dealers
CREATE POLICY "Allow public insert to dealers for now" ON dealers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update to dealers for now" ON dealers FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete to dealers for now" ON dealers FOR DELETE TO public USING (true);
