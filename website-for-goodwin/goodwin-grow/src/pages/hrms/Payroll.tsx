import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useStore } from '../../lib/store';

export const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const payroll = useStore(state => state.payroll);
  const runPayroll = useStore(state => state.runPayroll);
  const updatePayroll = useStore(state => state.updatePayroll);
  const deletePayroll = useStore(state => state.deletePayroll);
  const [isRunning, setIsRunning] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('Pending');

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updatePayroll(editingId, { status: editStatus });
      setIsEditModalOpen(false);
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll record?')) return;
    try {
      await deletePayroll(id);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const filteredPayroll = payroll.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.month?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRunPayroll = async () => {
    setIsRunning(true);
    try {
      await runPayroll();
      alert('Payroll run successfully!');
    } catch (err: any) {
      alert('Failed to run payroll: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = () => {
    if (filteredPayroll.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = ['Employee', 'Month', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayroll.map(p => 
        `"${p.name}","${p.month}",${p.basic},${p.allowances},${p.deductions},${p.net},"${p.status}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'payroll_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <Button onClick={handleRunPayroll} disabled={isRunning}>
          <DollarSign className="h-4 w-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Payroll'}
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
        
        <Button variant="secondary" onClick={handleExport}>
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
              {filteredPayroll.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-secondary-light">
                    No payroll data found.
                  </td>
                </tr>
              ) : (
                filteredPayroll.map((record) => (
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
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                      Payslip
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-primary" onClick={() => handleEdit(record)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-danger" onClick={() => handleDelete(record.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Payroll Record">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Status</label>
            <Select 
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
