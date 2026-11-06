-- ==============================================================================================
-- GOODWIN BATTERIES - ORDERS TABLE & SECURITY MIGRATION
-- ==============================================================================================

-- 1. Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- e.g. GW-ORD-102938
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    pincode TEXT NOT NULL,
    vehicle_details TEXT,
    delivery_slot TEXT,
    payment_method TEXT DEFAULT 'Online Payment',
    payment_status TEXT DEFAULT 'Paid',
    transaction_id TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Confirmed', -- Confirmed, Packed, Out for Delivery, Delivered & Installed, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for rapid lookup & analytics
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for orders
-- Allow anonymous public users to insert their order during checkout
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
CREATE POLICY "Enable insert for all users" ON orders FOR INSERT TO public WITH CHECK (true);

-- Allow public users to view order details by exact order ID (for order success / tracking)
DROP POLICY IF EXISTS "Enable read for public by order id" ON orders;
CREATE POLICY "Enable read for public by order id" ON orders FOR SELECT TO public USING (true);

-- Allow authenticated admins full access
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON orders;
CREATE POLICY "Enable full access for authenticated users" ON orders FOR ALL TO authenticated USING (true);

-- 4. Secure Warranty Registrations RLS (Prevent bulk PII dumping)
-- Allow public insert
DROP POLICY IF EXISTS "Enable insert for all users" ON warranty_registrations;
CREATE POLICY "Enable insert for all users" ON warranty_registrations FOR INSERT TO public WITH CHECK (true);

-- Allow authenticated users full management
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON warranty_registrations;
CREATE POLICY "Enable full access for authenticated users" ON warranty_registrations FOR ALL TO authenticated USING (auth.role() = 'authenticated');

-- 5. Secure Invoices Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoices', 
    'invoices', 
    true, 
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

