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
      // Map name -> company_name if present, since the Supabase column is company_name
      const sanitizedUpdates = { ...updates };
      if ('name' in sanitizedUpdates && !sanitizedUpdates.company_name) {
        sanitizedUpdates.company_name = sanitizedUpdates.name;
        delete sanitizedUpdates.name;
      }
      const { data } = await supabase.from('company_settings').select('id').limit(1).maybeSingle();
      if (!data) {
        const { error } = await supabase.from('company_settings').insert(sanitizedUpdates);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('company_settings').update(sanitizedUpdates).eq('id', data.id);
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

export const useAddLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadData: any) => {
      const { error } = await supabase.from('leads').insert(leadData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead added successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('leads').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useAddActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityData: any) => {
      const { error } = await supabase.from('lead_activities').insert(activityData);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_activities'] });
      toast.success('Activity logged successfully');
    },
    onError: (error) => {
      toast.error(`Supabase Error: ${error.message}`);
    }
  });
};

export const useConvertLeadToParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leadId,
      partyData,
      lead
    }: {
      leadId: string;
      partyData: {
        name: string;
        contact: string;
        email: string;
        address: string;
        type: string;
        gstin?: string;
        linkExistingId?: string;
      };
      lead: any;
    }) => {
      let linkedCustomerId = partyData.linkExistingId;
      let customerName = partyData.name;

      if (!linkedCustomerId) {
        // Create new customer
        // Let's get the max UOI
        const { data: customers } = await supabase.from('customers').select('uoi');
        const nums = (customers || [])
          .map((c) => {
            const m = c.uoi?.match(/GW-CUST-(\d+)/i);
            return m ? parseInt(m[1], 10) : 0;
          })
          .filter((n) => !isNaN(n) && n > 0);
        const max = nums.length > 0 ? Math.max(...nums) : 1000;
        const nextUoi = `GW-CUST-${max + 1}`;

        const newCustomer = {
          uoi: nextUoi,
          name: partyData.name,
          contact: partyData.contact,
          email: partyData.email,
          address: partyData.address || 'Address not provided',
          type: partyData.type,
          gstin: partyData.gstin || '',
          credit_limit: 500000,
          outstanding: 0,
          salesperson: lead.assigned_to || 'Deepak Singh'
        };

        const { data: insertedCust, error: insertError } = await supabase.from('customers').insert(newCustomer).select().single();
        if (insertError) throw insertError;

        linkedCustomerId = insertedCust.id;
        customerName = `${insertedCust.name} (${insertedCust.uoi})`;
      } else {
        const { data: existingCust } = await supabase.from('customers').select('name, uoi').eq('id', linkedCustomerId).single();
        if (existingCust) customerName = `${existingCust.name} (${existingCust.uoi})`;
      }

      // Update lead
      const { error: updateError } = await supabase.from('leads').update({
        stage: 'Won',
        party_id: linkedCustomerId,
        updated_at: new Date().toISOString()
      }).eq('id', leadId);
      if (updateError) throw updateError;

      // Add activity
      const { error: actError } = await supabase.from('lead_activities').insert({
        lead_id: leadId,
        type: 'Note',
        description: `Converted to Party: ${customerName}`,
        created_by: lead.assigned_to || 'Admin'
      });
      if (actError) throw actError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['lead_activities'] });
    },
    onError: (error) => {
      toast.error(`Error converting lead: ${error.message}`);
    }
  });
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: any) => {
      // Create UOI for customer
      const { data: customers } = await supabase.from('customers').select('uoi');
      const nums = (customers || [])
        .map((c) => {
          const m = c.uoi?.match(/GW-CUST-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      const max = nums.length > 0 ? Math.max(...nums) : 1000;
      customer.uoi = `GW-CUST-${max + 1}`;

      const { error } = await supabase.from('customers').insert(customer);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer added successfully');
    },
    onError: (error) => {
      toast.error(`Error adding customer: ${error.message}`);
    }
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('customers').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating customer: ${error.message}`);
    }
  });
};

export const useUpdateSalesInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('sales_invoices').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Sales invoice updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating sales invoice: ${error.message}`);
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('products').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error.message}`);
    }
  });
};

export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: any) => {
      // Create UOI for supplier
      const { data: suppliers } = await supabase.from('suppliers').select('uoi');
      const nums = (suppliers || [])
        .map((s) => {
          const m = s.uoi?.match(/GW-SUPP-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      const max = nums.length > 0 ? Math.max(...nums) : 1000;
      supplier.uoi = `GW-SUPP-${max + 1}`;

      const { error } = await supabase.from('suppliers').insert(supplier);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier added successfully');
    },
    onError: (error) => {
      toast.error(`Error adding supplier: ${error.message}`);
    }
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('suppliers').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating supplier: ${error.message}`);
    }
  });
};

