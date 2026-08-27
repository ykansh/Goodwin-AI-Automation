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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#252624] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-[#cde06c]" /> Take Payment Out
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Supplier outstanding payable will decrease & Cash/Bank balance will adjust
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Select Supplier / Vendor</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - Current Payable: ₹{s.outstanding.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Voucher Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70 capitalize"
              >
                <option value="bank">Bank Transfer / NEFT / RTGS</option>
                <option value="upi">UPI / QR Code</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash in Hand</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Reference # / UTR / Voucher #</label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UTR-11223344"
              className="w-full glass-input px-3 py-2 text-xs font-bold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Amount Paid (₹)</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full glass-input px-3 py-2.5 text-base font-extrabold text-[#3a3b39]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#00a631] text-white text-xs font-extrabold rounded-xl shadow hover:bg-[#008a29] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Issue Payment Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
