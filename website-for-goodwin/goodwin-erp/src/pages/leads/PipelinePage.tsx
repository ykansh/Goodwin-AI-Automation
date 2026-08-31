import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead, LeadStage } from '../../types';
import { Plus, User } from 'lucide-react';
import { LeadFormModal } from '../../components/leads/LeadFormModal';
import { LeadDetailsDrawer } from '../../components/leads/LeadDetailsDrawer';
import { ConvertLeadModal } from '../../components/leads/ConvertLeadModal';
import { MarkLostModal } from '../../components/leads/MarkLostModal';
import toast from 'react-hot-toast';

const STAGES: { stage: LeadStage; label: string; color: string; badge: string; border: string }[] = [
  { stage: 'New', label: 'New', color: 'bg-blue-500', badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { stage: 'Contacted', label: 'Contacted', color: 'bg-purple-500', badge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  { stage: 'Follow-up', label: 'Follow-up', color: 'bg-amber-500', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { stage: 'Qualified', label: 'Qualified', color: 'bg-teal-500', badge: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  { stage: 'Won', label: 'Won', color: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { stage: 'Lost', label: 'Lost', color: 'bg-red-500', badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
];

export function PipelinePage() {
  const { leads, updateLead, addActivity } = useData();

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [lostLead, setLostLead] = useState<Lead | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Drag & Drop Handlers
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStage: LeadStage) => {
    if (!draggedLeadId) return;

    const lead = leads.find((l) => l.id === draggedLeadId);
    if (!lead || lead.stage === targetStage) {
      setDraggedLeadId(null);
      return;
    }

    if (targetStage === 'Won') {
      setDraggedLeadId(null);
      setConvertLead(lead);
      return;
    }

    if (targetStage === 'Lost') {
      setDraggedLeadId(null);
      setLostLead(lead);
      return;
    }

    updateLead(lead.id, { stage: targetStage });
    addActivity({
      lead_id: lead.id,
      type: 'Note',
      description: `Moved stage from ${lead.stage} to ${targetStage} via Pipeline`,
      created_by: 'Admin',
    });

    toast.success(`Moved to ${targetStage}`);
    setDraggedLeadId(null);
  };

  const formatFollowupBadge = (dateStr?: string) => {
    if (!dateStr) return null;
    if (dateStr === todayStr) {
      return (
        <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Follow-up: Today
        </span>
      );
    }
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrowStr) {
      return (
        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
          Follow-up: Tomorrow
        </span>
      );
    }
    if (dateStr < todayStr) {
      return (
        <span className="text-[11px] font-black text-red-600 dark:text-red-400">
          Overdue: {dateStr}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
        Follow-up: {dateStr}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="glass-strong p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight">
            Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Visual sales pipeline. Drag and drop leads between stages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer self-start md:self-auto shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Lead</span>
        </button>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1200px] items-start">
          {STAGES.map((col) => {
            const colLeads = leads.filter((l) => l.stage === col.stage);
            const colTotalValue = colLeads.reduce((sum, l) => sum + (l.expected_value || 0), 0);

            return (
              <div
                key={col.stage}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.stage)}
                className="flex-1 min-w-[200px] max-w-[260px] bg-gray-50/80 dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] rounded-2xl p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/70 dark:border-[#2d302d]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="text-xs font-black text-[#3a3b39] dark:text-white uppercase tracking-wide">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-[#252825] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#374137]">
                      {colLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-400">
                    ₹{(colTotalValue / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      onClick={() => setDrawerLead(lead)}
                      className={`p-3.5 bg-white dark:bg-[#202420] border border-gray-200/80 dark:border-[#2d302d] rounded-xl shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-grab active:cursor-grabbing group ${
                        draggedLeadId === lead.id ? 'opacity-40 scale-95 border-dashed border-blue-500' : ''
                      }`}
                    >
                      {/* Company Name */}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="text-xs font-extrabold text-[#3a3b39] dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {lead.company_name}
                        </h4>
                      </div>

                      {/* Contact Person */}
                      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{lead.name}</span>
                      </div>

                      {/* Expected Value */}
                      <div className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono mb-2">
                        ₹{lead.expected_value ? lead.expected_value.toLocaleString('en-IN') : '0'}
                      </div>

                      {/* Next Follow-up */}
                      <div className="pt-2 border-t border-gray-100 dark:border-[#2d302d] flex items-center justify-between">
                        <div>
                          {formatFollowupBadge(lead.next_followup_date) || (
                            <span className="text-[10px] text-gray-400 font-medium">No follow-up</span>
                          )}
                        </div>

                        {lead.party_id && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            Party
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="h-28 border border-dashed border-gray-200 dark:border-[#2d302d] rounded-xl flex items-center justify-center text-[11px] font-semibold text-gray-400">
                      Drop lead here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals & Drawers */}
      <LeadFormModal
        isOpen={isAddOpen || Boolean(editingLead)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingLead(null);
        }}
        initialLead={editingLead}
      />

      <LeadDetailsDrawer
        isOpen={Boolean(drawerLead)}
        onClose={() => setDrawerLead(null)}
        lead={drawerLead}
        onEdit={(l) => {
          setDrawerLead(null);
          setEditingLead(l);
        }}
        onChangeStage={(l) => {
          setDrawerLead(null);
          setEditingLead(l);
        }}
        onConvert={(l) => {
          setDrawerLead(null);
          setConvertLead(l);
        }}
        onMarkLost={(l) => {
          setDrawerLead(null);
          setLostLead(l);
        }}
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
