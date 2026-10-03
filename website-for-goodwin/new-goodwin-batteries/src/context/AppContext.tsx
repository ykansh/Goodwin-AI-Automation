'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ITEMS,
  INITIAL_PARTIES,
  INITIAL_INVOICES,
  INITIAL_BUSINESS,
  MockItem,
  MockParty,
  MockInvoice,
  BusinessProfile,
} from '@/lib/mockData';

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
  paidFrom: string; // 'Cash in Hand' or Bank Account Name
  notes?: string;
}

interface AppContextType {
  business: BusinessProfile;
  items: MockItem[];
  parties: MockParty[];
  invoices: MockInvoice[];
  stockLogs: StockAdjustmentLog[];
  payments: PaymentRecord[];
  bankAccounts: BankAccount[];
  expenses: ExpenseRecord[];
  cashInHand: number;
  addItem: (item: Omit<MockItem, 'id'>) => MockItem;
  updateItem: (id: string, updated: Partial<MockItem>) => void;
  adjustStock: (itemId: string, newStock: number, reason: string) => void;
  deleteItem: (id: string) => void;
  addParty: (party: Omit<MockParty, 'id'>) => MockParty;
  updateParty: (id: string, updated: Partial<MockParty>) => void;
  deleteParty: (id: string) => void;
  addInvoice: (invoice: MockInvoice) => void;
  recordPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  transferFunds: (from: string, to: string, amount: number, notes?: string) => void;
  updateBusiness: (updated: Partial<BusinessProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<BusinessProfile>(INITIAL_BUSINESS);
  const [items, setItems] = useState<MockItem[]>(INITIAL_ITEMS);
  const [parties, setParties] = useState<MockParty[]>(INITIAL_PARTIES);
  const [invoices, setInvoices] = useState<MockInvoice[]>(INITIAL_INVOICES);
  const [cashInHand, setCashInHand] = useState<number>(48500);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: 'bank-1',
      bankName: 'HDFC Bank',
      accountName: 'Goodwin Batteries Current A/c',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000123',
      balance: 185400,
      isDefault: true,
    },
    {
      id: 'bank-2',
      bankName: 'ICICI Bank',
      accountName: 'Goodwin Power Solutions',
      accountNumber: '001105009988',
      ifsc: 'ICIC0000011',
      balance: 92000,
      isDefault: false,
    },
  ]);

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([
    {
      id: 'exp-1',
      category: 'Shop / Warehouse Rent',
      amount: 25000,
      paymentMode: 'BANK_TRANSFER',
      date: '2026-10-01',
      paidFrom: 'HDFC Bank',
      notes: 'October month rent for Andheri warehouse',
    },
    {
      id: 'exp-2',
      category: 'Electricity & Utilities',
      amount: 4200,
      paymentMode: 'UPI',
      date: '2026-10-02',
      paidFrom: 'HDFC Bank',
      notes: 'Adani Electricity bill payment',
    },
    {
      id: 'exp-3',
      category: 'Logistics & Battery Freight',
      amount: 3500,
      paymentMode: 'CASH',
      date: '2026-10-02',
      paidFrom: 'Cash in Hand',
      notes: 'Tempo transport charges for solar panels',
    },
    {
      id: 'exp-4',
      category: 'Tea & Refreshments',
      amount: 1200,
      paymentMode: 'CASH',
      date: '2026-10-03',
      paidFrom: 'Cash in Hand',
      notes: 'Weekly pantry refreshments',
    },
  ]);

  const [stockLogs, setStockLogs] = useState<StockAdjustmentLog[]>([
    {
      id: 'log-1',
      itemId: 'item-2',
      itemName: '12V 100Ah Short Tubular Solar Battery',
      previousStock: 15,
      newStock: 5,
      difference: -10,
      reason: 'Physical Audit Count',
      date: '2026-10-02',
    },
  ]);

  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay-1',
      partyId: 'party-1',
      partyName: 'Apex Electricals & Power Care',
      type: 'PAYMENT_IN',
      amount: 20000,
      paymentMode: 'UPI',
      referenceNumber: 'UPI/261001/983742',
      date: '2026-10-01',
      notes: 'Advance for Battery delivery',
    },
    {
      id: 'pay-2',
      partyId: 'party-3',
      partyName: 'Exide Lead & Alloys Corp',
      type: 'PAYMENT_OUT',
      amount: 50000,
      paymentMode: 'BANK_TRANSFER',
      referenceNumber: 'NEFT-HDFC-998811',
      date: '2026-09-28',
      notes: 'Raw material procurement partial payout',
    },
  ]);

  // Add Item
  const addItem = (itemData: Omit<MockItem, 'id'>): MockItem => {
    const newItem: MockItem = {
      ...itemData,
      id: `item-${Date.now()}`,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  // Update Item
  const updateItem = (id: string, updated: Partial<MockItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  // Stock Adjustment
  const adjustStock = (itemId: string, newStock: number, reason: string) => {
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
    updateItem(itemId, { stock: newStock });
  };

  // Delete Item
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Add Party
  const addParty = (partyData: Omit<MockParty, 'id'>): MockParty => {
    const newParty: MockParty = {
      ...partyData,
      id: `party-${Date.now()}`,
    };
    setParties((prev) => [newParty, ...prev]);
    return newParty;
  };

  // Update Party
  const updateParty = (id: string, updated: Partial<MockParty>) => {
    setParties((prev) =>
      prev.map((party) => (party.id === id ? { ...party, ...updated } : party))
    );
  };

  // Delete Party
  const deleteParty = (id: string) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
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

    // Deduct from paid source
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

  // Transfer Funds (Contra Entry: Cash to Bank, Bank to Cash, Bank to Bank)
  const transferFunds = (from: string, to: string, amount: number, notes?: string) => {
    // Deduct from source
    if (from === 'CASH') {
      setCashInHand((prev) => Math.max(0, prev - amount));
    } else {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === from ? { ...b, balance: Math.max(0, b.balance - amount) } : b))
      );
    }

    // Add to destination
    if (to === 'CASH') {
      setCashInHand((prev) => prev + amount);
    } else {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === to ? { ...b, balance: b.balance + amount } : b))
      );
    }
  };

  // Record Payment
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Update Cash or Bank balance
    if (paymentData.paymentMode === 'CASH') {
      if (paymentData.type === 'PAYMENT_IN') {
        setCashInHand((prev) => prev + paymentData.amount);
      } else {
        setCashInHand((prev) => Math.max(0, prev - paymentData.amount));
      }
    } else {
      // Direct into default bank
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
          if (paymentData.type === 'PAYMENT_IN') {
            return {
              ...party,
              currentBalance: party.currentBalance - paymentData.amount,
            };
          } else {
            return {
              ...party,
              currentBalance: party.currentBalance + paymentData.amount,
            };
          }
        }
        return party;
      })
    );
  };

  // Add Invoice (Decrements stock automatically & updates party balance)
  const addInvoice = (invoice: MockInvoice) => {
    setInvoices((prev) => [invoice, ...prev]);

    // If paid at checkout, increment cash/bank
    if (invoice.paidAmount > 0) {
      setCashInHand((prev) => prev + invoice.paidAmount);
    }

    // Decrement item inventory in real time
    invoice.items.forEach((line) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === line.itemId) {
            return {
              ...item,
              stock: Math.max(0, item.stock - line.quantity),
            };
          }
          return item;
        })
      );
    });

    // If unpaid balance, update matching party's receivable balance
    if (invoice.balanceAmount > 0) {
      setParties((prev) =>
        prev.map((party) => {
          if (party.name.toLowerCase() === invoice.partyName.toLowerCase()) {
            return {
              ...party,
              currentBalance: party.currentBalance + invoice.balanceAmount,
            };
          }
          return party;
        })
      );
    }
  };

  // Update Business Settings
  const updateBusiness = (updated: Partial<BusinessProfile>) => {
    setBusiness((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AppContext.Provider
      value={{
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
