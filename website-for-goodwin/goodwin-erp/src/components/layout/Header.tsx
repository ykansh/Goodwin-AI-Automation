import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import {
  Plus, LogOut, ChevronDown, Shield, Sun, Moon, Menu, X
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
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 min-h-[3.5rem] bg-white dark:bg-[#262626] border-b border-gray-200 dark:border-[#3F3F3F] px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 shadow-sm flex-wrap">
      {/* Left: Brand Logo & Mobile Menu */}
      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-[#5f7365] dark:text-[#8fa093] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3 shrink-0">
          <img src={logoImg} alt="Goodwin" className="h-16 sm:h-20 w-auto object-contain" />
          <div className="hidden xs:block border-l-2 border-black/10 dark:border-white/10 pl-3">
            <div className="text-[10px] text-[#22c55e] font-extrabold tracking-widest uppercase">
              Operating System
            </div>
          </div>
        </div>
      </div>

      {/* Right: Dark Mode Toggle, Quick Action & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Dark Mode Toggle Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-md bg-gray-100 dark:bg-[#3F3F3F] hover:bg-gray-200 dark:hover:bg-[#4B5563] text-gray-700 dark:text-gray-200 transition-all cursor-pointer border border-transparent"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Quick Action Button: + New Invoice / Order */}
        <button
          type="button"
          onClick={onOpenNewInvoiceModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00A652] hover:bg-[#008a29] text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden lg:inline">+ New Invoice / Order</span>
          <span className="hidden sm:inline lg:hidden">Invoice</span>
        </button>

        {/* Role Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold border bg-gray-50 text-gray-700 dark:bg-[#3F3F3F] dark:text-gray-200 border-gray-200 dark:border-gray-600 select-none">
            <Shield className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-black">{user.role.replace('_', ' ')}</span>
          </div>
        )}

        {/* User Account Menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#3F3F3F] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3F3F3F] text-gray-700 dark:text-gray-200 font-bold flex items-center justify-center text-xs border border-gray-300 dark:border-gray-600">
                {user.full_name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#2D2D2D] rounded-md shadow-lg border border-gray-200 dark:border-[#3F3F3F] p-1.5 z-50 animate-scale-in">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-[#3F3F3F] mb-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user.full_name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#3F3F3F] rounded-md transition-colors cursor-pointer"
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
