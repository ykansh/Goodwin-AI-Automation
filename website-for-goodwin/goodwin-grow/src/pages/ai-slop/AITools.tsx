import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { 
  Plus, 
  Search, 
  Bot, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Upload, 
  Receipt, 
  Eye, 
  Download, 
  Building, 
  Briefcase, 
  X,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useStore } from '../../lib/store';
import type { AITool } from '../../lib/store';
import { useFinanceStore } from '../../lib/financeStore';
import { useOperationsStore } from '../../lib/operationsStore';
import { compressImageFile, downloadFile } from '../../lib/imageUtils';

export const AITools = () => {
  const navigate = useNavigate();
  const { aiTools, addAITool, updateAITool, deleteAITool } = useStore();
  const { addExpense, updateExpense, deleteExpense } = useFinanceStore();
  const projects = useOperationsStore((state) => state.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Partial<AITool> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Proof Modal state
  const [selectedProofTool, setSelectedProofTool] = useState<AITool | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = aiTools.filter(tool => 
    tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.usedFor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlySpend = aiTools.reduce((acc, t) => acc + (Number(t.cost) || 0), 0);

  const getTargetLabel = (targetId?: string) => {
    if (!targetId || targetId === 'others') return 'Internal (Company)';
    const proj = projects?.find(p => p.id === targetId);
    return proj ? `Project: ${proj.projectName}` : 'Project Expense';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file, 1200, 0.8);
      setIsEditing(prev => ({
        ...prev,
        receiptUrl: dataUrl
      }));
    } catch (err: any) {
      alert('Failed to process receipt image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!isEditing?.name) {
      alert('Please enter a tool name.');
      return;
    }

    try {
      const targetProjectId = isEditing.expenseTarget || 'others';
      const toolCost = Number(isEditing.cost) || 0;
      const todayDate = new Date().toISOString().split('T')[0];
      const expenseDate = isEditing.renewal || todayDate;
      const expenseDescription = `AI Tool: ${isEditing.name}`;

      if (isEditing.id) {
        // Update existing tool
        let currentExpenseId = isEditing.expenseId;

        if (currentExpenseId) {
          // Update existing finance expense
          await updateExpense(currentExpenseId, {
            description: expenseDescription,
            amount: toolCost,
            category: 'Software',
            projectId: targetProjectId,
            date: expenseDate,
            receiptUrl: isEditing.receiptUrl
          });
        } else {
          // If no linked expense yet, create one
          const exp = await addExpense({
            description: expenseDescription,
            amount: toolCost,
            category: 'Software',
            projectId: targetProjectId,
            date: expenseDate,
            receiptUrl: isEditing.receiptUrl,
            aiToolId: isEditing.id
          });
          if (exp?.id) {
            isEditing.expenseId = exp.id;
          }
        }

        await updateAITool(isEditing.id, isEditing);
      } else {
        // Adding a new tool: record expense in Finance -> Expenses
        const exp = await addExpense({
          description: expenseDescription,
          amount: toolCost,
          category: 'Software',
          projectId: targetProjectId,
          date: expenseDate,
          receiptUrl: isEditing.receiptUrl
        });

        const newTool = {
          ...(isEditing as Omit<AITool, 'id'>),
          cost: toolCost,
          expenseTarget: targetProjectId,
          expenseId: exp?.id
        };

        await addAITool(newTool);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save AI tool: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const tool = aiTools.find(t => t.id === id);
    if (window.confirm(`Are you sure you want to delete "${tool?.name || 'this tool'}"? This will also remove its corresponding expense in Finance.`)) {
      try {
        if (tool?.expenseId) {
          await deleteExpense(tool.expenseId);
        }
        await deleteAITool(id);
      } catch (err: any) {
        alert('Failed to delete tool: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-tertiary/20 rounded-lg">
            <Bot className="h-8 w-8 text-tertiary-dark" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-secondary-dark tracking-tight">AI Slop</h1>
            <p className="text-secondary-light">
              Manage AI tools, subscriptions, purchase proofs, and auto-sync with Finance Expenses.
            </p>
          </div>
        </div>

        {/* Quick Finance Sync Status Banner */}
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/finance/expenses')}
            className="text-xs"
            title="View reflected expenses in Finance"
          >
            <DollarSign className="h-4 w-4 mr-1.5 text-primary" />
            View in Finance Expenses
          </Button>
        </div>
      </div>

      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-light font-medium">Total AI Tools</p>
            <p className="text-2xl font-bold font-display text-secondary-dark mt-0.5">{aiTools.length}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary-dark">
            <Bot className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-light font-medium">Total Monthly Spend</p>
            <p className="text-2xl font-bold font-display text-danger mt-0.5">₹{totalMonthlySpend.toLocaleString()}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-light font-medium">Synced with Finance</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> 100% Synced (Internal & Projects)
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Receipt className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <Input 
            type="text" 
            placeholder="Search AI tools or categories..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="w-full sm:w-auto bg-tertiary text-secondary-dark hover:bg-tertiary-dark hover:text-white" 
          onClick={() => {
            setIsEditing({ 
              category: 'LLM', 
              sub: 'Monthly', 
              cost: 0,
              expenseTarget: 'others',
              renewal: new Date().toISOString().split('T')[0]
            });
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add AI Tool
        </Button>
      </div>

      {/* Table */}
      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Used For</TableHead>
              <TableHead className="text-right">Monthly Cost</TableHead>
              <TableHead>Expense For</TableHead>
              <TableHead>Image Proof</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.map((tool) => {
              const isInternal = !tool.expenseTarget || tool.expenseTarget === 'others';
              const targetProject = projects?.find(p => p.id === tool.expenseTarget);

              return (
                <TableRow key={tool.id} className="hover:bg-canvas-variant/30 transition-colors">
                  <TableCell className="font-medium text-secondary-dark">
                    <div className="flex items-center">
                      <span>{tool.name}</span>
                      <ExternalLink className="h-3 w-3 ml-1.5 text-secondary-light hover:text-primary cursor-pointer" />
                    </div>
                    {tool.email && (
                      <p className="text-[11px] text-secondary-light mt-0.5">{tool.email}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="ai">{tool.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-secondary-light max-w-[140px] truncate" title={tool.usedFor}>
                    {tool.usedFor || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-secondary-dark">
                    ₹{tool.cost?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {isInternal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        <Building className="h-3 w-3" />
                        Internal (Company)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20" title={targetProject?.companyName}>
                        <Briefcase className="h-3 w-3" />
                        {targetProject?.projectName || 'Project'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tool.receiptUrl ? (
                      <button
                        onClick={() => setSelectedProofTool(tool)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors border border-primary/20 shadow-xs"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="text-xs text-secondary-light/60 italic">No proof</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{tool.sub}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{tool.renewal || '-'}</TableCell>
                  <TableCell className="text-xs text-secondary-light max-w-[120px] truncate" title={tool.notes}>
                    {tool.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button 
                        onClick={() => { 
                          setIsEditing(tool); 
                          setIsModalOpen(true); 
                        }} 
                        className="p-1.5 hover:bg-canvas-variant rounded text-secondary-light hover:text-secondary-dark transition-colors"
                        title="Edit tool"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tool.id)} 
                        className="p-1.5 hover:bg-danger/10 rounded text-danger transition-colors"
                        title="Delete tool and corresponding expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTools.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-secondary-light">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-secondary-light/50" />
                  <p className="font-medium">No AI tools found.</p>
                  <p className="text-xs mt-1">Click "Add AI Tool" to log your first subscription and link it to Finance.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing?.id ? 'Edit AI Tool' : 'Add AI Tool & Expense'}
        className="max-w-xl max-h-[92vh] overflow-y-auto"
      >
        <div className="space-y-4">
          {/* Expense For Section */}
          <div className="bg-canvas-variant/30 p-3.5 rounded-xl border border-canvas-variant">
            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-dark mb-1.5 flex items-center justify-between">
              <span>Expense Destination ("Expense For")</span>
              <span className="text-[11px] font-normal text-primary">Reflects in Finance</span>
            </label>
            <Select
              value={isEditing?.expenseTarget || 'others'}
              onChange={e => setIsEditing({ ...isEditing, expenseTarget: e.target.value })}
              className="bg-canvas"
              options={[
                { value: 'others', label: '🏢 Internal (Company / General Expense)' },
                ...(projects || []).map(p => ({
                  value: p.id,
                  label: `📁 Project: ${p.projectName} (${p.companyName})`
                }))
              ]}
            />
            <p className="text-[11px] text-secondary-light mt-1">
              {(!isEditing?.expenseTarget || isEditing?.expenseTarget === 'others')
                ? 'Recorded under "Internal / Others" in Finance -> Expenses.'
                : `Recorded under "${projects?.find(p => p.id === isEditing?.expenseTarget)?.projectName}" in Finance -> Expenses.`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Tool Name *</label>
            <Input 
              value={isEditing?.name || ''} 
              onChange={e => setIsEditing({...isEditing, name: e.target.value})} 
              placeholder="e.g. ChatGPT Plus, Claude 3.5 Sonnet, Midjourney"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Category</label>
              <Input 
                value={isEditing?.category || ''} 
                onChange={e => setIsEditing({...isEditing, category: e.target.value})} 
                placeholder="e.g. LLM, Image Generation, Code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Used For</label>
              <Input 
                value={isEditing?.usedFor || ''} 
                onChange={e => setIsEditing({...isEditing, usedFor: e.target.value})} 
                placeholder="e.g. Copywriting, Automation"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Monthly Cost (₹) *</label>
              <Input 
                type="number" 
                min="0"
                step="1"
                value={isEditing?.cost !== undefined ? isEditing.cost : ''} 
                onChange={e => setIsEditing({...isEditing, cost: parseFloat(e.target.value) || 0})} 
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Subscription Type</label>
              <Select 
                value={isEditing?.sub || 'Monthly'} 
                onChange={e => setIsEditing({...isEditing, sub: e.target.value})}
                options={[
                  {value: 'Monthly', label: 'Monthly'},
                  {value: 'Annual', label: 'Annual'},
                  {value: 'One-time', label: 'One-time'}
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Login Email</label>
              <Input 
                type="email"
                value={isEditing?.email || ''} 
                onChange={e => setIsEditing({...isEditing, email: e.target.value})} 
                placeholder="account@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Renewal / Expense Date</label>
              <Input 
                type="date"
                value={isEditing?.renewal || ''} 
                onChange={e => setIsEditing({...isEditing, renewal: e.target.value})} 
              />
            </div>
          </div>

          {/* IMAGE PROOF UPLOAD SECTION */}
          <div className="border border-canvas-variant rounded-xl p-4 bg-canvas space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-secondary-dark flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-primary" />
                <span>Image Proof of Purchase (Invoice / Receipt)</span>
              </label>
              {isEditing?.receiptUrl && (
                <button
                  type="button"
                  onClick={() => setIsEditing({ ...isEditing, receiptUrl: undefined })}
                  className="text-xs text-danger hover:underline flex items-center gap-0.5"
                >
                  <X className="h-3 w-3" />
                  Remove Proof
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

            {isEditing?.receiptUrl ? (
              <div className="relative group rounded-lg overflow-hidden border border-canvas-variant bg-canvas-surface p-2 flex items-center gap-3">
                <img 
                  src={isEditing.receiptUrl} 
                  alt="Proof preview" 
                  className="h-16 w-16 object-cover rounded-md border border-canvas-variant"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-dark truncate">Proof Image Attached</p>
                  <p className="text-[11px] text-secondary-light">Saved & ready to reflect in Finance</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary hover:underline mt-1 block font-medium"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-canvas-variant hover:border-primary/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-canvas-surface/50"
              >
                <Upload className="h-6 w-6 mx-auto text-secondary-light group-hover:text-primary mb-1.5" />
                <p className="text-xs font-medium text-secondary-dark">
                  {isUploading ? 'Compressing image...' : 'Click to upload receipt / invoice proof'}
                </p>
                <p className="text-[10px] text-secondary-light mt-0.5">Supports PNG, JPG, WebP screenshots</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Notes</label>
            <Input 
              value={isEditing?.notes || ''} 
              onChange={e => setIsEditing({...isEditing, notes: e.target.value})} 
              placeholder="Additional details, seat count, license key info..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {isEditing?.id ? 'Save Changes & Sync' : 'Add Tool & Record Expense'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* PROOF PREVIEW MODAL */}
      <Modal
        isOpen={!!selectedProofTool}
        onClose={() => setSelectedProofTool(null)}
        title={`Receipt Proof: ${selectedProofTool?.name || 'AI Tool'}`}
        className="max-w-2xl"
      >
        {selectedProofTool && (
          <div className="space-y-4">
            <div className="bg-canvas-variant/30 p-3 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="text-secondary-light">Cost: </span>
                <strong className="text-secondary-dark">₹{selectedProofTool.cost?.toLocaleString()}</strong>
                <span className="mx-2">•</span>
                <span className="text-secondary-light">Destination: </span>
                <strong className="text-primary">{getTargetLabel(selectedProofTool.expenseTarget)}</strong>
              </div>
              <Button 
                size="sm"
                variant="secondary"
                className="text-xs h-7"
                onClick={() => selectedProofTool.receiptUrl && downloadFile(selectedProofTool.receiptUrl, `${selectedProofTool.name}_receipt.jpg`)}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-canvas-variant flex items-center justify-center bg-canvas p-2">
              <img 
                src={selectedProofTool.receiptUrl} 
                alt={`${selectedProofTool.name} Receipt`}
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedProofTool(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
