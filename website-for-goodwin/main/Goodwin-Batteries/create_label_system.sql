-- 1. Create table for printer profiles
CREATE TABLE printer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    width_mm NUMERIC NOT NULL DEFAULT 50,
    height_mm NUMERIC NOT NULL DEFAULT 25,
    gap_mm NUMERIC DEFAULT 2,
    margin_mm NUMERIC DEFAULT 0,
    orientation TEXT DEFAULT 'landscape',
    dpi INTEGER DEFAULT 203,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create table for tracking individual generated labels
CREATE TABLE generated_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT UNIQUE NOT NULL,
    sticker_type TEXT NOT NULL, -- 'factory' or 'mrp'
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    batch_id UUID, -- Optional, if generated via batch. Using UUID since sticker_batches id is UUID.
    manufacturing_date TEXT,
    warranty_duration TEXT,
    print_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_printed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE printer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_labels ENABLE ROW LEVEL SECURITY;

-- Create policies for printer_profiles
CREATE POLICY "Allow all authenticated users to read printer profiles" ON printer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to insert printer profiles" ON printer_profiles FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'warehouse'))
);
CREATE POLICY "Allow admins to update printer profiles" ON printer_profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'warehouse'))
);

-- Create policies for generated_labels
CREATE POLICY "Allow all authenticated users to read labels" ON generated_labels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authorized roles to insert labels" ON generated_labels FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'warehouse', 'dealer'))
);
CREATE POLICY "Allow authorized roles to update labels" ON generated_labels FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'warehouse', 'dealer'))
);

-- Insert a default factory profile
INSERT INTO printer_profiles (name, width_mm, height_mm, gap_mm, margin_mm, orientation, dpi, is_default)
VALUES ('Goodwin Factory Label — 50 × 25 mm', 50, 25, 2, 0, 'landscape', 203, true);

-- Insert a default MRP profile
INSERT INTO printer_profiles (name, width_mm, height_mm, gap_mm, margin_mm, orientation, dpi, is_default)
VALUES ('Goodwin MRP Label — 75 × 50 mm', 75, 50, 2, 0, 'landscape', 203, false);
