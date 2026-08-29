import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import type { AppMode, UserRole } from '../../types';
import {
  Plus, LogOut, ChevronDown, Sparkles, Building2, BookOpen, Shield, Sun, Moon, Menu, X
} from 'lucide-react';

interface HeaderProps {
  onOpenNewInvoiceModal: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export function Header({
  onOpenNewInvoiceModal,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}: HeaderProps) {
  const { user, mode, setMode, quickSignInAsRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    manager: 'bg-lime-500/15 text-lime-800 dark:text-lime-400 border-lime-500/30',
    accounts: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    sales: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30',
    inventory: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  };

  const handleModeSwitch = (newMode: AppMode) => {
    setMode(newMode);
  };

  return (
    <header className="sticky top-0 z-40 min-h-[4.25rem] bg-white dark:bg-[#181a18] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 shadow-sm flex-wrap">
      {/* Left: Brand Logo & Section Switcher */}
      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#00a631] text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-[#00a631]/30">
            G
          </div>
          <div className="hidden xs:block">
            <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm sm:text-base leading-tight tracking-wide">
              GOODWIN
            </div>
            <div className="text-[10px] text-[#00a631] font-extrabold tracking-widest uppercase">
              {mode === 'erp' ? 'ERP Suite' : 'Ledger-Pro'}
            </div>
          </div>
        </div>

        {/* Section Switcher Toggle - No Overlapping, Clean Margins & Larger Button Size */}
        <div className="flex items-center bg-gray-100 dark:bg-[#252825] p-1 sm:p-1.5 rounded-2xl border border-gray-200 dark:border-[#2d302d] gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handleModeSwitch('erp')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              mode === 'erp'
                ? 'bg-[#00a631] text-white shadow-md shadow-[#00a631]/30'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#3a3b39] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Goodwin ERP</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('ledger')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              mode === 'ledger'
                ? 'bg-[#3a3b39] text-[#cde06c] shadow-md shadow-black/20'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#3a3b39] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Ledger-Pro</span>
          </button>
        </div>
      </div>

      {/* Right: Dark Mode Toggle, Quick Action & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Dark Mode Toggle Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-2xl bg-gray-100 dark:bg-[#252825] hover:bg-gray-200 dark:hover:bg-[#2d302d] text-[#3a3b39] dark:text-[#cde06c] transition-all cursor-pointer border border-gray-200 dark:border-[#374137]"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Quick Action Button: + New Invoice / Order */}
        <button
          type="button"
          onClick={onOpenNewInvoiceModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-[#00a631]/25 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden lg:inline">+ New Invoice / Order</span>
          <span className="hidden sm:inline lg:hidden">Invoice</span>
        </button>

        {/* Role Badge Dropdown (Quick Role Switching for Demo/Testing) */}
        {user && (
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                roleColors[user.role]
              }`}
              title="Click to quickly switch role for RBAC testing"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{user.role}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e211e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2d302d] p-2 z-50 animate-scale-in">
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-2 py-1 uppercase tracking-wider">
                  Test Access Role
                </div>
                {(['admin', 'manager', 'accounts', 'sales', 'inventory'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      quickSignInAsRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      user.role === r ? 'bg-[#00a631]/10 text-[#00a631]' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span className="capitalize">{r}</span>
                    {user.role === r && <Sparkles className="w-3.5 h-3.5 text-[#00a631]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252825] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#3a3b39] dark:bg-gray-700 text-[#cde06c] font-extrabold flex items-center justify-center text-xs shadow">
                {user.full_name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-extrabold text-[#3a3b39] dark:text-white truncate max-w-[120px]">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e211e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2d302d] p-2 z-50 animate-scale-in">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-[#2d302d] mb-1">
                  <p className="text-xs font-extrabold text-[#3a3b39] dark:text-white">{user.full_name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00a631]/10 text-[#00a631] uppercase">
                    Role: {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
