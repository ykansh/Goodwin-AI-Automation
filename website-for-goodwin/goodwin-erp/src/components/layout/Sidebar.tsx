import { useAuth } from '../../store/AuthContext';
import { canAccess, erpSidebarItems, ledgerSidebarItems } from '../../lib/permissions';
import {
  LayoutDashboard, Users, Truck, Package, FileText, ShoppingCart,
  RotateCcw, ShieldCheck, BarChart3, Settings, ArrowDownLeft, ArrowUpRight, Lock, X
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (moduleKey: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentModule,
  onSelectModule,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { user, mode } = useAuth();

  if (!user) return null;

  const items = mode === 'erp' ? erpSidebarItems : ledgerSidebarItems;

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    Users: <Users className="w-5 h-5 shrink-0" />,
    Truck: <Truck className="w-5 h-5 shrink-0" />,
    Package: <Package className="w-5 h-5 shrink-0" />,
    FileText: <FileText className="w-5 h-5 shrink-0" />,
    ShoppingCart: <ShoppingCart className="w-5 h-5 shrink-0" />,
    RotateCcw: <RotateCcw className="w-5 h-5 shrink-0" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 shrink-0" />,
    BarChart3: <BarChart3 className="w-5 h-5 shrink-0" />,
    Settings: <Settings className="w-5 h-5 shrink-0" />,
    ArrowDownLeft: <ArrowDownLeft className="w-5 h-5 shrink-0" />,
    ArrowUpRight: <ArrowUpRight className="w-5 h-5 shrink-0" />,
  };

  const renderContent = () => (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5">
      <div className="space-y-2">
        <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {mode === 'erp' ? 'Goodwin ERP Navigation' : 'Ledger-Pro Navigation'}
        </div>

        <div className="space-y-1.5">
          {items.map((item) => {
            const isAllowed = canAccess(user.role, item.module, mode);
            const isActive = currentModule === item.key;

            if (!isAllowed) {
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-gray-400/50 dark:text-gray-600 opacity-60 cursor-not-allowed select-none whitespace-nowrap"
                  title={`Restricted for role: ${user.role}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {iconMap[item.icon]}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectModule(item.key);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? mode === 'erp'
                      ? 'bg-[#00a631] text-white shadow-lg shadow-[#00a631]/30 translate-x-1'
                      : 'bg-[#3a3b39] text-[#cde06c] shadow-lg shadow-black/20 translate-x-1'
                    : 'text-[#3a3b39] dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800 hover:text-[#00a631]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {iconMap[item.icon]}
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1e211e] rounded-2xl border border-gray-200 dark:border-[#2d302d] text-xs text-gray-600 dark:text-gray-300 space-y-1">
        <div className="font-extrabold text-[#3a3b39] dark:text-white">Goodwin Batteries ERP</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
          Auto-Sync Connected
        </div>
        <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#00a631] pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00a631] animate-pulse shrink-0" />
          <span>Real-time Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Width, Non-Collapsing) */}
      <aside className="w-full bg-white dark:bg-[#181a18] border-r border-gray-200 dark:border-[#2d302d] h-[calc(100vh-4.25rem)] hidden md:block sticky top-[4.25rem] z-20 overflow-y-auto">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#181a18] border-r border-gray-200 dark:border-[#2d302d] shadow-2xl z-10 overflow-y-auto animate-slide-in-left">
            <div className="flex justify-between items-center p-4 border-b border-gray-200/50 dark:border-white/10">
              <span className="font-extrabold text-[#3a3b39] dark:text-white">Navigation</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
