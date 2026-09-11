import { create } from 'zustand';
import { supabase } from './supabase';

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  projectId?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  description: string;
  amount: number;
  date: string;
  due: string;
  paid?: string;
  status: 'paid' | 'unpaid' | 'overdue';
  mode?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
}

export interface Receivable {
  id: string;
  client: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface Payable {
  id: string;
  vendor: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface FinanceState {
  isLoading: boolean;
  error: string | null;
  expenses: Expense[];
  invoices: Invoice[];
  transactions: Transaction[];
  receivables: Receivable[];
  payables: Payable[];
  
  fetchFinanceData: () => Promise<void>;
  addInvoice: (inv: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addTransaction: (txn: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, txn: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addReceivable: (rec: Omit<Receivable, 'id'>) => Promise<void>;
  updateReceivable: (id: string, rec: Partial<Receivable>) => Promise<void>;
  deleteReceivable: (id: string) => Promise<void>;
  updateReceivableStatus: (id: string, status: string) => Promise<void>;

  addPayable: (pay: Omit<Payable, 'id'>) => Promise<void>;
  updatePayable: (id: string, pay: Partial<Payable>) => Promise<void>;
  deletePayable: (id: string) => Promise<void>;
  updatePayableStatus: (id: string, status: string) => Promise<void>;
  
  setExpenses: (updater: (prev: Expense[]) => Expense[]) => void;
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void;
  setReceivables: (updater: (prev: Receivable[]) => Receivable[]) => void;
  setPayables: (updater: (prev: Payable[]) => Payable[]) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  isLoading: false,
  error: null,
  expenses: [],
  invoices: [],
  transactions: [],
  receivables: [],
  payables: [],

  fetchFinanceData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [
        { data: expData, error: expError },
        { data: txnData, error: txnError },
        { data: recData, error: recError },
        { data: payData, error: payError },
        { data: invData, error: invError }
      ] = await Promise.all([
        supabase.from('expenses').select('*'),
        supabase.from('ledger').select('*'),
        supabase.from('receivables').select('*'),
        supabase.from('payables').select('*'),
        supabase.from('invoices').select('*')
      ]);

      if (expError && expError.code !== '42P01') throw expError;
      if (txnError && txnError.code !== '42P01') throw txnError;
      if (recError && recError.code !== '42P01') throw recError;
      if (payError && payError.code !== '42P01') throw payError;
      if (invError && invError.code !== '42P01') throw invError;

      set({
        expenses: (expData || []).map((e: any) => ({
          id: e.id, date: e.date, description: e.description, category: e.category, amount: e.amount, projectId: e.project_id
        })),
        invoices: (invData || []).map((i: any) => ({
          id: i.id, invoiceNo: i.invoice_number, client: i.client_name || 'Unknown', description: i.description, amount: i.amount, date: i.invoice_date, due: i.due_date, paid: i.paid_date, status: i.status, mode: i.payment_mode
        })),
        transactions: (txnData || []).map((t: any) => ({
          id: t.id, date: t.date, description: t.description, type: t.type, amount: t.amount
        })),
        receivables: (recData || []).map((r: any) => ({
          id: r.id, client: r.client, invoiceNumber: r.invoice_number, amount: r.amount, dueDate: r.due_date, status: r.status
        })),
        payables: (payData || []).map((p: any) => ({
          id: p.id, vendor: p.vendor, invoiceNumber: p.invoice_number, amount: p.amount, dueDate: p.due_date, status: p.status
        })),
        isLoading: false
      });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message, isLoading: false });
    }
  },

