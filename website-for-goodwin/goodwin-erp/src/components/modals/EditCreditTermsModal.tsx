import { useState } from 'react';
import type { Customer } from '../../types';
import { 
  CREDIT_TERM_OPTIONS, 
  PAYMENT_CYCLE_OPTIONS, 
  ORDER_CYCLE_OPTIONS, 
  MATERIAL_RECEIVED_TIME_OPTIONS 
} from '../../utils/creditTermsStorage';
import { useUpdateCustomerCreditTerms } from '../../hooks/mutations';
import { X, Clock, Check, RefreshCw } from 'lucide-react';

interface EditCreditTermsModalProps {
  customer: Customer;
  onClose: () => void;
}

export function EditCreditTermsModal({ customer, onClose }: EditCreditTermsModalProps) {
  const updateTermsMutation = useUpdateCustomerCreditTerms();

  const [fixedCreditTerms, setFixedCreditTerms] = useState(customer.fixed_credit_terms || '30 Days Net');
  const [creditLimit, setCreditLimit] = useState(customer.credit_limit || 300000);
  const [outstanding, setOutstanding] = useState(customer.outstanding || 0);
  const [paymentCommitmentDate, setPaymentCommitmentDate] = useState(customer.payment_commitment_date || '');
  const [materialReceivedTime, setMaterialReceivedTime] = useState(customer.material_received_time || 'Within 3-5 Days');
  const [paymentCycle, setPaymentCycle] = useState(customer.payment_cycle || '15/30 Days');
  const [orderCycle, setOrderCycle] = useState(customer.order_cycle || 'Weekly');
  const [creditNotes, setCreditNotes] = useState(customer.credit_notes || '');

  // Helper quick buttons for commitment date
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setPaymentCommitmentDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateTermsMutation.mutateAsync({
      id: customer.id,
      details: {
        fixed_credit_terms: fixedCreditTerms,
        credit_limit: Number(creditLimit),
        outstanding: Number(outstanding),
        payment_commitment_date: paymentCommitmentDate || undefined,
        material_received_time: materialReceivedTime,
        payment_cycle: paymentCycle,
        order_cycle: orderCycle,
        credit_notes: creditNotes,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#181a18] border border-gray-200 dark:border-[#2d302d] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 dark:border-[#2d302d] flex items-center justify-between bg-gray-50/80 dark:bg-[#1f221f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-[#00a631] flex items-center justify-center border border-[#00a631]/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Maintain Credit Terms & Payment Details
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {customer.name} <span className="font-mono text-[#00a631] font-bold">({customer.uoi})</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Current Financial Status Bar */}
          <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-400">Unpaid / Total Outstanding</span>
              <div className="text-lg font-black text-red-600 dark:text-red-400">
                ₹{Number(outstanding || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-400">Credit Limit</span>
              <div className="text-lg font-black text-gray-900 dark:text-white">
                ₹{Number(creditLimit || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Fixed Credit Terms */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Fixed Credit Terms <span className="text-red-500">*</span>
              </label>
              <select
                value={fixedCreditTerms}
                onChange={(e) => setFixedCreditTerms(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold"
              >
                {CREDIT_TERM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Standard payment duration allowed before overdue
              </span>
            </div>

            {/* 2. Credit Limit */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Credit Limit (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Maximum allowable credit exposure for this account
              </span>
            </div>

            {/* 3. Unpaid / Outstanding Balance */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Unpaid / Outstanding Amount (₹)
              </label>
              <input
                type="number"
                value={outstanding}
                onChange={(e) => setOutstanding(Number(e.target.value))}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold text-red-600 dark:text-red-400"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Customer-wise total unpaid outstanding balance
              </span>
            </div>

            {/* 3. Payment Cycle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Payment Cycle (Pattern) <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentCycle}
                onChange={(e) => setPaymentCycle(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold"
              >
                {PAYMENT_CYCLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Customer's regular payment cadence (e.g. Weekly, 10 Days, Bill-to-Bill)
              </span>
            </div>

            {/* 4. Order Cycle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Order Cycle (Frequency) <span className="text-red-500">*</span>
              </label>
              <select
                value={orderCycle}
                onChange={(e) => setOrderCycle(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold"
              >
                {ORDER_CYCLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                How often this customer generally places orders
              </span>
            </div>

            {/* 5. Material Received Time */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Material Received Time
              </label>
              <select
                value={materialReceivedTime}
                onChange={(e) => setMaterialReceivedTime(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold"
              >
                {MATERIAL_RECEIVED_TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Usual time taken from material receipt to payment processing
              </span>
            </div>

            {/* 6. Payment Commitment Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Payment Commitment Date
              </label>
              <input
                type="date"
                value={paymentCommitmentDate}
                onChange={(e) => setPaymentCommitmentDate(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm glass-input font-bold"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(3)}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(15)}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  +15 Days
                </button>
                {paymentCommitmentDate && (
                  <button
                    type="button"
                    onClick={() => setPaymentCommitmentDate('')}
                    className="px-2 py-0.5 text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Special Credit Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Special Credit Terms & Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={creditNotes}
              onChange={(e) => setCreditNotes(e.target.value)}
              placeholder="e.g. Approved for extended 45-day credit during peak festival season by Director..."
              className="w-full p-3 text-xs sm:text-sm glass-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 dark:border-[#2d302d] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTermsMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-lg shadow-md shadow-[#00a631]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {updateTermsMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Credit Terms</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
