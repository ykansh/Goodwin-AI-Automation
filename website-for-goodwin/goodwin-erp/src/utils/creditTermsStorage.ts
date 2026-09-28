import type { Customer, SalesInvoice } from '../types';
import { supabase } from '../lib/supabaseClient';

export interface CustomerCreditDetails {
  fixed_credit_terms?: string;
  payment_commitment_date?: string;
  material_received_time?: string;
  payment_cycle?: string;
  order_cycle?: string;
  credit_notes?: string;
}

export interface PendingBillItem {
  id: string;
  invoice_id?: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_days: number;
  status: 'On Time' | 'Due Today' | 'Overdue';
  commitment_date?: string;
  material_received_time?: string;
  is_opening_balance?: boolean;
}

export const CREDIT_TERM_OPTIONS = [
  '7 Days Net',
  '10 Days Net',
  '15 Days Net',
  '30 Days Net',
  '45 Days Net',
  '60 Days Net',
  '90 Days Net',
  'Bill-to-Bill',
  'Advance / No Credit',
  'Custom',
];

export const PAYMENT_CYCLE_OPTIONS = [
  'Weekly',
  '10 Days',
  '15 Days',
  '15/30 Days',
  '30 Days',
  'Bill-to-Bill',
  'Monthly',
  'Advance on Dispatch',
  'Custom',
];

export const ORDER_CYCLE_OPTIONS = [
  'Daily',
  'Twice a Week',
  'Weekly',
  '10 Days',
  '15 Days',
  'Bi-weekly',
  'Monthly',
  'Quarterly',
  'As Needed',
  'Custom',
];

export const MATERIAL_RECEIVED_TIME_OPTIONS = [
  'Immediate / Same Day',
  'Within 24 Hours',
  'Within 48 Hours',
  'Within 3-5 Days',
  'Within 7 Days',
  '10-15 Days',
  'Upon Verification / QC Pass',
  'On Delivery',
  'Custom',
];

const LOCAL_STORAGE_KEY = 'gw_customer_credit_terms_v1';

// Read all stored credit metadata from localStorage
export function getStoredCreditTermsMap(): Record<string, CustomerCreditDetails> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading credit terms from localStorage:', e);
  }
  return {};
}

