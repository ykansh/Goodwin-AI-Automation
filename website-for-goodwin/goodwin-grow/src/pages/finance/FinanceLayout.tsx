import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { DollarSign, TrendingDown, FileText, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';
import { cn } from '../../lib/utils';

const financeNav = [
  { name: 'Revenue', path: '/finance/revenue', icon: DollarSign },
  { name: 'Expenses', path: '/finance/expenses', icon: TrendingDown },
  { name: 'Receivables', path: '/finance/receivables', icon: ArrowDownRight },
  { name: 'Payables', path: '/finance/payables', icon: ArrowUpRight },
  { name: 'Ledger', path: '/finance/ledger', icon: FileText },
  { name: 'Reports', path: '/finance/reports', icon: PieChart },
];

export const FinanceLayout = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Finance Hub</h1>
        <p className="text-secondary-light text-sm mt-1">Manage revenue, expenses, and financial reports.</p>
      </div>
      
      <div className="border-b border-canvas-variant overflow-x-auto hide-scrollbar">
        <nav className="flex space-x-1" aria-label="Finance Tabs">
          {financeNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-secondary-light hover:text-secondary-dark hover:border-secondary-light/30"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