  addInvoice: async (inv) => {
    const { data, error } = await supabase.from('invoices').insert([{
      invoice_number: inv.invoiceNo, client_name: inv.client, description: inv.description, amount: inv.amount, invoice_date: inv.date, due_date: inv.due, paid_date: inv.paid, status: inv.status, payment_mode: inv.mode
    }]).select().single();
    if (error) throw error;
    set(state => ({ invoices: [...state.invoices, { ...inv, id: data.id }] }));
  },
  updateInvoice: async (id, inv) => {
    const dbUpdates: any = {};
    if (inv.invoiceNo !== undefined) dbUpdates.invoice_number = inv.invoiceNo;
    if (inv.client !== undefined) dbUpdates.client_name = inv.client;
    if (inv.description !== undefined) dbUpdates.description = inv.description;
    if (inv.amount !== undefined) dbUpdates.amount = inv.amount;
    if (inv.date !== undefined) dbUpdates.invoice_date = inv.date;
    if (inv.due !== undefined) dbUpdates.due_date = inv.due;
    if (inv.paid !== undefined) dbUpdates.paid_date = inv.paid;
    if (inv.status !== undefined) dbUpdates.status = inv.status;
    if (inv.mode !== undefined) dbUpdates.payment_mode = inv.mode;

    const { error } = await supabase.from('invoices').update(dbUpdates).eq('id', id);
    if (error) throw error;
    set(state => ({ invoices: state.invoices.map(i => i.id === id ? { ...i, ...inv } : i) }));
  },
  deleteInvoice: async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ invoices: state.invoices.filter(i => i.id !== id) }));
  },

  addExpense: async (exp) => {
    const { data, error } = await supabase.from('expenses').insert([{
      date: exp.date, description: exp.description, category: exp.category, amount: exp.amount, project_id: exp.projectId
    }]).select().single();
    if (error) throw error;
    set(state => ({ expenses: [...state.expenses, { ...exp, id: data.id }] }));
  },
  updateExpense: async (id, exp) => {
    const { error } = await supabase.from('expenses').update({
      date: exp.date, description: exp.description, category: exp.category, amount: exp.amount, project_id: exp.projectId
    }).eq('id', id);
    if (error) throw error;
    set(state => ({ expenses: state.expenses.map(e => e.id === id ? { ...e, ...exp } : e) }));
  },
  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
  },

  addTransaction: async (txn) => {
    const { data, error } = await supabase.from('ledger').insert([{
      date: txn.date,
      description: txn.description,
      type: txn.type,
      amount: txn.amount
    }]).select().single();
    if (error) throw error;
    set(state => ({ transactions: [...state.transactions, { ...txn, id: data.id }] }));
  },
  updateTransaction: async (id, txn) => {
    const dbUpdates: any = {};
    if (txn.date !== undefined) dbUpdates.date = txn.date;
    if (txn.description !== undefined) dbUpdates.description = txn.description;
    if (txn.type !== undefined) dbUpdates.type = txn.type;
    if (txn.amount !== undefined) dbUpdates.amount = txn.amount;

    const { error } = await supabase.from('ledger').update(dbUpdates).eq('id', id);
    if (error) throw error;
    set(state => ({ transactions: state.transactions.map(t => t.id === id ? { ...t, ...txn } : t) }));
  },
  deleteTransaction: async (id) => {
    const { error } = await supabase.from('ledger').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
  },

  addReceivable: async (rec) => {
    const { data, error } = await supabase.from('receivables').insert([{
      client: rec.client, invoice_number: rec.invoiceNumber, amount: rec.amount, due_date: rec.dueDate, status: rec.status
    }]).select().single();
    if (error) throw error;
    set(state => ({ receivables: [...state.receivables, { ...rec, id: data.id }] }));
  },
  updateReceivable: async (id, rec) => {
    const { error } = await supabase.from('receivables').update({
      client: rec.client, invoice_number: rec.invoiceNumber, amount: rec.amount, due_date: rec.dueDate, status: rec.status
    }).eq('id', id);
    if (error) throw error;
    set(state => ({ receivables: state.receivables.map(r => r.id === id ? { ...r, ...rec } : r) }));
  },
  deleteReceivable: async (id) => {
    const { error } = await supabase.from('receivables').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ receivables: state.receivables.filter(r => r.id !== id) }));
  },

  addPayable: async (pay) => {
    const { data, error } = await supabase.from('payables').insert([{
      vendor: pay.vendor, invoice_number: pay.invoiceNumber, amount: pay.amount, due_date: pay.dueDate, status: pay.status
    }]).select().single();
    if (error) throw error;
    set(state => ({ payables: [...state.payables, { ...pay, id: data.id }] }));
  },
  updatePayable: async (id, pay) => {
    const { error } = await supabase.from('payables').update({
      vendor: pay.vendor, invoice_number: pay.invoiceNumber, amount: pay.amount, due_date: pay.dueDate, status: pay.status
    }).eq('id', id);
    if (error) throw error;
    set(state => ({ payables: state.payables.map(p => p.id === id ? { ...p, ...pay } : p) }));
  },
  deletePayable: async (id) => {
    const { error } = await supabase.from('payables').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ payables: state.payables.filter(p => p.id !== id) }));
  },

  updateReceivableStatus: async (id, status) => {
    const { error } = await supabase.from('receivables').update({ status }).eq('id', id);
    if (error) throw error;
    set(state => ({
      receivables: state.receivables.map(r => r.id === id ? { ...r, status: status as any } : r)
    }));
  },

  updatePayableStatus: async (id, status) => {
    const { error } = await supabase.from('payables').update({ status }).eq('id', id);
    if (error) throw error;
    set(state => ({
      payables: state.payables.map(p => p.id === id ? { ...p, status: status as any } : p)
    }));
  },

  setExpenses: (updater) => set(state => ({ expenses: updater(state.expenses) })),
  setTransactions: (updater) => set(state => ({ transactions: updater(state.transactions) })),
  setReceivables: (updater) => set(state => ({ receivables: updater(state.receivables) })),
  setPayables: (updater) => set(state => ({ payables: updater(state.payables) }))
}));