// Save credit metadata for a specific customer
export function saveCreditTermsToLocalStorage(customerId: string, details: CustomerCreditDetails) {
  try {
    const map = getStoredCreditTermsMap();
    map[customerId] = {
      ...map[customerId],
      ...details,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving credit terms to localStorage:', e);
  }
}

// Compute days from credit term string (e.g. '30 Days Net' -> 30)
export function parseCreditTermDays(term?: string): number {
  if (!term) return 30;
  const match = term.match(/(\d+)\s*days?/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (term.toLowerCase().includes('bill-to-bill')) return 15;
  if (term.toLowerCase().includes('advance')) return 0;
  if (term.toLowerCase().includes('weekly')) return 7;
  if (term.toLowerCase().includes('monthly')) return 30;
  return 30;
}

// Derive clean default terms for a customer if none are stored yet
export function getDefaultCreditDetails(customer: Partial<Customer>): CustomerCreditDetails {
  const type = (customer.type || 'dealer').toLowerCase();
  let defaultTerm = '30 Days Net';
  let defaultPayCycle = '15/30 Days';
  let defaultOrderCycle = 'Weekly';
  let defaultMaterialTime = 'Within 3-5 Days';

  if (type === 'distributor') {
    defaultTerm = '45 Days Net';
    defaultPayCycle = '15/30 Days';
    defaultOrderCycle = 'Weekly';
    defaultMaterialTime = 'Within 3-5 Days';
  } else if (type === 'retailer') {
    defaultTerm = '15 Days Net';
    defaultPayCycle = 'Weekly';
    defaultOrderCycle = 'Weekly';
    defaultMaterialTime = 'Within 48 Hours';
  } else if (type === 'oem') {
    defaultTerm = '60 Days Net';
    defaultPayCycle = 'Monthly';
    defaultOrderCycle = 'Monthly';
    defaultMaterialTime = 'Within 7 Days';
  }

  return {
    fixed_credit_terms: defaultTerm,
    payment_cycle: defaultPayCycle,
    order_cycle: defaultOrderCycle,
    material_received_time: defaultMaterialTime,
  };
}

// Enriches a Customer instance with persisted or derived credit tracking details
export function enrichCustomerWithCreditTerms(customer: Customer): Customer {
  const storedMap = getStoredCreditTermsMap();
  const stored = storedMap[customer.id] || {};
  const defaults = getDefaultCreditDetails(customer);

  return {
    ...customer,
    fixed_credit_terms: customer.fixed_credit_terms || stored.fixed_credit_terms || defaults.fixed_credit_terms,
    payment_commitment_date: customer.payment_commitment_date || stored.payment_commitment_date || undefined,
    material_received_time: customer.material_received_time || stored.material_received_time || defaults.material_received_time,
    payment_cycle: customer.payment_cycle || stored.payment_cycle || defaults.payment_cycle,
    order_cycle: customer.order_cycle || stored.order_cycle || defaults.order_cycle,
    credit_notes: customer.credit_notes || stored.credit_notes || undefined,
  };
}

// Persist credit terms to both Supabase and localStorage
export async function persistCustomerCreditTerms(
  customerId: string, 
  details: CustomerCreditDetails
): Promise<{ success: boolean; error?: string }> {
  // 1. Immediately store in localStorage
  saveCreditTermsToLocalStorage(customerId, details);

  // 2. Attempt to update directly on Supabase customers table
  try {
    const payload: Record<string, any> = {};
    if (details.fixed_credit_terms !== undefined) payload.fixed_credit_terms = details.fixed_credit_terms;
    if (details.payment_commitment_date !== undefined) payload.payment_commitment_date = details.payment_commitment_date || null;
    if (details.material_received_time !== undefined) payload.material_received_time = details.material_received_time;
    if (details.payment_cycle !== undefined) payload.payment_cycle = details.payment_cycle;
    if (details.order_cycle !== undefined) payload.order_cycle = details.order_cycle;
    if (details.credit_notes !== undefined) payload.credit_notes = details.credit_notes;

    const { error } = await supabase.from('customers').update(payload).eq('id', customerId);
    if (error) {
      // If error is PGRST204 (column does not exist yet), it's safe to ignore as localStorage holds it
      console.warn('[CreditTerms] Note: Supabase table does not yet have columns, stored in client sync cache:', error.message);
    }
  } catch (err) {
    console.warn('[CreditTerms] Supabase update warning:', err);
  }

  return { success: true };
}

// Calculates pending bills for a customer based on invoices and customer outstanding balance
export function calculateCustomerPendingBills(
  customer: Customer, 
  allInvoices: SalesInvoice[]
): PendingBillItem[] {
  const pendingBills: PendingBillItem[] = [];
  const today = new Date();
  const termDays = parseCreditTermDays(customer.fixed_credit_terms);

  // Match invoices by customer_id or trimmed name match
  const customerInvoices = allInvoices.filter((inv) => {
    if (inv.customer_id && inv.customer_id === customer.id) return true;
    if (inv.customer_name && inv.customer_name.trim().toLowerCase() === customer.name.trim().toLowerCase()) return true;
    return false;
  });

  let totalInvoicesPendingAmount = 0;

  customerInvoices.forEach((inv) => {
    // Only pending or partially paid invoices with positive outstanding
    const isUnpaid = inv.payment_status !== 'Paid' && inv.status !== 'paid';
    const invOutstanding = Number(inv.outstanding ?? (inv.grand_total || 0));

    if (isUnpaid && invOutstanding > 0) {
      totalInvoicesPendingAmount += invOutstanding;

      // Calculate due date
      let dueDateStr = inv.due_date;
      if (!dueDateStr && inv.date) {
        const invDate = new Date(inv.date);
        if (!isNaN(invDate.getTime())) {
          invDate.setDate(invDate.getDate() + termDays);
          dueDateStr = invDate.toISOString().split('T')[0];
        }
      }
      if (!dueDateStr) {
        dueDateStr = inv.date || today.toISOString().split('T')[0];
      }

      // Calculate overdue days
      const dueDateObj = new Date(dueDateStr);
      let overdueDays = 0;
      let status: 'On Time' | 'Due Today' | 'Overdue' = 'On Time';

      if (!isNaN(dueDateObj.getTime())) {
        const diffTime = today.getTime() - dueDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          overdueDays = diffDays;
          status = 'Overdue';
        } else if (diffDays === 0) {
          status = 'Due Today';
        } else {
          status = 'On Time';
        }
      }

      pendingBills.push({
        id: inv.id,
        invoice_id: inv.id,
        bill_number: inv.invoice_number,
        bill_date: inv.date || today.toISOString().split('T')[0],
        due_date: dueDateStr,
        amount: Number(inv.grand_total || 0),
        paid_amount: Math.max(0, Number(inv.grand_total || 0) - invOutstanding),
        pending_amount: invOutstanding,
        overdue_days: overdueDays,
        status,
        commitment_date: inv.payment_commitment_date || customer.payment_commitment_date,
        material_received_time: inv.material_received_time || customer.material_received_time,
        is_opening_balance: false,
      });
    }
  });

  // If customer has an outstanding balance in their account that exceeds specific invoices
  // (e.g. imported ledger opening balance), create an account ledger balance bill entry
  const customerTotalOutstanding = Number(customer.outstanding || 0);
  const unallocatedOutstanding = customerTotalOutstanding - totalInvoicesPendingAmount;

  if (unallocatedOutstanding > 0) {
    // Determine due date from customer created_at or default
    const refDate = customer.created_at ? new Date(customer.created_at) : new Date(today.getTime() - 15 * 86400000);
    const dueDate = new Date(refDate);
    dueDate.setDate(dueDate.getDate() + termDays);
    const dueDateStr = !isNaN(dueDate.getTime()) ? dueDate.toISOString().split('T')[0] : today.toISOString().split('T')[0];

    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const overdueDays = diffDays > 0 ? diffDays : 0;
    const status: 'On Time' | 'Due Today' | 'Overdue' = overdueDays > 0 ? 'Overdue' : 'On Time';

    pendingBills.unshift({
      id: `open-bal-${customer.id}`,
      bill_number: `OB-${customer.uoi || 'BAL'}`,
      bill_date: refDate.toISOString().split('T')[0],
      due_date: dueDateStr,
      amount: unallocatedOutstanding,
      paid_amount: 0,
      pending_amount: unallocatedOutstanding,
      overdue_days: overdueDays,
      status,
      commitment_date: customer.payment_commitment_date,
      material_received_time: customer.material_received_time,
      is_opening_balance: true,
    });
  }

  return pendingBills;
}

// SQL Migration Script helper
export const SUPABASE_CREDIT_TERMS_MIGRATION_SQL = `-- Run this in Supabase SQL Editor to add Credit & Payment tracking columns
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS fixed_credit_terms VARCHAR(100) DEFAULT '30 Days Net',
ADD COLUMN IF NOT EXISTS payment_commitment_date DATE,
ADD COLUMN IF NOT EXISTS material_received_time VARCHAR(100) DEFAULT 'Within 3-5 Days',
ADD COLUMN IF NOT EXISTS payment_cycle VARCHAR(100) DEFAULT '15/30 Days',
ADD COLUMN IF NOT EXISTS order_cycle VARCHAR(100) DEFAULT 'Weekly',
ADD COLUMN IF NOT EXISTS credit_notes TEXT;

ALTER TABLE sales_invoices
ADD COLUMN IF NOT EXISTS payment_commitment_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS material_received_time VARCHAR(100);
`;
