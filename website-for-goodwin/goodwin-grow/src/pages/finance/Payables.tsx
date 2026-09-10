import React, { useState } from 'react';
import { Download, Filter, Search, Plus, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../lib/financeStore';

export const Payables = () => {
  const payables = useFinanceStore((state: any) => state.payables);
  const setPayables = useFinanceStore((state: any) => state.setPayables);
  const addPayable = useFinanceStore((state: any) => state.addPayable);
  const updatePayable = useFinanceStore((state: any) => state.updatePayable);
  const deletePayable = useFinanceStore((state: any) => state.deletePayable);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setEditingItem] = useState<any | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deletePayable(id);
  };

  const handleSave = async () => {
    if (isEditing?.id) {
      await updatePayable(isEditing.id, isEditing);
    } else {
      await addPayable(isEditing);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setPayables((prev: any) => prev.map((p: any) => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Accounts Payable</h1>
          <p className="text-secondary-light text-sm mt-1">Manage vendor bills and outgoing payments.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-canvas text-secondary-light font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Bill / Vendor</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-variant">
            {payables?.map((bill: any) => (
              <tr key={bill.id} className="hover:bg-canvas-variant/30 transition-colors group cursor-pointer" onClick={() => handleEdit(bill)}>
                <td className="px-6 py-4">
                  <div className="font-medium text-secondary-dark">{bill.vendor}</div>
                  <div className="text-xs text-secondary-light mt-0.5">{bill.invoiceNumber || bill.id}</div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-secondary-dark">
                  ${bill.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-secondary-light">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                    {bill.dueDate}
                  </div>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <Select 
                    value={bill.status}
                    onChange={(e) => handleStatusChange(bill.id, e.target.value)}
                    options={[
                      {value: 'Pending', label: 'Pending'},
                      {value: 'Paid', label: 'Paid'},
                      {value: 'Overdue', label: 'Overdue'}
                    ]}
                  />
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-primary">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing?.id ? "Edit Bill" : "Add Bill"}>
        <div className="space-y-4 mt-4">
          <div>
            <label className="enterprise-label">Vendor Name</label>
            <Input 
              value={isEditing?.vendor || ''} 
              onChange={e => setEditingItem({ ...isEditing, vendor: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Amount</label>
              <Input 
                type="number"
                value={isEditing?.amount || ''} 
                onChange={e => setEditingItem({ ...isEditing, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="enterprise-label">Due Date</label>
              <Input 
                type="date"
                value={isEditing?.dueDate || ''} 
                onChange={e => setEditingItem({ ...isEditing, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="enterprise-label">Status</label>
            <Select 
              value={isEditing?.status || 'Pending'}
              onChange={e => setEditingItem({ ...isEditing, status: e.target.value })}
              options={[{value: 'Pending', label: 'Pending'}, {value: 'Paid', label: 'Paid'}, {value: 'Overdue', label: 'Overdue'}]}
            />
          </div>
          <div className="flex justify-between pt-4 border-t border-canvas-variant">
            {isEditing?.id ? (
              <Button variant="destructive" onClick={() => { handleDelete(isEditing.id); setIsModalOpen(false); }}>Delete</Button>
            ) : <div></div>}
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
