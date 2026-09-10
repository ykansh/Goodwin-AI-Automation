import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart, TrendingUp, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Reports = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Financial Reports</h1>
          <p className="text-secondary-light text-sm mt-1">High-level overview of company financial health.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Downloading Financial Report PDF...')}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-success/10 rounded-lg text-success-dark">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-success flex items-center bg-success/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
            </span>
          </div>
          <h3 className="text-secondary-light text-sm font-medium mb-1">Total Revenue (YTD)</h3>
          <p className="text-3xl font-bold text-secondary-dark font-display">{formatCurrency(850000)}</p>
        </div>

        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-danger/10 rounded-lg text-danger">
              <PieChart className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-danger flex items-center bg-danger/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +5.2%
            </span>
          </div>
          <h3 className="text-secondary-light text-sm font-medium mb-1">Total Expenses (YTD)</h3>
          <p className="text-3xl font-bold text-secondary-dark font-display">{formatCurrency(420000)}</p>
        </div>

        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary-dark">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-success flex items-center bg-success/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Stable
            </span>
          </div>
          <h3 className="text-secondary-light text-sm font-medium mb-1">Net Profit (YTD)</h3>
          <p className="text-3xl font-bold text-secondary-dark font-display">{formatCurrency(430000)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm">
          <h3 className="font-semibold text-secondary-dark text-lg mb-6">Expense Breakdown (Current Month)</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-secondary-dark">Payroll</span>
                <span className="text-secondary-light">{formatCurrency(45000)} (60%)</span>
              </div>
              <div className="w-full bg-canvas-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-secondary-dark">Software & Infrastructure</span>
                <span className="text-secondary-light">{formatCurrency(15000)} (20%)</span>
              </div>
              <div className="w-full bg-canvas-variant rounded-full h-2">
                <div className="bg-tertiary h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-secondary-dark">Marketing & Ads</span>
                <span className="text-secondary-light">{formatCurrency(11250)} (15%)</span>
              </div>
              <div className="w-full bg-canvas-variant rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-secondary-dark">Office & Utilities</span>
                <span className="text-secondary-light">{formatCurrency(3750)} (5%)</span>
              </div>
              <div className="w-full bg-canvas-variant rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Preview */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm">
          <h3 className="font-semibold text-secondary-dark text-lg mb-6">Pending Cashflow</h3>
          
          <div className="space-y-6 mt-8">
            <div className="p-4 rounded-lg bg-success/5 border border-success/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-success-dark">Accounts Receivable</p>
                <p className="text-xs text-success/70 mt-1">Incoming within 30 days</p>
              </div>
              <p className="text-xl font-bold text-success-dark">+{formatCurrency(45000)}</p>
            </div>

            <div className="p-4 rounded-lg bg-danger/5 border border-danger/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-danger">Accounts Payable</p>
                <p className="text-xs text-danger/70 mt-1">Outgoing within 30 days</p>
              </div>
              <p className="text-xl font-bold text-danger">-{formatCurrency(18500)}</p>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-canvas-variant flex justify-between items-center border-t-2 border-t-primary mt-8">
              <div>
                <p className="text-sm font-medium text-secondary-dark">Projected Cashflow</p>
                <p className="text-xs text-secondary-light mt-1">Net position</p>
              </div>
              <p className="text-2xl font-bold text-primary-dark">+{formatCurrency(26500)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
