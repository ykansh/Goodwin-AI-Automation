import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const mockLeaves = [
  { id: 1, name: 'Sarah Jenkins', type: 'Sick Leave', startDate: '2026-10-10', endDate: '2026-10-12', days: 3, status: 'Approved' },
  { id: 2, name: 'Mike Ross', type: 'Vacation', startDate: '2026-11-01', endDate: '2026-11-10', days: 10, status: 'Pending' },
  { id: 3, name: 'Elena Gilbert', type: 'Casual Leave', startDate: '2026-09-20', endDate: '2026-09-20', days: 1, status: 'Rejected' },
];

export const Leave = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Leave Management</h1>
          <p className="text-secondary-light text-sm mt-1">Manage employee leave requests and balances.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
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
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas/50 border-b border-canvas-variant text-xs uppercase tracking-wider text-secondary-light font-semibold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-variant">
              {mockLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-canvas/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-secondary-dark">
                    {leave.name}
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {leave.type}
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {leave.days}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadge(leave.status) as any}>
                      {leave.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4 text-secondary-light" />
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
