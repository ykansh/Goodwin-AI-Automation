'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MockItem,
  MockParty,
  MockInvoice,
  BusinessProfile,
  INITIAL_BUSINESS,
} from '@/lib/mockData';
import {
  COMPANIES,
  CompanyConfig,
  companyToBusinessProfile,
  fetchProductsFromSupabase,
  insertProductToSupabase,
  updateProductInSupabase,
  deleteProductInSupabase,
  fetchPartiesFromSupabase,
  insertCustomerToSupabase,
  updateCustomerInSupabase,
  deleteCustomerInSupabase,
  fetchInvoicesFromSupabase,
  insertInvoiceToSupabase,
  updateInvoiceInSupabase,
  deleteInvoiceInSupabase,
  fetchPaymentsFromSupabase,
  insertPaymentToSupabase,
  fetchCompanyFromSupabase,
  supabase,
} from '@/lib/supabase';
import {
  AppUserRecord,
  fetchAllUsers,
  createUserAccount,
  authenticateCredentials,
  toggleUserStatus,
  deleteUserAccount,
  SESSION_KEY,
} from '@/lib/authService';

export interface StockAdjustmentLog {
  id: string;
  itemId: string;
  itemName: string;
  previousStock: number;
  newStock: number;
  difference: number;
  reason: string;
  date: string;
}

export interface PaymentRecord {
  id: string;
  partyId: string;
  partyName: string;
  type: 'PAYMENT_IN' | 'PAYMENT_OUT';
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  referenceNumber: string;
  date: string;
  notes?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  balance: number;
  isDefault: boolean;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  date: string;
  paidFrom: string;
  notes?: string;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  designation?: string;
}

export const DEFAULT_ADMIN: AuthUser = {
  id: 'usr-admin-1',
  name: 'Ansh Chourasiya',
  email: 'admin@goodwinbatteries.com',
  phone: '+91 96855 79269',
  role: 'ADMIN',
  designation: 'Owner / Administrator',
};

export const DEFAULT_EMPLOYEE: AuthUser = {
  id: 'usr-emp-1',
  name: 'Rahul Sharma',
  email: 'employee@goodwinbatteries.com',
  phone: '+91 98260 55443',
  role: 'EMPLOYEE',
  designation: 'Sales & Billing Staff',
};

interface AppContextType {
  // Auth & RBAC
  currentUser: AuthUser;
  simulatedRole: UserRole | null;
  effectiveRole: UserRole;
  isAdmin: boolean;
  isEmployee: boolean;
  isTestMode: boolean;
  toggleTestMode: () => void;
  switchRole: (role: UserRole) => void;
  loginUser: (email: string, role: UserRole, name?: string) => void;
  logoutUser: () => void;

