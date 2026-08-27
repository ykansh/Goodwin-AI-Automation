import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewWarrantyModal } from '../../components/modals/NewWarrantyModal';
import { Plus, Search } from 'lucide-react';

export function BatteryWarrantyPage() {
  const { warranties, updateWarrantyStatus } = useData();

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
      {/* Header Banner */}
      <div className="glass-strong p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Battery Warranty Tracker
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Register battery serial numbers, track replacement validity & process warranty claims
          </p>
        </div>

        {/* Top Right: Register battery warranty option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Register Battery Warranty
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
            placeholder="Search Serial # (SN-100001), Product, Customer..."
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
