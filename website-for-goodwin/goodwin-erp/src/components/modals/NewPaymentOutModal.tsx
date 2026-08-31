import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { PaymentMode } from '../../types';
import { X, ArrowUpRight, CheckCircle } from 'lucide-react';

interface NewPaymentOutModalProps {
  onClose: () => void;
}

export function NewPaymentOutModal({ onClose }: NewPaymentOutModalProps) {
  const { suppliers, createPaymentOut } = useData();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bank');
  const [reference, setReference] = useState('UTR-77665544');
  const [amount, setAmount] = useState(75000);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || amount <= 0) return;

    createPaymentOut({
      date,
      party_name: selectedSupplier.name,
      party_id: selectedSupplier.id,
      party_type: 'supplier',
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
                <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Record Payment Out (Disbursement to Vendor)</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Supplier outstanding payable will decrease & Cash/Bank balance will adjust in real time
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
            {/* Card 1: Supplier / Payee Party */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Payee / Supplier Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select the supplier or vendor account receiving payout</p>
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Supplier / Vendor Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold bg-white dark:bg-[#1a1d1a]"
                  required
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type}) — Current Payable: ₹{s.outstanding.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSupplier && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#202420] border border-gray-200 dark:border-[#2d302d] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Vendor GSTIN</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-sm">{selectedSupplier.gstin || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Contact</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{selectedSupplier.contact}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Current Payables</span>
                    <span className="font-black text-red-600 dark:text-red-400 text-sm">₹{selectedSupplier.outstanding.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[11px] uppercase">Category</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{selectedSupplier.type}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Disbursement Parameters */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Payment Transaction & Mode
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Disbursement banking method, payout date, reference and amount</p>
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
                    <option value="upi">UPI / Vendor QR</option>
                    <option value="cash">Cash In Hand</option>
                    <option value="cheque">Cheque Issuance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Voucher / Payment Date <span className="text-red-500">*</span>
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
                    Reference # / UTR / Voucher # <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. UTR-11223344"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Amount Paid (₹) <span className="text-red-500">*</span>
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
              <span>Issue Payment Voucher</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
