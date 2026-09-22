import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  TrendingUp, 
  Users, 
  Flame, 
  CheckCircle, 
  UserCircle, 
  CreditCard, 
  IndianRupee, 
  ChevronRight, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Search, 
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useFinanceStore } from '../../lib/financeStore';
import { useMarketingStore } from '../../lib/marketingStore';
import { useOperationsStore } from '../../lib/operationsStore';

export const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  
  const employees = useStore(state => state.employees);
  const attendance = useStore(state => state.attendance);
  const marketingLeads = useMarketingStore(state => state.marketingLeads);
  const tasks = useOperationsStore(state => state.tasks);
  const updateTask = useOperationsStore(state => state.updateTask);
  const expenses = useFinanceStore(state => state.expenses);
  const invoices = useFinanceStore(state => state.invoices);

  // Modal & Filter states for Team Workload
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);
  
  // Format local date YYYY-MM-DD
  const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateMode, setDateMode] = useState<'today' | 'all' | 'custom'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Compute metrics
  const revenue = invoices?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const pipelineLeads = marketingLeads?.length || 0;
  const hotLeads = marketingLeads?.filter(l => l.status === 'Hot' || l.status === 'hot' || l.priority === 'Hot')?.length || 0;
  
  const tasksDueToday = tasks?.filter(t => t.date === todayStr) || [];
  const highPriorityToday = tasksDueToday.filter(t => t.priority?.toLowerCase() === 'high' || t.priority === 'High').length;
  const totalExpenses = expenses?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

  // Filtered tasks for the Team Workload modal
  const effectiveDate = dateMode === 'today' ? todayStr : (dateMode === 'custom' ? selectedDate : null);
  
  const filteredTasks = (tasks || []).filter(t => {
    // Date filter
    if (effectiveDate && t.date !== effectiveDate) return false;
    // Status filter
    if (statusFilter === 'pending' && t.status === 'completed') return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;
    // Assignee filter
    if (assigneeFilter !== 'all' && t.assignee?.trim().toLowerCase() !== assigneeFilter.trim().toLowerCase()) return false;
    // Search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchAssignee = t.assignee?.toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee) return false;
    }
    return true;
  });

  // Group all active members (employees + unique assignees in tasks)
  const allAssigneeNames = Array.from(new Set([
    ...employees.map(e => e.name?.trim()).filter(Boolean),
    ...tasks.map(t => t.assignee?.trim()).filter(Boolean)
  ]));

  const teamMembersWithTasks = allAssigneeNames.map(name => {
    const emp = employees.find(e => e.name?.trim().toLowerCase() === name.toLowerCase());
    const memberTasks = filteredTasks.filter(t => t.assignee?.trim().toLowerCase() === name.toLowerCase());
    const totalMemberTasks = memberTasks.length;
    const completedMemberTasks = memberTasks.filter(t => t.status === 'completed').length;
    const pendingMemberTasks = totalMemberTasks - completedMemberTasks;
    
    // Check attendance for today
    const attRecord = attendance?.[todayStr]?.[name] || 
      (emp ? attendance?.[todayStr]?.[emp.name] : undefined);

    return {
      name,
      role: emp?.role || 'Team Member',
      email: emp?.email || '',
      attendance: attRecord?.status || null,
      tasks: memberTasks,
      totalCount: totalMemberTasks,
      completedCount: completedMemberTasks,
      pendingCount: pendingMemberTasks
    };
  }).filter(m => {
    // If assigneeFilter is set, only show that member
    if (assigneeFilter !== 'all' && m.name.toLowerCase() !== assigneeFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleToggleTaskStatus = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(task.id, { status: newStatus });
    } catch (err: any) {
      alert('Failed to update task status: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* 6 Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Revenue */}
        <Card 
          className="hover:shadow-level-2 transition-all cursor-pointer hover:border-primary/50 group"
          onClick={() => navigate('/finance/revenue')}
          title="Click to view Revenue & Invoices"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider flex items-center">
              Revenue
              <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
            </CardTitle>
            <div onClick={(e) => e.stopPropagation()}>
              <Select 
                value={revenuePeriod} 
                onChange={(e) => setRevenuePeriod(e.target.value)}
                className="w-28 h-8 text-xs bg-canvas"
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">
                  ₹{revenuePeriod === 'monthly' ? revenue.toLocaleString() : revenuePeriod === 'weekly' ? Math.round(revenue / 4).toLocaleString() : Math.round(revenue / 30).toLocaleString()}
                </div>
                <p className="text-xs text-primary font-medium flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12.5% vs last {revenuePeriod.replace('ly', '')}
                </p>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Leads in Pipeline */}
        <Card 
          className="hover:shadow-level-2 transition-all cursor-pointer hover:border-primary/50 group"
          onClick={() => navigate('/marketing/leads')}
          title="Click to view all Pipeline Leads"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider flex items-center">
              Pipeline Leads
              <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
            </CardTitle>
            <Users className="h-4 w-4 text-secondary-light group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">{pipelineLeads}</div>
                <p className="text-xs text-secondary-light font-medium mt-1">Across 12 campaigns • Click to view</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Hot Leads */}
        <Card 
          className="hover:shadow-level-2 transition-all cursor-pointer border-tertiary hover:border-tertiary-dark group"
          onClick={() => navigate('/marketing/leads')}
          title="Click to view Hot Leads requiring immediate action"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider flex items-center">
              Hot Leads
              <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-tertiary-dark" />
            </CardTitle>
            <div className="h-6 w-6 bg-tertiary/20 group-hover:bg-tertiary/40 rounded flex items-center justify-center transition-colors">
              <Flame className="h-4 w-4 text-tertiary-dark" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">{hotLeads}</div>
                <p className="text-xs text-tertiary-dark font-medium flex items-center mt-1">
                  Requires immediate action • Click to view
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Tasks Due Today (CLICKABLE -> Opens What Everyone is Working On) */}
        <Card 
          className="hover:shadow-level-2 transition-all cursor-pointer hover:border-primary hover:scale-[1.01] group relative overflow-hidden ring-1 ring-primary/20"
          onClick={() => {
            setDateMode('today');
            setSelectedDate(todayStr);
            setAssigneeFilter('all');
            setStatusFilter('all');
            setIsWorkloadModalOpen(true);
          }}
          title="Click to see what everyone is working on today at once!"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider flex items-center">
              <span>Tasks Due Today</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-normal px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                Clickable
              </span>
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight flex items-baseline gap-2">
                  <span>{tasksDueToday.length}</span>
                  <span className="text-xs font-normal text-secondary-light">tasks</span>
                </div>
                <p className="text-xs text-warning font-medium mt-1 flex items-center gap-1">
                  <span>{highPriorityToday} High Priority</span>
                  <span className="text-secondary-light">•</span>
                  <span className="text-primary group-hover:underline">View team workload →</span>
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* 5. Team Members (CLICKABLE -> Opens What Everyone is Working On) */}
        <Card 
          className="hover:shadow-level-2 transition-all cursor-pointer hover:border-primary hover:scale-[1.01] group relative overflow-hidden"
          onClick={() => {
            setDateMode('today');
            setSelectedDate(todayStr);
            setAssigneeFilter('all');
            setStatusFilter('all');
            setIsWorkloadModalOpen(true);
          }}
          title="Click to see all active team members and their assignments"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider flex items-center">
              <span>Active Team</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-normal px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                Clickable
              </span>
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <UserCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight flex items-baseline gap-2">
                  <span>{employees.length}</span>
                  <span className="text-xs font-normal text-secondary-light">members</span>
                </div>
                <p className="text-xs text-secondary-light font-medium mt-1 flex items-center gap-1">
                  <span>{teamMembersWithTasks.filter(m => m.totalCount > 0).length} assigned today</span>
                  <span>•</span>
                  <span className="text-primary group-hover:underline">View all tasks →</span>
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* 6. Total Expenses */}
        <Card 
          className="hover:shadow-level-2 transition-all cursor-pointer hover:border-danger/40 group"
          onClick={() => navigate('/finance/expenses')}
          title="Click to view all Expenses & Invoices"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider flex items-center">
              Total Expenses
              <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-danger" />
            </CardTitle>
            <CreditCard className="h-4 w-4 text-secondary-light group-hover:text-danger transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">₹{totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-secondary-light font-medium mt-1">Monthly aggregate • Click to view</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* MODAL: TEAM WORKLOAD — WHAT EVERYONE IS WORKING ON */}
      <Modal
        isOpen={isWorkloadModalOpen}
        onClose={() => setIsWorkloadModalOpen(false)}
        title="Team Workload — What Everyone Is Working On"
        className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-130px)]">
          {/* Top Info & Summary Banner */}
          <div className="bg-canvas-variant/30 border border-canvas-variant rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base text-secondary-dark">
                  {dateMode === 'today' ? "Today's Workload" : dateMode === 'all' ? "All Active Tasks" : `Tasks for ${selectedDate}`}
                </h3>
              </div>
              <p className="text-xs text-secondary-light mt-0.5">
                Overview of tasks across all team members at once without checking individual calendars.
              </p>
            </div>

            {/* Quick Metrics Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-canvas-surface border border-canvas-variant rounded-lg text-xs">
                <span className="text-secondary-light">Total: </span>
                <span className="font-bold text-secondary-dark">{filteredTasks.length}</span>
              </div>
              <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
                <span className="text-amber-700 dark:text-amber-300">Pending: </span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {filteredTasks.filter(t => t.status !== 'completed').length}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs">
                <span className="text-emerald-700 dark:text-emerald-300">Completed: </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Date Picker & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-canvas-surface p-3.5 rounded-xl border border-canvas-variant">
            {/* Date Selection Buttons */}
            <div className="md:col-span-6 flex items-center gap-1.5 flex-wrap">
              <Button 
                variant={dateMode === 'today' ? 'primary' : 'secondary'}
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => { setDateMode('today'); setSelectedDate(todayStr); }}
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Today ({todayStr})
              </Button>
              <Button 
                variant={dateMode === 'all' ? 'primary' : 'secondary'}
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => setDateMode('all')}
              >
                All Dates
              </Button>
              <div className="flex items-center">
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDateMode('custom');
                  }}
                  className="h-8 text-xs py-1 px-2 w-36"
                />
              </div>
            </div>

            {/* Status & Member Filters */}
            <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2 flex-wrap">
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-8 text-xs w-32 bg-canvas"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending Only' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />

              <Select 
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="h-8 text-xs w-40 bg-canvas"
                options={[
                  { value: 'all', label: 'All Team Members' },
                  ...allAssigneeNames.map(name => ({ value: name, label: name }))
                ]}
              />
            </div>

            {/* Search filter */}
            <div className="md:col-span-12 relative">
              <Search className="h-3.5 w-3.5 text-secondary-light absolute left-3 top-2.5" />
              <Input 
                type="text"
                placeholder="Search tasks by title or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* TEAM MEMBERS TASK BOARDS */}
          <div className="space-y-4">
            {teamMembersWithTasks.map((member) => (
              <div 
                key={member.name}
                className="bg-canvas-surface border border-canvas-variant rounded-xl overflow-hidden shadow-sm"
              >
                {/* Member Header */}
                <div className="px-5 py-3.5 bg-canvas-variant/20 border-b border-canvas-variant flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-secondary-dark text-sm">{member.name}</span>
                        {member.attendance === 'Present' && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-medium">
                            Present Today
                          </span>
                        )}
                        {member.attendance === 'Absent' && (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-medium">
                            Absent Today
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-light">{member.role}</p>
                    </div>
                  </div>

                  {/* Tasks count badge */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-canvas border border-canvas-variant text-secondary-dark font-medium">
                      {member.tasks.length} {member.tasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                    {member.completedCount > 0 && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                        {member.completedCount} done
                      </span>
                    )}
                    {member.pendingCount > 0 && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                        {member.pendingCount} pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Member Tasks List */}
                <div className="p-3 space-y-2">
                  {member.tasks.length === 0 ? (
                    <div className="py-5 text-center text-secondary-light text-xs italic">
                      No tasks assigned for {dateMode === 'today' ? 'today' : 'the selected criteria'}.
                    </div>
                  ) : (
                    member.tasks.map((task: any) => {
                      const isDone = task.status === 'completed';
                      const isHigh = task.priority?.toLowerCase() === 'high';
                      const isMed = task.priority?.toLowerCase() === 'medium';

                      return (
                        <div 
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isDone 
                              ? 'bg-canvas-variant/15 border-canvas-variant opacity-75' 
                              : 'bg-canvas border-canvas-variant hover:border-primary/40 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                            {/* Toggle Completion Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleTaskStatus(task, e)}
                              className={`h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                isDone 
                                  ? 'bg-primary border-primary text-white' 
                                  : 'border-secondary-light/40 hover:border-primary'
                              }`}
                              title={isDone ? "Mark as pending" : "Mark as completed"}
                            >
                              {isDone && <Check className="h-3.5 w-3.5" />}
                            </button>

                            {/* Title & Date */}
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-secondary-light' : 'text-secondary-dark'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center space-x-2 text-[11px] text-secondary-light mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.date}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Priority & Status Badges */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {task.priority && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                isHigh 
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20' 
                                  : isMed
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-canvas-variant text-secondary-light border border-canvas-variant'
                              }`}>
                                {task.priority}
                              </span>
                            )}

                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              isDone 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-canvas-variant text-secondary-light'
                            }`}>
                              {task.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}

            {teamMembersWithTasks.length === 0 && (
              <div className="py-12 text-center text-secondary-light bg-canvas-surface rounded-xl border border-canvas-variant">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-secondary-light/60" />
                <p className="font-medium text-sm">No team tasks found matching your filters.</p>
                <p className="text-xs mt-1">Try changing the date or clearing your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-canvas-variant bg-canvas-variant/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-secondary-light">
            Showing <strong className="text-secondary-dark">{filteredTasks.length}</strong> tasks across <strong className="text-secondary-dark">{teamMembersWithTasks.length}</strong> team members
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsWorkloadModalOpen(false);
                navigate('/operations/tasks');
              }}
              className="text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open Task Manager Calendar
            </Button>
            <Button 
              onClick={() => setIsWorkloadModalOpen(false)}
              className="text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
