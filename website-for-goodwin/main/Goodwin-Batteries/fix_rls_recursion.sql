-- Run this in your Supabase SQL Editor to fix the infinite recursion error

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can full access warranty plans" ON warranty_plans;
DROP POLICY IF EXISTS "Admins can full access battery serials" ON battery_serials;
DROP POLICY IF EXISTS "Dealers can update battery serials" ON battery_serials;
DROP POLICY IF EXISTS "Admins have full access to warranty_registrations" ON warranty_registrations;
DROP POLICY IF EXISTS "Admins have full access to warranty_claims" ON warranty_claims;
DROP POLICY IF EXISTS "Admins can view audit_logs" ON audit_logs;

-- Security definer functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_dealer() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'dealer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the SECURITY DEFINER functions
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON user_profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update profiles" ON user_profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can full access warranty plans" ON warranty_plans FOR ALL USING (is_admin());
CREATE POLICY "Admins can full access battery serials" ON battery_serials FOR ALL USING (is_admin());
CREATE POLICY "Dealers can update battery serials" ON battery_serials FOR UPDATE USING (is_dealer());
CREATE POLICY "Admins have full access to warranty_registrations" ON warranty_registrations FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to warranty_claims" ON warranty_claims FOR ALL USING (is_admin());
CREATE POLICY "Admins can view audit_logs" ON audit_logs FOR SELECT USING (is_admin());
