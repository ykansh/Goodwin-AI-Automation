-- ==========================================================
-- Goodwin Grow ERP: Marketing Content Calendar Schema
-- ==========================================================
-- Run this script in the Supabase SQL Editor if you wish to 
-- enable multi-device cloud database syncing for marketing calendar.
-- Note: All entries automatically persist in local storage immediately.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.marketing_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name TEXT DEFAULT '',
    brand VARCHAR(100) NOT NULL DEFAULT 'Goodwin Batteries',
    date DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    occasion TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'Post',
    content_brief TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    creative_status VARCHAR(50) NOT NULL DEFAULT 'Idea',
    approval_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    scheduled_time TEXT DEFAULT '',
    platforms JSONB DEFAULT '["Instagram", "Facebook"]'::jsonb,
    assigned_to TEXT DEFAULT '',
    posting_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_date ON public.marketing_calendar(date);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_brand ON public.marketing_calendar(brand);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_project ON public.marketing_calendar(project_id);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_status ON public.marketing_calendar(posting_status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.marketing_calendar ENABLE ROW LEVEL SECURITY;

-- Allow read & write for all users
CREATE POLICY "Allow public all access on marketing_calendar" 
    ON public.marketing_calendar 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
