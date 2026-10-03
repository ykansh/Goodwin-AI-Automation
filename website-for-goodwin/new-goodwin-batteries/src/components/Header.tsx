'use client';

import React from 'react';
import { Search, Bell, Plus, QrCode, MessageCircle } from 'lucide-react';
import { INITIAL_BUSINESS } from '@/lib/mockData';

interface HeaderProps {
  onOpenQuickBill?: () => void;
  onOpenAddItem?: () => void;
}

export default function Header({ onOpenQuickBill, onOpenAddItem }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items, invoices, customers... (Press / to focus)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce] transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Quick Add Item */}
        <button
          onClick={onOpenAddItem}
          className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Plus size={15} className="text-slate-500" />
          <span>Add Item</span>
        </button>

        {/* Quick Bill */}
        <button
          onClick={onOpenQuickBill}
          className="h-9 px-3.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <QrCode size={15} />
          <span>Quick POS Bill</span>
        </button>

        {/* WhatsApp Link status */}
        <div className="h-9 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
          <MessageCircle size={15} className="text-emerald-600" />
          <span className="hidden sm:inline">WhatsApp Connected</span>
        </div>

        {/* Alerts Bell */}
        <button className="relative w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            GB
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Admin</p>
            <p className="text-[10px] text-slate-400">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
