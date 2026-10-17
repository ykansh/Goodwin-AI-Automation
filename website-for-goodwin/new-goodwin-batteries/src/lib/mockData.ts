export interface BusinessProfile {
  businessName: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  upiId: string;
  invoicePrefix: string;
  currentInvoiceNumber: number;
  defaultPrintFormat?: 'A4' | 'THERMAL';
  termsAndConditions?: string;
  bankDetails?: string;
  storeTagline?: string;
  storeNotice?: string;
  enableOnlineStore?: boolean;
}

export interface MockItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  hsnCode: string;
  unit: string;
  purchasePrice: number;
  salesPrice: number;
  mrp: number;
  stock: number;
  minStockAlert: number;
  taxRate: number; // e.g. 18 or 28
  category: string;
  godown: string;
  description?: string;
  showInStore?: boolean;
  isFeatured?: boolean;
  warranty?: string;
}

export interface MockParty {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  phone: string;
  email: string;
  gstin: string;
  state: string;
  stateCode: string;
  address: string;
  creditLimit: number;
  currentBalance: number; // Positive = Receivable (Dr), Negative = Payable (Cr)
}

export interface MockInvoiceItem {
  itemId: string;
  name: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number; // percentage
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'QUOTATION' | 'DELIVERY_CHALLAN';
  orderNumber?: string;
  orderDate?: string;
  partyName: string; // Customer Contact Name
  partyPhone: string;
  partyGstin?: string; // Customer GSTIN
  billingName?: string; // Billing Name / Firm Name
  billingAddress?: string;
  billingState?: string;
  shippingAddress?: string;
  shippingState?: string;
  transportAddress?: string; // Transport Name & Address
  transportContactNumber?: string;
  transportGstin?: string; // Transporter GSTIN
  placeOfSupply?: string;
  placeOfDelivery?: string;
  referenceName?: string;
  pvtMarka?: string;
  partyStateCode: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  roundOff: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  paymentMode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  paymentReference?: string;
  items: MockInvoiceItem[];
  upiQrUrl?: string;
  notes?: string;
}

// Initial Clean Default Business Profile (Real Goodwin Data - No Dummies)
export const INITIAL_BUSINESS: BusinessProfile = {
  businessName: 'Goodwin Batteries',
  gstin: '23AABCG1234F1Z5',
  phone: '+91 96855 79269',
  email: 'info@goodwinbatteries.com',
  address: '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road',
  city: 'Indore',
  state: 'Madhya Pradesh',
  stateCode: '23',
  pincode: '452012',
  upiId: 'goodwin@okaxis',
  invoicePrefix: 'GW-INV/',
  currentInvoiceNumber: 101,
  defaultPrintFormat: 'A4',
  termsAndConditions: '1. Goods once sold will not be taken back without warranty claim card.\n2. Inverter batteries carry manufacturer pro-rata warranty.\n3. Subject to Indore Jurisdiction.',
  bankDetails: '',
  storeTagline: 'Authorized Manufacturer of Automotive, Tubular & Solar Batteries',
  storeNotice: '⚡ Express dispatch on all battery orders!',
  enableOnlineStore: true,
};

// All dummy data deleted - data is dynamically populated from Supabase
export const INITIAL_ITEMS: MockItem[] = [];
export const INITIAL_PARTIES: MockParty[] = [];
export const INITIAL_INVOICES: MockInvoice[] = [];
