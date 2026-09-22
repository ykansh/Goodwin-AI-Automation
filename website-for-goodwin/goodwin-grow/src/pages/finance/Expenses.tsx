import React, { useState, useRef } from 'react';
import { Search, Plus, ArrowLeft, Edit, Trash2, Download, Receipt, Upload, X, Bot } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../lib/financeStore';
import type { Expense } from '../../lib/financeStore';
import { useOperationsStore } from '../../lib/operationsStore';
import { compressImageFile, downloadFile } from '../../lib/imageUtils';

export const Expenses = () => {
  const expenses = useFinanceStore((state: any) => state.expenses);
  const addExpense = useFinanceStore((state: any) => state.addExpense);
  const updateExpense = useFinanceStore((state: any) => state.updateExpense);
  const deleteExpense = useFinanceStore((state: any) => state.deleteExpense);
  const projects = useOperationsStore((state: any) => state.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'others' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  // Proof Modal state
  const [selectedProofExpense, setSelectedProofExpense] = useState<Expense | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'Software',
    id: '',
    projectId: '',
    receiptUrl: ''
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingProof(true);
      const dataUrl = await compressImageFile(file, 1200, 0.8);
      setFormData((prev: any) => ({
        ...prev,
        receiptUrl: dataUrl
      }));
    } catch (err: any) {
      alert('Failed to process receipt image: ' + err.message);
    } finally {
      setIsUploadingProof(false);
    }
  };

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
    const csvHeader = "Date,Description,Category,Amount,Has_Proof\n";
    const csvRows = projectExpenses.map(e => 
      `${e.date},"${e.description}","${e.category}",${e.amount},"${e.receiptUrl ? 'Yes' : 'No'}"`
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
      projectId,
      receiptUrl: ''
    });
    setIsModalOpen(false);
    setTimeout(() => setIsModalOpen(true), 50);
  };

  const openEditModal = (expense: any) => {
    setSelectedProjectId(expense.projectId);
    setEditingExpense(expense);
    setFormData({
      ...expense,
      receiptUrl: expense.receiptUrl || ''
    });
    setIsModalOpen(true);
  };

  if (selectedProjectId) {
    const projectExpenses = expenses?.filter((e: any) => e.projectId === selectedProjectId) || [];
    const totalSpent = projectExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const totalWithProof = projectExpenses.filter((e: any) => !!e.receiptUrl).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedProjectId(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-dark tracking-tight flex items-center gap-2">
              <span>{getProjectName(selectedProjectId)} Expenses</span>
              {selectedProjectId === 'others' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Internal
                </span>
              )}
            </h1>
            <p className="text-secondary-light text-sm mt-1">{getProjectCompany(selectedProjectId)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
          <div className="flex items-center gap-6">
            <div className="text-secondary-dark font-medium">
              Total Spent: <span className="text-danger font-bold ml-2">₹{totalSpent.toLocaleString()}</span>
            </div>
            <div className="text-xs text-secondary-light">
              <span className="font-semibold text-secondary-dark">{totalWithProof}</span> of {projectExpenses.length} with proof
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
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
                <th className="px-6 py-4">Proof / Receipt</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-variant">
              {projectExpenses.map((expense: any) => {
                const isFromAISlop = expense.description?.startsWith('AI Tool:') || expense.aiToolId;

                return (
                  <tr key={expense.id} className="hover:bg-canvas-variant/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-secondary-light">{expense.date}</td>
                    <td className="px-6 py-4 font-medium text-secondary-dark">
                      <div className="flex items-center gap-2">
                        <span>{expense.description}</span>
                        {isFromAISlop && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-tertiary/25 text-tertiary-dark border border-tertiary/30">
                            <Bot className="h-3 w-3" />
                            AI Slop
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{expense.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {expense.receiptUrl ? (
                        <button
                          onClick={() => setSelectedProofExpense(expense)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors border border-primary/20 shadow-xs"
                          title="Click to view verified image receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-xs text-secondary-light/60 italic">No receipt</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-secondary-dark">
                      ₹{expense.amount.toLocaleString()}
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
                );
              })}
              {projectExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-secondary-light">
                    No expenses logged for this project yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PROOF PREVIEW MODAL */}
        <Modal
          isOpen={!!selectedProofExpense}
          onClose={() => setSelectedProofExpense(null)}
          title={`Receipt Proof: ${selectedProofExpense?.description || 'Expense'}`}
          className="max-w-2xl"
        >
          {selectedProofExpense && (
            <div className="space-y-4">
              <div className="bg-canvas-variant/30 p-3 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-secondary-light">Amount: </span>
                  <strong className="text-secondary-dark font-bold">₹{selectedProofExpense.amount?.toLocaleString()}</strong>
                  <span className="mx-2">•</span>
                  <span className="text-secondary-light">Date: </span>
                  <strong className="text-secondary-dark">{selectedProofExpense.date}</strong>
                  <span className="mx-2">•</span>
                  <span className="text-secondary-light">Category: </span>
                  <strong className="text-primary">{selectedProofExpense.category}</strong>
                </div>
                <Button 
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7"
                  onClick={() => selectedProofExpense.receiptUrl && downloadFile(selectedProofExpense.receiptUrl, `expense_receipt_${selectedProofExpense.date}.jpg`)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>

              <div className="max-h-[60vh] overflow-auto rounded-xl border border-canvas-variant flex items-center justify-center bg-canvas p-2">
                <img 
                  src={selectedProofExpense.receiptUrl} 
                  alt={`${selectedProofExpense.description} Receipt`}
                  className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedProofExpense(null)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* EDIT / ADD MODAL */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? "Edit Expense" : "Add Expense"}>
          <div className="space-y-4 mt-4">
            <div>
              <label className="enterprise-label">Description *</label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Software Subscription, Cloud Server, Hardware"
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
                <label className="enterprise-label">Amount (₹) *</label>
                <Input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="col-span-2">
                <label className="enterprise-label">Date</label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            {/* Receipt Proof Upload in Expense Modal */}
            <div className="border border-canvas-variant rounded-xl p-3.5 bg-canvas space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase text-secondary-dark flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-primary" />
                  <span>Image Receipt / Invoice Proof</span>
                </label>
                {formData.receiptUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, receiptUrl: '' })}
                    className="text-xs text-danger hover:underline flex items-center gap-0.5"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleFileChange}
              />

              {formData.receiptUrl ? (
                <div className="rounded-lg overflow-hidden border border-canvas-variant bg-canvas-surface p-2 flex items-center gap-3">
                  <img 
                    src={formData.receiptUrl} 
                    alt="Receipt preview" 
                    className="h-14 w-14 object-cover rounded border border-canvas-variant"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-secondary-dark">Receipt Attached</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Replace Image
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-canvas-variant hover:border-primary/60 rounded-xl p-3 text-center cursor-pointer transition-colors bg-canvas-surface/50"
                >
                  <Upload className="h-5 w-5 mx-auto text-secondary-light mb-1" />
                  <p className="text-xs font-medium text-secondary-dark">
                    {isUploadingProof ? 'Processing...' : 'Upload receipt image'}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingExpense ? "Save Changes" : "Add Expense"}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Project Expenses</h1>
          <p className="text-secondary-light text-sm mt-1">Track and manage costs across all operations and internal tools.</p>
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
        {/* INTERNAL / OTHERS CARD */}
        <div 
          onClick={() => setSelectedProjectId('others')}
          className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-secondary-dark group-hover:text-primary transition-colors">Internal / Others</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Internal</span>
            </div>
            <p className="text-sm text-secondary-light mt-1">General company & internal AI tools</p>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-xs text-secondary-light mb-1">Total Spent</p>
              <p className="font-bold text-danger text-lg">
                ₹{(expenses?.filter((e: any) => e.projectId === 'others').reduce((sum: number, e: any) => sum + e.amount, 0) || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
              <ArrowLeft className="h-4 w-4 rotate-135" />
            </div>
          </div>
        </div>

        {/* OPERATIONS PROJECTS CARDS */}
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
                  <p className="font-bold text-danger text-lg">₹{totalSpent.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <ArrowLeft className="h-4 w-4 rotate-135" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
