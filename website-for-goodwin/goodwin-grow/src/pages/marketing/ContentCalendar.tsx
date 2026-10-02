import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  Share2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  FolderKanban, 
  BatteryCharging, 
  Bot, 
  Sparkles,
  Send,
  X,
  LayoutGrid,
  CalendarDays,
  Columns3,
  Globe
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useStore } from '../../lib/store';
import { useOperationsStore } from '../../lib/operationsStore';
import { 
  useMarketingCalendarStore, 
  getDayOfWeekName,
  type CalendarEntry, 
  type ContentType, 
  type CreativeStatus, 
  type ApprovalStatus, 
  type PostingStatus, 
  type PlatformType, 
  type BrandType 
} from '../../lib/marketingCalendarStore';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO 
} from 'date-fns';

// ── SVG Brand Icons for Platforms ──
const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GoogleIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
  </svg>
);

export const ContentCalendar = () => {
  // Global Stores
  const employees = useStore((state) => state.employees);
  const operationsProjects = useOperationsStore((state) => state.projects);

  const {
    entries,
    selectedBrandFilter,
    selectedContentTypeFilter,
    selectedPlatformFilter,
    selectedStatusFilter,
    searchQuery,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    togglePostingStatus,
    setSelectedBrandFilter,
    setSelectedContentTypeFilter,
    setSelectedPlatformFilter,
    setSelectedStatusFilter,
    setSearchQuery,
    seedProjectEntries
  } = useMarketingCalendarStore();

  // Component UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'calendar' | 'table' | 'kanban'>('calendar');
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Entry Modal (All 12 required fields)
  const [formData, setFormData] = useState<{
    id?: string;
    projectId?: string;
    projectName?: string;
    brand: BrandType;
    date: string;
    dayOfWeek: string;
    occasion: string;
    contentType: ContentType;
    contentBrief: string;
    caption: string;
    creativeStatus: CreativeStatus;
    approvalStatus: ApprovalStatus;
    scheduledTime: string;
    platforms: PlatformType[];
    assignedTo: string;
    postingStatus: PostingStatus;
  }>({
    brand: 'Goodwin Batteries',
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: getDayOfWeekName(new Date().toISOString().split('T')[0]),
    occasion: '',
    contentType: 'Post',
    contentBrief: '',
    caption: '',
    creativeStatus: 'Idea',
    approvalStatus: 'Pending',
    scheduledTime: '10:00 AM',
    platforms: ['Instagram', 'Facebook'],
    assignedTo: employees?.[0]?.name || 'Ansh Chourasiya',
    postingStatus: 'Pending'
  });

  // Initial load
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Month navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // 1. Brand or Project Filter
      if (selectedBrandFilter !== 'all') {
        const matchesBrand = e.brand?.toLowerCase() === selectedBrandFilter.toLowerCase();
        const matchesProject = e.projectId === selectedBrandFilter || e.projectName?.toLowerCase() === selectedBrandFilter.toLowerCase();
        if (!matchesBrand && !matchesProject) return false;
      }

      // 2. Content Type Filter
      if (selectedContentTypeFilter !== 'all' && e.contentType !== selectedContentTypeFilter) {
        return false;
      }

      // 3. Platform Filter
      if (selectedPlatformFilter !== 'all' && !e.platforms.includes(selectedPlatformFilter as PlatformType)) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatusFilter !== 'all' && e.postingStatus !== selectedStatusFilter) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = 
          e.occasion?.toLowerCase().includes(q) ||
          e.caption?.toLowerCase().includes(q) ||
          e.contentBrief?.toLowerCase().includes(q) ||
          e.brand?.toLowerCase().includes(q) ||
          e.assignedTo?.toLowerCase().includes(q);
        if (!textMatch) return false;
      }

      return true;
    });
  }, [entries, selectedBrandFilter, selectedContentTypeFilter, selectedPlatformFilter, selectedStatusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const reelsCount = filteredEntries.filter(e => e.contentType === 'Reel').length;
    const carouselsCount = filteredEntries.filter(e => e.contentType === 'Carousel').length;
    const postedCount = filteredEntries.filter(e => e.postingStatus === 'Posted').length;
    const approvedCount = filteredEntries.filter(e => e.approvalStatus === 'Approved').length;
    const scheduledCount = filteredEntries.filter(e => e.postingStatus === 'Scheduled').length;
    return { total, reelsCount, carouselsCount, postedCount, approvedCount, scheduledCount };
  }, [filteredEntries]);

  // Handlers for Add/Edit Modal
  const handleOpenAddModal = (dateStr?: string) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const initialBrand: BrandType = 
      selectedBrandFilter !== 'all' && (selectedBrandFilter === 'Goodwin Batteries' || selectedBrandFilter === 'Goodwin Grow AI')
        ? selectedBrandFilter
        : 'Goodwin Batteries';

    // If a project is selected in filter, link it
    const activeProject = operationsProjects?.find(p => p.id === selectedBrandFilter || p.projectName === selectedBrandFilter);

    setFormData({
      projectId: activeProject ? activeProject.id : undefined,
      projectName: activeProject ? activeProject.projectName : undefined,
      brand: activeProject ? `${activeProject.companyName} (${activeProject.projectName})` : initialBrand,
      date: targetDate,
      dayOfWeek: getDayOfWeekName(targetDate),
      occasion: '',
      contentType: 'Post',
      contentBrief: '',
      caption: '',
      creativeStatus: 'Idea',
      approvalStatus: 'Pending',
      scheduledTime: `${targetDate} 10:00 AM`,
      platforms: ['Instagram', 'Facebook'],
      assignedTo: employees?.[0]?.name || 'Ansh Chourasiya',
      postingStatus: 'Pending'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: CalendarEntry) => {
    setSelectedEntry(entry);
    setFormData({
      id: entry.id,
      projectId: entry.projectId,
      projectName: entry.projectName,
      brand: entry.brand,
      date: entry.date,
      dayOfWeek: entry.dayOfWeek,
      occasion: entry.occasion,
      contentType: entry.contentType,
      contentBrief: entry.contentBrief,
      caption: entry.caption,
      creativeStatus: entry.creativeStatus,
      approvalStatus: entry.approvalStatus,
      scheduledTime: entry.scheduledTime,
      platforms: entry.platforms,
      assignedTo: entry.assignedTo,
      postingStatus: entry.postingStatus
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!formData.occasion.trim()) {
      alert('Please enter a festival, occasion, or content topic name.');
      return;
    }

    if (isEditing && formData.id) {
      await updateEntry(formData.id, formData);
      showToast('Calendar entry updated successfully');
    } else {
      await addEntry({
        ...formData,
        dayOfWeek: getDayOfWeekName(formData.date)
      } as any);
      showToast('New content scheduled to calendar');
    }
    setIsModalOpen(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Delete this scheduled calendar entry?')) {
      await deleteEntry(id);
      setIsModalOpen(false);
      showToast('Entry removed from calendar');
    }
  };

  const handleCopyCaption = (caption: string, id: string) => {
    navigator.clipboard.writeText(caption);
    setCopiedCaptionId(id);
    showToast('Caption copied to clipboard!');
    setTimeout(() => setCopiedCaptionId(null), 2500);
  };

  // Helper styles
  const getContentTypeBadge = (type: ContentType) => {
    switch (type) {
      case 'Reel':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20"><Video className="w-3 h-3" /> Reel</span>;
      case 'Carousel':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20"><Layers className="w-3 h-3" /> Carousel</span>;
      case 'Story':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20"><Clock className="w-3 h-3" /> Story</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20"><ImageIcon className="w-3 h-3" /> Post</span>;
    }
  };

  const getCreativeStatusBadge = (status: CreativeStatus) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Ready':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Ready</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">In Progress</span>;
      case 'Needs Revision':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-danger/10 text-danger border border-danger/20">Needs Revision</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-canvas-variant text-secondary-dark border border-canvas-variant">Idea</span>;
    }
  };

  const getPostingStatusBadge = (status: PostingStatus, onClick?: () => void) => {
    const baseClass = "cursor-pointer transition-all inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs";
    switch (status) {
      case 'Posted':
        return (
          <span onClick={onClick} className={`${baseClass} bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/25`} title="Click to toggle status">
            <CheckCircle2 className="w-3 h-3" /> Posted
          </span>
        );
      case 'Scheduled':
        return (
          <span onClick={onClick} className={`${baseClass} bg-primary/15 text-primary-dark border border-primary/30 hover:bg-primary/25`} title="Click to toggle status">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      default:
        return (
          <span onClick={onClick} className={`${baseClass} bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500/25`} title="Click to toggle status">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const renderPlatformBadges = (platforms: PlatformType[]) => {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {platforms.map(p => {
          let icon = <Globe className="w-3 h-3" />;
          let color = "text-secondary-dark bg-canvas-variant/50 border-canvas-variant";
          if (p === 'Instagram') {
            icon = <InstagramIcon className="w-3 h-3 text-pink-600" />;
            color = "bg-pink-500/10 text-pink-700 border-pink-500/20";
          } else if (p === 'Facebook') {
            icon = <FacebookIcon className="w-3 h-3 text-blue-600" />;
            color = "bg-blue-500/10 text-blue-700 border-blue-500/20";
          } else if (p === 'LinkedIn') {
            icon = <LinkedInIcon className="w-3 h-3 text-sky-700" />;
            color = "bg-sky-500/10 text-sky-800 border-sky-500/20";
          } else if (p === 'Google Business') {
            icon = <GoogleIcon className="w-3 h-3 text-red-500" />;
            color = "bg-red-500/10 text-red-700 border-red-500/20";
          }
          return (
            <span key={p} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${color}`}>
              {icon}
              <span className="hidden sm:inline">{p.replace(' Business', '')}</span>
            </span>
          );
        })}
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // 1. Month Calendar Grid View
  // ──────────────────────────────────────────────
  const renderCalendarCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        const dayEntries = filteredEntries.filter(e => e.date === dateKey);
        const hasEntries = dayEntries.length > 0;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleOpenAddModal(dateKey)}
            className={`flex-1 min-h-[125px] border-b border-r border-canvas-variant p-2 flex flex-col justify-between transition-all group ${
              !isCurrentMonth 
                ? 'bg-canvas/50 text-secondary-light/40' 
                : isToday
                  ? 'bg-primary/5 ring-1 ring-inset ring-primary/30'
                  : 'bg-canvas-surface hover:bg-canvas/40'
            }`}
          >
            <div>
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isToday 
                    ? 'bg-primary text-white shadow-xs font-display' 
                    : isCurrentMonth ? 'text-secondary-dark' : 'text-secondary-light/40'
                }`}>
                  {format(cloneDay, 'd')}
                </span>

                <div className="flex items-center gap-1">
                  {hasEntries && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary/10 text-primary">
                      {dayEntries.length} {dayEntries.length === 1 ? 'post' : 'posts'}
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAddModal(dateKey);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-secondary-light hover:text-primary transition-opacity"
                    title={`Add post on ${format(cloneDay, 'MMM d')}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Entries List */}
              <div className="mt-1.5 space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5 hide-scrollbar">
                {dayEntries.map((entry) => {
                  const isBatteries = entry.brand?.includes('Batteries');
                  const isAI = entry.brand?.includes('Grow AI');
                  const brandBorder = isBatteries ? 'border-amber-400/60 bg-amber-500/5' : isAI ? 'border-purple-400/60 bg-purple-500/5' : 'border-primary/40 bg-primary/5';

                  return (
                    <div
                      key={entry.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(entry);
                      }}
                      className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${brandBorder}`}
                      title={`${entry.brand}: ${entry.occasion}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-secondary-dark truncate">
                          {entry.occasion}
                        </span>
                        <div className="shrink-0 scale-90 origin-right">
                          {getContentTypeBadge(entry.contentType)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-secondary-light">
                        <span className="font-semibold truncate max-w-[85px]">
                          {entry.brand}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${entry.postingStatus === 'Posted' ? 'bg-green-500' : entry.postingStatus === 'Scheduled' ? 'bg-primary' : 'bg-amber-400'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-1 text-[9px] text-secondary-light/60 text-right opacity-0 group-hover:opacity-100 transition-opacity">
              + click to schedule
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-canvas-variant rounded-b-xl overflow-hidden shadow-sm">{rows}</div>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header & Quick KPIs ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-canvas-surface p-5 sm:p-6 rounded-2xl border border-canvas-variant shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-secondary-dark">
                Marketing Content & Festival Calendar
              </h2>
              <p className="text-xs text-secondary-light">
                Pre-scheduled Indian festivals, national days, industrial events & brand campaigns for 2026.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* View Toggles */}
          <div className="bg-canvas border border-canvas-variant p-0.5 rounded-xl flex items-center shadow-inner">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'calendar'
                  ? 'bg-canvas-surface text-primary shadow-xs'
                  : 'text-secondary-light hover:text-secondary-dark'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'table'
                  ? 'bg-canvas-surface text-primary shadow-xs'
                  : 'text-secondary-light hover:text-secondary-dark'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Schedule Table
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'kanban'
                  ? 'bg-canvas-surface text-primary shadow-xs'
                  : 'text-secondary-light hover:text-secondary-dark'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <Button onClick={() => handleOpenAddModal()}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Calendar Entry
          </Button>
        </div>
      </div>

      {/* ── Project / Brand Switcher Ribbon (Key Requirement) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-secondary-light px-1">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-primary" />
            Select Brand or Project to View Calendar:
          </span>
          {selectedBrandFilter !== 'all' && (
            <button 
              onClick={() => setSelectedBrandFilter('all')}
              className="text-primary hover:underline"
            >
              Reset to All ({entries.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Card: All Overview */}
          <div
            onClick={() => setSelectedBrandFilter('all')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedBrandFilter === 'all'
                ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                : 'bg-canvas-surface border-canvas-variant hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-secondary-dark">🌟 Master Calendar</span>
              <Badge variant="default">{entries.length}</Badge>
            </div>
            <p className="text-[11px] text-secondary-light mt-1">All brands & projects</p>
          </div>

          {/* Card: Goodwin Batteries */}
          <div
            onClick={() => setSelectedBrandFilter('Goodwin Batteries')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedBrandFilter === 'Goodwin Batteries'
                ? 'bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500'
                : 'bg-canvas-surface border-canvas-variant hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-secondary-dark flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                Goodwin Batteries
              </span>
              <Badge variant="warning">
                {entries.filter(e => e.brand === 'Goodwin Batteries').length}
              </Badge>
            </div>
            <p className="text-[11px] text-secondary-light mt-1">Tubular & Solar Power</p>
          </div>

          {/* Card: Goodwin Grow AI */}
          <div
            onClick={() => setSelectedBrandFilter('Goodwin Grow AI')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedBrandFilter === 'Goodwin Grow AI'
                ? 'bg-purple-500/10 border-purple-500 shadow-sm ring-1 ring-purple-500'
                : 'bg-canvas-surface border-canvas-variant hover:border-purple-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-secondary-dark flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                Goodwin Grow AI
              </span>
              <Badge variant="ai">
                {entries.filter(e => e.brand === 'Goodwin Grow AI').length}
              </Badge>
            </div>
            <p className="text-[11px] text-secondary-light mt-1">Autonomous Tech & ERP</p>
          </div>

          {/* Dynamically loaded projects created in Operations */}
          {operationsProjects?.map((proj) => {
            const isSelected = selectedBrandFilter === proj.id || selectedBrandFilter === proj.projectName;
            const projEntriesCount = entries.filter(e => e.projectId === proj.id || e.projectName === proj.projectName).length;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedBrandFilter(proj.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                    : 'bg-canvas-surface border-canvas-variant hover:border-primary/40'
                }`}
                title={`Click to view marketing calendar for ${proj.projectName}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary-dark truncate max-w-[110px]" title={proj.projectName}>
                    📁 {proj.projectName}
                  </span>
                  <Badge variant={projEntriesCount > 0 ? "success" : "default"}>
                    {projEntriesCount}
                  </Badge>
                </div>
                <div className="text-[10px] text-secondary-light mt-1 truncate">
                  {proj.companyName || 'Client Project'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special banner when viewing a project with no entries */}
      {selectedBrandFilter !== 'all' && 
       selectedBrandFilter !== 'Goodwin Batteries' && 
       selectedBrandFilter !== 'Goodwin Grow AI' && 
       filteredEntries.length === 0 && (
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-secondary-dark">
                No custom marketing posts scheduled for this project yet.
              </h4>
              <p className="text-xs text-secondary-light">
                Auto-generate client milestone spotlights, feature launches & festive greetings for this project.
              </p>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={() => {
              const activeProj = operationsProjects?.find(p => p.id === selectedBrandFilter || p.projectName === selectedBrandFilter);
              if (activeProj) {
                seedProjectEntries(activeProj.id, activeProj.projectName, activeProj.companyName);
                showToast(`Seeded festive & milestone content for ${activeProj.projectName}!`);
              }
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Auto-Generate Project Calendar
          </Button>
        </div>
      )}

      {/* ── Filters & Search Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light" />
            <input
              type="text"
              placeholder="Search festivals, topics, captions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas border border-canvas-variant rounded-lg text-secondary-dark placeholder-secondary-light focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Content Type Filter */}
          <select
            value={selectedContentTypeFilter}
            onChange={(e) => setSelectedContentTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-canvas border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
          >
            <option value="all">All Content Types</option>
            <option value="Post">🖼️ Post</option>
            <option value="Reel">🎬 Reel</option>
            <option value="Carousel">🎠 Carousel</option>
            <option value="Story">⏱️ Story</option>
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatformFilter}
            onChange={(e) => setSelectedPlatformFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-canvas border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Google Business">Google Business</option>
          </select>

          {/* Posting Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-canvas border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Posted">Posted</option>
          </select>
        </div>

        {/* Metrics Pill */}
        <div className="flex items-center gap-3 text-xs text-secondary-light">
          <span>Showing: <strong>{filteredEntries.length}</strong> items</span>
          <span>•</span>
          <span className="text-green-600 font-semibold">{stats.postedCount} Posted</span>
          <span>•</span>
          <span className="text-primary font-semibold">{stats.scheduledCount} Scheduled</span>
        </div>
      </div>

      {/* ────────────────────────────────────────── */}
      {/* ── VIEW 1: MONTH CALENDAR GRID ── */}
      {/* ────────────────────────────────────────── */}
      {activeView === 'calendar' && (
        <div className="bg-canvas-surface rounded-2xl border border-canvas-variant shadow-sm overflow-hidden">
          {/* Month Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-variant bg-canvas-surface/80">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold font-display text-secondary-dark">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-canvas-variant text-secondary-dark">
                {filteredEntries.filter(e => e.date.startsWith(format(currentDate, 'yyyy-MM'))).length} events this month
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center border border-canvas-variant rounded-lg overflow-hidden">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-canvas-variant text-secondary-dark transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-canvas-variant text-secondary-dark transition-colors border-l border-canvas-variant"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 bg-canvas text-center py-2.5 text-xs font-bold uppercase tracking-wider text-secondary-light border-b border-canvas-variant">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          {renderCalendarCells()}
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* ── VIEW 2: PRODUCTION SCHEDULE TABLE ── */}
      {/* ────────────────────────────────────────── */}
      {activeView === 'table' && (
        <div className="bg-canvas-surface rounded-2xl border border-canvas-variant shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-canvas-variant text-secondary-light uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4">Brand / Project</th>
                  <th className="py-3 px-4">Festival / Topic</th>
                  <th className="py-3 px-4">Content Type</th>
                  <th className="py-3 px-4">Platforms</th>
                  <th className="py-3 px-4">Brief & Caption</th>
                  <th className="py-3 px-4">Creative Status</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4">Posting Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-variant text-secondary-dark">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-secondary-light">
                      No calendar entries matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const isBatteries = entry.brand?.includes('Batteries');
                    const isAI = entry.brand?.includes('Grow AI');

                    return (
                      <tr 
                        key={entry.id} 
                        className="hover:bg-canvas/50 transition-colors group cursor-pointer"
                        onClick={() => handleOpenEditModal(entry)}
                      >
                        {/* 1. Date & Day */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                          <div className="font-bold text-secondary-dark">{entry.date}</div>
                          <div className="text-[10px] text-secondary-light font-normal">{entry.dayOfWeek}</div>
                        </td>

                        {/* 2. Brand */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isBatteries 
                              ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' 
                              : isAI
                                ? 'bg-purple-500/10 text-purple-700 border border-purple-500/20'
                                : 'bg-primary/10 text-primary-dark border border-primary/20'
                          }`}>
                            {entry.brand}
                          </span>
                        </td>

                        {/* 3. Occasion / Topic */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-secondary-dark truncate">{entry.occasion}</div>
                          <div className="text-[10px] text-secondary-light truncate max-w-xs">{entry.scheduledTime}</div>
                        </td>

                        {/* 4. Content Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getContentTypeBadge(entry.contentType)}
                        </td>

                        {/* 5. Platforms */}
                        <td className="py-3.5 px-4">
                          {renderPlatformBadges(entry.platforms)}
                        </td>

                        {/* 6. Brief & Caption Snippet */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-1 text-[11px] text-secondary-dark font-medium">
                            {entry.contentBrief}
                          </p>
                          <p className="line-clamp-1 text-[10px] text-secondary-light mt-0.5">
                            {entry.caption}
                          </p>
                        </td>

                        {/* 7. Creative Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getCreativeStatusBadge(entry.creativeStatus)}
                        </td>

                        {/* 8. Approval Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.approvalStatus === 'Approved'
                              ? 'text-green-700 bg-green-500/10'
                              : entry.approvalStatus === 'Rejected'
                                ? 'text-danger bg-danger/10'
                                : 'text-amber-700 bg-amber-500/10'
                          }`}>
                            {entry.approvalStatus}
                          </span>
                        </td>

                        {/* 9. Posting Status Toggle */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getPostingStatusBadge(entry.postingStatus, () => togglePostingStatus(entry.id))}
                        </td>

                        {/* 10. Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyCaption(entry.caption, entry.id)}
                              className="p-1.5 rounded-lg text-secondary-light hover:text-primary hover:bg-canvas-variant transition-colors"
                              title="Copy full caption"
                            >
                              {copiedCaptionId === entry.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(entry)}
                              className="p-1.5 rounded-lg text-secondary-light hover:text-secondary-dark hover:bg-canvas-variant transition-colors"
                              title="Edit entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 rounded-lg text-secondary-light hover:text-danger hover:bg-danger/10 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* ── VIEW 3: KANBAN PIPELINE VIEW ── */}
      {/* ────────────────────────────────────────── */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: 'Idea', label: '💡 Ideas & Briefs', items: filteredEntries.filter(e => e.creativeStatus === 'Idea') },
            { key: 'In Progress', label: '🎨 In Production', items: filteredEntries.filter(e => e.creativeStatus === 'In Progress' || e.creativeStatus === 'Needs Revision') },
            { key: 'Ready', label: '✅ Ready & Scheduled', items: filteredEntries.filter(e => (e.creativeStatus === 'Ready' || e.creativeStatus === 'Approved') && e.postingStatus !== 'Posted') },
            { key: 'Posted', label: '🚀 Published / Live', items: filteredEntries.filter(e => e.postingStatus === 'Posted') }
          ].map((column) => (
            <div key={column.key} className="bg-canvas-surface rounded-2xl border border-canvas-variant p-4 flex flex-col h-[750px] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-canvas-variant mb-3">
                <span className="font-bold text-xs text-secondary-dark">{column.label}</span>
                <Badge variant="default">{column.items.length}</Badge>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {column.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenEditModal(item)}
                    className="p-3.5 rounded-xl border border-canvas-variant bg-canvas hover:border-primary/50 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-primary truncate max-w-[130px]">
                        {item.brand}
                      </span>
                      {getContentTypeBadge(item.contentType)}
                    </div>

                    <h4 className="font-bold text-xs text-secondary-dark mb-1 leading-snug">
                      {item.occasion}
                    </h4>

                    <p className="text-[11px] text-secondary-light line-clamp-2 mb-2 leading-relaxed">
                      {item.contentBrief}
                    </p>

                    <div className="mb-2">
                      {renderPlatformBadges(item.platforms)}
                    </div>

                    <div className="pt-2 border-t border-canvas-variant/60 flex items-center justify-between text-[10px] text-secondary-light">
                      <span>📅 {item.date}</span>
                      <span>👤 {item.assignedTo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* ── DETAILED ENTRY MODAL (ALL 12 FIELDS) ── */}
      {/* ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div 
            className="fixed inset-0 bg-secondary-dark/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)} 
          />

          <div className="relative z-50 w-full max-w-3xl max-h-[92vh] bg-canvas rounded-2xl shadow-level-3 border border-canvas-variant flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-canvas-variant bg-canvas-surface flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-secondary-dark">
                  {isEditing ? 'Edit Calendar Entry' : 'Schedule New Marketing Content'}
                </h3>
                <p className="text-xs text-secondary-light">
                  Complete all 12 production fields for automated publishing and team alignment.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-secondary-light hover:text-secondary-dark hover:bg-canvas-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-canvas">
              {/* Row 1: Brand & Project selection + Content Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="enterprise-label">1. Brand / Project</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedProj = operationsProjects?.find(p => p.projectName === val || `${p.companyName} (${p.projectName})` === val);
                      setFormData({
                        ...formData,
                        brand: val,
                        projectId: matchedProj ? matchedProj.id : undefined,
                        projectName: matchedProj ? matchedProj.projectName : undefined
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-canvas-surface border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none focus:border-primary"
                  >
                    <option value="Goodwin Batteries">🔋 Goodwin Batteries</option>
                    <option value="Goodwin Grow AI">🤖 Goodwin Grow AI</option>
                    {operationsProjects?.map(p => (
                      <option key={p.id} value={`${p.companyName} (${p.projectName})`}>
                        📁 {p.companyName} — {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="enterprise-label">2. Content Type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Post', 'Reel', 'Carousel', 'Story'] as ContentType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, contentType: type })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          formData.contentType === type
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-canvas-surface text-secondary-dark border-canvas-variant hover:border-primary/40'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Date & Day + Scheduled Posting Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="enterprise-label">3. Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({
                        ...formData,
                        date: newDate,
                        dayOfWeek: getDayOfWeekName(newDate)
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="enterprise-label">4. Day of the Week</label>
                  <Input
                    type="text"
                    disabled
                    value={formData.dayOfWeek}
                    className="bg-canvas/50 text-secondary-light cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="enterprise-label">5. Scheduled Posting Time</label>
                  <Input
                    type="text"
                    placeholder="e.g. 10:30 AM or 18:00"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Festival / Occasion / Topic Title */}
              <div>
                <label className="enterprise-label">6. Festival / Occasion / Content Topic</label>
                <Input
                  placeholder="e.g. Diwali - Festival of Lights, World Battery Day, Pre-Summer Inverter Check..."
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="font-semibold text-sm"
                />
              </div>

              {/* Row 4: Platforms Multi-Select */}
              <div>
                <label className="enterprise-label">7. Target Platforms (Select All That Apply)</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['Instagram', 'Facebook', 'LinkedIn', 'Google Business'] as PlatformType[]).map((plat) => {
                    const isSelected = formData.platforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? formData.platforms.filter(p => p !== plat)
                            : [...formData.platforms, plat];
                          setFormData({ ...formData, platforms: updated });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-primary/10 text-primary-dark border-primary shadow-xs'
                            : 'bg-canvas-surface text-secondary-light border-canvas-variant hover:border-primary/40'
                        }`}
                      >
                        {plat === 'Instagram' && <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />}
                        {plat === 'Facebook' && <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />}
                        {plat === 'LinkedIn' && <LinkedInIcon className="w-3.5 h-3.5 text-sky-700" />}
                        {plat === 'Google Business' && <GoogleIcon className="w-3.5 h-3.5 text-red-500" />}
                        <span>{plat}</span>
                        {isSelected && <Check className="w-3 h-3 text-primary ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Content Idea / Brief */}
              <div>
                <label className="enterprise-label">8. Content Idea / Creative Brief</label>
                <textarea
                  rows={3}
                  placeholder="Explain visual direction, hook, shot breakdown, or copy angle for the designer/creator..."
                  value={formData.contentBrief}
                  onChange={(e) => setFormData({ ...formData, contentBrief: e.target.value })}
                  className="w-full p-3 text-xs bg-canvas-surface border border-canvas-variant rounded-xl text-secondary-dark placeholder-secondary-light focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>

              {/* Row 6: Caption (with Copy Button) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="enterprise-label mb-0">9. Caption (Ready-to-Post Copy + Hashtags)</label>
                  {formData.caption && (
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(formData.caption, 'modal')}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      {copiedCaptionId === 'modal' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy Caption
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  placeholder="Write the full caption with emojis, value hook, call to action, and hashtags..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full p-3 text-xs bg-canvas-surface border border-canvas-variant rounded-xl text-secondary-dark placeholder-secondary-light focus:outline-none focus:border-primary resize-none leading-relaxed font-mono"
                />
              </div>

              {/* Row 7: Creative Status + Approval Status + Assigned Team Member + Posted Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-canvas-variant">
                <div>
                  <label className="enterprise-label">10. Creative Status</label>
                  <select
                    value={formData.creativeStatus}
                    onChange={(e) => setFormData({ ...formData, creativeStatus: e.target.value as CreativeStatus })}
                    className="w-full px-3 py-2 text-xs bg-canvas-surface border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready">Ready</option>
                    <option value="Approved">Approved</option>
                    <option value="Needs Revision">Needs Revision</option>
                  </select>
                </div>

                <div>
                  <label className="enterprise-label">11. Approval Status</label>
                  <select
                    value={formData.approvalStatus}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as ApprovalStatus })}
                    className="w-full px-3 py-2 text-xs bg-canvas-surface border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="enterprise-label">12. Assigned Member</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-canvas-surface border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
                  >
                    {employees?.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                    <option value="Ansh Chourasiya">Ansh Chourasiya (Admin)</option>
                    <option value="Vikram Mehta">Vikram Mehta (Marketing Lead)</option>
                    <option value="Sarah Connor">Sarah Connor (Copywriter)</option>
                  </select>
                </div>

                <div>
                  <label className="enterprise-label">13. Posted Status</label>
                  <select
                    value={formData.postingStatus}
                    onChange={(e) => setFormData({ ...formData, postingStatus: e.target.value as PostingStatus })}
                    className="w-full px-3 py-2 text-xs bg-canvas-surface border border-canvas-variant rounded-lg text-secondary-dark focus:outline-none"
                  >
                    <option value="Pending">⏳ Pending</option>
                    <option value="Scheduled">⏰ Scheduled</option>
                    <option value="Posted">🚀 Posted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-canvas-variant bg-canvas-surface flex items-center justify-between">
              <div>
                {isEditing && formData.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger/10"
                    onClick={() => handleDeleteEntry(formData.id!)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEntry}>
                  {isEditing ? 'Save Changes' : 'Schedule Content'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary-dark text-white px-4 py-2.5 rounded-xl shadow-level-3 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
