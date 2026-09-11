import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// Example hooks - we will implement the rest similarly

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Manually cascade delete dependent records to prevent FK constraints
      await supabase.from('sales_invoices').delete().eq('customer_id', id);
      await supabase.from('battery_warranties').delete().eq('customer_id', id);
      await supabase.from('returns').delete().eq('party_id', id);
      await supabase.from('payments').delete().eq('party_id', id);
      await supabase.from('ledger_entries').delete().eq('party_id', id);

      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      toast.success('Customer and all associated records deleted');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Manually cascade delete
      await supabase.from('purchase_orders').delete().eq('supplier_id', id);
      await supabase.from('returns').delete().eq('party_id', id);
      await supabase.from('payments').delete().eq('party_id', id);
      await supabase.from('ledger_entries').delete().eq('party_id', id);

      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteSalesInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sales_invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Sales invoice deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Purchase order deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('returns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('Return note deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteWarranty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('battery_warranties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Warranty record deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateWarrantyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'claimed' | 'expired' | 'rejected' }) => {
      const { error } = await supabase.from('battery_warranties').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Warranty status updated successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<any>) => {
      // Typically there is only one row in company_settings, so we can update without ID 
      // or assume the single row has a specific ID (e.g., 1 or hardcoded UUID).
      // Assuming ID is not needed or we update all.
      // Wait, let's fetch the first row's ID and update it.
      const { data } = await supabase.from('company_settings').select('id').limit(1).maybeSingle();
      if (!data) {
        // insert if not exists
        const { error } = await supabase.from('company_settings').insert(updates);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('company_settings').update(updates).eq('id', data.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment receipt deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeData: any) => {
      const { error } = await supabase.from('hrms_employees').insert(employeeData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_employees'] });
      toast.success('Employee added successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateHrmsEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('hrms_employees').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payrollData: any) => {
      const { error } = await supabase.from('hrms_payroll').insert(payrollData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_payroll'] });
      toast.success('Payroll processed successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateHrmsPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('hrms_payroll').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_payroll'] });
      toast.success('Payroll status updated');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveData: any) => {
      const { error } = await supabase.from('hrms_leaves').insert(leaveData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_leaves'] });
      toast.success('Leave applied successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateHrmsLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('hrms_leaves').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_leaves'] });
      toast.success('Leave status updated');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteHrmsLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hrms_leaves').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_leaves'] });
      toast.success('Leave deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendanceData: any) => {
      const { data: existing } = await supabase
        .from('hrms_attendance')
        .select('id')
        .eq('employee_id', attendanceData.employee_id)
        .eq('date', attendanceData.date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('hrms_attendance').update(attendanceData).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hrms_attendance').insert(attendanceData);
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_attendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteHrmsAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hrms_attendance').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_attendance'] });
      toast.success('Attendance record deleted');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectData: any) => {
      const { error } = await supabase.from('hrms_projects').insert(projectData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_projects'] });
      toast.success('Project added successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateHrmsProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('hrms_projects').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_projects'] });
      toast.success('Project updated');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: any) => {
      const { error } = await supabase.from('hrms_tasks').insert(taskData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_tasks'] });
      toast.success('Task added successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateHrmsTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('hrms_tasks').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_tasks'] });
      toast.success('Task updated');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddHrmsTimesheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (timesheetData: any) => {
      const { error } = await supabase.from('hrms_timesheets').insert(timesheetData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_timesheets'] });
      toast.success('Timesheet logged');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateHrmsTimesheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('hrms_timesheets').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_timesheets'] });
      toast.success('Timesheet updated');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};
