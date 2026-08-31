import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead, ActivityType, LeadStage } from '../../types';
import {
  X, Phone, Mail, MessageSquare, Building2, User, Calendar,
  Clock, Edit3, ArrowRight, AlertOctagon, CheckCircle2,
  PhoneCall, Users2, FileText, Send, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onEdit: (lead: Lead) => void;
  onChangeStage: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onMarkLost: (lead: Lead) => void;
}

const STAGE_BADGES: Record<LeadStage, string> = {
  New: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Contacted: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'Follow-up': 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Qualified: 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  Won: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Lost: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

export function LeadDetailsDrawer({
  isOpen,
  onClose,
  lead,
  onEdit,
  onChangeStage,
  onConvert,
  onMarkLost,
}: LeadDetailsDrawerProps) {
  const { activities, addActivity } = useData();

  const [newActivityType, setNewActivityType] = useState<ActivityType>('Call');
  const [newActivityDesc, setNewActivityDesc] = useState('');

  if (!isOpen || !lead) return null;

  const leadActivities = activities.filter((a) => a.lead_id === lead.id);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityDesc.trim()) {
      toast.error('Please enter activity description');
      return;
    }

    addActivity({
      lead_id: lead.id,
      type: newActivityType,
      description: newActivityDesc.trim(),
      created_by: 'Admin',
    });

    setNewActivityDesc('');
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call':
        return <PhoneCall className="w-3.5 h-3.5 text-blue-600" />;
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Meeting':
        return <Users2 className="w-3.5 h-3.5 text-purple-600" />;
      case 'Note':
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#181a18] border-l border-gray-200 dark:border-[#2d302d] shadow-2xl h-full flex flex-col z-10 overflow-hidden animate-slide-in-left">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-[#2d302d] bg-gray-50/70 dark:bg-[#202420] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h2 className="text-lg sm:text-xl font-black text-[#3a3b39] dark:text-white truncate">
                  {lead.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${STAGE_BADGES[lead.stage] || ''}`}>
                  {lead.stage}
                </span>
                {lead.party_id && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Converted Party
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>{lead.company_name}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200/60 dark:border-[#2d302d] flex-wrap">
            <button
              type="button"
              onClick={() => onEdit(lead)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#374137] bg-white dark:bg-[#252825] text-xs font-extrabold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d302d] transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeStage(lead)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#374137] bg-white dark:bg-[#252825] text-xs font-extrabold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d302d] transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Change Stage</span>
            </button>

            {!lead.party_id && lead.stage !== 'Lost' && (
              <button
                type="button"
                onClick={() => onConvert(lead)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <span>Convert to Party</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {lead.stage !== 'Lost' && (
              <button
                type="button"
                onClick={() => onMarkLost(lead)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-950/40 transition-all cursor-pointer ml-auto"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Mark Lost</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Lost Banner if Lost */}
          {lead.stage === 'Lost' && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-black text-red-900 dark:text-red-300">Lead Marked as Lost</p>
                <p className="text-red-700 dark:text-red-400 font-semibold mt-0.5">
                  Reason: <span className="font-bold">{lead.lost_reason || 'Not specified'}</span>
                </p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Phone</span>
                  <span className="text-xs font-extrabold text-[#3a3b39] dark:text-white font-mono">{lead.phone}</span>
                </div>
                <a
                  href={`tel:${lead.phone}`}
                  className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors"
                  title="Call"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">WhatsApp</span>
                  <span className="text-xs font-extrabold text-[#3a3b39] dark:text-white font-mono">{lead.whatsapp || lead.phone}</span>
                </div>
                <a
                  href={`https://wa.me/91${(lead.whatsapp || lead.phone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>

              {lead.email && (
                <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl flex items-center justify-between sm:col-span-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Email</span>
                    <span className="text-xs font-extrabold text-[#3a3b39] dark:text-white truncate block">{lead.email}</span>
                  </div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="p-2 bg-gray-200/60 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Lead Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Lead Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Lead Source</span>
                <span className="text-xs font-black text-[#3a3b39] dark:text-white mt-0.5 block">{lead.source}</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Expected Value</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                  ₹{lead.expected_value ? lead.expected_value.toLocaleString('en-IN') : '0'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl col-span-2">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Product / Requirement</span>
                <p className="text-xs font-bold text-[#3a3b39] dark:text-gray-200 mt-1 leading-relaxed">
                  {lead.requirement || 'No specific requirement recorded'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Assigned To</span>
                  <span className="text-xs font-black text-[#3a3b39] dark:text-white flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{lead.assigned_to || 'Unassigned'}</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Added on {lead.created_at}</span>
              </div>
            </div>
          </div>

          {/* Follow-up Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Next Follow-up
            </h3>
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-950 dark:text-amber-200">
                    {lead.next_followup_date || 'No follow-up scheduled'}
                  </div>
                  {lead.next_followup_time && (
                    <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{lead.next_followup_time}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEdit(lead)}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Notes
              </h3>
              <div className="p-3.5 bg-gray-50 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {lead.notes}
              </div>
            </div>
          )}

          {/* Activity Timeline (Section 7) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Activity Timeline
              </h3>
              <span className="text-[11px] font-bold text-gray-400">{leadActivities.length} logged</span>
            </div>

            {/* Quick Log Box */}
            <form onSubmit={handleAddActivity} className="p-3.5 bg-gray-50 dark:bg-[#202420] border border-gray-200/80 dark:border-[#2d302d] rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5">
                {(['Call', 'WhatsApp', 'Meeting', 'Note'] as ActivityType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewActivityType(type)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                      newActivityType === type
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#252825] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-[#374137]'
                    }`}
                  >
                    {getActivityIcon(type)}
                    <span>{type}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newActivityDesc}
                  onChange={(e) => setNewActivityDesc(e.target.value)}
                  placeholder={`Log a ${newActivityType.toLowerCase()} note...`}
                  className="flex-1 px-3 py-1.5 text-xs glass-input font-medium"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Log</span>
                </button>
              </div>
            </form>

            {/* Timeline Items */}
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-[#2d302d]">
              {leadActivities.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 pl-7 py-2">
                  No activity history logged yet.
                </p>
              ) : (
                leadActivities.map((act) => {
                  const dateObj = new Date(act.created_at);
                  const timeFormatted = isNaN(dateObj.getTime())
                    ? 'Recent'
                    : dateObj.toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                  return (
                    <div key={act.id} className="relative pl-7 group">
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#181a18] border-2 border-blue-600 flex items-center justify-center" />
                      <div className="p-3 bg-white dark:bg-[#1f221f] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl hover:shadow-xs transition-shadow">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="flex items-center gap-1 text-[11px] font-black text-gray-800 dark:text-gray-200">
                            {getActivityIcon(act.type)}
                            <span>{act.type}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{timeFormatted}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                          {act.description}
                        </p>
                        <span className="text-[9px] font-bold text-gray-400 block mt-1">
                          by {act.created_by}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
