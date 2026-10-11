'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, ArrowLeft, KeyRound, Sparkles, Lock } from 'lucide-react';

interface AccessRestrictedCardProps {
  moduleName: string;
  description?: string;
  onOpenLogin?: () => void;
}

export default function AccessRestrictedCard({
  moduleName,
  description = 'This section contains sensitive business settings and financial records accessible only by company Administrators.',
  onOpenLogin,
}: AccessRestrictedCardProps) {
  const { isTestMode, toggleTestMode, switchRole } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-lg w-full text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Lock size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
            <ShieldAlert size={13} />
            <span>Role-Based Access Control</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {moduleName} is Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        {isTestMode ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Sparkles size={14} className="text-amber-600" />
              <span>Admin Test Environment Active</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              You are simulating the <strong>Employee</strong> role to test access boundaries. Employees are prevented from viewing or modifying this module.
            </p>
            <button
              onClick={toggleTestMode}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span>Exit Test Mode (Restore Admin Access)</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => switchRole('ADMIN')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <KeyRound size={14} />
              <span>Log in as Administrator</span>
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
