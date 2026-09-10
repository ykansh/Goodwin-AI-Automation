import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const mockPayroll = [
  { id: 1, name: 'Sarah Jenkins', month: 'Sept 2026', basic: 5000, allowances: 500, deductions: 200, net: 5300, status: 'Paid' },
  { id: 2, name: 'Mike Ross', month: 'Sept 2026', basic: 4500, allowances: 300, deductions: 150, net: 4650, status: 'Pending' },
  { id: 3, name: 'Elena Gilbert', month: 'Sept 2026', basic: 4800, allowances: 400, deductions: 100, net: 5100, status: 'Paid' },
];

export const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Payroll Management</h1>
          <p className="text-secondary-light text-sm mt-1">Manage employee salaries, deductions, and payslips.</p>
        </div>
        <Button>
          <DollarSign className="h-4 w-4 mr-2" />
          Run Payroll
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search employee..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="px-3">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas/50 border-b border-canvas-variant text-xs uppercase tracking-wider text-secondary-light font-semibold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4 text-right">Basic Salary</th>
                <th className="px-6 py-4 text-right">Net Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-variant">
              {mockPayroll.map((record) => (
                <tr key={record.id} className="hover:bg-canvas/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-secondary-dark">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {record.month}
                  </td>
                  <td className="px-6 py-4 text-secondary text-right font-medium text-secondary-light">
                    {formatCurrency(record.basic)}
                  </td>
                  <td className="px-6 py-4 text-secondary text-right font-bold text-success-dark">
                    {formatCurrency(record.net)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={record.status === 'Paid' ? 'success' : 'warning'}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                      Payslip
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
