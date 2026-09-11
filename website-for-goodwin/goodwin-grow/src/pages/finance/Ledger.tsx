import React, { useState } from 'react';
import { Download, Filter, Search, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../lib/financeStore';

export const Ledger = () => {
  const transactions = useFinanceStore((state: any) => state.transactions);
  const setTransactions = useFinanceStore((state: any) => state.setTransactions);
  const addTransaction = useFinanceStore((state: any) => state.addTransaction);
  const updateTransaction = useFinanceStore((state: any) => state.updateTransaction);
  const deleteTransaction = useFinanceStore((state: any) => state.deleteTransaction);
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
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (err: any) {
        alert('Failed to delete transaction: ' + err.message);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing?.id) {
        await updateTransaction(isEditing.id, isEditing);
      } else {
        await addTransaction({
          ...isEditing,
          date: isEditing?.date || new Date().toISOString().split('T')[0]
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save transaction: ' + err.message);
    }
  };

  const handleExport = () => {
    const csvHeader = "ID,Date,Description,Type,Amount\n";
    const csvRows = transactions.map((t: any) => 
      `${t.id},${t.date},"${t.description}",${t.type},${t.amount}`
    );
    const blob = new Blob([csvHeader + csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">General Ledger</h1>
          <p className="text-secondary-light text-sm mt-1">Master record of all financial transactions.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-canvas text-secondary-light font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-variant">
            {transactions?.map((txn: any) => (
              <tr key={txn.id} className="hover:bg-canvas-variant/30 transition-colors group cursor-pointer" onClick={() => handleEdit(txn)}>
                <td className="px-6 py-4 text-secondary-light font-mono text-xs">{txn.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-secondary-light">{txn.date}</td>
                <td className="px-6 py-4 font-medium text-secondary-dark">{txn.description}</td>
                <td className="px-6 py-4">
                  <Badge variant={txn.type === 'Credit' ? 'success' : 'default'}>
                    <span className="flex items-center">
                      {txn.type === 'Credit' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {txn.type}
                    </span>
                  </Badge>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${txn.type === 'Credit' ? 'text-green-600' : 'text-secondary-dark'}`}>
                  {txn.type === 'Credit' ? '+' : '-'}${txn.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing?.id ? "Edit Transaction" : "Add Transaction"}>
        <div className="space-y-4 mt-4">
          <div>
            <label className="enterprise-label">Description</label>
            <Input 
              value={isEditing?.description || ''} 
              onChange={e => setEditingItem({ ...isEditing, description: e.target.value })}
            />
          </div>
          <div>
            <label className="enterprise-label">Type</label>
            <Select 
              value={isEditing?.type || 'Debit'}
              onChange={e => setEditingItem({ ...isEditing, type: e.target.value })}
              options={[{value: 'Credit', label: 'Credit'}, {value: 'Debit', label: 'Debit'}]}
            />
          </div>
          <div>
            <label className="enterprise-label">Amount</label>
            <Input 
              type="number"
              value={isEditing?.amount || ''} 
              onChange={e => setEditingItem({ ...isEditing, amount: Number(e.target.value) })}
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
