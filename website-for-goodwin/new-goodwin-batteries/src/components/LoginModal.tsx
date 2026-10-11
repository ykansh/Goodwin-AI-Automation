'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole, DEFAULT_ADMIN, DEFAULT_EMPLOYEE } from '@/context/AppContext';
import { Shield, User, X, Check, Lock, Sparkles, Building2, Eye, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { currentUser, loginUser, switchRole, toggleTestMode, isTestMode, effectiveRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [email, setEmail] = useState(currentUser.email);
  const [name, setName] = useState(currentUser.name);

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setEmail(DEFAULT_ADMIN.email);
      setName(DEFAULT_ADMIN.name);
    } else {
      setEmail(DEFAULT_EMPLOYEE.email);
      setName(DEFAULT_EMPLOYEE.name);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email, selectedRole, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#1e1b4b] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <KeyRound size={18} className="text-indigo-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Authentication &amp; RBAC Access</h2>
              <p className="text-[11px] text-indigo-200">
                Goodwin Batteries Role-Based Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  selectedRole === 'ADMIN'
                    ? 'border-[#4c3cce] bg-[#ece9fb]/50 ring-2 ring-[#4c3cce]/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ece9fb] text-[#4c3cce] flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  {selectedRole === 'ADMIN' && (
                    <div className="w-5 h-5 rounded-full bg-[#4c3cce] text-white flex items-center justify-center text-[10px]">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900">Administrator</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Full Access • Settings • Bank Totals</p>
              </button>

              {/* Employee Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('EMPLOYEE')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  selectedRole === 'EMPLOYEE'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  {selectedRole === 'EMPLOYEE' && (
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900">Employee / Staff</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Billing • POS • Inventory View</p>
              </button>
            </div>
          </div>

          {/* User Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Work Email / ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
              />
            </div>
          </div>

          {/* Quick Admin Test Mode Option */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-[11px]">🧪 Admin Test Mode</p>
                <p className="text-[10px] text-slate-500">
                  Simulate employee view without changing login credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleTestMode();
                  onClose();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                  isTestMode
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-50 text-[#4c3cce] hover:bg-indigo-100'
                }`}
              >
                {isTestMode ? 'Turn Off' : 'Simulate'}
              </button>
            </div>
          </div>

          {/* Link to Full Login Portal */}
          <div className="text-center">
            <a
              href="/login"
              className="text-[11px] text-[#4c3cce] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Go to Enterprise Login Portal with Email &amp; Password</span>
              <span>&rarr;</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Lock size={13} />
              <span>Confirm &amp; Switch Role</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
