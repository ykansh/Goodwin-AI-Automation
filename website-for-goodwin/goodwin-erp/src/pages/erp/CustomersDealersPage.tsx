import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Customer } from '../../types';
import { CustomerLedgerModal } from '../../components/modals/CustomerLedgerModal';
import { NewCustomerModal } from '../../components/modals/NewCustomerModal';
import { EditCustomerModal } from '../../components/modals/EditCustomerModal';
import { Search, UserPlus, Filter, Edit3, History, Trash2 } from 'lucide-react';

export function CustomersDealersPage() {
  const { customers, deleteCustomer } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.uoi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.includes(searchTerm) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || c.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with integrated search */}
      <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-[#2d302d] flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight">
              Customers & Dealers Directory
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Manage Goodwin battery distributors, dealers, retailers & OEM partners with UOI tracking
            </p>
          </div>

          {/* Top Right: Add Customer Option */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>

        {/* Integrated Search + Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search — flex layout: icon left, text right, never overlapping */}
          <div className="flex items-center gap-2 w-full sm:w-52 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-[#00a631]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="glass-input px-3 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer w-48 capitalize"
            >
              <option value="all">All Types</option>
              <option value="dealer">Dealer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
              <option value="oem">OEM Partner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="data-table">
            <thead>
              <tr>
                <th>UOI (Customer ID)</th>
                <th>Customer / Firm Name</th>
                <th>Type</th>
                <th>Contact & Email</th>
                <th>GSTIN</th>
                <th>Outstanding Balance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500 font-bold">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono font-extrabold text-[#00a631] text-xs">
                      {c.uoi}
                    </td>
                    <td>
                      <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm">{c.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{c.address}</div>
                    </td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-[#00a631] border border-[#00a631]/20">
                        {c.type}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-gray-700 dark:text-gray-200">{c.contact}</div>
                      <div className="text-[11px] text-gray-400">{c.email}</div>
                    </td>
                    <td className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {c.gstin}
                    </td>
                    <td className="font-extrabold text-sm">
                      <span className={c.outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        ₹{c.outstanding.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="text-right space-x-2 whitespace-nowrap">
                      {/* Action 1: Edit (Opens EditCustomerModal) */}
                      <button
                        type="button"
                        onClick={() => setEditingCustomer(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200/70 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Action 2: Ledger */}
                      <button
                        type="button"
                        onClick={() => setSelectedLedgerCustomer(c)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#00a631]/10 hover:bg-[#00a631]/20 text-[#00a631] text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Ledger</span>
                      </button>

                      {/* Action 3: Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this customer?")) {
                            deleteCustomer(c.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedLedgerCustomer && (
        <CustomerLedgerModal
          party={selectedLedgerCustomer}
          partyType="customer"
          onClose={() => setSelectedLedgerCustomer(null)}
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}

      {showAddModal && <NewCustomerModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
