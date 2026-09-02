export const GOODWIN_SUPABASE_SQL = `-- ============================================================
-- GOODWIN ERP — SECURE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. CUSTOMERS TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uoi            VARCHAR(50) UNIQUE NOT NULL,
  name           VARCHAR(255) NOT NULL,
  contact        VARCHAR(50) DEFAULT '',
  email          VARCHAR(255) DEFAULT '',
  gstin          VARCHAR(50) DEFAULT '',
  type           VARCHAR(50) NOT NULL DEFAULT 'dealer',
  credit_limit   NUMERIC(12, 2) DEFAULT 500000,
  outstanding    NUMERIC(12, 2) DEFAULT 0,
  address        TEXT DEFAULT '',
  salesperson    VARCHAR(100) DEFAULT '',
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 2. SUPPLIERS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uoi            VARCHAR(50) UNIQUE NOT NULL,
  name           VARCHAR(255) NOT NULL,
  contact        VARCHAR(50) DEFAULT '',
  email          VARCHAR(255) DEFAULT '',
  gstin          VARCHAR(50) DEFAULT '',
  type           VARCHAR(50) DEFAULT 'Manufacturer',
  outstanding    NUMERIC(12, 2) DEFAULT 0,
  address        TEXT DEFAULT '',
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 3. PRODUCTS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  battery_model  VARCHAR(100) NOT NULL DEFAULT '',
  voltage        VARCHAR(20) NOT NULL DEFAULT '12V',
  ah             VARCHAR(20) NOT NULL DEFAULT '35Ah',
  sku            VARCHAR(100) UNIQUE NOT NULL,
  hsn            VARCHAR(50) DEFAULT '8507',
  category       VARCHAR(100) DEFAULT 'Automotive',
  technology     VARCHAR(100) DEFAULT 'Flooded (Lead-Acid)',
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  selling_price  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock          INT DEFAULT 0,
  warehouse_rack VARCHAR(100) DEFAULT '',
  warranty_months INT DEFAULT 18,
  gst_percent    NUMERIC(5, 2) DEFAULT 28,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 4. SALES INVOICES TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(100) UNIQUE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_type    VARCHAR(100) DEFAULT 'GST Tax Invoice',
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   VARCHAR(255) NOT NULL,
  customer_uoi    VARCHAR(50),
  customer_gstin  VARCHAR(50),
  items           JSONB NOT NULL DEFAULT '[]',
  taxable_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gst_amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'pending',
  outstanding     NUMERIC(12, 2) DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 5. PURCHASE ORDERS TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number      VARCHAR(100) UNIQUE NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id    UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name  VARCHAR(255) NOT NULL,
  supplier_gstin VARCHAR(50),
  items          JSONB NOT NULL DEFAULT '[]',
  taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gst_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total          NUMERIC(12, 2) DEFAULT 0,
  status         VARCHAR(50) DEFAULT 'received',
  outstanding    NUMERIC(12, 2) DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 6. RETURNS TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_number    VARCHAR(100) UNIQUE NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  type           VARCHAR(50) NOT NULL DEFAULT 'credit',
  party_name     VARCHAR(255) NOT NULL,
  party_id       UUID,
  party_type     VARCHAR(50) NOT NULL DEFAULT 'customer',
  items          JSONB NOT NULL DEFAULT '[]',
  taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gst_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  reason         TEXT DEFAULT '',
  status         VARCHAR(50) DEFAULT 'processed',
  linked_invoice_id VARCHAR(100),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 7. BATTERY WARRANTIES TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS battery_warranties (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_id    VARCHAR(100) UNIQUE NOT NULL,
  battery_model  VARCHAR(100) NOT NULL,
  serial_number  VARCHAR(100) UNIQUE NOT NULL,
  product_name   VARCHAR(255) NOT NULL,
  customer_id    UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name  VARCHAR(255) NOT NULL,
  customer_uoi   VARCHAR(50),
  purchase_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  warranty_expiry DATE NOT NULL,
  status         VARCHAR(50) DEFAULT 'active',
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 8. PAYMENTS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  party_name     VARCHAR(255) NOT NULL,
  party_id       UUID NOT NULL,
  party_uoi      VARCHAR(50),
  party_type     VARCHAR(50) NOT NULL,
  payment_mode   VARCHAR(50) NOT NULL DEFAULT 'bank',
  reference      VARCHAR(100),
  amount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  direction      VARCHAR(20) NOT NULL DEFAULT 'in',
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 9. LEDGER ENTRIES TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ledger_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id       UUID NOT NULL,
  party_name     VARCHAR(255) NOT NULL,
  party_uoi      VARCHAR(50),
  party_gstin    VARCHAR(50),
  party_type     VARCHAR(50) NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  description    TEXT NOT NULL DEFAULT '',
  doc_number     VARCHAR(100),
  debit          NUMERIC(12, 2) DEFAULT 0,
  credit         NUMERIC(12, 2) DEFAULT 0,
  balance        NUMERIC(12, 2) DEFAULT 0,
  reference_type VARCHAR(50),
  reference_id   UUID,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 10. COMPANY SETTINGS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_settings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL DEFAULT 'Goodwin Batteries Pvt. Ltd.',
  gstin          VARCHAR(50) DEFAULT '27AABCG1234F1Z5',
  address        TEXT DEFAULT '',
  phone          VARCHAR(50) DEFAULT '',
  email          VARCHAR(255) DEFAULT '',
  logo_url       TEXT DEFAULT '',
  bank_details   JSONB DEFAULT '{"bank_name":"","account_number":"","ifsc_code":"","branch":""}',
  battery_configs JSONB DEFAULT '{"voltages":[],"ah_ratings":[],"warehouses":[],"customer_types":[],"salespersons":[],"default_gst_percent":28}',
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 11. LEADS TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  company_name        VARCHAR(255) NOT NULL,
  phone               VARCHAR(50) NOT NULL,
  email               VARCHAR(255) DEFAULT '',
  whatsapp            VARCHAR(50) DEFAULT '',
  address             TEXT DEFAULT '',
  city                VARCHAR(100) DEFAULT '',
  state               VARCHAR(100) DEFAULT '',
  stage               VARCHAR(50) NOT NULL DEFAULT 'New',
  expected_value      NUMERIC(12, 2) DEFAULT 0,
  source              VARCHAR(50) NOT NULL DEFAULT 'WhatsApp',
  requirement         TEXT DEFAULT '',
  assigned_to         VARCHAR(100) DEFAULT 'Admin',
  notes               TEXT DEFAULT '',
  next_followup_date  DATE,
  next_followup_time  VARCHAR(20),
  lost_reason         VARCHAR(100),
  lost_notes          TEXT,
  party_id            UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 12. LEAD ACTIVITIES TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID REFERENCES leads(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL DEFAULT 'Note',
  description TEXT NOT NULL,
  created_by  VARCHAR(100) DEFAULT 'Admin',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 13. USER ROLES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role        VARCHAR(50) NOT NULL DEFAULT 'employee',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get user role securely
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- SECURE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insecure policies (if they exist)
DROP POLICY IF EXISTS "Public full access customers" ON customers;
DROP POLICY IF EXISTS "Public full access suppliers" ON suppliers;
DROP POLICY IF EXISTS "Public full access products" ON products;
DROP POLICY IF EXISTS "Public full access sales_invoices" ON sales_invoices;
DROP POLICY IF EXISTS "Public full access purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Public full access returns" ON returns;
DROP POLICY IF EXISTS "Public full access battery_warranties" ON battery_warranties;
DROP POLICY IF EXISTS "Public full access payments" ON payments;
DROP POLICY IF EXISTS "Public full access ledger_entries" ON ledger_entries;
DROP POLICY IF EXISTS "Public full access company_settings" ON company_settings;
DROP POLICY IF EXISTS "Public full access leads" ON leads;
DROP POLICY IF EXISTS "Public full access lead_activities" ON lead_activities;

-- 3. Create secure policies based on authentication and roles
-- User Roles policy (Users can read their own role)
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- General authenticated access policies (Basic security: must be logged in)
-- More granular policies will be added in later phases depending on exact RBAC needs.
CREATE POLICY "Authenticated users can read customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON customers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update suppliers" ON suppliers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sales_invoices" ON sales_invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales_invoices" ON sales_invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales_invoices" ON sales_invoices FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read purchase_orders" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert purchase_orders" ON purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update purchase_orders" ON purchase_orders FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read returns" ON returns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert returns" ON returns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update returns" ON returns FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read battery_warranties" ON battery_warranties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert battery_warranties" ON battery_warranties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update battery_warranties" ON battery_warranties FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update payments" ON payments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read ledger_entries" ON ledger_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ledger_entries" ON ledger_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ledger_entries" ON ledger_entries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read company_settings" ON company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert company_settings" ON company_settings FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Authenticated users can update company_settings" ON company_settings FOR UPDATE TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Authenticated users can read leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read lead_activities" ON lead_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lead_activities" ON lead_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update lead_activities" ON lead_activities FOR UPDATE TO authenticated USING (true);


-- 4. Grant table privileges
GRANT ALL ON TABLE customers TO authenticated, service_role;
GRANT ALL ON TABLE suppliers TO authenticated, service_role;
GRANT ALL ON TABLE products TO authenticated, service_role;
GRANT ALL ON TABLE sales_invoices TO authenticated, service_role;
GRANT ALL ON TABLE purchase_orders TO authenticated, service_role;
GRANT ALL ON TABLE returns TO authenticated, service_role;
GRANT ALL ON TABLE battery_warranties TO authenticated, service_role;
GRANT ALL ON TABLE payments TO authenticated, service_role;
GRANT ALL ON TABLE ledger_entries TO authenticated, service_role;
GRANT ALL ON TABLE company_settings TO authenticated, service_role;
GRANT ALL ON TABLE leads TO authenticated, service_role;
GRANT ALL ON TABLE lead_activities TO authenticated, service_role;
GRANT ALL ON TABLE user_roles TO authenticated, service_role;

-- ── REALTIME LIVE UPDATES ────────────────────────────────────────────────────
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
`;
