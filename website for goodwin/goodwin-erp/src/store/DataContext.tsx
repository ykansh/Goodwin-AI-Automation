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
    const local = localStorage.getItem('goodwin_customers');
    return local ? JSON.parse(local) : dummyCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const local = localStorage.getItem('goodwin_suppliers');
    return local ? JSON.parse(local) : dummySuppliers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('goodwin_products');
    return local ? JSON.parse(local) : dummyProducts;
  });

  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => {
    const local = localStorage.getItem('goodwin_invoices');
    return local ? JSON.parse(local) : dummySalesInvoices;
  });

  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => {
    const local = localStorage.getItem('goodwin_purchases');
    return local ? JSON.parse(local) : dummyPurchaseOrders;
  });

  const [returns, setReturns] = useState<Return[]>(() => {
    const local = localStorage.getItem('goodwin_returns');
    return local ? JSON.parse(local) : dummyReturns;
  });

  const [warranties, setWarranties] = useState<BatteryWarranty[]>(() => {
    const local = localStorage.getItem('goodwin_warranties');
    return local ? JSON.parse(local) : dummyBatteryWarranties;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const local = localStorage.getItem('goodwin_payments');
    return local ? JSON.parse(local) : dummyPayments;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    const local = localStorage.getItem('goodwin_ledger');
    return local ? JSON.parse(local) : dummyLedgerEntries;
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    const local = localStorage.getItem('goodwin_settings');
    return local ? JSON.parse(local) : dummyCompanySettings;
  });

  const [cashBalance, setCashBalance] = useState<number>(145000);
  const [bankBalance, setBankBalance] = useState<number>(1850000);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('goodwin_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('goodwin_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('goodwin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('goodwin_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('goodwin_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('goodwin_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('goodwin_warranties', JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    localStorage.setItem('goodwin_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('goodwin_ledger', JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  useEffect(() => {
    localStorage.setItem('goodwin_settings', JSON.stringify(settings));
  }, [settings]);

  // ── Supabase: Fetch cloud data on mount ─────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

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

      if (custRes.data && custRes.data.length > 0) setCustomers(custRes.data as Customer[]);
      if (suppRes.data && suppRes.data.length > 0) setSuppliers(suppRes.data as Supplier[]);
      if (prodRes.data && prodRes.data.length > 0) setProducts(prodRes.data as Product[]);
      if (invRes.data  && invRes.data.length > 0)  setInvoices(invRes.data as SalesInvoice[]);
      if (poRes.data   && poRes.data.length > 0)   setPurchases(poRes.data as PurchaseOrder[]);
      if (retRes.data  && retRes.data.length > 0)  setReturns(retRes.data as Return[]);
      if (warRes.data  && warRes.data.length > 0)  setWarranties(warRes.data as BatteryWarranty[]);
      if (payRes.data  && payRes.data.length > 0)  setPayments(payRes.data as Payment[]);
      if (ledRes.data  && ledRes.data.length > 0)  setLedgerEntries(ledRes.data as LedgerEntry[]);
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales_invoices' }, (payload) => {
        setInvoices((p) => [payload.new as SalesInvoice, ...p.filter((x) => x.id !== (payload.new as SalesInvoice).id)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'purchase_orders' }, (payload) => {
        setPurchases((p) => [payload.new as PurchaseOrder, ...p.filter((x) => x.id !== (payload.new as PurchaseOrder).id)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, (payload) => {
        setPayments((p) => [payload.new as Payment, ...p.filter((x) => x.id !== (payload.new as Payment).id)]);
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
    const nextNum = customers.length + 1001;
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      uoi: `GW-CUST-${nextNum}`,
      outstanding: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    // ── Sync to Supabase ────────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').insert(newCustomer).then(({ error }) => {
        if (error) console.warn('[Supabase] Customer insert error:', error.message);
      });
    }
    toast.success(`Customer ${newCustomer.name} (${newCustomer.uoi}) added successfully!`);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    // ── Sync to Supabase ────────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase] Customer update error:', error.message);
      });
    }
    toast.success('Customer details updated');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'created_at' | 'outstanding' | 'uoi'>) => {
    const nextNum = suppliers.length + 1;
    const newSupplier: Supplier = {
      ...supplierData,
      id: crypto.randomUUID(),
      uoi: `GW-SUPP-${String(nextNum).padStart(4, '0')}`,
      outstanding: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    // ── Sync to Supabase ────────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('suppliers').insert(newSupplier).then(({ error }) => {
        if (error) console.warn('[Supabase] Supplier insert error:', error.message);
      });
    }
    toast.success(`Supplier ${newSupplier.name} added successfully!`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    // ── Sync to Supabase ────────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('suppliers').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase] Supplier update error:', error.message);
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
    // ── Sync to Supabase ────────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').insert(newProduct).then(({ error }) => {
        if (error) console.warn('[Supabase] Product insert error:', error.message);
      });
    }
    toast.success(`Product ${newProduct.name} (${newProduct.sku}) added!`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    // ── Sync to Supabase ────────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase] Product update error:', error.message);
      });
    }
    toast.success('Product updated');
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Sales Invoice
  // Sales Invoice → Stock decreases → Customer Ledger updates → Sales increases → Outstanding increases
  const createSalesInvoice = (
    invoiceData: Omit<SalesInvoice, 'id' | 'created_at' | 'invoice_number' | 'outstanding'> & { initial_payment?: number }
  ): SalesInvoice => {
    const invCount = invoices.length + 1;
    const invNumber = `GW-INV-2026-${String(invCount).padStart(4, '0')}`;
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
          return { ...prod, stock: newQty };
        }
        return prod;
      })
    );

    // 3. Customer Outstanding increases
    if (customer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, outstanding: c.outstanding + outstanding } : c))
      );
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

    // 5. Handle initial payment if provided
    if (initialPay > 0) {
      const rctNum = `GW-RCT-2026-${String(payments.length + 1).padStart(4, '0')}`;
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
    }

    // ── Sync Invoice to Supabase ────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('sales_invoices').insert({
        ...newInvoice,
        items: JSON.stringify(newInvoice.items),
      }).then(({ error }) => {
        if (error) console.warn('[Supabase] Invoice insert error:', error.message);
      });
    }
    toast.success(`Sales Invoice ${invNumber} generated! Modules updated.`);
    return newInvoice;
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Purchase Order
  // Purchase Invoice → Stock increases → Supplier Ledger updates → Payable increases
  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'created_at' | 'po_number' | 'outstanding'> & { initial_payment?: number }
  ): PurchaseOrder => {
    const poCount = purchases.length + 1;
    const poNumber = `GW-PO-2026-${String(poCount).padStart(4, '0')}`;
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
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      })
    );

    // 3. Supplier Payable/Outstanding increases
    if (supplier) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplier.id ? { ...s, outstanding: s.outstanding + outstanding } : s))
      );
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

    // ── Sync PO to Supabase ─────────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('purchase_orders').insert({
        ...newPO,
        items: JSON.stringify(newPO.items),
      }).then(({ error }) => {
        if (error) console.warn('[Supabase] PO insert error:', error.message);
      });
    }
    toast.success(`Purchase Order ${poNumber} logged! Stock & Supplier balances updated.`);
    return newPO;
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Payment Received
  // Payment Received → Customer Outstanding decreases → Cash/Bank increases
  const createPaymentIn = (paymentData: Omit<Payment, 'id' | 'created_at' | 'receipt_number' | 'direction'>) => {
    const rctNum = `GW-RCT-2026-${String(payments.length + 1).padStart(4, '0')}`;
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
    setCustomers((prev) =>
      prev.map((c) => (c.id === paymentData.party_id ? { ...c, outstanding: Math.max(0, c.outstanding - paymentData.amount) } : c))
    );

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
    // ── Sync Payment to Supabase ────────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('payments').insert(newPayment).then(({ error }) => {
        if (error) console.warn('[Supabase] Payment insert error:', error.message);
      });
    }
    toast.success(`Payment In ₹${paymentData.amount.toLocaleString('en-IN')} recorded. Customer outstanding reduced!`);
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Payment Made
  // Payment Made → Supplier Outstanding decreases → Cash/Bank decreases
  const createPaymentOut = (paymentData: Omit<Payment, 'id' | 'created_at' | 'receipt_number' | 'direction'>) => {
    const vouchNum = `GW-VOUCH-2026-${String(payments.length + 1).padStart(4, '0')}`;
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
    setSuppliers((prev) =>
      prev.map((s) => (s.id === paymentData.party_id ? { ...s, outstanding: Math.max(0, s.outstanding - paymentData.amount) } : s))
    );

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
    // ── Sync Payment Out to Supabase ────────────────────────────────────────
    if (isSupabaseConfigured && supabase) {
      supabase.from('payments').insert(newPayment).then(({ error }) => {
        if (error) console.warn('[Supabase] PaymentOut insert error:', error.message);
      });
    }
    toast.success(`Payment Out ₹${paymentData.amount.toLocaleString('en-IN')} logged. Supplier payable updated!`);
  };

  // AUTOMATIC CONNECTED SYSTEM UPDATES: Returns
  const createReturn = (retData: Omit<Return, 'id' | 'created_at' | 'note_number'>) => {
    const count = returns.length + 1;
    const noteNum = retData.type === 'credit' ? `GW-CN-2026-${String(count).padStart(3, '0')}` : `GW-DN-2026-${String(count).padStart(3, '0')}`;

    const newReturn: Return = {
      ...retData,
      id: crypto.randomUUID(),
      note_number: noteNum,
      created_at: retData.date || new Date().toISOString().split('T')[0],
    };

    setReturns((prev) => [newReturn, ...prev]);

    // Stock & Ledger adjustments
    if (retData.type === 'credit') { // Sales Return
      // Customer balance decreases, Stock increases
      setCustomers((prev) =>
        prev.map((c) => (c.name === retData.party_name ? { ...c, outstanding: Math.max(0, c.outstanding - retData.amount) } : c))
      );
      setProducts((prev) =>
        prev.map((p) => {
          const item = retData.items.find((i) => i.product_id === p.id);
          return item ? { ...p, stock: p.stock + item.quantity } : p;
        })
      );
    } else { // Purchase Return
      // Supplier balance decreases, Stock decreases
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

    toast.success(`${retData.type.toUpperCase()} Note ${noteNum} created! Inventory & Balances updated.`);
  };

  const registerWarranty = (warrantyData: Omit<BatteryWarranty, 'id' | 'created_at' | 'warranty_id'>) => {
    const wCount = warranties.length + 1001;
    const warrantyId = `GW-BW-${wCount}`;
    const customer = customers.find((c) => c.id === warrantyData.customer_id);

    const newWarranty: BatteryWarranty = {
      ...warrantyData,
      id: crypto.randomUUID(),
      warranty_id: warrantyId,
      customer_uoi: customer?.uoi,
      created_at: new Date().toISOString().split('T')[0],
    };

    setWarranties((prev) => [newWarranty, ...prev]);
    toast.success(`Battery Warranty ${warrantyId} registered for ${warrantyData.serial_number}`);
  };

  const updateWarrantyStatus = (id: string, status: BatteryWarranty['status']) => {
    setWarranties((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    toast.success(`Warranty status updated to ${status.toUpperCase()}`);
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
