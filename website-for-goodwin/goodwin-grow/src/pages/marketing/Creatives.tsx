import React, { useState } from 'react';
import { useMarketingStore } from '../../lib/marketingStore';
import { Search, Filter, Plus, Image as ImageIcon, Video, Layout, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

export const Creatives = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const creatives = useMarketingStore((state: any) => state.creatives);
  const addCreative = useMarketingStore((state: any) => state.addCreative);
  const updateCreative = useMarketingStore((state: any) => state.updateCreative);
  const deleteCreative = useMarketingStore((state: any) => state.deleteCreative);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'Image',
    status: 'Draft',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        assignee: item.assignee,
        dueDate: item.dueDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingItem(null);
      setFormData({
        id: '',
        title: '',
        type: 'Image',
        status: 'Draft',
        assignee: '',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingItem) {
      await updateCreative(formData.id, formData);
    } else {
      await addCreative(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteCreative(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'In Review': return 'warning';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Image': return <ImageIcon className="h-6 w-6 text-secondary-light" />;
      case 'Video': return <Video className="h-6 w-6 text-secondary-light" />;
      case 'Layout': return <Layout className="h-6 w-6 text-secondary-light" />;
      default: return <ImageIcon className="h-6 w-6 text-secondary-light" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Creative Assets</h1>
          <p className="text-secondary-light text-sm mt-1">Manage and organize your marketing design assets.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Asset
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
              placeholder="Search creatives by title..." 
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {creatives.filter((c: any) => c.title?.toLowerCase()?.includes(searchTerm.toLowerCase())).map((creative: any) => (
          <div key={creative.id} className="bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-40 w-full flex items-center justify-center bg-primary/10 border-b border-canvas-variant relative">
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-full">
                {getIcon(creative.type)}
              </div>
              <div className="absolute inset-0 bg-secondary-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" className="shadow-lg" onClick={() => alert('Downloading...')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-secondary-dark truncate pr-2" title={creative.title}>{creative.title}</h3>
              </div>
              <div className="text-sm text-secondary-light mb-4">Assignee: {creative.assignee || 'Unassigned'}</div>
              
              <div className="flex justify-between items-center mt-auto">
                <div className="text-xs font-medium text-secondary-light bg-canvas-variant px-2 py-1 rounded-md">
                  {creative.type}
                </div>
                <Badge variant={getStatusBadge(creative.status) as any}>
                  {creative.status}
                </Badge>
              </div>

              <div className="flex justify-end space-x-1 pt-4 mt-4 border-t border-canvas-variant">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-primary" onClick={() => handleOpenModal(creative)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-danger" onClick={() => handleDelete(creative.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {creatives.length === 0 && (
          <div className="col-span-full text-center py-10 text-secondary-light">
            No creative assets found.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Asset" : "Upload Asset"}>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="enterprise-label">Asset Title</label>
            <Input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="enterprise-label">Assignee</label>
            <Input 
              type="text" 
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Type</label>
              <Select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                options={[
                  { value: 'Image', label: 'Image' },
                  { value: 'Video', label: 'Video' },
                  { value: 'Layout', label: 'Layout' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Status</label>
              <Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'In Review', label: 'In Review' },
                  { value: 'Approved', label: 'Approved' },
                ]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="enterprise-label">Due Date</label>
            <Input 
              type="date" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Save Changes" : "Upload Asset"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
