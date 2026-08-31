import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Customer, Supplier } from '../../types';
import { CustomerLedgerModal } from '../../components/modals/CustomerLedgerModal';
import { NewCustomerModal } from '../../components/modals/NewCustomerModal';
import { EditCustomerModal } from '../../components/modals/EditCustomerModal';
import { EditSupplierModal } from '../../components/modals/EditSupplierModal';
import { Search, UserPlus, Filter, Edit3, History } from 'lucide-react';

export function PartiesPage() {
  const { customers, suppliers } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLedgerParty, setSelectedLedgerParty] = useState<Customer | Supplier | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Unified party array with partyKind tag
  const customerParties = customers.map((c) => ({ ...c, partyKind: 'customer' as const }));
  const supplierParties = suppliers.map((s) => ({
    ...s,
    partyKind: 'supplier' as const,
    uoi: s.uoi || 'GW-SUPP-1001',
    credit_limit: 1000000,
  }));

  const allParties = [...customerParties, ...supplierParties];

  const filteredParties = allParties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uoi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact.includes(searchTerm) ||
      p.gstin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.type.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 sm:p-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight">
            Parties Directory (Ledger-Pro)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Unified Customer & Supplier ledger registry with UOI tracking & active edit functionality
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Party</span>
        </button>
      </div>

      {/* Filter Bar: Search Top Left & Category Dropdown */}
      <div className="glass p-5 rounded-2xl border border-gray-200 dark:border-[#2d302d] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Option Top Left */}
        <div className="flex items-center gap-2.5 w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] focus-within:ring-2 focus-within:ring-[#00a631]/30 focus-within:border-[#00a631] transition-all">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 text-xs sm:text-sm text-[#3a3b39] dark:text-white bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-bold"
          />
        </div>

        {/* Category Dropdown Menu */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-[#00a631]" />
            <span>Party Category:</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input px-4 py-2 text-xs sm:text-sm font-extrabold bg-white/80 dark:bg-gray-800 text-[#3a3b39] dark:text-white cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 w-full sm:w-60 capitalize"
          >
            <option value="all">All Parties (Customers & Suppliers)</option>
            <option value="dealer">Dealer</option>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
            <option value="oem">OEM Partner</option>
            <option value="manufacturer">Supplier / Manufacturer</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="data-table">
            <thead>
              <tr>
                <th>UOI (Party Code)</th>
                <th>Party Name</th>
                <th>Contact</th>
                <th>GSTIN</th>
                <th>Category Type</th>
                <th>Credit Limit</th>
                <th>Outstanding Balance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 dark:text-gray-500 font-bold">
                    No parties found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredParties.map((p) => (
                  <tr key={p.id}>
                    {/* UOI */}
                    <td className="font-mono text-xs font-extrabold text-[#00a631]">{p.uoi}</td>

                    {/* PARTY */}
                    <td>
                      <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-gray-400">{p.email}</div>
                    </td>

                    {/* CONTACT */}
                    <td className="font-bold text-gray-700 dark:text-gray-200">{p.contact}</td>

                    {/* GSTIN */}
                    <td className="font-mono text-xs text-gray-600 dark:text-gray-300">{p.gstin}</td>

                    {/* TYPE */}
                    <td>
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-200/60 dark:bg-gray-800 text-[#3a3b39] dark:text-gray-200">
                        {p.type}
                      </span>
                    </td>

                    {/* CREDIT LIMIT */}
                    <td className="font-bold text-gray-700 dark:text-gray-200">
                      ₹{p.credit_limit.toLocaleString('en-IN')}
                    </td>

                    {/* OUTSTANDING */}
                    <td className="font-extrabold text-sm text-red-600 dark:text-red-400">
                      ₹{p.outstanding.toLocaleString('en-IN')}
                    </td>

                    {/* ACTIONS: Edit & Ledger */}
                    <td className="text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (p.partyKind === 'customer') {
                            setEditingCustomer(p as Customer);
                          } else {
                            setEditingSupplier(p as Supplier);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200/70 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedLedgerParty(p)}
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

      {selectedLedgerParty && (
        <CustomerLedgerModal party={selectedLedgerParty} onClose={() => setSelectedLedgerParty(null)} />
      )}

      {editingCustomer && (
        <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} />
      )}

      {editingSupplier && (
        <EditSupplierModal supplier={editingSupplier} onClose={() => setEditingSupplier(null)} />
      )}

      {showAddModal && <NewCustomerModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
