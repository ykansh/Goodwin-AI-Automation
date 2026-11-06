-- ==============================================================================================
-- ADVANCED WARRANTY WORKFLOW IMPROVEMENTS
-- Run this in your Supabase SQL Editor to apply pro-rata logic, fraud prevention, and inheritance.
-- ==============================================================================================

-- 1. SCHEMA UPGRADES
-------------------------------------------------------------------------
-- A. Dealer Incentives: Add reward points
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- B. Pro-Rata tracking on claims
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS claim_type TEXT; -- 'Free Replacement', 'Pro-Rata', 'Expired'
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS pro_rata_discount_percentage NUMERIC;

-- C. Fraud Prevention: Constraint to ensure purchase date is not in the future
ALTER TABLE warranty_registrations DROP CONSTRAINT IF EXISTS valid_purchase_date;
ALTER TABLE warranty_registrations ADD CONSTRAINT valid_purchase_date CHECK (purchase_date <= CURRENT_DATE);

-- D. Fraud Prevention: Serial numbers must be at least 5 alphanumeric characters
ALTER TABLE battery_serials DROP CONSTRAINT IF EXISTS valid_serial_format;
ALTER TABLE battery_serials ADD CONSTRAINT valid_serial_format CHECK (length(serial_number) >= 5 AND serial_number ~ '^[A-Za-z0-9-]+$');


-- 2. ENHANCED TRIGGERS
-------------------------------------------------------------------------

-- A. Reward Points on Registration
CREATE OR REPLACE FUNCTION update_battery_status_after_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the serial number into battery_serials
    INSERT INTO battery_serials (serial_number, product_id, status)
    VALUES (NEW.serial_number, NEW.battery_model_id, 'SOLD')
    ON CONFLICT (serial_number) DO UPDATE
    SET status = 'SOLD', product_id = NEW.battery_model_id;
    
    -- Award 10 points to the dealer who registers the battery
    -- Supabase auth.uid() provides the current logged-in user
    UPDATE user_profiles
    SET reward_points = COALESCE(reward_points, 0) + 10
    WHERE id = auth.uid() AND role = 'dealer';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- (Trigger already exists from previous script, so replacing the function is enough)


-- B. Pro-Rata Math and Claim Automation
CREATE OR REPLACE FUNCTION automate_warranty_claim()
RETURNS TRIGGER AS $$
DECLARE
    v_warranty_record RECORD;
    v_plan_record RECORD;
    v_months_passed NUMERIC;
BEGIN
    -- 1. Find the warranty registration
    SELECT * INTO v_warranty_record
    FROM warranty_registrations
    WHERE serial_number = NEW.serial_number
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No warranty registration found for serial number %', NEW.serial_number;
    END IF;

    -- 2. Find the plan details
    SELECT * INTO v_plan_record
    FROM warranty_plans
    WHERE id = v_warranty_record.warranty_plan_id
    LIMIT 1;

    -- 3. Auto-link warranty_id
    NEW.warranty_id := v_warranty_record.id;

    -- 4. Calculate months passed since purchase date
    v_months_passed := extract(year from age(CURRENT_DATE, v_warranty_record.purchase_date)) * 12 + 
                       extract(month from age(CURRENT_DATE, v_warranty_record.purchase_date));

    -- 5. Determine Claim Type (Free Replacement vs Pro-Rata vs Expired)
    IF CURRENT_DATE > v_warranty_record.warranty_expiry_date THEN
        NEW.status := 'Rejected';
        NEW.claim_type := 'Expired';
        NEW.admin_notes := CONCAT('Automated Rejection: Warranty expired on ', v_warranty_record.warranty_expiry_date, '. ', COALESCE(NEW.admin_notes, ''));
        NEW.pro_rata_discount_percentage := 0;
        
    ELSIF v_months_passed <= v_plan_record.free_replacement_months THEN
        NEW.claim_type := 'Free Replacement';
        NEW.pro_rata_discount_percentage := 100;
        
    ELSE
        NEW.claim_type := 'Pro-Rata';
        -- Pro-rata Formula: (Remaining Warranty Months / Total Pro-Rata Months) * 100
        IF v_plan_record.pro_rata_months > 0 THEN
            NEW.pro_rata_discount_percentage := ROUND(((v_plan_record.warranty_months - v_months_passed) / v_plan_record.pro_rata_months::NUMERIC) * 100, 2);
            IF NEW.pro_rata_discount_percentage < 0 THEN 
                NEW.pro_rata_discount_percentage := 0; 
            END IF;
        ELSE
            NEW.pro_rata_discount_percentage := 0;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- C. Warranty Inheritance for Replacement Batteries
CREATE OR REPLACE FUNCTION handle_battery_replacement_in_claim()
RETURNS TRIGGER AS $$
DECLARE
    v_original_registration RECORD;
    v_new_wty_id TEXT;
BEGIN
    -- If a replacement serial is provided and status changes to Approved
    IF NEW.status = 'Approved' AND NEW.replacement_serial_number IS NOT NULL AND OLD.replacement_serial_number IS DISTINCT FROM NEW.replacement_serial_number THEN
        
        -- 1. Mark old battery as DEFECTIVE
        UPDATE battery_serials SET status = 'DEFECTIVE' WHERE serial_number = NEW.serial_number;
        
        -- 2. Find the original registration details
        SELECT * INTO v_original_registration FROM warranty_registrations WHERE id = NEW.warranty_id;
        
        -- 3. Mark new battery as REPLACED and assign model
        IF FOUND THEN
            INSERT INTO battery_serials (serial_number, product_id, status)
            VALUES (NEW.replacement_serial_number, v_original_registration.battery_model_id, 'REPLACED')
            ON CONFLICT (serial_number) DO UPDATE SET status = 'REPLACED', product_id = v_original_registration.battery_model_id;
        END IF;
        
        -- 4. Log into battery_replacements table
        INSERT INTO battery_replacements (original_serial, new_serial, claim_id, replacement_date, notes)
        VALUES (NEW.serial_number, NEW.replacement_serial_number, NEW.id, NOW(), 'Automated replacement via claim approval');

        -- 5. Warranty Inheritance: Register the NEW serial with the OLD dates
        IF FOUND THEN
            -- Generate a unique ID for the new registration
            v_new_wty_id := CONCAT('GW-WTY-REP-', substr(md5(random()::text), 1, 8));
            
            INSERT INTO warranty_registrations (
                id, customer_name, mobile, email, battery_model_id, serial_number, 
                purchase_date, invoice_number, dealer_name, dealer_id, 
                vehicle_reg_number, vehicle_make_model, invoice_url, status, 
                admin_notes, warranty_plan_id, warranty_start_date, warranty_expiry_date
            ) VALUES (
                v_new_wty_id,
                v_original_registration.customer_name,
                v_original_registration.mobile,
                v_original_registration.email,
                v_original_registration.battery_model_id,
                NEW.replacement_serial_number,
                v_original_registration.purchase_date,
                v_original_registration.invoice_number,
                v_original_registration.dealer_name,
                v_original_registration.dealer_id,
                v_original_registration.vehicle_reg_number,
                v_original_registration.vehicle_make_model,
                v_original_registration.invoice_url,
                'Verified',
                CONCAT('Automated Registration: Replacement for failed battery ', NEW.serial_number, '. Inherited original warranty dates.'),
                v_original_registration.warranty_plan_id,
                v_original_registration.warranty_start_date,
                v_original_registration.warranty_expiry_date
            ) ON CONFLICT (serial_number) DO NOTHING;
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
