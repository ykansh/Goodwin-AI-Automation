import { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { DataProvider } from './store/DataContext';
import { ThemeProvider } from './store/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

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

// Ledger-Pro Pages
import { LedgerDashboard } from './pages/ledger/LedgerDashboard';
import { PartiesPage } from './pages/ledger/PartiesPage';
import { LedgerSalesPage } from './pages/ledger/LedgerSalesPage';
import { PaymentInPage } from './pages/ledger/PaymentInPage';
import { PaymentOutPage } from './pages/ledger/PaymentOutPage';

import { canAccess } from './lib/permissions';
import { Toaster } from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

function MainAppContent() {
  const { user, mode } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [currentModule, setCurrentModule] = useState('dashboard');
  const [showGlobalInvoiceModal, setShowGlobalInvoiceModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is not logged in, render Sign In or Register flow
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
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
            onClick={() => setCurrentModule('dashboard')}
            className="px-5 py-2.5 bg-[#00a631] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      );
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
        default:
          return (
            <ErpDashboard
              onNavigate={(mod) => setCurrentModule(mod)}
            />
          );
      }
    } else {
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
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#141614] text-[#3a3b39] dark:text-gray-100 font-sans flex flex-col relative overflow-x-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="bg-gradient-orbs" />

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

      <div className="flex-1 w-full relative z-10 md:grid md:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[1400px] mx-auto space-y-6">
            {renderModuleContent()}
          </div>
        </main>
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </div>
  );
}

export default function App() {
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
