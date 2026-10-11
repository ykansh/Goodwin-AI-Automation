'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';

export default function RoleTestBanner() {
  const { isTestMode, effectiveRole, toggleTestMode, switchRole, currentUser } = useApp();

  if (!isTestMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-medium shadow-md sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <ShieldAlert size={15} className="text-white animate-pulse" />
        </div>
        <div>
          <span className="font-bold tracking-wide uppercase text-[10px] bg-black/20 px-2 py-0.5 rounded-md mr-2">
            🧪 Admin Test Environment
          </span>
          <span className="text-amber-100">
            Currently previewing portal with <strong className="text-white font-bold">Employee (Restricted)</strong> permissions. Delete actions, financial liquidity totals, and settings are locked.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTestMode}
          className="px-3 py-1 rounded-lg bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <UserCheck size={14} className="text-amber-700" />
          <span>Exit Test Mode (Return to Admin)</span>
        </button>
      </div>
    </div>
  );
}
