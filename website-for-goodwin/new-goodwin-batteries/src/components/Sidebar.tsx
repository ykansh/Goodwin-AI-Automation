'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  ScanBarcode,
  Package,
  Users,
  Landmark,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Building2,
  ChevronDown,
  Sparkles,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INITIAL_BUSINESS } from '@/lib/mockData';

interface SidebarProps {
  onOpenQuickBill?: () => void;
}

export default function Sidebar({ onOpenQuickBill }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Sales Invoices', href: '/sales', icon: Receipt },
    { label: 'POS Quick Bill', href: '/pos', icon: ScanBarcode, badge: '5s Bill' },
    { label: 'Items & Stock', href: '/inventory', icon: Package },
    { label: 'Parties (Khata)', href: '/parties', icon: Users },
    { label: 'Cash & Bank', href: '/banking', icon: Landmark },
    { label: 'GST Reports', href: '/reports', icon: FileSpreadsheet },
    { label: 'Online Store', href: '/store', icon: Store, badge: 'Live' },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col justify-between shrink-0 select-none">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3a4b8d] to-[#4c3cce] flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200 text-lg">
              mB
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-lg tracking-tight flex items-center gap-1">
                my<span className="text-[#4c3cce]">Bill</span>Book
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1 tracking-wider uppercase">
                GST Cloud Suite
              </span>
            </div>
          </div>
        </div>

        {/* Business Selector */}
        <div className="p-3">
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#ece9fb] text-[#4c3cce] flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {INITIAL_BUSINESS.businessName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  GST: {INITIAL_BUSINESS.gstin.slice(0, 8)}...
                </p>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Primary Quick CTA */}
        <div className="px-3 pb-2">
          <button
            onClick={onOpenQuickBill}
            className="w-full h-10 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle size={17} />
            <span>Create GST Bill</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-[#ece9fb] text-[#4c3cce] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-[#4c3cce]' : 'text-slate-400 group-hover:text-slate-700'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider',
                      item.badge === '5s Bill'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-3 border-t border-slate-200">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100 text-xs">
          <div className="flex items-center gap-1.5 text-[#4c3cce] font-bold mb-1">
            <Sparkles size={14} />
            <span>Pro Plan Active</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Multi-device sync &amp; WhatsApp payment reminders active.
          </p>
        </div>
      </div>
    </aside>
  );
}
