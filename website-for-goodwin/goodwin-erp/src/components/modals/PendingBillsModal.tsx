import { useState } from 'react';
import type { Customer, SalesInvoice } from '../../types';
import { calculateCustomerPendingBills, persistCustomerCreditTerms } from '../../utils/creditTermsStorage';
import type { PendingBillItem } from '../../utils/creditTermsStorage';
import { useQueryClient } from '@tanstack/react-query';
import { 
  X, Receipt, Calendar, AlertTriangle, CheckCircle2, Clock, 
  DollarSign, ArrowDownLeft, Printer 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingBillsModalProps {
  customer: Customer;
  invoices: SalesInvoice[];
  onClose: () => void;
  onOpenPaymentIn?: (customer: Customer, suggestedAmount?: number) => void;
}

export function PendingBillsModal({
  customer,
  invoices,
  onClose,
  onOpenPaymentIn,
}: PendingBillsModalProps) {
  const queryClient = useQueryClient();
  const pendingBills = calculateCustomerPendingBills(customer, invoices);
  const totalPending = pendingBills.reduce((acc, b) => acc + b.pending_amount, 0);
  const totalOverdue = pendingBills
    .filter((b) => b.status === 'Overdue')
    .reduce((acc, b) => acc + b.pending_amount, 0);

  const [editingCommitmentBillId, setEditingCommitmentBillId] = useState<string | null>(null);
  const [commitmentInput, setCommitmentInput] = useState('');

  const handleUpdateCommitment = async (bill: PendingBillItem) => {
    if (!commitmentInput) return;
    try {
      // Update customer commitment date
      await persistCustomerCreditTerms(customer.id, {
        payment_commitment_date: commitmentInput,
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Commitment date for ${bill.bill_number} set to ${commitmentInput}`);
      setEditingCommitmentBillId(null);
    } catch {
      toast.error('Failed to update commitment date');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#181a18] border border-gray-200 dark:border-[#2d302d] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 dark:border-[#2d302d] flex items-center justify-between bg-gray-50/80 dark:bg-[#1f221f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-[#00a631] flex items-center justify-center border border-[#00a631]/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  Pending Bills — {customer.name}
                </h2>
                <span className="font-mono text-xs font-extrabold text-[#00a631] bg-emerald-500/10 px-2 py-0.5 rounded border border-[#00a631]/20">
                  {customer.uoi}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Fixed Credit Term: <span className="font-bold text-gray-700 dark:text-gray-200">{customer.fixed_credit_terms || '30 Days Net'}</span> • Payment Cycle: <span className="font-bold text-gray-700 dark:text-gray-200">{customer.payment_cycle || '15/30 Days'}</span> • Material Recv Time: <span className="font-bold text-gray-700 dark:text-gray-200">{customer.material_received_time || 'Within 3-5 Days'}</span> • Order Cycle: <span className="font-bold text-gray-700 dark:text-gray-200">{customer.order_cycle || 'Weekly'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50/40 dark:bg-[#141614] border-b border-gray-200 dark:border-[#2d302d]">
          <div className="p-3 bg-white dark:bg-[#1e211e] rounded-lg border border-gray-200/70 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Outstanding</span>
            <div className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5">
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-[#1e211e] rounded-lg border border-gray-200/70 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Overdue Amount</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              ₹{totalOverdue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-[#1e211e] rounded-lg border border-gray-200/70 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Credit Limit</span>
            <div className="text-lg font-black text-gray-900 dark:text-gray-100 mt-0.5">
              ₹{customer.credit_limit.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-[#1e211e] rounded-lg border border-gray-200/70 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Committed Payment Date</span>
            <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1 truncate">
              {customer.payment_commitment_date || 'No Date Committed'}
            </div>
          </div>
        </div>

        {/* Bills Table Container */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {pendingBills.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CheckCircle2 className="w-12 h-12 text-[#00a631] mx-auto opacity-70 mb-3" />
              <h3 className="text-base font-extrabold text-gray-800 dark:text-gray-200">No Pending Bills</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                All invoices for this customer have been completely cleared or no outstanding balance remains.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#2d302d]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/80 dark:bg-[#202420] text-gray-600 dark:text-gray-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-[#2d302d]">
                  <tr>
                    <th className="px-4 py-3">Bill / Invoice #</th>
                    <th className="px-4 py-3">Bill Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Bill Amount</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Pending Amount</th>
                    <th className="px-4 py-3 text-center">Status / Overdue</th>
                    <th className="px-4 py-3">Commitment Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#252825]">
                  {pendingBills.map((bill) => (
                    <tr 
                      key={bill.id} 
                      className={`hover:bg-gray-50/70 dark:hover:bg-[#1e221e] transition-colors ${
                        bill.status === 'Overdue' ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                      }`}
                    >
                      {/* Bill Number */}
                      <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{bill.bill_number}</span>
                          {bill.is_opening_balance && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-sans font-bold border border-amber-500/20">
                              Ledger Bal
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bill Date */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {bill.bill_date}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold whitespace-nowrap">
                        {bill.due_date}
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Paid Amount */}
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        ₹{bill.paid_amount.toLocaleString('en-IN')}
                      </td>

                      {/* Pending Amount */}
                      <td className="px-4 py-3 text-right font-black text-red-600 dark:text-red-400 text-sm whitespace-nowrap">
                        ₹{bill.pending_amount.toLocaleString('en-IN')}
                      </td>

                      {/* Status / Overdue */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {bill.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                            <AlertTriangle className="w-3 h-3" />
                            {bill.overdue_days}d Overdue
                          </span>
                        ) : bill.status === 'Due Today' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            Due Today
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/50 text-[#00a631] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            On Time
                          </span>
                        )}
                      </td>

                      {/* Commitment Date with inline editor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingCommitmentBillId === bill.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={commitmentInput}
                              onChange={(e) => setCommitmentInput(e.target.value)}
                              className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 dark:border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCommitment(bill)}
                              className="px-2 py-1 bg-[#00a631] text-white text-[10px] font-bold rounded"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCommitmentBillId(null)}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingCommitmentBillId(bill.id);
                              setCommitmentInput(bill.commitment_date || '');
                            }}
                            className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#00a631] group"
                            title="Click to update commitment date"
                          >
                            <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00a631]" />
                            <span className="font-semibold underline decoration-dashed decoration-gray-300 dark:decoration-gray-600 underline-offset-2">
                              {bill.commitment_date || 'Set Commitment'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {onOpenPaymentIn && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenPaymentIn(customer, bill.pending_amount);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                          >
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>Pay Bill</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 bg-gray-50/80 dark:bg-[#1a1d1a] border-t border-gray-200 dark:border-[#2d302d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Usual Material Received Time: <span className="font-bold text-gray-700 dark:text-gray-200">{customer.material_received_time || 'Within 3-5 Days'}</span> • Order Frequency: <span className="font-bold text-gray-700 dark:text-gray-200">{customer.order_cycle || 'Weekly'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenPaymentIn && (
              <button
                type="button"
                onClick={() => {
                  onOpenPaymentIn(customer, totalPending);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-lg shadow-md shadow-[#00a631]/20 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Clear Total Outstanding (₹{totalPending.toLocaleString('en-IN')})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
