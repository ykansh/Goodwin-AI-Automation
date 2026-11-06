-- ==============================================================================================
-- AUTOMATED WARRANTY WORKFLOW TRIGGERS
-- Run this in your Supabase SQL Editor to automate the warranty lifecycle
-- ==============================================================================================

-- 1. Automate Warranty Registration (BEFORE INSERT)
-- Calculates dates, links the plan, and creates/verifies the serial number on-the-fly
CREATE OR REPLACE FUNCTION automate_warranty_registration()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_id TEXT;
    v_warranty_months INTEGER;
BEGIN
    -- 1. Check if the serial number is already registered
    IF EXISTS (SELECT 1 FROM warranty_registrations WHERE serial_number = NEW.serial_number) THEN
        RAISE EXCEPTION 'Serial number % is already registered.', NEW.serial_number;
    END IF;

    -- 2. Ensure a battery model was selected by the dealer/customer
    IF NEW.battery_model_id IS NULL THEN
        RAISE EXCEPTION 'Battery model (product_id) must be selected during registration.';
    END IF;

    -- 3. Find the active warranty plan for the selected product
    SELECT id, warranty_months INTO v_plan_id, v_warranty_months
    FROM warranty_plans
    WHERE product_id = NEW.battery_model_id AND active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active warranty plan found for product %', NEW.battery_model_id;
    END IF;

    -- 4. Automate dates and plan
    NEW.warranty_plan_id := v_plan_id;
    NEW.warranty_start_date := NEW.purchase_date;
    NEW.warranty_expiry_date := NEW.purchase_date + (v_warranty_months || ' months')::INTERVAL;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_automate_warranty_registration ON warranty_registrations;
CREATE TRIGGER trigger_automate_warranty_registration
    BEFORE INSERT ON warranty_registrations
    FOR EACH ROW
    EXECUTE FUNCTION automate_warranty_registration();


-- 2. Update Battery Status (AFTER INSERT)
-- Automatically creates the serial number in the database and marks it as SOLD
CREATE OR REPLACE FUNCTION update_battery_status_after_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the serial number into battery_serials (or update it if it somehow exists)
    INSERT INTO battery_serials (serial_number, product_id, status)
    VALUES (NEW.serial_number, NEW.battery_model_id, 'SOLD')
    ON CONFLICT (serial_number) DO UPDATE
    SET status = 'SOLD', product_id = NEW.battery_model_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_battery_status_after_registration ON warranty_registrations;
CREATE TRIGGER trigger_update_battery_status_after_registration
    AFTER INSERT ON warranty_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_battery_status_after_registration();


-- 3. Automate Warranty Claims (BEFORE INSERT)
-- Automatically links the claim to the registration and rejects if expired
CREATE OR REPLACE FUNCTION automate_warranty_claim()
RETURNS TRIGGER AS $$
DECLARE
    v_warranty_id TEXT;
    v_expiry_date DATE;
BEGIN
    -- 1. Find the warranty registration for this serial
    SELECT id, warranty_expiry_date INTO v_warranty_id, v_expiry_date
    FROM warranty_registrations
    WHERE serial_number = NEW.serial_number
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No warranty registration found for serial number %', NEW.serial_number;
    END IF;

    -- 2. Auto-link warranty_id
    NEW.warranty_id := v_warranty_id;

    -- 3. Auto-reject if expired
    IF NOW()::DATE > v_expiry_date THEN
        NEW.status := 'Rejected';
        NEW.admin_notes := CONCAT('Automated Rejection: Warranty expired on ', v_expiry_date, '. ', COALESCE(NEW.admin_notes, ''));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_automate_warranty_claim ON warranty_claims;
CREATE TRIGGER trigger_automate_warranty_claim
    BEFORE INSERT ON warranty_claims
    FOR EACH ROW
    EXECUTE FUNCTION automate_warranty_claim();

-- 4. Handle Replacements (AFTER UPDATE on Claims)
-- Automatically updates battery statuses and logs replacements when a claim is approved
CREATE OR REPLACE FUNCTION handle_battery_replacement_in_claim()
RETURNS TRIGGER AS $$
BEGIN
    -- If a replacement serial is provided and status is Approved
    IF NEW.status = 'Approved' AND NEW.replacement_serial_number IS NOT NULL AND OLD.replacement_serial_number IS DISTINCT FROM NEW.replacement_serial_number THEN
        
        -- 1. Mark old battery as DEFECTIVE
        UPDATE battery_serials SET status = 'DEFECTIVE' WHERE serial_number = NEW.serial_number;
        
        -- 2. Mark new battery as REPLACED
        UPDATE battery_serials SET status = 'REPLACED' WHERE serial_number = NEW.replacement_serial_number;
        
        -- 3. Log into battery_replacements table
        INSERT INTO battery_replacements (original_serial, new_serial, claim_id, replacement_date, notes)
        VALUES (NEW.serial_number, NEW.replacement_serial_number, NEW.id, NOW(), 'Automated replacement via claim approval');

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_battery_replacement_in_claim ON warranty_claims;
CREATE TRIGGER trigger_handle_battery_replacement_in_claim
    AFTER UPDATE ON warranty_claims
    FOR EACH ROW
    EXECUTE FUNCTION handle_battery_replacement_in_claim();
