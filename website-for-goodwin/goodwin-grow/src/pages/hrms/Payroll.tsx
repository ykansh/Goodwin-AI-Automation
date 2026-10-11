import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Download, 
  IndianRupee, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Printer, 
  FileText, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useStore, type PayrollRecord } from '../../lib/store';
import { 
  generatePayslipHTML, 
  printReceiptDirectly, 
  triggerDownload, 
  type PayslipData 
} from '../../lib/attendanceReceipt';
import { 
  format, 
  parse, 
  isValid, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  getDay 
} from 'date-fns';

export const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');
  
  const payroll = useStore(state => state.payroll);
  const employees = useStore(state => state.employees);
  const attendance = useStore(state => state.attendance);
  const syncPayrollsFromJoiningDate = useStore(state => state.syncPayrollsFromJoiningDate);
  const runPayroll = useStore(state => state.runPayroll);
  const updatePayroll = useStore(state => state.updatePayroll);
  const deletePayroll = useStore(state => state.deletePayroll);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('Pending');

  // Payslip Modal State
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);

  // Auto-sync monthly payrolls from joining date on initial mount
  useEffect(() => {
    let mounted = true;
    const runInitialSync = async () => {
      try {
        const res = await syncPayrollsFromJoiningDate();
        if (mounted && res.generatedCount > 0) {
          setLastSyncResult(`Auto-generated ${res.generatedCount} monthly payroll record(s) based on employee joining dates.`);
        }
      } catch (err) {
        console.warn('Initial payroll auto-sync error:', err);
      }
    };
    runInitialSync();
    return () => { mounted = false; };
  }, [syncPayrollsFromJoiningDate]);

  /**
   * Helper: Calculate Sunday Extra Days worked for a given employee & month
   */
  const getSundayInfoForMonth = (employeeName: string, monthStr: string, basicSalary: number) => {
    let parsedMonth: Date;
    try {
      parsedMonth = parse(monthStr, 'MMM yyyy', new Date());
      if (!isValid(parsedMonth)) {
        parsedMonth = new Date();
      }
    } catch {
      parsedMonth = new Date();
    }

    const mStart = startOfMonth(parsedMonth);
    const mEnd = endOfMonth(parsedMonth);
    const today = new Date();

    let sundayExtraDays = 0;
    const sundayDates: string[] = [];

    let cur = new Date(mStart);
    while (cur <= mEnd && cur <= today) {
      if (getDay(cur) === 0) { // Sunday
        const dStr = format(cur, 'yyyy-MM-dd');
        const dayRec = attendance[dStr];
        if (dayRec) {
          const empRec = dayRec[employeeName] || 
            Object.entries(dayRec).find(([k]) => k.trim().toLowerCase() === employeeName.trim().toLowerCase())?.[1];

          if (empRec?.status === 'Present') {
            sundayExtraDays += 1;
            sundayDates.push(format(cur, 'd MMM'));
          } else if (empRec?.status === 'Half-Day') {
            sundayExtraDays += 0.5;
            sundayDates.push(`${format(cur, 'd MMM')} (Half-Day)`);
          }
        }
      }
      cur = addDays(cur, 1);
    }

    const overtimeBonus = Math.round(sundayExtraDays * (basicSalary / 30));

    return {
      sundayExtraDays,
      overtimeBonus,
      sundayDates
    };
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setLastSyncResult(null);
    try {
      const res = await syncPayrollsFromJoiningDate();
      if (res.generatedCount > 0) {
        setLastSyncResult(`Generated ${res.generatedCount} new monthly payrolls starting from employee joining dates.`);
      } else {
        setLastSyncResult('All monthly payrolls from employee joining dates are up to date in Supabase.');
      }
    } catch (err: any) {
      alert('Failed to sync payroll: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updatePayroll(editingId, { status: editStatus });
      setIsEditModalOpen(false);
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll record?')) return;
    try {
      await deletePayroll(id);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // Open Payslip modal
  const handleOpenPayslip = (record: PayrollRecord) => {
    const emp = employees.find(e => e.id === record.employeeId || e.name.trim().toLowerCase() === record.name.trim().toLowerCase());
    const sundayInfo = getSundayInfoForMonth(record.name, record.month, record.basic);
    
    // Total allowances including overtime bonus
    const totalAllowances = record.allowances > 0 
      ? record.allowances 
      : Math.round(record.basic * 0.1) + sundayInfo.overtimeBonus;
      
    const netSalary = record.net > 0 
      ? record.net 
      : (record.basic + totalAllowances - record.deductions);

    const payslipData: PayslipData = {
      employeeName: record.name,
      role: emp?.role || 'Team Member',
      employeeId: record.employeeId || emp?.id,
      joinDate: emp?.joinDate || record.joinDate,
      month: record.month,
      basicSalary: record.basic,
      allowances: totalAllowances,
      deductions: record.deductions,
      netSalary,
      status: record.status,
      sundayExtraDays: sundayInfo.sundayExtraDays,
      sundayOvertimeBonus: sundayInfo.overtimeBonus,
      sundayDates: sundayInfo.sundayDates
    };

    setSelectedPayslip(payslipData);
    setIsPayslipModalOpen(true);
  };

  // Direct print of selected payslip
  const handlePrintPayslip = () => {
    if (!selectedPayslip) return;
    const html = generatePayslipHTML(selectedPayslip);
    printReceiptDirectly(html);
  };

  // Direct download of selected payslip
  const handleDownloadPayslip = () => {
    if (!selectedPayslip) return;
    const html = generatePayslipHTML(selectedPayslip);
    triggerDownload(
      html, 
      `Payslip_${selectedPayslip.employeeName.replace(/\s+/g, '_')}_${selectedPayslip.month.replace(/\s+/g, '_')}.html`, 
      'text/html;charset=utf-8;'
    );
  };

  // Unique months available in payroll
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    payroll.forEach(p => {
      if (p.month) set.add(p.month);
    });
    return Array.from(set);
  }, [payroll]);

  // Filtered payroll list
  const filteredPayroll = useMemo(() => {
    return payroll.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.month?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMonth = selectedMonthFilter === 'ALL' || p.month === selectedMonthFilter;
      return matchSearch && matchMonth;
    });
  }, [payroll, searchTerm, selectedMonthFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalNet = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let totalSundayExtraDays = 0;

    payroll.forEach(p => {
      totalNet += p.net || 0;
      if (p.status === 'Paid') paidCount++;
      else pendingCount++;

      const sun = getSundayInfoForMonth(p.name, p.month, p.basic);
      totalSundayExtraDays += sun.sundayExtraDays;
    });

    return {
      totalNet,
      paidCount,
      pendingCount,
      totalSundayExtraDays,
      totalRecords: payroll.length
    };
  }, [payroll, employees, attendance]);

  const handleExport = () => {
    if (filteredPayroll.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = ['Employee', 'Date of Joining', 'Month', 'Basic Salary', 'Allowances', 'Sunday Extra Days', 'Sunday Bonus', 'Deductions', 'Net Salary', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayroll.map(p => {
        const emp = employees.find(e => e.id === p.employeeId || e.name === p.name);
        const sun = getSundayInfoForMonth(p.name, p.month, p.basic);
        return `"${p.name}","${emp?.joinDate || p.joinDate || 'N/A'}","${p.month}",${p.basic},${p.allowances},${sun.sundayExtraDays},${sun.overtimeBonus},${p.deductions},${p.net},"${p.status}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatJoinDate = (joinDateStr?: string) => {
    if (!joinDateStr) return 'N/A';
    try {
      const d = parseISO(joinDateStr);
      return isValid(d) ? format(d, 'dd MMM yyyy') : joinDateStr;
    } catch {
      return joinDateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Payroll Management</h1>
            <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" /> Auto-Generated
            </Badge>
          </div>
          <p className="text-secondary-light text-sm mt-1">
            Monthly payrolls generated automatically according to employee date of joining with Sunday overtime tracking.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleManualSync} 
            disabled={isSyncing}
            variant="secondary"
            className="border-primary/30 text-primary hover:bg-primary/5 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Joining Date'}
          </Button>

          <Button onClick={handleExport} variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {lastSyncResult && (
        <div className="bg-primary/10 border border-primary/20 text-primary-dark px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>{lastSyncResult}</span>
          </div>
          <button 
            onClick={() => setLastSyncResult(null)} 
            className="text-primary hover:text-primary-dark text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-light uppercase tracking-wider">Total Net Payroll</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-secondary-dark mt-2">
            {formatCurrency(stats.totalNet)}
          </div>
          <p className="text-xs text-secondary-light mt-1">
            {stats.totalRecords} payroll record(s) across all active months
          </p>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-light uppercase tracking-wider">Joining Date Sync</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-secondary-dark mt-2">
            {employees.filter(e => e.status === 'active').length} Active
          </div>
          <p className="text-xs text-secondary-light mt-1">
            Monthly cycles auto-stored from employee join dates
          </p>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm border-amber-500/20 bg-amber-500/[0.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Sunday Extra Days</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">
            ⭐ {stats.totalSundayExtraDays} Days
          </div>
          <p className="text-xs text-secondary-light mt-1">
            Sunday attendance credited with daily overtime bonus
          </p>
        </div>

        <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-variant shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-light uppercase tracking-wider">Disbursement Status</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-secondary-dark mt-2 flex items-baseline gap-2">
            <span className="text-emerald-600">{stats.paidCount} Paid</span>
            <span className="text-xs text-secondary-light font-normal">/ {stats.pendingCount} Pending</span>
          </div>
          <p className="text-xs text-secondary-light mt-1">
            Real-time synchronization with Supabase DB
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search employee or month..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Month Selector */}
          <div className="w-full sm:w-48">
            <Select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Months' },
                ...availableMonths.map(m => ({ value: m, label: m }))
              ]}
            />
          </div>
        </div>

        <div className="text-xs text-secondary-light self-center">
          Showing <span className="font-semibold text-secondary-dark">{filteredPayroll.length}</span> record(s)
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas/50 border-b border-canvas-variant text-xs uppercase tracking-wider text-secondary-light font-semibold">
                <th className="px-6 py-4">Employee & Joining Date</th>
                <th className="px-6 py-4">Pay Period</th>
                <th className="px-6 py-4 text-right">Basic Salary</th>
                <th className="px-6 py-4 text-right">Allowances & Overtime</th>
                <th className="px-6 py-4 text-right">Deductions</th>
                <th className="px-6 py-4 text-right">Net Salary</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-variant">
              {filteredPayroll.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-secondary-light">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <IndianRupee className="w-8 h-8 text-secondary-light/40" />
                      <p className="text-sm font-medium">No payroll data found.</p>
                      <p className="text-xs text-secondary-light">Click &ldquo;Sync from Joining Date&rdquo; to generate monthly records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayroll.map((record) => {
                  const emp = employees.find(e => e.id === record.employeeId || e.name.trim().toLowerCase() === record.name.trim().toLowerCase());
                  const joinDate = emp?.joinDate || record.joinDate;
                  const sundayInfo = getSundayInfoForMonth(record.name, record.month, record.basic);
                  const hasSundayExtra = sundayInfo.sundayExtraDays > 0;

                  return (
                    <tr key={record.id} className="hover:bg-canvas/30 transition-colors">
                      {/* Employee & Date of Joining */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-secondary-dark">{record.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-secondary-light">{emp?.role || 'Team Member'}</span>
                          <span className="text-secondary-light/40 text-xs">•</span>
                          <span className="text-[11px] font-medium text-primary/90 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                            Joined: {formatJoinDate(joinDate)}
                          </span>
                        </div>
                      </td>

                      {/* Pay Period / Month */}
                      <td className="px-6 py-4">
                        <Badge variant="default" className="font-semibold text-xs bg-canvas/80 text-secondary-dark">
                          <Calendar className="w-3 h-3 mr-1 text-secondary-light" />
                          {record.month}
                        </Badge>
                      </td>

                      {/* Basic Salary */}
                      <td className="px-6 py-4 text-right font-medium text-secondary-dark">
                        {formatCurrency(record.basic)}
                      </td>

                      {/* Allowances & Sunday Extra Days */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-secondary-dark">
                          {formatCurrency(record.allowances)}
                        </div>
                        {hasSundayExtra && (
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{sundayInfo.sundayExtraDays} Sun Extra (+{formatCurrency(sundayInfo.overtimeBonus)})</span>
                          </div>
                        )}
                      </td>

                      {/* Deductions */}
                      <td className="px-6 py-4 text-right text-sm text-secondary-light">
                        {formatCurrency(record.deductions)}
                      </td>

                      {/* Net Salary */}
                      <td className="px-6 py-4 text-right font-bold text-base text-success-dark">
                        {formatCurrency(record.net)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <Badge variant={record.status === 'Paid' ? 'success' : 'warning'}>
                          {record.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 px-2.5 text-xs text-primary hover:text-primary-dark font-medium border-primary/20 hover:bg-primary/5"
                            onClick={() => handleOpenPayslip(record)}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Payslip
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-secondary-light hover:text-primary" 
                            onClick={() => handleEdit(record)}
                            title="Edit Status"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-secondary-light hover:text-danger" 
                            onClick={() => handleDelete(record.id)}
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Edit Payroll Status Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Payroll Record">
        <div className="space-y-4">
          <div>
            <label className="enterprise-label">Disbursement Status</label>
            <Select 
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { value: 'Pending', label: 'Pending (Disbursement Scheduled)' },
                { value: 'Paid', label: 'Paid (Successfully Disbursed)' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Full Payslip Preview Modal */}
      {selectedPayslip && (
        <Modal 
          isOpen={isPayslipModalOpen} 
          onClose={() => setIsPayslipModalOpen(false)} 
          title={`Employee Payslip — ${selectedPayslip.month}`}
        >
          <div className="space-y-5 max-w-2xl mx-auto">
            {/* Header / Brand */}
            <div className="bg-canvas/50 p-4 rounded-xl border border-canvas-variant flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-secondary-dark tracking-tight">Goodwin AI Automation</h3>
                <p className="text-xs text-secondary-light">Official Employee Salary Slip & Payroll Statement</p>
              </div>
              <div className="text-right">
                <Badge variant={selectedPayslip.status === 'Paid' ? 'success' : 'warning'} className="font-bold">
                  {selectedPayslip.status}
                </Badge>
                <div className="text-xs font-semibold text-secondary-dark mt-1">{selectedPayslip.month}</div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-2 gap-3 bg-canvas-surface p-4 rounded-xl border border-canvas-variant text-xs">
              <div>
                <span className="text-secondary-light block">Employee Name:</span>
                <span className="font-semibold text-secondary-dark text-sm">{selectedPayslip.employeeName}</span>
              </div>
              <div>
                <span className="text-secondary-light block">Designation:</span>
                <span className="font-semibold text-secondary-dark text-sm">{selectedPayslip.role}</span>
              </div>
              <div>
                <span className="text-secondary-light block">Date of Joining:</span>
                <span className="font-semibold text-primary">{formatJoinDate(selectedPayslip.joinDate)}</span>
              </div>
              <div>
                <span className="text-secondary-light block">Employee ID:</span>
                <span className="font-mono text-secondary-dark">{selectedPayslip.employeeId ? selectedPayslip.employeeId.slice(0, 8).toUpperCase() : 'EMP-AUT'}</span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="border border-canvas-variant rounded-xl overflow-hidden bg-canvas-surface">
                <div className="bg-canvas/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-secondary-light border-b border-canvas-variant">
                  Earnings
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-secondary">Basic Salary</span>
                    <span className="font-semibold text-secondary-dark">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Standard Allowances</span>
                    <span className="font-semibold text-secondary-dark">
                      {formatCurrency(Math.max(0, selectedPayslip.allowances - (selectedPayslip.sundayOvertimeBonus || 0)))}
                    </span>
                  </div>
                  {selectedPayslip.sundayExtraDays && selectedPayslip.sundayExtraDays > 0 ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-amber-800 dark:text-amber-300">
                      <div className="flex justify-between font-bold">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Sunday Extra Days Worked:
                        </span>
                        <span>+{formatCurrency(selectedPayslip.sundayOvertimeBonus || 0)}</span>
                      </div>
                      <div className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                        {selectedPayslip.sundayExtraDays} Sunday(s) worked ({selectedPayslip.sundayDates?.join(', ')})
                      </div>
                    </div>
                  ) : null}
                  <div className="pt-2 border-t border-canvas-variant flex justify-between font-bold text-secondary-dark">
                    <span>Total Earnings</span>
                    <span>{formatCurrency(selectedPayslip.basicSalary + selectedPayslip.allowances)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-canvas-variant rounded-xl overflow-hidden bg-canvas-surface">
                <div className="bg-canvas/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-secondary-light border-b border-canvas-variant">
                  Deductions
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-secondary">Provident Fund (PF - 5%)</span>
                    <span className="font-semibold text-secondary-dark">{formatCurrency(selectedPayslip.deductions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tax / TDS</span>
                    <span className="font-semibold text-secondary-dark">₹0</span>
                  </div>
                  <div className="pt-2 border-t border-canvas-variant flex justify-between font-bold text-secondary-dark">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(selectedPayslip.deductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">Net Take-Home Pay</span>
                <p className="text-[11px] text-secondary-light">Disbursed via registered payroll account</p>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedPayslip.netSalary)}
              </div>
            </div>

            {/* Auto-generation & Sunday mention */}
            <div className="bg-canvas/40 p-3 rounded-lg border border-canvas-variant text-xs text-secondary-light space-y-1">
              <div>• <strong>Joining Date Verification:</strong> Payroll generated from employee start date ({formatJoinDate(selectedPayslip.joinDate)}).</div>
              {selectedPayslip.sundayExtraDays && selectedPayslip.sundayExtraDays > 0 ? (
                <div>• <strong>⭐ Sunday Extra Days Worked:</strong> Employee clocked attendance on {selectedPayslip.sundayExtraDays} Sunday(s), compensated as extra days worked with overtime bonus.</div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center gap-2 pt-3 border-t border-canvas-variant">
              <Button variant="secondary" onClick={() => setIsPayslipModalOpen(false)}>
                Close
              </Button>
              <Button variant="secondary" onClick={handleDownloadPayslip}>
                <Download className="w-4 h-4 mr-1.5" />
                Download HTML
              </Button>
              <Button onClick={handlePrintPayslip}>
                <Printer className="w-4 h-4 mr-1.5" />
                Print Payslip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
