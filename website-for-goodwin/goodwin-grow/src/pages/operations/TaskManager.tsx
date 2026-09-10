import React, { useState } from 'react';
import { useOperationsStore } from '../../lib/operationsStore';

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Clock, User } from 'lucide-react';
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
  startOfToday
} from 'date-fns';

// Initial Mock Tasks removed

export const TaskManager = () => {
  const employees = useStore((state: any) => state.employees);
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
    if (!selectedDate || !newTaskName || !selectedEmployee) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    await addTask({
      date: dateKey,
      title: newTaskName,
      assignee: selectedEmployee,
      status: 'pending',
      priority: 'Medium'
    });
    setNewTaskName('');
    setIsTaskModalOpen(false);
  };

  const updateTaskStatus = async (dateKey: string, taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  // Render Employee Grid
  const renderEmployeeGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((emp: any) => {
          // Count active tasks for this employee
          let activeTasks = 0;
          Object.values(tasks).forEach(dayTasks => {
            activeTasks += dayTasks.filter((t: any) => t.assignee === emp.name && t.status === 'pending').length;
          });

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
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        
        const dayTasks = (tasks[dateKey] || []).filter((t: any) => t.assignee === selectedEmployee);
        const hasTasks = dayTasks.length > 0;
        const allCompleted = hasTasks && dayTasks.every((t: any) => t.status === 'completed');
        const isPastAndNotCompleted = hasTasks && !allCompleted && isBefore(cloneDay, startOfToday());
        
        let bgColorClass = !isSameMonth(day, monthStart)
          ? "bg-canvas text-secondary-light/50 hover:bg-canvas-variant/30"
          : isSameDay(day, new Date()) 
            ? "bg-primary/5 text-primary-dark hover:bg-canvas-variant/30" 
            : "bg-canvas-surface text-secondary-dark hover:bg-canvas-variant/30";

        if (allCompleted) {
          bgColorClass = "bg-green-500/10 text-secondary-dark hover:bg-green-500/20";
        } else if (isPastAndNotCompleted) {
          bgColorClass = "bg-red-500/10 text-secondary-dark hover:bg-red-500/20";
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
              {hasTasks && (
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              )}
            </div>
            <div className="mt-2 space-y-1">
               {hasTasks && dayTasks.map((t: any) => (
                  <div 
                    key={t.id} 
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${t.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-700 line-through' : 'bg-canvas border-canvas-variant text-secondary-dark'}`}
                  >
                    {t.title}
                  </div>
               ))}
            </div>
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
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Task Manager</h1>
        <p className="text-secondary-light text-sm mt-1">Select an employee to manage their assigned tasks.</p>
      </div>

      {renderEmployeeGrid()}

      {/* Main Calendar Modal for Selected Employee */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        title={`${selectedEmployee}'s Calendar`}
        className="max-w-5xl"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold">
                {selectedEmployee?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-secondary-dark">{selectedEmployee}</h3>
                <p className="text-sm text-secondary-light">Manage tasks and schedules</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="warning">
                {tasksList.filter((t: any) => t.assignee === selectedEmployee && t.status === 'pending').length} Active
              </Badge>
              <Badge variant="success">
                {tasksList.filter((t: any) => t.assignee === selectedEmployee && t.status === 'completed').length} Completed
              </Badge>
            </div>
          </div>

          {renderCalendar()}
        </div>
      </Modal>

      {/* Mini Modal for Adding/Editing Tasks on a Specific Day */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={`Tasks on ${selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}`}
      >
        <div className="space-y-6 mt-4">
          <div className="space-y-4 p-4 bg-canvas/30 rounded-lg border border-canvas-variant">
            <h4 className="font-semibold text-sm text-secondary-dark">Add New Task</h4>
            <div className="flex gap-4">
              <Input 
                placeholder="e.g. Call Client XYZ" 
                value={newTaskName} 
                onChange={(e) => setNewTaskName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateTask} disabled={!newTaskName}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-secondary-dark">Existing Tasks</h4>
            {selectedDate && (tasks[format(selectedDate, 'yyyy-MM-dd')] || []).filter((t: any) => t.assignee === selectedEmployee).length > 0 ? (
              (tasks[format(selectedDate, 'yyyy-MM-dd')] || [])
                .filter((t: any) => t.assignee === selectedEmployee)
                .map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-canvas-surface rounded-lg border border-canvas-variant">
                    <span className={`text-sm ${t.status === 'completed' ? 'text-secondary-light line-through' : 'text-secondary-dark'}`}>
                      {t.title}
                    </span>
                    <Select 
                      value={t.status}
                      onChange={(e) => updateTaskStatus(format(selectedDate, 'yyyy-MM-dd'), t.id, e.target.value)}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'completed', label: 'Completed' }
                      ]}
                      className="h-8 py-1 text-xs w-32"
                    />
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
