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
  partyName: string;
  partyPhone: string;
  partyGstin?: string;
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
  items: MockInvoiceItem[];
  upiQrUrl?: string;
}

export const INITIAL_BUSINESS: BusinessProfile = {
  businessName: 'Goodwin Batteries & Power Solutions',
  gstin: '27AAPCG1234F1Z5',
  phone: '+91 98201 12345',
  email: 'sales@goodwinpower.in',
  address: 'Plot 42, Industrial Area, Phase II, Andheri East',
  city: 'Mumbai',
  state: 'Maharashtra',
  stateCode: '27',
  pincode: '400093',
  upiId: 'goodwinpower@okaxis',
  invoicePrefix: 'GB-26/',
  currentInvoiceNumber: 104,
  defaultPrintFormat: 'A4',
  termsAndConditions: '1. Goods once sold will not be taken back without warranty claim card.\n2. Inverter batteries carry 36+24 month manufacturer pro-rata warranty.\n3. Subject to Mumbai Jurisdiction.',
  bankDetails: 'HDFC Bank - A/C: 50200012345678 - IFSC: HDFC0000123',
  storeTagline: 'Authorized Distributor of High-Performance Tubular & Solar Inverter Batteries',
  storeNotice: '⚡ Free same-day delivery across Mumbai & Thane on all Inverter Battery orders above ₹5,000!',
  enableOnlineStore: true,
};

export const INITIAL_ITEMS: MockItem[] = [
  {
    id: 'item-1',
    name: '12V 150Ah Tall Tubular Inverter Battery',
    sku: 'BAT-TT-150',
    barcode: '890123456701',
    hsnCode: '8507',
    unit: 'PCS',
    purchasePrice: 9200,
    salesPrice: 12499,
    mrp: 14500,
    stock: 24,
    minStockAlert: 8,
    taxRate: 28,
    category: 'Inverter Batteries',
    godown: 'Main Warehouse',
    description: 'Heavy duty tall tubular battery with high acid volume per ampere hour. Ideal for frequent and long power cuts.',
    showInStore: true,
    isFeatured: true,
    warranty: '36 Months Replacement + 24 Months Pro-Rata',
  },
  {
    id: 'item-2',
    name: '12V 100Ah Short Tubular Solar Battery',
    sku: 'BAT-ST-100',
    barcode: '890123456702',
    hsnCode: '8507',
    unit: 'PCS',
    purchasePrice: 6800,
    salesPrice: 8999,
    mrp: 10500,
    stock: 5, // Below alert
    minStockAlert: 10,
    taxRate: 28,
    category: 'Solar Batteries',
    godown: 'Main Warehouse',
    description: 'Compact C10 rated deep-discharge solar tubular battery designed for hybrid and off-grid rooftop solar systems.',
    showInStore: true,
    isFeatured: false,
    warranty: '60 Months Comprehensive Warranty',
  },
  {
    id: 'item-3',
    name: 'Pure Sine Wave Inverter 1100VA / 12V',
    sku: 'INV-PSW-1100',
    barcode: '890123456703',
    hsnCode: '8504',
    unit: 'PCS',
    purchasePrice: 4200,
    salesPrice: 5850,
    mrp: 6990,
    stock: 18,
    minStockAlert: 5,
    taxRate: 18,
    category: 'Inverters',
    godown: 'Main Warehouse',
    description: 'Microcontroller based pure sine wave home UPS with adaptive battery charging algorithm and silent operation.',
    showInStore: true,
    isFeatured: true,
    warranty: '24 Months On-site Warranty',
  },
  {
    id: 'item-4',
    name: 'Solar Panel 540W Mono Perc Half Cut',
    sku: 'SP-540-MONO',
    barcode: '890123456704',
    hsnCode: '8541',
    unit: 'PCS',
    purchasePrice: 11500,
    salesPrice: 14800,
    mrp: 17200,
    stock: 32,
    minStockAlert: 10,
    taxRate: 12,
    category: 'Solar Panels',
    godown: 'Shop Counter',
    description: 'A-Grade 144 half-cut cells mono PERC solar photovoltaic module with 21.2% module efficiency and IP68 junction box.',
    showInStore: true,
    isFeatured: true,
    warranty: '10 Years Product + 25 Years Performance',
  },
  {
    id: 'item-5',
    name: 'Battery Grade De-mineralized Water (5 Litres)',
    sku: 'WATER-DM-5L',
    barcode: '890123456705',
    hsnCode: '2853',
    unit: 'BTL',
    purchasePrice: 45,
    salesPrice: 90,
    mrp: 120,
    stock: 140,
    minStockAlert: 25,
    taxRate: 18,
    category: 'Accessories',
    godown: 'Shop Counter',
    description: 'Ultra-pure deionized distilled water with conductivity < 5 μS/cm. Extends tubular battery plate life.',
    showInStore: true,
    isFeatured: false,
    warranty: '100% Pure Laboratory Grade',
  },
  {
    id: 'item-6',
    name: '12V 200Ah Jumbo Tubular Battery',
    sku: 'BAT-JT-200',
    barcode: '890123456706',
    hsnCode: '8507',
    unit: 'PCS',
    purchasePrice: 12800,
    salesPrice: 16999,
    mrp: 19800,
    stock: 14,
    minStockAlert: 4,
    taxRate: 28,
    category: 'Inverter Batteries',
    godown: 'Main Warehouse',
    description: 'Ultra heavy duty 200Ah tubular container with ceramic vent plugs. Designed for commercial setups and heavy backup.',
    showInStore: true,
    isFeatured: true,
    warranty: '36 Months Replacement + 36 Months Pro-Rata',
  },
  {
    id: 'item-7',
    name: 'MPPT Solar Charge Controller 40A / 12V-24V',
    sku: 'SCC-MPPT-40',
    barcode: '890123456707',
    hsnCode: '8504',
    unit: 'PCS',
    purchasePrice: 3100,
    salesPrice: 4350,
    mrp: 5200,
    stock: 22,
    minStockAlert: 6,
    taxRate: 18,
    category: 'Accessories',
    godown: 'Shop Counter',
    description: 'Advanced Maximum Power Point Tracking (MPPT) controller with LCD display and 98% tracking efficiency.',
    showInStore: true,
    isFeatured: false,
    warranty: '12 Months Warranty',
  },
];

