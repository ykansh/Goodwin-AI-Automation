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
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useMarketingStore } from '../../lib/marketingStore';

export const CampaignTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const campaigns = useMarketingStore((state: any) => state.campaigns);
  const setCampaigns = useMarketingStore((state: any) => state.setCampaigns);
  const addCampaign = useMarketingStore((state: any) => state.addCampaign);
  const updateCampaign = useMarketingStore((state: any) => state.updateCampaign);
  const deleteCampaign = useMarketingStore((state: any) => state.deleteCampaign);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    client: '',
    name: '',
    platform: '',
    type: 'B2B Lead Gen',
    budget: 0,
    spent: 0,
    reach: 0,
    clicks: 0,
    leads: 0,
    status: 'active',
    notes: ''
  });
  
  const filteredCampaigns = campaigns.filter((c: any) => 
    c.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    c.client?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    await deleteCampaign(id);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      id: 0,
      client: '',
      name: '',
      platform: '',
      type: 'B2B Lead Gen',
      budget: 0,
      spent: 0,
      reach: 0,
      clicks: 0,
      leads: 0,
      status: 'active',
      notes: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (campaign: any) => {
    setFormData(campaign);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isEditing) {
      await updateCampaign(formData.id, formData);
    } else {
      await addCampaign(formData);
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
            placeholder="Search campaigns..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">CPL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign: any) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium text-secondary-dark">{campaign.client || 'Internal'}</TableCell>
                <TableCell>{campaign.name}</TableCell>
                <TableCell>{campaign.platform}</TableCell>
                <TableCell>{campaign.type || 'Standard'}</TableCell>
                <TableCell className="text-right">${Number(campaign.budget || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">${Number(campaign.spent || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">{campaign.leads || 0}</TableCell>
                <TableCell className="text-right">${(campaign.leads ? (Number(campaign.spent || 0) / campaign.leads) : 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'completed' ? 'default' : 'warning'}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)} className="h-8 w-8 text-secondary-light hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)} className="h-8 w-8 text-secondary-light hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCampaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-secondary-light">
                  No campaigns found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Campaign" : "Create Campaign"}>
        <div className="space-y-4">
          <div className="space-y-2">
             <label className="enterprise-label">Client Name</label>
             <Input 
               placeholder="e.g. Acme Corp" 
               value={formData.client} 
               onChange={(e) => setFormData({...formData, client: e.target.value})} 
             />
          </div>
          <div className="space-y-2">
             <label className="enterprise-label">Campaign Name</label>
             <Input 
               placeholder="e.g. Q4 Launch" 
               value={formData.name} 
               onChange={(e) => setFormData({...formData, name: e.target.value})} 
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Budget ($)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={formData.budget || ''} 
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Platform</label>
              <Input 
                placeholder="e.g. LinkedIn" 
                value={formData.platform} 
                onChange={(e) => setFormData({...formData, platform: e.target.value})} 
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
