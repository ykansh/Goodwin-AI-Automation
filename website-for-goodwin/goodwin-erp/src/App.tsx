import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { DataProvider } from './store/DataContext';
import { ThemeProvider } from './store/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/auth/LoginPage';

// ERP Pages
import { ErpDashboard } from './pages/erp/ErpDashboard';
import { CustomersDealersPage } from './pages/erp/CustomersDealersPage';
import { SuppliersVendorsPage } from './pages/erp/SuppliersVendorsPage';
import { ProductsInventoryPage } from './pages/erp/ProductsInventoryPage';
import { SalesInvoicesPage } from './pages/erp/SalesInvoicesPage';
import { PurchasesPOsPage } from './pages/erp/PurchasesPOsPage';
import { ReturnsPage } from './pages/erp/ReturnsPage';
import { BatteryWarrantyPage } from './pages/erp/BatteryWarrantyPage';
import { ReportsAnalyticsPage } from './pages/erp/ReportsAnalyticsPage';
import { SettingsPage } from './pages/erp/SettingsPage';
import { UserManagementPage } from './pages/erp/UserManagementPage';

// Ledger-Pro Pages
import { LedgerDashboard } from './pages/ledger/LedgerDashboard';
import { PartiesPage } from './pages/ledger/PartiesPage';
import { LedgerSalesPage } from './pages/ledger/LedgerSalesPage';
import { PaymentInPage } from './pages/ledger/PaymentInPage';
import { PaymentOutPage } from './pages/ledger/PaymentOutPage';

// Lead Management Pages
import { LeadsPage } from './pages/leads/LeadsPage';
import { PipelinePage } from './pages/leads/PipelinePage';
import { FollowupsPage } from './pages/leads/FollowupsPage';

// HRMS Pages
import { HrmsDashboard } from './pages/hrms/HrmsDashboard';
import { AttendancePage } from './pages/hrms/AttendancePage';
import { LeavePage } from './pages/hrms/LeavePage';
import { PayrollPage } from './pages/hrms/PayrollPage';
import { EmployeesPage } from './pages/hrms/EmployeesPage';
import { ProjectsPage } from './pages/hrms/ProjectsPage';



import { canAccess } from './lib/permissions';
import { Toaster } from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

function MainAppContent() {
  const { user, mode } = useAuth();

  const [currentModule, setCurrentModule] = useState(mode === 'leads' ? 'leads' : 'dashboard');
  const [showGlobalInvoiceModal, setShowGlobalInvoiceModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Automatically reset to default module for active mode
  useEffect(() => {
    if (mode === 'leads') {
      setCurrentModule('leads');
    } else if (mode === 'hrms') {
      setCurrentModule('dashboard');
    } else {
      setCurrentModule('dashboard');
    }
  }, [mode]);

  // If user is not logged in, render Sign In
  if (!user) {
    return <LoginPage />;
  }

  // Check role permissions for current module
  const hasAccess = canAccess(user.role, currentModule, mode);

  // Module Router Renderer
  const renderModuleContent = () => {
    if (!hasAccess) {
      return (
        <div className="glass-strong p-8 sm:p-12 rounded-3xl text-center border border-white/60 dark:border-white/10 space-y-4 my-8">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white">Access Restricted</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Your user role <span className="font-bold text-[#00a631] uppercase">({user.role})</span> does not have access permissions for the{' '}
            <span className="font-bold text-[#3a3b39] dark:text-white uppercase">"{currentModule}"</span> module in {mode.toUpperCase()} mode.
          </p>
          <button
            type="button"
            onClick={() => setCurrentModule(mode === 'leads' ? 'leads' : 'dashboard')}
            className="px-5 py-2.5 bg-[#00a631] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow cursor-pointer"
          >
            Return to {mode === 'leads' ? 'Leads' : 'Dashboard'}
          </button>
        </div>
      );
    }



    if (mode === 'hrms') {
      switch (currentModule) {
        case 'dashboard':
          return <HrmsDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
        case 'projects':
          return <ProjectsPage />;
        case 'attendance':
          return <AttendancePage />;
        case 'leave':
          return <LeavePage />;
        case 'payroll':
          return <PayrollPage />;
        case 'employees':
          return <EmployeesPage />;
        default:
          return <HrmsDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
      }
    }

    if (mode === 'erp') {
      switch (currentModule) {
        case 'dashboard':
          return (
            <ErpDashboard
              onNavigate={(mod) => setCurrentModule(mod)}
            />
          );
        case 'customers':
          return <CustomersDealersPage />;
        case 'suppliers':
          return <SuppliersVendorsPage />;
        case 'products':
          return <ProductsInventoryPage />;
        case 'sales':
          return (
            <SalesInvoicesPage
              showCreateModalInitially={showGlobalInvoiceModal}
              onCloseCreateModal={() => setShowGlobalInvoiceModal(false)}
            />
          );
        case 'purchases':
          return <PurchasesPOsPage />;
        case 'returns':
          return <ReturnsPage />;
        case 'warranty':
          return <BatteryWarrantyPage />;
        case 'reports':
          return <ReportsAnalyticsPage />;
        case 'settings':
          return <SettingsPage />;
        case 'user-management':
          return <UserManagementPage />;
        default:
          return (
            <ErpDashboard
              onNavigate={(mod) => setCurrentModule(mod)}
            />
          );
      }
    } else if (mode === 'ledger') {
      switch (currentModule) {
        case 'dashboard':
          return <LedgerDashboard />;
        case 'parties':
          return <PartiesPage />;
        case 'sales':
          return <LedgerSalesPage />;
        case 'payment-in':
          return <PaymentInPage />;
        case 'payment-out':
          return <PaymentOutPage />;
        default:
          return <LedgerDashboard />;
      }
    } else {
      // Leads mode routing
      switch (currentModule) {
        case 'leads':
          return <LeadsPage />;
        case 'pipeline':
          return <PipelinePage />;
        case 'follow-ups':
          return <FollowupsPage />;
        default:
          return <LeadsPage />;
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#f5f4f0] dark:bg-[#141614] text-[#3a3b39] dark:text-gray-100 font-sans grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="bg-gradient-orbs fixed inset-0 z-0 pointer-events-none" />

      {/* Sidebar - Desktop */}
      <div className="hidden md:block col-start-1 h-[100dvh] z-20">
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          isMobileOpen={false}
          onCloseMobile={() => {}}
        />
      </div>

      {/* Main Area */}
      <div className="col-start-1 md:col-start-2 flex flex-col min-w-0 min-h-0 h-[100dvh] relative z-10">
        {/* Top Header */}
        <Header
          onOpenNewInvoiceModal={() => {
            if (mode === 'erp') {
              setCurrentModule('sales');
              setShowGlobalInvoiceModal(true);
            } else {
              setCurrentModule('sales');
            }
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 min-h-0 min-w-0 relative flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-[1400px] mx-auto space-y-6">
              {renderModuleContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => {
            setCurrentModule(mod);
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </div>
  );
}

export default function App() {
  console.log('Environment:', import.meta.env.MODE);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'MISSING');
  console.log('Using Supabase:', !!import.meta.env.VITE_SUPABASE_URL);

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
