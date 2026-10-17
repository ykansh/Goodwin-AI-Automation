-- ==============================================================================
-- Goodwin Batteries & Goodwin Batteries 2 - Supabase Complete Schema
-- ==============================================================================
-- Instructions:
-- 1. Create a new project in your Supabase dashboard (https://supabase.com/dashboard).
-- 2. Go to "SQL Editor" on the left menu.
-- 3. Click "New query", paste this entire script, and click "RUN".
-- 4. Copy your "Project URL" and "anon public key" from Settings -> API.
-- 5. Paste them into your .env.local file:
--      NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
--      NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
-- ==============================================================================

-- 1. Company Settings (Multi-Company Multi-Tenant Master)
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    gstin TEXT,
    address TEXT,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    bank_name TEXT DEFAULT '',
    account_number TEXT DEFAULT '',
    ifsc_code TEXT DEFAULT '',
    invoice_prefix TEXT DEFAULT 'GW-INV',
    po_prefix TEXT DEFAULT 'GW-PO',
    cash_balance NUMERIC DEFAULT 0,
    bank_balance NUMERIC DEFAULT 0,
    bank_details JSONB DEFAULT '{}'::jsonb,
    battery_configs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Goodwin Batteries (Company 1) and Goodwin Batteries 2 (Company 2)
INSERT INTO public.company_settings (id, company_name, gstin, address, phone, email, invoice_prefix, po_prefix, cash_balance, bank_balance)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Goodwin Batteries Pvt. Ltd.', '23AABCG1234F1Z5', '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012', '+91 96855 79269', 'info@goodwinbatteries.com', 'GW-INV', 'GW-PO', 50000, 0),
    ('00000000-0000-0000-0000-000000000002', 'Goodwin Batteries 2', '23AABCG5678F1Z9', 'Unit 104, Industrial Park, Near Bypass Road, Indore – 452010', '+91 96855 79269', 'info@goodwinbatteries.com', 'GB2-INV', 'GB2-PO', 0, 0)
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    gstin = EXCLUDED.gstin,
    address = EXCLUDED.address;

-- 2. Products / Inventory Master
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT,
    name TEXT NOT NULL,
    battery_model TEXT,
    description TEXT,
    category TEXT DEFAULT 'Automotive',
    stock NUMERIC DEFAULT 0,
    purchase_price NUMERIC DEFAULT 0,
    selling_price NUMERIC DEFAULT 0,
    mrp NUMERIC DEFAULT 0,
    hsn TEXT DEFAULT '8507',
    hsn_code TEXT DEFAULT '8507',
    gst_percent NUMERIC DEFAULT 28,
    gst_rate NUMERIC DEFAULT 28,
    warehouse_rack TEXT DEFAULT 'Main Warehouse',
    voltage TEXT,
    ah TEXT,
    capacity TEXT,
    technology TEXT,
    warranty_months INTEGER DEFAULT 18,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Customers & Dealers Master (Khata)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uoi TEXT,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    gstin TEXT,
    type TEXT DEFAULT 'dealer',
    credit_limit NUMERIC DEFAULT 200000,
    outstanding NUMERIC DEFAULT 0,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Sales Invoices
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    invoice_type TEXT DEFAULT 'GST Tax Invoice',
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_gstin TEXT,
    customer_uoi TEXT,
    taxable_amount NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    gst_amount NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    outstanding NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'paid',
    payment_status TEXT DEFAULT 'Paid',
    payment_mode TEXT DEFAULT 'cash',
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    billing_state_ut TEXT DEFAULT 'Madhya Pradesh',
    shipping_state_ut TEXT DEFAULT 'Madhya Pradesh',
    transport_address TEXT,
    transport_contact_number TEXT,
    place_of_supply TEXT DEFAULT 'Madhya Pradesh',
    place_of_delivery TEXT,
    reference_name TEXT,
    pvt_marka TEXT,
    transport_gstin TEXT,
    order_number TEXT,
    order_date DATE,
    billing_name TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    dispatch_status TEXT DEFAULT 'Not Delivered',
    order_type TEXT DEFAULT 'New Order',
    initial_payment NUMERIC DEFAULT 0,
    lifecycle_status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration safety for existing sales_invoices tables
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS order_date DATE;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS billing_name TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS transport_address TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS transport_contact_number TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS transport_gstin TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS reference_name TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS pvt_marka TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT DEFAULT 'Madhya Pradesh';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS place_of_delivery TEXT;

-- 5. Payments & Receipts
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT,
    party_id UUID,
    party_name TEXT,
    party_type TEXT DEFAULT 'customer',
    direction TEXT DEFAULT 'in',
    amount NUMERIC DEFAULT 0,
    payment_mode TEXT DEFAULT 'cash',
    reference TEXT,
    date DATE DEFAULT CURRENT_DATE,
    narration TEXT,
    party_uoi TEXT,
    invoice_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. HRMS Staff & Team Members
CREATE TABLE IF NOT EXISTS public.hrms_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    department TEXT,
    designation TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    basic_salary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Ledger Entries
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID,
    party_name TEXT,
    party_type TEXT DEFAULT 'customer',
    party_uoi TEXT,
    party_gstin TEXT,
    type TEXT DEFAULT 'debit',
    doc_number TEXT,
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    description TEXT,
    reference TEXT,
    reference_type TEXT,
    reference_id UUID,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ERP App Users (Email & Password Authentication & RBAC)
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE', -- 'ADMIN' or 'EMPLOYEE'
    phone TEXT DEFAULT '',
    designation TEXT DEFAULT 'Billing & Sales Staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT DEFAULT 'Admin'
);

