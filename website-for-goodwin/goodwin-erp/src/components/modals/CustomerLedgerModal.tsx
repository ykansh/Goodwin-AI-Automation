import type { Customer, Supplier } from '../../types';
import { useData } from '../../store/DataContext';
import { X, History, Trash2 } from 'lucide-react';

interface CustomerLedgerModalProps {
  party: Customer | Supplier | null;
  partyType?: 'customer' | 'supplier';
  onClose: () => void;
}

export function CustomerLedgerModal({ party, partyType = 'customer', onClose }: CustomerLedgerModalProps) {
  const { ledgerEntries, deleteLedgerEntry } = useData();

  if (!party) return null;

  const partyEntries = ledgerEntries.filter(
    (entry) => entry.party_id === party.id || entry.party_name.toLowerCase() === party.name.toLowerCase()
  );

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in">
      {/* 4. Page Header (Height 56-70px, max-w-1200px aligned) */}
      <header className="shrink-0 h-16 sm:h-[68px] bg-white dark:bg-[#1a1d1a] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-bold"
            >
              <span>← Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-[#2d302d]" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#3a3b39] dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Party Account Statement & Ledger: {party.name}</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono hidden sm:block">
                Code: {'uoi' in party ? party.uoi : 'GW-SUPP-001'} | GSTIN: {party.gstin || 'Unregistered'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2 & 3. Scrollable Area with min-height: 0 flex container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] shadow-xs">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Party Contact & Address</span>
              <p className="text-sm font-bold text-[#3a3b39] dark:text-gray-200 mt-1.5">{party.contact}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{party.address}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] shadow-xs">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Classification</span>
              <p className="text-sm font-bold text-[#3a3b39] dark:text-gray-200 mt-1.5 capitalize">{party.type}</p>
              {'salesperson' in party && (
                <p className="text-xs text-gray-500 mt-1">Assigned Rep: {party.salesperson}</p>
              )}
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] shadow-xs">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                {partyType === 'customer' ? 'Current Customer Receivables' : 'Current Supplier Payables'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1.5">
                ₹{party.outstanding.toLocaleString('en-IN')}
              </p>
              {'credit_limit' in party && (
                <p className="text-xs text-gray-500 mt-1">Approved Credit Limit: ₹{party.credit_limit.toLocaleString('en-IN')}</p>
              )}
            </div>
          </div>

          {/* Ledger Table Card */}
          <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Transaction Audit Trail
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Chronological double-entry debits, credits, and running balance</p>
              </div>
            </div>

            {partyEntries.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-bold">
                No ledger transactions recorded yet for this party account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#2d302d] text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Voucher / Ref</th>
                      <th className="pb-3">Particulars & Description</th>
                      <th className="pb-3 text-right">Debit (₹)</th>
                      <th className="pb-3 text-right">Credit (₹)</th>
                      <th className="pb-3 text-right">Running Balance (₹)</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2d302d]">
                    {partyEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-[#202420] transition-colors">
                        <td className="py-3 font-medium text-gray-600 dark:text-gray-300">{entry.date}</td>
                        <td className="py-3 font-mono font-bold text-gray-700 dark:text-gray-300">{entry.doc_number}</td>
                        <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{entry.description}</td>
                        <td className="py-3 text-right font-bold text-red-600 dark:text-red-400">
                          {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                          {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-3 text-right font-extrabold text-[#3a3b39] dark:text-white">
                          ₹{entry.balance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this ledger entry? This action cannot be undone.")) {
                                deleteLedgerEntry(entry.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 10, 11, 12. Sticky Action Bar */}
      <div className="shrink-0 bg-white dark:bg-[#1a1d1a] border-t border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm z-10">
        <div className="w-full max-w-[1200px] mx-auto flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 sm:h-11 px-6 rounded-xl border border-gray-300 dark:border-[#2d302d] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
}
