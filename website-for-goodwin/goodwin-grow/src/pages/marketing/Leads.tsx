import React, { useState } from 'react';
import { useMarketingStore } from '../../lib/marketingStore';

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
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';

export const Leads = () => {
  const employees = useStore(state => state.employees);
  const [searchTerm, setSearchTerm] = useState('');
  const leads = useMarketingStore((state: any) => state.marketingLeads);
  const setMarketingLeads = useMarketingStore((state: any) => state.setMarketingLeads);
  const addMarketingLead = useMarketingStore((state: any) => state.addMarketingLead);
  const updateMarketingLead = useMarketingStore((state: any) => state.updateMarketingLead);
  const deleteMarketingLead = useMarketingStore((state: any) => state.deleteMarketingLead);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    company: '',
    date: new Date().toISOString().split('T')[0],
    status: 'New',
    assignedTo: '',
    work: 'not started'
  });

  const filteredLeads = leads.filter((l: any) => 
    l.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    l.company?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await deleteMarketingLead(id);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      id: 0,
      name: '',
      company: '',
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      assignedTo: '',
      work: 'not started'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: any) => {
    setFormData(lead);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isEditing) {
      await updateMarketingLead(formData.id, formData);
    } else {
      await addMarketingLead(formData);
    }
    setIsModalOpen(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'Qualified': return 'success';
      case 'Contacted': return 'ai';
      case 'Lost': return 'destructive';
      case 'New':
      default: return 'warning';
    }
  };

  const getWorkBadgeVariant = (work: string) => {
    switch(work) {
      case 'done': return 'success';
      case 'started': return 'warning';
      case 'not started':
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <Input 
            type="text" 
            placeholder="Search leads..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Lead Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Work</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead: any) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium text-secondary-dark">{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.date}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{lead.assignedTo}</TableCell>
                <TableCell>
                  <Badge variant={getWorkBadgeVariant(lead.work)}>
                    {lead.work}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(lead)} className="h-8 w-8 text-secondary-light hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)} className="h-8 w-8 text-secondary-light hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-secondary-light">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Lead" : "Add Lead"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Name</label>
              <Input 
                placeholder="e.g. John Doe" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Company Name</label>
              <Input 
                placeholder="e.g. Tech Corp" 
                value={formData.company} 
                onChange={(e) => setFormData({...formData, company: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Date</label>
              <Input 
                type="date"
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Assigned To</label>
              <Select 
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                options={[
                  { value: '', label: 'Select Employee...' },
                  ...employees.map(emp => ({ value: emp.name, label: emp.name }))
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Lead Status</label>
              <Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                options={[
                  { value: 'New', label: 'New' },
                  { value: 'Contacted', label: 'Contacted' },
                  { value: 'Qualified', label: 'Qualified' },
                  { value: 'Lost', label: 'Lost' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Work Status</label>
              <Select 
                value={formData.work}
                onChange={(e) => setFormData({...formData, work: e.target.value})}
                options={[
                  { value: 'not started', label: 'Not Started' },
                  { value: 'started', label: 'Started' },
                  { value: 'done', label: 'Done' }
                ]}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Add Lead"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
