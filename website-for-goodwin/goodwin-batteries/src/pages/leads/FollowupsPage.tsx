import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead } from '../../types';
import {
  Phone, MessageSquare, ExternalLink, Calendar, Clock,
  AlertCircle, Building2
} from 'lucide-react';
import { LeadDetailsDrawer } from '../../components/leads/LeadDetailsDrawer';
import { LeadFormModal } from '../../components/leads/LeadFormModal';
import { ConvertLeadModal } from '../../components/leads/ConvertLeadModal';
import { MarkLostModal } from '../../components/leads/MarkLostModal';

export function FollowupsPage() {
  const { leads } = useData();

  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [lostLead, setLostLead] = useState<Lead | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Partition leads with follow-up dates
  const activeFollowups = leads.filter(
    (l) => l.next_followup_date && l.stage !== 'Won' && l.stage !== 'Lost'
  );

  const overdueLeads = activeFollowups
    .filter((l) => l.next_followup_date < todayStr)
    .sort((a, b) => new Date(a.next_followup_date).getTime() - new Date(b.next_followup_date).getTime());

  const todayLeads = activeFollowups
    .filter((l) => l.next_followup_date === todayStr);

  const upcomingLeads = activeFollowups
    .filter((l) => l.next_followup_date > todayStr)
    .sort((a, b) => new Date(a.next_followup_date).getTime() - new Date(b.next_followup_date).getTime());

  const renderFollowupCard = (lead: Lead, status: 'overdue' | 'today' | 'upcoming') => {
    return (
      <div
        key={lead.id}
        className={`p-4 sm:p-5 bg-white dark:bg-[#1a1d1a] border rounded-2xl transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          status === 'overdue'
            ? 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10'
            : status === 'today'
              ? 'border-amber-200 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
              : 'border-gray-200 dark:border-[#2d302d]'
        }`}
      >
        {/* Left Info */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3
              onClick={() => setDrawerLead(lead)}
              className="text-sm font-extrabold text-[#3a3b39] dark:text-white hover:text-blue-600 cursor-pointer"
            >
              {lead.name}
            </h3>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{lead.company_name}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {lead.stage}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span
                className={`font-extrabold ${
                  status === 'overdue'
                    ? 'text-red-600 dark:text-red-400'
                    : status === 'today'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {status === 'today' ? 'Today' : lead.next_followup_date}
              </span>
              {lead.next_followup_time && <span>at {lead.next_followup_time}</span>}
            </div>

            <div className="flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400 font-bold">
              <span>Value: ₹{lead.expected_value ? lead.expected_value.toLocaleString('en-IN') : '0'}</span>
            </div>

            {lead.requirement && (
              <span className="text-[11px] text-gray-400 truncate max-w-xs">
                {lead.requirement}
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-extrabold transition-colors"
            title="Call"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>

          <a
            href={`https://wa.me/91${(lead.whatsapp || lead.phone).replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-extrabold transition-colors"
            title="WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setDrawerLead(lead)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-[#252825] hover:bg-gray-200 dark:hover:bg-[#2d302d] text-gray-700 dark:text-gray-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Lead</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="glass-strong p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight">
          Follow-ups
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Scheduled calls, reminders and customer follow-up timeline.
        </p>
      </div>

      {/* ── Section 1: Overdue ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue ({overdueLeads.length})</span>
          </h2>
        </div>

        {overdueLeads.length === 0 ? (
          <div className="p-6 bg-white dark:bg-[#1a1d1a] border border-gray-200/60 dark:border-[#2d302d] rounded-2xl text-center text-xs text-gray-400 font-semibold">
            No overdue follow-ups. Great job!
          </div>
        ) : (
          <div className="space-y-3">
            {overdueLeads.map((lead) => renderFollowupCard(lead, 'overdue'))}
          </div>
        )}
      </div>

      {/* ── Section 2: Today ───────────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Today ({todayLeads.length})</span>
          </h2>
        </div>

        {todayLeads.length === 0 ? (
          <div className="p-6 bg-white dark:bg-[#1a1d1a] border border-gray-200/60 dark:border-[#2d302d] rounded-2xl text-center text-xs text-gray-400 font-semibold">
            No follow-ups due today.
          </div>
        ) : (
          <div className="space-y-3">
            {todayLeads.map((lead) => renderFollowupCard(lead, 'today'))}
          </div>
        )}
      </div>

      {/* ── Section 3: Upcoming ────────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Upcoming ({upcomingLeads.length})</span>
          </h2>
        </div>

        {upcomingLeads.length === 0 ? (
          <div className="p-6 bg-white dark:bg-[#1a1d1a] border border-gray-200/60 dark:border-[#2d302d] rounded-2xl text-center text-xs text-gray-400 font-semibold">
            No upcoming follow-ups scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingLeads.map((lead) => renderFollowupCard(lead, 'upcoming'))}
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <LeadDetailsDrawer
        isOpen={Boolean(drawerLead)}
        onClose={() => setDrawerLead(null)}
        lead={drawerLead}
        onEdit={(l) => {
          setDrawerLead(null);
          setEditingLead(l);
        }}
        onChangeStage={() => {}}
        onConvert={(l) => {
          setDrawerLead(null);
          setConvertLead(l);
        }}
        onMarkLost={(l) => {
          setDrawerLead(null);
          setLostLead(l);
        }}
      />

      <LeadFormModal
        isOpen={Boolean(editingLead)}
        onClose={() => setEditingLead(null)}
        initialLead={editingLead}
      />

      <ConvertLeadModal
        isOpen={Boolean(convertLead)}
        onClose={() => setConvertLead(null)}
        lead={convertLead}
      />

      <MarkLostModal
        isOpen={Boolean(lostLead)}
        onClose={() => setLostLead(null)}
        lead={lostLead}
      />
    </div>
  );
}
