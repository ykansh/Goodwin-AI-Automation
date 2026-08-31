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
                <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Create Purchase Order (Inward Supply)</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Stock counts will automatically increase & Supplier payables will update in real time
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
            {/* Card 1: Supplier & Date */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Vendor & Purchase Date
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select supplier account and purchase order entry date</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Supplier / Vendor <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Purchase / Inward Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                    required
                  />
                </div>
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

            {/* Card 2: Inward Items */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    2. Inward Battery Inventory Items
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Specify battery SKUs, incoming quantities, and supplier agreed rates</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Item Line
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50/80 dark:bg-[#202420] border border-gray-200 dark:border-[#2d302d] grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
                  >
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">Goodwin Product SKU</label>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full h-10 px-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2d302d] bg-white dark:bg-[#1a1d1a]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock}, Cost: ₹{p.purchase_price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">Inward Qty (Pcs)</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full h-10 px-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2d302d] bg-white dark:bg-[#1a1d1a] text-center"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">Purchase Rate (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                        className="w-full h-10 px-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2d302d] bg-white dark:bg-[#1a1d1a]"
                      />
                    </div>

                    <div className="md:col-span-2 text-right">
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">Line Amount</label>
                      <div className="font-black text-sm text-[#00a631] py-2">
                        ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="md:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Purchase Total Summary */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#202420] border border-gray-200 dark:border-[#2d302d] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Subtotal Taxable:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">₹{taxableTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Estimated GST (18%):</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">₹{gstTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#00a631] pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Grand Total PO Amount:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
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
              <span>Save Purchase Order</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
