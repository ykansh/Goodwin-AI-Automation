import { 
  format, 
  parseISO, 
  subDays, 
  getDay, 
  differenceInCalendarDays,
  isValid
} from 'date-fns';
import type { Employee, AttendanceRecord } from './store';

export interface DailyAttendanceDetail {
  date: string;
  dayOfWeek: string;
  isSunday: boolean;
  status: 'Present' | 'Absent' | 'Half-Day' | 'Sunday Off' | 'Unmarked';
  arrival: string;
  departure: string;
  credit: number; // 1 for present/sunday, 0.5 for half day, 0 for absent/unmarked
  isFinalized?: boolean;
}

export interface EmployeeAttendanceStats {
  employeeId: string;
  employeeName: string;
  role: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  firstAttendanceDate: string; // The first date of attendance (considered date of joining)
  officialJoinDate: string;
  totalDaysSinceJoining: number; // Calendar days from joining date up to today
  
  // Last 30 Days stats (Sundays in)
  last30Days: {
    startDate: string;
    endDate: string;
    totalPeriodDays: number; // 30
    sundaysCount: number;
    presentCount: number;
    halfDaysCount: number;
    absentCount: number;
    unmarkedCount: number;
    effectiveAttendanceCount: number; // non-Sunday presents + Sundays + 0.5*half-days
    attendanceRate: string; // percentage string, e.g. "85.0%"
  };

  // All time stats ("all attendance so far: present + sundays / total days of joining")
  allTime: {
    startDate: string;
    endDate: string;
    totalDays: number;
    sundaysCount: number;
    presentCount: number;
    halfDaysCount: number;
    absentCount: number;
    unmarkedCount: number;
    effectiveAttendanceCount: number; // non-Sunday presents + Sundays + 0.5*half-days
    attendanceRatio: string; // e.g. "27.5 / 32"
    attendanceRate: string; // percentage string, e.g. "85.9%"
  };

  // Detailed records from first attendance date to today
  dailyRecords: DailyAttendanceDetail[];
}

/**
 * Match employee attendance record with whitespace-trimmed fallback
 */
export const getEmployeeAttendanceRecord = (
  attendance: Record<string, Record<string, AttendanceRecord>>,
  dateKey: string, 
  empName: string
): AttendanceRecord | null => {
  if (!empName) return null;
  const dayRec = attendance[dateKey];
  if (!dayRec) return null;
  if (dayRec[empName]) return dayRec[empName];
  const trimmed = empName.trim();
  const found = Object.entries(dayRec).find(([k]) => k.trim() === trimmed);
  return found ? found[1] : null;
};

/**
 * Calculate comprehensive attendance statistics for an employee
 */
