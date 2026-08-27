import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewPaymentInModal } from '../../components/modals/NewPaymentInModal';
import { Plus, Search } from 'lucide-react';

export function PaymentInPage() {
  const { payments } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const paymentInList = payments.filter((p) => p.direction === 'in');

  const filteredPayments = paymentInList.filter(
    (p) =>
      p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Payment Received (Payment In)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Record incoming payments from dealers & retailers to clear outstanding balances
          </p>
        </div>

        {/* Take Payment In Option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Take Payment In
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
            placeholder="Search Receipt # (GW-RCT-001), Customer, UTR..."
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
                <th>RECEIPT #</th>
                <th>DATE</th>
                <th>CUSTOMER / PARTY</th>
                <th>PAYMENT MODE</th>
                <th>REFERENCE #</th>
                <th className="text-right">AMOUNT RECEIVED (₹)</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">
                    No payment in receipts logged yet.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="font-extrabold text-[#3a3b39] text-xs font-mono">
                      {p.receipt_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600">{p.date}</td>
                    <td className="font-extrabold text-[#3a3b39]">
                      {p.party_name}
                      {p.party_uoi && (
                        <span className="text-[10px] text-gray-400 font-normal block font-mono">
                          {p.party_uoi}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-semibold text-gray-600">
                      {p.reference}
                    </td>
                    <td className="text-right font-extrabold text-[#00a631] text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Receipt #${p.receipt_number}`)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <NewPaymentInModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
