import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewPurchaseModal } from '../../components/modals/NewPurchaseModal';
import { Plus, Search } from 'lucide-react';

export function PurchasesPOsPage() {
  const { purchases } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPurchases = purchases.filter(
    (po) =>
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Purchases & Purchase Orders (POs)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Log procurement from battery manufacturers & raw material vendors
          </p>
        </div>

        {/* Top Right: Create Purchases & POs option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Create Purchases & POs
        </button>
      </div>

      {/* Search Top Left */}
      <div className="glass p-4 rounded-2xl border border-white/60">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO # (GW-PO-2026-0001), Supplier..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input font-semibold"
          />
        </div>
      </div>

      {/* Data Table Matching User Photo */}
      <div className="glass-strong rounded-3xl border border-white/60 overflow-hidden shadow-sm">
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
                      <button
                        type="button"
                        onClick={() => alert(`Purchase PO #${po.po_number}`)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        View PO
                      </button>
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
