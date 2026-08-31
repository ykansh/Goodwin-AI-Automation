import type {
  User, Customer, Supplier, Product, SalesInvoice, PurchaseOrder,
  Return, BatteryWarranty, Payment, LedgerEntry, CompanySettings,
} from '../types';

export interface AuthorizedAdmin {
  email: string;
  password: string;
  full_name: string;
  role: 'admin';
}

export const AUTHORIZED_ADMINS: AuthorizedAdmin[] = [
  {
    email: 'iamanshchourasiya@gmail.com',
    password: 'ansh@123',
    full_name: 'Ansh Chourasiya',
    role: 'admin',
  },
  {
    email: 'kiranpatidar.goodwinbatteries@gmail.com',
    password: 'kiran@123',
    full_name: 'Kiran Patidar',
    role: 'admin',
  },
  {
    email: 'abhishek.goodwinbatteries@gmail.com',
    password: 'abhi@123',
    full_name: 'Abhishek',
    role: 'admin',
  },
];

export const dummyUsers: User[] = [
  { id: 'u1', email: 'iamanshchourasiya@gmail.com', full_name: 'Ansh Chourasiya', role: 'admin', created_at: '2026-01-01' },
  { id: 'u2', email: 'kiranpatidar.goodwinbatteries@gmail.com', full_name: 'Kiran Patidar', role: 'admin', created_at: '2026-01-01' },
  { id: 'u3', email: 'abhishek.goodwinbatteries@gmail.com', full_name: 'Abhishek', role: 'admin', created_at: '2026-01-01' },
  { id: 'u4', email: 'admin@goodwin.com', full_name: 'Goodwin Admin', role: 'admin', created_at: '2026-01-01' },
];

export const dummyCompanySettings: CompanySettings = {
  id: 'set1',
  name: 'Goodwin Batteries & Power Solutions Ltd.',
  gstin: '23AAACG9876K1Z9',
  address: 'Plot 42, Sector-B, Sanwer Road Industrial Area, Indore, M.P. - 452015',
  phone: '+91 98765 43210 / 0731-2490011',
  email: 'support@goodwinbatteries.com',
  logo_url: '/logo.png',
  bank_details: {
    bank_name: 'HDFC Bank Ltd.',
    account_number: '50200088991122',
    ifsc_code: 'HDFC0000123',
    branch: 'MG Road Branch, Indore',
  },
  supabase_url: 'https://goodwin-erp.supabase.co',
  supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key',
  battery_configs: {
    voltages: ['12V', '24V', '48V'],
    ah_ratings: ['7.5Ah', '8Ah', '14Ah', '20Ah', '32Ah', '42Ah', '65Ah', '100Ah', '150Ah', '200Ah'],
    warehouses: ['Warehouse A / Rack-01', 'Warehouse A / Rack-04', 'Warehouse B / Rack-02', 'Warehouse B / Rack-12'],
    customer_types: ['dealer', 'distributor', 'retailer', 'oem'],
    salespersons: ['Deepak Singh', 'Priya Sharma', 'Rajesh Kumar', 'Vikram Singh'],
    default_gst_percent: 28,
  },
};

