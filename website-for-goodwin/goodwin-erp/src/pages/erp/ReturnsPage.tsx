import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewReturnModal } from '../../components/modals/NewReturnModal';
import { Plus, Search } from 'lucide-react';

export function ReturnsPage() {
  const { returns } = useData();

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
      <div className="glass-strong p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Returns (Credit / Debit Notes)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage battery sales returns (Credit Notes) & purchase returns to suppliers (Debit Notes)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Create Return
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass p-4 rounded-2xl border border-white/60">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Note # (GW-CN-001), Party, Reason..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input font-semibold"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-strong rounded-3xl border border-white/60 overflow-hidden shadow-sm">
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
                  <tr key={r.id}>
                    <td className="font-extrabold text-[#3a3b39] font-mono text-xs">
                      {r.note_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600">{r.date}</td>
                    <td>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          r.type === 'credit'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {r.type === 'credit' ? 'Credit Note (Sales)' : 'Debit Note (Purchase)'}
                      </span>
                    </td>
                    <td className="font-extrabold text-[#3a3b39]">{r.party_name}</td>
                    <td className="font-extrabold text-[#00a631]">
                      ₹{r.amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="text-xs text-gray-600 font-medium">{r.reason}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Return Note ${r.note_number}`)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        View Note
                      </button>
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
