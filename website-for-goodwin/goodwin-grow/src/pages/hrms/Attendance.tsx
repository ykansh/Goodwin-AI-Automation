import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useStore, type AttendanceRecord, type AttendanceStatus } from '../../lib/store';
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

export const Attendance = () => {
  const attendance = useStore((state) => state.attendance);
  const updateAttendance = useStore((state) => state.updateAttendance);
  const clockIn = useStore((state) => state.clockIn);
  const clockOut = useStore((state) => state.clockOut);
  const markAbsences = useStore((state) => state.markAbsences);
  const employees = useStore((state) => state.employees);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
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

  // Helper to match employee attendance with whitespace-trimmed fallback
  const getEmployeeAttendance = (dateKey: string, empName: string | null) => {
    if (!empName) return null;
    const dayRec = attendance[dateKey];
    if (!dayRec) return null;
    if (dayRec[empName]) return dayRec[empName];
    const trimmed = empName.trim();
    const found = Object.entries(dayRec).find(([k]) => k.trim() === trimmed);
    return found ? found[1] : null;
  };

  const handleEmployeeClick = (employeeName: string) => {
    setSelectedEmployee(employeeName);
    setIsCalendarModalOpen(true);
    setCurrentDate(new Date()); // reset calendar to current month
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const onDateClick = (day: Date) => {
    if (!selectedEmployee) return;
    const dateKey = format(day, 'yyyy-MM-dd');
    const existingRecord = getEmployeeAttendance(dateKey, selectedEmployee);
    
    if (existingRecord?.isFinalized) {
      alert('This record is finalized and cannot be edited.');
      return;
    }
    
    setSelectedDate(day);
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

  // Render Employee Grid
  const renderEmployeeGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((emp) => {
          return (
            <div 
              key={emp.id} 
              onClick={() => handleEmployeeClick(emp.name)}
              className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-lg mr-4 group-hover:scale-105 transition-transform">
                  {emp.name.trim().charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-dark">{emp.name.trim()}</h3>
                  <p className="text-xs text-secondary-light">{emp.role}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-canvas-variant">
                <span className="text-sm text-secondary flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-secondary-light" />
                  View Attendance
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  emp.status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-canvas-variant text-secondary-light'
                }`}>
                  {emp.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Calendar
  const renderCalendar = () => {
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
              className={`h-[125px] border-b border-r border-canvas-variant ${isSunday ? 'bg-neutral-950/20' : 'bg-canvas/30'} pointer-events-none`}
            />
          );
          day = addDays(day, 1);
          continue;
        }

        const formattedDate = format(cloneDay, dateFormat);
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        
        const record = getEmployeeAttendance(dateKey, selectedEmployee);
        
        let bgColorClass = "";
        let dateColorClass = "text-secondary-dark";

        if (isSunday) {
          // Sunday appears black
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
            className={`h-[125px] flex flex-col p-2 border-b border-r border-canvas-variant cursor-pointer transition-colors overflow-hidden select-none ${bgColorClass}`}
            key={cloneDay.toISOString()}
            onClick={() => onDateClick(cloneDay)}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Attendance Tracking</h1>
          <p className="text-secondary-light text-sm mt-1">Select an employee to view or edit their attendance records.</p>
        </div>
        <Button onClick={() => {
          markAbsences(format(new Date(), 'yyyy-MM-dd'));
          alert('Absences marked for today for all missing clock-ins.');
        }}>
          <UserCheck className="h-4 w-4 mr-2" />
          Mark Absences (Today)
        </Button>
      </div>

      {renderEmployeeGrid()}

      {/* Main Calendar Modal for Selected Employee */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        title={`${selectedEmployee?.trim()}'s Attendance`}
        className="max-w-5xl"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold">
              {selectedEmployee?.trim().charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-secondary-dark">{selectedEmployee?.trim()}</h3>
              <p className="text-sm text-secondary-light">Daily attendance and working hours</p>
            </div>
          </div>

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

          {renderCalendar()}
        </div>
      </Modal>

      {/* Edit Modal for Adding/Editing Attendance on a Specific Day */}
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
