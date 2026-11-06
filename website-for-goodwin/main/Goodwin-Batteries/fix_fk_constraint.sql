-- Run this in Supabase SQL Editor to fix the Foreign Key Constraint Error
-- This moves the battery_serials insertion to the BEFORE INSERT trigger.

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

    -- 4. CRITICAL FIX: Create the serial number in battery_serials BEFORE the warranty registration is inserted.
    -- This satisfies the "fk_battery_serial" foreign key constraint.
    INSERT INTO battery_serials (serial_number, product_id, status)
    VALUES (NEW.serial_number, NEW.battery_model_id, 'SOLD')
    ON CONFLICT (serial_number) DO UPDATE
    SET status = 'SOLD', product_id = NEW.battery_model_id;

    -- 5. Automate dates and plan
    NEW.warranty_plan_id := v_plan_id;
    NEW.warranty_start_date := NEW.purchase_date;
    NEW.warranty_expiry_date := NEW.purchase_date + (v_warranty_months || ' months')::INTERVAL;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove the battery_serials insertion from the AFTER trigger since it's now handled BEFORE.
CREATE OR REPLACE FUNCTION update_battery_status_after_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Award 10 points to the dealer who registers the battery
    UPDATE user_profiles
    SET reward_points = COALESCE(reward_points, 0) + 10
    WHERE id = auth.uid() AND role = 'dealer';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
