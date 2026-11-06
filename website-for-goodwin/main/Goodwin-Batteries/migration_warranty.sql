-- ==============================================================================================
-- MIGRATION: GOODWIN BATTERIES WARRANTY MANAGEMENT SYSTEM
-- Applies new tables and RBAC policies to an existing Supabase database.
-- ==============================================================================================

-- 1. USER PROFILES (RBAC)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'dealer', -- 'super_admin', 'admin', 'dealer'
    dealer_id TEXT REFERENCES dealers(id) ON DELETE SET NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WARRANTY PLANS
CREATE TABLE IF NOT EXISTS warranty_plans (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    plan_name TEXT NOT NULL,
    warranty_months INTEGER NOT NULL,
    free_replacement_months INTEGER DEFAULT 0,
    pro_rata_months INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BATTERY SERIALS
CREATE TABLE IF NOT EXISTS battery_serials (
    serial_number TEXT PRIMARY KEY,
    product_id TEXT,
    manufacturing_date DATE,
    status TEXT DEFAULT 'INVENTORY', -- 'INVENTORY', 'SOLD', 'REPLACED', 'DEFECTIVE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed existing serial numbers into battery_serials to satisfy foreign keys
INSERT INTO battery_serials (serial_number, status)
SELECT serial_number, 'SOLD' FROM warranty_registrations
ON CONFLICT DO NOTHING;

-- 4. MODIFY WARRANTY REGISTRATIONS
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS dealer_id TEXT REFERENCES dealers(id) ON DELETE SET NULL;
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS warranty_plan_id TEXT REFERENCES warranty_plans(id) ON DELETE SET NULL;
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS warranty_start_date DATE;
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS warranty_expiry_date DATE;
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS replacement_serial_number TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_battery_serial'
    ) THEN
        ALTER TABLE warranty_registrations 
        ADD CONSTRAINT fk_battery_serial FOREIGN KEY (serial_number) REFERENCES battery_serials(serial_number);
    END IF;
END $$;

-- 5. MODIFY WARRANTY CLAIMS
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS dealer_id TEXT REFERENCES dealers(id) ON DELETE SET NULL;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS replacement_serial_number TEXT;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS decision_date TIMESTAMP WITH TIME ZONE;

-- 6. BATTERY REPLACEMENTS
CREATE TABLE IF NOT EXISTS battery_replacements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_serial TEXT REFERENCES battery_serials(serial_number) ON DELETE CASCADE,
    new_serial TEXT REFERENCES battery_serials(serial_number) ON DELETE CASCADE,
    claim_id TEXT REFERENCES warranty_claims(id) ON DELETE SET NULL,
    replacement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    user_id UUID,
    dealer_id TEXT,
    previous_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_dealer() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'dealer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON user_profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update profiles" ON user_profiles FOR UPDATE USING (is_admin());

-- Policies for warranty_plans
CREATE POLICY "Enable read access for all authenticated users" ON warranty_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can full access warranty plans" ON warranty_plans FOR ALL USING (is_admin());

-- Policies for battery_serials
CREATE POLICY "Enable read for public by serial_number" ON battery_serials FOR SELECT USING (true);
CREATE POLICY "Authenticated can read battery serials" ON battery_serials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can full access battery serials" ON battery_serials FOR ALL USING (is_admin());
-- Dealers can update battery serial status (e.g. from INVENTORY to SOLD)
CREATE POLICY "Dealers can update battery serials" ON battery_serials FOR UPDATE USING (is_dealer());

-- Policies for warranty_registrations (replacing the generic one)
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON warranty_registrations;

CREATE POLICY "Admins have full access to warranty_registrations" ON warranty_registrations FOR ALL USING (is_admin());

CREATE POLICY "Enable read for public by serial_number" ON warranty_registrations FOR SELECT USING (true);

CREATE POLICY "Dealers can view their own registrations" ON warranty_registrations FOR SELECT USING (
  dealer_id = (SELECT dealer_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Dealers can insert their own registrations" ON warranty_registrations FOR INSERT WITH CHECK (
  dealer_id = (SELECT dealer_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Dealers can update their own registrations" ON warranty_registrations FOR UPDATE USING (
  dealer_id = (SELECT dealer_id FROM user_profiles WHERE id = auth.uid())
);

-- Policies for warranty_claims (replacing the generic one)
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON warranty_claims;

CREATE POLICY "Admins have full access to warranty_claims" ON warranty_claims FOR ALL USING (is_admin());

CREATE POLICY "Dealers can view their own claims" ON warranty_claims FOR SELECT USING (
  dealer_id = (SELECT dealer_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Dealers can insert their own claims" ON warranty_claims FOR INSERT WITH CHECK (
  dealer_id = (SELECT dealer_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Dealers can update their own claims" ON warranty_claims FOR UPDATE USING (
  dealer_id = (SELECT dealer_id FROM user_profiles WHERE id = auth.uid())
);

-- Policies for audit_logs
CREATE POLICY "Admins can view audit_logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "Authenticated can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
