import { useAuth } from '../../store/AuthContext';
import { canAccess, sidebarGroups } from '../../lib/permissions';
import {
  LayoutDashboard, Users, Truck, Package, FileText, ShoppingCart,
  RotateCcw, ShieldCheck, BarChart3, Settings, ArrowDownLeft, ArrowUpRight, Lock, X,
  Kanban, CalendarClock, Clock, Calendar, DollarSign, BookOpen, Briefcase, Shield
} from 'lucide-react';
import React from 'react';

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
  const { user } = useAuth();

  if (!user) return null;

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
    Kanban: <Kanban className="w-5 h-5 shrink-0" />,
    CalendarClock: <CalendarClock className="w-5 h-5 shrink-0" />,
    Clock: <Clock className="w-5 h-5 shrink-0" />,
    Calendar: <Calendar className="w-5 h-5 shrink-0" />,
    DollarSign: <DollarSign className="w-5 h-5 shrink-0" />,
    BookOpen: <BookOpen className="w-5 h-5 shrink-0" />,
    Briefcase: <Briefcase className="w-5 h-5 shrink-0" />,
    Shield: <Shield className="w-5 h-5 shrink-0" />,
  };

  const renderContent = () => (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5">
      <div className="space-y-6">
        {sidebarGroups.map((group, gIdx) => {
          // Check if user has access to at least one item in the group
          const accessibleItems = group.items.filter(item => canAccess(user.role, item.module));
          if (accessibleItems.length === 0) return null; // Hide empty groups

          return (
            <div key={gIdx} className="space-y-2">
              <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#738277] dark:text-[#526356]">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isAllowed = canAccess(user.role, item.module);
                  const isActive = currentModule === item.key;

                  if (!isAllowed) {
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-400/50 dark:text-gray-600 opacity-60 cursor-not-allowed select-none whitespace-nowrap"
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-md shadow-[#22c55e]/20 translate-x-1'
                          : 'text-[#5f7365] dark:text-[#8fa093] hover:bg-[#17201a]/5 hover:text-[#22c55e] dark:hover:bg-[#17201a] dark:hover:text-[#22c55e]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {iconMap[item.icon]}
                        <span className="truncate tracking-wide">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gradient-to-b from-[#17201a]/50 to-transparent dark:from-[#17201a] rounded-2xl border border-black/5 dark:border-white/5 text-xs text-[#5f7365] dark:text-[#8fa093] space-y-1 shrink-0">
        <div className="font-extrabold text-[#111814] dark:text-white">Goodwin OS</div>
        <div className="text-[11px] font-semibold opacity-70">
          Auto-Sync Connected
        </div>
        <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#22c55e] pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span>Real-time Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fills the 260px grid column, Full Height, Independent Scroll) */}
      <aside className="w-full bg-[#f8faf9] dark:bg-[#07100c] border-r border-black/5 dark:border-white/5 h-full hidden md:block z-20 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-[#f8faf9] dark:bg-[#07100c] border-r border-black/5 dark:border-white/5 shadow-2xl z-10 overflow-y-auto animate-slide-in-left custom-scrollbar">
            <div className="flex justify-between items-center p-4 border-b border-black/5 dark:border-white/5">
              <span className="font-extrabold text-[#111814] dark:text-white">Navigation</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 text-[#5f7365] hover:text-[#111814] dark:hover:text-white rounded-xl bg-black/5 dark:bg-white/5"
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
