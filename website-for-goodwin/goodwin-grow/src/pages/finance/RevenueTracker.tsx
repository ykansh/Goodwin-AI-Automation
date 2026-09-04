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
import { Plus, Search, Filter, Download } from 'lucide-react';

const mockInvoices = [
  { id: 1, invoiceNo: 'INV-2026-001', client: 'Acme Corp', description: 'Q3 Retainer', amount: 15000, date: '2026-09-01', due: '2026-09-15', paid: '--', status: 'unpaid', mode: 'Wire Transfer' },
  { id: 2, invoiceNo: 'INV-2026-002', client: 'Globex', description: 'Ad Campaign Setup', amount: 5000, date: '2026-08-15', due: '2026-08-30', paid: '2026-08-28', status: 'paid', mode: 'Credit Card' },
];

export const RevenueTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search invoices..." 
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
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-secondary-dark">{inv.invoiceNo}</TableCell>
                <TableCell>{inv.client}</TableCell>
                <TableCell className="text-secondary-light text-xs">{inv.description}</TableCell>
                <TableCell className="text-right font-semibold text-secondary-dark">${inv.amount.toLocaleString()}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>{inv.due}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                    {inv.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-secondary-light text-xs">{inv.mode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
