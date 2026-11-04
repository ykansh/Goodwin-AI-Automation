-- Goodwin Grow AI ERP - Attendance Extra Days Migration
-- Supports marking govt holidays and extra days worked
-- Rule: Extra days do not count towards regular attendance, counted in Extra Days, 1 extra day = ₹333 bonus

-- 1. Ensure table exists if not already
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Present',
    arrival VARCHAR(20),
    departure VARCHAR(20),
    is_finalized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(date, employee_name)
);

-- 2. Update check constraint if one exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'attendance_status_check'
    ) THEN
        ALTER TABLE attendance DROP CONSTRAINT attendance_status_check;
        ALTER TABLE attendance ADD CONSTRAINT attendance_status_check 
            CHECK (status IN ('Present', 'Absent', 'Half-Day', 'Extra Day'));
    END IF;
END $$;

COMMENT ON COLUMN attendance.status IS 'Allowed values: Present, Absent, Half-Day, Extra Day (Govt holiday / Sunday worked @ ₹333/day)';
