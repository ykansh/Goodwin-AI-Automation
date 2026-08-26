import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { X, ShieldCheck, CheckCircle } from 'lucide-react';

interface NewWarrantyModalProps {
  onClose: () => void;
}

export function NewWarrantyModal({ onClose }: NewWarrantyModalProps) {
  const { customers, products, registerWarranty } = useData();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [serialNumber, setSerialNumber] = useState(`GW-${Date.now().toString().slice(-6)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Standard 18-month battery replacement warranty');

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProduct) return;

    // Calculate warranty expiry based on product warranty_months
    const pDate = new Date(purchaseDate);
    pDate.setMonth(pDate.getMonth() + (selectedProduct.warranty_months || 18));
    const expiryStr = pDate.toISOString().split('T')[0];

    registerWarranty({
      battery_model: selectedProduct.battery_model,
      serial_number: serialNumber,
      product_name: selectedProduct.name,
      customer_name: selectedCustomer.name,
      customer_id: selectedCustomer.id,
      purchase_date: purchaseDate,
      warranty_expiry: expiryStr,
      status: 'active',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#00a631] to-[#008a29] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#cde06c]" /> Register Battery Warranty
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Link serial number to customer & calculate warranty expiry
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
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Select Customer / Dealer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.uoi})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Select Goodwin Battery Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.voltage} {p.ah} - {p.warranty_months} Months Warranty)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Battery Serial Number</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN-100099"
                className="w-full glass-input px-3 py-2 text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Sale / Purchase Date</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Warranty Notes / Terms</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Standard replacement warranty"
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
              <CheckCircle className="w-4 h-4" /> Issue Warranty Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
