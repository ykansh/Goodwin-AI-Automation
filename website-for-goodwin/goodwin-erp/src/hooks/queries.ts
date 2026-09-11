import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { 
  Customer, Supplier, Product, SalesInvoice, PurchaseOrder, 
  Return, BatteryWarranty, Payment, LedgerEntry, CompanySettings,
  Lead, LeadActivity,
  HrmsEmployee, HrmsAttendance, HrmsLeave, HrmsPayroll,
  HrmsProject, HrmsMilestone, HrmsTask, HrmsTimesheet
} from '../types';

// Generic hook factory for basic table fetches
function createUseQuery<T>(tableName: string, queryKey: string, orderColumn = 'created_at', ascending = false) {
  return () => {
    return useQuery({
      queryKey: [queryKey],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order(orderColumn, { ascending });
          
        if (error) {
          console.error(`[Supabase] Error fetching ${tableName}:`, error);
          throw error;
        }
        return data as T[];
      }
    });
  };
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['company_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('company_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data as CompanySettings | null;
    }
  });
}

export function useSalesInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sales_invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
};

export const useCustomers = createUseQuery<Customer>('customers', 'customers');
export const useSuppliers = createUseQuery<Supplier>('suppliers', 'suppliers');
export const useProducts = createUseQuery<Product>('products', 'products');
export const useInvoices = createUseQuery<SalesInvoice>('sales_invoices', 'invoices');
export const usePurchases = createUseQuery<PurchaseOrder>('purchase_orders', 'purchases');
export const useReturns = createUseQuery<Return>('returns', 'returns');
export const useWarranties = createUseQuery<BatteryWarranty>('battery_warranties', 'warranties');
export const usePayments = createUseQuery<Payment>('payments', 'payments');
export const useLedgerEntries = createUseQuery<LedgerEntry>('ledger_entries', 'ledgerEntries');
export const useLeads = createUseQuery<Lead>('leads', 'leads');
export const useActivities = createUseQuery<LeadActivity>('lead_activities', 'activities');

// HRMS Queries
export const useHrmsEmployees = createUseQuery<HrmsEmployee>('hrms_employees', 'hrms_employees');
export const useHrmsProjects = createUseQuery<HrmsProject>('hrms_projects', 'hrms_projects');
export const useHrmsMilestones = createUseQuery<HrmsMilestone>('hrms_milestones', 'hrms_milestones', 'due_date', true);

// HRMS complex queries with relations
export const useHrmsAttendance = () => useQuery({
  queryKey: ['hrms_attendance'],
  queryFn: async () => {
    const { data, error } = await supabase.from('hrms_attendance').select('*, employee:hrms_employees(*)').order('date', { ascending: false });
    if (error) throw error;
    return data as HrmsAttendance[];
  }
});

export const useHrmsLeaves = () => useQuery({
  queryKey: ['hrms_leaves'],
  queryFn: async () => {
    const { data, error } = await supabase.from('hrms_leaves').select('*, employee:hrms_employees(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data as HrmsLeave[];
  }
});

export const useHrmsPayroll = () => useQuery({
  queryKey: ['hrms_payroll'],
  queryFn: async () => {
    const { data, error } = await supabase.from('hrms_payroll').select('*, employee:hrms_employees(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data as HrmsPayroll[];
  }
});

export const useHrmsTasks = () => useQuery({
  queryKey: ['hrms_tasks'],
  queryFn: async () => {
    const { data, error } = await supabase.from('hrms_tasks').select('*, employee:hrms_employees(*), project:hrms_projects(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data as HrmsTask[];
  }
});

export const useHrmsTimesheets = () => useQuery({
  queryKey: ['hrms_timesheets'],
  queryFn: async () => {
    const { data, error } = await supabase.from('hrms_timesheets').select('*, employee:hrms_employees(*), task:hrms_tasks(*)').order('date', { ascending: false });
    if (error) throw error;
    return data as HrmsTimesheet[];
  }
});
