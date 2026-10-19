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
  Calculator,
  UserCheck,
  AlertCircle
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
  calculateMonthAttendancePayroll,
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
  const updatePayroll = useStore(state => state.updatePayroll);
  const deletePayroll = useStore(state => state.deletePayroll);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [editBasic, setEditBasic] = useState<number>(10000);
  const [editAllowances, setEditAllowances] = useState<number>(0);
  const [editDeductions, setEditDeductions] = useState<number>(0);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editJoinDate, setEditJoinDate] = useState('');
  const [editAbsentDays, setEditAbsentDays] = useState<number | ''>('');
  const [editSundayDays, setEditSundayDays] = useState<number | ''>('');
  const [syncToEmployeeMaster, setSyncToEmployeeMaster] = useState(true);

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
          setLastSyncResult(`Auto-generated ${res.generatedCount} monthly payroll / stipend record(s) based on employee joining dates.`);
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
    const trimmedEmpName = (employeeName || '').trim().toLowerCase();

    let cur = new Date(mStart);
    while (cur <= mEnd && cur <= today) {
      if (getDay(cur) === 0) { // Sunday
        const dStr = format(cur, 'yyyy-MM-dd');
        const dayRec = attendance[dStr];
        if (dayRec) {
          const empRec = dayRec[employeeName] || 
            Object.entries(dayRec).find(([k]) => k.trim().toLowerCase() === trimmedEmpName)?.[1];

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
        setLastSyncResult(`Generated ${res.generatedCount} new monthly payrolls / stipends starting from employee joining dates.`);
      } else {
        setLastSyncResult('All monthly records from employee joining dates are up to date in Supabase.');
      }
    } catch (err: any) {
      alert('Failed to sync payroll: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEdit = (record: PayrollRecord) => {
    const emp = employees.find(e => e.id === record.employeeId || e.name.trim().toLowerCase() === record.name.trim().toLowerCase());
    const effectiveJoinDate = emp?.joinDate || record.joinDate || '';
    
    // Calculate current base allowances (excluding Sunday bonus which recalculates dynamically)
    const baseAllowances = Math.max(0, (record.allowances || 0) - (record.sundayOvertimeBonus || 0));
    // Base other deductions (excluding attendance deduction which recalculates dynamically)
    const baseDeductions = Math.max(0, (record.deductions || 0) - (record.attendanceDeduction || 0));

    setEditingRecord(record);
    setEditBasic(record.basic || 10000);
    setEditAllowances(baseAllowances);
    setEditDeductions(baseDeductions);
    setEditStatus(record.status || 'Pending');
    setEditJoinDate(effectiveJoinDate);
    const attStats = calculateMonthAttendancePayroll(
      record.name,
      record.month,
      record.basic || 10000,
      attendance
    );
    setEditAbsentDays(attStats.absentDays);
    setEditSundayDays(attStats.sundayExtraDays);
    setSyncToEmployeeMaster(true);
    setIsEditModalOpen(true);
  };

  // Dynamic live calculation inside Edit Modal
  const editDynamicCalculation = useMemo(() => {
    if (!editingRecord) return null;
    return calculateMonthAttendancePayroll(
      editingRecord.name,
      editingRecord.month,
      Number(editBasic) || 0,
      attendance,
      {
        allowances: Number(editAllowances) || 0,
        otherDeductions: Number(editDeductions) || 0,
        overrideAbsentDays: editAbsentDays !== '' ? Number(editAbsentDays) : undefined,
        overrideSundayExtraDays: editSundayDays !== '' ? Number(editSundayDays) : undefined
      }
    );
  }, [editingRecord, editBasic, editAllowances, editDeductions, editAbsentDays, editSundayDays, attendance]);

  const saveEdit = async () => {
    if (!editingRecord || !editDynamicCalculation) return;
    try {
      const totalAllowances = editDynamicCalculation.sundayBonus + (Number(editAllowances) || 0);
      const totalDeductions = editDynamicCalculation.attendanceDeduction + (Number(editDeductions) || 0);
      const finalNet = editDynamicCalculation.netSalary;

      await updatePayroll(
        editingRecord.id,
        {
          basic: Number(editBasic) || 0,
          allowances: totalAllowances,
          deductions: totalDeductions,
          net: finalNet,
          status: editStatus,
          joinDate: editJoinDate
        },
        syncToEmployeeMaster ? { salary: Number(editBasic) || 0, joinDate: editJoinDate } : undefined
      );

      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      alert('Failed to update payroll: ' + err.message);
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

  // Open Payslip modal from table record
  const handleOpenPayslip = (record: PayrollRecord) => {
    const emp = employees.find(e => e.id === record.employeeId || e.name.trim().toLowerCase() === record.name.trim().toLowerCase());
    const isIntern = emp?.type === 'Intern' || (emp?.role && emp.role.toLowerCase().includes('intern')) || record.salaryType === 'Stipend';
    
    // Compute complete attendance & payroll breakdown
    const baseAllowances = Math.max(0, (record.allowances || 0) - (record.sundayOvertimeBonus || 0));
    const baseOtherDeductions = Math.max(0, (record.deductions || 0) - (record.attendanceDeduction || 0));

    const attStats = calculateMonthAttendancePayroll(
      record.name,
      record.month,
      record.basic,
      attendance,
      {
        allowances: baseAllowances,
        otherDeductions: baseOtherDeductions
      }
    );

    const payslipData: PayslipData = {
      employeeName: record.name,
      role: emp?.role || 'Team Member',
      employeeId: record.employeeId || emp?.id,
      joinDate: emp?.joinDate || record.joinDate,
      month: record.month,
      basicSalary: record.basic,
      totalDaysInMonth: attStats.totalDaysInMonth,
      perDaySalary: attStats.perDaySalary,
      presentDays: attStats.presentDays,
      absentDays: attStats.absentDays,
      attendanceDeduction: attStats.attendanceDeduction,
      allowances: record.allowances > 0 ? record.allowances : attStats.sundayBonus,
      deductions: record.deductions > 0 ? record.deductions : attStats.attendanceDeduction,
      netSalary: record.net > 0 ? record.net : attStats.netSalary,
      status: record.status,
      sundayExtraDays: attStats.sundayExtraDays,
      sundayOvertimeBonus: attStats.sundayBonus,
      sundayDates: attStats.sundayDates,
      salaryType: isIntern ? 'Stipend' : 'Salary'
    };

    setSelectedPayslip(payslipData);
    setIsPayslipModalOpen(true);
  };

  // Open Payslip directly from Edit modal with live numbers
  const handlePreviewFromEdit = () => {
    if (!editingRecord || !editDynamicCalculation) return;
    const emp = employees.find(e => e.id === editingRecord.employeeId || e.name.trim().toLowerCase() === editingRecord.name.trim().toLowerCase());
    const isIntern = emp?.type === 'Intern' || (emp?.role && emp.role.toLowerCase().includes('intern')) || editingRecord.salaryType === 'Stipend';

    const payslipData: PayslipData = {
      employeeName: editingRecord.name,
      role: emp?.role || 'Team Member',
      employeeId: editingRecord.employeeId || emp?.id,
      joinDate: editJoinDate || emp?.joinDate || editingRecord.joinDate,
      month: editingRecord.month,
      basicSalary: Number(editBasic) || 0,
      totalDaysInMonth: editDynamicCalculation.totalDaysInMonth,
      perDaySalary: editDynamicCalculation.perDaySalary,
      presentDays: editDynamicCalculation.presentDays,
      absentDays: editDynamicCalculation.absentDays,
      attendanceDeduction: editDynamicCalculation.attendanceDeduction,
      allowances: editDynamicCalculation.sundayBonus + (Number(editAllowances) || 0),
      deductions: editDynamicCalculation.attendanceDeduction + (Number(editDeductions) || 0),
      netSalary: editDynamicCalculation.netSalary,
      status: editStatus,
      sundayExtraDays: editDynamicCalculation.sundayExtraDays,
      sundayOvertimeBonus: editDynamicCalculation.sundayBonus,
      sundayDates: editDynamicCalculation.sundayDates,
      salaryType: isIntern ? 'Stipend' : 'Salary'
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

  // Guarantee unique payroll records by (employeeId/name, month)
  const deduplicatedPayroll = useMemo(() => {
    const map = new Map<string, PayrollRecord>();
    payroll.forEach(p => {
      const key = `${p.employeeId || p.name}_${p.month}`;
      if (!map.has(key)) {
        map.set(key, p);
      }
    });
    return Array.from(map.values());
  }, [payroll]);

  // Unique months available in payroll
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    deduplicatedPayroll.forEach(p => {
      if (p.month) set.add(p.month);
    });
    return Array.from(set);
  }, [deduplicatedPayroll]);

  // Filtered payroll list
  const filteredPayroll = useMemo(() => {
    return deduplicatedPayroll.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.month?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMonth = selectedMonthFilter === 'ALL' || p.month === selectedMonthFilter;
      return matchSearch && matchMonth;
    });
  }, [deduplicatedPayroll, searchTerm, selectedMonthFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalNet = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let totalSundayExtraDays = 0;

    deduplicatedPayroll.forEach(p => {
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
      totalRecords: deduplicatedPayroll.length
    };
  }, [deduplicatedPayroll, employees, attendance]);

  const handleExport = () => {
    if (filteredPayroll.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = ['Employee', 'Type', 'Date of Joining', 'Month', 'Basic Salary / Stipend', 'Allowances', 'Sunday Extra Days', 'Sunday Bonus', 'Attendance Deduction', 'Total Deductions', 'Net Salary / Stipend', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayroll.map(p => {
        const emp = employees.find(e => e.id === p.employeeId || e.name === p.name);
        const sun = getSundayInfoForMonth(p.name, p.month, p.basic);
        return `"${p.name}","${p.salaryType || (emp?.type === 'Intern' ? 'Stipend' : 'Salary')}","${emp?.joinDate || p.joinDate || 'N/A'}","${p.month}",${p.basic},${p.allowances},${sun.sundayExtraDays},${sun.overtimeBonus},${p.attendanceDeduction || 0},${p.deductions},${p.net},"${p.status}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_stipend_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
            <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Payroll & Stipend Management</h1>
            <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" /> Dynamic Attendance Linked
            </Badge>
          </div>
          <p className="text-secondary-light text-sm mt-1">
            Calculates exact per-day rates, attendance deductions for leaves/absences, and Sunday overtime bonuses based on employee join dates.
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
            <span className="text-xs font-semibold text-secondary-light uppercase tracking-wider">Total Net Disbursements</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-secondary-dark mt-2">
            {formatCurrency(stats.totalNet)}
          </div>
          <p className="text-xs text-secondary-light mt-1">
            {stats.totalRecords} payroll & stipend cycles tracked
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
            {employees.filter(e => e.status === 'active').length} Active Members
          </div>
          <p className="text-xs text-secondary-light mt-1">
            Individually verified from each member&apos;s start date
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
            ⭐ {stats.totalSundayExtraDays} Days Worked
          </div>
          <p className="text-xs text-secondary-light mt-1">
            Credited at daily rate based on attendance section
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
              placeholder="Search member or month..." 
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
                <th className="px-6 py-4">Employee & Date of Joining</th>
                <th className="px-6 py-4">Pay Period</th>
                <th className="px-6 py-4 text-right">Basic Salary / Stipend</th>
                <th className="px-6 py-4 text-right">Allowances & Overtime</th>
                <th className="px-6 py-4 text-right">Attendance & Deductions</th>
                <th className="px-6 py-4 text-right">Net Salary / Stipend</th>
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
                      <p className="text-sm font-medium">No payroll or stipend data found.</p>
                      <p className="text-xs text-secondary-light">Click &ldquo;Sync from Joining Date&rdquo; to generate monthly records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayroll.map((record) => {
                  const emp = employees.find(e => e.id === record.employeeId || e.name.trim().toLowerCase() === record.name.trim().toLowerCase());
                  const joinDate = emp?.joinDate || record.joinDate;
                  const isIntern = emp?.type === 'Intern' || (emp?.role && emp.role.toLowerCase().includes('intern')) || record.salaryType === 'Stipend';
                  const sundayInfo = getSundayInfoForMonth(record.name, record.month, record.basic);
                  const hasSundayExtra = sundayInfo.sundayExtraDays > 0;
                  const hasAttendanceDeduction = (record.absentDays || 0) > 0;

                  return (
                    <tr key={record.id} className="hover:bg-canvas/30 transition-colors">
                      {/* Employee & Date of Joining */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-secondary-dark">{record.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isIntern 
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                          }`}>
                            {isIntern ? 'Stipend' : 'Salary'}
                          </span>
                        </div>
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

                      {/* Basic Salary / Stipend */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-secondary-dark">
                          {formatCurrency(record.basic)}
                        </div>
                        {record.perDaySalary ? (
                          <div className="text-[11px] text-secondary-light mt-0.5">
                            {formatCurrency(record.perDaySalary)}/day ({record.totalDaysInMonth || 30}d)
                          </div>
                        ) : null}
                      </td>

                      {/* Allowances & Sunday Extra Days */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-secondary-dark">
                          {formatCurrency(record.allowances)}
                        </div>
                        {hasSundayExtra && (
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{sundayInfo.sundayExtraDays} Sun (+{formatCurrency(sundayInfo.overtimeBonus)})</span>
                          </div>
                        )}
                      </td>

                      {/* Deductions (Attendance + Other) */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-secondary-dark">
                          {formatCurrency(record.deductions)}
                        </div>
                        {hasAttendanceDeduction ? (
                          <div className="text-[11px] text-danger font-medium mt-0.5">
                            -{formatCurrency(record.attendanceDeduction || 0)} ({record.absentDays}d off)
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                            Full Attendance
                          </div>
                        )}
                      </td>

                      {/* Net Salary / Stipend */}
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
                            title="Edit Salary / Stipend & Deductions"
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

      {/* Comprehensive Edit Payroll & Salary Modal */}
      {editingRecord && (
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          title={`Edit Payroll & Salary / Stipend: ${editingRecord.name}`}
        >
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Header info bar */}
            <div className="bg-canvas/60 p-3 rounded-xl border border-canvas-variant flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-secondary-dark text-sm block">{editingRecord.name}</span>
                <span className="text-secondary-light">{editingRecord.month} Period</span>
              </div>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">
                {editingRecord.salaryType || 'Salary / Stipend'}
              </Badge>
            </div>

            {/* Live Attendance Section Feed & Daily Rate Breakdown */}
            {editDynamicCalculation && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-secondary-dark">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span>Live Attendance Calculation ({editingRecord.month})</span>
                  </div>
                  <span className="font-semibold text-primary">
                    Rate: {formatCurrency(editDynamicCalculation.perDaySalary)} / day
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                    <span className="text-[11px] text-secondary-light block">Month Duration</span>
                    <span className="font-bold text-secondary-dark">{editDynamicCalculation.totalDaysInMonth} Days</span>
                  </div>
                  <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                    <span className="text-[11px] text-secondary-light block">Days Present</span>
                    <span className="font-bold text-emerald-600">{editDynamicCalculation.presentDays} Days</span>
                  </div>
                  <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                    <span className="text-[11px] text-secondary-light block">Leaves / Absent</span>
                    <span className="font-bold text-danger">{editDynamicCalculation.absentDays} Day(s)</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 bg-canvas-surface/80 p-2 rounded-lg border border-primary/10">
                    <div>
                      <label className="enterprise-label flex items-center justify-between text-[11px] mb-1">
                        <span>Absent / Off Days</span>
                        <span className="text-[10px] text-danger font-semibold">
                          -{formatCurrency(editDynamicCalculation.attendanceDeduction)}
                        </span>
                      </label>
                      <Input 
                        type="number"
                        step="0.5"
                        min="0"
                        value={editAbsentDays.toString()}
                        onChange={(e) => setEditAbsentDays(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0"
                        className="h-8 text-xs font-semibold"
                      />
                      <span className="text-[9px] text-secondary-light block mt-0.5">
                        Deduction: {editDynamicCalculation.absentDays}d × {formatCurrency(editDynamicCalculation.perDaySalary)}
                      </span>
                    </div>

                    <div>
                      <label className="enterprise-label flex items-center justify-between text-[11px] mb-1">
                        <span>⭐ Extra Sundays Worked</span>
                        <span className="text-[10px] text-amber-600 font-semibold">
                          +{formatCurrency(editDynamicCalculation.sundayBonus)}
                        </span>
                      </label>
                      <Input 
                        type="number"
                        step="0.5"
                        min="0"
                        value={editSundayDays.toString()}
                        onChange={(e) => setEditSundayDays(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0"
                        className="h-8 text-xs font-semibold"
                      />
                      <span className="text-[9px] text-secondary-light block mt-0.5">
                        Bonus: {editDynamicCalculation.sundayExtraDays}d × {formatCurrency(editDynamicCalculation.perDaySalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Editable Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="enterprise-label">Basic Salary / Stipend (₹)</label>
                <Input 
                  type="number"
                  value={editBasic.toString()}
                  onChange={(e) => setEditBasic(Number(e.target.value))}
                  placeholder="e.g. 10000"
                />
              </div>

              <div>
                <label className="enterprise-label">Date of Joining</label>
                <Input 
                  type="date"
                  value={editJoinDate}
                  onChange={(e) => setEditJoinDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="enterprise-label">Other Allowances (₹)</label>
                <Input 
                  type="number"
                  value={editAllowances.toString()}
                  onChange={(e) => setEditAllowances(Number(e.target.value))}
                  placeholder="0"
                />
                <span className="text-[10px] text-secondary-light mt-0.5 block">
                  Sunday bonus (+{formatCurrency(editDynamicCalculation?.sundayBonus || 0)}) added automatically
                </span>
              </div>

              <div>
                <label className="enterprise-label">Other Deductions (₹)</label>
                <Input 
                  type="number"
                  value={editDeductions.toString()}
                  onChange={(e) => setEditDeductions(Number(e.target.value))}
                  placeholder="0"
                />
                <span className="text-[10px] text-secondary-light mt-0.5 block">
                  Att. deduction (-{formatCurrency(editDynamicCalculation?.attendanceDeduction || 0)}) added automatically
                </span>
              </div>
            </div>

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

            {/* Sync master profile toggle */}
            <div className="flex items-center space-x-2 pt-1">
              <input 
                type="checkbox"
                id="syncMasterProfile"
                checked={syncToEmployeeMaster}
                onChange={(e) => setSyncToEmployeeMaster(e.target.checked)}
                className="rounded border-canvas-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="syncMasterProfile" className="text-xs text-secondary cursor-pointer select-none">
                Sync updated base salary & date of joining to Employee Master profile
              </label>
            </div>

            {/* Dynamic Calculated Net Salary Result Banner */}
            {editDynamicCalculation && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                    Calculated Net Take-Home Pay
                  </span>
                  <div className="text-[11px] text-secondary-light mt-0.5">
                    Basic ({formatCurrency(editBasic)}) + Sun Bonus (+{formatCurrency(editDynamicCalculation.sundayBonus)}) - Leaves (-{formatCurrency(editDynamicCalculation.attendanceDeduction)})
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(editDynamicCalculation.netSalary)}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex justify-between items-center border-t border-canvas-variant">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handlePreviewFromEdit}
                className="text-primary hover:text-primary-dark border-primary/20"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Preview Payslip
              </Button>

              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={saveEdit}>Save Changes</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Full Payslip Preview Modal */}
      {selectedPayslip && (
        <Modal 
          isOpen={isPayslipModalOpen} 
          onClose={() => setIsPayslipModalOpen(false)} 
          title={`${selectedPayslip.salaryType || 'Salary / Stipend'} Slip — ${selectedPayslip.month}`}
        >
          <div className="space-y-5 max-w-2xl mx-auto">
            {/* Header / Brand */}
            <div className="bg-canvas/50 p-4 rounded-xl border border-canvas-variant flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-secondary-dark tracking-tight">Goodwin AI Automation</h3>
                <p className="text-xs text-secondary-light">Official Employee {selectedPayslip.salaryType || 'Salary / Stipend'} Slip & Payroll Statement</p>
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
                <span className="text-secondary-light block">Designation / Role:</span>
                <span className="font-semibold text-secondary-dark text-sm">{selectedPayslip.role}</span>
              </div>
              <div>
                <span className="text-secondary-light block">Verified Date of Joining:</span>
                <span className="font-semibold text-primary">{formatJoinDate(selectedPayslip.joinDate)}</span>
              </div>
              <div>
                <span className="text-secondary-light block">Employee ID:</span>
                <span className="font-mono text-secondary-dark">{selectedPayslip.employeeId ? selectedPayslip.employeeId.slice(0, 8).toUpperCase() : 'EMP-AUT'}</span>
              </div>
            </div>

            {/* Attendance Breakdown Grid */}
            <div className="bg-canvas/40 p-3.5 rounded-xl border border-canvas-variant space-y-2">
              <div className="text-xs font-bold text-secondary-dark flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-primary" />
                <span>Attendance Section Summary ({selectedPayslip.month})</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                  <span className="text-[10px] text-secondary-light block">Month Days</span>
                  <span className="font-bold text-secondary-dark">{selectedPayslip.totalDaysInMonth || 30}</span>
                </div>
                <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                  <span className="text-[10px] text-secondary-light block">Present</span>
                  <span className="font-bold text-emerald-600">{selectedPayslip.presentDays ?? '—'}</span>
                </div>
                <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                  <span className="text-[10px] text-secondary-light block">Absent / Off</span>
                  <span className="font-bold text-danger">{selectedPayslip.absentDays ?? 0}</span>
                </div>
                <div className="bg-canvas-surface p-2 rounded-lg border border-canvas-variant">
                  <span className="text-[10px] text-secondary-light block">Daily Rate</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedPayslip.perDaySalary || 0)}/d</span>
                </div>
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
                    <span className="text-secondary">Basic {selectedPayslip.salaryType || 'Salary'}</span>
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
                          Sunday Extra Worked:
                        </span>
                        <span>+{formatCurrency(selectedPayslip.sundayOvertimeBonus || 0)}</span>
                      </div>
                      <div className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                        {selectedPayslip.sundayExtraDays} Sunday(s) worked @ {formatCurrency(selectedPayslip.perDaySalary || 0)}/day
                        {selectedPayslip.sundayDates && selectedPayslip.sundayDates.length > 0 ? ` (${selectedPayslip.sundayDates.join(', ')})` : ''}
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
                  {(selectedPayslip.absentDays || 0) > 0 ? (
                    <div className="bg-danger/10 border border-danger/20 rounded p-2 text-danger-dark">
                      <div className="flex justify-between font-bold text-danger">
                        <span>Attendance Deduction (Leaves / Off):</span>
                        <span>-{formatCurrency(selectedPayslip.attendanceDeduction || 0)}</span>
                      </div>
                      <div className="text-[11px] text-danger/80 mt-0.5">
                        {selectedPayslip.absentDays} day(s) absent @ {formatCurrency(selectedPayslip.perDaySalary || 0)}/day
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Attendance Deduction</span>
                      <span>₹0 (Full Attendance)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-secondary">Statutory / Other Deductions</span>
                    <span className="font-semibold text-secondary-dark">
                      {formatCurrency(Math.max(0, selectedPayslip.deductions - (selectedPayslip.attendanceDeduction || 0)))}
                    </span>
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
                <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">
                  NET TAKE-HOME {selectedPayslip.salaryType ? selectedPayslip.salaryType.toUpperCase() : 'SALARY / STIPEND'}
                </span>
                <p className="text-[11px] text-secondary-light">Disbursed via Direct Bank Transfer</p>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedPayslip.netSalary)}
              </div>
            </div>

            {/* Notes / Formulas */}
            <div className="bg-canvas/40 p-3 rounded-lg border border-canvas-variant text-xs text-secondary-light space-y-1">
              <div>• <strong>Joining Date:</strong> {formatJoinDate(selectedPayslip.joinDate)}.</div>
              <div>• <strong>Daily Rate Formula:</strong> Basic {formatCurrency(selectedPayslip.basicSalary)} ÷ {selectedPayslip.totalDaysInMonth || 30} days = <strong>{formatCurrency(selectedPayslip.perDaySalary || 0)} / day</strong>.</div>
              {(selectedPayslip.absentDays || 0) > 0 ? (
                <div>• <strong>Attendance Deduction:</strong> {selectedPayslip.absentDays} day(s) absent deducted (-{formatCurrency(selectedPayslip.attendanceDeduction || 0)}).</div>
              ) : null}
              {selectedPayslip.sundayExtraDays && selectedPayslip.sundayExtraDays > 0 ? (
                <div>• <strong>⭐ Sunday Extra Worked:</strong> Employee clocked {selectedPayslip.sundayExtraDays} Sunday(s) (+{formatCurrency(selectedPayslip.sundayOvertimeBonus || 0)}).</div>
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
