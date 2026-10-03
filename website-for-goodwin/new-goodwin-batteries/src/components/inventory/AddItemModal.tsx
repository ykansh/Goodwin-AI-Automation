'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Barcode, Package, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockItem } from '@/lib/mockData';
import { GST_RATES, DEFAULT_UNITS } from '@/lib/constants';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MockItem | null;
}

const COMMON_HSN_CODES = [
  { code: '8507', desc: 'Electric Accumulators / Batteries (28%)' },
  { code: '8504', desc: 'Electrical Transformers / Inverters (18%)' },
  { code: '8541', desc: 'Solar Cells / Solar Panels (12%)' },
  { code: '8471', desc: 'Computers & POS Terminals (18%)' },
  { code: '2853', desc: 'Distilled / Battery Water (18%)' },
  { code: '9983', desc: 'Installation & Technical Services (18%)' },
];

export default function AddItemModal({ isOpen, onClose, editItem }: AddItemModalProps) {
  const { addItem, updateItem, items } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Inverter Batteries');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [hsnCode, setHsnCode] = useState('8507');
  const [unit, setUnit] = useState('PCS');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salesPrice, setSalesPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [taxRate, setTaxRate] = useState<number>(28);
  const [godown, setGodown] = useState('Main Warehouse');
  const [showInStore, setShowInStore] = useState(true);

  // Populate if editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setSku(editItem.sku);
      setBarcode(editItem.barcode);
      setHsnCode(editItem.hsnCode);
      setUnit(editItem.unit);
      setPurchasePrice(editItem.purchasePrice);
      setSalesPrice(editItem.salesPrice);
      setMrp(editItem.mrp);
      setStock(editItem.stock);
      setMinStockAlert(editItem.minStockAlert);
      setTaxRate(editItem.taxRate);
      setGodown(editItem.godown);
    } else {
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`);
      setPurchasePrice(0);
      setSalesPrice(0);
      setMrp(0);
      setStock(10);
      setMinStockAlert(5);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    setBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an Item Name');
      return;
    }

    if (editItem) {
      updateItem(editItem.id, {
        name,
        category,
        sku,
        barcode,
        hsnCode,
        unit,
        purchasePrice: Number(purchasePrice),
        salesPrice: Number(salesPrice),
        mrp: Number(mrp),
        stock: Number(stock),
        minStockAlert: Number(minStockAlert),
        taxRate: Number(taxRate),
        godown,
      });
    } else {
      addItem({
        name,
        category,
        sku,
        barcode,
        hsnCode,
        unit,
        purchasePrice: Number(purchasePrice),
        salesPrice: Number(salesPrice),
        mrp: Number(mrp),
        stock: Number(stock),
        minStockAlert: Number(minStockAlert),
        taxRate: Number(taxRate),
        godown,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c3cce] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Package size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {editItem ? 'Edit Item Details' : 'Add New Item / Product'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Item master with barcode, GST rate &amp; multi-warehouse tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* General Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-[#4c3cce]">
              General Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 12V 150Ah Tubular Inverter Battery"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                >
                  <option value="Inverter Batteries">Inverter Batteries</option>
                  <option value="Solar Batteries">Solar Batteries</option>
                  <option value="Inverters">Inverters</option>
                  <option value="Solar Panels">Solar Panels</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            {/* SKU & Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU / Item Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. BAT-150-TT"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1 flex justify-between">
                  <span>Barcode (EAN / Code128)</span>
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="text-[#4c3cce] hover:underline font-normal text-[10px] flex items-center gap-1"
                  >
                    <Barcode size={12} />
                    <span>Auto-generate</span>
                  </button>
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>
            </div>

            {/* HSN Code & Common Suggestions */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HSN / SAC Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  placeholder="e.g. 8507"
                  className="w-36 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
                <div className="flex flex-wrap gap-1.5 items-center">
                  {COMMON_HSN_CODES.slice(0, 3).map((item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => setHsnCode(item.code)}
                      className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-mono transition-colors"
                    >
                      {item.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & GST Slab */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-[#db631a]">
              Pricing &amp; Tax Structure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purchase Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sales / Wholesale (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Retail MRP (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GST Tax Rate</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                >
                  {GST_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}% GST
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stock, Godown & Units */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-[#059f74]">
              Inventory &amp; Warehousing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                >
                  {DEFAULT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Low Stock Alert Qty</label>
                <input
                  type="number"
                  min="1"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Godown</label>
                <select
                  value={godown}
                  onChange={(e) => setGodown(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                >
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Shop Counter">Shop Counter</option>
                </select>
              </div>
            </div>

            {/* Toggle show in online store */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <div>
                <p className="font-semibold text-slate-800">Show in Online Digital Store</p>
                <p className="text-[11px] text-slate-500">Allow customers to view and order this product online</p>
              </div>
              <input
                type="checkbox"
                checked={showInStore}
                onChange={(e) => setShowInStore(e.target.checked)}
                className="w-4 h-4 text-[#4c3cce] rounded accent-[#4c3cce]"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Check size={16} />
              <span>{editItem ? 'Update Item' : 'Save Item to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
