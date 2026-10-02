import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useFinanceStore } from '../../lib/financeStore';
import { useMarketingStore } from '../../lib/marketingStore';
import { useOperationsStore } from '../../lib/operationsStore';
import { useProjectNotesStore } from '../../lib/projectNotesStore';
import { useMarketingCalendarStore } from '../../lib/marketingCalendarStore';
import { cn } from '../../lib/utils';

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Automatically close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const hideSidebarRoutes: string[] = [];
  const shouldHideSidebar = hideSidebarRoutes.some(route => location.pathname.startsWith(route));
  
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const fetchFinanceData = useFinanceStore(state => state.fetchFinanceData);
  const fetchMarketingData = useMarketingStore(state => state.fetchMarketingData);
  const fetchOperationsData = useOperationsStore(state => state.fetchOperationsData);
  const fetchAllNotes = useProjectNotesStore(state => state.fetchAllNotes);
  const fetchCalendarEntries = useMarketingCalendarStore(state => state.fetchEntries);
  
  const isLoadingHRMS = useStore(state => state.isLoading);
  const isLoadingFinance = useFinanceStore(state => state.isLoading);
  const isLoadingMarketing = useMarketingStore(state => state.isLoading);
  const isLoadingOps = useOperationsStore(state => state.isLoading);

  const isLoading = isLoadingHRMS || isLoadingFinance || isLoadingMarketing || isLoadingOps;

  useEffect(() => {
    fetchInitialData();
    fetchFinanceData();
    fetchMarketingData();
    fetchOperationsData();
    fetchAllNotes();
    fetchCalendarEntries();
  }, [fetchInitialData, fetchFinanceData, fetchMarketingData, fetchOperationsData, fetchAllNotes, fetchCalendarEntries]);

  return (
    <div className="flex h-screen w-full bg-canvas overflow-hidden relative">
      {/* Sidebar for Desktop */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Mobile Drawer Navigation */}
      {!shouldHideSidebar && (
        <div 
          className={cn(
            "fixed inset-0 z-50 md:hidden transition-all duration-300",
            isMobileSidebarOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
          )}
        >
          {/* Backdrop */}
          <div 
            className={cn(
              "fixed inset-0 bg-secondary-dark/60 backdrop-blur-xs transition-opacity duration-300",
              isMobileSidebarOpen ? "opacity-100" : "opacity-0"
            )} 
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div 
            className={cn(
              "fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-secondary shadow-2xl z-10 transform transition-transform duration-300 ease-in-out",
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar isMobile onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar toggleSidebar={!shouldHideSidebar ? () => setIsMobileSidebarOpen(true) : undefined} />
        
        {shouldHideSidebar && (
           <div className="bg-canvas-surface border-b border-canvas-variant px-4 sm:px-6 py-2 flex items-center shrink-0">
             <button 
                onClick={() => navigate('/marketing')} 
                className="flex items-center text-sm text-secondary-light hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
             </button>
           </div>
        )}

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
