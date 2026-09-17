-- ====================================================================
-- Goodwin Grow AI: Marketing Leads Jotform Schema Migration
-- ====================================================================
-- Run this script in the Supabase Dashboard -> SQL Editor
-- This adds all the essential lead qualification and business features
-- extracted from the Goodwin Grow AI Jotform onboarding form.

-- 1. Create table if not present
CREATE TABLE IF NOT EXISTS public.marketing_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'New',
    assigned_to VARCHAR(255),
    work VARCHAR(50) DEFAULT 'not started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add all Jotform Onboarding Columns
ALTER TABLE public.marketing_leads 
    ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS designation VARCHAR(255),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(100),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state VARCHAR(100),
    ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
    ADD COLUMN IF NOT EXISTS business_type VARCHAR(100) DEFAULT 'Manufacturer',
    ADD COLUMN IF NOT EXISTS business_model VARCHAR(50) DEFAULT 'B2B',
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100) DEFAULT 'Website',
    ADD COLUMN IF NOT EXISTS deal_value DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Warm',
    ADD COLUMN IF NOT EXISTS response_speed VARCHAR(100) DEFAULT 'Within 1 hour',
    ADD COLUMN IF NOT EXISTS products_interested TEXT,
    ADD COLUMN IF NOT EXISTS qualification_notes TEXT,
    ADD COLUMN IF NOT EXISTS next_follow_up DATE,
    ADD COLUMN IF NOT EXISTS details JSONB;

-- 3. Enable RLS and create policy for read/write access
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_leads' AND policyname = 'Allow public access on marketing_leads'
    ) THEN
        CREATE POLICY "Allow public access on marketing_leads" 
            ON public.marketing_leads 
            FOR ALL 
            TO anon, authenticated 
            USING (true) 
            WITH CHECK (true);
    END IF;
END $$;
