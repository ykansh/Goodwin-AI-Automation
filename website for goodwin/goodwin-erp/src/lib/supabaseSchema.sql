-- ============================================================
-- GOODWIN ERP — SUPABASE DATABASE SCHEMA
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. CUSTOMERS TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uoi            TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'dealer',
  contact        TEXT NOT NULL DEFAULT '',
  email          TEXT NOT NULL DEFAULT '',
  gstin          TEXT NOT NULL DEFAULT '',
  address        TEXT NOT NULL DEFAULT '',
  credit_limit   NUMERIC NOT NULL DEFAULT 500000,
  outstanding    NUMERIC NOT NULL DEFAULT 0,
  salesperson    TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. SUPPLIERS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uoi          TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'manufacturer',
  contact      TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL DEFAULT '',
  gstin        TEXT NOT NULL DEFAULT '',
  address      TEXT NOT NULL DEFAULT '',
  outstanding  NUMERIC NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. PRODUCTS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku            TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  voltage        TEXT NOT NULL DEFAULT '12V',
  capacity       TEXT NOT NULL DEFAULT '35Ah',
  category       TEXT NOT NULL DEFAULT 'Automotive',
  stock          INTEGER NOT NULL DEFAULT 0,
  mrp            NUMERIC NOT NULL DEFAULT 0,
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  gst_rate       NUMERIC NOT NULL DEFAULT 18,
  hsn_code       TEXT NOT NULL DEFAULT '8507',
  warranty_months INTEGER NOT NULL DEFAULT 12,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. SALES INVOICES TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number  TEXT UNIQUE NOT NULL,
  customer_id     UUID REFERENCES customers(id),
  customer_name   TEXT NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC NOT NULL DEFAULT 0,
  gst_amount      NUMERIC NOT NULL DEFAULT 0,
  discount        NUMERIC NOT NULL DEFAULT 0,
  grand_total     NUMERIC NOT NULL DEFAULT 0,
  outstanding     NUMERIC NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'unpaid',
  payment_mode    TEXT NOT NULL DEFAULT 'credit',
  notes           TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. PURCHASE ORDERS TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number      TEXT UNIQUE NOT NULL,
  supplier_id    UUID REFERENCES suppliers(id),
  supplier_name  TEXT NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC NOT NULL DEFAULT 0,
  gst_amount     NUMERIC NOT NULL DEFAULT 0,
  grand_total    NUMERIC NOT NULL DEFAULT 0,
  outstanding    NUMERIC NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'pending',
  notes          TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. RETURNS TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_number TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL DEFAULT 'credit',
  party_id    UUID,
  party_name  TEXT NOT NULL,
  party_type  TEXT NOT NULL DEFAULT 'customer',
  items       JSONB NOT NULL DEFAULT '[]',
  total       NUMERIC NOT NULL DEFAULT 0,
  reason      TEXT NOT NULL DEFAULT '',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. BATTERY WARRANTIES TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS battery_warranties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id     TEXT UNIQUE NOT NULL,
  battery_sku     TEXT NOT NULL,
  battery_name    TEXT NOT NULL,
  customer_id     UUID REFERENCES customers(id),
  customer_name   TEXT NOT NULL,
  invoice_number  TEXT NOT NULL DEFAULT '',
  purchase_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date     DATE NOT NULL,
  claim_date      DATE,
  status          TEXT NOT NULL DEFAULT 'active',
  notes           TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. PAYMENTS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL,
  direction      TEXT NOT NULL DEFAULT 'in',
  party_id       UUID,
  party_name     TEXT NOT NULL,
  party_type     TEXT NOT NULL DEFAULT 'customer',
  amount         NUMERIC NOT NULL DEFAULT 0,
  mode           TEXT NOT NULL DEFAULT 'cash',
  invoice_ref    TEXT NOT NULL DEFAULT '',
  narration      TEXT NOT NULL DEFAULT '',
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. LEDGER ENTRIES TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ledger_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id    UUID,
  party_name  TEXT NOT NULL,
  party_type  TEXT NOT NULL DEFAULT 'customer',
  type        TEXT NOT NULL DEFAULT 'debit',
  amount      NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  reference   TEXT NOT NULL DEFAULT '',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. COMPANY SETTINGS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name    TEXT NOT NULL DEFAULT 'Goodwin Batteries Pvt. Ltd.',
  gstin           TEXT NOT NULL DEFAULT '27AABCG1234F1Z5',
  address         TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  bank_name       TEXT NOT NULL DEFAULT '',
  account_number  TEXT NOT NULL DEFAULT '',
  ifsc_code       TEXT NOT NULL DEFAULT '',
  invoice_prefix  TEXT NOT NULL DEFAULT 'GW-INV',
  po_prefix       TEXT NOT NULL DEFAULT 'GW-PO',
  cash_balance    NUMERIC NOT NULL DEFAULT 50000,
  bank_balance    NUMERIC NOT NULL DEFAULT 250000,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row if none exists
INSERT INTO company_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- For now: allow all authenticated users full access.
-- You can restrict per-user later with auth.uid() policies.

ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings  ENABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
CREATE POLICY "Allow authenticated full access" ON customers         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON suppliers         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON products          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON sales_invoices    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON purchase_orders   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON returns           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON battery_warranties FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON payments          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON ledger_entries    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON company_settings  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow anon read for the settings (so un-authed app can load settings)
CREATE POLICY "Allow anon read settings" ON company_settings FOR SELECT TO anon USING (true);

-- ── REALTIME ──────────────────────────────────────────────────────────────────
-- Enable real-time for tables that need live sync
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE
    customers, suppliers, products, sales_invoices, purchase_orders,
    returns, battery_warranties, payments, ledger_entries, company_settings;
COMMIT;
