import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Supplier } from '../../types';
import { CustomerLedgerModal } from '../../components/modals/CustomerLedgerModal';
import { NewSupplierModal } from '../../components/modals/NewSupplierModal';
import { EditSupplierModal } from '../../components/modals/EditSupplierModal';
import { Search, Truck, Edit3, History } from 'lucide-react';

export function SuppliersVendorsPage() {
  const { suppliers } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLedgerSupplier, setSelectedLedgerSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact.includes(searchTerm) ||
      s.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/60 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight">
            Suppliers & Vendors Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Battery cell manufacturers, lead plates & raw material suppliers
          </p>
        </div>

        {/* Top Right: Add Supplier Option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <Truck className="w-4 h-4" />
          <span>+ Add Vendor / Supplier</span>
        </button>
      </div>

      {/* Search Top Left */}
      <div className="glass p-5 rounded-2xl border border-white/60 dark:border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Supplier Name, Phone, GSTIN..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm glass-input font-bold"
          />
        </div>
      </div>

      {/* Supplier Data Table */}
      <div className="glass-strong rounded-3xl border border-white/60 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier Code</th>
                <th>Supplier / Vendor Firm Name</th>
                <th>Category / Type</th>
                <th>Contact Phone</th>
                <th>GSTIN</th>
                <th>Payable Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500 font-bold">
                    No suppliers logged yet.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs font-extrabold text-[#00a631]">
                      {s.uoi || 'GW-SUPP-1001'}
                    </td>
                    <td>
                      <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm">{s.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{s.address}</div>
                    </td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {s.type}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-gray-700 dark:text-gray-200">{s.contact}</div>
                      <div className="text-[11px] text-gray-400">{s.email}</div>
                    </td>
                    <td className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {s.gstin}
                    </td>
                    <td className="font-extrabold text-sm text-[#3a3b39] dark:text-white">
                      ₹{s.outstanding.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingSupplier(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200/70 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedLedgerSupplier(s)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#00a631]/10 hover:bg-[#00a631]/20 text-[#00a631] text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Ledger</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLedgerSupplier && (
        <CustomerLedgerModal
          party={selectedLedgerSupplier}
          partyType="supplier"
          onClose={() => setSelectedLedgerSupplier(null)}
        />
      )}

      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      )}

      {showAddModal && <NewSupplierModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