  // Real User Authentication & Staff Management
  systemUsers: AppUserRecord[];
  refreshSystemUsers: () => Promise<void>;
  createSystemUser: (params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    designation?: string;
  }) => Promise<{ success: boolean; user?: AppUserRecord; error?: string }>;
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  toggleSystemUserActive: (id: string, isActive: boolean) => Promise<void>;
  deleteSystemUser: (id: string) => Promise<void>;

  // Company Switcher & Config
  companies: CompanyConfig[];
  selectedCompany: CompanyConfig;
  selectCompany: (codeOrId: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Business Profile & Core Entities
  business: BusinessProfile;
  items: MockItem[];
  parties: MockParty[];
  invoices: MockInvoice[];
  stockLogs: StockAdjustmentLog[];
  payments: PaymentRecord[];
  bankAccounts: BankAccount[];
  expenses: ExpenseRecord[];
  cashInHand: number;

  // Actions
  addItem: (item: Omit<MockItem, 'id'>) => Promise<MockItem>;
  updateItem: (id: string, updated: Partial<MockItem>) => Promise<void>;
  adjustStock: (itemId: string, newStock: number, reason: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addParty: (party: Omit<MockParty, 'id'>) => Promise<MockParty>;
  updateParty: (id: string, updated: Partial<MockParty>) => Promise<void>;
  deleteParty: (id: string) => Promise<void>;
  addInvoice: (invoice: MockInvoice) => Promise<MockInvoice>;
  convertQuotationToInvoice: (
    quotationId: string,
    params?: {
      paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
      paymentMode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
      paidAmount?: number;
    }
  ) => Promise<MockInvoice | null>;
  deleteInvoice: (id: string) => Promise<void>;
  recordPayment: (payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  transferFunds: (from: string, to: string, amount: number, notes?: string) => void;
  updateBusiness: (updated: Partial<BusinessProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Authentication & RBAC State
  const [currentUser, setCurrentUser] = useState<AuthUser>(DEFAULT_ADMIN);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<CompanyConfig>(COMPANIES[0]);
  const [business, setBusiness] = useState<BusinessProfile>(companyToBusinessProfile(COMPANIES[0]));
  const [items, setItems] = useState<MockItem[]>([]);
  const [parties, setParties] = useState<MockParty[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [stockLogs, setStockLogs] = useState<StockAdjustmentLog[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [cashInHand, setCashInHand] = useState<number>(COMPANIES[0].cashBalance);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived Effective Permissions
  const effectiveRole: UserRole = simulatedRole || currentUser.role;
  const isAdmin = effectiveRole === 'ADMIN';
  const isEmployee = effectiveRole === 'EMPLOYEE';
  const isTestMode = Boolean(simulatedRole && currentUser.role === 'ADMIN');

  // Initialize Auth & Company from localStorage on client
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('gb_auth_user');
      if (savedUserStr) {
        setCurrentUser(JSON.parse(savedUserStr));
      }
      const savedSimRole = localStorage.getItem('gb_simulated_role') as UserRole | null;
      if (savedSimRole === 'EMPLOYEE' || savedSimRole === 'ADMIN') {
        setSimulatedRole(savedSimRole);
      }

      const savedCompanyCode = localStorage.getItem('gb_active_company');
      if (savedCompanyCode) {
        const found = COMPANIES.find(
          (c) => c.code === savedCompanyCode || c.id === savedCompanyCode
        );
        if (found) {
          setSelectedCompany(found);
          setBusiness(companyToBusinessProfile(found));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Toggle Admin Test Mode (Simulating Employee View)
  const toggleTestMode = useCallback(() => {
    setSimulatedRole((prev) => {
      const nextRole = prev === 'EMPLOYEE' ? null : 'EMPLOYEE';
      try {
        if (nextRole) {
          localStorage.setItem('gb_simulated_role', nextRole);
        } else {
          localStorage.removeItem('gb_simulated_role');
        }
      } catch {}
      return nextRole;
    });
  }, []);

  // Explicit Switch Role
  const switchRole = useCallback((role: UserRole) => {
    if (role === 'EMPLOYEE') {
      setSimulatedRole('EMPLOYEE');
      try {
        localStorage.setItem('gb_simulated_role', 'EMPLOYEE');
      } catch {}
    } else {
      setSimulatedRole(null);
      setCurrentUser(DEFAULT_ADMIN);
      try {
        localStorage.removeItem('gb_simulated_role');
        localStorage.setItem('gb_auth_user', JSON.stringify(DEFAULT_ADMIN));
      } catch {}
    }
  }, []);

  // Login as User
  const loginUser = useCallback((email: string, role: UserRole, name?: string) => {
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: name || (role === 'ADMIN' ? 'Ansh (Admin)' : 'Staff Biller (Employee)'),
      email,
      role,
      designation: role === 'ADMIN' ? 'Owner / Administrator' : 'Sales & Counter Biller',
    };
    setCurrentUser(newUser);
    setSimulatedRole(null);
    try {
      localStorage.setItem('gb_auth_user', JSON.stringify(newUser));
      localStorage.removeItem('gb_simulated_role');
    } catch {}
  }, []);

  // Logout and redirect to login portal
  const logoutUser = useCallback(() => {
    try {
      localStorage.removeItem('gb_auth_user');
      localStorage.removeItem('gb_simulated_role');
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSimulatedRole(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  // System Users Management & Real Credentials Authentication
  const [systemUsers, setSystemUsers] = useState<AppUserRecord[]>([]);

  const refreshSystemUsers = useCallback(async () => {
    try {
      const list = await fetchAllUsers();
      setSystemUsers(list);
    } catch (err) {
      console.warn('Failed to load system users:', err);
    }
  }, []);

  useEffect(() => {
    refreshSystemUsers();
  }, [refreshSystemUsers]);

  const createSystemUser = useCallback(
    async (params: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      phone?: string;
      designation?: string;
    }) => {
      const result = await createUserAccount({
        ...params,
        createdBy: currentUser.name || 'Admin',
      });
      if (result.success && result.user) {
        setSystemUsers((prev) => [result.user!, ...prev.filter((u) => u.id !== result.user!.id)]);
      }
      return result;
    },
    [currentUser.name]
  );

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const result = await authenticateCredentials(email, password);
    if (!result.success || !result.user) {
      return { success: false, error: result.error || 'Authentication failed' };
    }
    const u = result.user;
    const authUser: AuthUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      designation: u.designation,
    };
    setCurrentUser(authUser);
    setSimulatedRole(null);
    try {
      localStorage.setItem('gb_auth_user', JSON.stringify(authUser));
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      localStorage.removeItem('gb_simulated_role');
    } catch {}
    return { success: true };
  }, []);

  const toggleSystemUserActive = useCallback(async (id: string, isActive: boolean) => {
    await toggleUserStatus(id, isActive);
    setSystemUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: isActive } : u)));
  }, []);

  const deleteSystemUser = useCallback(async (id: string) => {
    await deleteUserAccount(id);
    setSystemUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // Fetch all live data from Supabase whenever active company changes
  const loadCompanyData = useCallback(async (company: CompanyConfig) => {
    setIsLoading(true);
    try {
      // 1. Try to fetch live company settings from Supabase
      const remoteCompany = await fetchCompanyFromSupabase(company.id);
      const activeComp = remoteCompany || company;
      setBusiness(companyToBusinessProfile(activeComp));

      // 2. Fetch products, parties, invoices, payments in parallel from Supabase
      const [fetchedItems, fetchedParties, fetchedInvoices, fetchedPayments] = await Promise.all([
        fetchProductsFromSupabase(company.code),
        fetchPartiesFromSupabase(company.code),
        fetchInvoicesFromSupabase(company.code),
        fetchPaymentsFromSupabase(company.code),
      ]);

      setItems(fetchedItems);
      setParties(fetchedParties);
      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);
      setCashInHand(activeComp.cashBalance);
      if (activeComp.bankName && activeComp.accountNumber) {
        setBankAccounts([
          {
            id: `bank-${company.code}`,
            bankName: activeComp.bankName,
            accountName: `${activeComp.displayName} Current A/c`,
            accountNumber: activeComp.accountNumber,
            ifsc: activeComp.ifsc,
            balance: activeComp.bankBalance,
            isDefault: true,
          },
        ]);
      } else {
        setBankAccounts([]);
      }
    } catch (err) {
      console.error('[Supabase] Failed to load data for company:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanyData(selectedCompany);
  }, [selectedCompany, loadCompanyData]);

  // Company Switch Handler
  const selectCompany = useCallback((codeOrId: string) => {
    const target = COMPANIES.find((c) => c.code === codeOrId || c.id === codeOrId);
    if (!target) return;

    setSelectedCompany(target);
    try {
      localStorage.setItem('gb_active_company', target.code);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadCompanyData(selectedCompany);
  }, [selectedCompany, loadCompanyData]);

  // Add Item (Syncs to Supabase)
  const addItem = async (itemData: Omit<MockItem, 'id'>): Promise<MockItem> => {
    const created = await insertProductToSupabase(itemData, selectedCompany.code);
    const resultItem: MockItem = created || {
      ...itemData,
      id: `item-${Date.now()}`,
    };
    setItems((prev) => [resultItem, ...prev]);
    return resultItem;
  };

  // Update Item (Syncs to Supabase)
  const updateItem = async (id: string, updated: Partial<MockItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    await updateProductInSupabase(id, updated);
  };

  // Stock Adjustment
  const adjustStock = async (itemId: string, newStock: number, reason: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const diff = newStock - item.stock;
    const log: StockAdjustmentLog = {
      id: `adj-${Date.now()}`,
      itemId,
      itemName: item.name,
      previousStock: item.stock,
      newStock,
      difference: diff,
      reason,
      date: new Date().toISOString().split('T')[0],
    };

    setStockLogs((prev) => [log, ...prev]);
    await updateItem(itemId, { stock: newStock });
  };

  // Delete Item (Syncs to Supabase)
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteProductInSupabase(id);
  };

  // Add Party (Syncs to Supabase)
  const addParty = async (partyData: Omit<MockParty, 'id'>): Promise<MockParty> => {
    const created = await insertCustomerToSupabase(partyData, selectedCompany.code);
    const resultParty: MockParty = created || {
      ...partyData,
      id: `party-${Date.now()}`,
    };
    setParties((prev) => [resultParty, ...prev]);
    return resultParty;
  };

  // Update Party (Syncs to Supabase)
  const updateParty = async (id: string, updated: Partial<MockParty>) => {
    setParties((prev) =>
      prev.map((party) => (party.id === id ? { ...party, ...updated } : party))
    );
    await updateCustomerInSupabase(id, updated);
  };

  // Delete Party (Syncs to Supabase)
  const deleteParty = async (id: string) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
    await deleteCustomerInSupabase(id);
  };

  // Add Invoice (Syncs to Supabase & decrements item stock if not quotation)
  const addInvoice = async (invoice: MockInvoice): Promise<MockInvoice> => {
    // Insert into Supabase
    const saved = await insertInvoiceToSupabase(invoice, selectedCompany.code);
    const finalInvoice = saved || invoice;

    setInvoices((prev) => [
      finalInvoice,
      ...prev.filter(
        (i) => i.id !== finalInvoice.id && i.invoiceNumber !== finalInvoice.invoiceNumber
      ),
    ]);

    // If it's a Quotation, it is just an estimate - do not deduct inventory, balance, or cash
    if (finalInvoice.invoiceType === 'QUOTATION') {
      return finalInvoice;
    }

    // Update Cash / Bank balance if paid
    if (finalInvoice.paidAmount > 0) {
      if (finalInvoice.paymentMode === 'CASH') {
        setCashInHand((prev) => prev + finalInvoice.paidAmount);
      } else {
        setBankAccounts((prev) =>
          prev.map((b) =>
            b.isDefault ? { ...b, balance: b.balance + finalInvoice.paidAmount } : b
          )
        );
      }

      // Record a PAYMENT_IN receipt into payments list and Supabase
      const matchingParty = parties.find(
        (p) => p.name.toLowerCase() === finalInvoice.partyName.toLowerCase()
      );
      if (matchingParty) {
        const receiptPayment: Omit<PaymentRecord, 'id'> = {
          partyId: matchingParty.id,
          partyName: matchingParty.name,
          type: 'PAYMENT_IN',
          amount: finalInvoice.paidAmount,
          paymentMode: finalInvoice.paymentMode || 'UPI',
          referenceNumber: `INV-${finalInvoice.invoiceNumber}`,
          date: finalInvoice.invoiceDate,
          notes: `Receipt for invoice ${finalInvoice.invoiceNumber}`,
        };
        const newPaymentRecord: PaymentRecord = {
          ...receiptPayment,
          id: `pay-${Date.now()}`,
        };
        setPayments((prev) => [newPaymentRecord, ...prev]);
        insertPaymentToSupabase(receiptPayment, selectedCompany.code);
      }
    }

    // Decrement item inventory in state & Supabase
    finalInvoice.items.forEach((line) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === line.itemId) {
            const nextStock = Math.max(0, item.stock - line.quantity);
            updateProductInSupabase(item.id, { stock: nextStock });
            return { ...item, stock: nextStock };
          }
          return item;
        })
      );
    });

    // If unpaid balance, update matching party's balance
    if (finalInvoice.balanceAmount > 0) {
      setParties((prev) =>
        prev.map((party) => {
          if (party.name.toLowerCase() === finalInvoice.partyName.toLowerCase()) {
            const nextBalance = party.currentBalance + finalInvoice.balanceAmount;
            updateCustomerInSupabase(party.id, { currentBalance: nextBalance });
            return { ...party, currentBalance: nextBalance };
          }
          return party;
        })
      );
    }

    return finalInvoice;
  };

  // Convert Quotation to Confirmed Tax Invoice
  const convertQuotationToInvoice = async (
    quotationId: string,
    params?: {
      paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
      paymentMode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
      paidAmount?: number;
    }
  ): Promise<MockInvoice | null> => {
    const target = invoices.find((inv) => inv.id === quotationId);
    if (!target) return null;

    const prefix = selectedCompany?.code === 'goodwin-2' ? 'GB2-INV' : 'GW-INV';
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const newInvoiceNumber = `${prefix}-${randNum}`;

    const paymentStatus = params?.paymentStatus || 'PAID';
    const paymentMode = params?.paymentMode || 'UPI';
    const paidAmount =
      paymentStatus === 'PAID'
        ? target.totalAmount
        : paymentStatus === 'PARTIAL'
        ? Number(params?.paidAmount) || 0
        : 0;
    const balanceAmount = Math.max(0, target.totalAmount - paidAmount);

    const converted: MockInvoice = {
      ...target,
      invoiceNumber: newInvoiceNumber,
      invoiceType: 'TAX_INVOICE',
      paymentStatus,
      paymentMode,
      paidAmount,
      balanceAmount,
    };

    // Update in Supabase
    await updateInvoiceInSupabase(target.id, {
      invoiceNumber: newInvoiceNumber,
      invoiceType: 'TAX_INVOICE',
      paymentStatus,
      paymentMode,
      balanceAmount,
    });

    // Update invoices state
    setInvoices((prev) => prev.map((inv) => (inv.id === target.id ? converted : inv)));

    // Adjust item stock
    converted.items.forEach((line) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === line.itemId) {
            const nextStock = Math.max(0, item.stock - line.quantity);
            updateProductInSupabase(item.id, { stock: nextStock });
            return { ...item, stock: nextStock };
          }
          return item;
        })
      );
    });

    // Update cash/bank & party balance
    if (paidAmount > 0) {
      if (paymentMode === 'CASH') {
        setCashInHand((prev) => prev + paidAmount);
      } else {
        setBankAccounts((prev) =>
          prev.map((b) => (b.isDefault ? { ...b, balance: b.balance + paidAmount } : b))
        );
      }

      const matchingParty = parties.find(
        (p) => p.name.toLowerCase() === converted.partyName.toLowerCase()
      );
      if (matchingParty) {
        const receiptPayment: Omit<PaymentRecord, 'id'> = {
          partyId: matchingParty.id,
          partyName: matchingParty.name,
          type: 'PAYMENT_IN',
          amount: paidAmount,
          paymentMode,
          referenceNumber: `INV-${newInvoiceNumber}`,
          date: converted.invoiceDate,
          notes: `Receipt for invoice ${newInvoiceNumber}`,
        };
        const newPaymentRecord: PaymentRecord = {
          ...receiptPayment,
          id: `pay-${Date.now()}`,
        };
        setPayments((prev) => [newPaymentRecord, ...prev]);
        insertPaymentToSupabase(receiptPayment, selectedCompany.code);
      }
    }

    if (balanceAmount > 0) {
      setParties((prev) =>
        prev.map((party) => {
          if (party.name.toLowerCase() === converted.partyName.toLowerCase()) {
            const nextBalance = party.currentBalance + balanceAmount;
            updateCustomerInSupabase(party.id, { currentBalance: nextBalance });
            return { ...party, currentBalance: nextBalance };
          }
          return party;
        })
      );
    }

    return converted;
  };

  // Delete Invoice (Syncs to Supabase)
  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    await deleteInvoiceInSupabase(id);
  };

  // Record Payment (Syncs to Supabase)
  const recordPayment = async (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Sync to Supabase
    await insertPaymentToSupabase(paymentData, selectedCompany.code);

    // Update Cash or Bank balance
    if (paymentData.paymentMode === 'CASH') {
      if (paymentData.type === 'PAYMENT_IN') {
        setCashInHand((prev) => prev + paymentData.amount);
      } else {
        setCashInHand((prev) => Math.max(0, prev - paymentData.amount));
      }
    } else {
      setBankAccounts((prev) =>
        prev.map((b) => {
          if (b.isDefault) {
            return {
              ...b,
              balance:
                paymentData.type === 'PAYMENT_IN'
                  ? b.balance + paymentData.amount
                  : Math.max(0, b.balance - paymentData.amount),
            };
          }
          return b;
        })
      );
    }

    // Update Party Current Balance
    setParties((prev) =>
      prev.map((party) => {
        if (party.id === paymentData.partyId) {
          const delta = paymentData.type === 'PAYMENT_IN' ? -paymentData.amount : paymentData.amount;
          const nextBal = party.currentBalance + delta;
          updateCustomerInSupabase(party.id, { currentBalance: nextBal });
          return { ...party, currentBalance: nextBal };
        }
        return party;
      })
    );
  };

  // Add Bank Account
  const addBankAccount = (bankData: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = {
      ...bankData,
      id: `bank-${Date.now()}`,
    };
    setBankAccounts((prev) => [...prev, newBank]);
  };

  // Add Expense
  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (expenseData.paidFrom === 'Cash in Hand') {
      setCashInHand((prev) => Math.max(0, prev - expenseData.amount));
    } else {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.bankName === expenseData.paidFrom
            ? { ...b, balance: Math.max(0, b.balance - expenseData.amount) }
            : b
        )
      );
    }
  };

  // Transfer Funds
  const transferFunds = (from: string, to: string, amount: number) => {
    if (from === 'CASH') {
      setCashInHand((prev) => Math.max(0, prev - amount));
    } else {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === from ? { ...b, balance: Math.max(0, b.balance - amount) } : b))
      );
    }

    if (to === 'CASH') {
      setCashInHand((prev) => prev + amount);
    } else {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === to ? { ...b, balance: b.balance + amount } : b))
      );
    }
  };

  // Update Business Settings
  const updateBusiness = (updated: Partial<BusinessProfile>) => {
    setBusiness((prev) => ({ ...prev, ...updated }));
    // Also sync to Supabase company_settings
    supabase
      .from('company_settings')
      .update({
        company_name: updated.businessName,
        gstin: updated.gstin,
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        invoice_prefix: updated.invoicePrefix,
      })
      .eq('id', selectedCompany.id)
      .then();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        simulatedRole,
        effectiveRole,
        isAdmin,
        isEmployee,
        isTestMode,
        toggleTestMode,
        switchRole,
        loginUser,
        logoutUser,
        systemUsers,
        refreshSystemUsers,
        createSystemUser,
        loginWithCredentials,
        toggleSystemUserActive,
        deleteSystemUser,
        companies: COMPANIES,
        selectedCompany,
        selectCompany,
        isLoading,
        refreshData,
        business,
        items,
        parties,
        invoices,
        stockLogs,
        payments,
        bankAccounts,
        expenses,
        cashInHand,
        addItem,
        updateItem,
        adjustStock,
        deleteItem,
        addParty,
        updateParty,
        deleteParty,
        addInvoice,
        convertQuotationToInvoice,
        deleteInvoice,
        recordPayment,
        addBankAccount,
        addExpense,
        transferFunds,
        updateBusiness,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
