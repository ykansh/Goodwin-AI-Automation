import React, { useState } from 'react';
import { useMarketingStore } from '../../lib/marketingStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const Ads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const ads = useMarketingStore((state: any) => state.ads);
  const addAd = useMarketingStore((state: any) => state.addAd);
  const updateAd = useMarketingStore((state: any) => state.updateAd);
  const deleteAd = useMarketingStore((state: any) => state.deleteAd);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    platform: 'Facebook',
    status: 'Active',
    spend: 0,
    clicks: 0,
    conversions: 0
  });

  const filteredAds = ads.filter((a: any) => 
    a.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if(confirm('Delete ad?')) {
      await deleteAd(id);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      id: '',
      name: '',
      platform: 'Facebook',
      status: 'Active',
      spend: 0,
      clicks: 0,
      conversions: 0
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (ad: any) => {
    setFormData(ad);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isEditing) {
      await updateAd(formData.id, formData);
    } else {
      await addAd(formData);
    }
    setIsModalOpen(false);
  };

  const getPlatformBadgeVariant = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'instagram': return 'ai';
      case 'facebook': return 'default';
      case 'google': return 'success';
      default: return 'warning';
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
            placeholder="Search ads by name..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Ad
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.map((ad: any) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium text-secondary-dark">{ad.name}</TableCell>
                <TableCell>
                  <Badge variant={getPlatformBadgeVariant(ad.platform)}>
                    {ad.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={ad.status === 'Active' ? 'success' : 'default'}>{ad.status}</Badge>
                </TableCell>
                <TableCell className="text-right">${ad.spend.toLocaleString()}</TableCell>
                <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{ad.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)} className="h-8 w-8 text-secondary-light hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} className="h-8 w-8 text-secondary-light hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAds.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-secondary-light">
                  No ads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Ad" : "Add Ad"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Ad Name</label>
              <Input 
                placeholder="e.g. Summer Promo" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Platform</label>
              <Select 
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                options={[
                  { value: 'Instagram', label: 'Instagram' },
                  { value: 'Facebook', label: 'Facebook' },
                  { value: 'Google', label: 'Google' },
                  { value: 'Other', label: 'Other' }
                ]}
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
                  { value: 'Active', label: 'Active' },
                  { value: 'Paused', label: 'Paused' },
                  { value: 'Ended', label: 'Ended' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Spend ($)</label>
              <Input 
                type="number"
                placeholder="0"
                value={formData.spend || ''} 
                onChange={(e) => setFormData({...formData, spend: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Clicks</label>
              <Input 
                type="number"
                value={formData.clicks || ''} 
                onChange={(e) => setFormData({...formData, clicks: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Conversions</label>
              <Input 
                type="number"
                value={formData.conversions || ''} 
                onChange={(e) => setFormData({...formData, conversions: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Add Ad"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