export const dummyCustomers: Customer[] = [
  { id: 'c1', uoi: 'GW-CUST-1001', name: 'ABC Battery Dealer', contact: '9876543210', email: 'abc@batterydealer.com', gstin: '23AABCA1234A1Z5', type: 'dealer', credit_limit: 500000, outstanding: 279400, address: 'Main Market, Indore, MP', salesperson: 'Deepak Singh', created_at: '2026-01-10' },
  { id: 'c2', uoi: 'GW-CUST-1002', name: 'Sharma Battery House', contact: '9876543211', email: 'sharma@batteryhouse.in', gstin: '23AABCS5678B2Z6', type: 'distributor', credit_limit: 1000000, outstanding: 125000, address: 'Palasia, Indore, MP', salesperson: 'Deepak Singh', created_at: '2026-01-12' },
  { id: 'c3', uoi: 'GW-CUST-1003', name: 'Verma Electronics', contact: '9876543212', email: 'verma@electronics.com', gstin: '23AABCV9012C3Z7', type: 'retailer', credit_limit: 200000, outstanding: 18500, address: 'Rajwada, Indore, MP', salesperson: 'Deepak Singh', created_at: '2026-01-15' },
  { id: 'c4', uoi: 'GW-CUST-1004', name: 'Patel Power Solutions', contact: '9876543213', email: 'patel@powersol.in', gstin: '24AABCP3456D4Z8', type: 'oem', credit_limit: 750000, outstanding: 78000, address: 'Naroda, Ahmedabad, GJ', salesperson: 'Priya Sharma', created_at: '2026-01-20' },
  { id: 'c5', uoi: 'GW-CUST-1005', name: 'Singh Battery Works', contact: '9876543214', email: 'singh@batteryworks.com', gstin: '09AABCS7890E5Z9', type: 'dealer', credit_limit: 300000, outstanding: 32000, address: 'Hazratganj, Lucknow, UP', salesperson: 'Deepak Singh', created_at: '2026-02-01' },
  { id: 'c6', uoi: 'GW-CUST-1006', name: 'Gupta Motors & Batteries', contact: '9876543215', email: 'gupta@motors.com', gstin: '23AABCG2345F6Z0', type: 'distributor', credit_limit: 800000, outstanding: 95000, address: 'Vijay Nagar, Indore, MP', salesperson: 'Deepak Singh', created_at: '2026-02-05' },
  { id: 'c7', uoi: 'GW-CUST-1007', name: 'Agrawal Battery Center', contact: '9876543216', email: 'agrawal@battery.in', gstin: '23AABCA6789G7Z1', type: 'retailer', credit_limit: 150000, outstanding: 12000, address: 'Sapna Sangeeta, Indore, MP', salesperson: 'Priya Sharma', created_at: '2026-02-10' },
  { id: 'c8', uoi: 'GW-CUST-1008', name: 'Kumar Energy Systems', contact: '9876543217', email: 'kumar@energy.com', gstin: '07AABCK1234H8Z2', type: 'oem', credit_limit: 600000, outstanding: 56000, address: 'Okhla, New Delhi, DL', salesperson: 'Priya Sharma', created_at: '2026-02-15' },
];

export const dummySuppliers: Supplier[] = [
  { id: 's1', uoi: 'GW-SUPP-0001', name: 'Exide Industries Ltd.', contact: '9812345670', email: 'supply@exide.com', gstin: '19AABCE1234A1Z5', type: 'Manufacturer', outstanding: 150000, address: 'Kolkata, West Bengal', created_at: '2026-01-01' },
  { id: 's2', uoi: 'GW-SUPP-0002', name: 'Amara Raja Batteries', contact: '9812345671', email: 'vendor@amararaja.com', gstin: '37AABCA5678B2Z6', type: 'Manufacturer', outstanding: 230000, address: 'Tirupati, Andhra Pradesh', created_at: '2026-01-05' },
  { id: 's3', uoi: 'GW-SUPP-0003', name: 'Luminous Power Tech', contact: '9812345672', email: 'supply@luminous.in', gstin: '06AABCL9012C3Z7', type: 'Manufacturer', outstanding: 80000, address: 'Gurugram, Haryana', created_at: '2026-01-10' },
  { id: 's4', uoi: 'GW-SUPP-0004', name: 'Livguard Energy Tech', contact: '9812345676', email: 'supply@livguard.com', gstin: '06AABCL6789G7Z1', type: 'Manufacturer', outstanding: 95000, address: 'Gurugram, Haryana', created_at: '2026-01-15' },
];

