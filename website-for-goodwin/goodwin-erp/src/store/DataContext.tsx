import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  Customer, Supplier, Product, SalesInvoice, PurchaseOrder,
  Return, BatteryWarranty, Payment, LedgerEntry, CompanySettings,
  Lead, LeadActivity, CustomerType,
  HrmsEmployee, HrmsAttendance, HrmsLeave, HrmsPayroll
} from '../types';

import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// ── Unique Sequence / ID Generators ──────────────────────────────────────────
function getNextCustomerUoi(list: Customer[]): string {
  const nums = list
    .map((c) => {
      const m = c.uoi?.match(/GW-CUST-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `GW-CUST-${max + 1}`;
}

function getNextSupplierUoi(list: Supplier[]): string {
  const nums = list
    .map((s) => {
      const m = s.uoi?.match(/GW-SUPP-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `GW-SUPP-${String(max + 1).padStart(4, '0')}`;
}

function getNextInvoiceNumber(list: SalesInvoice[]): string {
  const year = new Date().getFullYear();
  const nums = list
    .map((i) => {
      const m = i.invoice_number?.match(/GW-INV-\d+-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `GW-INV-${year}-${String(max + 1).padStart(4, '0')}`;
}

function getNextPoNumber(list: PurchaseOrder[]): string {
  const year = new Date().getFullYear();
  const nums = list
    .map((p) => {
      const m = p.po_number?.match(/GW-PO-\d+-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `GW-PO-${year}-${String(max + 1).padStart(4, '0')}`;
}

function getNextPaymentNumber(list: Payment[], direction: 'in' | 'out'): string {
  const year = new Date().getFullYear();
  const prefix = direction === 'in' ? 'GW-RCT' : 'GW-VOUCH';
  const nums = list
    .map((p) => {
      const m = p.receipt_number?.match(/GW-(?:RCT|VOUCH)-\d+-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}-${year}-${String(max + 1).padStart(4, '0')}`;
}

function getNextWarrantyId(list: BatteryWarranty[]): string {
  const nums = list
    .map((w) => {
      const m = w.warranty_id?.match(/GW-BW-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `GW-BW-${max + 1}`;
}

function getNextReturnNumber(list: Return[], type: 'credit' | 'debit'): string {
  const year = new Date().getFullYear();
  const prefix = type === 'credit' ? 'GW-CN' : 'GW-DN';
  const nums = list
    .map((r) => {
      const m = r.note_number?.match(/GW-(?:CN|DN)-\d+-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}-${year}-${String(max + 1).padStart(3, '0')}`;
}

interface DataContextType {
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  invoices: SalesInvoice[];
  purchases: PurchaseOrder[];
  returns: Return[];
  warranties: BatteryWarranty[];
  payments: Payment[];
  ledgerEntries: LedgerEntry[];
  settings: CompanySettings;
  leads: Lead[];
  activities: LeadActivity[];

  // Financial Stats
  cashBalance: number;
  bankBalance: number;

  // Actions with connected auto-updates
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'uoi'> & { outstanding?: number }) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'uoi'> & { outstanding?: number }) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;

  createSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'created_at' | 'invoice_number' | 'outstanding'> & { initial_payment?: number }) => SalesInvoice;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'created_at' | 'po_number' | 'outstanding'> & { initial_payment?: number }) => PurchaseOrder;
  createPaymentIn: (payment: Omit<Payment, 'id' | 'created_at' | 'receipt_number' | 'direction'>) => void;
  createPaymentOut: (payment: Omit<Payment, 'id' | 'created_at' | 'receipt_number' | 'direction'>) => void;
  createReturn: (ret: Omit<Return, 'id' | 'created_at' | 'note_number'>) => void;
  registerWarranty: (warranty: Omit<BatteryWarranty, 'id' | 'created_at' | 'warranty_id'>) => void;
  updateWarrantyStatus: (id: string, status: BatteryWarranty['status']) => void;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;

  // HRMS State & Actions
  hrmsEmployees: HrmsEmployee[];
  hrmsAttendance: HrmsAttendance[];
  hrmsLeaves: HrmsLeave[];
  hrmsPayroll: HrmsPayroll[];
  addHrmsEmployee: (emp: Omit<HrmsEmployee, 'id' | 'created_at' | 'updated_at'>) => Promise<HrmsEmployee | null>;
  updateHrmsEmployee: (id: string, updates: Partial<HrmsEmployee>) => Promise<HrmsEmployee | null>;
  markAttendance: (attendance: Omit<HrmsAttendance, 'id' | 'created_at'>) => void;
  applyLeave: (leave: Omit<HrmsLeave, 'id' | 'created_at'>) => void;
  updateLeaveStatus: (id: string, status: string) => void;
  processPayroll: (payroll: Omit<HrmsPayroll, 'id' | 'created_at'>) => void;

  // Lead Management Actions
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>, silent?: boolean) => void;
  deleteLead: (id: string) => void;
  addActivity: (activity: Omit<LeadActivity, 'id' | 'created_at'>) => LeadActivity;
  convertLeadToParty: (leadId: string, partyData: { name: string; contact: string; email: string; address: string; type: CustomerType; gstin?: string; linkExistingId?: string }) => void;

}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);

  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);

  const [returns, setReturns] = useState<Return[]>([]);

  const [warranties, setWarranties] = useState<BatteryWarranty[]>([]);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  const [settings, setSettings] = useState<CompanySettings>({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Goodwin Batteries Pvt. Ltd.',
    gstin: '',
    address: '',
    phone: '',
    email: '',
    logo_url: '',
    bank_details: { bank_name: '', account_number: '', ifsc_code: '', branch: '' },
    battery_configs: { voltages: [], ah_ratings: [], warehouses: [], customer_types: [], salespersons: [], default_gst_percent: 28 },
    });

  const [leads, setLeads] = useState<Lead[]>([]);

  const [activities, setActivities] = useState<LeadActivity[]>([]);

  const [hrmsEmployees, setHrmsEmployees] = useState<HrmsEmployee[]>([]);
  const [hrmsAttendance, setHrmsAttendance] = useState<HrmsAttendance[]>([]);
  const [hrmsLeaves, setHrmsLeaves] = useState<HrmsLeave[]>([]);
  const [hrmsPayroll, setHrmsPayroll] = useState<HrmsPayroll[]>([]);

  const [cashBalance, setCashBalance] = useState<number>(145000);
  const [bankBalance, setBankBalance] = useState<number>(1850000);

  // Sync to local storage only if Supabase is NOT configured












  // ── Supabase: Fetch cloud data on mount ─────────────────────────────────────
  const { data: qSettings } = useQuery({ queryKey: ['company_settings'], queryFn: async () => { const { data } = await supabase.from('company_settings').select('*').limit(1).maybeSingle(); return data as CompanySettings || null; }});
  const { data: qCustomers } = useQuery({ queryKey: ['customers'], queryFn: async () => { const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false }); return data as Customer[] || []; }});
  const { data: qSuppliers } = useQuery({ queryKey: ['suppliers'], queryFn: async () => { const { data } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false }); return data as Supplier[] || []; }});
  const { data: qProducts } = useQuery({ queryKey: ['products'], queryFn: async () => { const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); return data as Product[] || []; }});
  const { data: qInvoices } = useQuery({ queryKey: ['invoices'], queryFn: async () => { const { data } = await supabase.from('sales_invoices').select('*').order('created_at', { ascending: false }); return data as SalesInvoice[] || []; }});
  const { data: qPurchases } = useQuery({ queryKey: ['purchases'], queryFn: async () => { const { data } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }); return data as PurchaseOrder[] || []; }});
  const { data: qReturns } = useQuery({ queryKey: ['returns'], queryFn: async () => { const { data } = await supabase.from('returns').select('*').order('created_at', { ascending: false }); return data as Return[] || []; }});
  const { data: qWarranties } = useQuery({ queryKey: ['warranties'], queryFn: async () => { const { data } = await supabase.from('battery_warranties').select('*').order('created_at', { ascending: false }); return data as BatteryWarranty[] || []; }});
  const { data: qPayments } = useQuery({ queryKey: ['payments'], queryFn: async () => { const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false }); return data as Payment[] || []; }});
  const { data: qLedgerEntries } = useQuery({ queryKey: ['ledgerEntries'], queryFn: async () => { const { data } = await supabase.from('ledger_entries').select('*').order('created_at', { ascending: false }); return data as LedgerEntry[] || []; }});
  const { data: qLeads } = useQuery({ queryKey: ['leads'], queryFn: async () => { const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }); return data as Lead[] || []; }});
  const { data: qActivities } = useQuery({ queryKey: ['activities'], queryFn: async () => { const { data } = await supabase.from('lead_activities').select('*').order('created_at', { ascending: false }); return data as LeadActivity[] || []; }});

  // Sync react-query data to context state to maintain backwards compatibility
  useEffect(() => { if (qSettings) setSettings(qSettings); }, [qSettings]);
  useEffect(() => { if (qCustomers) setCustomers(qCustomers); }, [qCustomers]);
  useEffect(() => { if (qSuppliers) setSuppliers(qSuppliers); }, [qSuppliers]);
  useEffect(() => { if (qProducts) setProducts(qProducts); }, [qProducts]);
  useEffect(() => { if (qInvoices) setInvoices(qInvoices); }, [qInvoices]);
  useEffect(() => { if (qPurchases) setPurchases(qPurchases); }, [qPurchases]);
  useEffect(() => { if (qReturns) setReturns(qReturns); }, [qReturns]);
  useEffect(() => { if (qWarranties) setWarranties(qWarranties); }, [qWarranties]);
  useEffect(() => { if (qPayments) setPayments(qPayments); }, [qPayments]);
  useEffect(() => { if (qLedgerEntries) setLedgerEntries(qLedgerEntries); }, [qLedgerEntries]);
  useEffect(() => { if (qLeads) setLeads(qLeads); }, [qLeads]);
  useEffect(() => { if (qActivities) setActivities(qActivities); }, [qActivities]);


  // ── Supabase: Real-time subscriptions ──────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase!
      .channel('goodwin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload) => {
        if (payload.eventType === 'INSERT') setCustomers((p) => [payload.new as Customer, ...p.filter((c) => c.id !== (payload.new as Customer).id)]);
        if (payload.eventType === 'UPDATE') setCustomers((p) => p.map((c) => c.id === (payload.new as Customer).id ? payload.new as Customer : c));
        if (payload.eventType === 'DELETE') setCustomers((p) => p.filter((c) => c.id !== (payload.old as Customer).id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, (payload) => {
        if (payload.eventType === 'INSERT') setSuppliers((p) => [payload.new as Supplier, ...p.filter((s) => s.id !== (payload.new as Supplier).id)]);
        if (payload.eventType === 'UPDATE') setSuppliers((p) => p.map((s) => s.id === (payload.new as Supplier).id ? payload.new as Supplier : s));
        if (payload.eventType === 'DELETE') setSuppliers((p) => p.filter((s) => s.id !== (payload.old as Supplier).id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') setProducts((p) => [payload.new as Product, ...p.filter((x) => x.id !== (payload.new as Product).id)]);
        if (payload.eventType === 'UPDATE') setProducts((p) => p.map((x) => x.id === (payload.new as Product).id ? payload.new as Product : x));
        if (payload.eventType === 'DELETE') setProducts((p) => p.filter((x) => x.id !== (payload.old as Product).id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_invoices' }, (payload) => {
        if (payload.eventType === 'INSERT') setInvoices((p) => [payload.new as SalesInvoice, ...p.filter((x) => x.id !== (payload.new as SalesInvoice).id)]);
        if (payload.eventType === 'UPDATE') setInvoices((p) => p.map((x) => x.id === (payload.new as SalesInvoice).id ? payload.new as SalesInvoice : x));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, (payload) => {
        if (payload.eventType === 'INSERT') setPurchases((p) => [payload.new as PurchaseOrder, ...p.filter((x) => x.id !== (payload.new as PurchaseOrder).id)]);
        if (payload.eventType === 'UPDATE') setPurchases((p) => p.map((x) => x.id === (payload.new as PurchaseOrder).id ? payload.new as PurchaseOrder : x));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
        if (payload.eventType === 'INSERT') setPayments((p) => [payload.new as Payment, ...p.filter((x) => x.id !== (payload.new as Payment).id)]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger_entries' }, (payload) => {
        if (payload.eventType === 'INSERT') setLedgerEntries((p) => [payload.new as LedgerEntry, ...p.filter((x) => x.id !== (payload.new as LedgerEntry).id)]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battery_warranties' }, (payload) => {
        if (payload.eventType === 'INSERT') setWarranties((p) => [payload.new as BatteryWarranty, ...p.filter((x) => x.id !== (payload.new as BatteryWarranty).id)]);
        if (payload.eventType === 'UPDATE') setWarranties((p) => p.map((x) => x.id === (payload.new as BatteryWarranty).id ? payload.new as BatteryWarranty : x));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, (payload) => {
        if (payload.eventType === 'INSERT') setReturns((p) => [payload.new as Return, ...p.filter((x) => x.id !== (payload.new as Return).id)]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') setLeads((p) => [payload.new as Lead, ...p.filter((x) => x.id !== (payload.new as Lead).id)]);
        if (payload.eventType === 'UPDATE') setLeads((p) => p.map((x) => x.id === (payload.new as Lead).id ? payload.new as Lead : x));
        if (payload.eventType === 'DELETE') setLeads((p) => p.filter((x) => x.id !== (payload.old as Lead).id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_activities' }, (payload) => {
        if (payload.eventType === 'INSERT') setActivities((p) => [payload.new as LeadActivity, ...p.filter((x) => x.id !== (payload.new as LeadActivity).id)]);
        if (payload.eventType === 'UPDATE') setActivities((p) => p.map((x) => x.id === (payload.new as LeadActivity).id ? payload.new as LeadActivity : x));
        if (payload.eventType === 'DELETE') setActivities((p) => p.filter((x) => x.id !== (payload.old as LeadActivity).id));
      })
      .subscribe();

    return () => {
      if (supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  // Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at' | 'uoi'> & { outstanding?: number }) => {
    const nextUoi = getNextCustomerUoi(customers);
    const initialOutstanding = Number(customerData.outstanding || 0);
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      uoi: nextUoi,
      outstanding: initialOutstanding,
      created_at: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    // If opening balance > 0, also create an opening balance ledger entry
    if (initialOutstanding > 0) {
      const openingEntry: LedgerEntry = {
        id: crypto.randomUUID(),
        party_id: newCustomer.id,
        party_name: newCustomer.name,
        party_uoi: newCustomer.uoi,
        party_gstin: newCustomer.gstin,
        party_type: 'customer',
        date: new Date().toISOString().split('T')[0],
        description: 'Opening Outstanding Balance',
        doc_number: 'OPENING-BAL',
        debit: initialOutstanding,
        credit: 0,
        balance: initialOutstanding,
        reference_type: 'opening',
        reference_id: newCustomer.id,
        created_at: new Date().toISOString(),
      };
      setLedgerEntries((prev) => [openingEntry, ...prev]);
      if (supabase) {
        supabase.from('ledger_entries').insert(openingEntry).then(({ error }) => {
          if (error) console.error('[Supabase] Ledger opening balance insert error:', error);
        });
      }
    }

    if (supabase) {
      supabase.from('customers').insert(newCustomer).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Customer insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Customer ${newCustomer.name} (${newCustomer.uoi}) added successfully!`);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (supabase) {
      supabase.from('customers').update(updates).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Customer update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success('Customer details updated');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'created_at' | 'uoi'> & { outstanding?: number }) => {
    const nextUoi = getNextSupplierUoi(suppliers);
    const initialOutstanding = Number(supplierData.outstanding || 0);
    const newSupplier: Supplier = {
      ...supplierData,
      id: crypto.randomUUID(),
      uoi: nextUoi,
      outstanding: initialOutstanding,
      created_at: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupplier, ...prev]);

    // If opening balance > 0, also create an opening balance ledger entry
    if (initialOutstanding > 0) {
      const openingEntry: LedgerEntry = {
        id: crypto.randomUUID(),
        party_id: newSupplier.id,
        party_name: newSupplier.name,
        party_uoi: newSupplier.uoi,
        party_gstin: newSupplier.gstin,
        party_type: 'supplier',
        date: new Date().toISOString().split('T')[0],
        description: 'Opening Outstanding Balance',
        doc_number: 'OPENING-BAL',
        debit: 0,
        credit: initialOutstanding,
        balance: -initialOutstanding,
        reference_type: 'opening',
        reference_id: newSupplier.id,
        created_at: new Date().toISOString(),
      };
      setLedgerEntries((prev) => [openingEntry, ...prev]);
      if (supabase) {
        supabase.from('ledger_entries').insert(openingEntry).then(({ error }) => {
          if (error) console.error('[Supabase] Ledger opening balance insert error:', error);
        });
      }
    }

    if (supabase) {
      supabase.from('suppliers').insert(newSupplier).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Supplier insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Supplier ${newSupplier.name} added successfully!`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    if (supabase) {
      supabase.from('suppliers').update(updates).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Supplier update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success('Supplier details updated');
  };

  const addProduct = (productData: Omit<Product, 'id' | 'created_at'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (supabase) {
      supabase.from('products').insert(newProduct).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Product insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Product ${newProduct.name} (${newProduct.sku}) added!`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (supabase) {
      supabase.from('products').update(updates).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Product update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success('Product updated');
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Sales Invoice
  const createSalesInvoice = (
    invoiceData: Omit<SalesInvoice, 'id' | 'created_at' | 'invoice_number' | 'outstanding'> & { initial_payment?: number }
  ): SalesInvoice => {
    const invNumber = getNextInvoiceNumber(invoices);
    const initialPay = invoiceData.initial_payment || 0;
    const outstanding = Math.max(0, invoiceData.grand_total - initialPay);
    const status = initialPay >= invoiceData.grand_total ? 'paid' : initialPay > 0 ? 'partial' : 'pending';

    const customer = customers.find((c) => c.id === invoiceData.customer_id);

    const newInvoice: SalesInvoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      invoice_number: invNumber,
      customer_uoi: customer?.uoi,
      customer_gstin: customer?.gstin,
      status,
      outstanding,
      created_at: invoiceData.date || new Date().toISOString().split('T')[0],
    };

    // 1. Add invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // 2. Stock decreases
    setProducts((prev) =>
      prev.map((prod) => {
        const item = invoiceData.items.find((i) => i.product_id === prod.id);
        if (item) {
          const newQty = Math.max(0, prod.stock - item.quantity);
          if (supabase) {
            supabase.from('products').update({ stock: newQty }).eq('id', prod.id).then();
          }
          return { ...prod, stock: newQty };
        }
        return prod;
      })
    );

    // 3. Customer Outstanding increases
    if (customer) {
      const newCustomerOutstanding = customer.outstanding + outstanding;
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, outstanding: newCustomerOutstanding } : c))
      );
      if (supabase) {
        supabase.from('customers').update({ outstanding: newCustomerOutstanding }).eq('id', customer.id).then();
      }
    }

    // 4. Ledger Entry (Debit)
    const newLedger: LedgerEntry = {
      id: crypto.randomUUID(),
      party_id: invoiceData.customer_id,
      party_name: invoiceData.customer_name,
      party_uoi: customer?.uoi,
      party_gstin: customer?.gstin,
      party_type: 'customer',
      date: invoiceData.date,
      description: `Sales Invoice ${invNumber}`,
      doc_number: invNumber,
      debit: invoiceData.grand_total,
      credit: 0,
      balance: (customer?.outstanding || 0) + outstanding,
      reference_type: 'invoice',
      reference_id: newInvoice.id,
      created_at: new Date().toISOString(),
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);
    if (supabase) {
      supabase.from('ledger_entries').insert(newLedger).then();
    }

    // 5. Handle initial payment if provided
    if (initialPay > 0) {
      const rctNum = getNextPaymentNumber(payments, 'in');
      const payRecord: Payment = {
        id: crypto.randomUUID(),
        receipt_number: rctNum,
        date: invoiceData.date,
        party_name: invoiceData.customer_name,
        party_id: invoiceData.customer_id,
        party_uoi: customer?.uoi,
        party_type: 'customer',
        payment_mode: 'bank',
        reference: `Advance/Instant for ${invNumber}`,
        amount: initialPay,
        direction: 'in',
        created_at: new Date().toISOString(),
      };
      setPayments((prev) => [payRecord, ...prev]);
      setBankBalance((prev) => prev + initialPay);

      const payLedger: LedgerEntry = {
        id: crypto.randomUUID(),
        party_id: invoiceData.customer_id,
        party_name: invoiceData.customer_name,
        party_uoi: customer?.uoi,
        party_gstin: customer?.gstin,
        party_type: 'customer',
        date: invoiceData.date,
        description: `Payment Received against ${invNumber}`,
        doc_number: rctNum,
        debit: 0,
        credit: initialPay,
        balance: (customer?.outstanding || 0) + outstanding,
        reference_type: 'payment',
        reference_id: payRecord.id,
        created_at: new Date().toISOString(),
      };
      setLedgerEntries((prev) => [payLedger, ...prev]);

      if (supabase) {
        supabase.from('payments').insert(payRecord).then();
        supabase.from('ledger_entries').insert(payLedger).then();
      }
    }

    // Sync Invoice to Supabase
    if (supabase) {
      // Remove virtual field initial_payment before saving to DB
      const { initial_payment, ...dbInvoice } = newInvoice as any;
      supabase.from('sales_invoices').insert({
        ...dbInvoice,
        items: dbInvoice.items,
      }).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Invoice insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Sales Invoice ${invNumber} generated! Modules updated.`);
    return newInvoice;
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Purchase Order
  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'created_at' | 'po_number' | 'outstanding'> & { initial_payment?: number }
  ): PurchaseOrder => {
    const poNumber = getNextPoNumber(purchases);
    const initialPay = poData.initial_payment || 0;
    const outstanding = Math.max(0, poData.grand_total - initialPay);

    const supplier = suppliers.find((s) => s.id === poData.supplier_id);

    const newPO: PurchaseOrder = {
      ...poData,
      id: crypto.randomUUID(),
      po_number: poNumber,
      supplier_gstin: supplier?.gstin,
      total: poData.grand_total,
      outstanding,
      created_at: poData.date || new Date().toISOString().split('T')[0],
    };

    // 1. Add PO
    setPurchases((prev) => [newPO, ...prev]);

    // 2. Stock increases
    setProducts((prev) =>
      prev.map((prod) => {
        const item = poData.items.find((i) => i.product_id === prod.id);
        if (item) {
          const newStock = prod.stock + item.quantity;
          if (supabase) {
            supabase.from('products').update({ stock: newStock }).eq('id', prod.id).then();
          }
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    // 3. Supplier Payable/Outstanding increases
    if (supplier) {
      const newSupplierOutstanding = supplier.outstanding + outstanding;
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplier.id ? { ...s, outstanding: newSupplierOutstanding } : s))
      );
      if (supabase) {
        supabase.from('suppliers').update({ outstanding: newSupplierOutstanding }).eq('id', supplier.id).then();
      }
    }

    // 4. Ledger Entry (Credit)
    const newLedger: LedgerEntry = {
      id: crypto.randomUUID(),
      party_id: poData.supplier_id,
      party_name: poData.supplier_name,
      party_uoi: supplier?.uoi,
      party_gstin: supplier?.gstin,
      party_type: 'supplier',
      date: poData.date,
      description: `Purchase Order ${poNumber}`,
      doc_number: poNumber,
      debit: 0,
      credit: poData.grand_total,
      balance: (supplier?.outstanding || 0) + outstanding,
      reference_type: 'purchase',
      reference_id: newPO.id,
      created_at: new Date().toISOString(),
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);
    if (supabase) {
      supabase.from('ledger_entries').insert(newLedger).then();
    }

    // Sync PO to Supabase
    if (supabase) {
      // Remove virtual field initial_payment before saving to DB
      const { initial_payment, ...dbPO } = newPO as any;
      supabase.from('purchase_orders').insert({
        ...dbPO,
        items: dbPO.items,
      }).then(({ error }) => {
        if (error) {
          console.error('[Supabase] PO insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Purchase Order ${poNumber} logged! Stock & Supplier balances updated.`);
    return newPO;
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Payment Received
  const createPaymentIn = (paymentData: Omit<Payment, 'id' | 'created_at' | 'receipt_number' | 'direction'>) => {
    const rctNum = getNextPaymentNumber(payments, 'in');
    const customer = customers.find((c) => c.id === paymentData.party_id);

    const newPayment: Payment = {
      ...paymentData,
      id: crypto.randomUUID(),
      receipt_number: rctNum,
      party_uoi: customer?.uoi,
      direction: 'in',
      created_at: paymentData.date || new Date().toISOString().split('T')[0],
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Customer Outstanding decreases
    if (customer) {
      const newOutstanding = Math.max(0, customer.outstanding - paymentData.amount);
      setCustomers((prev) =>
        prev.map((c) => (c.id === paymentData.party_id ? { ...c, outstanding: newOutstanding } : c))
      );
      if (supabase) {
        supabase.from('customers').update({ outstanding: newOutstanding }).eq('id', customer.id).then();
      }
    }

    // Cash/Bank increases
    if (paymentData.payment_mode === 'cash') {
      setCashBalance((prev) => prev + paymentData.amount);
    } else {
      setBankBalance((prev) => prev + paymentData.amount);
    }

    // Ledger entry
    const newLedger: LedgerEntry = {
      id: crypto.randomUUID(),
      party_id: paymentData.party_id,
      party_name: paymentData.party_name,
      party_uoi: customer?.uoi,
      party_gstin: customer?.gstin,
      party_type: 'customer',
      date: paymentData.date,
      description: `Payment Received (${paymentData.payment_mode.toUpperCase()} - ${paymentData.reference})`,
      doc_number: rctNum,
      debit: 0,
      credit: paymentData.amount,
      balance: Math.max(0, (customer?.outstanding || 0) - paymentData.amount),
      reference_type: 'payment',
      reference_id: newPayment.id,
      created_at: new Date().toISOString(),
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    if (supabase) {
      supabase.from('payments').insert(newPayment).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Payment insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
      supabase.from('ledger_entries').insert(newLedger).then();
    }
    toast.success(`Payment In ₹${paymentData.amount.toLocaleString('en-IN')} recorded. Customer outstanding reduced!`);
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Payment Made
  const createPaymentOut = (paymentData: Omit<Payment, 'id' | 'created_at' | 'receipt_number' | 'direction'>) => {
    const vouchNum = getNextPaymentNumber(payments, 'out');
    const supplier = suppliers.find((s) => s.id === paymentData.party_id);

    const newPayment: Payment = {
      ...paymentData,
      id: crypto.randomUUID(),
      receipt_number: vouchNum,
      direction: 'out',
      created_at: paymentData.date || new Date().toISOString().split('T')[0],
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Supplier Outstanding decreases
    if (supplier) {
      const newOutstanding = Math.max(0, supplier.outstanding - paymentData.amount);
      setSuppliers((prev) =>
        prev.map((s) => (s.id === paymentData.party_id ? { ...s, outstanding: newOutstanding } : s))
      );
      if (supabase) {
        supabase.from('suppliers').update({ outstanding: newOutstanding }).eq('id', supplier.id).then();
      }
    }

    // Cash/Bank decreases
    if (paymentData.payment_mode === 'cash') {
      setCashBalance((prev) => Math.max(0, prev - paymentData.amount));
    } else {
      setBankBalance((prev) => Math.max(0, prev - paymentData.amount));
    }

    // Ledger entry
    const newLedger: LedgerEntry = {
      id: crypto.randomUUID(),
      party_id: paymentData.party_id,
      party_name: paymentData.party_name,
      party_uoi: supplier?.uoi,
      party_gstin: supplier?.gstin,
      party_type: 'supplier',
      date: paymentData.date,
      description: `Payment Made (${paymentData.payment_mode.toUpperCase()} - ${paymentData.reference})`,
      doc_number: vouchNum,
      debit: paymentData.amount,
      credit: 0,
      balance: Math.max(0, (supplier?.outstanding || 0) - paymentData.amount),
      reference_type: 'payment',
      reference_id: newPayment.id,
      created_at: new Date().toISOString(),
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    if (supabase) {
      supabase.from('payments').insert(newPayment).then(({ error }) => {
        if (error) {
          console.error('[Supabase] PaymentOut insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
      supabase.from('ledger_entries').insert(newLedger).then();
    }
    toast.success(`Payment Out ₹${paymentData.amount.toLocaleString('en-IN')} logged. Supplier payable updated!`);
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Returns
  const createReturn = (retData: Omit<Return, 'id' | 'created_at' | 'note_number'>) => {
    const noteNum = getNextReturnNumber(returns, retData.type);

    const newReturn: Return = {
      ...retData,
      id: crypto.randomUUID(),
      note_number: noteNum,
      created_at: retData.date || new Date().toISOString().split('T')[0],
    };

    setReturns((prev) => [newReturn, ...prev]);

    // Stock & Ledger adjustments
    if (retData.type === 'credit') {
      setCustomers((prev) =>
        prev.map((c) => (c.name === retData.party_name ? { ...c, outstanding: Math.max(0, c.outstanding - retData.amount) } : c))
      );
      setProducts((prev) =>
        prev.map((p) => {
          const item = retData.items.find((i) => i.product_id === p.id);
          return item ? { ...p, stock: p.stock + item.quantity } : p;
        })
      );
    } else {
      setSuppliers((prev) =>
        prev.map((s) => (s.name === retData.party_name ? { ...s, outstanding: Math.max(0, s.outstanding - retData.amount) } : s))
      );
      setProducts((prev) =>
        prev.map((p) => {
          const item = retData.items.find((i) => i.product_id === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
        })
      );
    }

    if (supabase) {
      supabase.from('returns').insert({
        ...newReturn,
        items: newReturn.items,
      }).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Return insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }

    toast.success(`${retData.type.toUpperCase()} Note ${noteNum} created! Inventory & Balances updated.`);
  };

  const registerWarranty = (warrantyData: Omit<BatteryWarranty, 'id' | 'created_at' | 'warranty_id'>) => {
    const warrantyId = getNextWarrantyId(warranties);
    const customer = customers.find((c) => c.id === warrantyData.customer_id);

    const newWarranty: BatteryWarranty = {
      ...warrantyData,
      id: crypto.randomUUID(),
      warranty_id: warrantyId,
      customer_uoi: customer?.uoi,
      created_at: new Date().toISOString().split('T')[0],
    };

    setWarranties((prev) => [newWarranty, ...prev]);

    if (supabase) {
      supabase.from('battery_warranties').insert(newWarranty).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Warranty insert error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Battery Warranty ${warrantyId} registered for ${warrantyData.serial_number}`);
  };

  const updateWarrantyStatus = (id: string, status: BatteryWarranty['status']) => {
    setWarranties((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    if (supabase) {
      supabase.from('battery_warranties').update({ status }).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Warranty update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success(`Warranty status updated to ${status.toUpperCase()}`);
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (supabase) {
      // Remove local-only env fields before saving to Supabase
      const { supabase_url, supabase_anon_key, ...dbSettings } = newSettings;
      
      supabase.from('company_settings').upsert({
        id: settings.id || '00000000-0000-0000-0000-000000000001',
        ...dbSettings,
      }).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Settings update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success('Company & Battery Settings updated');
  };

  // ── Lead Management Handlers ──────────────────────────────────────────────
  // ── HRMS Actions ──────────────────────────────────────────────────────────
  const addHrmsEmployee = async (emp: Omit<HrmsEmployee, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('hrms_employees').insert([emp]).select().single();
    if (error) { toast.error(`Failed to add employee: ${error.message}`); return null; }
    setHrmsEmployees(prev => [data, ...prev]);
    toast.success('Employee added');
    return data;
  };

  const updateHrmsEmployee = async (id: string, updates: Partial<HrmsEmployee>) => {
    const { data, error } = await supabase.from('hrms_employees').update(updates).eq('id', id).select().single();
    if (error) { toast.error(`Failed to update employee: ${error.message}`); return null; }
    setHrmsEmployees(prev => prev.map(e => e.id === id ? data : e));
    toast.success('Employee updated');
    return data;
  };

  const markAttendance = async (att: Omit<HrmsAttendance, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('hrms_attendance').upsert([att], { onConflict: 'employee_id,date' }).select('*, employee:hrms_employees(*)').single();
    if (error) { toast.error(`Failed to mark attendance: ${error.message}`); return; }
    
    // Update local state: replace if exists, otherwise prepend
    setHrmsAttendance(prev => {
      const exists = prev.findIndex(a => a.employee_id === att.employee_id && a.date === att.date);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = data;
        return next;
      }
      return [data, ...prev];
    });
    toast.success('Attendance marked successfully');
  };

  const applyLeave = async (leave: Omit<HrmsLeave, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('hrms_leaves').insert([leave]).select('*, employee:hrms_employees(*)').single();
    if (error) { toast.error('Failed to apply leave'); return; }
    setHrmsLeaves(prev => [data, ...prev]);
    toast.success('Leave applied successfully');
  };

  const updateLeaveStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from('hrms_leaves').update({ status }).eq('id', id).select('*, employee:hrms_employees(*)').single();
    if (error) { toast.error('Failed to update leave'); return; }
    setHrmsLeaves(prev => prev.map(l => l.id === id ? data : l));
    toast.success(`Leave ${status}`);
  };

  const processPayroll = async (payroll: Omit<HrmsPayroll, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('hrms_payroll').insert([payroll]).select('*, employee:hrms_employees(*)').single();
    if (error) { toast.error('Failed to process payroll'); return; }
    setHrmsPayroll(prev => [data, ...prev]);
    toast.success('Payroll processed successfully');
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [newLead, ...prev]);

    // Add initial activity
    const initActivity: LeadActivity = {
      id: crypto.randomUUID(),
      lead_id: newLead.id,
      type: 'Note',
      description: `Lead created via ${newLead.source || 'Direct'}. Initial requirement: ${newLead.requirement || 'Not specified'}`,
      created_at: new Date().toISOString(),
      created_by: newLead.assigned_to || 'Admin',
    };
    setActivities((prev) => [initActivity, ...prev]);

    if (supabase) {
      supabase.from('leads').insert(newLead).then(({ error }) => {
        if (error) console.error('[Supabase] Lead insert error:', error);
      });
      supabase.from('lead_activities').insert(initActivity).then(({ error }) => {
        if (error) console.error('[Supabase] Lead activity insert error:', error);
      });
    }

    toast.success(`Lead for "${newLead.name || newLead.company_name}" added successfully!`);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>, silent = false) => {
    const updatedLeadPayload = { ...updates, updated_at: new Date().toISOString().split('T')[0] };
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedLeadPayload } : l))
    );

    if (supabase) {
      supabase.from('leads').update(updatedLeadPayload).eq('id', id).then(({ error }) => {
        if (error) console.error('[Supabase] Lead update error:', error);
      });
    }

    if (!silent) {
      toast.success('Lead updated successfully');
    }
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setActivities((prev) => prev.filter((a) => a.lead_id !== id));

    if (supabase) {
      supabase.from('leads').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('[Supabase] Lead delete error:', error);
      });
    }

    toast.success('Lead removed');
  };

  const addActivity = (actData: Omit<LeadActivity, 'id' | 'created_at'>): LeadActivity => {
    const newActivity: LeadActivity = {
      ...actData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);

    if (supabase) {
      supabase.from('lead_activities').insert(newActivity).then(({ error }) => {
        if (error) console.error('[Supabase] Activity insert error:', error);
      });
    }

    toast.success(`${actData.type} activity logged`);
    return newActivity;
  };

  const convertLeadToParty = (
    leadId: string,
    partyData: {
      name: string;
      contact: string;
      email: string;
      address: string;
      type: CustomerType;
      gstin?: string;
      linkExistingId?: string;
    }
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) {
      toast.error('Lead not found');
      return;
    }

    let linkedCustomerId = partyData.linkExistingId;
    let customerName = partyData.name;

    if (!linkedCustomerId) {
      // Create new customer party
      const nextUoi = getNextCustomerUoi(customers);
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        uoi: nextUoi,
        name: partyData.name,
        contact: partyData.contact,
        email: partyData.email,
        address: partyData.address || 'Address not provided',
        type: partyData.type,
        gstin: partyData.gstin || '',
        credit_limit: 500000,
        outstanding: 0,
        salesperson: targetLead.assigned_to || 'Deepak Singh',
        created_at: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      linkedCustomerId = newCustomer.id;
      customerName = `${newCustomer.name} (${newCustomer.uoi})`;

      if (supabase) {
        supabase.from('customers').insert(newCustomer).then(({ error }) => {
          if (error) console.error('[Supabase] Customer convert insert error:', error);
        });
      }
    } else {
      const existing = customers.find((c) => c.id === linkedCustomerId);
      if (existing) customerName = `${existing.name} (${existing.uoi})`;
    }

    // Update lead status to Won and record party_id
    const updatedLeadPayload = {
      stage: 'Won' as const,
      party_id: linkedCustomerId,
      updated_at: new Date().toISOString().split('T')[0],
    };

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...updatedLeadPayload } : l))
    );

    // Log activity
    const convActivity: LeadActivity = {
      id: crypto.randomUUID(),
      lead_id: leadId,
      type: 'Note',
      description: `Converted to Party: ${customerName}`,
      created_at: new Date().toISOString(),
      created_by: targetLead.assigned_to || 'Admin',
    };
    setActivities((prev) => [convActivity, ...prev]);

    if (supabase) {
      supabase.from('leads').update(updatedLeadPayload).eq('id', leadId).then(({ error }) => {
        if (error) console.error('[Supabase] Lead convert update error:', error);
      });
      supabase.from('lead_activities').insert(convActivity).then(({ error }) => {
        if (error) console.error('[Supabase] Lead convert activity insert error:', error);
      });
    }

    toast.success('Lead converted successfully.');
  };

  
  return (
    <DataContext.Provider
      value={{
        customers,
        suppliers,
        products,
        invoices,
        purchases,
        returns,
        warranties,
        payments,
        ledgerEntries,
        settings,
        leads,
        activities,
        hrmsEmployees,
        hrmsAttendance,
        hrmsLeaves,
        hrmsPayroll,
        cashBalance,
        bankBalance,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        addProduct,
        updateProduct,
        createSalesInvoice,
        createPurchaseOrder,
        createPaymentIn,
        createPaymentOut,
        createReturn,
        registerWarranty,
        updateWarrantyStatus,
        updateSettings,
        addLead,
        updateLead,
        deleteLead,
        addActivity,
        convertLeadToParty,
        addHrmsEmployee,
        updateHrmsEmployee,
        markAttendance,
        applyLeave,
        updateLeaveStatus,
        processPayroll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
