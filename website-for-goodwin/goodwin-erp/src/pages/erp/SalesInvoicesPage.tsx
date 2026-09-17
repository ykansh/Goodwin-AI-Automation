import { useState, useEffect } from 'react';
import { useInvoices } from '../../hooks/queries';
import { useDeleteSalesInvoice } from '../../hooks/mutations';
import type { SalesInvoice } from '../../types';
import { InvoiceViewModal } from '../../components/modals/InvoiceViewModal';
import { NewInvoiceModal } from '../../components/modals/NewInvoiceModal';
import { EditInvoiceModal } from '../../components/modals/EditInvoiceModal';
import { ExcelActions } from '../../components/common/ExcelActions';
import { Plus, Printer, Search, Trash2, Edit, Loader2 } from 'lucide-react';

export function SalesInvoicesPage({
  showCreateModalInitially = false,
  onCloseCreateModal,
}: {
  showCreateModalInitially?: boolean;
  onCloseCreateModal?: () => void;
}) {
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteInvoiceMutation = useDeleteSalesInvoice();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(showCreateModalInitially);
  const [invoiceToEdit, setInvoiceToEdit] = useState<SalesInvoice | null>(null);

  useEffect(() => {
    if (showCreateModalInitially) {
      setShowCreateModal(true);
    }
  }, [showCreateModalInitially]);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'Quotations') return inv.lifecycle_status === 'Quotation';
    if (filterType === 'Confirmed') return inv.lifecycle_status !== 'Quotation' && inv.lifecycle_status !== 'Cancelled';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with integrated search */}
      <div className="glass-strong p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
              Sales & GST Invoices
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Issue tax invoices, track GST breakdown (CGST/SGST), and generate printable copies
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
            <ExcelActions
              data={filteredInvoices.map((inv) => ({
                'Invoice Number': inv.invoice_number,
                'Date': inv.date,
                'Customer': inv.customer_name,
                'Invoice Type': inv.invoice_type,
                'Lifecycle Status': inv.lifecycle_status || 'Confirmed',
                'Payment Status': inv.payment_status || inv.status,
                'Taxable Amount': inv.taxable_amount,
                'GST Amount': inv.gst_amount,
                'Grand Total': inv.grand_total,
                'Place of Supply': inv.place_of_supply || '',
              }))}
              fileName="Goodwin_Sales_Invoices_Register"
              hideImport={true}
            />
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-md shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Create Sales Invoice
            </button>
          </div>
        </div>
        {/* Search bar — flex layout */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 text-sm font-bold rounded-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]"
          >
            <option value="All">All Invoices</option>
            <option value="Confirmed">Confirmed Orders</option>
            <option value="Quotations">Quotations</option>
          </select>
          <div className="flex items-center gap-2 w-full sm:w-56 px-3 py-2.5 rounded-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Data Table Matching User Photo */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE / DOC #</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>CUSTOMER</th>
                <th>TAXABLE</th>
                <th>GST</th>
                <th>GRAND TOTAL</th>
                <th>OUTSTANDING</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#00a631] animate-spin mx-auto" />
                    <p className="mt-2 text-sm font-bold text-gray-500">Loading invoices...</p>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400 font-bold">
                    No sales invoices logged yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    {/* INVOICE / DOC # */}
                    <td className="font-extrabold text-[#3a3b39] text-xs font-mono">
                      {inv.invoice_number}
                    </td>

                    {/* DATE */}
                    <td className="text-xs font-semibold text-gray-600">{inv.date}</td>

                    {/* TYPE */}
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                        {inv.invoice_type || 'GST Tax Invoice'}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        inv.lifecycle_status === 'Quotation' ? 'bg-gray-100 text-gray-600 border border-gray-300' :
                        inv.lifecycle_status === 'Confirmed' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        inv.lifecycle_status === 'Dispatched' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                        inv.lifecycle_status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                        'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        {inv.lifecycle_status || 'Confirmed'}
                      </span>
                      {inv.lifecycle_status !== 'Quotation' && (
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-extrabold ${
                            inv.payment_status === 'Paid' ? 'bg-[#00a631]/10 text-[#00a631]' :
                            inv.payment_status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {inv.payment_status || inv.status}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td className="font-extrabold text-[#3a3b39]">{inv.customer_name}</td>

                    {/* TAXABLE */}
                    <td className="font-semibold text-gray-700">
                      ₹{inv.taxable_amount.toLocaleString('en-IN')}.00
                    </td>

                    {/* GST */}
                    <td className="font-semibold text-gray-700">
                      ₹{inv.gst_amount.toLocaleString('en-IN')}.00
                    </td>

                    {/* GRAND TOTAL */}
                    <td className="font-extrabold text-[#3a3b39]">
                      ₹{inv.grand_total.toLocaleString('en-IN')}.00
                    </td>

                    {/* OUTSTANDING */}
                    <td className="font-extrabold text-red-600">
                      ₹{inv.outstanding.toLocaleString('en-IN')}.00
                    </td>

                    {/* ACTIONS: Invoice Printer Button & Delete */}
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#3a3b39] text-xs font-bold rounded-md transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Invoice
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceToEdit(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100/50 hover:bg-blue-200 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-md transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this invoice?")) {
                              deleteInvoiceMutation.mutate(inv.id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceViewModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

      {showCreateModal && (
        <NewInvoiceModal
          onClose={() => {
            setShowCreateModal(false);
            if (onCloseCreateModal) onCloseCreateModal();
          }}
        />
      )}

      {invoiceToEdit && (
        <EditInvoiceModal
          invoice={invoiceToEdit}
          onClose={() => setInvoiceToEdit(null)}
        />
      )}
    </div>
  );
}
