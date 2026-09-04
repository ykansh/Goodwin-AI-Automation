import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { SalesInvoice } from '../../types';
import { InvoiceViewModal } from '../../components/modals/InvoiceViewModal';
import { NewInvoiceModal } from '../../components/modals/NewInvoiceModal';
import { Printer, Plus, Search, Trash2 } from 'lucide-react';

export function LedgerSalesPage() {
  const { invoices, deleteSalesInvoice } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 rounded-3xl border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
            Sales & Invoices (Ledger-Pro)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Print invoices, review taxable breakdown & track grand total outstanding
          </p>
        </div>

        {/* Create Option at Top */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Create Invoice
        </button>
      </div>

      {/* Search Top Left */}
      <div className="bg-white dark:bg-[#1e211e] p-4 rounded-2xl border border-gray-200 dark:border-[#2d302d]">
        <div className="flex items-center gap-2.5 w-full md:w-80 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] focus-within:ring-2 focus-within:ring-[#00a631]/30 focus-within:border-[#00a631] transition-all">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 text-xs text-[#3a3b39] dark:text-white bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>CUSTOMER</th>
                <th>TAXABLE</th>
                <th>GST</th>
                <th>GRAND TOTAL</th>
                <th>OUTSTANDING</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400 font-bold">
                    No sales invoices logged yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-[#252825] transition-colors">
                    <td className="font-extrabold text-[#3a3b39] dark:text-white text-xs font-mono">
                      {inv.invoice_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600 dark:text-gray-300">{inv.date}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {inv.invoice_type || 'GST Tax Invoice'}
                      </span>
                    </td>
                    <td className="font-extrabold text-[#3a3b39] dark:text-white">{inv.customer_name}</td>
                    <td className="font-semibold text-gray-700 dark:text-gray-300">
                      ₹{inv.taxable_amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="font-semibold text-gray-700 dark:text-gray-300">
                      ₹{inv.gst_amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="font-extrabold text-[#3a3b39] dark:text-white">
                      ₹{inv.grand_total.toLocaleString('en-IN')}.00
                    </td>
                    <td className="font-extrabold text-red-600 dark:text-red-400">
                      ₹{inv.outstanding.toLocaleString('en-IN')}.00
                    </td>

                    {/* Actions: Print Invoice */}
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#2d302d] hover:bg-gray-200 dark:hover:bg-[#373a37] text-[#3a3b39] dark:text-gray-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Invoice
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this invoice?")) {
                              deleteSalesInvoice(inv.id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

      {showCreateModal && <NewInvoiceModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
