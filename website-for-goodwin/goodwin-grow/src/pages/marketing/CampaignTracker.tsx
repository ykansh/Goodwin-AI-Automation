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

// Mock Data
const initialCampaigns = [
  { id: 1, client: 'Acme Corp', name: 'Q3 Product Launch', platform: 'LinkedIn', type: 'B2B Lead Gen', budget: 15000, spend: 12400, reach: 45000, clicks: 1200, leads: 85, cpl: 145.88, status: 'active', notes: 'Running smoothly' },
  { id: 2, client: 'Globex', name: 'Summer Promo', platform: 'Instagram', type: 'B2C Sales', budget: 5000, spend: 5000, reach: 120000, clicks: 5400, leads: 320, cpl: 15.62, status: 'completed', notes: 'Exceeded targets' },
  { id: 3, client: 'Soylent', name: 'Brand Awareness', platform: 'Google Ads', type: 'Search', budget: 10000, spend: 2300, reach: 15000, clicks: 800, leads: 12, cpl: 191.66, status: 'active', notes: 'Monitor CPL closely' },
];

export const CampaignTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
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
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
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
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium text-secondary-dark">{campaign.client}</TableCell>
                <TableCell>{campaign.name}</TableCell>
                <TableCell>{campaign.platform}</TableCell>
                <TableCell>{campaign.type}</TableCell>
                <TableCell className="text-right">${campaign.budget.toLocaleString()}</TableCell>
                <TableCell className="text-right">${campaign.spend.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">{campaign.leads}</TableCell>
                <TableCell className="text-right">${campaign.cpl.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'completed' ? 'default' : 'warning'}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-primary">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Campaign">
        <div className="space-y-4">
          <div className="space-y-2">
             <label className="enterprise-label">Client Name</label>
             <Input placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-2">
             <label className="enterprise-label">Campaign Name</label>
             <Input placeholder="e.g. Q4 Launch" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Budget ($)</label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Platform</label>
              <Input placeholder="e.g. LinkedIn" />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
