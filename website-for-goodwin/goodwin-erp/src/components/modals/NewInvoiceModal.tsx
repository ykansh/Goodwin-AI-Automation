import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { X, Plus, Trash2, Calculator, CheckCircle } from 'lucide-react';

interface NewInvoiceModalProps {
  onClose: () => void;
}

export function NewInvoiceModal({ onClose }: NewInvoiceModalProps) {
  const { customers, products, createSalesInvoice } = useData();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceType, setInvoiceType] = useState('GST Tax Invoice');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialPayment, setInitialPayment] = useState(0);

  const [items, setItems] = useState<
    { product_id: string; quantity: number; rate: number; gst_percent: number }[]
  >([
    {
      product_id: products[0]?.id || '',
      quantity: 10,
      rate: products[0]?.selling_price || 3200,
      gst_percent: products[0]?.gst_percent || 28,
    },
  ]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleAddItem = () => {
    if (products.length === 0) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        quantity: 1,
        rate: p.selling_price,
        gst_percent: p.gst_percent,
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
              updated.rate = p.selling_price;
              updated.gst_percent = p.gst_percent;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Calculations
  const calculatedItems = items.map((item, i) => {
    const prod = products.find((p) => p.id === item.product_id);
    const amount = item.quantity * item.rate;
    const gstVal = (amount * item.gst_percent) / 100;
    return {
      id: `item-${i}`,
      product_id: item.product_id,
      product_name: prod ? `${prod.name} (${prod.voltage} ${prod.ah})` : 'Battery Unit',
      sku: prod?.sku || 'GW-N150',
      hsn: prod?.hsn || '8507',
      quantity: item.quantity,
      rate: item.rate,
      gst_percent: item.gst_percent,
      amount,
      gstVal,
    };
  });

  const taxableTotal = calculatedItems.reduce((acc, curr) => acc + curr.amount, 0);
  const gstTotal = calculatedItems.reduce((acc, curr) => acc + curr.gstVal, 0);
  const grandTotal = taxableTotal + gstTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    createSalesInvoice({
      date,
      invoice_type: invoiceType,
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      items: calculatedItems,
      taxable_amount: taxableTotal,
      gst_amount: gstTotal,
      grand_total: grandTotal,
      status: initialPayment >= grandTotal ? 'paid' : initialPayment > 0 ? 'partial' : 'pending',
      initial_payment: Number(initialPayment),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#00a631] to-[#008a29] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#cde06c]" /> Create New Sales Invoice
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Goodwin ERP Real-time Module Sync: Stock, Customer Ledger & Sales will auto-update
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {c.name} ({c.uoi}) - Outstanding: ₹{c.outstanding.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Invoice Document Type</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                <option value="GST Tax Invoice">GST Tax Invoice</option>
                <option value="Retail Invoice">Retail Invoice</option>
                <option value="Export Invoice">Export Invoice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Invoice Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
                required
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#3a3b39] uppercase tracking-wider">
                Battery Items & Specs
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-bold text-[#00a631] hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Item Line
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
                          {p.name} ({p.voltage} {p.ah} - Stock: {p.stock})
                        </option>
                      ))}
                    </select>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="w-full glass-input px-2 py-1.5 text-xs font-bold text-center"
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                        placeholder="Rate ₹"
                        className="w-full glass-input px-2 py-1.5 text-xs font-bold text-right"
                      />
                    </div>

                    <div className="w-20 text-xs font-bold text-gray-500 text-center">
                      GST {item.gst_percent}%
                    </div>

                    <div className="w-32 text-right text-xs font-extrabold text-[#3a3b39]">
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

          {/* Payment & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 p-4 rounded-2xl border border-white/60">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">
                Immediate Payment Received (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(Number(e.target.value))}
                  placeholder="0"
                  className="w-full glass-input pl-7 pr-3 py-2 text-xs font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Any amount entered here will be credited to Bank and decrease customer outstanding balance.
              </p>
            </div>

            <div className="text-right space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Taxable Amount:</span>
                <span className="font-bold">₹{taxableTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST Total:</span>
                <span className="font-bold">₹{gstTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#00a631] pt-1 border-t border-gray-200">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#00a631] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 hover:bg-[#008a29] transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Issue Invoice & Update Modules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
