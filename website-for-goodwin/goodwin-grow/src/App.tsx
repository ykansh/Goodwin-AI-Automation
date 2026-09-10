import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { MarketingLayout } from './pages/marketing/MarketingLayout';
import { MarketingDashboard } from './pages/marketing/MarketingDashboard';
import { CampaignTracker } from './pages/marketing/CampaignTracker';
import { ContentCalendar } from './pages/marketing/ContentCalendar';
import { SocialMedia } from './pages/marketing/SocialMedia';
import { Leads } from './pages/marketing/Leads';
import { Ads } from './pages/marketing/Ads';
import { Creatives } from './pages/marketing/Creatives';
import { OperationsLayout } from './pages/operations/OperationsLayout';
import { ClientTracker } from './pages/operations/ClientTracker';
import { LeadTracker } from './pages/operations/LeadTracker';
import { TaskManager } from './pages/operations/TaskManager';
import { Projects } from './pages/operations/Projects';
import { Workflows } from './pages/operations/Workflows';
import { Assets } from './pages/operations/Assets';
import { HRMSLayout } from './pages/hrms/HRMSLayout';
import { Employees } from './pages/hrms/Employees';
import { Attendance } from './pages/hrms/Attendance';
import { Leave } from './pages/hrms/Leave';
import { Payroll } from './pages/hrms/Payroll';
import { Recruitment } from './pages/hrms/Recruitment';
import { Onboarding } from './pages/hrms/Onboarding';
import { FinanceLayout } from './pages/finance/FinanceLayout';
import { RevenueTracker } from './pages/finance/RevenueTracker';
import { Expenses } from './pages/finance/Expenses';
import { Receivables } from './pages/finance/Receivables';
import { Payables } from './pages/finance/Payables';
import { Ledger } from './pages/finance/Ledger';
import { Reports } from './pages/finance/Reports';
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
            <Route path="social" element={<SocialMedia />} />
            <Route path="leads" element={<Leads />} />
            <Route path="ads" element={<Ads />} />
            <Route path="creatives" element={<Creatives />} />
          </Route>
          
          {/* Operations Module */}
          <Route path="operations" element={<OperationsLayout />}>
            <Route index element={<Navigate to="clients" replace />} />
            <Route path="clients" element={<ClientTracker />} />
            <Route path="leads" element={<LeadTracker />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="projects" element={<Projects />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="assets" element={<Assets />} />
          </Route>
          
          {/* HRMS Module */}
          <Route path="hrms" element={<HRMSLayout />}>
            <Route index element={<Navigate to="employees" replace />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="recruit" element={<Recruitment />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>
          
          {/* Finance Module */}
          <Route path="finance" element={<FinanceLayout />}>
            <Route index element={<Navigate to="revenue" replace />} />
            <Route path="revenue" element={<RevenueTracker />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="receivables" element={<Receivables />} />
            <Route path="payables" element={<Payables />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="reports" element={<Reports />} />
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
