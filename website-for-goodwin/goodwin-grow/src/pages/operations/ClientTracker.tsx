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
import { Plus, Search, Edit2, Trash2, MessageSquare, Mail } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useOperationsStore } from '../../lib/operationsStore';

export const ClientTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const clients = useOperationsStore((state: any) => state.clients);
  const addClient = useOperationsStore((state: any) => state.addClient);
  const updateClient = useOperationsStore((state: any) => state.updateClient);
  const deleteClient = useOperationsStore((state: any) => state.deleteClient);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    businessType: '',
    package: 'Enterprise',
    value: 0,
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    nextReview: '',
    manager: '',
    whatsapp: '',
    mail: '',
    notes: ''
  });

  const filteredClients = clients.filter((c: any) => 
    c.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await deleteClient(id);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      id: 0,
      name: '',
      businessType: '',
      package: 'Enterprise',
      value: 0,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      nextReview: '',
      manager: '',
      whatsapp: '',
      mail: '',
      notes: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (client: any) => {
    setFormData(client);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isEditing) {
      await updateClient(formData.id, formData);
    } else {
      await addClient(formData);
    }
    setIsModalOpen(false);
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
            placeholder="Search clients..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Business Type</TableHead>
              <TableHead>Package</TableHead>
              <TableHead className="text-right">Monthly Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Next Review</TableHead>
              <TableHead className="text-center">Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client: any) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium text-secondary-dark">{client.name}</TableCell>
                <TableCell>{client.businessType}</TableCell>
                <TableCell>{client.package}</TableCell>
                <TableCell className="text-right">${Number(client.value || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={client.status === 'active' ? 'success' : 'warning'}>
                    {client.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{client.manager}</TableCell>
                <TableCell>{client.nextReview}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                     <div className="flex items-center text-xs">
                       <a href={`mailto:${client.mail}`} className="flex items-center text-secondary-light hover:text-primary transition-colors">
                         <Mail className="h-3 w-3 mr-1" />
                         {client.mail}
                       </a>
                     </div>
                     <div className="flex items-center text-xs">
                       <a href={`https://wa.me/${client.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center text-secondary-light hover:text-[#25D366] transition-colors">
                         <MessageSquare className="h-3 w-3 mr-1" />
                         {client.whatsapp}
                       </a>
                     </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="h-8 w-8 text-secondary-light hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="h-8 w-8 text-secondary-light hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Client" : "Add Client"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Client Name</label>
              <Input 
                placeholder="e.g. Acme Corp" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Business Type</label>
              <Input 
                placeholder="e.g. Software" 
                value={formData.businessType} 
                onChange={(e) => setFormData({...formData, businessType: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Package</label>
              <Input 
                placeholder="e.g. Enterprise" 
                value={formData.package} 
                onChange={(e) => setFormData({...formData, package: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Monthly Value ($)</label>
              <Input 
                type="number"
                value={formData.value || ''} 
                onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Email</label>
              <Input 
                type="email"
                placeholder="contact@example.com"
                value={formData.mail} 
                onChange={(e) => setFormData({...formData, mail: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">WhatsApp</label>
              <Input 
                placeholder="+1234567890"
                value={formData.whatsapp} 
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Status</label>
              <Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'at_risk', label: 'At Risk' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Manager</label>
              <Input 
                placeholder="Manager Name"
                value={formData.manager} 
                onChange={(e) => setFormData({...formData, manager: e.target.value})} 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Add Client"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
