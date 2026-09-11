import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import type { AppMode } from '../../types';
import {
  Plus, LogOut, ChevronDown, Building2, BookOpen, Shield, Sun, Moon, Menu, X, Target, Check, Users
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

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
  const { user, mode, setMode, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModuleMenu, setShowModuleMenu] = useState(false);
  const moduleMenuRef = useRef<HTMLDivElement>(null);

  // Close module dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moduleMenuRef.current && !moduleMenuRef.current.contains(e.target as Node)) {
        setShowModuleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modules: { mode: AppMode; label: string; subtitle: string; Icon: React.ElementType; activeClass: string }[] = [
    {
      mode: 'erp',
      label: 'Goodwin ERP',
      subtitle: 'Enterprise Resource Planning',
      Icon: Building2,
      activeClass: 'text-[#00a631]',
    },
    {
      mode: 'ledger',
      label: 'Ledger-Pro',
      subtitle: 'Accounting & Bookkeeping',
      Icon: BookOpen,
      activeClass: 'text-[#cde06c]',
    },
    {
      mode: 'leads',
      label: 'Lead Management',
      subtitle: 'Sales Pipeline & CRM',
      Icon: Target,
      activeClass: 'text-blue-500',
    },
    {
      mode: 'hrms',
      label: 'Goodwin HRMS',
      subtitle: 'Attendance, Leave & Payroll',
      Icon: Users,
      activeClass: 'text-[#00a631]', // Exact same as website (ERP)
    },
  ];

  const activeModule = modules.find((m) => m.mode === mode)!;

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

        <div className="flex items-center gap-3 shrink-0">
          <img src={logoImg} alt="Goodwin" className="h-10 sm:h-12 object-contain" />
          <div className="hidden xs:block border-l-2 border-gray-200 dark:border-gray-700 pl-3">
            <div className="text-[10px] text-[#00a631] font-extrabold tracking-widest uppercase">
              {mode === 'erp' ? 'ERP Suite' : mode === 'ledger' ? 'Ledger-Pro' : mode === 'hrms' ? 'HRMS' : 'Lead Mgmt'}
            </div>
          </div>
        </div>

        {/* Module Dropdown Switcher */}
        <div className="relative" ref={moduleMenuRef}>
          <button
            type="button"
            onClick={() => setShowModuleMenu((prev) => !prev)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-[#252825] hover:bg-gray-200 dark:hover:bg-[#2d302d] border border-gray-200 dark:border-[#2d302d] rounded-2xl text-xs sm:text-sm font-extrabold text-[#3a3b39] dark:text-white transition-all cursor-pointer whitespace-nowrap"
            aria-label="Switch Module"
          >
            <activeModule.Icon className={`w-4 h-4 shrink-0 ${activeModule.activeClass}`} />
            <span className="hidden sm:inline">{activeModule.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showModuleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showModuleMenu && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-[#1e211e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2d302d] p-2 z-50 animate-scale-in">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-3 py-1.5 uppercase tracking-wider">
                Switch Module
              </div>
              {modules.map((m) => (
                <button
                  key={m.mode}
                  type="button"
                  onClick={() => {
                    setMode(m.mode);
                    setShowModuleMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    mode === m.mode
                      ? 'bg-[#00a631]/10 dark:bg-[#00a631]/10'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    mode === m.mode ? 'bg-[#00a631] text-white' : 'bg-gray-100 dark:bg-[#252825] text-gray-500 dark:text-gray-400'
                  }`}>
                    <m.Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-extrabold ${
                      mode === m.mode ? 'text-[#3a3b39] dark:text-white' : 'text-gray-700 dark:text-gray-200'
                    }`}>{m.label}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold truncate">{m.subtitle}</div>
                  </div>
                  {mode === m.mode && <Check className="w-4 h-4 text-[#00a631] shrink-0" />}
                </button>
              ))}
            </div>
          )}
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
        {/* Role Badge (Static Read-Only) */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 select-none">
            <Shield className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-black">{user.role}</span>
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
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
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
