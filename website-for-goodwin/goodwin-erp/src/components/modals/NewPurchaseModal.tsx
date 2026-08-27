import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { X, Plus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';

interface NewPurchaseModalProps {
  onClose: () => void;
}

export function NewPurchaseModal({ onClose }: NewPurchaseModalProps) {
  const { suppliers, products, createPurchaseOrder } = useData();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [items, setItems] = useState<
    { product_id: string; quantity: number; rate: number }[]
  >([
    {
      product_id: products[0]?.id || '',
      quantity: 20,
      rate: products[0]?.purchase_price || 9500,
    },
  ]);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleAddItem = () => {
    if (products.length === 0) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        quantity: 10,
        rate: p.purchase_price,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          if (field === 'product_id') {
            const p = products.find((prod) => prod.id === value);
            if (p) {
              updated.rate = p.purchase_price;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculatedItems = items.map((item, i) => {
    const prod = products.find((p) => p.id === item.product_id);
    const amount = item.quantity * item.rate;
    return {
      id: `po-item-${i}`,
      product_id: item.product_id,
      product_name: prod ? `${prod.name} (${prod.voltage} ${prod.ah})` : 'Battery Unit',
      sku: prod?.sku || 'GW-N150',
      quantity: item.quantity,
      rate: item.rate,
      amount,
    };
  });

  const taxableTotal = calculatedItems.reduce((acc, curr) => acc + curr.amount, 0);
  const gstTotal = Math.round(taxableTotal * 0.18); // Default GST on PO
  const grandTotal = taxableTotal + gstTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    createPurchaseOrder({
      date,
      supplier_id: selectedSupplier.id,
      supplier_name: selectedSupplier.name,
      items: calculatedItems,
      taxable_amount: taxableTotal,
      gst_amount: gstTotal,
      grand_total: grandTotal,
      status: 'received',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#252624] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#cde06c]" /> Create Purchase & PO
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Stock counts will automatically increase & Supplier payables will update
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {s.name} - Payable: ₹{s.outstanding.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">PO Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#3a3b39] uppercase tracking-wider">
                Battery Supplies & Materials
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-bold text-[#00a631] hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Purchase Line
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 glass p-2 rounded-xl border border-white/60">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                    className="flex-1 glass-input px-2.5 py-1.5 text-xs font-bold bg-white/70"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.voltage} {p.ah}) - Current Stock: {p.stock}
                      </option>
                    ))}
                  </select>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full glass-input px-2 py-1.5 text-xs font-bold text-center"
                    />
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                      placeholder="Cost ₹"
                      className="w-full glass-input px-2 py-1.5 text-xs font-bold text-right"
                    />
                  </div>

                  <div className="w-36 text-right text-xs font-extrabold text-[#3a3b39]">
                    ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/50 p-4 rounded-2xl border border-white/60 text-right space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal Taxable:</span>
              <span className="font-bold">₹{taxableTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated GST (18%):</span>
              <span className="font-bold">₹{gstTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#3a3b39] pt-1 border-t border-gray-200">
              <span>Grand Total PO Amount:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
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
              className="flex items-center gap-2 px-6 py-2.5 bg-[#00a631] text-white text-xs font-extrabold rounded-xl shadow hover:bg-[#008a29] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Log Purchase Order & Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
