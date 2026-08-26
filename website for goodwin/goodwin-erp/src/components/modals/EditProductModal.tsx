import { useState } from 'react';
import type { Product } from '../../types';
import { useData } from '../../store/DataContext';
import { X, Edit3, CheckCircle } from 'lucide-react';

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const { updateProduct, settings } = useData();

  if (!product) return null;

  const [name, setName] = useState(product.name);
  const [batteryModel, setBatteryModel] = useState(product.battery_model);
  const [voltage, setVoltage] = useState(product.voltage);
  const [ah, setAh] = useState(product.ah);
  const [sku, setSku] = useState(product.sku);
  const [hsn, setHsn] = useState(product.hsn);
  const [category, setCategory] = useState(product.category);
  const [technology, setTechnology] = useState(product.technology);
  const [purchasePrice, setPurchasePrice] = useState(product.purchase_price);
  const [sellingPrice, setSellingPrice] = useState(product.selling_price);
  const [stock, setStock] = useState(product.stock);
  const [warehouseRack, setWarehouseRack] = useState(product.warehouse_rack);
  const [warrantyMonths, setWarrantyMonths] = useState(product.warranty_months);
  const [gstPercent, setGstPercent] = useState(product.gst_percent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProduct(product.id, {
      name,
      battery_model: batteryModel,
      voltage,
      ah,
      sku,
      hsn,
      category,
      technology,
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      stock: Number(stock),
      warehouse_rack: warehouseRack,
      warranty_months: Number(warrantyMonths),
      gst_percent: Number(gstPercent),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#252624] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#cde06c]" /> Edit Battery Product Details
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Modify pricing, stock level & warehouse specifications for {product.name}
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
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Product Name & Spec</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Battery Model</label>
              <input
                type="text"
                required
                value={batteryModel}
                onChange={(e) => setBatteryModel(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Voltage</label>
              <select
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                {settings.battery_configs.voltages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Ah Rating</label>
              <select
                value={ah}
                onChange={(e) => setAh(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                {settings.battery_configs.ah_ratings.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">HSN Code</label>
              <input
                type="text"
                value={hsn}
                onChange={(e) => setHsn(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                <option value="Automotive">Automotive</option>
                <option value="Two Wheeler">Two Wheeler</option>
                <option value="Solar & Inverter">Solar & Inverter</option>
                <option value="Industrial & Telecom">Industrial & Telecom</option>
                <option value="E-Bike / EV">E-Bike / EV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Technology & Chemistry</label>
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                <option value="Flooded (Lead-Acid)">Flooded (Lead-Acid)</option>
                <option value="VRLA / AGM">VRLA / AGM</option>
                <option value="Tubular (Deep Cycle)">Tubular (Deep Cycle)</option>
                <option value="Gel Sealed">Gel Sealed</option>
                <option value="LiFePO4 Lithium">LiFePO4 Lithium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Cost Price (₹)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold text-[#00a631]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Current Stock Qty</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Warehouse / Rack</label>
              <select
                value={warehouseRack}
                onChange={(e) => setWarehouseRack(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                {settings.battery_configs.warehouses.map((wh) => (
                  <option key={wh} value={wh}>
                    {wh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Warranty (Months)</label>
              <input
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">GST Tax %</label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
                <option value={12}>12% GST</option>
                <option value={5}>5% GST</option>
              </select>
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
              className="flex items-center gap-1.5 px-5 py-2 bg-[#00a631] text-white text-xs font-extrabold rounded-xl shadow hover:bg-[#008a29] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Save Modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
