import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewPaymentInModal } from '../../components/modals/NewPaymentInModal';
import { Plus, Search, Trash2 } from 'lucide-react';

export function PaymentInPage() {
  const { payments, deletePayment } = useData();

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
      <div className="glass-strong p-6 rounded-3xl border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
            Payment Received (Payment In)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
      <div className="bg-white dark:bg-[#1e211e] p-4 rounded-2xl border border-gray-200 dark:border-[#2d302d]">
        <div className="flex items-center gap-2.5 w-full md:w-80 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] focus-within:ring-2 focus-within:ring-[#00a631]/30 focus-within:border-[#00a631] transition-all">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 text-xs text-[#3a3b39] dark:text-white bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
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
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-[#252825] transition-colors">
                    <td className="font-extrabold text-[#3a3b39] dark:text-white text-xs font-mono">
                      {p.receipt_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600 dark:text-gray-300">{p.date}</td>
                    <td className="font-extrabold text-[#3a3b39] dark:text-white">
                      {p.party_name}
                      {p.party_uoi && (
                        <span className="text-[10px] text-gray-400 font-normal block font-mono">
                          {p.party_uoi}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {p.reference}
                    </td>
                    <td className="text-right font-extrabold text-[#00a631] dark:text-emerald-400 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Receipt #${p.receipt_number}`)}
                          className="px-3 py-1 bg-gray-100 dark:bg-[#2d302d] hover:bg-gray-200 dark:hover:bg-[#373a37] text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          View Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this payment receipt?")) {
                              deletePayment(p.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline-block" /> Delete
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

      {showAddModal && <NewPaymentInModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