export const dummyProducts: Product[] = [
  { id: 'p1', name: 'Endura N150', battery_model: 'Endura N150', voltage: '12V', ah: '150Ah', sku: 'GW-N150', hsn: '8507', category: 'Automotive', technology: 'Flooded (Lead-Acid)', purchase_price: 9500, selling_price: 12500, stock: 2, warehouse_rack: 'Warehouse A / Rack-04', warranty_months: 18, gst_percent: 18, created_at: '2026-01-01' },
  { id: 'p2', name: 'PowerMax 12V 8Ah', battery_model: 'GW-12V-08AH', voltage: '12V', ah: '8Ah', sku: 'GW-12V-08AH', hsn: '8507', category: 'Two Wheeler', technology: 'VRLA / AGM', purchase_price: 2200, selling_price: 3200, stock: 150, warehouse_rack: 'Warehouse A / Rack-01', warranty_months: 24, gst_percent: 28, created_at: '2026-01-01' },
  { id: 'p3', name: 'PowerMax 12V 14Ah', battery_model: 'GW-12V-14AH', voltage: '12V', ah: '14Ah', sku: 'GW-12V-14AH', hsn: '8507', category: 'Automotive / E-Bike', technology: 'VRLA / AGM', purchase_price: 3200, selling_price: 4500, stock: 200, warehouse_rack: 'Warehouse A / Rack-02', warranty_months: 24, gst_percent: 28, created_at: '2026-01-01' },
  { id: 'p4', name: 'SolarTough 12V 200Ah', battery_model: 'GW-12V-200AH', voltage: '12V', ah: '200Ah', sku: 'GW-12V-200AH', hsn: '8507', category: 'Solar & Inverter', technology: 'Tubular (Deep Cycle)', purchase_price: 15000, selling_price: 21000, stock: 18, warehouse_rack: 'Warehouse B / Rack-12', warranty_months: 36, gst_percent: 28, created_at: '2026-01-01' },
  { id: 'p5', name: 'ProTough 24V 42Ah', battery_model: 'GW-24V-42AH', voltage: '24V', ah: '42Ah', sku: 'GW-24V-42AH', hsn: '8507', category: 'Industrial & Telecom', technology: 'AGM Sealed', purchase_price: 12000, selling_price: 17000, stock: 25, warehouse_rack: 'Warehouse B / Rack-02', warranty_months: 24, gst_percent: 28, created_at: '2026-01-01' },
];

export const dummySalesInvoices: SalesInvoice[] = [
  {
    id: 'si1',
    invoice_number: 'GW-INV-2026-0001',
    date: '2026-08-25',
    invoice_type: 'GST Tax Invoice',
    customer_id: 'c1',
    customer_name: 'ABC Battery Dealer',
    customer_uoi: 'GW-CUST-1001',
    customer_gstin: '23AABCA1234A1Z5',
    items: [
      { id: 'ii1', product_id: 'p1', product_name: 'Endura N150 (Goodwin 12V 150Ah)', sku: 'GW-N150', hsn: '8507', quantity: 40, rate: 12250, gst_percent: 18, amount: 490000 },
    ],
    taxable_amount: 490000,
    gst_amount: 88200,
    grand_total: 579400,
    status: 'partial',
    outstanding: 279400,
    created_at: '2026-08-25',
  },
  {
    id: 'si2',
    invoice_number: 'GW-INV-2026-0002',
    date: '2026-08-22',
    invoice_type: 'GST Tax Invoice',
    customer_id: 'c2',
    customer_name: 'Sharma Battery House',
    customer_uoi: 'GW-CUST-1002',
    customer_gstin: '23AABCS5678B2Z6',
    items: [
      { id: 'ii2', product_id: 'p3', product_name: 'PowerMax 12V 14Ah', sku: 'GW-12V-14AH', hsn: '8507', quantity: 50, rate: 4500, gst_percent: 28, amount: 225000 },
    ],
    taxable_amount: 225000,
    gst_amount: 63000,
    grand_total: 288000,
    status: 'partial',
    outstanding: 125000,
    created_at: '2026-08-22',
  },
  {
    id: 'si3',
    invoice_number: 'GW-INV-2026-0003',
    date: '2026-08-20',
    invoice_type: 'GST Tax Invoice',
    customer_id: 'c3',
    customer_name: 'Verma Electronics',
    customer_uoi: 'GW-CUST-1003',
    customer_gstin: '23AABCV9012C3Z7',
    items: [
      { id: 'ii3', product_id: 'p2', product_name: 'PowerMax 12V 8Ah', sku: 'GW-12V-08AH', hsn: '8507', quantity: 20, rate: 3200, gst_percent: 28, amount: 64000 },
    ],
    taxable_amount: 64000,
    gst_amount: 17920,
    grand_total: 81920,
    status: 'paid',
    outstanding: 0,
    created_at: '2026-08-20',
  },
];

