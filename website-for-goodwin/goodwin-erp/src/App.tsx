import { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/auth/LoginPage';
import { canAccess } from './lib/permissions';
import { Toaster } from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

// Modules
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
import { PartiesPage } from './pages/ledger/PartiesPage';
import { PaymentInPage } from './pages/ledger/PaymentInPage';
import { PaymentOutPage } from './pages/ledger/PaymentOutPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { PipelinePage } from './pages/leads/PipelinePage';
import { FollowupsPage } from './pages/leads/FollowupsPage';
import { AttendancePage } from './pages/hrms/AttendancePage';
import { LeavePage } from './pages/hrms/LeavePage';
import { PayrollPage } from './pages/hrms/PayrollPage';
import { EmployeesPage } from './pages/hrms/EmployeesPage';
import { ProjectsPage } from './pages/hrms/ProjectsPage';

function MainAppContent() {
  const { user } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [showGlobalInvoiceModal, setShowGlobalInvoiceModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is not logged in, render Sign In
  if (!user) {
    return <LoginPage />;
  }

  // Check role permissions for current module
  const hasAccess = canAccess(user.role, currentModule);

  // Module Router Renderer
  const renderModuleContent = () => {
    if (!hasAccess) {
      return (
        <div className="glass-strong p-8 sm:p-12 rounded-3xl text-center border border-black/10 dark:border-white/10 space-y-4 my-8">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-[#111814] dark:text-white">Access Restricted</h2>
          <p className="text-xs sm:text-sm text-[#5f7365] dark:text-[#8fa093] max-w-md mx-auto">
            Your user role <span className="font-bold text-[#22c55e] uppercase">({user.role.replace('_', ' ')})</span> does not have access permissions for the{' '}
            <span className="font-bold text-[#111814] dark:text-white uppercase">"{currentModule}"</span> module.
          </p>
          <button
            type="button"
            onClick={() => setCurrentModule('dashboard')}
            className="px-5 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow cursor-pointer transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (currentModule) {
      case 'dashboard': return <ErpDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'customers': return <CustomersDealersPage />;
      case 'suppliers': return <SuppliersVendorsPage />;
      case 'products': return <ProductsInventoryPage />;
      case 'sales': 
        return <SalesInvoicesPage 
          showCreateModalInitially={showGlobalInvoiceModal}
          onCloseCreateModal={() => setShowGlobalInvoiceModal(false)}
        />;
      case 'purchases': return <PurchasesPOsPage />;
      case 'returns': return <ReturnsPage />;
      case 'warranty': return <BatteryWarrantyPage />;
      case 'reports': return <ReportsAnalyticsPage />;
      case 'settings': return <SettingsPage />;
      case 'user-management': return <UserManagementPage />;
      
      // Ledger/Finance
      case 'parties': return <PartiesPage />;
      case 'payment-in': return <PaymentInPage />;
      case 'payment-out': return <PaymentOutPage />;
      
      // CRM
      case 'leads': return <LeadsPage />;
      case 'pipeline': return <PipelinePage />;
      case 'follow-ups': return <FollowupsPage />;
      
      // HRMS
      case 'employees': return <EmployeesPage />;
      case 'attendance': return <AttendancePage />;
      case 'leave': return <LeavePage />;
      case 'payroll': return <PayrollPage />;
      case 'projects': return <ProjectsPage />;
      
      default:
        return <ErpDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#f8faf9] dark:bg-[#07100c] text-[#111814] dark:text-gray-100 font-sans grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] overflow-hidden transition-colors duration-300 selection:bg-[#22c55e]/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#22c55e 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#22c55e]/5 dark:bg-[#22c55e]/10 rounded-full blur-[120px] pointer-events-none" />

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
      <div className="col-start-1 md:col-start-2 flex flex-col min-w-0 min-h-0 h-[100dvh] relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.02)] border-l border-black/5 dark:border-white/5">
        
        <Header
          onOpenNewInvoiceModal={() => {
            setCurrentModule('sales');
            setShowGlobalInvoiceModal(true);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 min-h-0 min-w-0 relative flex flex-col scroll-smooth">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <div className="w-full max-w-[1500px] mx-auto">
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

      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            background: '#0f1612',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
          }
        }} 
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
