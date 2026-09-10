import React, { useState } from 'react';
import { useOperationsStore } from '../../lib/operationsStore';

import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

type LeadStatus = 'Not Contacted' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';

interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: LeadStatus;
}

const COLUMNS: LeadStatus[] = ['Not Contacted', 'Contacted', 'Qualified', 'Won', 'Lost'];

const initialLeads: Lead[] = [
  { id: '1', name: 'John Doe', company: 'Tech Corp', value: 5000, status: 'Not Contacted' },
  { id: '2', name: 'Jane Smith', company: 'Global Ind', value: 12000, status: 'Contacted' },
  { id: '3', name: 'Mike Brown', company: 'StartUp Inc', value: 3000, status: 'Qualified' },
  { id: '4', name: 'Sarah Connor', company: 'Cyberdyne', value: 25000, status: 'Won' },
  { id: '5', name: 'Peter Parker', company: 'Daily Bugle', value: 1500, status: 'Lost' },
];

export const LeadTracker = () => {
  const leads = useOperationsStore((state: any) => state.crmLeads);
  const setCrmLeads = useOperationsStore((state: any) => state.setCrmLeads);
  const addCrmLead = useOperationsStore((state: any) => state.addCrmLead);
  const updateCrmLead = useOperationsStore((state: any) => state.updateCrmLead);
  const deleteCrmLead = useOperationsStore((state: any) => state.deleteCrmLead);
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    company: '',
    value: 0,
    status: 'Not Contacted'
  });

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Requires some data to be set for Firefox to allow drag
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLeadId === null) return;

    const leadToUpdate = leads.find((l: any) => l.id === draggedLeadId);
    if (leadToUpdate) {
      await updateCrmLead(draggedLeadId.toString(), { status: targetStatus });
    }
    setDraggedLeadId(null);
  };

  const handleSaveLead = async () => {
    await addCrmLead({
      name: formData.name,
      company: formData.company,
      email: '',
      status: formData.status,
      lastContact: new Date().toISOString().split('T')[0],
      value: formData.value
    });
    setIsModalOpen(false);
    setFormData({ name: '', company: '', value: 0, status: 'Not Contacted' });
  };

  const handleDeleteLead = async (id: number | string) => {
    await deleteCrmLead(id.toString());
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'Not Contacted': return 'bg-canvas-variant border-canvas-variant';
      case 'Contacted': return 'bg-primary/10 border-primary/20 text-primary-dark';
      case 'Qualified': return 'bg-tertiary/10 border-tertiary/20 text-tertiary-dark';
      case 'Won': return 'bg-success/10 border-success/20 text-success-dark';
      case 'Lost': return 'bg-danger/10 border-danger/20 text-danger-dark';
      default: return 'bg-canvas-variant';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Lead Tracker</h1>
          <p className="text-secondary-light text-sm mt-1">Drag and drop leads to update their progress.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="flex-1 pb-4">
        <div className="flex gap-4 h-full w-full">
          {COLUMNS.map(column => (
            <div 
              key={column}
              className="flex flex-col flex-1 min-w-0 bg-canvas-surface rounded-xl border border-canvas-variant overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column)}
            >
              <div className={`px-4 py-3 border-b font-semibold text-sm ${getStatusColor(column)}`}>
                {column}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/50 text-xs">
                  {leads.filter((l: any) => l.status === column).length}
                </span>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-canvas/30">
                {leads.filter((l: any) => l.status === column).map((lead: any) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-canvas-surface p-3 rounded-lg border border-canvas-variant shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-secondary-dark text-sm">{lead.name}</h4>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation(); // prevent drag start if clicking button
                            handleDeleteLead(lead.id);
                          }} 
                          className="h-5 w-5 text-secondary-light hover:text-danger"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <GripVertical className="h-4 w-4 text-secondary-light cursor-grab" />
                      </div>
                    </div>
                    <p className="text-xs text-secondary-light mb-3">{lead.company}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-canvas-variant">
                      <Badge variant="default" className="text-[10px] py-0">Value</Badge>
                      <span className="text-xs font-medium text-secondary-dark">${lead.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="enterprise-label">Lead Name</label>
            <Input 
              placeholder="e.g. John Doe" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="enterprise-label">Company</label>
            <Input 
              placeholder="e.g. Acme Corp" 
              value={formData.company} 
              onChange={(e) => setFormData({...formData, company: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Value ($)</label>
              <Input 
                type="number"
                value={formData.value || ''} 
                onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Initial Status</label>
              <Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as LeadStatus})}
                options={COLUMNS.map((col: any) => ({ value: col, label: col }))}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveLead}>Create Lead</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
