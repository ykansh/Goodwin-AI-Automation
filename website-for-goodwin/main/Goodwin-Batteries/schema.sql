-- ==============================================================================================
-- GOODWIN BATTERIES - SUPABASE DATABASE SCHEMA
-- This script drops existing tables (if any) and creates the full schema required for the CMS.
-- Execute this in the Supabase SQL Editor.
-- ==============================================================================================

-- Drop existing tables to ensure a clean slate (CAUTION: This deletes existing data)
DROP TABLE IF EXISTS warranty_claims CASCADE;
DROP TABLE IF EXISTS warranty_registrations CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS vehicle_variants CASCADE;
DROP TABLE IF EXISTS vehicle_models CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS vehicle_types CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS global_settings CASCADE;

-- ==============================================================================================
-- 1. GLOBAL SETTINGS (Singleton pattern)
-- ==============================================================================================
CREATE TABLE global_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT DEFAULT 'Goodwin Batteries',
    tagline TEXT DEFAULT 'YOUR TRUSTED POWER SOURCE',
    phone_support TEXT DEFAULT '9220404411',
    phone_sales TEXT DEFAULT '9667724411',
    whatsapp_main TEXT DEFAULT '9667724411',
    email_support TEXT DEFAULT 'support@goodwinbatteries.com',
    email_sales TEXT DEFAULT 'sales@goodwinbatteries.com',
    address TEXT DEFAULT 'Shop No. 51, Gokhale Market, Opposite Tis Hazari Court',
    city TEXT DEFAULT 'Delhi',
    state TEXT DEFAULT 'Delhi',
    pincode TEXT DEFAULT '110054',
    google_maps_url TEXT DEFAULT 'https://maps.google.com',
    facebook_url TEXT DEFAULT '',
    instagram_url TEXT DEFAULT '',
    youtube_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the default singleton row
INSERT INTO global_settings (company_name) VALUES ('Goodwin Batteries');

-- ==============================================================================================
-- 2. PRODUCTS & CATEGORIES
-- ==============================================================================================
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    series TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    voltage TEXT,
    ah TEXT,
    cca TEXT,
    warranty TEXT,
    image TEXT,
    description TEXT,
    features TEXT[],
    terminal_layout TEXT,
    dimensions TEXT,
    weight TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    warranty_options TEXT[],
    application TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true
);

-- ==============================================================================================
-- 3. BATTERY FINDER (Vehicle Compatibility)
-- ==============================================================================================
CREATE TABLE vehicle_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE manufacturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    vehicle_type_id TEXT REFERENCES vehicle_types(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE vehicle_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer_id TEXT REFERENCES manufacturers(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE vehicle_variants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model_id TEXT REFERENCES vehicle_models(id) ON DELETE CASCADE,
    fuel_type TEXT, -- e.g., Petrol, Diesel, CNG
    year_range TEXT,
    recommended_battery_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0
);

-- ==============================================================================================
-- 4. DEALERS
-- ==============================================================================================
CREATE TABLE dealers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours TEXT,
    is_authorized BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================================
-- 5. LEADS, ORDERS & SUPPORT (Orders, Enquiries, Warranties, Claims)
-- ==============================================================================================
CREATE TABLE orders (
    id TEXT PRIMARY KEY, -- e.g., GW-ORD-102938
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

CREATE TABLE enquiries (
    id TEXT PRIMARY KEY, -- e.g., GW-ENQ-123456
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'New', -- New, Contacted, Closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE warranty_registrations (
    id TEXT PRIMARY KEY, -- e.g., GW-WTY-123456
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    battery_model_id TEXT, -- Note: Removed REFERENCES products(id) to allow local JSON products
    serial_number TEXT NOT NULL UNIQUE,
    purchase_date DATE NOT NULL,
    invoice_number TEXT,
    dealer_name TEXT,
    vehicle_reg_number TEXT,
    vehicle_make_model TEXT,
    invoice_url TEXT,
    status TEXT DEFAULT 'Registered', -- Registered, Verified, Rejected
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE warranty_claims (
    id TEXT PRIMARY KEY, -- e.g., GW-CLM-123456
    warranty_id TEXT REFERENCES warranty_registrations(id) ON DELETE SET NULL,
    serial_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    dealer_name TEXT,
    issue_description TEXT NOT NULL,
    invoice_url TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'Pending Review', -- Pending Review, Under Inspection, Approved, Rejected
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================================
-- 6. CONTENT (FAQs)
-- ==============================================================================================
CREATE TABLE faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================================
-- By default, allow anyone to READ from public tables, but only authenticated users to WRITE.
-- Note: Ensure Supabase Auth is enabled for the /admin panel.

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON global_settings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Enable read access for all users" ON applications FOR SELECT USING (is_published = true);
CREATE POLICY "Enable read access for all users" ON vehicle_types FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON manufacturers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON vehicle_models FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON vehicle_variants FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON dealers FOR SELECT USING (is_published = true);
CREATE POLICY "Enable read access for all users" ON faqs FOR SELECT USING (is_published = true);

-- Allow authenticated users (Admin) full access
CREATE POLICY "Enable full access for authenticated users" ON global_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON vehicle_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON manufacturers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON vehicle_models FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON vehicle_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON dealers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for authenticated users" ON faqs FOR ALL USING (auth.role() = 'authenticated');

-- Enquiries and Warranties (Public can INSERT, Admin can ALL)
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable full access for authenticated users" ON enquiries FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON warranty_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for public by id" ON warranty_registrations FOR SELECT USING (true); -- needed for status tracking
CREATE POLICY "Enable full access for authenticated users" ON warranty_registrations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON warranty_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for public by id" ON warranty_claims FOR SELECT USING (true); -- needed for status tracking
CREATE POLICY "Enable full access for authenticated users" ON warranty_claims FOR ALL USING (auth.role() = 'authenticated');
