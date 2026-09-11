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
