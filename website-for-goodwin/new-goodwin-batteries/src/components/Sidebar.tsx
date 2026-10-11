'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Check,
  Cloud,
  Layers,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  onOpenQuickBill?: () => void;
}

export default function Sidebar({ onOpenQuickBill }: SidebarProps) {
  const pathname = usePathname();
  const { business, companies, selectedCompany, selectCompany, isEmployee, isAdmin, isTestMode } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter navigation items based on company feature flags & RBAC locks
  // Goodwin Batteries 2 has: POS quick bill removed, GST reports removed, Online store removed
  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, enabled: true },
    { label: 'Sales Invoices', href: '/sales', icon: Receipt, enabled: true },
    {
      label: 'POS Quick Bill',
      href: '/pos',
      icon: ScanBarcode,
      badge: '5s Bill',
      enabled: selectedCompany.hasPos,
    },
    { label: 'Items & Stock', href: '/inventory', icon: Package, enabled: true },
    { label: 'Parties (Khata)', href: '/parties', icon: Users, enabled: true },
    {
      label: 'Cash & Bank',
      href: '/banking',
      icon: Landmark,
      enabled: true,
      locked: isEmployee,
    },
    {
      label: 'GST Reports',
      href: '/reports',
      icon: FileSpreadsheet,
      enabled: selectedCompany.hasGstReports,
      locked: isEmployee,
    },
    {
      label: 'Online Store',
      href: '/store',
      icon: Store,
      badge: 'Live',
      enabled: selectedCompany.hasOnlineStore,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      enabled: true,
      locked: isEmployee,
    },
  ].filter((item) => item.enabled);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col justify-between shrink-0 select-none">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3a4b8d] to-[#4c3cce] flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200 text-sm">
              GB
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-base tracking-tight flex items-center gap-1">
                Goodwin<span className="text-[#4c3cce]">Batteries</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1 tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Live
              </span>
            </div>
          </div>
        </div>

        {/* Business Selector with Interactive Dropdown */}
        <div className="p-3 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={cn(
              'w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group',
              isDropdownOpen
                ? 'border-[#4c3cce] bg-[#ece9fb]/50 shadow-sm ring-2 ring-[#4c3cce]/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-colors',
                  selectedCompany.code === 'goodwin-2'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-[#ece9fb] text-[#4c3cce] border border-indigo-200'
                )}
              >
                <Building2 size={16} />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {selectedCompany.displayName}
                  </p>
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0',
                      selectedCompany.code === 'goodwin-2'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-700'
                    )}
                  >
                    {selectedCompany.shortName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  GST: {selectedCompany.gstin.slice(0, 10)}...
                </p>
              </div>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                'text-slate-400 shrink-0 transition-transform duration-200',
                isDropdownOpen ? 'rotate-180 text-[#4c3cce]' : 'group-hover:text-slate-600'
              )}
            />
          </button>

          {/* Dropdown Menu Modal / Popover */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%-4px)] left-3 right-3 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Business Entity
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1 border border-emerald-200">
                  <Cloud size={10} />
                  Supabase DB
                </span>
              </div>

              <div className="space-y-1 mt-1">
                {companies.map((company) => {
                  const isSelected = selectedCompany.code === company.code;
                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        selectCompany(company.code);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between group',
                        isSelected
                          ? 'bg-[#ece9fb] text-[#4c3cce] font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold',
                            company.code === 'goodwin-2'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-indigo-100 text-[#4c3cce]'
                          )}
                        >
                          <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                              {company.displayName}
                            </span>
                            <span
                              className={cn(
                                'text-[9px] px-1 rounded font-mono',
                                company.code === 'goodwin-2'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              )}
                            >
                              {company.shortName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            GST: {company.gstin}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {company.hasPos && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                POS Bill
                              </span>
                            )}
                            {company.hasGstReports && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                GST Reports
                              </span>
                            )}
                            {company.hasOnlineStore && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                Store
                              </span>
                            )}
                            {!company.hasPos && !company.hasGstReports && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 text-amber-700 font-medium border border-amber-100">
                                Invoices &amp; Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#4c3cce] text-white flex items-center justify-center shrink-0 mt-1">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 mt-1 bg-slate-50/50 rounded-b-xl">
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Layers size={11} className="text-[#4c3cce]" />
                  <span>Real-time tenant data isolated in Supabase</span>
                </p>
              </div>
            </div>
          )}
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
                {item.locked ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-400 flex items-center gap-1">
                    <Lock size={10} />
                    <span>Admin</span>
                  </span>
                ) : item.badge ? (
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
                ) : null}
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
            <span>{selectedCompany.displayName}</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Connected to Supabase PostgreSQL with real-time multi-tenant sync.
          </p>
        </div>
      </div>
    </aside>
  );
}
