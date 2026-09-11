import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart, TrendingUp, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useFinanceStore } from '../../lib/financeStore';

export const Reports = () => {
  const { invoices, expenses, receivables, payables } = useFinanceStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Assuming unpaid or pending are considered due
  const totalReceivable = receivables
    .filter(r => r.status?.toLowerCase() !== 'paid')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalPayable = payables
    .filter(p => p.status?.toLowerCase() !== 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const projectedCashflow = totalReceivable - totalPayable;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc: any, exp: any) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
    return acc;
  }, {});

  const totalExpForCat = Math.max(totalExpenses, 1); // prevent division by zero

  const categoryColors: Record<string, string> = {
    'Software': 'bg-tertiary',
    'Hardware': 'bg-primary',
    'Marketing': 'bg-warning',
    'Travel': 'bg-danger',
    'Other': 'bg-success'
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
          </div>
          <h3 className="text-secondary-light text-sm font-medium mb-1">Total Revenue (YTD)</h3>
          <p className="text-3xl font-bold text-secondary-dark font-display">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-danger/10 rounded-lg text-danger">
              <PieChart className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-secondary-light text-sm font-medium mb-1">Total Expenses (YTD)</h3>
          <p className="text-3xl font-bold text-secondary-dark font-display">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary-dark">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-secondary-light text-sm font-medium mb-1">Net Profit (YTD)</h3>
          <p className="text-3xl font-bold text-secondary-dark font-display">{formatCurrency(netProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm">
          <h3 className="font-semibold text-secondary-dark text-lg mb-6">Expense Breakdown</h3>
          
          <div className="space-y-6">
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-secondary-light text-sm">No expenses recorded yet.</p>
            ) : (
              Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => {
                const percentage = Math.round((amount / totalExpForCat) * 100);
                const colorClass = categoryColors[category] || 'bg-primary';
                
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-secondary-dark">{category}</span>
                      <span className="text-secondary-light">{formatCurrency(amount)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-canvas-variant rounded-full h-2">
                      <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cashflow Preview */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm">
          <h3 className="font-semibold text-secondary-dark text-lg mb-6">Pending Cashflow</h3>
          
          <div className="space-y-6 mt-8">
            <div className="p-4 rounded-lg bg-success/5 border border-success/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-success-dark">Accounts Receivable</p>
                <p className="text-xs text-success/70 mt-1">Pending incoming</p>
              </div>
              <p className="text-xl font-bold text-success-dark">+{formatCurrency(totalReceivable)}</p>
            </div>

            <div className="p-4 rounded-lg bg-danger/5 border border-danger/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-danger">Accounts Payable</p>
                <p className="text-xs text-danger/70 mt-1">Pending outgoing</p>
              </div>
              <p className="text-xl font-bold text-danger">-{formatCurrency(totalPayable)}</p>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-canvas-variant flex justify-between items-center border-t-2 border-t-primary mt-8">
              <div>
                <p className="text-sm font-medium text-secondary-dark">Projected Cashflow</p>
                <p className="text-xs text-secondary-light mt-1">Net position</p>
              </div>
              <p className="text-2xl font-bold text-primary-dark">
                {projectedCashflow >= 0 ? '+' : ''}{formatCurrency(projectedCashflow)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
