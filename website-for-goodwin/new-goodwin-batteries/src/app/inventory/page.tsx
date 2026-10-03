'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddItemModal from '@/components/inventory/AddItemModal';
import StockAdjustModal from '@/components/inventory/StockAdjustModal';
import BarcodePrintModal from '@/components/inventory/BarcodePrintModal';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import { useApp } from '@/context/AppContext';
import { MockItem } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Barcode,
  Edit2,
  RefreshCw,
  Trash2,
  Warehouse,
  TrendingDown,
  History,
  FileSpreadsheet,
} from 'lucide-react';

export default function InventoryPage() {
  const { items, stockLogs, deleteItem, business, addInvoice } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedGodown, setSelectedGodown] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL');
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'HISTORY'>('ITEMS');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MockItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<MockItem | null>(null);
  const [barcodeItem, setBarcodeItem] = useState<MockItem | null>(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Calculations
  const totalStockValue = items.reduce((acc, i) => acc + i.stock * i.purchasePrice, 0);
  const totalRetailValue = items.reduce((acc, i) => acc + i.stock * i.salesPrice, 0);
  const lowStockCount = items.filter((i) => i.stock <= i.minStockAlert).length;
  const categories = Array.from(new Set(items.map((i) => i.category)));

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery) ||
      item.hsnCode.includes(searchQuery);

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesGodown = selectedGodown === 'ALL' || item.godown === selectedGodown;

    const matchesStock =
      stockFilter === 'ALL'
        ? true
        : stockFilter === 'LOW'
        ? item.stock <= item.minStockAlert
        : item.stock > item.minStockAlert;

    return matchesSearch && matchesCategory && matchesGodown && matchesStock;
  });

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Item Master &amp; Inventory
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  {items.length} Total Items
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage products, pricing tiers, HSN/SAC codes, barcodes &amp; godown stock levels
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
                className="h-9 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>+ Add Item</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Stock Valuation (Purchase) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Stock Valuation (Cost)
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatINR(totalStockValue)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Calculated at purchase price</p>
            </div>

            {/* Total Sales Value */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Expected Sales Value
              </span>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {formatINR(totalRetailValue)}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Profit Margin: {formatINR(totalRetailValue - totalStockValue)}
              </p>
            </div>

            {/* Low Stock Items */}
            <div
              onClick={() => setStockFilter(stockFilter === 'LOW' ? 'ALL' : 'LOW')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                stockFilter === 'LOW'
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-rose-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Low Stock Alert
                </span>
                <AlertTriangle size={15} className="text-rose-500" />
              </div>
              <p className="text-xl font-black text-rose-600 mt-1">{lowStockCount} Items</p>
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                {stockFilter === 'LOW' ? 'Click to show all' : 'Click to filter low stock'}
              </p>
            </div>

            {/* Godowns Distribution */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Godown Locations
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">2 Active Godowns</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Main Warehouse &amp; Shop Counter</p>
            </div>
          </div>

          {/* Navigation Tabs (Items Catalog vs Adjustment History) */}
          <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ITEMS')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeTab === 'ITEMS'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package size={15} />
              <span>Products &amp; Stock Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeTab === 'HISTORY'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History size={15} />
              <span>Stock Adjustment Logs ({stockLogs.length})</span>
            </button>
          </div>

          {activeTab === 'ITEMS' ? (
            /* Items Catalog View */
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Item Name, SKU, Barcode, HSN..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Godown Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Godown:</span>
                  <select
                    value={selectedGodown}
                    onChange={(e) => setSelectedGodown(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  >
                    <option value="ALL">All Godowns</option>
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Shop Counter">Shop Counter</option>
                  </select>
                </div>

                {/* Stock Level Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setStockFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      stockFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStockFilter('LOW')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      stockFilter === 'LOW'
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    Low Stock ({lowStockCount})
                  </button>
                  <button
                    onClick={() => setStockFilter('IN_STOCK')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      stockFilter === 'IN_STOCK'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-emerald-700'
                    }`}
                  >
                    In Stock
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                        <th className="py-3 px-4">Item Details</th>
                        <th className="py-3 px-3">HSN / Barcode</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Godown</th>
                        <th className="py-3 px-3">Current Stock</th>
                        <th className="py-3 px-3">Purchase Rate</th>
                        <th className="py-3 px-3">Sales Price</th>
                        <th className="py-3 px-3">Stock Value</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            No items found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => {
                          const isLow = item.stock <= item.minStockAlert;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Name & SKU */}
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                                <span className="font-mono text-[10px] text-slate-400">
                                  SKU: {item.sku}
                                </span>
                              </td>

                              {/* HSN & Barcode */}
                              <td className="py-3 px-3">
                                <p className="font-mono text-slate-700 font-medium">HSN: {item.hsnCode}</p>
                                <p className="font-mono text-[10px] text-slate-400">{item.barcode}</p>
                              </td>

                              {/* Category */}
                              <td className="py-3 px-3 text-slate-600 font-medium">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                                  {item.category}
                                </span>
                              </td>

                              {/* Godown */}
                              <td className="py-3 px-3 text-slate-500 font-medium">
                                <div className="flex items-center gap-1">
                                  <Warehouse size={13} className="text-slate-400" />
                                  <span>{item.godown}</span>
                                </div>
                              </td>

                              {/* Stock */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-extrabold text-xs ${
                                      isLow
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {item.stock} {item.unit}
                                  </span>
                                  {isLow && (
                                    <span className="text-[10px] font-semibold text-rose-500 flex items-center">
                                      <AlertTriangle size={12} className="mr-0.5" /> Low
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Purchase Price */}
                              <td className="py-3 px-3 text-slate-600 font-medium">
                                {formatINR(item.purchasePrice)}
                              </td>

                              {/* Sales Price */}
                              <td className="py-3 px-3 font-bold text-slate-900">
                                {formatINR(item.salesPrice)}
                              </td>

                              {/* Stock Value */}
                              <td className="py-3 px-3 font-semibold text-indigo-950">
                                {formatINR(item.stock * item.purchasePrice)}
                              </td>

                              {/* Action Menu */}
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Quick Stock Adjustment */}
                                  <button
                                    onClick={() => setAdjustingItem(item)}
                                    title="Adjust Stock"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                  >
                                    <RefreshCw size={14} />
                                  </button>

                                  {/* Print Barcode Label */}
                                  <button
                                    onClick={() => setBarcodeItem(item)}
                                    title="Print Barcode Stickers"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#4c3cce] hover:bg-indigo-50 transition-colors"
                                  >
                                    <Barcode size={15} />
                                  </button>

                                  {/* Edit Item */}
                                  <button
                                    onClick={() => {
                                      setEditingItem(item);
                                      setIsAddModalOpen(true);
                                    }}
                                    title="Edit Item"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                  >
                                    <Edit2 size={14} />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete ${item.name}?`)) {
                                        deleteItem(item.id);
                                      }
                                    }}
                                    title="Delete"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Stock Adjustment History View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-xs">Stock Adjustment &amp; Audit Trail</h3>
                <p className="text-[11px] text-slate-500">
                  Detailed logs of manual physical audit adjustments and reason tracking
                </p>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">Previous Stock</th>
                    <th className="py-2.5 px-4">New Stock</th>
                    <th className="py-2.5 px-4">Adjustment (+ / -)</th>
                    <th className="py-2.5 px-4">Reason &amp; Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{log.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{log.itemName}</td>
                      <td className="py-3 px-4 text-slate-600">{log.previousStock}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.newStock}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            log.difference > 0
                              ? 'text-emerald-600'
                              : log.difference < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {log.difference > 0 ? `+${log.difference}` : log.difference}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      <StockAdjustModal
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        item={adjustingItem}
      />

      <BarcodePrintModal
        isOpen={Boolean(barcodeItem)}
        onClose={() => setBarcodeItem(null)}
        item={barcodeItem}
        businessName={business.businessName}
      />

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onInvoiceCreated={(newInv) => addInvoice(newInv)}
      />
    </div>
  );
}
