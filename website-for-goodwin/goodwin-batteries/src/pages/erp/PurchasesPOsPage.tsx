import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewPurchaseModal } from '../../components/modals/NewPurchaseModal';
import { Plus, Search, Trash2 } from 'lucide-react';

export function PurchasesPOsPage() {
  const { purchases, deletePurchaseOrder } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPurchases = purchases.filter(
    (po) =>
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-strong p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
              Purchases &amp; Purchase Orders (POs)
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Log procurement from battery manufacturers &amp; raw material vendors
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> + Create Purchases &amp; POs
          </button>
        </div>
        {/* Search bar — flex layout */}
        <div className="flex items-center gap-2 w-full sm:w-56 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
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

      {/* Data Table Matching User Photo */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>PURCHASE #</th>
                <th>DATE</th>
                <th>SUPPLIER</th>
                <th>TAXABLE</th>
                <th>GST</th>
                <th>GRAND TOTAL</th>
                <th>OUTSTANDING</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400 font-bold">
                    No purchase invoices logged.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/50">
                    {/* PURCHASE # */}
                    <td className="font-extrabold text-[#3a3b39] text-xs font-mono">
                      {po.po_number}
                    </td>

                    {/* DATE */}
                    <td className="text-xs font-semibold text-gray-600">{po.date}</td>

                    {/* SUPPLIER */}
                    <td className="font-extrabold text-[#3a3b39]">{po.supplier_name}</td>

                    {/* TAXABLE */}
                    <td className="font-semibold text-gray-700">
                      ₹{po.taxable_amount.toLocaleString('en-IN')}.00
                    </td>

                    {/* GST */}
                    <td className="font-semibold text-gray-700">
                      ₹{po.gst_amount.toLocaleString('en-IN')}.00
                    </td>

                    {/* GRAND TOTAL */}
                    <td className="font-extrabold text-[#3a3b39]">
                      ₹{po.grand_total.toLocaleString('en-IN')}.00
                    </td>

                    {/* OUTSTANDING */}
                    <td className="font-extrabold text-red-600">
                      ₹{po.outstanding.toLocaleString('en-IN')}.00
                    </td>

                    {/* ACTIONS */}
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Purchase PO #${po.po_number}`)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          View PO
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this PO?")) {
                              deletePurchaseOrder(po.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
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

      {showAddModal && <NewPurchaseModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