-- ==============================================================================
-- Row Level Security (RLS) & Anon Access Policies
-- Enable full read/write for web application with anon key
-- ==============================================================================
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on app_users" ON public.app_users;
CREATE POLICY "Allow anon all on app_users" ON public.app_users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on app_users" ON public.app_users;
CREATE POLICY "Allow authenticated all on app_users" ON public.app_users FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- Allow anon full access for all tables
DROP POLICY IF EXISTS "Allow anon all on company_settings" ON public.company_settings;
CREATE POLICY "Allow anon all on company_settings" ON public.company_settings FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on products" ON public.products;
CREATE POLICY "Allow anon all on products" ON public.products FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on customers" ON public.customers;
CREATE POLICY "Allow anon all on customers" ON public.customers FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on sales_invoices" ON public.sales_invoices;
CREATE POLICY "Allow anon all on sales_invoices" ON public.sales_invoices FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on payments" ON public.payments;
CREATE POLICY "Allow anon all on payments" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on hrms_employees" ON public.hrms_employees;
CREATE POLICY "Allow anon all on hrms_employees" ON public.hrms_employees FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on ledger_entries" ON public.ledger_entries;
CREATE POLICY "Allow anon all on ledger_entries" ON public.ledger_entries FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also allow authenticated role full access
DROP POLICY IF EXISTS "Allow authenticated all on company_settings" ON public.company_settings;
CREATE POLICY "Allow authenticated all on company_settings" ON public.company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on products" ON public.products;
CREATE POLICY "Allow authenticated all on products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on customers" ON public.customers;
CREATE POLICY "Allow authenticated all on customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on sales_invoices" ON public.sales_invoices;
CREATE POLICY "Allow authenticated all on sales_invoices" ON public.sales_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on payments" ON public.payments;
CREATE POLICY "Allow authenticated all on payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on hrms_employees" ON public.hrms_employees;
CREATE POLICY "Allow authenticated all on hrms_employees" ON public.hrms_employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated all on ledger_entries" ON public.ledger_entries;
CREATE POLICY "Allow authenticated all on ledger_entries" ON public.ledger_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

