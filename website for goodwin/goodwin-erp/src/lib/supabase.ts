import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = import.meta.env.VITE_SUPABASE_URL || 'https://goodwin-erp.supabase.co';
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const supabase = createClient(defaultUrl, defaultKey);

export function createDynamicSupabaseClient(url: string, key: string): SupabaseClient {
  return createClient(url, key);
}

export const GOODWIN_SUPABASE_SQL_SCHEMA = `-- Goodwin ERP & Ledger-Pro Database Schema
-- Run this in your Supabase SQL Editor to initialize your database tables

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uoi VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(50),
  email VARCHAR(255),
  gstin VARCHAR(50),
  type VARCHAR(50) NOT NULL,
  credit_limit NUMERIC(12, 2) DEFAULT 0,
  outstanding NUMERIC(12, 2) DEFAULT 0,
  address TEXT,
  salesperson VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uoi VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(50),
  email VARCHAR(255),
  gstin VARCHAR(50),
  type VARCHAR(50) DEFAULT 'Manufacturer',
  outstanding NUMERIC(12, 2) DEFAULT 0,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  battery_model VARCHAR(100) NOT NULL,
  voltage VARCHAR(20) NOT NULL,
  ah VARCHAR(20) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  hsn VARCHAR(50) DEFAULT '8507',
  category VARCHAR(100) DEFAULT 'Automotive',
  technology VARCHAR(100) DEFAULT 'Flooded (Lead-Acid)',
  purchase_price NUMERIC(12, 2) NOT NULL,
  selling_price NUMERIC(12, 2) NOT NULL,
  stock INT DEFAULT 0,
  warehouse_rack VARCHAR(100),
  warranty_months INT DEFAULT 18,
  gst_percent NUMERIC(5, 2) DEFAULT 28,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  date DATE NOT NULL,
  invoice_type VARCHAR(100) DEFAULT 'GST Tax Invoice',
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  taxable_amount NUMERIC(12, 2) NOT NULL,
  gst_amount NUMERIC(12, 2) NOT NULL,
  grand_total NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  outstanding NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  date DATE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  taxable_amount NUMERIC(12, 2) NOT NULL,
  gst_amount NUMERIC(12, 2) NOT NULL,
  grand_total NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'received',
  outstanding NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS battery_warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_id VARCHAR(100) UNIQUE NOT NULL,
  battery_model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  purchase_date DATE NOT NULL,
  warranty_expiry DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  date DATE NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  party_id UUID NOT NULL,
  party_type VARCHAR(50) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  reference VARCHAR(100),
  amount NUMERIC(12, 2) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  party_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  doc_number VARCHAR(100),
  debit NUMERIC(12, 2) DEFAULT 0,
  credit NUMERIC(12, 2) DEFAULT 0,
  balance NUMERIC(12, 2) DEFAULT 0,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

