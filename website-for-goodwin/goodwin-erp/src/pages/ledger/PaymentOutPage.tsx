import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { NewPaymentOutModal } from '../../components/modals/NewPaymentOutModal';
import { Plus, Search } from 'lucide-react';

export function PaymentOutPage() {
  const { payments } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const paymentOutList = payments.filter((p) => p.direction === 'out');

  const filteredPayments = paymentOutList.filter(
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
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Payment Made (Payment Out)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Log outgoing payments to suppliers, component vendors & manufacturers
          </p>
        </div>

        {/* Take Payment Out Option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Take Payment Out
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#1e211e] p-4 rounded-2xl border border-gray-200 dark:border-[#2d302d]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Voucher #, Supplier Name, UTR..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input font-semibold"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>VOUCHER #</th>
                <th>DATE</th>
                <th>SUPPLIER / VENDOR</th>
                <th>PAYMENT MODE</th>
                <th>REFERENCE #</th>
                <th className="text-right">AMOUNT PAID (₹)</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">
                    No payment out vouchers logged yet.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="font-extrabold text-[#3a3b39] text-xs font-mono">
                      {p.receipt_number}
                    </td>
                    <td className="text-xs font-semibold text-gray-600">{p.date}</td>
                    <td className="font-extrabold text-[#3a3b39]">{p.party_name}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#3a3b39]/10 text-[#3a3b39]">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-semibold text-gray-600">
                      {p.reference}
                    </td>
                    <td className="text-right font-extrabold text-[#3a3b39] text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Voucher #${p.receipt_number}`)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        View Voucher
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <NewPaymentOutModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
