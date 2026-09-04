import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewWarrantyModal } from '../../components/modals/NewWarrantyModal';
import { Plus, Search, Trash2 } from 'lucide-react';

export function BatteryWarrantyPage() {
  const { warranties, updateWarrantyStatus, deleteWarranty } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredWarranties = warranties.filter(
    (w) =>
      w.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.battery_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-strong p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
              Battery Warranty Tracker
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Register battery serial numbers, track replacement validity &amp; process warranty claims
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> + Register Battery Warranty
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
                <th>SERIAL #</th>
                <th>PRODUCT</th>
                <th>CUSTOMER</th>
                <th>SALE DATE</th>
                <th>WARRANTY EXPIRY</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarranties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">
                    No batteries registered for warranty yet.
                  </td>
                </tr>
              ) : (
                filteredWarranties.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50">
                    {/* SERIAL # */}
                    <td className="font-extrabold text-[#3a3b39] text-xs font-mono">
                      {w.serial_number}
                    </td>

                    {/* PRODUCT */}
                    <td>
                      <div className="font-extrabold text-[#3a3b39] text-xs">{w.product_name}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{w.battery_model}</div>
                    </td>

                    {/* CUSTOMER */}
                    <td className="font-extrabold text-[#3a3b39]">{w.customer_name}</td>

                    {/* SALE DATE */}
                    <td className="text-xs font-semibold text-gray-600">{w.purchase_date}</td>

                    {/* WARRANTY EXPIRY */}
                    <td className="text-xs font-bold text-gray-700">{w.warranty_expiry}</td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          w.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : w.status === 'claimed'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="text-right space-x-1">
                      {w.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => updateWarrantyStatus(w.id, 'claimed')}
                          className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-extrabold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                        >
                          Process Claim
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => alert(`Certificate for Serial #${w.serial_number}`)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        View Card
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this warranty registration?")) {
                            deleteWarranty(w.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 inline-flex"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <NewWarrantyModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
