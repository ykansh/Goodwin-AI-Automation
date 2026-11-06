-- Create a bucket for storing invoices
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true) ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to invoices
CREATE POLICY "Allow public uploads to invoices" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'invoices');

-- Allow public reads from invoices
CREATE POLICY "Allow public reads from invoices" ON storage.objects FOR SELECT TO public USING (bucket_id = 'invoices');
