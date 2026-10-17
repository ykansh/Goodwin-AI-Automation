import { createClient } from '@supabase/supabase-js';
import {
  MockItem,
  MockParty,
  MockInvoice,
  MockInvoiceItem,
  BusinessProfile,
} from './mockData';

// Supabase Configuration
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fyxqyylclamwigvdzjem.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eHF5eWxjbGFtd2lndmR6amVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Mzk3OTEsImV4cCI6MjEwMzIxNTc5MX0.czzLDeM6fw81zepKfgK6ckpcoo0F8BIq_36Y3b_yrFE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface CompanyConfig {
  id: string;
  code: 'goodwin-1' | 'goodwin-2';
  name: string;
  displayName: string;
  shortName: string;
  tagline: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  invoicePrefix: string;
  uoiPrefix: string;
  cashBalance: number;
  bankBalance: number;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  // Feature flags
  hasPos: boolean;         // Removed for Goodwin Batteries 2
  hasGstReports: boolean;   // Removed for Goodwin Batteries 2
  hasOnlineStore: boolean;  // Removed for Goodwin Batteries 2
}

export const COMPANIES: CompanyConfig[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'goodwin-1',
    name: 'Goodwin Batteries Pvt. Ltd.',
    displayName: 'Goodwin Batteries (With GST)',
    shortName: 'GB 1',
    tagline: 'Main Branch • GST Enterprise Suite',
    gstin: '23AABCG1234F1Z5',
    phone: '+91 9667724411',
    email: 'info@goodwinbatteries.com',
    address: '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012',
    city: 'Indore',
    state: 'Madhya Pradesh',
    stateCode: '23',
    pincode: '452012',
    invoicePrefix: 'GW-INV/',
    uoiPrefix: 'GW-CUST',
    cashBalance: 50000,
    bankBalance: 0,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    hasPos: true,
    hasGstReports: true,
    hasOnlineStore: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'goodwin-2',
    name: 'Goodwin Batteries Pvt. Ltd.',
    displayName: 'Goodwin Batteries (Without GST)',
    shortName: 'GB 2',
    tagline: 'Unit 2 • Fast Invoicing & Inventory (Without GST)',
    gstin: '23AABCG1234F1Z5',
    phone: '+91 9667724411',
    email: 'info@goodwinbatteries.com',
    address: '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012',
    city: 'Indore',
    state: 'Madhya Pradesh',
    stateCode: '23',
    pincode: '452012',
    invoicePrefix: 'GB2-INV/',
    uoiPrefix: 'GB2-CUST',
    cashBalance: 0,
    bankBalance: 0,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    // POS Quick Bill, GST Reports, Online Store are removed for Goodwin Batteries 2
    hasPos: false,
    hasGstReports: false,
    hasOnlineStore: false,
  },
];

// Helper to convert company settings to BusinessProfile
export function companyToBusinessProfile(company: CompanyConfig): BusinessProfile {
  return {
    businessName: company.name || 'Goodwin Batteries Pvt. Ltd.',
    gstin: company.gstin || '23AABCG1234F1Z5',
    phone: company.phone || '+91 9667724411',
    email: company.email || 'info@goodwinbatteries.com',
    address: company.address || '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012',
    city: company.city || 'Indore',
    state: company.state || 'Madhya Pradesh',
    stateCode: company.stateCode || '23',
    pincode: company.pincode || '452012',
    upiId: `${company.code === 'goodwin-2' ? 'goodwin2' : 'goodwin'}@okaxis`,
    invoicePrefix: company.invoicePrefix,
    currentInvoiceNumber: 101,
    defaultPrintFormat: 'A4',
    termsAndConditions:
      '1. Goods once sold will not be returned without warranty card.\n2. Subject to Indore Jurisdiction.',
    bankDetails: company.bankName && company.accountNumber
      ? `${company.bankName} - A/C: ${company.accountNumber} - IFSC: ${company.ifsc}`
      : '',
    storeTagline: `Authorized Manufacturer of Automotive & Inverter Batteries - ${company.name || 'Goodwin Batteries Pvt. Ltd.'}`,
    storeNotice: '⚡ Express dispatch across MP & Maharashtra!',
    enableOnlineStore: company.hasOnlineStore,
  };
}

// ── Supabase Service Functions ──────────────────────────────────────────────

/**
 * Fetch company settings for a given company code or id
 */
