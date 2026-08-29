import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { SalesInvoice } from '../../types';
import { InvoiceViewModal } from '../../components/modals/InvoiceViewModal';
import { NewInvoiceModal } from '../../components/modals/NewInvoiceModal';
import { Printer, Plus, Search } from 'lucide-react';

export function LedgerSalesPage() {
  const { invoices } = useData();

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
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Sales & Invoices (Ledger-Pro)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
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
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Invoice #, Customer..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input font-semibold"
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
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="font-extrabold text-[#3a3b39] text-xs font-mono">
                      {inv.invoice_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600">{inv.date}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                        {inv.invoice_type || 'GST Tax Invoice'}
                      </span>
                    </td>
                    <td className="font-extrabold text-[#3a3b39]">{inv.customer_name}</td>
                    <td className="font-semibold text-gray-700">
                      ₹{inv.taxable_amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="font-semibold text-gray-700">
                      ₹{inv.gst_amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="font-extrabold text-[#3a3b39]">
                      ₹{inv.grand_total.toLocaleString('en-IN')}.00
                    </td>
                    <td className="font-extrabold text-red-600">
                      ₹{inv.outstanding.toLocaleString('en-IN')}.00
                    </td>

                    {/* Actions: Print Invoice */}
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#3a3b39] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Invoice
                      </button>
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
