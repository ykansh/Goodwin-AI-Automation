import React, { useState } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ArrowLeft } from 'lucide-react';

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const hideSidebarRoutes = ['/ai-slop', '/admin'];
  const shouldHideSidebar = hideSidebarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="flex h-screen w-full bg-canvas overflow-hidden">
      {/* Sidebar for Desktop */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Mobile Sidebar Overlay (Simplified for now) */}
      {!shouldHideSidebar && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-secondary-dark/50" onClick={() => setIsMobileSidebarOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar toggleSidebar={!shouldHideSidebar ? () => setIsMobileSidebarOpen(true) : undefined} />
        
        {shouldHideSidebar && (
           <div className="bg-canvas-surface border-b border-canvas-variant px-6 py-2 flex items-center">
             <button 
                onClick={() => navigate('/marketing')} 
                className="flex items-center text-sm text-secondary-light hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
             </button>
           </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
