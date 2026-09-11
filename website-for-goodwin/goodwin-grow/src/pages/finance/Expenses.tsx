import React, { useState } from 'react';
import { Search, Plus, ArrowLeft, Edit, Trash2, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../lib/financeStore';
import { useOperationsStore } from '../../lib/operationsStore';

export const Expenses = () => {
  const expenses = useFinanceStore((state: any) => state.expenses);
  const setExpenses = useFinanceStore((state: any) => state.setExpenses);
  const addExpense = useFinanceStore((state: any) => state.addExpense);
  const updateExpense = useFinanceStore((state: any) => state.updateExpense);
  const deleteExpense = useFinanceStore((state: any) => state.deleteExpense);
  const projects = useOperationsStore((state: any) => state.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'others' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'Software',
    id: '',
    projectId: ''
  });

  const getProjectName = (id: string | 'others') => {
    if (id === 'others') return 'Company / Others';
    return projects?.find((p: any) => p.id === id)?.projectName || 'Unknown Project';
  };

  const getProjectCompany = (id: string | 'others') => {
    if (id === 'others') return 'Internal Expenses';
    return projects?.find((p: any) => p.id === id)?.companyName || '';
  };

  const filteredProjects = projects?.filter((p: any) => 
    p.projectName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    p.companyName?.toLowerCase()?.includes(searchTerm.toLowerCase())
  ) || [];

  const handleSave = async () => {
    try {
      if (editingExpense !== null) {
        await updateExpense(formData.id, formData);
      } else {
        await addExpense(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save expense: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (err: any) {
        alert('Failed to delete expense: ' + err.message);
      }
    }
  };

  const handleExport = (projectExpenses: any[], projectName: string) => {
    const csvHeader = "Date,Description,Category,Amount\n";
    const csvRows = projectExpenses.map(e => 
      `${e.date},"${e.description}","${e.category}",${e.amount}`
    );
    const blob = new Blob([csvHeader + csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openAddModal = (projectId: string | 'others') => {
    setSelectedProjectId(projectId);
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: 'Software',
      id: '',
      projectId
    });
    setIsModalOpen(false);
    setTimeout(() => setIsModalOpen(true), 50);
  };

  const openEditModal = (expense: any) => {
    setSelectedProjectId(expense.projectId);
    setEditingExpense(expense);
    setFormData(expense);
    setIsModalOpen(true);
  };

  if (selectedProjectId) {
    const projectExpenses = expenses?.filter((e: any) => e.projectId === selectedProjectId) || [];
    const totalSpent = projectExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedProjectId(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-dark tracking-tight">
              {getProjectName(selectedProjectId)} Expenses
            </h1>
            <p className="text-secondary-light text-sm mt-1">{getProjectCompany(selectedProjectId)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
          <div className="text-secondary-dark font-medium">
            Total Spent: <span className="text-danger font-bold ml-2">${totalSpent.toLocaleString()}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => handleExport(projectExpenses, getProjectName(selectedProjectId))}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => openAddModal(selectedProjectId)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-canvas text-secondary-light font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-variant">
              {projectExpenses.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-canvas-variant/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-secondary-light">{expense.date}</td>
                  <td className="px-6 py-4 font-medium text-secondary-dark">{expense.description}</td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{expense.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-secondary-dark">
                    ${expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(expense)}>
                        <Edit className="h-4 w-4 text-secondary-light" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger" onClick={() => handleDelete(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {projectExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-secondary-light">
                    No expenses logged for this project yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Project Expenses</h1>
          <p className="text-secondary-light text-sm mt-1">Track and manage costs across all operations.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm justify-between">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <Input 
            type="text" 
            placeholder="Search projects..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={() => handleExport(expenses || [], 'All_Projects')}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          onClick={() => setSelectedProjectId('others')}
          className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <h3 className="font-semibold text-lg text-secondary-dark group-hover:text-primary transition-colors">Internal / Others</h3>
            <p className="text-sm text-secondary-light mt-1">General company expenses</p>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-xs text-secondary-light mb-1">Total Spent</p>
              <p className="font-bold text-danger text-lg">
                ${(expenses?.filter((e: any) => e.projectId === 'others').reduce((sum: number, e: any) => sum + e.amount, 0) || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
              <ArrowLeft className="h-4 w-4 rotate-135" />
            </div>
          </div>
        </div>

        {filteredProjects.map((project: any) => {
          const projectExpenses = expenses?.filter((e: any) => e.projectId === project.id) || [];
          const totalSpent = projectExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

          return (
            <div 
              key={project.id} 
              onClick={() => setSelectedProjectId(project.id)}
              className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <h3 className="font-semibold text-lg text-secondary-dark group-hover:text-primary transition-colors">{project.projectName}</h3>
                <p className="text-sm text-secondary-light mt-1">{project.companyName}</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs text-secondary-light mb-1">Total Spent</p>
                  <p className="font-bold text-danger text-lg">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <ArrowLeft className="h-4 w-4 rotate-135" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? "Edit Expense" : "Add Expense"}>
        <div className="space-y-4 mt-4">
          <div>
            <label className="enterprise-label">Description</label>
            <Input 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="e.g., Software Subscription"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Category</label>
              <Select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                options={[
                  {value: 'Software', label: 'Software'},
                  {value: 'Hardware', label: 'Hardware'},
                  {value: 'Marketing', label: 'Marketing'},
                  {value: 'Travel', label: 'Travel'},
                  {value: 'Other', label: 'Other'}
                ]}
              />
            </div>
            <div>
              <label className="enterprise-label">Amount ($)</label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="enterprise-label">Date</label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingExpense ? "Save Changes" : "Add Expense"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
