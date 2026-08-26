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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#252624] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#cde06c]" /> Log Return (Credit / Debit Note)
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Updates inventory stock & party ledger balances automatically
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Return Note Type</label>
              <select
                value={returnType}
                onChange={(e) => {
                  const t = e.target.value as ReturnType;
                  setReturnType(t);
                  setPartyId(t === 'credit' ? customers[0]?.id || '' : suppliers[0]?.id || '');
                }}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                <option value="credit">Credit Note (Sales Return from Customer)</option>
                <option value="debit">Debit Note (Purchase Return to Supplier)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">
              {returnType === 'credit' ? 'Select Customer' : 'Select Supplier'}
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              required
            >
              {returnType === 'credit'
                ? customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.uoi})
                    </option>
                  ))
                : suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Returned Battery Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.voltage} {p.ah})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Qty Returned</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Reason for Return</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Low gravity / Dead cell / Transit damage"
              className="w-full glass-input px-3 py-2 text-xs font-bold"
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
              <CheckCircle className="w-4 h-4" /> Issue Return Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
