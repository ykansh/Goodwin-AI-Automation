import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { ReturnType } from '../../types';
import { X, RotateCcw, CheckCircle } from 'lucide-react';

interface NewReturnModalProps {
  onClose: () => void;
}

export function NewReturnModal({ onClose }: NewReturnModalProps) {
  const { customers, suppliers, products, invoices, purchases, createReturn } = useData();

  const [returnType, setReturnType] = useState<ReturnType>('credit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyId, setPartyId] = useState(customers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Manufacturing defect in terminal / cell');

  const selectedParty = returnType === 'credit'
    ? customers.find((c) => c.id === partyId)
    : suppliers.find((s) => s.id === partyId);

  const selectedProd = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParty || !selectedProd) return;

    const rate = returnType === 'credit' ? selectedProd.selling_price : selectedProd.purchase_price;
    const taxable = quantity * rate;
    const gstVal = Math.round((taxable * selectedProd.gst_percent) / 100);
    const grandTotal = taxable + gstVal;

    createReturn({
      date,
      type: returnType,
      party_name: selectedParty.name,
      party_id: selectedParty.id,
      party_type: returnType === 'credit' ? 'customer' : 'supplier',
      items: [
        {
          id: 'ret-item-1',
          product_id: selectedProd.id,
          product_name: selectedProd.name,
          quantity: Number(quantity),
          rate,
          amount: taxable,
        },
      ],
      taxable_amount: taxable,
      gst_amount: gstVal,
      amount: grandTotal,
      reason,
      status: 'processed',
      linked_invoice_id: returnType === 'credit' ? (invoices[0]?.id || 'si1') : (purchases[0]?.id || 'po1'),
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
                <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Issue Return Note (Credit / Debit Note)</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Updates central inventory stock & party ledger balances automatically
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
            {/* Card 1: Return Parameters & Party */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Return Classification & Counterparty
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select credit or debit return note type and corresponding customer/supplier</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Return Note Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => {
                      const t = e.target.value as ReturnType;
                      setReturnType(t);
                      setPartyId(t === 'credit' ? customers[0]?.id || '' : suppliers[0]?.id || '');
                    }}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold bg-white dark:bg-[#1a1d1a]"
                  >
                    <option value="credit">Credit Note (Sales Return from Customer)</option>
                    <option value="debit">Debit Note (Purchase Return to Supplier)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Return Document Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    {returnType === 'credit' ? 'Customer / Dealer Party' : 'Supplier / Vendor Party'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold bg-white dark:bg-[#1a1d1a]"
                  >
                    {returnType === 'credit'
                      ? customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.uoi || c.id}) — Outstanding: ₹{c.outstanding.toLocaleString('en-IN')}
                          </option>
                        ))
                      : suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — Outstanding Payable: ₹{s.outstanding.toLocaleString('en-IN')}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Returned Battery & Reason */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Returned Battery SKU & Reason
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Item specification, quantity returned, and technical defect remarks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Battery Model / SKU <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.voltage} {p.ah}) — Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Qty Returned <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold text-center"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Reason for Return / Quality Claim Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Low specific gravity / Dead cell / Transit damage..."
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
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
              <span>Issue Return Note</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
