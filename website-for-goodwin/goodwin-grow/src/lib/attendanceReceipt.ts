import { 
  format, 
  parseISO, 
  subDays, 
  getDay, 
  differenceInCalendarDays,
  isValid,
  parse,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  addDays
} from 'date-fns';
import type { Employee, AttendanceRecord } from './store';

export const EXTRA_DAY_RATE = 333;

export const getCachedPublicHolidays = (): { date: string; name: string }[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('goodwin_public_holidays') : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export interface DailyAttendanceDetail {
  date: string;
  dayOfWeek: string;
  isSunday: boolean;
  isPublicHoliday?: boolean;
  holidayName?: string;
  status: 'Present' | 'Absent' | 'Half-Day' | 'Sunday Off' | 'Holiday Off' | 'Unmarked' | 'Extra Day';
  arrival: string;
  departure: string;
  credit: number; // 1 for present/sunday/holiday off/extra day, 0.5 for half day, 0 for absent/unmarked
  isFinalized?: boolean;
  isExtraDayWorked?: boolean;
  isSanctionedLeave?: boolean;
  isOffsetByExtraDay?: boolean; // Leave day cancelled by an Extra Day (Compensatory Off: 0 deduction)
  isOffsetUsed?: boolean; // Extra Day consumed to cancel a Leave Day (Not counted in extras / ₹0 extra amount)
  notes?: string;
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
  sundayExtraDaysCount: number;
  sanctionedLeavesCount: number;
  grossExtraDaysCount?: number;
  grossAbsentCount?: number;
  cancelledLeavesCount?: number;
  netExtraDaysCount?: number;
  netAbsentCount?: number;
  
  // Last 30 Days stats (Sundays in)
  last30Days: {
    startDate: string;
    endDate: string;
    totalPeriodDays: number; // 30
    sundaysCount: number;
    presentCount: number;
    halfDaysCount: number;
    absentCount: number;
    grossAbsentCount?: number;
    unmarkedCount: number;
    sundayExtraDaysCount: number;
    grossExtraDaysCount?: number;
    cancelledLeavesCount?: number;
    netExtraDaysCount?: number;
    netAbsentCount?: number;
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
    grossAbsentCount?: number;
    unmarkedCount: number;
    sundayExtraDaysCount: number;
    grossExtraDaysCount?: number;
    cancelledLeavesCount?: number;
    netExtraDaysCount?: number;
    netAbsentCount?: number;
    effectiveAttendanceCount: number; // non-Sunday presents + Sundays + 0.5*half-days
    attendanceRatio: string; // e.g. "27.5 / 32"
    attendanceRate: string; // percentage string, e.g. "85.9%"
  };

  // Detailed records from first attendance date to today
  dailyRecords: DailyAttendanceDetail[];
}

export interface CustomRangeAttendanceStats {
  employeeId: string;
  employeeName: string;
  role: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  joinDate: string;
  startDate: string;
  endDate: string;
  totalPeriodDays: number;
  presentCount: number;
  grossExtraDaysCount: number; // Worked on holiday / Sunday / Extra Day
  grossAbsentCount: number; // Leaves taken / Absent
  cancelledLeavesCount: number; // Compensatory off: 1 Extra Day cancels 1 Leave Day
  netExtraDaysCount: number; // Surplus Extra Days counted in extras (+₹333)
  netAbsentCount: number; // Remaining chargeable leaves for salary deduction
  sundayExtraDaysCount: number; // Net extra days (backward compatibility alias)
  absentCount: number; // Net absent count (backward compatibility alias)
  halfDaysCount: number;
  sanctionedLeavesCount: number;
  sundaysOffCount: number;
  holidaysOffCount: number;
  unmarkedCount: number;
  effectiveAttendanceCount: number;
  attendanceRate: string;
  dailyRecords: DailyAttendanceDetail[];
}

export interface CustomRangeMasterStats {
  startDate: string;
  endDate: string;
  totalPeriodDays: number;
  employeesCount: number;
  allStats: CustomRangeAttendanceStats[];
  totalWorkdaysPresent: number;
  totalGrossExtraDays: number;
  totalLeavesTaken: number;
  totalCancelledLeaves: number;
  totalNetExtraDays: number;
  totalNetAbsentDays: number;
  totalExtraBonusAmount: number;
  averageAttendanceRate: string;
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
  leavesOrRefDate?: any[] | Date,
  maybeRefDate?: Date
): EmployeeAttendanceStats => {
  let leaves: any[] = [];
  let referenceDate: Date = new Date();
  if (Array.isArray(leavesOrRefDate)) {
    leaves = leavesOrRefDate;
    if (maybeRefDate instanceof Date) referenceDate = maybeRefDate;
  } else if (leavesOrRefDate instanceof Date) {
    referenceDate = leavesOrRefDate;
  }

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
  let firstAttendanceDateStr = todayStr;
  if (matchingDateKeys.length > 0) {
    firstAttendanceDateStr = matchingDateKeys[0];
  } else if (employee.joinDate && isValid(parseISO(employee.joinDate))) {
    firstAttendanceDateStr = employee.joinDate;
  }

  const firstDate = parseISO(firstAttendanceDateStr);
  const totalDaysSinceJoining = Math.max(1, differenceInCalendarDays(today, firstDate) + 1);

  const publicHolidays = getCachedPublicHolidays();

  // Daily records list from firstDate to today
  const dailyRecords: DailyAttendanceDetail[] = [];
  let allSundays = 0;
  let allPresents = 0;
  let allNonSundayPresents = 0;
  let allHalfDays = 0;
  let allAbsents = 0;
  let allSanctionedLeaves = 0;
  let allSundayExtraDays = 0;
  let allUnmarked = 0;

  let cur = new Date(firstDate);
  while (cur <= today) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const dayOfWeek = format(cur, 'EEEE');
    const isSunday = getDay(cur) === 0;
    const holiday = publicHolidays.find(h => h.date === dStr);
    const isPublicHoliday = !!holiday;
    const isOffDay = isSunday || isPublicHoliday;
    const rec = getEmployeeAttendanceRecord(attendance, dStr, employee.name);

    if (isSunday) allSundays++;

    // Check if this date has a sanctioned/approved leave in HRMS
    const isSanctionedLeave = (leaves || []).some((l: any) => {
      const empMatch = l.employeeId === employee.id || (l.name && l.name.trim().toLowerCase() === empName.toLowerCase());
      const isApproved = l.status === 'Approved' || l.status === 'Sanctioned';
      return empMatch && isApproved && dStr >= l.startDate && dStr <= l.endDate;
    });

    let status: DailyAttendanceDetail['status'] = isSunday ? 'Sunday Off' : isPublicHoliday ? 'Holiday Off' : 'Unmarked';
    let credit = isOffDay ? 1.0 : 0.0;
    let arrival = '';
    let departure = '';
    let isFinalized = false;
    let isExtraDayWorked = false;
    let notes = isSunday ? 'Weekly Off' : isPublicHoliday ? `Public Holiday: ${holiday?.name || 'Public Leave'}` : '';

    const didWork = !!(rec && (rec.status === 'Present' || rec.status === 'Half-Day' || rec.status === 'Extra Day'));

    if (isOffDay) {
      if (didWork) {
        // Employee worked on Sunday or Public Holiday! -> ⭐ Extra Day (+₹333)
        isExtraDayWorked = true;
        status = 'Extra Day';
        const extra = rec?.status === 'Half-Day' ? 0.5 : 1.0;
        allSundayExtraDays += extra;
        credit = 1.0;
        arrival = rec?.arrival || '09:00';
        departure = rec?.departure || '17:00';
        isFinalized = rec?.isFinalized || false;
        notes = isPublicHoliday 
          ? `⭐ Extra Day (${holiday?.name || 'Govt Holiday'}) (+₹333)`
          : '⭐ Sunday Extra Day (+₹333)';
      } else {
        // Did NOT work on off day / public holiday: Paid Leave (Holiday Off / Sunday Off)
        // Rule: DO NOT mark absent! DO NOT mark as Extra Day!
        status = isSunday ? 'Sunday Off' : 'Holiday Off';
        credit = 1.0;
        notes = isSunday ? 'Weekly Off' : `Public Holiday: ${holiday?.name || 'Public Leave'}`;
      }
    } else {
      // Regular working day (Monday - Saturday, not a public holiday)
      if (isSanctionedLeave) {
        allAbsents++;
        allSanctionedLeaves++;
        status = 'Absent';
        credit = 0.0;
        notes = 'Sanctioned Leave';
      } else if (rec) {
        arrival = rec.arrival || '';
        departure = rec.departure || '';
        isFinalized = rec.isFinalized || false;

        if (rec.status === 'Extra Day' || rec.isExtraDay) {
          isExtraDayWorked = true;
          status = 'Extra Day';
          allSundayExtraDays += 1.0;
          credit = 1.0;
          notes = '⭐ Extra Day (+₹333)';
        } else if (rec.status === 'Present') {
          allPresents++;
          status = 'Present';
          credit = 1.0;
          allNonSundayPresents++;
        } else if (rec.status === 'Half-Day') {
          allHalfDays++;
          status = 'Half-Day';
          credit = 0.5;
        } else if (rec.status === 'Absent') {
          allAbsents++;
          status = 'Absent';
          credit = 0.0;
        }
      } else {
        allUnmarked++;
      }
    }

    dailyRecords.push({
      date: dStr,
      dayOfWeek,
      isSunday,
      isPublicHoliday,
      holidayName: holiday?.name,
      status,
      arrival,
      departure,
      credit,
      isFinalized,
      isExtraDayWorked,
      isSanctionedLeave,
      notes
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
  let l30SundayExtraDays = 0;
  let l30Unmarked = 0;
  let l30HolidaysOff = 0;

  let c30 = new Date(last30StartDate);
  while (c30 <= today) {
    const dStr = format(c30, 'yyyy-MM-dd');
    const isSunday = getDay(c30) === 0;
    const holiday = publicHolidays.find(h => h.date === dStr);
    const isPublicHoliday = !!holiday;
    const isOffDay = isSunday || isPublicHoliday;
    const rec = getEmployeeAttendanceRecord(attendance, dStr, employee.name);

    if (isSunday) l30Sundays++;
    if (isPublicHoliday && !isSunday) l30HolidaysOff++;

    const isSanctionedLeave = (leaves || []).some((l: any) => {
      const empMatch = l.employeeId === employee.id || (l.name && l.name.trim().toLowerCase() === empName.toLowerCase());
      const isApproved = l.status === 'Approved' || l.status === 'Sanctioned';
      return empMatch && isApproved && dStr >= l.startDate && dStr <= l.endDate;
    });

    const didWork = !!(rec && (rec.status === 'Present' || rec.status === 'Half-Day' || rec.status === 'Extra Day'));

    if (isOffDay) {
      if (didWork) {
        l30SundayExtraDays += rec?.status === 'Half-Day' ? 0.5 : 1.0;
      }
      // If unworked on off day: Paid leave, neither absent nor extra day!
    } else {
      if (isSanctionedLeave) {
        l30Absents++;
      } else if (rec) {
        if (rec.status === 'Extra Day' || rec.isExtraDay) {
          l30SundayExtraDays += 1.0;
        } else if (rec.status === 'Present') {
          l30Presents++;
          l30NonSundayPresents++;
        } else if (rec.status === 'Half-Day') {
          l30HalfDays++;
        } else if (rec.status === 'Absent') {
          l30Absents++;
        }
      } else {
        l30Unmarked++;
      }
    }
    c30 = new Date(c30.getTime() + 24 * 60 * 60 * 1000);
  }

  // Effective counts: regular presents + Sundays + Holidays Off + 0.5 * half-days
  const last30Effective = Number((l30NonSundayPresents + l30Sundays + l30HolidaysOff + (l30HalfDays * 0.5)).toFixed(1));
  const allTimeEffective = Number((dailyRecords.reduce((acc, r) => acc + r.credit, 0)).toFixed(1));

  const last30Rate = `${((last30Effective / 30) * 100).toFixed(1)}%`;
  const allTimeRate = `${((allTimeEffective / totalDaysSinceJoining) * 100).toFixed(1)}%`;

  const l30CancelledLeaves = Math.min(l30SundayExtraDays, l30Absents);
  const l30NetExtraDays = l30SundayExtraDays - l30CancelledLeaves;
  const l30NetAbsents = l30Absents - l30CancelledLeaves;

  const allCancelledLeaves = Math.min(allSundayExtraDays, allAbsents);
  const allNetExtraDays = allSundayExtraDays - allCancelledLeaves;
  const allNetAbsents = allAbsents - allCancelledLeaves;

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
    sundayExtraDaysCount: allNetExtraDays,
    sanctionedLeavesCount: allSanctionedLeaves,
    grossExtraDaysCount: allSundayExtraDays,
    grossAbsentCount: allAbsents,
    cancelledLeavesCount: allCancelledLeaves,
    netExtraDaysCount: allNetExtraDays,
    netAbsentCount: allNetAbsents,
    last30Days: {
      startDate: last30StartStr,
      endDate: todayStr,
      totalPeriodDays: 30,
      sundaysCount: l30Sundays,
      presentCount: l30Presents,
      halfDaysCount: l30HalfDays,
      absentCount: l30NetAbsents,
      grossAbsentCount: l30Absents,
      unmarkedCount: l30Unmarked,
      sundayExtraDaysCount: l30NetExtraDays,
      grossExtraDaysCount: l30SundayExtraDays,
      cancelledLeavesCount: l30CancelledLeaves,
      netExtraDaysCount: l30NetExtraDays,
      netAbsentCount: l30NetAbsents,
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
      absentCount: allNetAbsents,
      grossAbsentCount: allAbsents,
      unmarkedCount: allUnmarked,
      sundayExtraDaysCount: allNetExtraDays,
      grossExtraDaysCount: allSundayExtraDays,
      cancelledLeavesCount: allCancelledLeaves,
      netExtraDaysCount: allNetExtraDays,
      netAbsentCount: allNetAbsents,
      effectiveAttendanceCount: allTimeEffective,
      attendanceRatio: `${allTimeEffective} / ${totalDaysSinceJoining}`,
      attendanceRate: allTimeRate
    },
    dailyRecords: dailyRecords.reverse() // show latest first in list
  };
};

/**
 * Calculate attendance statistics for an employee over a specific Date Range (From Date -> To Date)
 */
export const calculateCustomRangeAttendanceStats = (
  employee: Employee,
  attendance: Record<string, Record<string, AttendanceRecord>>,
  leaves: any[] = [],
  startDateStr: string,
  endDateStr: string
): CustomRangeAttendanceStats => {
  const empName = employee.name.trim();
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const totalPeriodDays = Math.max(1, differenceInCalendarDays(end, start) + 1);

  const publicHolidays = getCachedPublicHolidays();
  const dailyRecords: DailyAttendanceDetail[] = [];
  let presentCount = 0;
  let grossExtraDaysCount = 0;
  let halfDaysCount = 0;
  let grossAbsentCount = 0;
  let sanctionedLeavesCount = 0;
  let sundaysOffCount = 0;
  let holidaysOffCount = 0;
  let unmarkedCount = 0;

  let cur = new Date(start);
  while (cur <= end) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const dayOfWeek = format(cur, 'EEEE');
    const isSunday = getDay(cur) === 0;
    const holiday = publicHolidays.find(h => h.date === dStr);
    const isPublicHoliday = !!holiday;
    const isOffDay = isSunday || isPublicHoliday;
    const rec = getEmployeeAttendanceRecord(attendance, dStr, employee.name);

    const isSanctionedLeave = (leaves || []).some((l: any) => {
      const empMatch = l.employeeId === employee.id || (l.name && l.name.trim().toLowerCase() === empName.toLowerCase());
      const isApproved = l.status === 'Approved' || l.status === 'Sanctioned';
      return empMatch && isApproved && dStr >= l.startDate && dStr <= l.endDate;
    });

    let status: DailyAttendanceDetail['status'] = isSunday ? 'Sunday Off' : isPublicHoliday ? 'Holiday Off' : 'Unmarked';
    let credit = isOffDay ? 1.0 : 0.0;
    let arrival = rec?.arrival || '';
    let departure = rec?.departure || '';
    let isFinalized = rec?.isFinalized || false;
    let isExtraDayWorked = false;
    let notes = isSunday ? 'Weekly Off' : isPublicHoliday ? `Public Holiday: ${holiday?.name || 'Public Leave'}` : '';

    const didWork = !!(rec && (rec.status === 'Present' || rec.status === 'Half-Day' || rec.status === 'Extra Day'));

    if (isOffDay) {
      if (didWork) {
        isExtraDayWorked = true;
        status = 'Extra Day';
        const extraWeight = rec?.status === 'Half-Day' ? 0.5 : 1;
        grossExtraDaysCount += extraWeight;
        credit = 1.0;
        arrival = rec?.arrival || '09:00';
        departure = rec?.departure || '17:00';
        notes = isPublicHoliday 
          ? `⭐ Extra Day (${holiday?.name || 'Govt Holiday'})`
          : '⭐ Sunday Extra Day';
      } else {
        // Did NOT work on off day / public holiday: Paid Leave (Holiday Off / Sunday Off)
        // Rule: DO NOT mark absent! DO NOT mark as Extra Day!
        status = isSunday ? 'Sunday Off' : 'Holiday Off';
        if (isSunday) sundaysOffCount++;
        else holidaysOffCount++;
        credit = 1.0;
        notes = isSunday ? 'Weekly Off' : `Public Holiday: ${holiday?.name || 'Public Leave'}`;
      }
    } else {
      if (isSanctionedLeave) {
        status = 'Absent';
        credit = 0.0;
        grossAbsentCount++;
        sanctionedLeavesCount++;
        notes = 'Sanctioned Leave';
      } else if (rec) {
        if (rec.status === 'Extra Day' || rec.isExtraDay) {
          isExtraDayWorked = true;
          status = 'Extra Day';
          grossExtraDaysCount += 1;
          credit = 1.0;
          notes = '⭐ Extra Day (Holiday Worked)';
        } else if (rec.status === 'Present') {
          presentCount++;
          status = 'Present';
          credit = 1.0;
        } else if (rec.status === 'Half-Day') {
          halfDaysCount++;
          status = 'Half-Day';
          credit = 0.5;
        } else if (rec.status === 'Absent') {
          grossAbsentCount++;
          status = 'Absent';
          credit = 0.0;
        }
      } else {
        unmarkedCount++;
        status = 'Unmarked';
        credit = 0.0;
      }
    }

    dailyRecords.push({
      date: dStr,
      dayOfWeek,
      isSunday,
      isPublicHoliday,
      holidayName: holiday?.name,
      status,
      arrival,
      departure,
      credit,
      isFinalized,
      isExtraDayWorked,
      isSanctionedLeave,
      notes
    });

    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }

  // User compensatory off logic:
  // 1 Extra Day cancels 1 Leave Day (1:1).
  // Cancelled leaves are not deducted (₹0 deduction).
  // Cancelled extra days are consumed and not counted in extras or extra amount (₹0 bonus).
  const cancelledLeavesCount = Math.min(grossExtraDaysCount, grossAbsentCount);
  const netExtraDaysCount = grossExtraDaysCount - cancelledLeavesCount;
  const netAbsentCount = grossAbsentCount - cancelledLeavesCount;

  // Annotate daily records with offset flags
  let extraOffsetRemaining = cancelledLeavesCount;
  let leaveOffsetRemaining = cancelledLeavesCount;

  for (const r of dailyRecords) {
    if (r.isExtraDayWorked && extraOffsetRemaining > 0) {
      r.isOffsetUsed = true;
      const weight = r.status === 'Half-Day' ? 0.5 : 1.0;
      extraOffsetRemaining -= weight;
      r.notes = (r.notes ? r.notes : '') + ' • Cancelled 1 Leave Day (₹0 extra bonus)';
    } else if (r.isExtraDayWorked && extraOffsetRemaining <= 0) {
      r.notes = (r.notes ? r.notes : '') + ' • Bonus Eligible (+₹333)';
    }

    if (r.status === 'Absent' && leaveOffsetRemaining > 0) {
      r.isOffsetByExtraDay = true;
      leaveOffsetRemaining -= 1.0;
      r.notes = (r.notes ? r.notes + ' • ' : '') + 'Cancelled by Extra Day (₹0 deduction)';
    }
  }

  // Effective counts: regular presents + sundays/holidays off + half-days
  const effectiveAttendanceCount = Number((dailyRecords.reduce((acc, r) => acc + r.credit, 0)).toFixed(1));
  const attendanceRate = `${((effectiveAttendanceCount / totalPeriodDays) * 100).toFixed(1)}%`;

  return {
    employeeId: employee.id,
    employeeName: empName,
    role: employee.role,
    type: employee.type,
    status: employee.status,
    email: employee.email,
    phone: employee.phone,
    joinDate: employee.joinDate || startDateStr,
    startDate: startDateStr,
    endDate: endDateStr,
    totalPeriodDays,
    presentCount,
    grossExtraDaysCount,
    grossAbsentCount,
    cancelledLeavesCount,
    netExtraDaysCount,
    netAbsentCount,
    sundayExtraDaysCount: netExtraDaysCount, // net extra days
    absentCount: netAbsentCount, // net absent count
    halfDaysCount,
    sanctionedLeavesCount,
    sundaysOffCount,
    holidaysOffCount,
    unmarkedCount,
    effectiveAttendanceCount,
    attendanceRate,
    dailyRecords: dailyRecords.reverse()
  };
};

/**
 * Generate a standalone, printable, ultra-clean HTML Attendance Receipt for a custom Date Range
 */
export const generateCustomRangeReceiptHTML = (stats: CustomRangeAttendanceStats): string => {
  const issueDate = format(new Date(), 'PPP');
  const receiptNo = `GW-REC-${stats.startDate.replace(/-/g, '')}-${stats.endDate.replace(/-/g, '')}-${stats.employeeId.slice(0, 4).toUpperCase()}`;

  // Simplified: Total Leave Days = Leaves - Extra Days (net leaves after comp-off)
  const totalLeaveDays = stats.netAbsentCount;
  // Attendance % = ((Period Days - Total Leave Days) / Period Days) * 100
  const attendancePercent = stats.totalPeriodDays > 0
    ? ((stats.totalPeriodDays - totalLeaveDays) / stats.totalPeriodDays * 100).toFixed(1)
    : '0.0';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Attendance_Receipt_${stats.employeeName.replace(/\s+/g, '_')}_${stats.startDate}_to_${stats.endDate}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 30px 15px;
      line-height: 1.5;
    }
    .action-bar {
      max-width: 700px;
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

    .receipt-container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .company-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .company-subtitle { font-size: 12px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .receipt-badge-box { text-align: right; }
    .receipt-tag { display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
    .receipt-number { font-family: monospace; font-size: 13px; font-weight: 700; color: #334155; margin-top: 6px; }
    .receipt-date { font-size: 12px; color: #64748b; margin-top: 2px; }

    .employee-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }
    .emp-item-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .emp-item-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .emp-item-value.highlight { color: #4f46e5; font-weight: 700; }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }
    .summary-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
    }
    .summary-card.leave { border-color: #fca5a5; background: #fef2f2; }
    .summary-card.percent { border-color: #a5b4fc; background: #eef2ff; }
    .summary-card.days { border-color: #bfdbfe; background: #eff6ff; }
    .summary-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .summary-value { font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1; }
    .summary-value.red { color: #dc2626; }
    .summary-value.indigo { color: #4338ca; }
    .summary-value.blue { color: #1e40af; }
    .summary-sub { font-size: 12px; color: #64748b; margin-top: 6px; font-weight: 500; }

    .formula-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 28px;
      font-size: 13px;
      color: #334155;
      line-height: 1.8;
    }
    .formula-box strong { color: #0f172a; }

    .receipt-footer {
      border-top: 2px dashed #cbd5e1;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-bottom: 1px solid #475569; margin-bottom: 6px; height: 40px; }

    @page { margin: 10mm 12mm; size: auto; }
    @media print {
      html, body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }
      .action-bar { display: none !important; }
      .receipt-container { box-shadow: none !important; border: 1px solid #cbd5e1 !important; padding: 20px !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>

  <div class="action-bar">
    <div><h4>Attendance Receipt</h4></div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <button class="btn btn-secondary" onclick="downloadSelf()">📥 Download HTML</button>
    </div>
  </div>

  <div class="receipt-container" id="receipt">
    <div class="receipt-header">
      <div>
        <div class="company-title">GOODWIN GROW</div>
        <div class="company-subtitle">Attendance Report</div>
      </div>
      <div class="receipt-badge-box">
        <span class="receipt-tag">Official Receipt</span>
        <div class="receipt-number">${receiptNo}</div>
        <div class="receipt-date">Issued: ${issueDate}</div>
      </div>
    </div>

    <!-- Employee Info -->
    <div class="employee-card">
      <div>
        <div class="emp-item-label">Employee Name</div>
        <div class="emp-item-value">${stats.employeeName}</div>
      </div>
      <div>
        <div class="emp-item-label">Role</div>
        <div class="emp-item-value">${stats.role}</div>
      </div>
      <div>
        <div class="emp-item-label">Period</div>
        <div class="emp-item-value highlight">${stats.startDate} to ${stats.endDate}</div>
      </div>
      <div>
        <div class="emp-item-label">Join Date</div>
        <div class="emp-item-value">${stats.joinDate}</div>
      </div>
    </div>

    <!-- Main Summary: Only Total Leave Days & Attendance % -->
    <div class="summary-grid">
      <div class="summary-card days">
        <div class="summary-label">Period Days</div>
        <div class="summary-value blue">${stats.totalPeriodDays}</div>
        <div class="summary-sub">${stats.startDate} → ${stats.endDate}</div>
      </div>
      <div class="summary-card leave">
        <div class="summary-label">Total Leave Days</div>
        <div class="summary-value red">${totalLeaveDays}</div>
        <div class="summary-sub">Leave (${stats.grossAbsentCount}) − Extra Days (${stats.grossExtraDaysCount})</div>
      </div>
      <div class="summary-card percent">
        <div class="summary-label">Attendance %</div>
        <div class="summary-value indigo">${attendancePercent}%</div>
        <div class="summary-sub">(${stats.totalPeriodDays} − ${totalLeaveDays}) / ${stats.totalPeriodDays} × 100</div>
      </div>
    </div>

    <!-- Formula breakdown -->
    <div class="formula-box">
      <strong>Total Leave Days</strong> = Gross Leaves (${stats.grossAbsentCount}) − Extra Days Worked (${stats.grossExtraDaysCount}) = <strong>${totalLeaveDays} day(s)</strong>
      <br/>
      <strong>Attendance %</strong> = (${stats.totalPeriodDays} − ${totalLeaveDays}) / ${stats.totalPeriodDays} × 100 = <strong>${attendancePercent}%</strong>
      ${stats.cancelledLeavesCount > 0 ? `<br/><em style="color: #047857;">⭐ ${stats.cancelledLeavesCount} Extra Day(s) cancelled ${stats.cancelledLeavesCount} Leave Day(s) via Compensatory Off (1:1)</em>` : ''}
    </div>

    <!-- Footer -->
    <div class="receipt-footer">
      <div>
        <p><strong>Verification:</strong> System-generated by Goodwin AI HRMS.</p>
        <p style="margin-top: 4px;">Confidential Record • Ref: ${receiptNo}</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong>Authorized Signatory</strong>
        <div>Goodwin Grow HR</div>
      </div>
    </div>
  </div>

  <script>
    function downloadSelf() {
      const html = document.documentElement.outerHTML;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Attendance_Receipt_${stats.employeeName.replace(/\s+/g, '_')}_${stats.startDate}_${stats.endDate}.html';
      a.click();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;
};

/**
 * Download Attendance Data for custom date range as CSV
 */
export const downloadCustomRangeCSV = (
  stats: CustomRangeAttendanceStats,
  filenamePrefix: string = 'Attendance_Period_Report'
) => {
  const headers = [
    'Date',
    'Day of Week',
    'Classification',
    'Attendance Status',
    'Arrival',
    'Departure',
    'Effective Credit',
    'Extra Day Worked',
    'Compensatory Off Status',
    'Sanctioned Leave',
    'Notes'
  ];

  const rows = stats.dailyRecords.map(r => [
    `"${r.date}"`,
    `"${r.dayOfWeek}"`,
    `"${r.isSunday ? (r.isExtraDayWorked ? 'Sunday Extra Day Worked' : 'Sunday Off') : (r.isPublicHoliday ? `Public Holiday (${r.holidayName || 'Holiday'})` : (r.isExtraDayWorked ? 'Govt Holiday (Extra Day Worked)' : 'Regular Workday'))}"`,
    `"${r.status}"`,
    `"${r.arrival}"`,
    `"${r.departure}"`,
    r.credit,
    r.isExtraDayWorked ? 'Yes' : 'No',
    r.isOffsetUsed ? '"Used to Cancel Leave (₹0 Bonus)"' : (r.isOffsetByExtraDay ? '"Cancelled by Extra Day (₹0 Deduction)"' : (r.isExtraDayWorked ? '"Bonus Eligible (+₹333)"' : '"-"')),
    r.isSanctionedLeave ? 'Yes' : 'No',
    `"${r.notes || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  triggerDownload(csvContent, `${filenamePrefix}_${stats.employeeName.replace(/\s+/g, '_')}_${stats.startDate}_to_${stats.endDate}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Download Master Consolidated Attendance Report for all employees as CSV
 */
export const downloadCustomRangeMasterCSV = (
  masterStats: CustomRangeMasterStats,
  filenamePrefix: string = 'Master_Attendance_Report'
) => {
  const headers = [
    'Employee Name',
    'Role',
    'Type',
    'Status',
    'Total Period Days',
    'Workdays Present',
    'Gross Extra Days (Holiday/Sunday Worked)',
    'Gross Leaves Taken',
    'Compensatory Off (Cancelled Leaves)',
    'Net Extra Days (Bonus Eligible)',
    'Net Chargeable Leaves',
    'Extra Day Overtime Bonus (INR)',
    'Presence Rate %'
  ];

  const rows = masterStats.allStats.map(s => [
    `"${s.employeeName}"`,
    `"${s.role}"`,
    `"${s.type}"`,
    `"${s.status}"`,
    s.totalPeriodDays,
    s.presentCount,
    s.grossExtraDaysCount,
    s.grossAbsentCount,
    s.cancelledLeavesCount,
    s.netExtraDaysCount,
    s.netAbsentCount,
    s.netExtraDaysCount * EXTRA_DAY_RATE,
    `"${s.attendanceRate}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  triggerDownload(csvContent, `${filenamePrefix}_${masterStats.startDate}_to_${masterStats.endDate}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Generate Master Attendance PDF/HTML Report for ALL employees over custom date range
 */
export const generateCustomRangeMasterReceiptHTML = (masterStats: CustomRangeMasterStats): string => {
  const issueDate = format(new Date(), 'PPP');
  const reportRef = `GW-MASTER-${masterStats.startDate.replace(/-/g, '')}-${masterStats.endDate.replace(/-/g, '')}`;

  // Simplified table: Employee | Role | Total Leave Days | Attendance %
  const rowsHTML = masterStats.allStats.map((s, idx) => {
    const totalLeaveDays = s.netAbsentCount;
    const attendPct = s.totalPeriodDays > 0
      ? ((s.totalPeriodDays - totalLeaveDays) / s.totalPeriodDays * 100).toFixed(1)
      : '0.0';
    return `
    <tr>
      <td style="font-weight: 700;">${idx + 1}. ${s.employeeName}</td>
      <td style="color: #64748b;">${s.role}</td>
      <td style="text-align: center; font-weight: 800; color: ${totalLeaveDays > 0 ? '#dc2626' : '#166534'}; font-size: 16px;">${totalLeaveDays}</td>
      <td style="text-align: center; color: #64748b; font-size: 11px;">Leave ${s.grossAbsentCount} − Extra ${s.grossExtraDaysCount}</td>
      <td style="text-align: center; font-weight: 800; color: #4338ca; font-size: 16px;">${attendPct}%</td>
      <td style="text-align: center; color: #64748b; font-size: 11px;">(${masterStats.totalPeriodDays} − ${totalLeaveDays}) / ${masterStats.totalPeriodDays}</td>
    </tr>
  `;
  }).join('');

  // Aggregated totals
  const teamTotalLeaveDays = masterStats.totalNetAbsentDays;
  const teamAvgLeaveDays = masterStats.employeesCount > 0
    ? (teamTotalLeaveDays / masterStats.employeesCount).toFixed(1)
    : '0';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Goodwin_Master_Attendance_Report_${masterStats.startDate}_to_${masterStats.endDate}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 30px 15px;
      line-height: 1.5;
    }
    .action-bar {
      max-width: 900px;
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
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
      border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .btn-secondary:hover { background: #475569; }

    .receipt-container {
      max-width: 900px; margin: 0 auto; background: #ffffff; border-radius: 16px;
      padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .receipt-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;
    }
    .company-title { font-size: 24px; font-weight: 900; color: #0f172a; }
    .company-subtitle { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 2px; }
    .receipt-badge-box { text-align: right; }
    .receipt-tag { background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; display: inline-block; margin-bottom: 6px; }
    .receipt-number { font-size: 12px; font-weight: 700; color: #334155; }
    .receipt-date { font-size: 11px; color: #64748b; margin-top: 2px; }

    .period-banner {
      background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;
      padding: 14px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;
    }
    .period-title { font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; }
    .period-dates { font-size: 15px; font-weight: 800; color: #1e3a8a; }

    .summary-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px;
    }
    .summary-card {
      background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; text-align: center;
    }
    .summary-card.leave { border-color: #fca5a5; background: #fef2f2; }
    .summary-card.percent { border-color: #a5b4fc; background: #eef2ff; }
    .summary-card.days { border-color: #bfdbfe; background: #eff6ff; }
    .summary-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
    .summary-value { font-size: 36px; font-weight: 900; line-height: 1; }
    .summary-value.red { color: #dc2626; }
    .summary-value.indigo { color: #4338ca; }
    .summary-value.blue { color: #1e40af; }
    .summary-sub { font-size: 12px; color: #64748b; margin-top: 6px; font-weight: 500; }

    .formula-box {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #334155; line-height: 1.8;
    }
    .formula-box strong { color: #0f172a; }

    .table-container { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; padding: 10px 14px; border-bottom: 1px solid #cbd5e1; text-transform: uppercase; font-size: 10px; }
    td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #fafafa; }

    .receipt-footer {
      border-top: 2px dashed #cbd5e1; padding-top: 20px;
      display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b;
    }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-bottom: 1px solid #475569; margin-bottom: 6px; height: 35px; }

    @page { margin: 8mm 10mm; size: auto; }
    @media print {
      html, body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }
      .action-bar { display: none !important; }
      .receipt-container { box-shadow: none !important; border: 1px solid #cbd5e1 !important; padding: 15px !important; max-width: 100% !important; }
      tr { page-break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div><h4>Master Attendance Report (${masterStats.startDate} to ${masterStats.endDate})</h4></div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Save as PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  <div class="receipt-container">
    <div class="receipt-header">
      <div>
        <div class="company-title">GOODWIN GROW</div>
        <div class="company-subtitle">Attendance Report</div>
      </div>
      <div class="receipt-badge-box">
        <span class="receipt-tag">Master Report</span>
        <div class="receipt-number">${reportRef}</div>
        <div class="receipt-date">Issued: ${issueDate}</div>
      </div>
    </div>

    <div class="period-banner">
      <div>
        <div class="period-title">Reporting Period</div>
        <div class="period-dates">From ${masterStats.startDate} to ${masterStats.endDate} (${masterStats.totalPeriodDays} Days)</div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 20px; font-weight: 900; color: #1e3a8a;">${masterStats.employeesCount}</span>
        <span style="font-size: 11px; color: #3b82f6; display: block; font-weight: 700;">Employees</span>
      </div>
    </div>

    <!-- Only 3 key metrics -->
    <div class="summary-grid">
      <div class="summary-card days">
        <div class="summary-label">Period Days</div>
        <div class="summary-value blue">${masterStats.totalPeriodDays}</div>
        <div class="summary-sub">${masterStats.employeesCount} employees</div>
      </div>
      <div class="summary-card leave">
        <div class="summary-label">Avg Leave Days / Employee</div>
        <div class="summary-value red">${teamAvgLeaveDays}</div>
        <div class="summary-sub">Total: ${teamTotalLeaveDays} days (Leave − Extra Days)</div>
      </div>
      <div class="summary-card percent">
        <div class="summary-label">Avg Attendance %</div>
        <div class="summary-value indigo">${masterStats.averageAttendanceRate}</div>
        <div class="summary-sub">(Period Days − Leave Days) / Period Days × 100</div>
      </div>
    </div>

    <div class="formula-box">
      <strong>Total Leave Days</strong> = Leave Days − Extra Days Worked (1 extra cancels 1 leave)<br/>
      <strong>Attendance %</strong> = (Period Days − Total Leave Days) / Period Days × 100
    </div>

    <!-- Simplified Table: Employee | Role | Total Leave Days | Attendance % -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th style="text-align: center;">Total Leave Days</th>
            <th style="text-align: center;">Calculation</th>
            <th style="text-align: center;">Attendance %</th>
            <th style="text-align: center;">Formula</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>

    <div class="receipt-footer">
      <div>
        <p><strong>Note:</strong> Generated by Goodwin AI HRMS. Ref: ${reportRef}</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong>Authorized Signatory</strong>
        <div>Goodwin Grow HR</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Universal PDF downloader that triggers high-fidelity browser print to PDF
 */
export const downloadPDFReport = (htmlContent: string, title?: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank');
  if (win) {
    win.focus();
    win.onload = () => {
      setTimeout(() => {
        try {
          win.print();
        } catch (e) {
          console.warn('Auto print triggered inside window', e);
        }
      }, 500);
    };
  } else {
    printReceiptDirectly(htmlContent);
  }
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
    .status-holiday { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .status-extra { background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; font-weight: 700; }
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
                  r.status === 'Extra Day' ? 'status-extra' :
                  r.status === 'Sunday Off' ? 'status-sunday' :
                  r.status === 'Holiday Off' ? 'status-holiday' : 'status-unmarked'
                }">
                  ${r.status === 'Extra Day' ? '⭐ Extra Day' : r.status}
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

export interface PayslipData {
  employeeName: string;
  role: string;
  employeeId?: string;
  joinDate?: string;
  month: string;
  basicSalary: number;
  totalDaysInMonth?: number;
  perDaySalary?: number;
  presentDays?: number;
  grossAbsentDays?: number;
  grossSundayExtraDays?: number;
  cancelledLeaveDays?: number;
  absentDays?: number;
  attendanceDeduction?: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  sundayExtraDays?: number;
  sundayOvertimeBonus?: number;
  sundayDates?: string[];
  salaryType?: 'Salary' | 'Stipend';
}

/**
 * Generate a standalone, printable, authentic HTML payslip for an employee.
 */
export interface MonthAttendancePayroll {
  totalDaysInMonth: number;
  perDaySalary: number;
  presentDays: number;
  grossAbsentDays: number;
  grossSundayExtraDays: number;
  cancelledLeaveDays: number;
  absentDays: number; // Net absent days (after cancellation by extra days)
  sundayExtraDays: number; // Net extra days (after cancellation by leave days)
  sundayDates: string[];
  attendanceDeduction: number;
  sundayBonus: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Calculate dynamic monthly payroll & attendance breakdown based on employee records
 */
export const calculateMonthAttendancePayroll = (
  employeeName: string,
  monthStr: string,
  basicSalary: number,
  attendance: Record<string, Record<string, AttendanceRecord>>,
  options?: {
    allowances?: number;
    otherDeductions?: number;
    overrideAbsentDays?: number;
    overrideSundayExtraDays?: number;
    joinDate?: string;
    leaves?: any[];
  }
): MonthAttendancePayroll => {
  let parsedMonth: Date;
  try {
    parsedMonth = parse(monthStr, 'MMM yyyy', new Date());
    if (!isValid(parsedMonth)) parsedMonth = new Date();
  } catch {
    parsedMonth = new Date();
  }

  const mStart = startOfMonth(parsedMonth);
  const mEnd = endOfMonth(parsedMonth);
  const totalDaysInMonth = getDaysInMonth(parsedMonth) || 30;

  // Per day salary rate based on calendar days in month
  const perDaySalary = totalDaysInMonth > 0 ? Math.round((basicSalary / totalDaysInMonth) * 100) / 100 : 0;

  let autoPresentDays = 0;
  let autoAbsentDays = 0;
  let autoSundayExtraDays = 0;
  const sundayDates: string[] = [];

  const trimmedEmpName = (employeeName || '').trim().toLowerCase();

  const publicHolidays = getCachedPublicHolidays();

  let cur = new Date(mStart);
  while (cur <= mEnd) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const isSunday = getDay(cur) === 0;
    const holiday = publicHolidays.find(h => h.date === dStr);
    const isPublicHoliday = !!holiday;
    const isOffDay = isSunday || isPublicHoliday;

    const dayRec = attendance[dStr];
    let empRec: AttendanceRecord | null = null;
    if (dayRec) {
      if (dayRec[employeeName]) {
        empRec = dayRec[employeeName];
      } else {
        const found = Object.entries(dayRec).find(([k]) => k.trim().toLowerCase() === trimmedEmpName);
        if (found) empRec = found[1];
      }
    }

    const didWork = empRec && (empRec.status === 'Present' || empRec.status === 'Half-Day' || empRec.status === 'Extra Day');

    if (isOffDay) {
      if (didWork) {
        const extra = empRec?.status === 'Half-Day' ? 0.5 : 1.0;
        autoSundayExtraDays += extra;
        const label = isSunday ? 'Sun' : (holiday?.name ? `Holiday: ${holiday.name}` : 'Govt Hol');
        sundayDates.push(`${format(cur, 'd MMM')} (${label})${extra === 0.5 ? ' (Half-Day)' : ''}`);
      } else {
        // Unworked on off day / public leave:
        // Rule: NEVER count as absent! (0 deduction)
        // Rule: NEVER count as extra day! (0 bonus)
      }
    } else {
      // Regular working day (not Sunday, not public holiday)
      if (empRec) {
        if (empRec.status === 'Extra Day' || empRec.isExtraDay) {
          autoSundayExtraDays += 1;
          sundayDates.push(`${format(cur, 'd MMM')} (Extra Day)`);
        } else if (empRec.status === 'Present') {
          autoPresentDays += 1;
        } else if (empRec.status === 'Half-Day') {
          autoPresentDays += 0.5;
          autoAbsentDays += 0.5;
        } else if (empRec.status === 'Absent') {
          autoAbsentDays += 1;
        }
      }
    }

    cur = addDays(cur, 1);
  }

  const finalGrossAbsentDays = options?.overrideAbsentDays !== undefined 
    ? options.overrideAbsentDays 
    : autoAbsentDays;

  const finalGrossSundayExtraDays = options?.overrideSundayExtraDays !== undefined 
    ? options.overrideSundayExtraDays 
    : autoSundayExtraDays;

  // Compensatory Off Rule:
  // 1 Extra Day cancels 1 Leave Day (1:1).
  // "extraday should cancel leave. like one extraday cancel one leave day. and then extraday will not be counted in extras or extra amount ."
  const cancelledLeaveDays = Math.min(finalGrossSundayExtraDays, finalGrossAbsentDays);
  const netAbsentDays = finalGrossAbsentDays - cancelledLeaveDays;
  const netSundayExtraDays = finalGrossSundayExtraDays - cancelledLeaveDays;

  // Deductions due to attendance: only net uncancelled absent days * perDaySalary
  const attendanceDeduction = Math.round(netAbsentDays * perDaySalary);

  // Bonus for Extra Days (Govt Holiday & Sunday worked): only net uncancelled extra days * 333
  // "and then extraday will not be counted in extras or extra amount"
  const sundayBonus = Math.round(netSundayExtraDays * EXTRA_DAY_RATE);

  const allowances = options?.allowances !== undefined 
    ? options.allowances 
    : 0;

  const otherDeductions = options?.otherDeductions !== undefined 
    ? options.otherDeductions 
    : 0;

  const grossEarnings = Math.round(basicSalary + allowances + sundayBonus);
  const totalDeductions = Math.round(otherDeductions + attendanceDeduction);
  const netSalary = Math.max(0, grossEarnings - totalDeductions);

  return {
    totalDaysInMonth,
    perDaySalary,
    presentDays: autoPresentDays,
    grossAbsentDays: finalGrossAbsentDays,
    grossSundayExtraDays: finalGrossSundayExtraDays,
    cancelledLeaveDays,
    absentDays: netAbsentDays,
    sundayExtraDays: netSundayExtraDays,
    sundayDates,
    attendanceDeduction,
    sundayBonus,
    grossEarnings,
    totalDeductions,
    netSalary
  };
};

export const generatePayslipHTML = (data: PayslipData): string => {
  const formatCur = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const issueDate = format(new Date(), 'dd MMMM yyyy');
  const salaryTypeLabel = data.salaryType || 'Salary / Stipend';
  const totalDaysInMonth = data.totalDaysInMonth || 30;
  const perDaySalary = data.perDaySalary || (totalDaysInMonth > 0 ? Math.round((data.basicSalary / totalDaysInMonth) * 100) / 100 : 0);
  const sundayExtraDays = data.sundayExtraDays || 0;
  const sundayBonus = data.sundayOvertimeBonus || 0;
  const standardAllowances = Math.max(0, data.allowances - sundayBonus);
  const grossSalary = data.basicSalary + data.allowances;
  const attendanceDeduction = data.attendanceDeduction !== undefined 
    ? data.attendanceDeduction 
    : Math.round((data.absentDays || 0) * perDaySalary);
  const otherDeductions = Math.max(0, data.deductions - attendanceDeduction);
  const totalDeductions = attendanceDeduction + otherDeductions;
  
  const joinDateDisplay = data.joinDate && isValid(parseISO(data.joinDate))
    ? format(parseISO(data.joinDate), 'dd MMM yyyy')
    : (data.joinDate || 'N/A');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${data.employeeName} - ${data.month}</title>
  <style>
    @media print {
      body { margin: 0; padding: 10mm; background: #fff !important; }
      .no-print { display: none !important; }
      .page { box-shadow: none !important; border: 1px solid #ddd !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      padding: 24px 16px;
      line-height: 1.5;
    }
    .page {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      position: relative;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-title {
      font-size: 22px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .company-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .payslip-badge {
      text-align: right;
    }
    .payslip-badge h2 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .payslip-badge span {
      display: inline-block;
      margin-top: 4px;
      padding: 3px 10px;
      background: #dbeafe;
      color: #1e40af;
      font-size: 11px;
      font-weight: 600;
      border-radius: 9999px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-val {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .att-summary-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
    }
    .att-summary-title {
      font-size: 11px;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .att-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      text-align: center;
    }
    .att-card {
      background: #ffffff;
      border: 1px solid #dcfce7;
      border-radius: 6px;
      padding: 8px 4px;
    }
    .att-num {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .att-label {
      font-size: 10px;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }
    .salary-tables {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      border-bottom: 1px solid #cbd5e1;
      text-transform: uppercase;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    td.amount {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
    }
    .total-row td {
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      font-weight: 700;
      background: #fafafa;
    }
    .sunday-highlight {
      background: #fefce8;
      border-left: 3px solid #eab308;
    }
    .sunday-highlight td {
      color: #854d0e;
      font-weight: 600;
    }
    .deduct-highlight {
      background: #fef2f2;
      border-left: 3px solid #ef4444;
    }
    .deduct-highlight td {
      color: #991b1b;
      font-weight: 600;
    }
    .net-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .net-label {
      font-size: 14px;
      font-weight: 600;
      color: #166534;
    }
    .net-amount {
      font-size: 26px;
      font-weight: 800;
      color: #15803d;
    }
    .notes-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 12px;
      color: #475569;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      padding-top: 36px;
      border-top: 1px solid #e2e8f0;
    }
    .sign-block {
      text-align: center;
      width: 200px;
    }
    .sign-line {
      border-top: 1px solid #94a3b8;
      margin-top: 40px;
      padding-top: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .actions-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary { background: #2563eb; color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
  </style>
</head>
<body>
  <div class="actions-bar no-print">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print Payslip</button>
    <button class="btn btn-secondary" onclick="downloadSlip()">⬇️ Download HTML</button>
  </div>

  <div class="page" id="payslip-doc">
    <div class="header-bar">
      <div>
        <div class="company-title">Goodwin AI Automation</div>
        <div class="company-sub">HRMS & Payroll System • Enterprise Operations</div>
      </div>
      <div class="payslip-badge">
        <h2>${salaryTypeLabel} Slip</h2>
        <span>${data.month}</span>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-row"><span class="info-label">Employee Name:</span><span class="info-val">${data.employeeName}</span></div>
        <div class="info-row"><span class="info-label">Designation:</span><span class="info-val">${data.role}</span></div>
        <div class="info-row"><span class="info-label">Employee ID:</span><span class="info-val">${data.employeeId ? data.employeeId.slice(0, 8).toUpperCase() : 'EMP-AUT'}</span></div>
      </div>
      <div>
        <div class="info-row"><span class="info-label">Date of Joining:</span><span class="info-val" style="color:#2563eb;">${joinDateDisplay}</span></div>
        <div class="info-row"><span class="info-label">Disbursement Status:</span><span class="info-val" style="color: ${data.status === 'Paid' ? '#16a34a' : '#d97706'}">${data.status}</span></div>
        <div class="info-row"><span class="info-label">Statement Date:</span><span class="info-val">${issueDate}</span></div>
      </div>
    </div>

    <!-- Attendance Section Link & Summary -->
    <div class="att-summary-box">
      <div class="att-summary-title">📊 Attendance Summary (${data.month})</div>
      <div class="att-grid">
        <div class="att-card">
          <div class="att-num">${totalDaysInMonth}</div>
          <div class="att-label">Month Days</div>
        </div>
        <div class="att-card">
          <div class="att-num" style="color:#16a34a;">${data.presentDays ?? '—'}</div>
          <div class="att-label">Days Present</div>
        </div>
        <div class="att-card">
          <div class="att-num" style="color:${(data.absentDays || 0) > 0 ? '#dc2626' : '#475569'};">${data.absentDays ?? 0}</div>
          <div class="att-label">Days Absent / Off</div>
        </div>
        <div class="att-card">
          <div class="att-num" style="color:#d97706;">${sundayExtraDays}</div>
          <div class="att-label">⭐ Extra Sun Worked</div>
        </div>
        <div class="att-card">
          <div class="att-num" style="color:#2563eb;">${formatCur(perDaySalary)}</div>
          <div class="att-label">Per-Day Rate</div>
        </div>
      </div>
    </div>

    <div class="salary-tables">
      <div>
        <table>
          <thead>
            <tr>
              <th>Earnings</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic ${salaryTypeLabel}</td>
              <td class="amount">${formatCur(data.basicSalary)}</td>
            </tr>
            <tr>
              <td>Standard Allowances</td>
              <td class="amount">${formatCur(standardAllowances)}</td>
            </tr>
            ${sundayExtraDays > 0 ? `
            <tr class="sunday-highlight">
              <td>
                ⭐ Extra Days Worked (Govt Holiday / Sunday)
                <div style="font-size:11px; color:#a16207; font-weight:normal;">
                  ${sundayExtraDays} Extra Day(s) worked @ ${formatCur(EXTRA_DAY_RATE)}/day (₹333/day)
                  ${data.sundayDates && data.sundayDates.length > 0 ? `(${data.sundayDates.join(', ')})` : ''}
                </div>
              </td>
              <td class="amount" style="color:#854d0e;">+${formatCur(sundayBonus)}</td>
            </tr>
            ` : `
            <tr>
              <td>Extra Days Worked</td>
              <td class="amount" style="color:#94a3b8;">₹0 (0 days)</td>
            </tr>
            `}
            <tr class="total-row">
              <td>Total Earnings (Gross)</td>
              <td class="amount">${formatCur(grossSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>Deductions</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceDeduction > 0 ? `
            <tr class="deduct-highlight">
              <td>
                Attendance Deduction (Leaves / Off)
                <div style="font-size:11px; color:#b91c1c; font-weight:normal;">
                  ${data.absentDays || 0} day(s) absent @ ${formatCur(perDaySalary)}/day
                </div>
              </td>
              <td class="amount" style="color:#b91c1c;">-${formatCur(attendanceDeduction)}</td>
            </tr>
            ` : `
            <tr>
              <td>Attendance Deduction</td>
              <td class="amount" style="color:#94a3b8;">₹0 (Full Attendance)</td>
            </tr>
            `}
            <tr>
              <td>Statutory & Other Deductions</td>
              <td class="amount">${formatCur(otherDeductions)}</td>
            </tr>
            <tr>
              <td>TDS / Income Tax</td>
              <td class="amount">₹0</td>
            </tr>
            <tr class="total-row">
              <td>Total Deductions</td>
              <td class="amount">${formatCur(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="net-box">
      <div>
        <div class="net-label">NET TAKE-HOME ${data.salaryType ? data.salaryType.toUpperCase() : 'SALARY / STIPEND'}</div>
        <div style="font-size:12px; color:#15803d; margin-top:2px;">Disbursed via Direct Bank Transfer</div>
      </div>
      <div class="net-amount">${formatCur(data.netSalary)}</div>
    </div>

    <div class="notes-box">
      <strong>HRMS Payroll Calculation Notes:</strong><br>
      • Verified Date of Joining: <strong>${joinDateDisplay}</strong>.<br>
      • Daily Rate Formula: <strong>Basic ${formatCur(data.basicSalary)} ÷ ${totalDaysInMonth} days = ${formatCur(perDaySalary)} / day</strong>.<br>
      ${attendanceDeduction > 0 ? `• Attendance Deduction: ${data.absentDays} day(s) absent deducted (- ${formatCur(attendanceDeduction)}).<br>` : '• Attendance: Perfect attendance recorded during this period.<br>'}
      ${sundayExtraDays > 0 ? `• <strong>⭐ Extra Days Worked:</strong> Employee clocked ${sundayExtraDays} Extra Day(s) (Govt Holiday / Sunday worked), credited with overtime bonus @ ₹333/day (+ ${formatCur(sundayBonus)}).<br>` : ''}
      • Net Salary / Stipend dynamically calculated: Basic (${formatCur(data.basicSalary)}) + Allowances (${formatCur(standardAllowances)}) + Extra Days Bonus (${formatCur(sundayBonus)}) - Attendance Deduction (${formatCur(attendanceDeduction)}) - Other Deductions (${formatCur(otherDeductions)}) = <strong>${formatCur(data.netSalary)}</strong>.
    </div>

    <div class="signatures">
      <div class="sign-block">
        <div class="sign-line">Employee Signature</div>
      </div>
      <div class="sign-block">
        <div class="sign-line">Authorized Signatory / HRMS</div>
      </div>
    </div>
  </div>

  <script>
    function downloadSlip() {
      const html = '<!DOCTYPE html>' + document.documentElement.outerHTML;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Payslip_${data.employeeName.replace(/\\s+/g, '_')}_${data.month.replace(/\\s+/g, '_')}.html';
      a.click();
    }
  </script>
</body>
</html>`;
};