export const useCreateSalesInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: any) => {
      // Step 1: Create invoice
      const { data: insertedInvoice, error: invError } = await supabase
        .from('sales_invoices')
        .insert(invoice)
        .select()
        .single();
        
      if (invError) throw invError;

      // Step 2: Handle initial payment if present
      if (invoice.initial_payment && invoice.initial_payment > 0) {
        const receiptNumber = `RCT-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
        const payment = {
          receipt_number: receiptNumber,
          date: invoice.date,
          party_id: invoice.customer_id,
          party_name: invoice.customer_name,
          party_type: 'Customer',
          direction: 'in',
          amount: invoice.initial_payment,
          payment_mode: 'Cash',
          reference: `INV-${insertedInvoice.invoice_number}`,
        };
        const { error: payError } = await supabase.from('payments').insert(payment);
        if (payError) console.error('Error recording initial payment for invoice:', payError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Sales invoice created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating sales invoice: ${error.message}`);
    }
  });
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: any) => {
      const { error } = await supabase.from('products').insert(product);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
    },
    onError: (error) => {
      toast.error(`Error adding product: ${error.message}`);
    }
  });
};

export const useCreatePaymentIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: any) => {
      const receiptNumber = payment.receipt_number || `RCT-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
      const paymentPayload = {
        receipt_number: receiptNumber,
        date: payment.date || new Date().toISOString().split('T')[0],
        party_name: payment.party_name,
        party_id: payment.party_id,
        party_uoi: payment.party_uoi || null,
        party_type: payment.party_type || 'Customer',
        payment_mode: payment.payment_mode || 'bank',
        reference: payment.reference || '',
        amount: Number(payment.amount),
        direction: 'in',
      };

      const { data: insertedPayment, error: payError } = await supabase
        .from('payments')
        .insert(paymentPayload)
        .select()
        .single();
      if (payError) throw payError;

      // Update customer outstanding balance if party_id exists
      if (payment.party_id) {
        try {
          const { data: cust } = await supabase.from('customers').select('outstanding').eq('id', payment.party_id).maybeSingle();
          if (cust) {
            const currentOutstanding = Number(cust.outstanding || 0);
            const newOutstanding = Math.max(0, currentOutstanding - Number(payment.amount));
            await supabase.from('customers').update({ outstanding: newOutstanding }).eq('id', payment.party_id);
          }
        } catch (e) {
          console.warn('Failed to update customer outstanding balance:', e);
        }

        // Insert ledger entry for double-entry tracking
        try {
          await supabase.from('ledger_entries').insert({
            party_id: payment.party_id,
            party_name: payment.party_name,
            party_uoi: payment.party_uoi || null,
            party_type: 'Customer',
            date: payment.date || new Date().toISOString().split('T')[0],
            description: `Payment Received (${payment.payment_mode || 'Bank'}) Ref: ${payment.reference || ''}`,
            doc_number: receiptNumber,
            credit: Number(payment.amount),
            debit: 0,
            reference_type: 'payment',
            reference_id: insertedPayment?.id
          });
        } catch (e) {
          console.warn('Failed to record ledger entry:', e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Payment In recorded successfully');
    },
    onError: (error) => {
      toast.error(`Error recording payment: ${error.message}`);
    }
  });
};

export const useCreatePaymentOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: any) => {
      const voucherNumber = payment.receipt_number || `VCH-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
      const paymentPayload = {
        receipt_number: voucherNumber,
        date: payment.date || new Date().toISOString().split('T')[0],
        party_name: payment.party_name,
        party_id: payment.party_id,
        party_uoi: payment.party_uoi || null,
        party_type: payment.party_type || 'Supplier',
        payment_mode: payment.payment_mode || 'bank',
        reference: payment.reference || '',
        amount: Number(payment.amount),
        direction: 'out',
      };

      const { data: insertedPayment, error: payError } = await supabase
        .from('payments')
        .insert(paymentPayload)
        .select()
        .single();
      if (payError) throw payError;

      // Update supplier outstanding balance if party_id exists
      if (payment.party_id) {
        try {
          const { data: supp } = await supabase.from('suppliers').select('outstanding').eq('id', payment.party_id).maybeSingle();
          if (supp) {
            const currentOutstanding = Number(supp.outstanding || 0);
            const newOutstanding = Math.max(0, currentOutstanding - Number(payment.amount));
            await supabase.from('suppliers').update({ outstanding: newOutstanding }).eq('id', payment.party_id);
          }
        } catch (e) {
          console.warn('Failed to update supplier outstanding balance:', e);
        }

        // Insert ledger entry for double-entry tracking
        try {
          await supabase.from('ledger_entries').insert({
            party_id: payment.party_id,
            party_name: payment.party_name,
            party_uoi: payment.party_uoi || null,
            party_type: 'Supplier',
            date: payment.date || new Date().toISOString().split('T')[0],
            description: `Payment Out (${payment.payment_mode || 'Bank'}) Ref: ${payment.reference || ''}`,
            doc_number: voucherNumber,
            debit: Number(payment.amount),
            credit: 0,
            reference_type: 'payment',
            reference_id: insertedPayment?.id
          });
        } catch (e) {
          console.warn('Failed to record ledger entry:', e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Payment Out recorded successfully');
    },
    onError: (error) => {
      toast.error(`Error recording payment: ${error.message}`);
    }
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchase: any) => {
      const { error } = await supabase.from('purchase_orders').insert(purchase);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Purchase Order recorded successfully');
    },
    onError: (error) => {
      toast.error(`Error recording purchase order: ${error.message}`);
    }
  });
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (returnData: any) => {
      const { error } = await supabase.from('returns').insert(returnData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      toast.success('Return note issued successfully');
    },
    onError: (error) => {
      toast.error(`Error issuing return note: ${error.message}`);
    }
  });
};

