import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function RealtimeSubscriber() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('goodwin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_invoices' }, () => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger_entries' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battery_warranties' }, () => {
        queryClient.invalidateQueries({ queryKey: ['warranties'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, () => {
        queryClient.invalidateQueries({ queryKey: ['returns'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_activities' }, () => {
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hrms_employees' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hrms_employees'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hrms_attendance' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hrms_attendance'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hrms_projects' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hrms_projects'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hrms_tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hrms_tasks'] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
