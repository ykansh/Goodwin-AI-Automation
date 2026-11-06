CREATE TABLE IF NOT EXISTS sticker_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT,
    product_name TEXT,
    warranty_duration TEXT,
    manufacturing_date TEXT,
    quantity INTEGER,
    prefix_key TEXT,
    start_sequence INTEGER,
    end_sequence INTEGER,
    sales_channel TEXT,
    dealer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sticker_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to sticker_batches" ON sticker_batches;
CREATE POLICY "Allow public full access to sticker_batches"
ON sticker_batches
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS serial_sequences (
    prefix_key TEXT PRIMARY KEY,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE serial_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to serial_sequences" ON serial_sequences;
CREATE POLICY "Allow public full access to serial_sequences"
ON serial_sequences
FOR ALL
TO public
USING (true)
WITH CHECK (true);
