import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead, LeadStage } from '../../types';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChangeStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onTriggerConvert?: () => void;
  onTriggerLost?: () => void;
}

const STAGES: { stage: LeadStage; label: string; desc: string; badge: string }[] = [
  { stage: 'New', label: 'New', desc: 'Fresh inquiry received, awaiting contact', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { stage: 'Contacted', label: 'Contacted', desc: 'Initial discussion or intro email sent', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { stage: 'Follow-up', label: 'Follow-up', desc: 'Active communication / quote sent', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { stage: 'Qualified', label: 'Qualified', desc: 'Requirements verified, high intent to purchase', badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  { stage: 'Won', label: 'Won', desc: 'Customer agreed, ready for Party conversion', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { stage: 'Lost', label: 'Lost', desc: 'Deal lost to competitor, budget or cancelled', badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
];

export function ChangeStageModal({
  isOpen,
  onClose,
  lead,
  onTriggerConvert,
  onTriggerLost,
}: ChangeStageModalProps) {
  const { updateLead, addActivity } = useData();
  const [selectedStage, setSelectedStage] = useState<LeadStage>(lead?.stage || 'New');

  if (!isOpen || !lead) return null;

  const handleSave = () => {
    if (selectedStage === 'Won') {
      onClose();
      if (onTriggerConvert) {
        onTriggerConvert();
      } else {
        updateLead(lead.id, { stage: 'Won' });
      }
      return;
    }

    if (selectedStage === 'Lost') {
      onClose();
      if (onTriggerLost) {
        onTriggerLost();
      } else {
        updateLead(lead.id, { stage: 'Lost' });
      }
      return;
    }

    updateLead(lead.id, { stage: selectedStage });
    addActivity({
      lead_id: lead.id,
      type: 'Note',
      description: `Stage changed from ${lead.stage} to ${selectedStage}`,
      created_by: 'Admin',
    });

    toast.success(`Stage updated to ${selectedStage}`);
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
                <span>Change Pipeline Stage ({lead.company_name || lead.name})</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Current stage: <strong className="text-blue-600 dark:text-blue-400">{lead.stage}</strong>
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
          <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Select New Pipeline Stage
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Move prospect through sales qualification stages</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {STAGES.map((s) => (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => setSelectedStage(s.stage)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStage === s.stage
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-gray-200 dark:border-[#2d302d] hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${s.badge}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{s.desc}</p>
                  </div>
                  {selectedStage === s.stage && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
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
            type="button"
            onClick={handleSave}
            className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
          >
            Save Stage
          </button>
        </div>
      </div>
    </div>
  );
}
