'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockItem } from '@/lib/mockData';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MockItem | null;
}

export default function StockAdjustModal({ isOpen, onClose, item }: StockAdjustModalProps) {
  const { adjustStock } = useApp();
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>('Physical Count Verification');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (item) {
      setNewStock(item.stock);
      setReason('Physical Count Verification');
      setNotes('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const diff = newStock - item.stock;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(item.id, Number(newStock), `${reason}${notes ? ` - ${notes}` : ''}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <RefreshCw size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Adjust Stock Count</h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Stock Metrics Row */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Current Stock</span>
              <span className="text-xl font-black text-slate-800">
                {item.stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Change</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                {diff > 0 ? (
                  <ArrowUpCircle size={16} className="text-emerald-600" />
                ) : diff < 0 ? (
                  <ArrowDownCircle size={16} className="text-rose-600" />
                ) : null}
                <span
                  className={`text-base font-bold ${
                    diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}
                >
                  {diff > 0 ? `+${diff}` : diff}
                </span>
              </div>
            </div>
          </div>

          {/* New Stock Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Physical Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              required
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            >
              <option value="Physical Count Verification">Physical Count Verification</option>
              <option value="Damaged / Broken in Transit">Damaged / Broken in Transit</option>
              <option value="Expired / Scrapped Battery">Expired / Scrapped Battery</option>
              <option value="Lost / Inventory Shrinkage">Lost / Inventory Shrinkage</option>
              <option value="Stock Found / Bonus Unit">Stock Found / Bonus Unit</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Remarks / Audit Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Audit conducted by store manager"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
            >
              Save Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
