import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead, LostReason } from '../../types';
import { X, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';

interface MarkLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess?: () => void;
}

const LOST_REASONS: LostReason[] = [
  'Price too high',
  'Bought from competitor',
  'Not interested',
  'No response',
  'Requirement cancelled',
  'Other',
];

export function MarkLostModal({ isOpen, onClose, lead, onSuccess }: MarkLostModalProps) {
  const { updateLead, addActivity } = useData();

  const [reason, setReason] = useState<LostReason>('Price too high');
  const [notes, setNotes] = useState('');

  if (!isOpen || !lead) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    updateLead(lead.id, {
      stage: 'Lost',
      lost_reason: reason,
      notes: notes.trim() ? `${lead.notes ? lead.notes + '\n\n' : ''}[Lost Reason: ${reason}] ${notes.trim()}` : lead.notes,
    });

    addActivity({
      lead_id: lead.id,
      type: 'Note',
      description: `Marked as Lost: ${reason}. ${notes.trim() ? 'Notes: ' + notes.trim() : ''}`,
      created_by: 'Admin',
    });

    toast.success(`Lead marked as Lost (${reason})`);
    if (onSuccess) onSuccess();
    onClose();
  };

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
                <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Mark Lead as Lost ({lead.company_name || lead.name})</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Record root cause analytics and reason for opportunity drop
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

      {/* 2 & 3. Scrollable Form Area with min-height: 0 flex container */}
      <form onSubmit={handleConfirm} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-6">
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  Select Primary Reason for Loss
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Categorize why this commercial prospect did not convert</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {LOST_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                      reason === r
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-300 shadow-xs'
                        : 'border-gray-200 dark:border-[#2d302d] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lostReason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="text-red-600 focus:ring-red-500 h-4 w-4"
                    />
                    <span className="truncate">{r}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Detailed Notes & Competitor Intelligence (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What competitor was chosen, price difference, or customer feedback..."
                  className="w-full p-3.5 text-sm glass-input font-medium resize-none min-h-[90px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 10, 11, 12. Sticky Action Bar */}
        <div className="shrink-0 bg-white dark:bg-[#1a1d1a] border-t border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm z-10">
          <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="h-10 sm:h-11 px-5 rounded-xl border border-gray-300 dark:border-[#2d302d] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold shadow-md shadow-red-600/25 transition-all cursor-pointer active:scale-95"
            >
              Confirm & Mark Lost
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
