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

const mockClients = [
  { id: 1, name: 'Acme Corp', businessType: 'Software', package: 'Enterprise', value: 15000, status: 'active', startDate: '2025-01-10', nextReview: '2026-10-10', manager: 'Sarah J.', whatsapp: '+1234567890', mail: 'contact@acme.com', notes: 'Top priority' },
  { id: 2, name: 'Globex', businessType: 'Retail', package: 'Pro', value: 5000, status: 'at_risk', startDate: '2025-06-15', nextReview: '2026-09-15', manager: 'Mike R.', whatsapp: '+1987654321', mail: 'hello@globex.com', notes: 'Complained about ROI' },
];

export const ClientTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
        <Button className="w-full sm:w-auto">
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
            {mockClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium text-secondary-dark">{client.name}</TableCell>
                <TableCell>{client.businessType}</TableCell>
                <TableCell>{client.package}</TableCell>
                <TableCell className="text-right">${client.value.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={client.status === 'active' ? 'success' : 'warning'}>
                    {client.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{client.manager}</TableCell>
                <TableCell>{client.nextReview}</TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                     <a href={`https://wa.me/${client.whatsapp}`} target="_blank" rel="noreferrer" className="text-secondary-light hover:text-[#25D366]">
                       <MessageSquare className="h-4 w-4" />
                     </a>
                     <a href={`mailto:${client.mail}`} className="text-secondary-light hover:text-primary">
                       <Mail className="h-4 w-4" />
                     </a>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
