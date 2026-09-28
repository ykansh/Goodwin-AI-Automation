import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  UserCheck, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useStore, type AttendanceRecord, type AttendanceStatus, type Employee } from '../../lib/store';
import { useCurrentUser, isSameEmployee } from '../../lib/useCurrentUser';
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
  getDay
} from 'date-fns';
import {
  calculateEmployeeAttendanceStats,
  downloadAttendanceCSV,
  generateEmployeeReceiptHTML,
  generateMasterAttendanceReceiptHTML,
  openReceiptPrintWindow,
  printReceiptDirectly,
  triggerDownload,
  type EmployeeAttendanceStats
} from '../../lib/attendanceReceipt';

export const Attendance = () => {
  const attendance = useStore((state) => state.attendance);
  const updateAttendance = useStore((state) => state.updateAttendance);
  const clockIn = useStore((state) => state.clockIn);
  const clockOut = useStore((state) => state.clockOut);
  const markAbsences = useStore((state) => state.markAbsences);
  const employees = useStore((state) => state.employees);

  const { isAdmin, isEmployee, employeeName, employee: currentEmpObj } = useCurrentUser();
  
  // Selection & Modal States
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isDownloadAllModalOpen, setIsDownloadAllModalOpen] = useState(false);
  const [isMemberReceiptModalOpen, setIsMemberReceiptModalOpen] = useState(false);
  const [selectedMemberStats, setSelectedMemberStats] = useState<EmployeeAttendanceStats | null>(null);
  
  // Read-only day record viewing for employees
  const [readOnlyDayDetail, setReadOnlyDayDetail] = useState<{
    date: Date;
    record: AttendanceRecord | null;
  } | null>(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState<AttendanceRecord>({
    status: 'Present',
    arrival: '09:00',
    departure: '17:00'
  });

  // Matched employee object for logged-in user
  const myEmployeeObj = useMemo(() => {
    if (currentEmpObj) return currentEmpObj;
    return employees.find(e => isSameEmployee(e.name, employeeName)) || employees[0] || null;
  }, [currentEmpObj, employees, employeeName]);

  const myStats = useMemo(() => {
    if (!myEmployeeObj) return null;
    return calculateEmployeeAttendanceStats(myEmployeeObj, attendance);
  }, [myEmployeeObj, attendance]);

  // Calculate stats for all employees
  const allEmployeeStats = useMemo(() => {
    return employees.map(emp => calculateEmployeeAttendanceStats(emp, attendance));
  }, [employees, attendance]);

  // Selected employee object & stats for admin calendar modal
  const selectedEmpObj = useMemo(() => {
    if (!selectedEmployee) return null;
    return employees.find(
      e => isSameEmployee(e.name, selectedEmployee)
    ) || null;
  }, [employees, selectedEmployee]);

  const selectedStats = useMemo(() => {
    if (!selectedEmpObj) return null;
    return calculateEmployeeAttendanceStats(selectedEmpObj, attendance);
  }, [selectedEmpObj, attendance]);

  // Helper to match employee attendance with whitespace-trimmed fallback
  const getEmployeeAttendance = (dateKey: string, empName: string | null) => {
    if (!empName) return null;
    const dayRec = attendance[dateKey];
    if (!dayRec) return null;
    if (dayRec[empName]) return dayRec[empName];
    const trimmed = empName.trim().toLowerCase();
    const found = Object.entries(dayRec).find(([k]) => k.trim().toLowerCase() === trimmed);
    return found ? found[1] : null;
  };

  const handleEmployeeClick = (targetEmployeeName: string) => {
    if (isEmployee && !isSameEmployee(targetEmployeeName, employeeName)) {
      return; // Employees cannot view or manage other employees' calendars
    }
    setSelectedEmployee(targetEmployeeName);
    setIsCalendarModalOpen(true);
    setCurrentDate(new Date()); // reset calendar to current month
  };

  const handleOpenMemberReceipt = (emp: Employee) => {
    const stats = calculateEmployeeAttendanceStats(emp, attendance);
    setSelectedMemberStats(stats);
    setIsMemberReceiptModalOpen(true);
  };

  // Direct download functions for single member
  const handleDownloadMemberHTML = (stats: EmployeeAttendanceStats) => {
    const html = generateEmployeeReceiptHTML(stats);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    triggerDownload(
      html, 
      `Attendance_Receipt_${stats.employeeName.replace(/\s+/g, '_')}_${dateStr}.html`, 
      'text/html;charset=utf-8;'
    );
  };

  const handlePrintMemberReceipt = (stats: EmployeeAttendanceStats) => {
    const html = generateEmployeeReceiptHTML(stats);
    printReceiptDirectly(html);
  };

  const handleDownloadMemberCSV = (stats: EmployeeAttendanceStats) => {
    downloadAttendanceCSV([stats], `Attendance_Report_${stats.employeeName.replace(/\s+/g, '_')}`);
  };

  // Bulk download functions for all members
  const handleDownloadAllHTML = () => {
    const html = generateMasterAttendanceReceiptHTML(allEmployeeStats);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    triggerDownload(html, `Master_Attendance_Receipts_${dateStr}.html`, 'text/html;charset=utf-8;');
  };

  const handlePrintAllReceipts = () => {
    const html = generateMasterAttendanceReceiptHTML(allEmployeeStats);
    printReceiptDirectly(html);
  };

  const handleDownloadAllCSV = () => {
    downloadAttendanceCSV(allEmployeeStats, 'Master_Attendance_Summary');
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const onDateClick = (day: Date, targetEmpName: string, isReadOnly: boolean = false) => {
    if (!targetEmpName) return;
    const dateKey = format(day, 'yyyy-MM-dd');
    const existingRecord = getEmployeeAttendance(dateKey, targetEmpName);

    // If viewing in read-only mode or not admin, show day details popup
    if (isReadOnly || !isAdmin) {
      setReadOnlyDayDetail({ date: day, record: existingRecord });
      return;
    }
    
    if (existingRecord?.isFinalized) {
      alert('This record is finalized and cannot be edited.');
      return;
    }
    
    setSelectedDate(day);
    setSelectedEmployee(targetEmpName);
    if (existingRecord) {
      setFormData(existingRecord);
    } else {
      // Default new record
      setFormData({
        status: 'Present',
        arrival: '09:00',
        departure: '17:00'
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedDate || !selectedEmployee) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    updateAttendance(dateKey, selectedEmployee, formData);
    setIsEditModalOpen(false);
  };

  // Render Employee Grid for Admin
  const renderEmployeeGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((emp) => {
          const stats = calculateEmployeeAttendanceStats(emp, attendance);
          const isCurrentUserCard = isSameEmployee(emp.name, employeeName);
          return (
            <div 
              key={emp.id} 
              onClick={() => handleEmployeeClick(emp.name)}
              className={`bg-canvas-surface p-5 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                isCurrentUserCard ? 'border-primary/50 ring-1 ring-primary/20' : 'border-canvas-variant hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-base mr-3 group-hover:scale-105 transition-transform shrink-0">
                      {emp.name.trim().charAt(0)}
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1">
                        <h3 className="font-semibold text-secondary-dark text-sm leading-tight truncate">{emp.name.trim()}</h3>
                        {isCurrentUserCard && (
                          <span className="text-[10px] bg-primary/10 text-primary-dark px-1.5 py-0.2 rounded font-bold shrink-0">You</span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-light truncate">{emp.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    emp.status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-canvas-variant text-secondary-light'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                {/* Quick Attendance Highlights Card */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-canvas/60 border border-canvas-variant/50 text-[11px]">
                  <div>
                    <span className="text-secondary-light block text-[10px] uppercase font-semibold">Join Date (1st Att)</span>
                    <span className="font-medium text-secondary-dark">{stats.firstAttendanceDate}</span>
                  </div>
                  <div>
                    <span className="text-secondary-light block text-[10px] uppercase font-semibold">Last 30 Days</span>
                    <span className="font-bold text-green-700">
                      {stats.last30Days.effectiveAttendanceCount} / 30d
                      <span className="text-[10px] font-normal text-secondary-light ml-1">({stats.last30Days.attendanceRate})</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-light block text-[10px] uppercase font-semibold">Absents / Halfs</span>
                    <span className="font-medium text-secondary-dark">
                      <span className={stats.last30Days.absentCount > 0 ? "text-danger font-semibold" : ""}>
                        {stats.last30Days.absentCount} Absent
                      </span> • {stats.last30Days.halfDaysCount} Half
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-light block text-[10px] uppercase font-semibold">All Time So Far</span>
                    <span className="font-bold text-primary">
                      {stats.allTime.attendanceRatio}
                      <span className="text-[10px] font-normal text-secondary-light ml-1">({stats.allTime.attendanceRate})</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-canvas-variant mt-2">
                <span className="text-xs text-secondary flex items-center group-hover:text-primary transition-colors">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-secondary-light group-hover:text-primary" />
                  Manage Calendar
                </span>
                
                {/* Dedicated Download Button for Specific Member */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2.5 text-xs border-canvas-variant hover:border-primary/50 hover:bg-primary/5 text-primary font-semibold transition-all shadow-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMemberReceipt(emp);
                  }}
                  title={`Download ${emp.name.trim()}'s Attendance Receipt`}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Receipt
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Calendar for a specific employee
  const renderCalendar = (targetEmpName?: string | null, isReadOnly: boolean = false) => {
    const empToUse = targetEmpName || selectedEmployee;
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const cells = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isSunday = getDay(cloneDay) === 0;

        // Hide other month dates - empty placeholder slot
        if (!isCurrentMonth) {
          cells.push(
            <div
              key={cloneDay.toISOString()}
              className={`h-[120px] border-b border-r border-canvas-variant ${isSunday ? 'bg-neutral-950/20' : 'bg-canvas/30'} pointer-events-none`}
            />
          );
          day = addDays(day, 1);
          continue;
        }

        const formattedDate = format(cloneDay, dateFormat);
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        
        const record = getEmployeeAttendance(dateKey, empToUse);
        
        let bgColorClass = "";
        let dateColorClass = "text-secondary-dark";

        if (isSunday) {
          bgColorClass = "bg-neutral-950 text-white hover:bg-neutral-900 border-neutral-800";
          dateColorClass = "text-white font-bold";
        } else if (record) {
          if (record.status === 'Present') {
            bgColorClass = "bg-green-500/10 text-green-800 hover:bg-green-500/20";
            dateColorClass = "text-green-700 font-bold";
          } else if (record.status === 'Absent') {
            bgColorClass = "bg-danger/15 text-danger border-danger/30 hover:bg-danger/25";
            dateColorClass = "text-danger font-bold";
          } else if (record.status === 'Half-Day') {
            bgColorClass = "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20";
            dateColorClass = "text-warning font-bold";
          }
        } else if (isSameDay(cloneDay, new Date())) {
          bgColorClass = "bg-primary/5 text-primary-dark hover:bg-canvas-variant/30";
          dateColorClass = "text-primary-dark font-bold";
        } else {
          bgColorClass = "bg-canvas-surface text-secondary-dark hover:bg-canvas-variant/30";
        }

        const isToday = isSameDay(cloneDay, new Date());

        cells.push(
          <div
            className={`h-[120px] flex flex-col p-2 border-b border-r border-canvas-variant cursor-pointer transition-colors overflow-hidden select-none ${bgColorClass}`}
            key={cloneDay.toISOString()}
            onClick={() => onDateClick(cloneDay, empToUse || '', isReadOnly)}
          >
            <div className="flex justify-between items-start flex-shrink-0 mb-1">
              <span className={`text-xs font-semibold ${isToday ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-sm' : dateColorClass}`}>
                {formattedDate}
              </span>
              {record && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  record.status === 'Present' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/70' :
                  record.status === 'Absent' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/70' :
                  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/70'
                }`}>
                  {record.status}
                </span>
              )}
            </div>
            
            {record && record.status !== 'Absent' && (
              <div className="mt-auto pt-1">
                <div className={`text-[10px] flex items-center ${isSunday ? 'text-neutral-300' : 'text-secondary-dark'}`}>
                  <Clock className="w-3 h-3 mr-1 inline opacity-70" />
                  {record.arrival || '--'} - {record.departure || '--'}
                </div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
    }

    return (
      <div className="w-full mt-4">
        <div className="flex justify-between items-center py-4 bg-canvas-surface px-6 rounded-t-lg border border-canvas-variant border-b-0">
          <h2 className="text-xl font-bold font-display text-secondary-dark">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button variant="secondary" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 bg-canvas-surface border-l border-r border-canvas-variant">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
            <div 
              key={d} 
              className={`text-center font-bold text-xs uppercase tracking-wider py-3 border-b border-r last:border-r-0 border-canvas-variant ${
                index === 0 
                  ? 'bg-neutral-950 text-white font-black' 
                  : 'text-secondary-light'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-canvas-surface border-l border-canvas-variant rounded-b-lg overflow-hidden border-b">
          {cells}
        </div>
      </div>
    );
  };

  // Dedicated Employee View: Personal Attendance Hub
  const renderPersonalAttendanceHub = () => {
    if (!myEmployeeObj) {
      return (
        <div className="bg-canvas-surface p-8 rounded-xl border border-canvas-variant text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-secondary-dark font-medium">No employee profile linked to your account.</p>
          <p className="text-secondary-light text-sm mt-1">
            Please ask an administrator to assign your email ({employeeName}) to your profile in HRMS.
          </p>
        </div>
      );
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todaysRecord = getEmployeeAttendance(todayStr, myEmployeeObj.name);

    return (
      <div className="space-y-6">
        {/* Today's Punch Card */}
        <div className="bg-gradient-to-r from-canvas-surface via-canvas-surface to-primary/5 p-6 rounded-2xl border border-canvas-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-primary tracking-wider">Today's Attendance</span>
              <span className="text-xs text-secondary-light">•</span>
              <span className="text-xs text-secondary-light font-medium">{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <h2 className="text-xl font-bold font-display text-secondary-dark">
              {todaysRecord ? (
                <span>Today's Status: <strong className={
                  todaysRecord.status === 'Present' ? 'text-green-700' :
                  todaysRecord.status === 'Absent' ? 'text-danger' : 'text-warning'
                }>{todaysRecord.status}</strong></span>
              ) : (
                <span>Not clocked in yet today</span>
              )}
            </h2>
            <p className="text-xs text-secondary-light">
              {todaysRecord ? (
                `Arrival Time: ${todaysRecord.arrival || '--:--'} | Departure Time: ${todaysRecord.departure || '--:--'}`
              ) : (
                'Clock in when starting work today. Your arrival timestamp will be recorded automatically.'
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {!todaysRecord && (
              <Button size="lg" className="shadow-level-1 font-semibold px-6" onClick={() => clockIn(myEmployeeObj.name)}>
                <Clock className="w-5 h-5 mr-2" />
                Clock In
              </Button>
            )}
            {todaysRecord && !todaysRecord.isFinalized && (
              <Button size="lg" variant="secondary" className="shadow-level-1 font-semibold border-primary/40 text-primary hover:bg-primary hover:text-white px-6" onClick={() => clockOut(myEmployeeObj.name)}>
                <Clock className="w-5 h-5 mr-2" />
                Clock Out
              </Button>
            )}
            {todaysRecord?.isFinalized && (
              <Badge variant="success" className="px-3.5 py-1.5 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" /> Attendance Finalized
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Highlights Metric Ribbon */}
        {myStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-canvas-surface border border-canvas-variant shadow-sm">
              <span className="text-xs font-semibold uppercase text-secondary-light tracking-wider block">First Attendance Date</span>
              <span className="text-lg font-bold text-secondary-dark mt-1 block">{myStats.firstAttendanceDate}</span>
              <span className="text-[11px] text-secondary-light block mt-0.5">{myStats.totalDaysSinceJoining} total calendar days</span>
            </div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 shadow-sm">
              <span className="text-xs font-semibold uppercase text-green-700 tracking-wider block">Last 30 Days (Sundays In)</span>
              <span className="text-lg font-bold text-green-800 mt-1 block">
                {myStats.last30Days.effectiveAttendanceCount} / 30 Days
                <span className="text-xs font-normal text-green-600 ml-1.5">({myStats.last30Days.attendanceRate})</span>
              </span>
              <span className="text-[11px] text-green-700 block mt-0.5">P: {myStats.last30Days.presentCount} | S: {myStats.last30Days.sundaysCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-canvas-surface border border-canvas-variant shadow-sm">
              <span className="text-xs font-semibold uppercase text-secondary-light tracking-wider block">Absents & Half-Days</span>
              <span className="text-lg font-bold text-secondary-dark mt-1 block">
                <span className={myStats.last30Days.absentCount > 0 ? "text-danger font-semibold" : ""}>{myStats.last30Days.absentCount} Absent</span>
                <span className="text-secondary-light text-xs font-normal mx-1">•</span>
                <span>{myStats.last30Days.halfDaysCount} Half</span>
              </span>
              <span className="text-[11px] text-secondary-light block mt-0.5">In previous 30 calendar days</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-sm">
              <span className="text-xs font-semibold uppercase text-primary tracking-wider block">All Attendance So Far</span>
              <span className="text-lg font-bold text-primary-dark mt-1 block">
                {myStats.allTime.attendanceRatio} Days
                <span className="text-xs font-normal text-primary/80 ml-1.5">({myStats.allTime.attendanceRate})</span>
              </span>
              <span className="text-[11px] text-primary/80 block mt-0.5">(Present + Sundays) / Total</span>
            </div>
          </div>
        )}

        {/* Receipt Quick Action Bar */}
        {myStats && (
          <div className="p-4 rounded-xl bg-canvas-surface border border-canvas-variant shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-semibold text-secondary-dark text-sm">Download My Official Attendance Statement</h4>
              <p className="text-xs text-secondary-light">Digitally authenticated attendance statement for your records.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={() => handleDownloadMemberHTML(myStats)}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                HTML Slip
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handlePrintMemberReceipt(myStats)}>
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print / PDF
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleDownloadMemberCSV(myStats)}>
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                CSV Report
              </Button>
            </div>
          </div>
        )}

        {/* Embedded Monthly Calendar */}
        <div className="bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm overflow-hidden p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-base text-secondary-dark">My Monthly Calendar</h3>
              <p className="text-xs text-secondary-light">Click any calendar cell to view full recorded timestamps.</p>
            </div>
          </div>
          {renderCalendar(myEmployeeObj.name, true)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">
              {isEmployee ? 'My Attendance' : 'Attendance Tracking'}
            </h1>
            <Badge variant="default" className="bg-primary/10 text-primary-dark border-primary/20">
              {isEmployee ? (myEmployeeObj?.role || 'Employee') : 'Admin Roster'}
            </Badge>
          </div>
          <p className="text-secondary-light text-sm mt-1">
            {isEmployee ? (
              <span>Logged in as <strong className="text-secondary-dark">{myEmployeeObj?.name.trim() || employeeName}</strong>. You can only clock in/out for your own account and review your personal records.</span>
            ) : (
              'Manage team attendance, compute working hours, and download attendance verification receipts.'
            )}
          </p>
        </div>

        {/* Admin Bulk Action Buttons */}
        {isAdmin && (
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsDownloadAllModalOpen(true)}
              className="border-primary/40 text-primary font-semibold hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Everyone's Attendance
            </Button>

            <Button onClick={() => {
              markAbsences(format(new Date(), 'yyyy-MM-dd'));
              alert('Absences marked for today for all missing clock-ins.');
            }}>
              <UserCheck className="h-4 w-4 mr-2" />
              Mark Absences (Today)
            </Button>
          </div>
        )}
      </div>

      {/* Main Content: Personal Hub for Employee, Team Grid for Admin */}
      {isEmployee ? renderPersonalAttendanceHub() : renderEmployeeGrid()}

      {/* Main Calendar Modal for Selected Employee (Admin only) */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        title={`${selectedEmployee?.trim()}'s Attendance`}
        className="max-w-5xl"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 pb-4 border-b border-canvas-variant">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-lg">
                {selectedEmployee?.trim().charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-secondary-dark leading-tight">{selectedEmployee?.trim()}</h3>
                <p className="text-sm text-secondary-light">{selectedEmpObj?.role || 'Team Member'} • Attendance Log & Hours</p>
              </div>
            </div>

            {/* Individual Member Download Button in Modal */}
            {selectedEmpObj && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenMemberReceipt(selectedEmpObj)}
                  className="border-primary/40 text-primary hover:bg-primary hover:text-white font-semibold shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Attendance Receipt
                </Button>
              </div>
            )}
          </div>

          {/* Detailed Attendance Metric Ribbon in Calendar Modal */}
          {selectedStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-canvas border border-canvas-variant">
                <span className="text-[10px] uppercase font-bold text-secondary-light block">1st Attendance (Join Date)</span>
                <span className="text-sm font-bold text-primary-dark block mt-0.5">{selectedStats.firstAttendanceDate}</span>
                <span className="text-[10px] text-secondary-light block mt-0.5">{selectedStats.totalDaysSinceJoining} total calendar days</span>
              </div>
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <span className="text-[10px] uppercase font-bold text-green-700 block">Last 30 Days (Sundays In)</span>
                <span className="text-sm font-bold text-green-800 block mt-0.5">
                  {selectedStats.last30Days.effectiveAttendanceCount} / 30 Days
                  <span className="text-xs font-normal text-green-600 ml-1">({selectedStats.last30Days.attendanceRate})</span>
                </span>
                <span className="text-[10px] text-green-700 block mt-0.5">P: {selectedStats.last30Days.presentCount} | S: {selectedStats.last30Days.sundaysCount} | H: {selectedStats.last30Days.halfDaysCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-canvas-variant">
                <span className="text-[10px] uppercase font-bold text-secondary-light block">Absent & Half Days</span>
                <span className="text-sm font-bold text-secondary-dark block mt-0.5">
                  <span className={selectedStats.last30Days.absentCount > 0 ? "text-danger font-bold" : ""}>
                    {selectedStats.last30Days.absentCount} Absent
                  </span> • {selectedStats.last30Days.halfDaysCount} Half
                </span>
                <span className="text-[10px] text-secondary-light block mt-0.5">In previous 30 calendar days</span>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-[10px] uppercase font-bold text-primary block">All Attendance So Far</span>
                <span className="text-sm font-bold text-primary-dark block mt-0.5">
                  {selectedStats.allTime.attendanceRatio} Days
                  <span className="text-xs font-normal text-primary/80 ml-1">({selectedStats.allTime.attendanceRate})</span>
                </span>
                <span className="text-[10px] text-primary/80 block mt-0.5">(Present + Sundays) / Total Days</span>
              </div>
            </div>
          )}

          {(() => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const todaysRecord = getEmployeeAttendance(todayStr, selectedEmployee);
            return (
              <div className="flex justify-between items-center bg-canvas p-4 rounded-lg border border-canvas-variant mb-6 shadow-sm">
                <div>
                  <p className="font-semibold text-secondary-dark mb-1">Today's Activity</p>
                  <p className="text-sm text-secondary-light">
                    {todaysRecord ? `Status: ${todaysRecord.status} | Arrival: ${todaysRecord.arrival || '--'} | Departure: ${todaysRecord.departure || '--'}` : 'Not clocked in yet'}
                  </p>
                </div>
                <div className="flex space-x-2 items-center">
                  {!todaysRecord && selectedEmployee && (
                    <Button onClick={() => clockIn(selectedEmployee)}>
                      <Clock className="w-4 h-4 mr-2" />
                      Clock In
                    </Button>
                  )}
                  {todaysRecord && !todaysRecord.isFinalized && selectedEmployee && (
                    <Button variant="secondary" onClick={() => clockOut(selectedEmployee)}>
                      <Clock className="w-4 h-4 mr-2" />
                      Clock Out
                    </Button>
                  )}
                  {todaysRecord?.isFinalized && (
                    <Badge variant="success">Finalized</Badge>
                  )}
                </div>
              </div>
            );
          })()}

          {renderCalendar(selectedEmployee, false)}
        </div>
      </Modal>

      {/* Read-Only Day Detail Modal for Employee */}
      <Modal
        isOpen={!!readOnlyDayDetail}
        onClose={() => setReadOnlyDayDetail(null)}
        title={`Attendance: ${readOnlyDayDetail ? format(readOnlyDayDetail.date, 'EEEE, MMM do, yyyy') : ''}`}
      >
        {readOnlyDayDetail && (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl bg-canvas border border-canvas-variant space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-secondary-light">Status</span>
                {readOnlyDayDetail.record ? (
                  <Badge variant={
                    readOnlyDayDetail.record.status === 'Present' ? 'success' :
                    readOnlyDayDetail.record.status === 'Absent' ? 'destructive' : 'warning'
                  }>
                    {readOnlyDayDetail.record.status}
                  </Badge>
                ) : (
                  <span className="text-xs text-secondary-light font-medium">No record logged</span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-light">Arrival Time</span>
                <span className="font-semibold text-secondary-dark">
                  {readOnlyDayDetail.record?.arrival || '--:--'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-light">Departure Time</span>
                <span className="font-semibold text-secondary-dark">
                  {readOnlyDayDetail.record?.departure || '--:--'}
                </span>
              </div>
              {readOnlyDayDetail.record?.isFinalized && (
                <div className="pt-2 border-t border-canvas-variant text-xs text-green-700 flex items-center font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> This record is finalized.
                </div>
              )}
            </div>

            <p className="text-xs text-secondary-light italic">
              Attendance records are permanently timestamped. For manual retroactive adjustments, please contact an HR Administrator.
            </p>

            <div className="flex justify-end pt-2 border-t border-canvas-variant">
              <Button variant="secondary" onClick={() => setReadOnlyDayDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Individual Employee Attendance Receipt Modal */}
      <Modal
        isOpen={isMemberReceiptModalOpen}
        onClose={() => setIsMemberReceiptModalOpen(false)}
        title={`Attendance Receipt: ${selectedMemberStats?.employeeName}`}
        className="max-w-4xl"
      >
        {selectedMemberStats && (
          <div className="max-h-[80vh] overflow-y-auto pr-2 pb-2 space-y-6">
            {/* Action Bar with 3 Functionable Download Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div>
                <h4 className="font-bold text-secondary-dark text-base">Verified Attendance Slip</h4>
                <p className="text-xs text-secondary-light">
                  Generated for {selectedMemberStats.employeeName} ({selectedMemberStats.role})
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleDownloadMemberHTML(selectedMemberStats)}
                  className="font-semibold shadow-sm"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download HTML Receipt
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handlePrintMemberReceipt(selectedMemberStats)}
                  className="font-semibold"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print / Save PDF
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleDownloadMemberCSV(selectedMemberStats)}
                  className="font-semibold"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                  Download CSV
                </Button>
              </div>
            </div>

            {/* Receipt Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm">
                <span className="text-xs font-bold text-secondary-light uppercase tracking-wider block">First Attendance Date</span>
                <span className="text-lg font-extrabold text-primary-dark mt-1 block">
                  {selectedMemberStats.firstAttendanceDate}
                </span>
                <span className="text-xs text-secondary-light mt-0.5 block">Official Start Day</span>
              </div>
              <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20 shadow-sm">
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider block">Last 30 Days (Sundays In)</span>
                <span className="text-lg font-extrabold text-green-800 mt-1 block">
                  {selectedMemberStats.last30Days.effectiveAttendanceCount} / 30 Days
                </span>
                <span className="text-xs text-green-700 mt-0.5 block font-medium">
                  {selectedMemberStats.last30Days.attendanceRate} Presence Rate
                </span>
              </div>
              <div className="p-4 bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm">
                <span className="text-xs font-bold text-secondary-light uppercase tracking-wider block">Absents & Half-Days</span>
                <span className="text-lg font-extrabold text-secondary-dark mt-1 block">
                  <span className={selectedMemberStats.last30Days.absentCount > 0 ? "text-danger" : ""}>
                    {selectedMemberStats.last30Days.absentCount} Absent
                  </span>
                  <span className="text-secondary-light text-sm font-normal mx-1">•</span>
                  <span>{selectedMemberStats.last30Days.halfDaysCount} Half</span>
                </span>
                <span className="text-xs text-secondary-light mt-0.5 block">Last 30 calendar days</span>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 shadow-sm">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">All Attendance So Far</span>
                <span className="text-lg font-extrabold text-primary-dark mt-1 block">
                  {selectedMemberStats.allTime.attendanceRatio} Days
                </span>
                <span className="text-xs text-primary/80 mt-0.5 block font-medium">
                  {selectedMemberStats.allTime.attendanceRate} Total Ratio
                </span>
              </div>
            </div>

            {/* Attendance Ledger Table */}
            <div className="bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-canvas border-b border-canvas-variant flex justify-between items-center">
                <h5 className="font-bold text-secondary-dark text-sm">Full Attendance Record History</h5>
                <span className="text-xs text-secondary-light">{selectedMemberStats.dailyRecords.length} records on file</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-canvas/50 text-secondary-light uppercase font-semibold sticky top-0 border-b border-canvas-variant">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Day</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Check-In</th>
                      <th className="py-2.5 px-4">Check-Out</th>
                      <th className="py-2.5 px-4">Finalized</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-canvas-variant/60 font-medium">
                    {selectedMemberStats.dailyRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-canvas/40 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-secondary-dark">{r.date}</td>
                        <td className="py-2.5 px-4 text-secondary-light">{r.dayOfWeek}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            r.status === 'Present' ? 'bg-green-100 text-green-700' :
                            r.status === 'Absent' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-secondary-dark">{r.arrival}</td>
                        <td className="py-2.5 px-4 text-secondary-dark">{r.departure}</td>
                        <td className="py-2.5 px-4">
                          {r.isFinalized ? (
                            <span className="text-green-600 font-bold flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Yes
                            </span>
                          ) : (
                            <span className="text-secondary-light">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-canvas-variant">
              <Button variant="secondary" onClick={() => setIsMemberReceiptModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Master Download All Modal */}
      <Modal
        isOpen={isDownloadAllModalOpen}
        onClose={() => setIsDownloadAllModalOpen(false)}
        title="Download All Attendance Receipts (All Employees)"
        className="max-w-4xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div>
              <h4 className="font-bold text-secondary-dark text-base">Company-Wide Attendance Package</h4>
              <p className="text-xs text-secondary-light mt-0.5">
                Download verified attendance receipts for all active team members in one master file.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleDownloadAllHTML}
                className="font-semibold shadow-sm"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Master HTML Pack
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handlePrintAllReceipts}
                className="font-semibold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Master Pack
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleDownloadAllCSV}
                className="font-semibold"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Master CSV Export
              </Button>
            </div>
          </div>

          <div className="bg-canvas-surface rounded-xl border border-canvas-variant shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-canvas border-b border-canvas-variant">
              <h5 className="font-bold text-secondary-dark text-sm">Attendance Summary by Employee</h5>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas/50 text-secondary-light uppercase font-semibold border-b border-canvas-variant">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">First Date</th>
                    <th className="py-2.5 px-3">Last 30 Days (Sundays In)</th>
                    <th className="py-2.5 px-3">Absents</th>
                    <th className="py-2.5 px-3">Halfs</th>
                    <th className="py-2.5 px-3">All-Time Ratio</th>
                    <th className="py-2.5 px-3 text-right">Individual Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-variant font-medium">
                  {allEmployeeStats.map((s) => {
                    const emp = employees.find(e => isSameEmployee(e.name, s.employeeName));
                    return (
                      <tr key={s.employeeName} className="hover:bg-canvas/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-secondary-dark block">{s.employeeName}</span>
                          <span className="text-[10px] text-secondary-light">{s.role}</span>
                        </td>
                        <td className="py-2.5 px-3 text-secondary-dark">{s.firstAttendanceDate}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-green-800">{s.last30Days.effectiveAttendanceCount} / 30</span>
                          <span className="text-[10px] text-green-700 ml-1">({s.last30Days.attendanceRate})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={s.last30Days.absentCount > 0 ? "text-danger font-bold" : "text-secondary-light"}>
                            {s.last30Days.absentCount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-secondary-dark font-medium">{s.last30Days.halfDaysCount}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-primary">{s.allTime.attendanceRatio}</span>
                          <span className="text-[10px] text-secondary-light block">({s.allTime.attendanceRate})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                              onClick={() => {
                                if (emp) handleOpenMemberReceipt(emp);
                              }}
                              title="Preview Receipt"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-7 px-2 text-xs border-canvas-variant hover:border-primary/50 text-secondary-dark"
                              onClick={() => handleDownloadMemberHTML(s)}
                              title="Download HTML Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsDownloadAllModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal for Adding/Editing Attendance on a Specific Day (Admin only) */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={`Log Attendance: ${selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}`}
      >
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="enterprise-label">Status</label>
              <Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as AttendanceStatus})}
                options={[
                  { value: 'Present', label: 'Present' },
                  { value: 'Absent', label: 'Absent' },
                  { value: 'Half-Day', label: 'Half-Day' },
                ]}
              />
            </div>

            {formData.status !== 'Absent' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="enterprise-label">Arrival Time</label>
                  <Input 
                    type="time" 
                    value={formData.arrival} 
                    onChange={(e) => setFormData({...formData, arrival: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="enterprise-label">Departure Time</label>
                  <Input 
                    type="time" 
                    value={formData.departure} 
                    onChange={(e) => setFormData({...formData, departure: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAttendance}>Save Record</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
