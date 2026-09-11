import React, { useState } from 'react';
import { Search, Filter, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useStore } from '../../lib/store';

export const Leave = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const leaves = useStore(state => state.leaves);
  const employees = useStore(state => state.employees);
  const requestLeave = useStore(state => state.requestLeave);
  const updateLeave = useStore(state => state.updateLeave);
  const deleteLeave = useStore(state => state.deleteLeave);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredLeaves = leaves.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !startDate || !endDate) return;
    
    setIsSubmitting(true);
    try {
      const s = new Date(startDate);
      const eDate = new Date(endDate);
      const diffTime = Math.abs(eDate.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (editingId) {
        await updateLeave(editingId, { employeeId, type, startDate, endDate, days: diffDays, status });
      } else {
        await requestLeave({ employeeId, type, startDate, endDate, days: diffDays });
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setEmployeeId('');
      setStartDate('');
      setEndDate('');
      setStatus('Pending');
    } catch (err: any) {
      alert('Failed to save leave: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (leave: any) => {
    setEditingId(leave.id);
    setEmployeeId(leave.employeeId);
    setType(leave.type);
    setStartDate(leave.startDate);
    setEndDate(leave.endDate);
    setStatus(leave.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave?')) return;
    try {
      await deleteLeave(id);
    } catch (err: any) {
      alert('Failed to delete leave: ' + err.message);
    }
  };

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
        <Button onClick={() => {
          setEditingId(null);
          setEmployeeId('');
          setStartDate('');
          setEndDate('');
          setStatus('Pending');
          setIsModalOpen(true);
        }}>
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
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-secondary-light">
                    No leaves found.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
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
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-primary" onClick={() => handleEdit(leave)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-danger" onClick={() => handleDelete(leave.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Leave" : "Request Leave"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Employee</label>
            <Select 
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={[
                { value: '', label: 'Select Employee...' },
                ...employees.map(emp => ({ value: emp.id, label: emp.name }))
              ]}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Leave Type</label>
            <Select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: 'Sick Leave', label: 'Sick Leave' },
                { value: 'Vacation', label: 'Vacation' },
                { value: 'Casual Leave', label: 'Casual Leave' }
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Start Date</label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">End Date</label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </div>
          </div>
          
          {editingId && (
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Status</label>
              <Select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' }
                ]}
                required
              />
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Requesting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
