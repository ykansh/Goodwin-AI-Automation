import React, { useState } from 'react';
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
import { Plus, Search, Bot, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { AITool } from '../../lib/store';

export const AITools = () => {
  const { aiTools, addAITool, updateAITool, deleteAITool } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Partial<AITool> | null>(null);

  const filteredTools = aiTools.filter(tool => 
    tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (isEditing?.id) {
        await updateAITool(isEditing.id, isEditing);
      } else {
        await addAITool(isEditing as Omit<AITool, 'id'>);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save AI tool: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteAITool(id);
      } catch (err: any) {
        alert('Failed to delete tool: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-tertiary/20 rounded-lg">
          <Bot className="h-8 w-8 text-tertiary-dark" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary-dark tracking-tight">AI Slop</h1>
          <p className="text-secondary-light">Manage AI subscriptions, tools, and usage logs.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <Input 
            type="text" 
            placeholder="Search AI tools..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto bg-tertiary text-secondary-dark hover:bg-tertiary-dark hover:text-white" onClick={() => {
          setIsEditing({ category: 'LLM', sub: 'Monthly' });
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Used For</TableHead>
              <TableHead className="text-right">Monthly Cost</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Login Email</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium text-secondary-dark flex items-center">
                  {tool.name}
                  <ExternalLink className="h-3 w-3 ml-2 text-secondary-light hover:text-primary cursor-pointer" />
                </TableCell>
                <TableCell>
                  <Badge variant="ai">{tool.category}</Badge>
                </TableCell>
                <TableCell className="text-xs text-secondary-light">{tool.usedFor}</TableCell>
                <TableCell className="text-right font-medium">${tool.cost}</TableCell>
                <TableCell>{tool.sub}</TableCell>
                <TableCell className="text-xs">{tool.email}</TableCell>
                <TableCell>{tool.renewal}</TableCell>
                <TableCell className="text-xs text-secondary-light max-w-[150px] truncate" title={tool.notes}>
                  {tool.notes}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <button onClick={() => { setIsEditing(tool); setIsModalOpen(true); }} className="p-1 hover:bg-canvas-variant rounded">
                      <Pencil className="h-4 w-4 text-secondary-light" />
                    </button>
                    <button onClick={() => handleDelete(tool.id)} className="p-1 hover:bg-danger/10 rounded">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredTools.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-secondary-light">
                  No AI tools found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing?.id ? 'Edit AI Tool' : 'Add AI Tool'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Tool Name</label>
            <Input 
              value={isEditing?.name || ''} 
              onChange={e => setIsEditing({...isEditing, name: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Category</label>
              <Input 
                value={isEditing?.category || ''} 
                onChange={e => setIsEditing({...isEditing, category: e.target.value})} 
                placeholder="e.g. LLM, Image Generation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Used For</label>
              <Input 
                value={isEditing?.usedFor || ''} 
                onChange={e => setIsEditing({...isEditing, usedFor: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Cost ($)</label>
              <Input 
                type="number"
                value={isEditing?.cost || ''} 
                onChange={e => setIsEditing({...isEditing, cost: parseFloat(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Subscription</label>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Login Email</label>
              <Input 
                type="email"
                value={isEditing?.email || ''} 
                onChange={e => setIsEditing({...isEditing, email: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Renewal Date</label>
              <Input 
                type="date"
                value={isEditing?.renewal || ''} 
                onChange={e => setIsEditing({...isEditing, renewal: e.target.value})} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Notes</label>
            <Input 
              value={isEditing?.notes || ''} 
              onChange={e => setIsEditing({...isEditing, notes: e.target.value})} 
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Tool</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
