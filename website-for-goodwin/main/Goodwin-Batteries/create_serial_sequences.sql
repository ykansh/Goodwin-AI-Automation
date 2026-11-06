CREATE TABLE IF NOT EXISTS serial_sequences (
    prefix_key TEXT PRIMARY KEY,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and allow authenticated users (or anyone, depending on your setup) to read/write
-- Since this is an admin feature, we'll allow all for simplicity in this setup, or just authenticated
ALTER TABLE serial_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to serial_sequences"
ON serial_sequences
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public access if your admin panel isn't strictly using authenticated Supabase sessions
CREATE POLICY "Allow public full access to serial_sequences"
ON serial_sequences
FOR ALL
TO public
USING (true)
WITH CHECK (true);
