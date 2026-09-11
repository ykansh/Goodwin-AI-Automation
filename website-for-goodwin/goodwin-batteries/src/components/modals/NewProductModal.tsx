import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { X, PackagePlus, CheckCircle } from 'lucide-react';

interface NewProductModalProps {
  onClose: () => void;
}

export function NewProductModal({ onClose }: NewProductModalProps) {
  const { addProduct, settings } = useData();

  const [name, setName] = useState('Endura N150');
  const [batteryModel, setBatteryModel] = useState('Endura N150');
  const [voltage, setVoltage] = useState('12V');
  const [ah, setAh] = useState('150Ah');
  const [sku, setSku] = useState('GW-N150');
  const [hsn, setHsn] = useState('8507');
  const [category, setCategory] = useState('Automotive');
  const [technology, setTechnology] = useState('Flooded (Lead-Acid)');
  const [purchasePrice, setPurchasePrice] = useState(9500);
  const [sellingPrice, setSellingPrice] = useState(12500);
  const [stock, setStock] = useState(25);
  const [warehouseRack, setWarehouseRack] = useState(settings.battery_configs.warehouses[0] || 'Warehouse A / Rack-04');
  const [warrantyMonths, setWarrantyMonths] = useState(18);
  const [gstPercent, setGstPercent] = useState(18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    addProduct({
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
                <PackagePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Add Goodwin Battery Product</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Configure technical battery specifications, warranty, warehouse rack, and pricing
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
            {/* Card 1: Commercial Identity & Technical Specs */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Commercial Brand & Technical Specifications
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Model name, capacity rating, voltage class, and battery classification</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Commercial Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Goodwin Gold 150Ah Tall Tubular"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Model Series <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={batteryModel}
                    onChange={(e) => setBatteryModel(e.target.value)}
                    placeholder="e.g. GW-TT1500"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Product SKU Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="GW-150-TT"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Voltage Class
                  </label>
                  <select
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    {settings.battery_configs.voltages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Capacity (Ah)
                  </label>
                  <select
                    value={ah}
                    onChange={(e) => setAh(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    {settings.battery_configs.ah_ratings.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Market Segment
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    <option value="Automotive">Automotive</option>
                    <option value="Tubular / Inverter">Tubular / Inverter</option>
                    <option value="Solar / VRLA">Solar / VRLA</option>
                    <option value="E-Rickshaw">E-Rickshaw</option>
                    <option value="Motorcycle / 2W">Motorcycle / 2W</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Battery Technology
                  </label>
                  <select
                    value={technology}
                    onChange={(e) => setTechnology(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    <option value="Flooded (Lead-Acid)">Flooded (Lead-Acid)</option>
                    <option value="Tall Tubular">Tall Tubular</option>
                    <option value="AGM VRLA">AGM VRLA</option>
                    <option value="Gel Electrolyte">Gel Electrolyte</option>
                    <option value="Lithium-Ion (LFP)">Lithium-Ion (LFP)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Pricing, Inventory & Warehouse Storage */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Pricing, Warranty & Warehouse Storage
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Commercial rates, tax brackets, warranty duration, and bay rack location</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Purchase Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold text-[#00a631] dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Initial Stock (Pcs)
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Warranty (Months)
                  </label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    placeholder="18"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    GST Bracket
                  </label>
                  <select
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={5}>5% GST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Warehouse Rack / Bay Location
                  </label>
                  <input
                    type="text"
                    value={warehouseRack}
                    onChange={(e) => setWarehouseRack(e.target.value)}
                    placeholder="WH-A / RACK-04"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold uppercase"
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
              <span>Save Battery Product</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
