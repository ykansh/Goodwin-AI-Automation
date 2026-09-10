import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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
} from 'date-fns';

export const Attendance = () => {
  const attendance = useStore((state) => state.attendance);
  const updateAttendance = useStore((state) => state.updateAttendance);
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
    const existingRecord = attendance[dateKey]?.[selectedEmployee];
    
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
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-dark">{emp.name}</h3>
                  <p className="text-xs text-secondary-light">{emp.role}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-canvas-variant">
                <span className="text-sm text-secondary flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-secondary-light" />
                  View Attendance
                </span>
                <UserCheck className="h-4 w-4 text-primary" />
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
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        
        const record = selectedEmployee ? attendance[dateKey]?.[selectedEmployee] : null;
        
        let bgColorClass = !isSameMonth(day, monthStart)
          ? "bg-canvas text-secondary-light/50 hover:bg-canvas-variant/30"
          : isSameDay(day, new Date()) 
            ? "bg-primary/5 text-primary-dark hover:bg-canvas-variant/30" 
            : "bg-canvas-surface text-secondary-dark hover:bg-canvas-variant/30";

        // Color coding based on attendance
        if (record) {
          if (record.status === 'Present') bgColorClass = "bg-green-500/10 text-green-800 hover:bg-green-500/20";
          else if (record.status === 'Absent') bgColorClass = "bg-danger/10 text-danger hover:bg-danger/20";
          else if (record.status === 'Half-Day') bgColorClass = "bg-warning/10 text-warning hover:bg-warning/20";
        }

        days.push(
          <div
            className={`flex-1 min-h-[100px] border-b border-r border-canvas-variant p-2 cursor-pointer transition-colors ${bgColorClass}`}
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {formattedDate}
              </span>
            </div>
            
            {record && (
              <div className="mt-2 space-y-1">
                <div className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${
                    record.status === 'Present' ? 'bg-green-500/10 border-green-500/30' : 
                    record.status === 'Absent' ? 'bg-danger/10 border-danger/30' : 
                    'bg-warning/10 border-warning/30'
                  }`}>
                  <strong>{record.status}</strong>
                </div>
                {record.status !== 'Absent' && (
                  <div className="text-[10px] text-secondary-dark flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1 inline" />
                    {record.arrival} - {record.departure}
                  </div>
                )}
              </div>
            )}
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
        <div className="flex bg-canvas-surface border-l border-r border-canvas-variant">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="flex-1 text-center font-bold text-xs uppercase text-secondary-light tracking-wider py-3 border-b border-canvas-variant">
              {d}
            </div>
          ))}
        </div>
        <div className="bg-canvas-surface border-l border-canvas-variant rounded-b-lg overflow-hidden border-b border-r">
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Attendance Tracking</h1>
        <p className="text-secondary-light text-sm mt-1">Select an employee to view or edit their attendance records.</p>
      </div>

      {renderEmployeeGrid()}

      {/* Main Calendar Modal for Selected Employee */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        title={`${selectedEmployee}'s Attendance`}
        className="max-w-5xl"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold">
              {selectedEmployee?.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-secondary-dark">{selectedEmployee}</h3>
              <p className="text-sm text-secondary-light">Daily attendance and working hours</p>
            </div>
          </div>

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
