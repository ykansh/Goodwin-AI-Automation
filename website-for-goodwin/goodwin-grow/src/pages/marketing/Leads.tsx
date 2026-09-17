import React, { useState, useMemo } from 'react';
import { useMarketingStore, type MarketingLead } from '../../lib/marketingStore';
import { useStore } from '../../lib/store';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MessageSquare, 
  Globe, 
  Flame, 
  Zap, 
  Snowflake, 
  Building2, 
  MapPin, 
  Briefcase, 
  Filter, 
  X, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  User, 
  Clock, 
  TrendingUp,
  Target,
  RefreshCw,
  FileText
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Manufacturer',
  'Distributor',
  'Wholesaler',
  'Retailer',
  'Service Business',
  'E-commerce',
  'D2C',
  'B2B',
  'Clinic/Healthcare',
  'Real Estate',
  'Other'
];

const LEAD_SOURCES = [
  'IndiaMART',
  'TradeIndia',
  'Google Ads',
  'Meta Ads',
  'Website',
  'WhatsApp',
  'Google Maps',
  'Referrals',
  'Social Media',
  'Walk-ins',
  'Other'
];

const PIPELINE_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
  'Hot'
];

export const Leads = () => {
  const employees = useStore(state => state.employees);
  const leads = useMarketingStore((state: any) => state.marketingLeads);
  const addMarketingLead = useMarketingStore((state: any) => state.addMarketingLead);
  const updateMarketingLead = useMarketingStore((state: any) => state.updateMarketingLead);
  const deleteMarketingLead = useMarketingStore((state: any) => state.deleteMarketingLead);
  const syncSeedLeadsToSupabase = useMarketingStore((state: any) => state.syncSeedLeadsToSupabase);
  const [isSyncing, setIsSyncing] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'qualification' | 'sales'>('contact');

  // Lead Dossier (Detail View) Modal State
  const [viewingLead, setViewingLead] = useState<MarketingLead | null>(null);

  // Form State initialized with rich Jotform defaults
  const [formData, setFormData] = useState<Partial<MarketingLead>>({
    name: '',
    company: '',
    legalName: '',
    designation: '',
    email: '',
    phone: '',
    website: '',
    city: '',
    state: '',
    industry: '',
    businessType: 'Manufacturer',
    businessModel: 'B2B',
    description: '',
    leadSource: 'IndiaMART',
    dealValue: 250000,
    priority: 'Warm',
    status: 'New',
    assignedTo: '',
    work: 'not started',
    responseSpeed: 'Within 1 hour',
    productsInterested: '',
    qualificationNotes: '',
    date: new Date().toISOString().split('T')[0],
    nextFollowUp: new Date().toISOString().split('T')[0]
  });

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const hotCount = leads.filter((l: any) => l.priority === 'Hot' || l.status === 'Hot' || l.status === 'hot').length;
    const qualifiedCount = leads.filter((l: any) => l.status === 'Qualified' || l.status === 'Proposal Sent' || l.status === 'Negotiation' || l.status === 'Won').length;
    
    const pipelineValue = leads
      .filter((l: any) => l.status !== 'Lost')
      .reduce((sum: number, l: any) => sum + (Number(l.dealValue) || 0), 0);

    // Find top source
    const sourceCounts: Record<string, number> = {};
    leads.forEach((l: any) => {
      const src = l.leadSource || 'Website';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });
    let topSource = 'IndiaMART';
    let maxSrc = 0;
    Object.entries(sourceCounts).forEach(([src, count]) => {
      if (count > maxSrc) {
        maxSrc = count;
        topSource = src;
      }
    });

    return {
      totalLeads,
      hotCount,
      qualifiedRate: totalLeads ? Math.round((qualifiedCount / totalLeads) * 100) : 0,
      pipelineValue,
      topSource
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        lead.name?.toLowerCase()?.includes(searchLower) ||
        lead.company?.toLowerCase()?.includes(searchLower) ||
        lead.legalName?.toLowerCase()?.includes(searchLower) ||
        lead.description?.toLowerCase()?.includes(searchLower) ||
        lead.email?.toLowerCase()?.includes(searchLower) ||
        lead.phone?.toLowerCase()?.includes(searchLower) ||
        lead.city?.toLowerCase()?.includes(searchLower) ||
        lead.productsInterested?.toLowerCase()?.includes(searchLower);

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;
      const matchesSource = sourceFilter === 'ALL' || lead.leadSource === sourceFilter;
      const matchesBusinessType = businessTypeFilter === 'ALL' || lead.businessType === businessTypeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesBusinessType;
    });
  }, [leads, searchTerm, statusFilter, priorityFilter, sourceFilter, businessTypeFilter]);

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || sourceFilter !== 'ALL' || businessTypeFilter !== 'ALL' || searchTerm !== '';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSourceFilter('ALL');
    setBusinessTypeFilter('ALL');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteMarketingLead(id);
      if (viewingLead?.id === id) setViewingLead(null);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      company: '',
      legalName: '',
      designation: '',
      email: '',
      phone: '',
      website: '',
      city: '',
      state: '',
      industry: '',
      businessType: 'Manufacturer',
      businessModel: 'B2B',
      description: '',
      leadSource: 'IndiaMART',
      dealValue: 250000,
      priority: 'Warm',
      status: 'New',
      assignedTo: employees[0]?.name || '',
      work: 'not started',
      responseSpeed: 'Within 1 hour',
      productsInterested: '',
      qualificationNotes: '',
      date: new Date().toISOString().split('T')[0],
      nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    });
    setActiveTab('contact');
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: MarketingLead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormData({ ...lead });
    setActiveTab('contact');
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.company?.trim()) {
      alert("Please provide both Contact Person Name and Company Name.");
      return;
    }

    if (isEditing && formData.id) {
      await updateMarketingLead(formData.id, formData as MarketingLead);
      if (viewingLead?.id === formData.id) {
        setViewingLead(formData as MarketingLead);
      }
    } else {
      await addMarketingLead(formData as Omit<MarketingLead, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    await syncSeedLeadsToSupabase();
    setIsSyncing(false);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'Hot':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20 animate-pulse">
            <Flame className="w-3 h-3 mr-1 text-danger fill-danger" />
            Hot
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
            <Zap className="w-3 h-3 mr-1 text-warning" />
            Warm
          </span>
        );
      case 'Cold':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-canvas-variant text-secondary-light border border-canvas-variant">
            <Snowflake className="w-3 h-3 mr-1 text-secondary-light" />
            Cold
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Qualified':
        return <Badge variant="success">Qualified</Badge>;
      case 'Hot':
        return <Badge variant="destructive" className="font-bold">🔥 Hot Lead</Badge>;
      case 'Proposal Sent':
        return <Badge variant="ai">Proposal Sent</Badge>;
      case 'Negotiation':
        return <Badge variant="ai">Negotiation</Badge>;
      case 'Won':
        return <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Won 🎉</Badge>;
      case 'Contacted':
        return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">Contacted</Badge>;
      case 'Lost':
        return <Badge variant="destructive">Lost</Badge>;
      case 'New':
      default:
        return <Badge variant="warning">New</Badge>;
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'IndiaMART':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20">IndiaMART</span>;
      case 'TradeIndia':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">TradeIndia</span>;
      case 'Google Ads':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">Google Ads</span>;
      case 'Meta Ads':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">Meta Ads</span>;
      case 'WhatsApp':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">WhatsApp</span>;
      case 'Referrals':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/10 text-teal-700 border border-teal-500/20">Referral</span>;
      case 'Website':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas-variant text-secondary-dark border border-canvas-variant">{source || 'Website'}</span>;
    }
  };

  const getWorkBadge = (work: string) => {
    switch (work) {
      case 'done':
        return <span className="inline-flex items-center text-xs text-emerald-600 font-medium">● Done</span>;
      case 'started':
        return <span className="inline-flex items-center text-xs text-amber-500 font-medium">● In Progress</span>;
      case 'not started':
      default:
        return <span className="inline-flex items-center text-xs text-secondary-light font-medium">○ Not Started</span>;
    }
  };

  const getFollowUpDateTag = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateStr === today;
    const isOverdue = dateStr < today;

    return (
      <span className={`inline-flex items-center text-[11px] px-1.5 py-0.5 rounded font-medium ${
        isOverdue 
          ? 'bg-danger/10 text-danger' 
          : isToday 
          ? 'bg-warning/10 text-warning font-semibold' 
          : 'text-secondary-light'
      }`}>
        <Calendar className="w-3 h-3 mr-1" />
        {isOverdue ? `Overdue (${dateStr})` : isToday ? 'Today' : dateStr}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-light">Total Leads</p>
            <p className="text-2xl font-bold font-display text-secondary-dark mt-1">{metrics.totalLeads}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-danger/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-danger flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1 fill-danger" /> Hot Leads
            </p>
            <p className="text-2xl font-bold font-display text-danger mt-1">{metrics.hotCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
            <Flame className="w-5 h-5 fill-danger" />
          </div>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-light">Pipeline Value</p>
            <p className="text-2xl font-bold font-display text-secondary-dark mt-1">{formatCurrency(metrics.pipelineValue)}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-light">Qualified Rate</p>
            <p className="text-2xl font-bold font-display text-secondary-dark mt-1">{metrics.qualifiedRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-light">Top Lead Source</p>
            <p className="text-lg font-bold font-display text-secondary-dark mt-1 truncate">{metrics.topSource}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Precision Filters & Search Bar */}
      <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search by company, name, email, phone, city, or product..." 
              className="pl-9 h-10 w-full bg-canvas/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="secondary" 
              onClick={handleSyncCloud} 
              disabled={isSyncing}
              className="h-10 px-3 text-xs border border-canvas-variant hover:border-primary/40"
              title="Sync current leads to Supabase cloud database"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-primary' : 'text-secondary-light'}`} />
              {isSyncing ? 'Syncing...' : 'Sync with Supabase'}
            </Button>
            <Button onClick={handleOpenCreateModal} className="h-10 px-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Multi-criteria filter strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-canvas-variant text-xs">
          <span className="text-secondary-light font-medium flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filters:
          </span>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs w-36 bg-canvas"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              ...PIPELINE_STATUSES.map(s => ({ value: s, label: s }))
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 text-xs w-32 bg-canvas"
            options={[
              { value: 'ALL', label: 'All Heat / Priority' },
              { value: 'Hot', label: '🔥 Hot' },
              { value: 'Warm', label: '⚡ Warm' },
              { value: 'Cold', label: '❄️ Cold' }
            ]}
          />

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-8 text-xs w-36 bg-canvas"
            options={[
              { value: 'ALL', label: 'All Lead Sources' },
              ...LEAD_SOURCES.map(src => ({ value: src, label: src }))
            ]}
          />

          <Select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="h-8 text-xs w-36 bg-canvas"
            options={[
              { value: 'ALL', label: 'All Business Types' },
              ...BUSINESS_TYPES.map(b => ({ value: b, label: b }))
            ]}
          />

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="inline-flex items-center px-2 py-1 text-xs text-secondary-light hover:text-danger rounded hover:bg-canvas-variant transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Precise Leads Table */}
      <div className="bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas/60">
                <TableHead className="w-72">Company & Contact</TableHead>
                <TableHead className="w-48">Direct Outreach</TableHead>
                <TableHead className="w-44">Business & Industry</TableHead>
                <TableHead className="w-32">Source</TableHead>
                <TableHead className="w-28 text-right">Deal Value</TableHead>
                <TableHead className="w-24 text-center">Priority</TableHead>
                <TableHead className="w-32">Pipeline Stage</TableHead>
                <TableHead className="w-40">Assigned & Follow-up</TableHead>
                <TableHead className="w-28">Work</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead: any) => {
                const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                return (
                  <TableRow 
                    key={lead.id}
                    onClick={() => setViewingLead(lead)}
                    className="cursor-pointer hover:bg-canvas-variant/40 transition-colors group"
                  >
                    {/* Company & Contact Person */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-secondary-dark flex items-center">
                          <span className="truncate max-w-[220px]" title={lead.company}>{lead.company}</span>
                          {lead.city && (
                            <span className="ml-2 inline-flex items-center text-[10px] px-1.5 py-0.2 bg-canvas-variant text-secondary-light rounded">
                              <MapPin className="w-2.5 h-2.5 mr-0.5" />
                              {lead.city}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-secondary-light flex items-center">
                          <span className="font-medium text-secondary-dark/80">{lead.name}</span>
                          {lead.designation && (
                            <span className="text-secondary-light/70 ml-1">· {lead.designation}</span>
                          )}
                        </div>
                        {lead.description && (
                          <p className="text-[11px] text-secondary-light/70 truncate max-w-[240px] italic" title={lead.description}>
                            "{lead.description}"
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Direct Contact Links */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        {cleanPhone ? (
                          <a 
                            href={`https://wa.me/${cleanPhone}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                            title={`Chat on WhatsApp (${lead.phone})`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        ) : null}

                        {lead.email ? (
                          <a 
                            href={`mailto:${lead.email}`}
                            className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title={`Email: ${lead.email}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        ) : null}

                        {lead.phone ? (
                          <a 
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-md bg-canvas-variant text-secondary-dark hover:bg-secondary-light/20 transition-colors"
                            title={`Call: ${lead.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        ) : null}

                        {lead.website ? (
                          <a 
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md bg-canvas-variant text-secondary-light hover:text-secondary-dark transition-colors"
                            title={lead.website}
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Business & Industry */}
                    <TableCell>
                      <div className="space-y-1">
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary-dark border border-primary/15">
                          {lead.businessType || 'B2B'}
                        </span>
                        {lead.industry && (
                          <p className="text-[11px] text-secondary-light truncate max-w-[150px]" title={lead.industry}>
                            {lead.industry}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Lead Source */}
                    <TableCell>
                      {getSourceBadge(lead.leadSource)}
                    </TableCell>

                    {/* Deal Value */}
                    <TableCell className="text-right">
                      <span className="font-semibold text-secondary-dark text-sm">
                        {formatCurrency(lead.dealValue)}
                      </span>
                    </TableCell>

                    {/* Priority */}
                    <TableCell className="text-center">
                      {getPriorityBadge(lead.priority)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(lead.status)}
                    </TableCell>

                    {/* Assigned To & Next Follow-up */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-secondary-dark flex items-center">
                          <User className="w-3 h-3 mr-1 text-secondary-light" />
                          <span className="truncate max-w-[120px]">{lead.assignedTo || 'Unassigned'}</span>
                        </div>
                        <div>
                          {getFollowUpDateTag(lead.nextFollowUp)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Work Status */}
                    <TableCell>
                      {getWorkBadge(lead.work)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setViewingLead(lead)} 
                          className="h-8 w-8 text-secondary-light hover:text-primary"
                          title="View Lead Dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleEdit(lead, e)} 
                          className="h-8 w-8 text-secondary-light hover:text-primary"
                          title="Edit Lead"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleDelete(lead.id, e)} 
                          className="h-8 w-8 text-secondary-light hover:text-danger"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-secondary-light">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Target className="w-8 h-8 text-secondary-light/40" />
                      <p className="font-semibold text-secondary-dark">No leads matching the criteria</p>
                      <p className="text-xs">Try adjusting your search or filters, or add a new lead.</p>
                      <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-2">
                        Reset All Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Table Footer with Summary */}
        <div className="px-4 py-3 bg-canvas/30 border-t border-canvas-variant flex items-center justify-between text-xs text-secondary-light">
          <span>Showing {filteredLeads.length} of {leads.length} recorded leads</span>
          <span className="font-medium text-secondary-dark">
            Filtered Pipeline: {formatCurrency(filteredLeads.reduce((acc: number, curr: any) => acc + (Number(curr.dealValue) || 0), 0))}
          </span>
        </div>
      </div>

      {/* 4. Lead Dossier (Detail View Modal) */}
      {viewingLead && (
        <Modal 
          isOpen={!!viewingLead} 
          onClose={() => setViewingLead(null)} 
          title="Client Onboarding & Lead Dossier"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-canvas p-4 rounded-xl border border-canvas-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold font-display text-secondary-dark">{viewingLead.company}</h3>
                  {getPriorityBadge(viewingLead.priority)}
                </div>
                <p className="text-xs text-secondary-light mt-0.5">
                  {viewingLead.name} · {viewingLead.designation || 'Key Decision Maker'}
                </p>
                {viewingLead.legalName && viewingLead.legalName !== viewingLead.company && (
                  <p className="text-[11px] text-secondary-light/80 italic mt-0.5">
                    Legal: {viewingLead.legalName}
                  </p>
                )}
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-secondary-light uppercase tracking-wider block">Potential Deal</span>
                <span className="text-xl font-bold font-display text-primary-dark">{formatCurrency(viewingLead.dealValue)}</span>
                <div className="mt-1">{getStatusBadge(viewingLead.status)}</div>
              </div>
            </div>

            {/* Quick Contact Bar */}
            <div className="flex flex-wrap gap-2">
              {viewingLead.phone && (
                <a
                  href={`https://wa.me/${viewingLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Chat on WhatsApp ({viewingLead.phone})
                </a>
              )}
              {viewingLead.email && (
                <a
                  href={`mailto:${viewingLead.email}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4 mr-1.5" />
                  Email ({viewingLead.email})
                </a>
              )}
              {viewingLead.website && (
                <a
                  href={viewingLead.website.startsWith('http') ? viewingLead.website : `https://${viewingLead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-canvas-variant text-secondary-dark hover:bg-canvas-variant/80 text-xs font-semibold transition-colors"
                >
                  <Globe className="w-4 h-4 mr-1.5" />
                  Visit Website
                </a>
              )}
            </div>

            {/* Structured Jotform Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-canvas/40 rounded-lg border border-canvas-variant space-y-2">
                <h4 className="font-semibold text-secondary-dark flex items-center text-xs uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 mr-1.5 text-primary" /> Company Profile
                </h4>
                <div className="space-y-1 text-secondary-light">
                  <div className="flex justify-between">
                    <span>Business Type:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.businessType || 'Manufacturer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Model:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.businessModel || 'B2B'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industry:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.industry || 'Industrial Goods'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.city ? `${viewingLead.city}, ${viewingLead.state || 'India'}` : 'India'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-canvas/40 rounded-lg border border-canvas-variant space-y-2">
                <h4 className="font-semibold text-secondary-dark flex items-center text-xs uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-primary" /> Lead Acquisition & SLA
                </h4>
                <div className="space-y-1 text-secondary-light">
                  <div className="flex justify-between">
                    <span>Acquisition Channel:</span>
                    <span>{getSourceBadge(viewingLead.leadSource)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Speed SLA:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.responseSpeed || 'Within 1 hour'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Rep:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Follow-up:</span>
                    <span className="font-medium text-secondary-dark">{viewingLead.nextFollowUp || 'Not scheduled'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Description / What Company Does */}
            {viewingLead.description && (
              <div className="p-3.5 bg-canvas/40 rounded-lg border border-canvas-variant space-y-1 text-xs">
                <p className="font-semibold text-secondary-dark flex items-center uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-primary" /> Business Overview & Operations
                </p>
                <p className="text-secondary-light leading-relaxed mt-1">{viewingLead.description}</p>
              </div>
            )}

            {/* Products / Offerings to Grow */}
            {viewingLead.productsInterested && (
              <div className="p-3.5 bg-canvas/40 rounded-lg border border-canvas-variant space-y-1 text-xs">
                <p className="font-semibold text-secondary-dark flex items-center uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 mr-1.5 text-primary" /> Key Products / Growth Focus
                </p>
                <p className="text-secondary-dark font-medium mt-1">{viewingLead.productsInterested}</p>
              </div>
            )}

            {/* Qualification Notes / Bottlenecks from Onboarding Form */}
            {viewingLead.qualificationNotes && (
              <div className="p-3.5 bg-canvas/40 rounded-lg border border-canvas-variant space-y-1 text-xs">
                <p className="font-semibold text-secondary-dark flex items-center uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" /> Onboarding Notes & Lead Gen Problems
                </p>
                <p className="text-secondary-light leading-relaxed mt-1">{viewingLead.qualificationNotes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 flex justify-between items-center border-t border-canvas-variant">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={(e) => handleDelete(viewingLead.id, e)}
              >
                Delete Lead
              </Button>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => setViewingLead(null)}>
                  Close
                </Button>
                <Button onClick={() => { const leadToEdit = viewingLead; setViewingLead(null); handleEdit(leadToEdit); }}>
                  Edit Lead Details
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Add / Edit Lead Modal with Structured Jotform Tabs */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing ? "Edit Lead Profile" : "Add Lead (Jotform Qualification)"}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-4">
          {/* Form Tabs */}
          <div className="flex border-b border-canvas-variant space-x-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`pb-2 transition-colors border-b-2 ${activeTab === 'contact' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-light hover:text-secondary-dark'}`}
            >
              1. Company & Contact Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qualification')}
              className={`pb-2 transition-colors border-b-2 ${activeTab === 'qualification' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-light hover:text-secondary-dark'}`}
            >
              2. Growth & Opportunity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`pb-2 transition-colors border-b-2 ${activeTab === 'sales' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-light hover:text-secondary-dark'}`}
            >
              3. Sales Process & Follow-up
            </button>
          </div>

          {/* TAB 1: Company & Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Business/Company Name *</label>
                  <Input 
                    placeholder="e.g. Apex Polymer Solutions" 
                    value={formData.company || ''} 
                    onChange={(e) => setFormData({...formData, company: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Legal Business Name</label>
                  <Input 
                    placeholder="e.g. Apex Polymers Pvt Ltd" 
                    value={formData.legalName || ''} 
                    onChange={(e) => setFormData({...formData, legalName: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Contact Person Name *</label>
                  <Input 
                    placeholder="e.g. Amitabh Patel" 
                    value={formData.name || ''} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Designation / Role</label>
                  <Input 
                    placeholder="e.g. Managing Director / Owner" 
                    value={formData.designation || ''} 
                    onChange={(e) => setFormData({...formData, designation: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Email Address</label>
                  <Input 
                    type="email"
                    placeholder="contact@company.com" 
                    value={formData.email || ''} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Phone / WhatsApp *</label>
                  <Input 
                    type="tel"
                    placeholder="+91 98765 43210" 
                    value={formData.phone || ''} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">City</label>
                  <Input 
                    placeholder="e.g. Ahmedabad" 
                    value={formData.city || ''} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">State</label>
                  <Input 
                    placeholder="e.g. Gujarat" 
                    value={formData.state || ''} 
                    onChange={(e) => setFormData({...formData, state: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Website URL</label>
                  <Input 
                    placeholder="https://example.com" 
                    value={formData.website || ''} 
                    onChange={(e) => setFormData({...formData, website: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Business Type</label>
                  <Select 
                    value={formData.businessType || 'Manufacturer'}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    options={BUSINESS_TYPES.map(bt => ({ value: bt, label: bt }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Business Model</label>
                  <Select 
                    value={formData.businessModel || 'B2B'}
                    onChange={(e) => setFormData({...formData, businessModel: e.target.value})}
                    options={[
                      { value: 'B2B', label: 'B2B' },
                      { value: 'B2C', label: 'B2C' },
                      { value: 'Both', label: 'Both' }
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Industry</label>
                  <Input 
                    placeholder="e.g. Plastics & Packaging" 
                    value={formData.industry || ''} 
                    onChange={(e) => setFormData({...formData, industry: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="enterprise-label text-xs">Business Description / What the Company Does</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-md border border-canvas-variant bg-canvas p-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Explain what the business does, primary product lines, client profile (from onboarding questionnaire)..."
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
            </div>
          )}

          {/* TAB 2: Qualification & Growth Opportunity */}
          {activeTab === 'qualification' && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Lead Source *</label>
                  <Select 
                    value={formData.leadSource || 'IndiaMART'}
                    onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
                    options={LEAD_SOURCES.map(s => ({ value: s, label: s }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Deal Value (₹ / $)</label>
                  <Input 
                    type="number"
                    placeholder="250000" 
                    value={formData.dealValue || ''} 
                    onChange={(e) => setFormData({...formData, dealValue: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Lead Heat / Priority</label>
                  <Select 
                    value={formData.priority || 'Warm'}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    options={[
                      { value: 'Hot', label: '🔥 Hot (Immediate)' },
                      { value: 'Warm', label: '⚡ Warm' },
                      { value: 'Cold', label: '❄️ Cold' }
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="enterprise-label text-xs">Top Products / Services to Scale</label>
                <Input 
                  placeholder="e.g. High-barrier films, Spiral Bevel Gears" 
                  value={formData.productsInterested || ''} 
                  onChange={(e) => setFormData({...formData, productsInterested: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="enterprise-label text-xs">Qualification Notes & Bottlenecks</label>
                <textarea 
                  rows={4}
                  className="w-full rounded-md border border-canvas-variant bg-canvas p-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Losing leads to slow response; requires automated WhatsApp quotation workflow..."
                  value={formData.qualificationNotes || ''} 
                  onChange={(e) => setFormData({...formData, qualificationNotes: e.target.value})} 
                />
              </div>
            </div>
          )}

          {/* TAB 3: Sales Process & Follow-up */}
          {activeTab === 'sales' && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Pipeline Status</label>
                  <Select 
                    value={formData.status || 'New'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    options={PIPELINE_STATUSES.map(s => ({ value: s, label: s }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Assigned Sales Rep</label>
                  <Select 
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    options={[
                      { value: '', label: 'Select Employee...' },
                      ...employees.map(emp => ({ value: emp.name, label: emp.name }))
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Response Speed SLA</label>
                  <Select 
                    value={formData.responseSpeed || 'Within 1 hour'}
                    onChange={(e) => setFormData({...formData, responseSpeed: e.target.value})}
                    options={[
                      { value: 'Immediately', label: 'Immediately (< 15 mins)' },
                      { value: 'Within 15 minutes', label: 'Within 15 minutes' },
                      { value: 'Within 1 hour', label: 'Within 1 hour' },
                      { value: 'Same day', label: 'Same day' },
                      { value: 'Next day', label: 'Next day' }
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Next Follow-Up Date</label>
                  <Input 
                    type="date"
                    value={formData.nextFollowUp || ''} 
                    onChange={(e) => setFormData({...formData, nextFollowUp: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Workflow / Task Status</label>
                  <Select 
                    value={formData.work || 'not started'}
                    onChange={(e) => setFormData({...formData, work: e.target.value})}
                    options={[
                      { value: 'not started', label: 'Not Started' },
                      { value: 'started', label: 'In Progress / Started' },
                      { value: 'done', label: 'Done' }
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="enterprise-label text-xs">Inbound Date</label>
                  <Input 
                    type="date"
                    value={formData.date || ''} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 flex justify-between items-center border-t border-canvas-variant">
            <div className="flex space-x-2">
              {activeTab !== 'contact' && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setActiveTab(activeTab === 'sales' ? 'qualification' : 'contact')}
                >
                  Previous
                </Button>
              )}
              {activeTab !== 'sales' && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setActiveTab(activeTab === 'contact' ? 'qualification' : 'sales')}
                >
                  Next
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isEditing ? "Save Changes" : "Create Lead"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