export const dummyPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1',
    po_number: 'GW-PO-2026-0001',
    date: '2026-08-15',
    supplier_id: 's1',
    supplier_name: 'Exide Industries Ltd.',
    supplier_gstin: '19AABCE1234A1Z5',
    items: [
      { id: 'poi1', product_id: 'p1', product_name: 'Endura N150', sku: 'GW-N150', quantity: 30, rate: 9500, amount: 285000 },
    ],
    taxable_amount: 285000,
    gst_amount: 51300,
    grand_total: 336300,
    total: 336300,
    status: 'received',
    outstanding: 150000,
    created_at: '2026-08-15',
  },
];

export const dummyReturns: Return[] = [
  {
    id: 'r1',
    note_number: 'GW-CN-2026-001',
    date: '2026-08-24',
    type: 'credit',
    party_name: 'ABC Battery Dealer',
    party_id: 'c1',
    party_type: 'customer',
    items: [
      { id: 'ri1', product_id: 'p1', product_name: 'Endura N150', quantity: 1, rate: 12250, amount: 12250 },
    ],
    taxable_amount: 12250,
    gst_amount: 2205,
    amount: 14455,
    reason: 'Manufacturing defect in terminal',
    status: 'processed',
    linked_invoice_id: 'si1',
    created_at: '2026-08-24',
  },
];

export const dummyBatteryWarranties: BatteryWarranty[] = [
  {
    id: 'bw1',
    warranty_id: 'GW-BW-1001',
    battery_model: 'Endura N150',
    serial_number: 'GW-N150-2026-88912',
    product_name: 'Goodwin 12V 150Ah Endura N150',
    customer_name: 'ABC Battery Dealer',
    customer_id: 'c1',
    customer_uoi: 'GW-CUST-1001',
    purchase_date: '2026-08-25',
    warranty_expiry: '2028-02-25',
    status: 'active',
    notes: 'Standard 18 months replacement warranty',
    created_at: '2026-08-25',
  },
  {
    id: 'bw2',
    warranty_id: 'GW-BW-1002',
    battery_model: 'GW-12V-14AH',
    serial_number: 'GW-14AH-2026-77341',
    product_name: 'PowerMax 12V 14Ah',
    customer_name: 'Sharma Battery House',
    customer_id: 'c2',
    customer_uoi: 'GW-CUST-1002',
    purchase_date: '2026-08-22',
    warranty_expiry: '2028-08-22',
    status: 'active',
    notes: '24 months extended warranty',
    created_at: '2026-08-22',
  },
];

export const dummyPayments: Payment[] = [
  {
    id: 'pay1',
    receipt_number: 'GW-RCT-2026-0001',
    date: '2026-08-25',
    party_name: 'ABC Battery Dealer',
    party_id: 'c1',
    party_uoi: 'GW-CUST-1001',
    party_type: 'customer',
    payment_mode: 'bank',
    reference: 'HDFC-UTR-88992211',
    amount: 300000,
    direction: 'in',
    created_at: '2026-08-25',
  },
  {
    id: 'pay2',
    receipt_number: 'GW-VOUCH-2026-0001',
    date: '2026-08-20',
    party_name: 'Exide Industries Ltd.',
    party_id: 's1',
    party_type: 'supplier',
    payment_mode: 'bank',
    reference: 'ICICI-UTR-33441100',
    amount: 186300,
    direction: 'out',
    created_at: '2026-08-20',
  },
];

export const dummyLedgerEntries: LedgerEntry[] = [
  {
    id: 'le1',
    party_id: 'c1',
    party_name: 'ABC Battery Dealer',
    party_uoi: 'GW-CUST-1001',
    party_gstin: '23AABCA1234A1Z5',
    party_type: 'customer',
    date: '2026-08-25',
    description: 'Sales Invoice GW-INV-2026-0001',
    doc_number: 'GW-INV-2026-0001',
    debit: 579400,
    credit: 0,
    balance: 579400,
    reference_type: 'invoice',
    reference_id: 'si1',
    created_at: '2026-08-25',
  },
  {
    id: 'le2',
    party_id: 'c1',
    party_name: 'ABC Battery Dealer',
    party_uoi: 'GW-CUST-1001',
    party_gstin: '23AABCA1234A1Z5',
    party_type: 'customer',
    date: '2026-08-25',
    description: 'Payment Received (HDFC-UTR-88992211)',
    doc_number: 'GW-RCT-2026-0001',
    debit: 0,
    credit: 300000,
    balance: 279400,
    reference_type: 'payment',
    reference_id: 'pay1',
    created_at: '2026-08-25',
  },
];
