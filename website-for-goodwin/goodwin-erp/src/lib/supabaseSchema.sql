-- ============================================================
-- GOODWIN ERP — COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
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



-- ============================================================
-- BASIC HRMS MODULE TABLES
-- ============================================================

-- 11. EMPLOYEES
CREATE TABLE IF NOT EXISTS hrms_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users if they have login access
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100),
  designation VARCHAR(100),
  joining_date DATE NOT NULL,
  basic_salary NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ATTENDANCE
CREATE TABLE IF NOT EXISTS hrms_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES hrms_employees(id) NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(50) NOT NULL, -- Present, Absent, Half-Day, Late
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- 13. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS hrms_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES hrms_employees(id) NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_days NUMERIC(5, 1) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. PAYROLL (PAYSLIPS)
CREATE TABLE IF NOT EXISTS hrms_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES hrms_employees(id) NOT NULL,
  month VARCHAR(20) NOT NULL, -- e.g., 'August'
  year INTEGER NOT NULL,
  basic_salary NUMERIC(12, 2) NOT NULL,
  allowances NUMERIC(12, 2) DEFAULT 0,
  deductions NUMERIC(12, 2) DEFAULT 0,
  net_salary NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft', -- Draft, Processed, Paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- Allows all operations (SELECT, INSERT, UPDATE, DELETE) for both anon & authenticated users
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


ALTER TABLE hrms_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrms_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrms_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrms_payroll ENABLE ROW LEVEL SECURITY;
-- 2. Drop existing conflicting policies
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

DROP POLICY IF EXISTS "Allow authenticated full access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated full access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated full access" ON products;
DROP POLICY IF EXISTS "Allow authenticated full access" ON sales_invoices;
DROP POLICY IF EXISTS "Allow authenticated full access" ON purchase_orders;
DROP POLICY IF EXISTS "Allow authenticated full access" ON returns;
DROP POLICY IF EXISTS "Allow authenticated full access" ON battery_warranties;
DROP POLICY IF EXISTS "Allow authenticated full access" ON payments;
DROP POLICY IF EXISTS "Allow authenticated full access" ON ledger_entries;
DROP POLICY IF EXISTS "Allow authenticated full access" ON company_settings;
DROP POLICY IF EXISTS "Allow anon read settings" ON company_settings;

-- 3. Create full permissive policies for public (anon + authenticated)
CREATE POLICY "Public full access customers" ON customers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access suppliers" ON suppliers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access products" ON products FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access sales_invoices" ON sales_invoices FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access purchase_orders" ON purchase_orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access returns" ON returns FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access battery_warranties" ON battery_warranties FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access payments" ON payments FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access ledger_entries" ON ledger_entries FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access company_settings" ON company_settings FOR ALL TO public USING (true) WITH CHECK (true);


CREATE POLICY "Public full access hrms_employees" ON hrms_employees FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access hrms_attendance" ON hrms_attendance FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access hrms_leaves" ON hrms_leaves FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access hrms_payroll" ON hrms_payroll FOR ALL TO public USING (true) WITH CHECK (true);
-- 4. Grant table privileges
GRANT ALL ON TABLE customers TO anon, authenticated, service_role;
GRANT ALL ON TABLE suppliers TO anon, authenticated, service_role;
GRANT ALL ON TABLE products TO anon, authenticated, service_role;
GRANT ALL ON TABLE sales_invoices TO anon, authenticated, service_role;
GRANT ALL ON TABLE purchase_orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE returns TO anon, authenticated, service_role;
GRANT ALL ON TABLE battery_warranties TO anon, authenticated, service_role;
GRANT ALL ON TABLE payments TO anon, authenticated, service_role;
GRANT ALL ON TABLE ledger_entries TO anon, authenticated, service_role;
GRANT ALL ON TABLE company_settings TO anon, authenticated, service_role;

-- ── REALTIME LIVE UPDATES ────────────────────────────────────────────────────
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