export async function fetchCompanyFromSupabase(companyId: string): Promise<CompanyConfig | null> {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (error || !data) return null;

    const baseConfig = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];
    return {
      ...baseConfig,
      name: 'Goodwin Batteries Pvt. Ltd.',
      displayName: baseConfig.displayName,
      gstin: data.gstin || baseConfig.gstin,
      address: data.address || baseConfig.address,
      phone: data.phone || baseConfig.phone,
      email: data.email || baseConfig.email,
      bankName: data.bank_name || '',
      accountNumber: data.account_number || '',
      ifsc: data.ifsc_code || '',
      invoicePrefix: data.invoice_prefix || baseConfig.invoicePrefix,
      cashBalance: typeof data.cash_balance === 'number' ? data.cash_balance : baseConfig.cashBalance,
      bankBalance: typeof data.bank_balance === 'number' ? data.bank_balance : baseConfig.bankBalance,
    };
  } catch (err) {
    console.warn('[Supabase] Error loading company settings:', err);
    return null;
  }
}

/**
 * Fetch staff members from Supabase hrms_employees table
 */
export async function fetchEmployeesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('hrms_employees')
      .select('*')
      .order('status', { ascending: true });

    if (error || !data) return [];

    return data
      .filter((e: any) => e.first_name && e.first_name.trim().length > 0)
      .map((e: any) => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name || ''}`.trim(),
        phone: e.phone ? (e.phone.startsWith('+91') ? e.phone : `+91 ${e.phone}`) : '',
        email: e.email || '',
        role: (e.designation?.toLowerCase().includes('sde') || e.department?.toLowerCase().includes('engineer'))
          ? 'OWNER'
          : (e.designation?.toLowerCase().includes('intern') || e.designation?.toLowerCase().includes('account'))
          ? 'BILLER'
          : 'MANAGER',
        status: (e.status === 'Active' ? 'ACTIVE' : 'INVITED') as 'ACTIVE' | 'INVITED',
        designation: e.designation || 'Staff',
      }));
  } catch (err) {
    console.error('[Supabase] Error fetching employees:', err);
    return [];
  }
}

/**
 * Fetch products from Supabase filtered for the given company
 */
export async function fetchProductsFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2'): Promise<MockItem[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching products:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Filter by company
    const filtered = data.filter((p: any) => {
      const sku = (p.sku || '').toUpperCase();
      const desc = (p.description || '').toUpperCase();
      const isGB2 = sku.startsWith('GB2-') || desc.includes('[GB2]');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((p: any): MockItem => ({
      id: p.id,
      name: p.name || p.battery_model || p.sku,
      sku: p.sku || `SKU-${p.id.slice(0, 6)}`,
      barcode: p.sku || p.id.slice(0, 8),
      hsnCode: p.hsn || p.hsn_code || '8507',
      unit: 'PCS',
      purchasePrice: Number(p.purchase_price) || 0,
      salesPrice: Number(p.selling_price) || 0,
      mrp: Number(p.mrp) || Math.round(Number(p.selling_price) * 1.15) || 0,
      stock: Number(p.stock) || 0,
      minStockAlert: 5,
      taxRate: Number(p.gst_percent || p.gst_rate) || 28,
      category: p.category || 'Automotive',
      godown: p.warehouse_rack || 'Main Warehouse',
      description: p.description || `${p.voltage || ''} ${p.ah ? p.ah + 'Ah' : ''} ${p.technology || ''}`.trim(),
      showInStore: true,
      isFeatured: Number(p.stock) > 0,
      warranty: p.warranty_months ? `${p.warranty_months} Months` : '18 Months',
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching products:', err);
    return [];
  }
}

/**
 * Insert new product in Supabase
 */
export async function insertProductToSupabase(
  item: Omit<MockItem, 'id'>,
  companyCode: 'goodwin-1' | 'goodwin-2'
): Promise<MockItem | null> {
  try {
    const sku = companyCode === 'goodwin-2' && !item.sku.startsWith('GB2-')
      ? `GB2-${item.sku}`
      : item.sku;

    const payload = {
      name: item.name,
      battery_model: item.name,
      sku,
      hsn: item.hsnCode,
      category: item.category,
      purchase_price: item.purchasePrice,
      selling_price: item.salesPrice,
      mrp: item.mrp,
      stock: item.stock,
      gst_percent: item.taxRate,
      warehouse_rack: item.godown,
      description: companyCode === 'goodwin-2' ? `${item.description || ''} [GB2]`.trim() : item.description || '',
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error inserting product:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      barcode: data.sku,
      hsnCode: data.hsn,
      unit: item.unit || 'PCS',
      purchasePrice: Number(data.purchase_price),
      salesPrice: Number(data.selling_price),
      mrp: Number(data.mrp),
      stock: Number(data.stock),
      minStockAlert: item.minStockAlert,
      taxRate: Number(data.gst_percent),
      category: data.category,
      godown: data.warehouse_rack,
      description: data.description,
      showInStore: item.showInStore,
      isFeatured: item.isFeatured,
      warranty: item.warranty,
    };
  } catch (err) {
    console.error('[Supabase] Error inserting product:', err);
    return null;
  }
}

/**
 * Update product in Supabase
 */
export async function updateProductInSupabase(id: string, updated: Partial<MockItem>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updated.name !== undefined) payload.name = updated.name;
    if (updated.salesPrice !== undefined) payload.selling_price = updated.salesPrice;
    if (updated.purchasePrice !== undefined) payload.purchase_price = updated.purchasePrice;
    if (updated.stock !== undefined) payload.stock = updated.stock;
    if (updated.category !== undefined) payload.category = updated.category;
    if (updated.hsnCode !== undefined) payload.hsn = updated.hsnCode;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) {
      console.error('[Supabase] Error updating product:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error updating product:', err);
    return false;
  }
}

/**
 * Delete product in Supabase
 */
export async function deleteProductInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting product:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error deleting product:', err);
    return false;
  }
}

/**
 * Fetch parties (customers & suppliers) from Supabase filtered by company
 */
export async function fetchPartiesFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2'): Promise<MockParty[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching customers:', error);
      return [];
    }

    if (!data) return [];

    const filtered = data.filter((c: any) => {
      const uoi = (c.uoi || '').toUpperCase();
      const isGB2 = uoi.startsWith('GB2-') || (c.address || '').includes('[GB2]');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((c: any): MockParty => {
      const gstin = c.gstin || '';
      const stateCode = gstin.length >= 2 && !isNaN(Number(gstin.slice(0, 2))) ? gstin.slice(0, 2) : '23';
      return {
        id: c.id,
        name: c.name,
        type: 'CUSTOMER',
        phone: c.contact || '',
        email: c.email || '',
        gstin: c.gstin || '',
        state: 'Madhya Pradesh',
        stateCode,
        address: c.address ? c.address.replace('[GB2]', '').trim() : '',
        creditLimit: Number(c.credit_limit) || 200000,
        currentBalance: Number(c.outstanding) || 0,
      };
    });
  } catch (err) {
    console.error('[Supabase] Error fetching parties:', err);
    return [];
  }
}

/**
 * Insert customer in Supabase
 */
export async function insertCustomerToSupabase(
  party: Omit<MockParty, 'id'>,
  companyCode: 'goodwin-1' | 'goodwin-2'
): Promise<MockParty | null> {
  try {
    const prefix = companyCode === 'goodwin-2' ? 'GB2-CUST' : 'GW-CUST';
    const uoi = `${prefix}-${Date.now().toString().slice(-4)}`;
    const address = companyCode === 'goodwin-2'
      ? `${party.address || ''} [GB2]`.trim()
      : party.address || '';

    const payload = {
      uoi,
      name: party.name,
      contact: party.phone,
      email: party.email,
      gstin: party.gstin,
      type: 'dealer',
      credit_limit: party.creditLimit || 300000,
      outstanding: party.currentBalance || 0,
      address,
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error inserting customer:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      type: 'CUSTOMER',
      phone: data.contact,
      email: data.email,
      gstin: data.gstin,
      state: party.state || 'Madhya Pradesh',
      stateCode: party.stateCode || '23',
      address: party.address,
      creditLimit: Number(data.credit_limit),
      currentBalance: Number(data.outstanding),
    };
  } catch (err) {
    console.error('[Supabase] Error inserting party:', err);
    return null;
  }
}

/**
 * Update customer in Supabase
 */
export async function updateCustomerInSupabase(id: string, updated: Partial<MockParty>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updated.name !== undefined) payload.name = updated.name;
    if (updated.phone !== undefined) payload.contact = updated.phone;
    if (updated.email !== undefined) payload.email = updated.email;
    if (updated.gstin !== undefined) payload.gstin = updated.gstin;
    if (updated.address !== undefined) payload.address = updated.address;
    if (updated.currentBalance !== undefined) payload.outstanding = updated.currentBalance;
    if (updated.creditLimit !== undefined) payload.credit_limit = updated.creditLimit;

    const { error } = await supabase.from('customers').update(payload).eq('id', id);
    if (error) {
      console.error('[Supabase] Error updating customer:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error updating customer:', err);
    return false;
  }
}

/**
 * Delete customer in Supabase
 */
export async function deleteCustomerInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting customer:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error deleting customer:', err);
    return false;
  }
}

/**
 * Fetch sales invoices from Supabase filtered by company
 */
export async function fetchInvoicesFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2'): Promise<MockInvoice[]> {
  try {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching invoices:', error);
      return [];
    }

    if (!data) return [];

    const filtered = data.filter((inv: any) => {
      const invNum = (inv.invoice_number || '').toUpperCase();
      const notes = (inv.notes || '').toUpperCase();
      const isGB2 = invNum.startsWith('GB2-') || notes.includes('[GB2]');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((inv: any): MockInvoice => {
      const gstin = inv.customer_gstin || '';
      const stateCode = gstin.length >= 2 && !isNaN(Number(gstin.slice(0, 2))) ? gstin.slice(0, 2) : '23';

      let meta: any = {};
      if (inv.notes && inv.notes.includes('[META:')) {
        try {
          const match = inv.notes.match(/\[META:(.*?)\]/);
          if (match && match[1]) {
            meta = JSON.parse(match[1]);
          }
        } catch {
          // ignore
        }
      }

      let items: MockInvoiceItem[] = [];
      if (Array.isArray(inv.items)) {
        items = inv.items.map((i: any) => ({
          itemId: i.product_id || i.id || 'item-0',
          name: i.product_name || i.name || i.sku || 'Battery Item',
          hsnCode: i.hsn || '8507',
          quantity: Number(i.quantity) || 1,
          unit: 'PCS',
          unitPrice: Number(i.rate || i.price || i.unitPrice) || 0,
          discount: Number(i.discount) || 0,
          taxRate: Number(i.gst_percent || i.gstPercent || 28),
          cgst: Number(i.gstVal ? i.gstVal / 2 : 0),
          sgst: Number(i.gstVal ? i.gstVal / 2 : 0),
          igst: 0,
          total: Number(i.amount || i.total) || 0,
        }));
      }

      const grandTotal = Number(inv.grand_total) || 0;
      const outstanding = Number(inv.outstanding) || 0;
      const isPaid = inv.status === 'paid' || outstanding === 0;
      const isQuotation = (inv.invoice_type || '').toLowerCase().includes('quotation');

      return {
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        invoiceType: isQuotation ? 'QUOTATION' : 'TAX_INVOICE',
        orderNumber: inv.order_number || meta.orderNumber || '',
        orderDate: inv.order_date || meta.orderDate || '',
        partyName: inv.customer_name || 'Cash Customer',
        partyPhone: inv.transport_contact_number || meta.customerPhone || '',
        partyGstin: inv.customer_gstin || '',
        billingName: inv.billing_name || meta.billingName || inv.customer_name || '',
        billingAddress: inv.billing_address || meta.billingAddress || '',
        billingState: inv.billing_state_ut || meta.billingState || 'Madhya Pradesh',
        shippingAddress: inv.shipping_address || meta.shippingAddress || '',
        shippingState: inv.shipping_state_ut || meta.shippingState || 'Madhya Pradesh',
        transportAddress: inv.transport_address || meta.transportAddress || '',
        transportContactNumber: inv.transport_contact_number || meta.transportContactNumber || '',
        transportGstin: inv.transport_gstin || meta.transportGstin || '',
        placeOfSupply: inv.place_of_supply || meta.placeOfSupply || 'Madhya Pradesh',
        placeOfDelivery: inv.place_of_delivery || meta.placeOfDelivery || 'Madhya Pradesh',
        referenceName: inv.reference_name || meta.referenceName || '',
        pvtMarka: inv.pvt_marka || meta.pvtMarka || '',
        partyStateCode: stateCode,
        invoiceDate: inv.date || new Date().toISOString().split('T')[0],
        dueDate: inv.date || new Date().toISOString().split('T')[0],
        subtotal: Number(inv.taxable_amount || grandTotal * 0.78),
        discountTotal: Number(inv.discount || 0),
        taxTotal: Number(inv.gst_amount || grandTotal * 0.22),
        cgstTotal: Number(inv.gst_amount ? inv.gst_amount / 2 : 0),
        sgstTotal: Number(inv.gst_amount ? inv.gst_amount / 2 : 0),
        igstTotal: 0,
        roundOff: 0,
        totalAmount: grandTotal,
        paidAmount: isPaid ? grandTotal : Math.max(0, grandTotal - outstanding),
        balanceAmount: isPaid ? 0 : outstanding,
        paymentStatus: isPaid ? 'PAID' : (outstanding < grandTotal ? 'PARTIAL' : 'UNPAID'),
        paymentMode: (meta.paymentMode || (inv.payment_mode ? inv.payment_mode.toUpperCase() : 'UPI')) as any,
        paymentReference: meta.paymentReference || '',
        items,
      };
    });
  } catch (err) {
    console.error('[Supabase] Error fetching invoices:', err);
    return [];
  }
}

/**
 * Insert invoice in Supabase
 */
export async function insertInvoiceToSupabase(
  invoice: MockInvoice,
  companyCode: 'goodwin-1' | 'goodwin-2'
): Promise<MockInvoice | null> {
  try {
    let invNum = invoice.invoiceNumber;
    invNum = invNum.trim();

    const extraMeta = {
      orderNumber: invoice.orderNumber || '',
      orderDate: invoice.orderDate || '',
      customerPhone: invoice.partyPhone || '',
      billingName: invoice.billingName || invoice.partyName || '',
      billingAddress: invoice.billingAddress || '',
      billingState: invoice.billingState || 'Madhya Pradesh',
      shippingAddress: invoice.shippingAddress || '',
      shippingState: invoice.shippingState || 'Madhya Pradesh',
      transportAddress: invoice.transportAddress || '',
      transportContactNumber: invoice.transportContactNumber || '',
      transportGstin: invoice.transportGstin || '',
      placeOfSupply: invoice.placeOfSupply || 'Madhya Pradesh',
      placeOfDelivery: invoice.placeOfDelivery || invoice.placeOfSupply || 'Madhya Pradesh',
      referenceName: invoice.referenceName || '',
      pvtMarka: invoice.pvtMarka || '',
      paymentMode: invoice.paymentMode || 'UPI',
      paymentReference: invoice.paymentReference || '',
      paymentStatus: invoice.paymentStatus,
    };
    const prefixTag = companyCode === 'goodwin-2' ? '[GB2]' : '';
    const notesStr = `${prefixTag} [META:${JSON.stringify(extraMeta)}]`.trim();

    const payload = {
      invoice_number: invNum,
      date: invoice.invoiceDate || new Date().toISOString().split('T')[0],
      invoice_type: invoice.invoiceType === 'QUOTATION' ? 'Quotation' : 'GST Tax Invoice',
      customer_name: invoice.partyName || 'Cash Sale',
      customer_gstin: invoice.partyGstin || null,
      taxable_amount: invoice.subtotal,
      subtotal: invoice.subtotal,
      gst_amount: invoice.taxTotal,
      grand_total: invoice.totalAmount,
      status: invoice.paymentStatus.toLowerCase(),
      payment_status: invoice.paymentStatus === 'PAID' ? 'Paid' : invoice.paymentStatus === 'PARTIAL' ? 'Partial' : 'Unpaid',
      payment_mode: (invoice.paymentMode || 'cash').toLowerCase(),
      outstanding: invoice.balanceAmount,
      items: invoice.items,
      notes: notesStr,
      transport_address: invoice.transportAddress || null,
      transport_contact_number: invoice.transportContactNumber || invoice.partyPhone || null,
      transport_gstin: invoice.transportGstin || null,
      place_of_supply: invoice.placeOfSupply || 'Madhya Pradesh',
      place_of_delivery: invoice.placeOfDelivery || invoice.placeOfSupply || 'Madhya Pradesh',
      reference_name: invoice.referenceName || null,
      pvt_marka: invoice.pvtMarka || null,
      billing_state_ut: invoice.billingState || 'Madhya Pradesh',
      shipping_state_ut: invoice.shippingState || 'Madhya Pradesh',
      dispatch_status: 'Not Delivered',
      order_type: invoice.orderNumber ? `Order #${invoice.orderNumber}` : 'New Order',
      lifecycle_status: invoice.invoiceType === 'QUOTATION' ? 'Quotation' : 'Confirmed',
    };

    const { data, error } = await supabase
      .from('sales_invoices')
      .insert([payload])
      .select()
      .single();

    // If invoice with this number already exists, return existing record to prevent duplicates
    if (error && error.message.includes('sales_invoices_invoice_number_key')) {
      const existing = await supabase
        .from('sales_invoices')
        .select('*')
        .eq('invoice_number', invNum)
        .maybeSingle();
      if (existing.data) {
        return {
          ...invoice,
          id: existing.data.id,
          invoiceNumber: existing.data.invoice_number,
        };
      }
    }

    if (error) {
      console.error('[Supabase] Error inserting invoice:', error);
      return null;
    }

    return {
      ...invoice,
      id: data?.id || invoice.id,
      invoiceNumber: payload.invoice_number,
    };
  } catch (err) {
    console.error('[Supabase] Error inserting invoice:', err);
    return null;
  }
}

