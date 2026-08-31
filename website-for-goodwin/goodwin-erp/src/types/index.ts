export type UserRole = 'admin' | 'manager' | 'accounts' | 'sales' | 'inventory';
export type AppMode = 'erp' | 'ledger' | 'leads';
export type CustomerType = 'dealer' | 'distributor' | 'retailer' | 'oem';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type POStatus = 'received' | 'pending' | 'partial';
export type ReturnType = 'credit' | 'debit';
export type PartyType = 'customer' | 'supplier';
export type PaymentMode = 'cash' | 'bank' | 'upi' | 'cheque';
export type PaymentDirection = 'in' | 'out';
export type WarrantyStatus = 'active' | 'expired' | 'claimed';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  uoi: string; // Unified Customer ID e.g. GW-CUST-1001
  name: string;
  contact: string;
  email: string;
  gstin: string;
  type: CustomerType;
  credit_limit: number;
  outstanding: number;
  address: string;
  salesperson: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  uoi?: string;
  name: string;
  contact: string;
  email: string;
  gstin: string;
  type: string; // Manufacturer, Importer, Distributor
  outstanding: number;
  address: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  battery_model: string;
  voltage: string; // e.g. 12V, 24V, 48V
  ah: string; // e.g. 8Ah, 14Ah, 150Ah
  sku: string; // e.g. GW-N150
  hsn: string; // e.g. 8507
  category: string; // e.g. Automotive, Tubular, Inverter, VRLA
  technology: string; // e.g. Flooded (Lead-Acid), AGM, Gel
  purchase_price: number;
  selling_price: number;
  stock: number;
  warehouse_rack: string; // e.g. Warehouse A / Rack-04
  warranty_months: number;
  gst_percent: number;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  hsn?: string;
  quantity: number;
  rate: number;
  gst_percent: number;
  amount: number;
}

export interface SalesInvoice {
  id: string;
  invoice_number: string; // e.g. GW-INV-2026-0001
  date: string;
  invoice_type: string; // GST Tax Invoice, Retail Invoice
  customer_id: string;
  customer_name: string;
  customer_uoi?: string;
  customer_gstin?: string;
  items: InvoiceItem[];
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
  status: InvoiceStatus;
  outstanding: number;
  created_at: string;
}

export interface POItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string; // e.g. GW-PO-2026-0001
  date: string;
  supplier_id: string;
  supplier_name: string;
  supplier_gstin?: string;
  items: POItem[];
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
  total?: number;
  status: POStatus;
  outstanding: number;
  created_at: string;
}

export interface ReturnItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Return {
  id: string;
  note_number: string; // e.g. GW-CN-2026-001 or GW-DN-2026-001
  date: string;
  type: ReturnType; // credit | debit
  party_name: string;
  party_id?: string;
  party_type: PartyType; // customer | supplier
  items: ReturnItem[];
  taxable_amount: number;
  gst_amount: number;
  amount: number;
  reason: string;
  status: 'processed' | 'pending';
  linked_invoice_id: string;
  created_at: string;
}

export interface BatteryWarranty {
  id: string;
  warranty_id: string;
  battery_model: string;
  serial_number: string;
  product_name: string;
  customer_name: string;
  customer_id: string;
  customer_uoi?: string;
  purchase_date: string;
  warranty_expiry: string;
  status: WarrantyStatus;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  receipt_number: string; // e.g. RCT-2026-0001
  date: string;
  party_name: string;
  party_id: string;
  party_uoi?: string;
  party_type: PartyType;
  payment_mode: PaymentMode;
  reference: string;
  amount: number;
  direction: PaymentDirection; // in | out
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  party_id: string;
  party_name: string;
  party_uoi?: string;
  party_gstin?: string;
  party_type: PartyType;
  date: string;
  description: string;
  doc_number: string;
  debit: number;
  credit: number;
  balance: number;
  reference_type?: 'invoice' | 'purchase' | 'payment' | 'return' | 'opening';
  reference_id?: string;
  created_at: string;
}

export interface CompanySettings {
  id: string;
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    branch: string;
  };
  supabase_url?: string;
  supabase_anon_key?: string;
  battery_configs: {
    voltages: string[];
    ah_ratings: string[];
    warehouses: string[];
    customer_types: string[];
    salespersons: string[];
    default_gst_percent: number;
  };
}

export interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  module: string;
}

// ── Lead Management Types ───────────────────────────────────────────
export type LeadStage = 'New' | 'Contacted' | 'Follow-up' | 'Qualified' | 'Won' | 'Lost';

export type LeadSource =
  | 'WhatsApp'
  | 'Phone'
  | 'Website'
  | 'Referral'
  | 'Walk-in'
  | 'Existing Customer'
  | 'Other';

export type LostReason =
  | 'Price too high'
  | 'Bought from competitor'
  | 'Not interested'
  | 'No response'
  | 'Requirement cancelled'
  | 'Other';

export type ActivityType = 'Call' | 'WhatsApp' | 'Meeting' | 'Note';

export interface Lead {
  id: string;
  name: string;
  company_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  source: LeadSource;
  stage: LeadStage;
  expected_value: number;
  requirement: string;
  assigned_to: string;
  next_followup_date: string; // YYYY-MM-DD
  next_followup_time: string; // HH:MM or "11:00 AM"
  notes: string;
  lost_reason?: LostReason | string;
  party_id?: string; // ID of converted Customer
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  created_at: string;
  created_by: string;
}