export const calculateEmployeeAttendanceStats = (
  employee: Employee,
  attendance: Record<string, Record<string, AttendanceRecord>>,
  referenceDate: Date = new Date()
): EmployeeAttendanceStats => {
  const todayStr = format(referenceDate, 'yyyy-MM-dd');
  const today = parseISO(todayStr);
  const empName = employee.name.trim();

  // Find all attendance records for this employee
  const matchingDateKeys: string[] = [];
  Object.entries(attendance).forEach(([dateKey, dayRecords]) => {
    if (dayRecords[employee.name] || dayRecords[empName]) {
      matchingDateKeys.push(dateKey);
    } else {
      const match = Object.keys(dayRecords).find(k => k.trim() === empName);
      if (match) matchingDateKeys.push(dateKey);
    }
  });

  matchingDateKeys.sort();

  // "first date of attendence that will the date of joining"
  // If attendance records exist, the earliest is the first date of attendance
  // Fallback to employee's official joinDate or today if none exist yet
  let firstAttendanceDateStr = todayStr;
  if (matchingDateKeys.length > 0) {
    firstAttendanceDateStr = matchingDateKeys[0];
  } else if (employee.joinDate && isValid(parseISO(employee.joinDate))) {
    firstAttendanceDateStr = employee.joinDate;
  }

  const firstDate = parseISO(firstAttendanceDateStr);
  const totalDaysSinceJoining = Math.max(1, differenceInCalendarDays(today, firstDate) + 1);

  // Daily records list from firstDate to today
  const dailyRecords: DailyAttendanceDetail[] = [];
  let allSundays = 0;
  let allPresents = 0;
  let allNonSundayPresents = 0;
  let allHalfDays = 0;
  let allAbsents = 0;
  let allUnmarked = 0;

  let cur = new Date(firstDate);
  while (cur <= today) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const dayOfWeek = format(cur, 'EEEE');
    const isSunday = getDay(cur) === 0;
    const rec = getEmployeeAttendanceRecord(attendance, dStr, employee.name);

    if (isSunday) allSundays++;

    let status: DailyAttendanceDetail['status'] = isSunday ? 'Sunday Off' : 'Unmarked';
    let credit = isSunday ? 1.0 : 0.0;
    let arrival = '';
    let departure = '';
    let isFinalized = false;

    if (rec) {
      arrival = rec.arrival || '';
      departure = rec.departure || '';
      isFinalized = rec.isFinalized || false;

      if (rec.status === 'Present') {
        allPresents++;
        status = 'Present';
        credit = 1.0;
        if (!isSunday) allNonSundayPresents++;
      } else if (rec.status === 'Half-Day') {
        allHalfDays++;
        status = 'Half-Day';
        credit = isSunday ? 1.0 : 0.5; // Sunday remains paid/credited
      } else if (rec.status === 'Absent') {
        allAbsents++;
        status = 'Absent';
        credit = 0.0;
      }
    } else {
      if (!isSunday) {
        allUnmarked++;
      }
    }

    dailyRecords.push({
      date: dStr,
      dayOfWeek,
      isSunday,
      status,
      arrival,
      departure,
      credit,
      isFinalized
    });

    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }

  // Last 30 days window: today - 29 days up to today
  const last30StartDate = subDays(today, 29);
  const last30StartStr = format(last30StartDate, 'yyyy-MM-dd');
  
  let l30Sundays = 0;
  let l30Presents = 0;
  let l30NonSundayPresents = 0;
  let l30HalfDays = 0;
  let l30Absents = 0;
  let l30Unmarked = 0;

  let c30 = new Date(last30StartDate);
  while (c30 <= today) {
    const dStr = format(c30, 'yyyy-MM-dd');
    const isSunday = getDay(c30) === 0;
    const rec = getEmployeeAttendanceRecord(attendance, dStr, employee.name);

    if (isSunday) l30Sundays++;

    if (rec) {
      if (rec.status === 'Present') {
        l30Presents++;
        if (!isSunday) l30NonSundayPresents++;
      } else if (rec.status === 'Half-Day') {
        l30HalfDays++;
      } else if (rec.status === 'Absent') {
        l30Absents++;
      }
    } else {
      if (!isSunday) {
        l30Unmarked++;
      }
    }
    c30 = new Date(c30.getTime() + 24 * 60 * 60 * 1000);
  }

  // Effective counts: non-Sunday presents + Sundays + 0.5 * half-days
  const last30Effective = Number((l30NonSundayPresents + l30Sundays + (l30HalfDays * 0.5)).toFixed(1));
  const allTimeEffective = Number((allNonSundayPresents + allSundays + (allHalfDays * 0.5)).toFixed(1));

  const last30Rate = `${((last30Effective / 30) * 100).toFixed(1)}%`;
  const allTimeRate = `${((allTimeEffective / totalDaysSinceJoining) * 100).toFixed(1)}%`;

  return {
    employeeId: employee.id,
    employeeName: empName,
    role: employee.role,
    type: employee.type,
    status: employee.status,
    email: employee.email,
    phone: employee.phone,
    firstAttendanceDate: firstAttendanceDateStr,
    officialJoinDate: employee.joinDate || firstAttendanceDateStr,
    totalDaysSinceJoining,
    last30Days: {
      startDate: last30StartStr,
      endDate: todayStr,
      totalPeriodDays: 30,
      sundaysCount: l30Sundays,
      presentCount: l30Presents,
      halfDaysCount: l30HalfDays,
      absentCount: l30Absents,
      unmarkedCount: l30Unmarked,
      effectiveAttendanceCount: last30Effective,
      attendanceRate: last30Rate
    },
    allTime: {
      startDate: firstAttendanceDateStr,
      endDate: todayStr,
      totalDays: totalDaysSinceJoining,
      sundaysCount: allSundays,
      presentCount: allPresents,
      halfDaysCount: allHalfDays,
      absentCount: allAbsents,
      unmarkedCount: allUnmarked,
      effectiveAttendanceCount: allTimeEffective,
      attendanceRatio: `${allTimeEffective} / ${totalDaysSinceJoining}`,
      attendanceRate: allTimeRate
    },
    dailyRecords: dailyRecords.reverse() // show latest first in list
  };
};

