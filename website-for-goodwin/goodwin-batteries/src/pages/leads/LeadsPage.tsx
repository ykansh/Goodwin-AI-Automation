import { useState, useMemo } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead, LeadStage } from '../../types';
import {
  Plus, Search, MoreHorizontal,
  ChevronLeft, ChevronRight, Users, TrendingUp,
  Clock, Sparkles, Calendar, Building2, AlertOctagon, Trash2
} from 'lucide-react';
import { LeadFormModal } from '../../components/leads/LeadFormModal';
import { LeadDetailsDrawer } from '../../components/leads/LeadDetailsDrawer';
import { ConvertLeadModal } from '../../components/leads/ConvertLeadModal';
import { MarkLostModal } from '../../components/leads/MarkLostModal';
import { ChangeStageModal } from '../../components/leads/ChangeStageModal';

const STAGE_BADGES: Record<LeadStage, { bg: string; text: string; border: string }> = {
  New: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  Contacted: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  'Follow-up': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  Qualified: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  Won: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  Lost: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
};

export function LeadsPage() {
  const { leads, settings, deleteLead } = useData();
  const assignees = settings?.battery_configs?.salespersons?.length > 0 ? settings.battery_configs.salespersons : ['Admin'];

  // Search, Filters & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterFollowup, setFilterFollowup] = useState<string>('all');
  const [filterAssigned, setFilterAssigned] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Modals & Selected Lead
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [lostLead, setLostLead] = useState<Lead | null>(null);
  const [stageLead, setStageLead] = useState<Lead | null>(null);

  // Row Action Dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Summary Metrics
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter((l) => l.stage === 'New').length;
  const followupsDueCount = leads.filter(
    (l) => l.next_followup_date && l.next_followup_date <= todayStr && l.stage !== 'Won' && l.stage !== 'Lost'
  ).length;
  const potentialValueSum = leads
    .filter((l) => l.stage !== 'Lost')
    .reduce((sum, l) => sum + (l.expected_value || 0), 0);

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    let result = leads.filter((l) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.company_name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.requirement && l.requirement.toLowerCase().includes(q));

      const matchesStage = filterStage === 'all' || l.stage === filterStage;
      const matchesSource = filterSource === 'all' || l.source === filterSource;
      const matchesAssigned = filterAssigned === 'all' || l.assigned_to === filterAssigned;

      let matchesFollowup = true;
      if (filterFollowup === 'overdue') {
        matchesFollowup = Boolean(l.next_followup_date && l.next_followup_date < todayStr && l.stage !== 'Won' && l.stage !== 'Lost');
      } else if (filterFollowup === 'today') {
        matchesFollowup = l.next_followup_date === todayStr;
      } else if (filterFollowup === 'upcoming') {
        matchesFollowup = Boolean(l.next_followup_date && l.next_followup_date > todayStr);
      } else if (filterFollowup === 'none') {
        matchesFollowup = !l.next_followup_date;
      }

      return matchesSearch && matchesStage && matchesSource && matchesAssigned && matchesFollowup;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
      if (sortBy === 'followup') {
        if (!a.next_followup_date) return 1;
        if (!b.next_followup_date) return -1;
        return new Date(a.next_followup_date).getTime() - new Date(b.next_followup_date).getTime();
      }
      if (sortBy === 'value') {
        return (b.expected_value || 0) - (a.expected_value || 0);
      }
      if (sortBy === 'az') {
        return (a.name || a.company_name).localeCompare(b.name || b.company_name);
      }
      return 0;
    });

    return result;
  }, [leads, searchTerm, filterStage, filterSource, filterFollowup, filterAssigned, sortBy, todayStr]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatFollowupDate = (dateStr?: string) => {
    if (!dateStr) return <span className="text-gray-400 font-medium">None</span>;
    if (dateStr === todayStr) {
      return <span className="text-amber-600 dark:text-amber-400 font-black flex items-center gap-1">Today</span>;
    }
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrowStr) {
      return <span className="text-blue-600 dark:text-blue-400 font-bold">Tomorrow</span>;
    }
    if (dateStr < todayStr) {
      return <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">Overdue ({dateStr})</span>;
    }
    return <span className="text-gray-700 dark:text-gray-300 font-medium">{dateStr}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── 1. Page Header ─────────────────────────────────────────────── */}
      <div className="glass-strong p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight">
            Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Track and manage your potential customers.
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

      {/* ── 2. Compact Summary Cards (Section 2) ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-[#2d302d] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Total Leads
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#3a3b39] dark:text-white">
              {totalLeadsCount}
            </span>
          </div>
        </div>

        <div className="glass p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-[#2d302d] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              New Leads
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {newLeadsCount}
            </span>
          </div>
        </div>

        <div className="glass p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-[#2d302d] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Follow-ups Due
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {followupsDueCount}
            </span>
          </div>
        </div>

        <div className="glass p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-[#2d302d] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Potential Value
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#3a3b39] dark:text-white">
              ₹{(potentialValueSum / 100000).toFixed(1)}L
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Toolbar (Search, Filters & Sort) ─────────────────────────── */}
      <div className="glass p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-[#2d302d] space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box — Flex Layout (Vector left, text right, zero overlap) */}
          <div className="flex items-center gap-2.5 w-full lg:w-80 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] focus-within:ring-2 focus-within:ring-blue-600/30 focus-within:border-blue-600 transition-all">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Leads..."
              className="flex-1 min-w-0 text-xs sm:text-sm text-[#3a3b39] dark:text-white bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold"
            />
          </div>

          {/* Filter Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 lg:pb-0">
            {/* Stage Filter */}
            <select
              value={filterStage}
              onChange={(e) => {
                setFilterStage(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-bold glass-input bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 cursor-pointer rounded-xl shrink-0"
            >
              <option value="all">Stage: All</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Lead Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-bold glass-input bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 cursor-pointer rounded-xl shrink-0"
            >
              <option value="all">Source: All</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone">Phone</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Existing Customer">Existing Customer</option>
              <option value="Other">Other</option>
            </select>

            {/* Follow-up Filter */}
            <select
              value={filterFollowup}
              onChange={(e) => {
                setFilterFollowup(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-bold glass-input bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 cursor-pointer rounded-xl shrink-0"
            >
              <option value="all">Follow-up: All</option>
              <option value="today">Due Today</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
              <option value="none">No Follow-up</option>
            </select>

            {/* Assigned To Filter */}
            <select
              value={filterAssigned}
              onChange={(e) => {
                setFilterAssigned(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-bold glass-input bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 cursor-pointer rounded-xl shrink-0"
            >
              <option value="all">Assigned: All</option>
              {assignees.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-bold glass-input bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 cursor-pointer rounded-xl shrink-0"
            >
              <option value="recent">Sort: Recently Added</option>
              <option value="followup">Sort: Follow-up Date</option>
              <option value="value">Sort: Highest Value</option>
              <option value="az">Sort: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. Main Leads Table (Desktop/Tablet) ─────────────────────────── */}
      <div className="glass-strong overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2d302d]">
        <div className="overflow-x-auto min-w-full">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Stage</th>
                <th>Expected Value</th>
                <th>Next Follow-up</th>
                <th>Source</th>
                <th>Assigned To</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#252825] flex items-center justify-center mx-auto text-gray-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-base font-extrabold text-[#3a3b39] dark:text-white">No leads yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Add your first lead to start tracking potential customers.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                      >
                        + Add Lead
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const badge = STAGE_BADGES[lead.stage] || STAGE_BADGES.New;
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-[#252825]/60 transition-colors group cursor-pointer"
                      onClick={() => setDrawerLead(lead)}
                    >
                      {/* Lead Name */}
                      <td>
                        <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm">
                          {lead.name}
                        </div>
                        {lead.email && (
                          <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                            {lead.email}
                          </div>
                        )}
                      </td>

                      {/* Company */}
                      <td>
                        <span className="font-bold text-gray-700 dark:text-gray-200 text-xs">
                          {lead.company_name}
                        </span>
                      </td>

                      {/* Phone */}
                      <td>
                        <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {lead.phone}
                        </span>
                      </td>

                      {/* Stage Badge */}
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {lead.stage}
                        </span>
                      </td>

                      {/* Expected Value */}
                      <td>
                        <span className="font-mono text-xs font-extrabold text-[#3a3b39] dark:text-white">
                          ₹{lead.expected_value ? lead.expected_value.toLocaleString('en-IN') : '0'}
                        </span>
                      </td>

                      {/* Next Follow-up */}
                      <td className="text-xs">
                        {formatFollowupDate(lead.next_followup_date)}
                      </td>

                      {/* Source */}
                      <td>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {lead.source}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {lead.assigned_to || 'Admin'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setDrawerLead(lead)}
                            className="px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#2d302d] hover:bg-gray-200 dark:hover:bg-[#373a37] rounded-lg transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setEditingLead(lead)}
                            className="px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#2d302d] hover:bg-gray-200 dark:hover:bg-[#373a37] rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* More Menu Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === lead.id ? null : lead.id)}
                              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {activeMenuId === lead.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1e211e] rounded-xl shadow-xl border border-gray-200 dark:border-[#2d302d] p-1.5 z-30 animate-scale-in text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setStageLead(lead);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left cursor-pointer flex items-center gap-2"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Change Stage</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setEditingLead(lead);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left cursor-pointer flex items-center gap-2"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Add Follow-up</span>
                                </button>

                                {!lead.party_id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setConvertLead(lead);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg text-left cursor-pointer flex items-center gap-2"
                                  >
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>Convert to Party</span>
                                  </button>
                                )}

                                {lead.stage !== 'Lost' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setLostLead(lead);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer flex items-center gap-2"
                                  >
                                    <AlertOctagon className="w-3.5 h-3.5" />
                                    <span>Mark Lost</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (window.confirm("Are you sure you want to delete this lead?")) {
                                      deleteLead(lead.id);
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left cursor-pointer flex items-center gap-2 mt-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Lead</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLeads.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-[#2d302d] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2d302d] disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-gray-700 dark:text-gray-200">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2d302d] disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals & Drawers ────────────────────────────────────────────── */}
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
          setStageLead(l);
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

      <ChangeStageModal
        isOpen={Boolean(stageLead)}
        onClose={() => setStageLead(null)}
        lead={stageLead}
        onTriggerConvert={() => setConvertLead(stageLead)}
        onTriggerLost={() => setLostLead(stageLead)}
      />
    </div>
  );
}
