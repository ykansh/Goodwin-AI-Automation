import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewReturnModal } from '../../components/modals/NewReturnModal';
import { Plus, Search, Trash2 } from 'lucide-react';

export function ReturnsPage() {
  const { returns, deleteReturn } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredReturns = returns.filter(
    (r) =>
      r.note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 rounded-3xl border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
            Returns (Credit / Debit Notes)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage battery sales returns (Credit Notes) & purchase returns to suppliers (Debit Notes)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> + Create Return
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>NOTE #</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>PARTY NAME</th>
                <th>AMOUNT (₹)</th>
                <th>REASON FOR RETURN</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400 font-bold">
                    No returns logged yet.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                    <td className="font-extrabold text-[#3a3b39] dark:text-white font-mono text-xs">
                      {r.note_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600 dark:text-gray-400">{r.date}</td>
                    <td>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          r.type === 'credit'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        {r.type === 'credit' ? 'Credit Note (Sales)' : 'Debit Note (Purchase)'}
                      </span>
                    </td>
                    <td className="font-extrabold text-[#3a3b39] dark:text-white">{r.party_name}</td>
                    <td className="font-extrabold text-[#00a631]">
                      ₹{r.amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="text-xs text-gray-600 dark:text-gray-400 font-medium">{r.reason}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          r.status === 'processed'
                            ? 'bg-[#00a631]/10 text-[#00a631]'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-100 dark:bg-[#252825] hover:bg-gray-200 dark:hover:bg-[#2d302d] text-[#3a3b39] dark:text-gray-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this return?")) {
                              deleteReturn(r.id);
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

      {showAddModal && <NewReturnModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
