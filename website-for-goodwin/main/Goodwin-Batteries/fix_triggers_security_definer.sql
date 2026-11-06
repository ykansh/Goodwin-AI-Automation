-- Fixes RLS violation when dealers register warranties or claims
-- by allowing triggers to bypass RLS and insert/update admin tables.

CREATE OR REPLACE FUNCTION update_battery_status_after_registration()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    -- Insert the serial number into battery_serials (or update it if it somehow exists)
    INSERT INTO battery_serials (serial_number, product_id, status)
    VALUES (NEW.serial_number, NEW.battery_model_id, 'SOLD')
    ON CONFLICT (serial_number) DO UPDATE
    SET status = 'SOLD', product_id = NEW.battery_model_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_battery_replacement_in_claim()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
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
