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
import { Select } from '../../components/ui/Select';
import { Plus, Search, Download, Pencil, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../lib/financeStore';
import type { Invoice } from '../../lib/financeStore';

export const RevenueTracker = () => {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useFinanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Partial<Invoice> | null>(null);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csvHeader = "Invoice No,Client,Description,Amount,Date,Due Date,Status,Mode\n";
    const csvRows = filteredInvoices.map(inv => 
      `${inv.invoiceNo},"${inv.client}","${inv.description}",${inv.amount},${inv.date},${inv.due},${inv.status},${inv.mode || ''}`
    );
    const blob = new Blob([csvHeader + csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      if (isEditing?.id) {
        await updateInvoice(isEditing.id, isEditing);
      } else {
        await addInvoice(isEditing as Omit<Invoice, 'id'>);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save invoice: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

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
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => {
            setIsEditing({ date: new Date().toISOString().split('T')[0], status: 'unpaid' });
            setIsModalOpen(true);
          }}>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-secondary-dark">{inv.invoiceNo}</TableCell>
                <TableCell>{inv.client}</TableCell>
                <TableCell className="text-secondary-light text-xs">{inv.description}</TableCell>
                <TableCell className="text-right font-semibold text-secondary-dark">${inv.amount?.toLocaleString()}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>{inv.due}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                    {inv.status?.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <button onClick={() => { setIsEditing(inv); setIsModalOpen(true); }} className="p-1 hover:bg-canvas-variant rounded">
                      <Pencil className="h-4 w-4 text-secondary-light" />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1 hover:bg-danger/10 rounded">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-secondary-light">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing?.id ? 'Edit Invoice' : 'New Invoice'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Invoice Number</label>
            <Input 
              value={isEditing?.invoiceNo || ''} 
              onChange={e => setIsEditing({...isEditing, invoiceNo: e.target.value})} 
              placeholder="INV-YYYY-XXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Client Name</label>
            <Input 
              value={isEditing?.client || ''} 
              onChange={e => setIsEditing({...isEditing, client: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Description</label>
            <Input 
              value={isEditing?.description || ''} 
              onChange={e => setIsEditing({...isEditing, description: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Amount ($)</label>
            <Input 
              type="number"
              value={isEditing?.amount || ''} 
              onChange={e => setIsEditing({...isEditing, amount: parseFloat(e.target.value)})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Invoice Date</label>
              <Input 
                type="date"
                value={isEditing?.date || ''} 
                onChange={e => setIsEditing({...isEditing, date: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Due Date</label>
              <Input 
                type="date"
                value={isEditing?.due || ''} 
                onChange={e => setIsEditing({...isEditing, due: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Status</label>
              <Select 
                value={isEditing?.status || 'unpaid'} 
                onChange={e => setIsEditing({...isEditing, status: e.target.value as any})}
                options={[
                  {value: 'unpaid', label: 'Unpaid'},
                  {value: 'paid', label: 'Paid'},
                  {value: 'overdue', label: 'Overdue'}
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Payment Mode</label>
              <Input 
                value={isEditing?.mode || ''} 
                onChange={e => setIsEditing({...isEditing, mode: e.target.value})} 
                placeholder="e.g. Wire Transfer"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Invoice</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
