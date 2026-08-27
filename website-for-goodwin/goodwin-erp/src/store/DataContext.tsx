import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  Customer, Supplier, Product, SalesInvoice, PurchaseOrder,
  Return, BatteryWarranty, Payment, LedgerEntry, CompanySettings,
} from '../types';
import {
  dummyCustomers, dummySuppliers, dummyProducts, dummySalesInvoices,
  dummyPurchaseOrders, dummyReturns, dummyBatteryWarranties, dummyPayments,
  dummyLedgerEntries, dummyCompanySettings,
} from '../data/dummyData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
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

  // Financial Stats
  cashBalance: number;
  bankBalance: number;

  // Actions with connected auto-updates
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'outstanding' | 'uoi'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'outstanding' | 'uoi'>) => void;
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
  resetToDummyData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_customers');
    return local ? JSON.parse(local) : dummyCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_suppliers');
    return local ? JSON.parse(local) : dummySuppliers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_products');
    return local ? JSON.parse(local) : dummyProducts;
  });

  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_invoices');
    return local ? JSON.parse(local) : dummySalesInvoices;
  });

  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_purchases');
    return local ? JSON.parse(local) : dummyPurchaseOrders;
  });

  const [returns, setReturns] = useState<Return[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_returns');
    return local ? JSON.parse(local) : dummyReturns;
  });

  const [warranties, setWarranties] = useState<BatteryWarranty[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_warranties');
    return local ? JSON.parse(local) : dummyBatteryWarranties;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_payments');
    return local ? JSON.parse(local) : dummyPayments;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    if (isSupabaseConfigured) return [];
    const local = localStorage.getItem('goodwin_ledger');
    return local ? JSON.parse(local) : dummyLedgerEntries;
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    if (isSupabaseConfigured) return dummyCompanySettings;
    const local = localStorage.getItem('goodwin_settings');
    return local ? JSON.parse(local) : dummyCompanySettings;
  });

  const [cashBalance, setCashBalance] = useState<number>(145000);
  const [bankBalance, setBankBalance] = useState<number>(1850000);

  // Sync to local storage only if Supabase is NOT configured
  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_warranties', JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_ledger', JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem('goodwin_settings', JSON.stringify(settings));
  }, [settings]);

  // ── Supabase: Fetch cloud data on mount ─────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Clean up local storage to ensure browser isn't storing old offline data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('goodwin_')) localStorage.removeItem(key);
    });

    const fetchAll = async () => {
      const sb = supabase!;
      const [custRes, suppRes, prodRes, invRes, poRes, retRes, warRes, payRes, ledRes] =
        await Promise.all([
          sb.from('customers').select('*').order('created_at', { ascending: false }),
          sb.from('suppliers').select('*').order('created_at', { ascending: false }),
          sb.from('products').select('*').order('created_at', { ascending: false }),
          sb.from('sales_invoices').select('*').order('created_at', { ascending: false }),
          sb.from('purchase_orders').select('*').order('created_at', { ascending: false }),
          sb.from('returns').select('*').order('created_at', { ascending: false }),
          sb.from('battery_warranties').select('*').order('created_at', { ascending: false }),
          sb.from('payments').select('*').order('created_at', { ascending: false }),
          sb.from('ledger_entries').select('*').order('created_at', { ascending: false }),
        ]);

      if (custRes.error) console.error('[Supabase] Customers load error:', custRes.error);
      if (custRes.data && custRes.data.length > 0) setCustomers(custRes.data as Customer[]);

      if (suppRes.error) console.error('[Supabase] Suppliers load error:', suppRes.error);
      if (suppRes.data && suppRes.data.length > 0) setSuppliers(suppRes.data as Supplier[]);

      if (prodRes.error) console.error('[Supabase] Products load error:', prodRes.error);
      if (prodRes.data && prodRes.data.length > 0) setProducts(prodRes.data as Product[]);

      if (invRes.error) console.error('[Supabase] Invoices load error:', invRes.error);
      if (invRes.data && invRes.data.length > 0) setInvoices(invRes.data as SalesInvoice[]);

      if (poRes.error) console.error('[Supabase] POs load error:', poRes.error);
      if (poRes.data && poRes.data.length > 0) setPurchases(poRes.data as PurchaseOrder[]);

      if (retRes.error) console.error('[Supabase] Returns load error:', retRes.error);
      if (retRes.data && retRes.data.length > 0) setReturns(retRes.data as Return[]);

      if (warRes.error) console.error('[Supabase] Warranties load error:', warRes.error);
      if (warRes.data && warRes.data.length > 0) setWarranties(warRes.data as BatteryWarranty[]);

      if (payRes.error) console.error('[Supabase] Payments load error:', payRes.error);
      if (payRes.data && payRes.data.length > 0) setPayments(payRes.data as Payment[]);

      if (ledRes.error) console.error('[Supabase] Ledger load error:', ledRes.error);
      if (ledRes.data && ledRes.data.length > 0) setLedgerEntries(ledRes.data as LedgerEntry[]);
    };

    fetchAll();
  }, []);

  // ── Supabase: Real-time subscriptions ──────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

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
      .subscribe();

    return () => {
      if (supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  // Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at' | 'outstanding' | 'uoi'>) => {
    const nextUoi = getNextCustomerUoi(customers);
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      uoi: nextUoi,
      outstanding: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').update(updates).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Customer update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success('Customer details updated');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'created_at' | 'outstanding' | 'uoi'>) => {
    const nextUoi = getNextSupplierUoi(suppliers);
    const newSupplier: Supplier = {
      ...supplierData,
      id: crypto.randomUUID(),
      uoi: nextUoi,
      outstanding: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupplier, ...prev]);

    if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
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
          if (isSupabaseConfigured && supabase) {
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
      if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
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

      if (isSupabaseConfigured && supabase) {
        supabase.from('payments').insert(payRecord).then();
        supabase.from('ledger_entries').insert(payLedger).then();
      }
    }

    // Sync Invoice to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('sales_invoices').insert({
        ...newInvoice,
        items: newInvoice.items,
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
          if (isSupabaseConfigured && supabase) {
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
      if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
      supabase.from('ledger_entries').insert(newLedger).then();
    }

    // Sync PO to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('purchase_orders').insert({
        ...newPO,
        items: newPO.items,
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
      if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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
      if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
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
    if (isSupabaseConfigured && supabase) {
      supabase.from('company_settings').upsert({
        id: settings.id || '00000000-0000-0000-0000-000000000001',
        ...newSettings,
      }).then(({ error }) => {
        if (error) {
          console.error('[Supabase] Settings update error:', error);
          toast.error(`Supabase Error: ${error.message}`);
        }
      });
    }
    toast.success('Company & Battery Settings updated');
  };

  const resetToDummyData = () => {
    setCustomers(dummyCustomers);
    setSuppliers(dummySuppliers);
    setProducts(dummyProducts);
    setInvoices(dummySalesInvoices);
    setPurchases(dummyPurchaseOrders);
    setReturns(dummyReturns);
    setWarranties(dummyBatteryWarranties);
    setPayments(dummyPayments);
    setLedgerEntries(dummyLedgerEntries);
    setSettings(dummyCompanySettings);
    localStorage.clear();
    toast.success('Reset system to default demo data');
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
        resetToDummyData,
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
