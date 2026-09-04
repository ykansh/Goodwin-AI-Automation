import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  PieChart, 
  Settings,
  Bot,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Marketing', path: '/marketing', icon: BarChart3 },
  { name: 'Operations', path: '/operations', icon: Briefcase },
  { name: 'HRMS', path: '/hrms', icon: Users },
  { name: 'Finance', path: '/finance', icon: PieChart },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-secondary flex-shrink-0 hidden md:flex flex-col h-full border-r border-canvas-variant shadow-level-2 z-10 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 bg-secondary-dark text-white border-b border-secondary">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center mr-3 font-display font-bold text-white text-xl leading-none">
          G
        </div>
        <span className="font-display font-bold text-lg tracking-wide text-canvas-surface">
          GOODWIN <span className="text-tertiary">GROW</span>
        </span>
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
          <NavLink
            to="/admin"
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
        </div>
      </nav>

      {/* Footer User Area */}
      <div className="p-4 border-t border-secondary-light/30">
        <button className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-canvas-variant hover:bg-secondary-light/30 hover:text-white transition-colors">
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
