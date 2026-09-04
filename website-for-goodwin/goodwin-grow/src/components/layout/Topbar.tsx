import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

export const Topbar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  return (
    <header className="h-16 bg-canvas-surface border-b border-canvas-variant flex items-center justify-between px-4 lg:px-6 shadow-level-1 z-20">
      <div className="flex items-center flex-1">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md text-secondary-light hover:bg-canvas-variant hover:text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
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

      <div className="ml-4 flex items-center space-x-4">
        <button className="p-2 text-secondary-light hover:text-primary transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-canvas-surface"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-tertiary flex items-center justify-center border border-tertiary-dark cursor-pointer hover:ring-2 hover:ring-primary transition-all">
          <User className="h-4 w-4 text-secondary-dark" />
        </div>
      </div>
    </header>
  );
};
