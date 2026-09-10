import React, { useState } from 'react';
import { useOperationsStore } from '../../lib/operationsStore';

import { Search, Filter, Plus, Monitor, Laptop, Server, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

interface Asset {
  id: string;
  name: string;
  type: string;
  assignedTo: string;
  status: string;
  purchaseDate: string;
}

const initialAssets: Asset[] = [
  { id: 'AST-101', name: 'MacBook Pro M3 Max', type: 'Laptop', assignedTo: 'Sarah Jenkins', status: 'In Use', purchaseDate: '2026-01-15' },
  { id: 'AST-102', name: 'Dell UltraSharp 32"', type: 'Monitor', assignedTo: 'Mike Ross', status: 'In Use', purchaseDate: '2026-03-20' },
  { id: 'AST-103', name: 'iPad Pro', type: 'Tablet', assignedTo: 'Unassigned', status: 'Available', purchaseDate: '2026-06-10' },
  { id: 'AST-104', name: 'Office Network Switch', type: 'Infrastructure', assignedTo: 'IT Department', status: 'Maintenance', purchaseDate: '2025-11-05' },
];

export const Assets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const assets = useOperationsStore((state: any) => state.assets);
  const addAsset = useOperationsStore((state: any) => state.addAsset);
  const updateAsset = useOperationsStore((state: any) => state.updateAsset);
  const deleteAsset = useOperationsStore((state: any) => state.deleteAsset);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Laptop',
    assignedTo: 'Unassigned',
    status: 'Available',
    purchaseDate: new Date().toISOString().split('T')[0],
    value: 0
  });

  const handleOpenModal = (item?: Asset) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item, value: 0 });
    } else {
      setEditingItem(null);
      setFormData({
        id: '',
        name: '',
        type: 'Laptop',
        assignedTo: 'Unassigned',
        status: 'Available',
        purchaseDate: new Date().toISOString().split('T')[0],
        value: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingItem) {
      await updateAsset(formData.id, formData);
    } else {
      await addAsset(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Use': return 'success';
      case 'Available': return 'ai';
      case 'Maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Laptop': return <Laptop className="h-5 w-5 text-secondary-light" />;
      case 'Monitor': return <Monitor className="h-5 w-5 text-secondary-light" />;
      case 'Infrastructure': return <Server className="h-5 w-5 text-secondary-light" />;
      default: return <Monitor className="h-5 w-5 text-secondary-light" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Asset Management</h1>
          <p className="text-secondary-light text-sm mt-1">Track company hardware, software, and infrastructure.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Asset
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
              placeholder="Search assets..." 
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
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Purchase Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-variant">
              {assets.filter((a: any) => a.name?.toLowerCase()?.includes(searchTerm.toLowerCase())).map((asset: any) => (
                <tr key={asset.id} className="hover:bg-canvas/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-secondary-light">
                    {asset.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-canvas-variant rounded-lg">
                        {getIcon(asset.type)}
                      </div>
                      <div>
                        <div className="font-medium text-secondary-dark">{asset.name}</div>
                        <div className="text-xs text-secondary-light">{asset.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {asset.assignedTo}
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {asset.purchaseDate}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadge(asset.status) as any}>
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-primary" onClick={() => handleOpenModal(asset)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-danger" onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Asset" : "Assign Asset"}>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Asset ID</label>
              <Input 
                type="text" 
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Name</label>
              <Input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Type</label>
              <Select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                options={[
                  { value: 'Laptop', label: 'Laptop' },
                  { value: 'Monitor', label: 'Monitor' },
                  { value: 'Tablet', label: 'Tablet' },
                  { value: 'Infrastructure', label: 'Infrastructure' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Assigned To</label>
              <Input 
                type="text" 
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
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
                  { value: 'Available', label: 'Available' },
                  { value: 'In Use', label: 'In Use' },
                  { value: 'Maintenance', label: 'Maintenance' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Purchase Date</label>
              <Input 
                type="date" 
                value={formData.purchaseDate}
                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="enterprise-label">Value ($)</label>
            <Input 
              type="number" 
              value={formData.value || ''}
              onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Save Changes" : "Assign Asset"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