/**
 * Update invoice in Supabase
 */
export async function updateInvoiceInSupabase(
  id: string,
  updated: Partial<MockInvoice>
): Promise<boolean> {
  try {
    const payload: any = {};
    if (updated.invoiceType) {
      payload.invoice_type = updated.invoiceType === 'QUOTATION' ? 'Quotation' : 'GST Tax Invoice';
      payload.lifecycle_status = updated.invoiceType === 'QUOTATION' ? 'Quotation' : 'Confirmed';
    }
    if (updated.invoiceNumber) payload.invoice_number = updated.invoiceNumber;
    if (updated.paymentStatus) {
      payload.status = updated.paymentStatus.toLowerCase();
      payload.payment_status =
        updated.paymentStatus === 'PAID'
          ? 'Paid'
          : updated.paymentStatus === 'PARTIAL'
          ? 'Partial'
          : 'Unpaid';
    }
    if (updated.balanceAmount !== undefined) {
      payload.outstanding = updated.balanceAmount;
    }
    if (updated.paymentMode) payload.payment_mode = updated.paymentMode.toLowerCase();

    const { error } = await supabase.from('sales_invoices').update(payload).eq('id', id);
    if (error) {
      console.error('[Supabase] Error updating invoice:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error updating invoice:', err);
    return false;
  }
}

/**
 * Delete invoice in Supabase
 */
export async function deleteInvoiceInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('sales_invoices').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting invoice:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error deleting invoice:', err);
    return false;
  }
}

