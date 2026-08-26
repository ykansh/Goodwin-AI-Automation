import type { Customer, Supplier } from '../../types';
import { useData } from '../../store/DataContext';
import { X, FileText, History } from 'lucide-react';

interface CustomerLedgerModalProps {
  party: Customer | Supplier | null;
  partyType?: 'customer' | 'supplier';
  onClose: () => void;
}

export function CustomerLedgerModal({ party, partyType = 'customer', onClose }: CustomerLedgerModalProps) {
  const { ledgerEntries } = useData();

  if (!party) return null;

  const partyEntries = ledgerEntries.filter(
    (entry) => entry.party_id === party.id || entry.party_name.toLowerCase() === party.name.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#2a2b29] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#cde06c]" />
              <h2 className="text-xl font-extrabold tracking-wide">
                Ledger History: {party.name}
              </h2>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              UOI ID: <span className="text-[#cde06c] font-bold">{'uoi' in party ? party.uoi : 'GW-SUPP-001'}</span> |
              GSTIN: <span className="font-mono">{party.gstin}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="p-6 bg-white/60 border-b border-gray-200/60 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Party Contact & Location</span>
            <p className="text-sm font-bold text-[#3a3b39] mt-1">{party.contact}</p>
            <p className="text-xs text-gray-500 truncate">{party.address}</p>
          </div>

          <div className="glass-card p-4">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Party Type & Category</span>
            <p className="text-sm font-bold text-[#3a3b39] mt-1 capitalize">{party.type}</p>
            {'salesperson' in party && (
              <p className="text-xs text-gray-500">Salesperson: {party.salesperson}</p>
            )}
          </div>

          <div className="glass-card p-4 bg-emerald-50/50 border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Current Net Balance</span>
            <p className="text-xl font-extrabold text-[#00a631] mt-1">
              ₹{party.outstanding.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-gray-500">
              {partyType === 'customer' ? 'Outstanding Receivables' : 'Supplier Payables'}
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="p-6 max-h-[450px] overflow-y-auto">
          {partyEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold">No ledger history logged yet for this party.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doc # / Ref</th>
                  <th>Description</th>
                  <th className="text-right">Debit (₹)</th>
                  <th className="text-right">Credit (₹)</th>
                  <th className="text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {partyEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="font-semibold text-gray-600">{entry.date}</td>
                    <td className="font-mono font-bold text-[#00a631]">{entry.doc_number || '-'}</td>
                    <td className="font-medium text-[#3a3b39]">{entry.description}</td>
                    <td className="text-right font-bold text-gray-700">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="text-right font-bold text-emerald-700">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="text-right font-extrabold text-[#3a3b39]">
                      ₹{entry.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100/80 border-t border-gray-200/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#3a3b39] text-white text-xs font-bold rounded-xl hover:bg-black transition-all cursor-pointer"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
}
