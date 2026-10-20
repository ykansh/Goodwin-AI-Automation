'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  QrCode,
  FilePlus2,
  Building2,
  Cloud,
  FileSpreadsheet,
  Shield,
  User,
  ShieldAlert,
  ChevronDown,
  LogOut,
  Sparkles,
  KeyRound,
  Download,
  Upload,
  UserPlus,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import ImportExportModal from '@/components/ImportExportModal';
import RoleTestBanner from '@/components/RoleTestBanner';
import CreateUserModal from '@/components/CreateUserModal';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenQuickBill?: () => void;
  onOpenAddItem?: () => void;
}

export default function Header({ onOpenQuickBill, onOpenAddItem }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    selectedCompany,
    companies,
    selectCompany,
    business,
    isLoading,
    currentUser,
    effectiveRole,
    isAdmin,
    isEmployee,
    isTestMode,
    toggleTestMode,
    logoutUser,
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Test Environment Banner */}
      <RoleTestBanner />

      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Search Input & Active Company Indicator */}
        <div className="flex items-center gap-4">
          <div className="relative w-72 lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${selectedCompany.displayName} items, invoices...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce] transition-all"
            />
          </div>

          {/* Interactive Company Switcher Dropdown */}
          <div className="relative" ref={companyDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCompanyDropdownOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none',
                isCompanyDropdownOpen
                  ? 'bg-[#ece9fb] border-[#4c3cce] text-[#4c3cce] shadow-sm ring-2 ring-[#4c3cce]/20'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 shadow-2xs'
              )}
              title="Click to switch business entity (With GST / Without GST)"
            >
              <img src="/goodwin-icon.svg" alt="GB" className="w-4 h-4 object-contain shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{selectedCompany.displayName}</span>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0',
                    selectedCompany.code === 'goodwin-2'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  )}
                >
                  {selectedCompany.shortName}
                </span>
              </div>
              {isLoading ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" title="Syncing Supabase..." />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" title="Supabase Connected" />
              )}
              <ChevronDown
                size={14}
                className={cn(
                  'text-slate-400 ml-0.5 transition-transform duration-200',
                  isCompanyDropdownOpen ? 'rotate-180 text-[#4c3cce]' : ''
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {isCompanyDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Business Entity
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1 border border-emerald-200">
                    <Cloud size={10} />
                    Supabase DB
                  </span>
                </div>

                <div className="space-y-1">
                  {companies.map((company) => {
                    const isSelected = selectedCompany.code === company.code;
                    return (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => {
                          selectCompany(company.code);
                          setIsCompanyDropdownOpen(false);
                          if (
                            company.code === 'goodwin-2' &&
                            (pathname === '/pos' || pathname === '/store' || pathname === '/reports')
                          ) {
                            router.push('/sales');
                          }
                        }}
                        className={cn(
                          'w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between group cursor-pointer',
                          isSelected
                            ? 'bg-[#ece9fb] text-[#4c3cce] font-semibold ring-1 ring-[#4c3cce]/30'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold p-1',
                              company.code === 'goodwin-2'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-indigo-100 text-[#4c3cce] border border-indigo-200'
                            )}
                          >
                            <img src="/goodwin-icon.svg" alt="GB Logo" className="w-5 h-5 object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 leading-tight">
                                {company.displayName}
                              </span>
                              <span
                                className={cn(
                                  'text-[9px] px-1 rounded font-mono font-bold',
                                  company.code === 'goodwin-2'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-indigo-100 text-[#4c3cce]'
                                )}
                              >
                                {company.shortName}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                              {company.tagline}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {company.hasPos && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                  POS Bill
                                </span>
                              )}
                              {company.hasGstReports && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                  GST Reports
                                </span>
                              )}
                              {company.hasOnlineStore && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                  Store
                                </span>
                              )}
                              {!company.hasPos && !company.hasGstReports && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                                  Without GST • Fast Invoices & Stock
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

                <div className="p-2 border-t border-slate-100 mt-1.5 bg-slate-50/50 rounded-b-xl flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#4c3cce]" />
                    <span>Instant Switch • Isolated Data</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          {/* Quick Add Item */}
          <button
            onClick={onOpenAddItem}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus size={15} className="text-slate-500" />
            <span className="hidden sm:inline">Add Item</span>
          </button>

          {/* Import / Export Center Button */}
          <button
            onClick={() => setIsImportExportModalOpen(true)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Import or Export CSV Data"
          >
            <FileSpreadsheet size={15} className="text-[#4c3cce]" />
            <span className="hidden md:inline">Import/Export</span>
          </button>

          {/* Bill Button */}
          {selectedCompany.hasPos ? (
            <button
              onClick={onOpenQuickBill}
              className="h-9 px-3.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <QrCode size={15} />
              <span>Quick POS Bill</span>
            </button>
          ) : (
            <button
              onClick={onOpenQuickBill}
              className="h-9 px-3.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FilePlus2 size={15} />
              <span>New Invoice</span>
            </button>
          )}

          {/* Admin Test Environment Quick Toggle Button */}
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={toggleTestMode}
              className={`h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                isTestMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] border border-indigo-200'
              }`}
              title="Toggle Employee Permission Simulation"
            >
              <ShieldAlert size={14} />
              <span>{isTestMode ? 'Exit Test View' : '🧪 Test as Employee'}</span>
            </button>
          )}

          {/* Alerts Bell */}
          <button className="relative w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* User Profile & Role Switcher Popover */}
          <div className="relative pl-1 border-l border-slate-200" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  effectiveRole === 'ADMIN' ? 'bg-[#4c3cce]' : 'bg-amber-600'
                }`}
              >
                {effectiveRole === 'ADMIN' ? 'AD' : 'EM'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </p>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      effectiveRole === 'ADMIN' ? 'bg-indigo-600' : 'bg-amber-600'
                    }`}
                  />
                  {effectiveRole === 'ADMIN' ? 'Admin' : isTestMode ? 'Employee (Test)' : 'Employee'}
                </p>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User Info Header */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        effectiveRole === 'ADMIN'
                          ? 'bg-indigo-100 text-[#4c3cce]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {effectiveRole === 'ADMIN' ? '👑 Administrator' : '👷 Employee Staff'}
                    </span>
                    {isTestMode && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                        Test Mode
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs text-slate-800 mt-1.5">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
                </div>

                {/* Role Switcher Section */}
                <div className="space-y-1">
                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        toggleTestMode();
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                        isTestMode
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ShieldAlert size={15} className={isTestMode ? 'text-amber-600' : 'text-slate-400'} />
                      <div className="truncate">
                        <p>{isTestMode ? 'Exit Employee Test View' : '🧪 Test as Employee'}</p>
                        <p className="text-[10px] font-normal text-slate-500">
                          {isTestMode ? 'Return to Admin privileges' : 'Preview employee restrictions'}
                        </p>
                      </div>
                    </button>
                  )}

                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setIsCreateUserOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 transition-colors"
                    >
                      <UserPlus size={15} className="text-[#4c3cce]" />
                      <div>
                        <p className="font-bold text-slate-800">+ Create Staff Account</p>
                        <p className="text-[10px] text-slate-400">Generate email &amp; password login</p>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound size={15} className="text-slate-400" />
                    <div>
                      <p>Switch Account / Login</p>
                      <p className="text-[10px] text-slate-400">Log in as Admin or Employee</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsImportExportModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 transition-colors"
                  >
                    <FileSpreadsheet size={15} className="text-slate-400" />
                    <div>
                      <p>Import &amp; Export Center</p>
                      <p className="text-[10px] text-slate-400">Download/Upload CSV data</p>
                    </div>
                  </button>
                </div>

                {/* Footer Logout */}
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out (Go to Login Portal)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login / Role Switching Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
      />

      {/* CSV Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
      />
    </>
  );
}
