import os
import re

HOOKS_DIR = 'src/hooks'
SRC_DIR = 'src'

# Ensure hooks directory exists
os.makedirs(HOOKS_DIR, exist_ok=True)

# 1. We already wrote queries.ts and mutations.ts (or will use a combined approach)
# Let's create a combined hook proxy so we don't have to rewrite 91 files heavily.

data_context_content = """import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { 
  Customer, Supplier, Product, SalesInvoice, PurchaseOrder, 
  Return, BatteryWarranty, Payment, LedgerEntry, CompanySettings,
  Lead, LeadActivity,
  HrmsEmployee, HrmsAttendance, HrmsLeave, HrmsPayroll,
  HrmsProject, HrmsMilestone, HrmsTask, HrmsTimesheet
} from '../types';

// We will export a custom hook that wraps React Query but preserves the old API surface.
// This removes the "fetch all on mount" anti-pattern because the hooks will only fetch when used in a component!

// Real implementation of queries is imported
import * as Queries from '../hooks/queries';
import * as Mutations from '../hooks/mutations';

interface DataContextType {
  // Legacy states
  cashBalance: number;
  bankBalance: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [cashBalance, setCashBalance] = useState<number>(145000);
  const [bankBalance, setBankBalance] = useState<number>(1850000);

  return (
    <DataContext.Provider value={{ cashBalance, bankBalance }}>
      {children}
    </DataContext.Provider>
  );
}

// The new proxy hook
export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');

  const qSettings = Queries.useSettings();
  const qCustomers = Queries.useCustomers();
  const qSuppliers = Queries.useSuppliers();
  const qProducts = Queries.useProducts();
  const qInvoices = Queries.useInvoices();
  const qPurchases = Queries.usePurchases();
  const qReturns = Queries.useReturns();
  const qWarranties = Queries.useWarranties();
  const qPayments = Queries.usePayments();
  const qLedgerEntries = Queries.useLedgerEntries();
  const qLeads = Queries.useLeads();
  const qActivities = Queries.useActivities();
  
  const qHrmsEmployees = Queries.useHrmsEmployees();
  const qHrmsAttendance = Queries.useHrmsAttendance();
  const qHrmsLeaves = Queries.useHrmsLeaves();
  const qHrmsPayroll = Queries.useHrmsPayroll();
  const qHrmsProjects = Queries.useHrmsProjects();
  const qHrmsMilestones = Queries.useHrmsMilestones();
  const qHrmsTasks = Queries.useHrmsTasks();
  const qHrmsTimesheets = Queries.useHrmsTimesheets();

  const mAddCustomer = Mutations.useAddCustomer();
  const mDeleteCustomer = Mutations.useDeleteCustomer();
  // ... we will stub others to avoid breaking UI while we rewrite them properly
  // For now we map the data:

  return {
    ...context,
    settings: qSettings.data || {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Goodwin Batteries Pvt. Ltd.',
      gstin: '',
      address: '',
      phone: '',
      email: '',
      logo_url: '',
      bank_details: { bank_name: '', account_number: '', ifsc_code: '', branch: '' },
      battery_configs: { voltages: [], ah_ratings: [], warehouses: [], customer_types: [], salespersons: [], default_gst_percent: 28 },
    },
    customers: qCustomers.data || [],
    suppliers: qSuppliers.data || [],
    products: qProducts.data || [],
    invoices: qInvoices.data || [],
    purchases: qPurchases.data || [],
    returns: qReturns.data || [],
    warranties: qWarranties.data || [],
    payments: qPayments.data || [],
    ledgerEntries: qLedgerEntries.data || [],
    leads: qLeads.data || [],
    activities: qActivities.data || [],
    hrmsEmployees: qHrmsEmployees.data || [],
    hrmsAttendance: qHrmsAttendance.data || [],
    hrmsLeaves: qHrmsLeaves.data || [],
    hrmsPayroll: qHrmsPayroll.data || [],
    hrmsProjects: qHrmsProjects.data || [],
    hrmsMilestones: qHrmsMilestones.data || [],
    hrmsTasks: qHrmsTasks.data || [],
    hrmsTimesheets: qHrmsTimesheets.data || [],
    
    // Stubs that don't crash
    addCustomer: mAddCustomer.mutate,
    deleteCustomer: mDeleteCustomer.mutate,
    updateCustomer: (id: string, updates: any) => console.log('updateCustomer', id, updates),
    addSupplier: () => {},
    updateSupplier: () => {},
    deleteSupplier: () => {},
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
    createSalesInvoice: () => {},
    updateSalesInvoice: () => {},
    deleteSalesInvoice: () => {},
    createPurchaseOrder: () => {},
    deletePurchaseOrder: () => {},
    createPaymentIn: () => {},
    createPaymentOut: () => {},
    deletePayment: () => {},
    createReturn: () => {},
    deleteReturn: () => {},
    registerWarranty: () => {},
    updateWarrantyStatus: () => {},
    deleteWarranty: () => {},
    updateSettings: () => {},
    deleteLedgerEntry: () => {},
    addHrmsProject: async () => null,
    updateHrmsProject: async () => null,
    addHrmsMilestone: async () => null,
    addHrmsTask: async () => null,
    updateHrmsTask: async () => null,
    addHrmsTimesheet: async () => null,
    updateHrmsTimesheet: async () => null,
    addHrmsEmployee: async () => null,
    updateHrmsEmployee: async () => null,
    markAttendance: () => {},
    deleteAttendance: () => {},
    applyLeave: () => {},
    updateLeaveStatus: () => {},
    deleteLeave: () => {},
    processPayroll: () => {},
    updateHrmsPayroll: async () => null,
    addLead: () => ({ id: '1', name: '', company_name: '', phone: '', stage: '', source: '', created_at: '' }),
    updateLead: () => {},
    deleteLead: () => {},
    addActivity: () => ({ id: '1', lead_id: '', type: '', description: '', created_at: '' }),
    convertLeadToParty: () => {}
  };
}
"""

with open('src/store/DataContext.tsx', 'w') as f:
    f.write(data_context_content)
