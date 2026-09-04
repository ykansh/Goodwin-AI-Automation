import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { MarketingLayout } from './pages/marketing/MarketingLayout';
import { MarketingDashboard } from './pages/marketing/MarketingDashboard';
import { CampaignTracker } from './pages/marketing/CampaignTracker';
import { ContentCalendar } from './pages/marketing/ContentCalendar';
import { OperationsLayout } from './pages/operations/OperationsLayout';
import { ClientTracker } from './pages/operations/ClientTracker';
import { Workflows } from './pages/operations/Workflows';
import { HRMSLayout } from './pages/hrms/HRMSLayout';
import { Employees } from './pages/hrms/Employees';
import { Attendance } from './pages/hrms/Attendance';
import { FinanceLayout } from './pages/finance/FinanceLayout';
import { RevenueTracker } from './pages/finance/RevenueTracker';
import { AITools } from './pages/ai-slop/AITools';
import { AdminPanel } from './pages/admin/AdminPanel';
import { Login } from './pages/auth/Login';

// Placeholder Pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-2xl text-secondary font-display">{title}</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/marketing" replace />} />
          
          {/* Marketing Module */}
          <Route path="marketing" element={<MarketingLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MarketingDashboard />} />
            <Route path="campaigns" element={<CampaignTracker />} />
            <Route path="calendar" element={<ContentCalendar />} />
            <Route path="social" element={<PlaceholderPage title="Social Media" />} />
            <Route path="leads" element={<PlaceholderPage title="Leads" />} />
            <Route path="ads" element={<PlaceholderPage title="Ads" />} />
            <Route path="creatives" element={<PlaceholderPage title="Creatives" />} />
          </Route>
          
          {/* Operations Module */}
          <Route path="operations" element={<OperationsLayout />}>
            <Route index element={<Navigate to="clients" replace />} />
            <Route path="clients" element={<ClientTracker />} />
            <Route path="leads" element={<PlaceholderPage title="Lead Tracker" />} />
            <Route path="tasks" element={<PlaceholderPage title="Task Manager" />} />
            <Route path="projects" element={<PlaceholderPage title="Projects" />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="assets" element={<PlaceholderPage title="Assets" />} />
          </Route>
          
          {/* HRMS Module */}
          <Route path="hrms" element={<HRMSLayout />}>
            <Route index element={<Navigate to="employees" replace />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<PlaceholderPage title="Leave Management" />} />
            <Route path="payroll" element={<PlaceholderPage title="Payroll" />} />
            <Route path="recruit" element={<PlaceholderPage title="Recruitment" />} />
            <Route path="onboarding" element={<PlaceholderPage title="Onboarding" />} />
          </Route>
          
          {/* Finance Module */}
          <Route path="finance" element={<FinanceLayout />}>
            <Route index element={<Navigate to="revenue" replace />} />
            <Route path="revenue" element={<RevenueTracker />} />
            <Route path="expenses" element={<PlaceholderPage title="Expense Tracker" />} />
            <Route path="receivables" element={<PlaceholderPage title="Receivables" />} />
            <Route path="payables" element={<PlaceholderPage title="Payables" />} />
            <Route path="ledger" element={<PlaceholderPage title="Ledger" />} />
            <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          </Route>

          {/* AI Slop Module */}
          <Route path="ai-slop" element={<AITools />} />

          {/* Admin Module */}
          <Route path="admin" element={<AdminPanel />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
