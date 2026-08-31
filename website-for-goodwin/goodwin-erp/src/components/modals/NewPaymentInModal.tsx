import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { PaymentMode } from '../../types';
import { X, ArrowDownLeft, CheckCircle } from 'lucide-react';

interface NewPaymentInModalProps {
  onClose: () => void;
}

export function NewPaymentInModal({ onClose }: NewPaymentInModalProps) {
  const { customers, createPaymentIn } = useData();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bank');
  const [reference, setReference] = useState('UTR-88991122');
  const [amount, setAmount] = useState(50000);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || amount <= 0) return;

    createPaymentIn({
      date,
      party_name: selectedCustomer.name,
      party_id: selectedCustomer.id,
      party_type: 'customer',
      payment_mode: paymentMode,
      reference,
      amount: Number(amount),
    });

    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in">
      {/* 4. Page Header (Height 56-70px, max-w-1200px aligned) */}
      <header className="shrink-0 h-16 sm:h-[68px] bg-white dark:bg-[#1a1d1a] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-bold"
            >
              <span>← Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-[#2d302d]" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#3a3b39] dark:text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Record Payment In (Receipt from Customer)</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Customer outstanding will decrease & Cash/Bank balance will increase automatically
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2 & 3. Scrollable Form Area with min-height: 0 flex container */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-6">
            {/* Card 1: Party Selection */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Payer / Customer Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select the customer or dealer making the settlement</p>
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Customer / Dealer Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold bg-white dark:bg-[#1a1d1a]"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.uoi || c.id}) — Outstanding: ₹{c.outstanding.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">GSTIN</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-sm">{selectedCustomer.gstin || 'Unregistered'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Contact</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{selectedCustomer.contact}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Current Receivables</span>
                    <span className="font-black text-red-600 dark:text-red-400 text-sm">₹{selectedCustomer.outstanding.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Credit Limit</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">₹{selectedCustomer.credit_limit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Receipt Parameters */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Payment Transaction & Mode
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mode of collection, payment date, banking UTR and receipt amount</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold bg-white dark:bg-[#1a1d1a] capitalize"
                  >
                    <option value="bank">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="upi">UPI / QR Code Scan</option>
                    <option value="cash">Cash In Hand</option>
                    <option value="cheque">Cheque Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Bank Reference / UTR / Cheque No.
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. UTR-88991122"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Amount Received (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm font-black text-gray-800 dark:text-white glass-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10, 11, 12. Sticky Action Bar */}
        <div className="shrink-0 bg-white dark:bg-[#1a1d1a] border-t border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm z-10">
          <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="h-10 sm:h-11 px-5 rounded-xl border border-gray-300 dark:border-[#2d302d] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl bg-[#00a631] hover:bg-[#008a29] text-white text-sm font-extrabold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Issue Receipt Voucher</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
