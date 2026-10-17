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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import LoginModal from '@/components/LoginModal';
import ImportExportModal from '@/components/ImportExportModal';
import RoleTestBanner from '@/components/RoleTestBanner';
import CreateUserModal from '@/components/CreateUserModal';

interface HeaderProps {
  onOpenQuickBill?: () => void;
  onOpenAddItem?: () => void;
}

export default function Header({ onOpenQuickBill, onOpenAddItem }: HeaderProps) {
  const {
    selectedCompany,
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

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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
          <div className="relative w-80 lg:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${selectedCompany.displayName} items, invoices...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce] transition-all"
            />
          </div>

          {/* Company Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
            <img src="/goodwin-icon.svg" alt="GB" className="w-4 h-4 object-contain" />
            <span className="font-bold text-slate-900">{selectedCompany.displayName}</span>
            {isLoading ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-1" title="Syncing Supabase..." />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" title="Supabase Connected" />
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
