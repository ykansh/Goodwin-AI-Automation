import React, { useState } from 'react';
import { Search, Bell, User, Menu, Shield, ShieldCheck, ArrowRightLeft, Check, Sparkles } from 'lucide-react';
import { useCurrentUser } from '../../lib/useCurrentUser';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Topbar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { 
    employeeName, 
    role, 
    actualRole, 
    isSimulating, 
    setSimulatedRole,
    employee
  } = useCurrentUser();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-canvas-surface border-b border-canvas-variant flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-level-1 z-20 shrink-0">
      <div className="flex items-center flex-1 min-w-0 mr-2">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="mr-2.5 p-2 rounded-md text-secondary-light hover:bg-canvas-variant hover:text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary md:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Mobile Brand Logo and Title */}
        <div className="flex items-center space-x-2 md:hidden mr-2 shrink-0">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-display font-bold text-sm tracking-tight text-secondary-dark truncate">
            GOODWIN <span className="text-primary">GROW</span>
          </span>
        </div>
        
        {/* Global Search Bar */}
        <div className="max-w-md w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-canvas-variant rounded-md leading-5 bg-canvas placeholder-secondary-light focus:outline-none focus:bg-canvas-surface focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200 shadow-sm"
            placeholder="Search across all modules (⌘K)"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Admin Simulation Banner / Quick Toggle */}
        {actualRole === 'admin' && (
          <div className="relative">
            {isSimulating ? (
              <div className="flex items-center bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs">
                <span className="font-medium text-amber-700 mr-2 hidden sm:inline">
                  Previewing Employee: <strong className="font-semibold">{employeeName}</strong>
                </span>
                <span className="font-medium text-amber-700 mr-2 sm:hidden">
                  Employee Mode
                </span>
                <button
                  onClick={() => setSimulatedRole(null)}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] transition-colors"
                >
                  Exit Preview
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSimulatedRole('employee')}
                className="flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary-dark font-medium transition-all"
                title="Switch into Employee View to test restricted attendance and assigned projects"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Test Employee View</span>
                <span className="sm:hidden">Test Employee</span>
              </button>
            )}
          </div>
        )}

        <button className="p-2 text-secondary-light hover:text-primary transition-colors relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-canvas-surface"></span>
        </button>
        
        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-canvas-variant">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-dark font-bold text-xs uppercase shadow-sm">
            {employeeName.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-secondary-dark leading-tight">{employeeName}</p>
            <p className="text-[10px] text-secondary-light capitalize flex items-center">
              {role === 'admin' ? (
                <span className="text-primary font-semibold flex items-center">
                  <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  {employee?.role || 'Employee'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