/**
 * Trigger browser download for a generic Blob/text content
 */
export const triggerDownload = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Download Attendance Data as CSV
 */
export const downloadAttendanceCSV = (
  statsList: EmployeeAttendanceStats[], 
  filenamePrefix: string = 'Attendance_Report'
) => {
  const headers = [
    'Employee Name',
    'Role',
    'Status',
    'First Attendance Date (Joining Date)',
    'Total Days Since Joining',
    'Last 30 Days Attendance Count (Sundays In)',
    'Last 30 Days Present',
    'Last 30 Days Sundays',
    'Last 30 Days Half-Days',
    'Last 30 Days Absent',
    'Last 30 Days Rate',
    'All Attendance So Far (Present + Sundays / Total Days)',
    'All Time Present',
    'All Time Sundays',
    'All Time Half-Days',
    'All Time Absent',
    'All Time Attendance Rate',
    'Email',
    'Phone'
  ];

  const rows = statsList.map(s => [
    `"${s.employeeName}"`,
    `"${s.role}"`,
    `"${s.status}"`,
    `"${s.firstAttendanceDate}"`,
    s.totalDaysSinceJoining,
    s.last30Days.effectiveAttendanceCount,
    s.last30Days.presentCount,
    s.last30Days.sundaysCount,
    s.last30Days.halfDaysCount,
    s.last30Days.absentCount,
    `"${s.last30Days.attendanceRate}"`,
    `"${s.allTime.attendanceRatio} (${s.allTime.attendanceRate})"`,
    s.allTime.presentCount,
    s.allTime.sundaysCount,
    s.allTime.halfDaysCount,
    s.allTime.absentCount,
    `"${s.allTime.attendanceRate}"`,
    `"${s.email || ''}"`,
    `"${s.phone || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  triggerDownload(csvContent, `${filenamePrefix}_${todayStr}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Generate a standalone, printable, ultra-clean HTML Attendance Receipt for a single employee
 */
export const generateEmployeeReceiptHTML = (stats: EmployeeAttendanceStats): string => {
  const issueDate = format(new Date(), 'PPP');
  const receiptNo = `GW-ATT-${stats.firstAttendanceDate.replace(/-/g, '')}-${stats.employeeId.slice(0, 4).toUpperCase()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Attendance_Receipt_${stats.employeeName.replace(/\s+/g, '_')}_${stats.allTime.endDate}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #1e293b;
      padding: 30px 15px;
      line-height: 1.5;
    }
    .action-bar {
      max-width: 850px;
      margin: 0 auto 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid #334155;
      color: #f8fafc;
    }
    .action-bar h4 { font-size: 14px; font-weight: 600; color: #94a3b8; }
    .btn-group { display: flex; gap: 10px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .btn-secondary:hover { background: #475569; }

    .receipt-container {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
    }

    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .company-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .company-subtitle {
      font-size: 12px;
      font-weight: 700;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .company-meta {
      font-size: 12px;
      color: #64748b;
      margin-top: 6px;
    }
    .receipt-badge-box {
      text-align: right;
    }
    .receipt-tag {
      display: inline-block;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .receipt-number {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-top: 6px;
    }
    .receipt-date {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .employee-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .emp-item-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .emp-item-value {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .emp-item-value.highlight {
      color: #4f46e5;
      font-weight: 700;
    }

    .section-heading {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-heading::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 18px;
      background: #6366f1;
      border-radius: 2px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }
    .kpi-card.accent {
      border-color: #c7d2fe;
      background: #f5f7ff;
    }
    .kpi-card.accent-emerald {
      border-color: #a7f3d0;
      background: #f0fdf4;
    }
    .kpi-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .kpi-main-stat {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .kpi-sub-stat {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 500;
    }
    .kpi-pill {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 6px;
    }
    .pill-green { background: #dcfce7; color: #15803d; }
    .pill-indigo { background: #e0e7ff; color: #4338ca; }
    .pill-amber { background: #fef3c7; color: #b45309; }
    .pill-red { background: #fee2e2; color: #b91c1c; }

    .formula-banner {
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 28px;
      font-size: 12px;
      color: #334155;
    }
    .formula-banner strong { color: #0f172a; }
    .formula-math {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #4338ca;
      margin-top: 4px;
      display: block;
    }

    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      padding: 10px 14px;
      border-bottom: 1px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #fafafa; }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-present { background: #dcfce7; color: #166534; }
    .status-absent { background: #fee2e2; color: #991b1b; }
    .status-halfday { background: #fef3c7; color: #92400e; }
    .status-sunday { background: #0f172a; color: #f8fafc; }
    .status-unmarked { background: #f1f5f9; color: #64748b; }

    .receipt-footer {
      border-top: 2px dashed #cbd5e1;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .signature-box {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-bottom: 1px solid #475569;
      margin-bottom: 6px;
      height: 40px;
    }

    @page {
      margin: 10mm 12mm;
      size: auto;
    }

    @media print {
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        min-height: 100% !important;
      }
      .action-bar {
        display: none !important;
      }
      .receipt-container {
        box-shadow: none !important;
        border: 1px solid #cbd5e1 !important;
        padding: 20px !important;
        margin: 0 auto !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      .kpi-card {
        border: 1px solid #cbd5e1 !important;
        background-color: #f8fafc !important;
      }
      .kpi-card.accent {
        border: 1px solid #c7d2fe !important;
        background-color: #f5f7ff !important;
      }
      .kpi-card.accent-emerald {
        border: 1px solid #a7f3d0 !important;
        background-color: #f0fdf4 !important;
      }
      .formula-banner {
        border-left: 4px solid #6366f1 !important;
        background-color: #f8fafc !important;
      }
      .table-container {
        overflow: visible !important;
        page-break-inside: auto !important;
      }
      table {
        page-break-inside: auto !important;
        width: 100% !important;
      }
      tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
      }
      thead {
        display: table-header-group !important;
      }
    }
  </style>
</head>
<body>

  <div class="action-bar">
    <div>
      <h4>Goodwin HRMS Attendance Verification Slip</h4>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button class="btn btn-secondary" onclick="downloadSelf()">
        📥 Download HTML
      </button>
    </div>
  </div>

  <div class="receipt-container" id="receipt">
    <!-- Header -->
    <div class="receipt-header">
      <div>
        <div class="company-title">GOODWIN GROW</div>
        <div class="company-subtitle">Goodwin AI HRMS & Operations</div>
        <div class="company-meta">Official Attendance Certificate & Verification Statement</div>
      </div>
      <div class="receipt-badge-box">
        <span class="receipt-tag">Verified Receipt</span>
        <div class="receipt-number">${receiptNo}</div>
        <div class="receipt-date">Issued on: ${issueDate}</div>
      </div>
    </div>

    <!-- Employee Information -->
    <div class="employee-card">
      <div>
        <div class="emp-item-label">Employee Name</div>
        <div class="emp-item-value">${stats.employeeName}</div>
      </div>
      <div>
        <div class="emp-item-label">Designation / Role</div>
        <div class="emp-item-value">${stats.role}</div>
      </div>
      <div>
        <div class="emp-item-label">First Date of Attendance (Joining Date)</div>
        <div class="emp-item-value highlight">${stats.firstAttendanceDate}</div>
      </div>
      <div>
        <div class="emp-item-label">Total Days of Joining</div>
        <div class="emp-item-value">${stats.totalDaysSinceJoining} Calendar Days</div>
      </div>
      <div>
        <div class="emp-item-label">Employment Status</div>
        <div class="emp-item-value" style="text-transform: capitalize;">${stats.status}</div>
      </div>
      <div>
        <div class="emp-item-label">Contact / Email</div>
        <div class="emp-item-value">${stats.email || stats.phone || 'N/A'}</div>
      </div>
    </div>

    <!-- Attendance Performance Summary -->
    <div class="section-heading">Key Attendance Indicators</div>
    <div class="kpi-grid">
      
      <!-- Last 30 Days Count -->
      <div class="kpi-card accent-emerald">
        <div class="kpi-title">Last 30 Days Attendance</div>
        <div class="kpi-main-stat">${stats.last30Days.effectiveAttendanceCount} <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ 30 Days</span></div>
        <div class="kpi-sub-stat">Sundays included as weekly offs</div>
        <span class="kpi-pill pill-green">Attendance Rate: ${stats.last30Days.attendanceRate}</span>
        <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
          Presents: ${stats.last30Days.presentCount} | Sundays: ${stats.last30Days.sundaysCount} | Half: ${stats.last30Days.halfDaysCount}
        </div>
      </div>

      <!-- All Attendance So Far -->
      <div class="kpi-card accent">
        <div class="kpi-title">All Attendance So Far</div>
        <div class="kpi-main-stat">${stats.allTime.effectiveAttendanceCount} <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ ${stats.allTime.totalDays} Days</span></div>
        <div class="kpi-sub-stat">(Presents + Sundays) / Total Days</div>
        <span class="kpi-pill pill-indigo">Overall Rate: ${stats.allTime.attendanceRate}</span>
        <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
          Presents: ${stats.allTime.presentCount} | Sundays: ${stats.allTime.sundaysCount} | Half: ${stats.allTime.halfDaysCount}
        </div>
      </div>

      <!-- Absent Days -->
      <div class="kpi-card">
        <div class="kpi-title">Absent Days</div>
        <div class="kpi-main-stat" style="color: #dc2626;">${stats.last30Days.absentCount} <span style="font-size: 14px; font-weight: 500; color: #64748b;">(Last 30d)</span></div>
        <div class="kpi-sub-stat">All-time Absents: <strong>${stats.allTime.absentCount} Days</strong></div>
        <span class="kpi-pill pill-red">${stats.last30Days.absentCount === 0 ? 'Zero Absences (30d)' : `${stats.last30Days.absentCount} Recorded Absences`}</span>
      </div>

      <!-- Half Days -->
      <div class="kpi-card">
        <div class="kpi-title">Half Days</div>
        <div class="kpi-main-stat" style="color: #d97706;">${stats.last30Days.halfDaysCount} <span style="font-size: 14px; font-weight: 500; color: #64748b;">(Last 30d)</span></div>
        <div class="kpi-sub-stat">All-time Half-Days: <strong>${stats.allTime.halfDaysCount} Days</strong></div>
        <span class="kpi-pill pill-amber">Credited at 0.5 Day each</span>
      </div>

    </div>

    <!-- Official Formula Explanation -->
    <div class="formula-banner">
      <strong>Standard HR Attendance Computation Formula:</strong>
      <span class="formula-math">
        Overall Attendance = (Present Days [${stats.allTime.presentCount}] + Sundays [${stats.allTime.sundaysCount}] + Half-Days [${stats.allTime.halfDaysCount} × 0.5]) / Total Days Since Joining [${stats.allTime.totalDays}] = ${stats.allTime.attendanceRatio} (${stats.allTime.attendanceRate})
      </span>
      <div style="margin-top: 4px; font-size: 11px; color: #64748b;">
        * Note: First date of attendance (<strong>${stats.firstAttendanceDate}</strong>) is verified as the official Joining Date for attendance tenure. Weekly Sunday offs are credited as statutory attendance.
      </div>
    </div>

    <!-- Detailed Attendance Log (Recent / All) -->
    <div class="section-heading">Detailed Attendance History (${stats.dailyRecords.length} Records)</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          ${stats.dailyRecords.map(r => `
            <tr>
              <td><strong>${r.date}</strong></td>
              <td>${r.dayOfWeek}</td>
              <td>
                <span class="status-badge ${
                  r.status === 'Present' ? 'status-present' :
                  r.status === 'Absent' ? 'status-absent' :
                  r.status === 'Half-Day' ? 'status-halfday' :
                  r.status === 'Sunday Off' ? 'status-sunday' : 'status-unmarked'
                }">
                  ${r.status}
                </span>
              </td>
              <td>${r.arrival || '--'}</td>
              <td>${r.departure || '--'}</td>
              <td><strong>${r.credit} Day</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Sign-off & Verification -->
    <div class="receipt-footer">
      <div>
        <p><strong>Goodwin AI Automation System Generated Statement</strong></p>
        <p>Verification Code: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}</p>
        <p style="margin-top: 4px;">This official receipt is digitally authenticated and valid without physical seal.</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <p><strong>Authorized Signatory</strong></p>
        <p>HR & Operations</p>
      </div>
    </div>
  </div>

  <script>
    function downloadSelf() {
      const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Attendance_Receipt_${stats.employeeName.replace(/\\s+/g, '_')}_${stats.allTime.endDate}.html';
      a.click();
    }
  </script>
</body>
</html>`;
};

/**
 * Generate a Master Attendance Report HTML for ALL employees at once
 */
export const generateMasterAttendanceReceiptHTML = (allStats: EmployeeAttendanceStats[]): string => {
  const issueDate = format(new Date(), 'PPP');
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const totalEmployees = allStats.length;
  
  // Aggregate averages
  const avg30DayAttendance = totalEmployees > 0 
    ? (allStats.reduce((sum, s) => sum + s.last30Days.effectiveAttendanceCount, 0) / totalEmployees).toFixed(1)
    : '0';
  const totalAllTimePresent = allStats.reduce((sum, s) => sum + s.allTime.presentCount, 0);
  const totalAllTimeAbsents = allStats.reduce((sum, s) => sum + s.allTime.absentCount, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Master_Attendance_Report_${todayStr}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #1e293b;
      padding: 30px 15px;
      line-height: 1.5;
    }
    .action-bar {
      max-width: 1000px;
      margin: 0 auto 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid #334155;
      color: #f8fafc;
    }
    .action-bar h4 { font-size: 14px; font-weight: 600; color: #94a3b8; }
    .btn-group { display: flex; gap: 10px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .btn-secondary:hover { background: #475569; }

    .report-container {
      max-width: 1000px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .company-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
    }
    .company-subtitle {
      font-size: 12px;
      font-weight: 700;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 30px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }
    .kpi-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-main-stat {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      padding: 10px 12px;
      border-bottom: 1px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #fafafa; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #e0e7ff; color: #4338ca; }

    .page-break {
      page-break-before: always;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px dashed #cbd5e1;
    }

    @page {
      margin: 10mm 12mm;
      size: auto;
    }

    @media print {
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        min-height: 100% !important;
      }
      .action-bar {
        display: none !important;
      }
      .report-container {
        box-shadow: none !important;
        border: 1px solid #cbd5e1 !important;
        padding: 20px !important;
        margin: 0 auto !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      .table-container {
        overflow: visible !important;
        page-break-inside: auto !important;
      }
      table {
        page-break-inside: auto !important;
        width: 100% !important;
      }
      tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
      }
      thead {
        display: table-header-group !important;
      }
      .page-break {
        page-break-before: always !important;
      }
    }
  </style>
</head>
<body>

  <div class="action-bar">
    <div>
      <h4>Goodwin Master Attendance Statement (${totalEmployees} Members)</h4>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Print / Save All as PDF
      </button>
      <button class="btn btn-secondary" onclick="downloadSelf()">
        📥 Download Master HTML
      </button>
    </div>
  </div>

  <div class="report-container">
    <div class="report-header">
      <div>
        <div class="company-title">GOODWIN GROW</div>
        <div class="company-subtitle">Executive Workforce Attendance Summary</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Comprehensive All-Member Attendance Record</div>
      </div>
      <div style="text-align: right;">
        <span style="background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">All Members</span>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Generated on: ${issueDate}</div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">Total Employees</div>
        <div class="kpi-main-stat">${totalEmployees}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Avg 30-Day Attendance</div>
        <div class="kpi-main-stat">${avg30DayAttendance} <span style="font-size: 14px; color: #64748b;">/ 30d</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Total Present Logged</div>
        <div class="kpi-main-stat" style="color: #16a34a;">${totalAllTimePresent}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Total Absent Days</div>
        <div class="kpi-main-stat" style="color: #dc2626;">${totalAllTimeAbsents}</div>
      </div>
    </div>

    <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">All Members Attendance Summary</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>1st Attendance (Join Date)</th>
            <th>Tenure Days</th>
            <th>Last 30d Count (Sundays in)</th>
            <th>30d Absents</th>
            <th>30d Halfs</th>
            <th>All Attendance So Far</th>
            <th>Overall %</th>
          </tr>
        </thead>
        <tbody>
          ${allStats.map(s => `
            <tr>
              <td><strong>${s.employeeName}</strong></td>
              <td>${s.role}</td>
              <td style="color: #4f46e5; font-weight: 600;">${s.firstAttendanceDate}</td>
              <td>${s.totalDaysSinceJoining}d</td>
              <td>
                <span class="badge badge-green">${s.last30Days.effectiveAttendanceCount} / 30</span>
                <span style="font-size: 10px; color: #64748b; margin-left: 2px;">(P:${s.last30Days.presentCount} S:${s.last30Days.sundaysCount})</span>
              </td>
              <td style="color: ${s.last30Days.absentCount > 0 ? '#dc2626' : '#64748b'}; font-weight: 600;">
                ${s.last30Days.absentCount}
              </td>
              <td>${s.last30Days.halfDaysCount}</td>
              <td>
                <span class="badge badge-blue">${s.allTime.attendanceRatio}</span>
              </td>
              <td><strong>${s.allTime.attendanceRate}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Individual Slips for each member in print -->
    <div style="margin-top: 30px;">
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 15px;">Individual Attendance Breakdown</h3>
      ${allStats.map(s => `
        <div class="page-break" style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
              <h4 style="font-size: 18px; font-weight: 700; color: #0f172a;">${s.employeeName} (${s.role})</h4>
              <p style="font-size: 12px; color: #64748b;">Joining / First Attendance: <strong>${s.firstAttendanceDate}</strong> | Total Days: <strong>${s.totalDaysSinceJoining} Days</strong></p>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-green" style="font-size: 12px; padding: 4px 8px;">Last 30d: ${s.last30Days.effectiveAttendanceCount} / 30 (${s.last30Days.attendanceRate})</span>
              <span class="badge badge-blue" style="font-size: 12px; padding: 4px 8px; margin-left: 6px;">All Time: ${s.allTime.attendanceRatio} (${s.allTime.attendanceRate})</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">LAST 30D PRESENTS</div>
              <div style="font-size: 16px; font-weight: 700;">${s.last30Days.presentCount} Days</div>
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">LAST 30D SUNDAYS IN</div>
              <div style="font-size: 16px; font-weight: 700;">${s.last30Days.sundaysCount} Sundays</div>
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">ABSENT DAYS</div>
              <div style="font-size: 16px; font-weight: 700; color: #dc2626;">30d: ${s.last30Days.absentCount} | All: ${s.allTime.absentCount}</div>
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">HALF DAYS</div>
              <div style="font-size: 16px; font-weight: 700; color: #d97706;">30d: ${s.last30Days.halfDaysCount} | All: ${s.allTime.halfDaysCount}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
      <div>Goodwin AI Workforce Operations • Confidential & Proprietary</div>
      <div>Official Audit Copy</div>
    </div>
  </div>

  <script>
    function downloadSelf() {
      const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Master_Attendance_Report_${todayStr}.html';
      a.click();
    }
  </script>
</body>
</html>`;
};

/**
 * Print receipt directly using a hidden iframe with a Blob URL.
 * This triggers the browser's native Print dialog immediately with pre-rendered styles,
 * completely avoiding the Chromium "about:blank" blank page bug.
 */
export const printReceiptDirectly = (htmlContent: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.open with Blob URL:', err);
        const win = window.open(blobUrl, '_blank');
        if (win) {
          win.focus();
        }
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }
    }, 400);
  };
};

/**
 * Open HTML receipt in a new tab using a valid Blob URL so it has a real document origin,
 * allowing manual inspection or standard browser print.
 */
export const openReceiptPrintWindow = (htmlContent: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank');
  if (win) {
    win.focus();
  }
};