/**
 * Fetch payments from Supabase filtered by company
 */
export async function fetchPaymentsFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2') {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) return [];

    const filtered = data.filter((p: any) => {
      const rec = (p.receipt_number || '').toUpperCase();
      const isGB2 = rec.startsWith('GB2-');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((p: any) => ({
      id: p.id,
      partyId: p.party_id || 'party-1',
      partyName: p.party_name || 'Customer',
      type: (p.direction === 'out' ? 'PAYMENT_OUT' : 'PAYMENT_IN') as 'PAYMENT_IN' | 'PAYMENT_OUT',
      amount: Number(p.amount) || 0,
      paymentMode: (p.payment_mode ? p.payment_mode.toUpperCase() : 'UPI') as any,
      referenceNumber: p.reference || p.receipt_number || '',
      date: p.date,
      notes: `Receipt #${p.receipt_number || ''}`,
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching payments:', err);
    return [];
  }
}

/**
 * Insert payment in Supabase
 */
export async function insertPaymentToSupabase(payment: any, companyCode: 'goodwin-1' | 'goodwin-2') {
  try {
    const prefix = companyCode === 'goodwin-2' ? 'GB2-REC' : 'GW-REC';
    const receiptNumber = `${prefix}-${Date.now().toString().slice(-4)}`;

    const payload = {
      receipt_number: receiptNumber,
      date: payment.date,
      party_name: payment.partyName,
      party_id: payment.partyId,
      party_type: payment.type === 'PAYMENT_IN' ? 'customer' : 'supplier',
      payment_mode: payment.paymentMode.toLowerCase(),
      reference: payment.referenceNumber,
      amount: payment.amount,
      direction: payment.type === 'PAYMENT_IN' ? 'in' : 'out',
    };

    const { error } = await supabase.from('payments').insert([payload]);
    if (error) console.error('[Supabase] Error inserting payment:', error);
  } catch (err) {
    console.error('[Supabase] Error inserting payment:', err);
  }
}
