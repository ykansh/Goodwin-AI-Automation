import React, { useState } from 'react';
import { useOperationsStore } from '../../lib/operationsStore';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../lib/store';
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
  isBefore,
  startOfToday,
  getDay
} from 'date-fns';

export const TaskManager = () => {
  const employees = useStore((state: any) => state.employees);
  const attendance = useStore((state: any) => state.attendance);
  const leaves = useStore((state: any) => state.leaves);
  const updateAttendance = useStore((state: any) => state.updateAttendance);

  const tasksList = useOperationsStore((state: any) => state.tasks);
  const addTask = useOperationsStore((state: any) => state.addTask);
  const updateTask = useOperationsStore((state: any) => state.updateTask);
  const deleteTask = useOperationsStore((state: any) => state.deleteTask);
  
  // Transform flat tasks array into Record<string, any[]> for the calendar
  const tasks = React.useMemo(() => {
    const record: Record<string, any[]> = {};
    for (const t of tasksList) {
      if (!record[t.date]) record[t.date] = [];
      record[t.date].push(t);
    }
    return record;
  }, [tasksList]);

  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

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
    setSelectedDate(day);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async () => {
    if (!selectedDate || !newTaskName.trim() || !selectedEmployee) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    await addTask({
      date: dateKey,
      title: newTaskName.trim(),
      assignee: selectedEmployee,
      status: 'pending',
      priority: 'Medium'
    });
    setNewTaskName('');
  };

  const updateTaskStatus = async (dateKey: string, taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteTask(taskId);
  };

  const handleSetAttendance = async (status: 'Present' | 'Absent' | 'Half-Day') => {
    if (!selectedDate || !selectedEmployee) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    await updateAttendance(dateKey, selectedEmployee, {
      status,
      arrival: status === 'Present' ? '09:00' : status === 'Half-Day' ? '09:00' : '',
      departure: status === 'Present' ? '17:00' : status === 'Half-Day' ? '13:00' : '',
      isFinalized: true
    });
  };

  // Render Employee Grid
  const renderEmployeeGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((emp: any) => {
          // Count active tasks for this employee
          let activeTasks = 0;
          Object.values(tasks).forEach(dayTasks => {
            activeTasks += dayTasks.filter((t: any) => {
              const match = t.assignee === emp.name || t.assignee?.trim() === emp.name?.trim();
              return match && t.status === 'pending';
            }).length;
          });

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
                  View Calendar
                </span>
                {activeTasks > 0 && (
                  <Badge variant="warning">{activeTasks} Active</Badge>
                )}
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

        // Requirement 1: Non-current month dates do NOT show up (clean blank slot to keep grid aligned)
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
        
        const dayTasks = (tasks[dateKey] || []).filter((t: any) => {
          return t.assignee === selectedEmployee || t.assignee?.trim() === selectedEmployee?.trim();
        });
        const hasTasks = dayTasks.length > 0;
        const allCompleted = hasTasks && dayTasks.every((t: any) => t.status === 'completed');
        const isPastAndNotCompleted = hasTasks && !allCompleted && isBefore(cloneDay, startOfToday());
        
        // Requirement 4: Days when employee was absent appear red
        const attRecord = getEmployeeAttendance(dateKey, selectedEmployee);
        const isAbsent = attRecord?.status === 'Absent';
        const isHalfDay = attRecord?.status === 'Half-Day';
        
        const isApprovedLeave = (leaves || []).some((l: any) => {
          const empMatch = l.name === selectedEmployee || l.name?.trim() === selectedEmployee?.trim();
          return empMatch && l.status === 'Approved' && dateKey >= l.startDate && dateKey <= l.endDate;
        });

        const isMarkedAbsent = isAbsent || isApprovedLeave;

        // Styling hierarchy
        let bgColorClass = "";
        let dateColorClass = "text-secondary-dark";

        if (isSunday) {
          // Requirement 5: Sundays appear black
          bgColorClass = "bg-neutral-950 text-white hover:bg-neutral-900 border-neutral-800";
          dateColorClass = "text-white font-bold";
        } else if (isMarkedAbsent) {
          // Absent days appear red
          bgColorClass = "bg-red-500/15 text-red-900 border-red-500/30 hover:bg-red-500/25";
          dateColorClass = "text-red-700 font-bold";
        } else if (isHalfDay) {
          bgColorClass = "bg-amber-500/10 text-amber-900 border-amber-500/30 hover:bg-amber-500/20";
          dateColorClass = "text-amber-800 font-bold";
        } else if (allCompleted) {
          bgColorClass = "bg-green-500/10 text-secondary-dark hover:bg-green-500/20";
        } else if (isPastAndNotCompleted) {
          bgColorClass = "bg-red-500/10 text-secondary-dark hover:bg-red-500/20";
        } else if (isSameDay(cloneDay, new Date())) {
          bgColorClass = "bg-primary/5 text-primary-dark hover:bg-canvas-variant/30";
        } else {
          bgColorClass = "bg-canvas-surface text-secondary-dark hover:bg-canvas-variant/30";
        }

        const isToday = isSameDay(cloneDay, new Date());

        // Requirement 2: Fixed block height (h-[125px]) and scrollable task list so blocks never change shape
        cells.push(
          <div
            key={cloneDay.toISOString()}
            className={`h-[125px] flex flex-col p-2 border-b border-r border-canvas-variant cursor-pointer transition-colors overflow-hidden select-none ${bgColorClass}`}
            onClick={() => onDateClick(cloneDay)}
          >
            {/* Header with Date number and Badges */}
            <div className="flex justify-between items-start flex-shrink-0 mb-1">
              <span className={`text-xs font-semibold ${isToday ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-sm' : dateColorClass}`}>
                {formattedDate}
              </span>
              <div className="flex items-center gap-1">
                {isMarkedAbsent && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-100 dark:bg-red-950/70 px-1 py-0.5 rounded border border-red-200">
                    Absent
                  </span>
                )}
                {isHalfDay && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-950/70 px-1 py-0.5 rounded border border-amber-200">
                    Half-Day
                  </span>
                )}
                {hasTasks && !isMarkedAbsent && (
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                )}
              </div>
            </div>

            {/* Scrollable Tasks list inside cell with quick-delete on hover */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
              {hasTasks && dayTasks.map((t: any) => (
                <div 
                  key={t.id} 
                  className={`group/task flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded truncate border ${
                    isSunday
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                      : t.status === 'completed' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-700 line-through' 
                        : 'bg-canvas border-canvas-variant text-secondary-dark'
                  }`}
                >
                  <span className="truncate flex-1">{t.title}</span>
                  {/* Requirement 3: Quick delete option */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTask(t.id, e)}
                    className="opacity-0 group-hover/task:opacity-100 ml-1 p-0.5 text-secondary-light hover:text-red-500 rounded transition-opacity flex-shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
    }

    return (
      <div className="w-full mt-4">
        {/* Month selector header */}
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

        {/* Days of week header (Sun appears dark) */}
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

        {/* 7-column Calendar Cells with rigid geometry */}
        <div className="grid grid-cols-7 bg-canvas-surface border-l border-canvas-variant rounded-b-lg overflow-hidden border-b">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Task Manager</h1>
        <p className="text-secondary-light text-sm mt-1">Select an employee to manage their assigned tasks.</p>
      </div>

      {renderEmployeeGrid()}

      {/* Main Calendar Modal for Selected Employee */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        title={`${selectedEmployee?.trim()}'s Calendar`}
        className="max-w-5xl"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold">
                {selectedEmployee?.trim().charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-secondary-dark">{selectedEmployee?.trim()}</h3>
                <p className="text-sm text-secondary-light">Manage tasks and schedules</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="warning">
                {tasksList.filter((t: any) => (t.assignee === selectedEmployee || t.assignee?.trim() === selectedEmployee?.trim()) && t.status === 'pending').length} Active
              </Badge>
              <Badge variant="success">
                {tasksList.filter((t: any) => (t.assignee === selectedEmployee || t.assignee?.trim() === selectedEmployee?.trim()) && t.status === 'completed').length} Completed
              </Badge>
            </div>
          </div>

          {renderCalendar()}
        </div>
      </Modal>

      {/* Mini Modal for Adding/Editing/Deleting Tasks & Managing Attendance on a Specific Day */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={`Tasks & Attendance: ${selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}`}
      >
        <div className="space-y-6 mt-4">
          {/* Attendance Status Quick-Selector */}
          {selectedDate && selectedEmployee && (() => {
            const dateKey = format(selectedDate, 'yyyy-MM-dd');
            const att = getEmployeeAttendance(dateKey, selectedEmployee);
            const currentStatus = att?.status || 'Not Marked';

            return (
              <div className="flex items-center justify-between p-3.5 bg-canvas/40 rounded-lg border border-canvas-variant">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary-light block">Attendance Status</span>
                  <span className="text-sm font-semibold text-secondary-dark flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${
                      currentStatus === 'Absent' ? 'bg-red-500' :
                      currentStatus === 'Present' ? 'bg-green-500' :
                      currentStatus === 'Half-Day' ? 'bg-amber-500' : 'bg-secondary-light/40'
                    }`} />
                    {currentStatus}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant={currentStatus === 'Present' ? 'primary' : 'secondary'}
                    className="text-xs h-7 px-2.5"
                    onClick={() => handleSetAttendance('Present')}
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStatus === 'Absent' ? 'destructive' : 'secondary'}
                    className="text-xs h-7 px-2.5"
                    onClick={() => handleSetAttendance('Absent')}
                  >
                    Absent
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStatus === 'Half-Day' ? 'primary' : 'secondary'}
                    className="text-xs h-7 px-2.5"
                    onClick={() => handleSetAttendance('Half-Day')}
                  >
                    Half-Day
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* Add New Task */}
          <div className="space-y-4 p-4 bg-canvas/30 rounded-lg border border-canvas-variant">
            <h4 className="font-semibold text-sm text-secondary-dark">Add New Task</h4>
            <div className="flex gap-4">
              <Input 
                placeholder="e.g. Call Client XYZ" 
                value={newTaskName} 
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTask(); }}
                className="flex-1"
              />
              <Button onClick={handleCreateTask} disabled={!newTaskName.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Existing Tasks with Status Selector & Requirement 3: Delete Option */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-secondary-dark">Existing Tasks</h4>
            {selectedDate && (tasks[format(selectedDate, 'yyyy-MM-dd')] || []).filter((t: any) => {
              return t.assignee === selectedEmployee || t.assignee?.trim() === selectedEmployee?.trim();
            }).length > 0 ? (
              (tasks[format(selectedDate, 'yyyy-MM-dd')] || [])
                .filter((t: any) => t.assignee === selectedEmployee || t.assignee?.trim() === selectedEmployee?.trim())
                .map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-canvas-surface rounded-lg border border-canvas-variant hover:border-canvas-variant/80 transition-colors">
                    <span className={`text-sm flex-1 pr-3 truncate ${t.status === 'completed' ? 'text-secondary-light line-through' : 'text-secondary-dark font-medium'}`}>
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={t.status}
                        onChange={(e) => updateTaskStatus(format(selectedDate, 'yyyy-MM-dd'), t.id, e.target.value)}
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'completed', label: 'Completed' }
                        ]}
                        className="h-8 py-1 text-xs w-28"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(t.id)}
                        className="h-8 w-8 text-secondary-light hover:text-red-600 hover:bg-red-500/10 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-secondary-light border border-dashed border-canvas-variant rounded-lg">
                No tasks assigned on this day.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