export const INITIAL_PARTIES: MockParty[] = [
  {
    id: 'party-1',
    name: 'Apex Electricals & Power Care',
    type: 'CUSTOMER',
    phone: '9822098765',
    email: 'apex.power@gmail.com',
    gstin: '27ABCDE1234F1Z5',
    state: 'Maharashtra',
    stateCode: '27',
    address: 'Shop 14, Galaxy Market, Pune',
    creditLimit: 200000,
    currentBalance: 42500, // Dr
  },
  {
    id: 'party-2',
    name: 'Balaji Solar Solutions',
    type: 'CUSTOMER',
    phone: '9845012345',
    email: 'balajisolar@yahoo.in',
    gstin: '29AABCB2234K1Z2', // Karnataka (Inter-state)
    state: 'Karnataka',
    stateCode: '29',
    address: '24 Brigade Road, Bangalore',
    creditLimit: 500000,
    currentBalance: 128400, // Dr
  },
  {
    id: 'party-3',
    name: 'Exide Lead & Alloys Corp',
    type: 'SUPPLIER',
    phone: '9811055443',
    email: 'sales@exidealloys.com',
    gstin: '07AAACE9876Q1Z9',
    state: 'Delhi',
    stateCode: '07',
    address: 'Okhla Industrial Area Phase 1, New Delhi',
    creditLimit: 1000000,
    currentBalance: -185000, // Cr (Payable)
  },
];

export const INITIAL_INVOICES: MockInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'GB-26/101',
    invoiceType: 'TAX_INVOICE',
    partyName: 'Apex Electricals & Power Care',
    partyPhone: '9822098765',
    partyGstin: '27ABCDE1234F1Z5',
    partyStateCode: '27',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-15',
    subtotal: 30848,
    discountTotal: 0,
    taxTotal: 6500,
    cgstTotal: 3250,
    sgstTotal: 3250,
    igstTotal: 0,
    roundOff: 0.16,
    totalAmount: 37348,
    paidAmount: 20000,
    balanceAmount: 17348,
    paymentStatus: 'PARTIAL',
    items: [
      {
        itemId: 'item-1',
        name: '12V 150Ah Tall Tubular Inverter Battery',
        hsnCode: '8507',
        quantity: 2,
        unit: 'PCS',
        unitPrice: 12499,
        discount: 0,
        taxRate: 28,
        cgst: 3499.72,
        sgst: 3499.72,
        igst: 0,
        total: 31997.44,
      },
      {
        itemId: 'item-3',
        name: 'Pure Sine Wave Inverter 1100VA / 12V',
        hsnCode: '8504',
        quantity: 1,
        unit: 'PCS',
        unitPrice: 5850,
        discount: 0,
        taxRate: 18,
        cgst: 526.5,
        sgst: 526.5,
        igst: 0,
        total: 6903,
      },
    ],
  },
];
