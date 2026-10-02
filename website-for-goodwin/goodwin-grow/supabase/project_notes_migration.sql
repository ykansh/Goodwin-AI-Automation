-- ==========================================================
-- Goodwin Grow ERP: Project Notes (Google Keep Style) Schema
-- ==========================================================
-- Run this script in the Supabase SQL Editor if you wish to 
-- enable multi-device cloud database syncing for project notes.
-- Note: Notes will automatically save to local storage immediately
-- even without running this SQL.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    color VARCHAR(50) DEFAULT 'default',
    is_pinned BOOLEAN DEFAULT false,
    is_checklist BOOLEAN DEFAULT false,
    checklist_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for speedy queries by project
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON public.project_notes(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Allow read & write for all users
CREATE POLICY "Allow public all access on project_notes" 
    ON public.project_notes 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