export const useRegisterWarranty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (warranty: any) => {
      const { error } = await supabase.from('battery_warranties').insert(warranty);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Warranty registered successfully');
    },
    onError: (error) => {
      toast.error(`Error registering warranty: ${error.message}`);
    }
  });
};

export const useDeleteLedgerEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase.from('ledger_entries').delete().eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      toast.success('Ledger entry deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting ledger entry: ${error.message}`);
    }
  });
};

export const useDeleteHrmsProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hrms_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrms_projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting project: ${error.message}`);
    }
  });
};

// ── BULK EXCEL IMPORT MUTATIONS ──────────────────────────────────────
export const useBulkAddCustomers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Record<string, any>[]) => {
      const { data: existingCustomers } = await supabase.from('customers').select('uoi');
      const nums = (existingCustomers || [])
        .map((c) => {
          const m = c.uoi?.match(/GW-CUST-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      let nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1001;

      const customersToInsert = rows.map((r) => {
        const uoi = r.uoi || `GW-CUST-${nextNum++}`;
        return {
          name: r.name,
          contact: r.contact,
          email: r.email || '',
          gstin: r.gstin || '',
          type: (r.type || 'dealer').toLowerCase(),
          credit_limit: Number(r.credit_limit || 0),
          outstanding: Number(r.outstanding || 0),
          address: r.address || '',
          salesperson: r.salesperson || '',
          uoi,
        };
      });

      const { error } = await supabase.from('customers').insert(customersToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customers imported successfully');
    },
    onError: (error: any) => {
      toast.error(`Error importing customers: ${error.message}`);
    },
  });
};

export const useBulkAddSuppliers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Record<string, any>[]) => {
      const { data: existingSuppliers } = await supabase.from('suppliers').select('uoi');
      const nums = (existingSuppliers || [])
        .map((s) => {
          const m = s.uoi?.match(/GW-SUPP-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      let nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1001;

      const suppliersToInsert = rows.map((r) => {
        const uoi = r.uoi || `GW-SUPP-${nextNum++}`;
        return {
          name: r.name,
          contact: r.contact,
          email: r.email || '',
          gstin: r.gstin || '',
          type: r.type || 'Manufacturer',
          outstanding: Number(r.outstanding || 0),
          address: r.address || '',
          uoi,
        };
      });

      const { error } = await supabase.from('suppliers').insert(suppliersToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Suppliers imported successfully');
    },
    onError: (error: any) => {
      toast.error(`Error importing suppliers: ${error.message}`);
    },
  });
};

export const useBulkAddProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Record<string, any>[]) => {
      const productsToInsert = rows.map((r) => ({
        name: r.name,
        battery_model: r.battery_model || r.name,
        voltage: r.voltage || '12V',
        ah: r.ah || '100Ah',
        sku: r.sku || `GW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        hsn: r.hsn || '8507',
        category: r.category || 'Automotive',
        technology: r.technology || 'Flooded (Lead-Acid)',
        purchase_price: Number(r.purchase_price || 0),
        selling_price: Number(r.selling_price || 0),
        stock: Number(r.stock || 0),
        stable_stock: Number(r.stable_stock || 20),
      }));

      const { error } = await supabase.from('products').insert(productsToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Products imported successfully');
    },
    onError: (error: any) => {
      toast.error(`Error importing products: ${error.message}`);
    },
  });
};

export const useBulkAddWarranties = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Record<string, any>[]) => {
      const warrantiesToInsert = rows.map((r, i) => {
        const purchaseDate = r.purchase_date || new Date().toISOString().split('T')[0];
        const expiryDate = r.warranty_expiry || (() => {
          const d = new Date(purchaseDate);
          d.setFullYear(d.getFullYear() + 2);
          return d.toISOString().split('T')[0];
        })();

        return {
          warranty_id: r.warranty_id || `WTY-${Date.now().toString().slice(-4)}${i + 1}`,
          serial_number: r.serial_number,
          battery_model: r.battery_model,
          product_name: r.product_name || r.battery_model,
          customer_name: r.customer_name,
          customer_id: r.customer_id || '',
          purchase_date: purchaseDate,
          warranty_expiry: expiryDate,
          status: (r.status || 'active').toLowerCase(),
          notes: r.notes || 'Bulk imported warranty record',
        };
      });

      const { error } = await supabase.from('battery_warranties').insert(warrantiesToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Warranties imported successfully');
    },
    onError: (error: any) => {
      toast.error(`Error importing warranties: ${error.message}`);
    },
  });
};
