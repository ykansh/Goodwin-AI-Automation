-- ==========================================================
-- Goodwin Grow ERP: Auto-Confirm Supabase Auth Users
-- ==========================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- 
-- This script does two things:
-- 1. Confirms all existing users who currently have "Email not confirmed".
-- 2. Sets up a trigger on auth.users so any user created from the Admin Panel
--    is automatically confirmed immediately upon creation.
-- ==========================================================

-- 1. Confirm all currently unconfirmed users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Create function to automatically confirm new users on sign up
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically confirm the email timestamp
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create or replace the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user();
