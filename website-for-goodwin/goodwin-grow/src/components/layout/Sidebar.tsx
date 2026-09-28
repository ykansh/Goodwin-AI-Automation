import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  PieChart, 
  Settings,
  Bot,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../lib/authStore';
import { useCurrentUser } from '../../lib/useCurrentUser';

const navItems = [
  { name: 'Marketing', path: '/marketing', icon: BarChart3 },
  { name: 'Operations', path: '/operations', icon: Briefcase },
  { name: 'HRMS', path: '/hrms', icon: Users },
  { name: 'Finance', path: '/finance', icon: PieChart },
];

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, employeeName } = useCurrentUser();
  const signOut = useAuthStore(state => state.signOut);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    if (isMobile && onClose) {
      onClose();
    }
    await signOut();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "bg-secondary flex flex-col h-full border-r border-canvas-variant shadow-level-2 z-10 transition-all duration-300",
        isMobile ? "w-full flex" : "w-64 flex-shrink-0 hidden md:flex"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-secondary-dark text-white border-b border-secondary shrink-0">
        <div className="flex items-center">
          <div className="w-8 flex items-center justify-center mr-3">
            <img src="/logo.png" alt="Logo" className="w-full h-auto object-contain" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide text-canvas-surface">
            GOODWIN <span className="text-tertiary">GROW</span>
          </span>
        </div>
        {isMobile && (
          <button 
            onClick={onClose} 
            className="p-1.5 -mr-2 rounded-lg text-canvas-variant hover:text-white hover:bg-secondary-light/30 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-secondary-light uppercase tracking-wider mb-4 px-3">
          Modules
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-level-1" 
                  : "text-canvas-variant hover:bg-secondary-light/30 hover:text-white"
              )}
            >
              <item.icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-canvas-variant group-hover:text-white"
                )} 
              />
              {item.name}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-tertiary rounded-r-md" />
              )}
            </NavLink>
          );
        })}

        <div className="mt-8 mb-4">
          <div className="text-xs font-semibold text-secondary-light uppercase tracking-wider mb-4 px-3">
            System
          </div>
          <NavLink
            to="/ai-slop"
            onClick={handleLinkClick}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
              isActive 
                ? "bg-primary text-white shadow-level-1" 
                : "text-canvas-variant hover:bg-secondary-light/30 hover:text-white"
            )}
          >
            <Bot className="mr-3 h-5 w-5 text-tertiary group-hover:text-white transition-colors" />
            AI Slop
          </NavLink>
          {role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={handleLinkClick}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative mt-1",
                isActive 
                  ? "bg-primary text-white shadow-level-1" 
                  : "text-canvas-variant hover:bg-secondary-light/30 hover:text-white"
              )}
            >
              <Settings className="mr-3 h-5 w-5 text-canvas-variant group-hover:text-white transition-colors" />
              Admin
            </NavLink>
          )}
        </div>
      </nav>

      {/* Footer User Area */}
      <div className="p-4 border-t border-secondary-light/30 shrink-0 space-y-2">
        <div className="px-3 py-2 rounded-md bg-secondary-dark/60 border border-secondary-light/20 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-canvas-surface truncate">{employeeName}</p>
            <p className="text-[10px] text-tertiary uppercase tracking-wider capitalize font-medium">{role}</p>
          </div>
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0",
            role === 'admin' ? "bg-amber-400" : "bg-emerald-400"
          )} title={role === 'admin' ? 'Administrator' : 'Employee'} />
        </div>
        <button 
          onClick={handleSignOut} 
          className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-canvas-variant hover:bg-secondary-light/30 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
