import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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

// Mock Tasks per Date
const mockTasks: Record<string, any[]> = {
  '2026-09-04': [
    { id: 1, employee: 'Sarah Jenkins', task: 'Review Q4 Ad Creatives', status: 'pending' },
    { id: 2, employee: 'Mike Ross', task: 'Publish LinkedIn Post', status: 'completed' },
  ],
  '2026-09-15': [
    { id: 3, employee: 'Elena Gilbert', task: 'Email Newsletter Blast', status: 'pending' },
  ]
};

export const ContentCalendar = () => {
  const employees = useStore(state => state.employees);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Record<string, any[]>>(mockTasks);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const updateTaskStatus = (dateKey: string, taskId: number, newStatus: string) => {
    setTasks(prev => {
      if (!prev[dateKey]) return prev;
      const updatedDayTasks = prev[dateKey].map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      return { ...prev, [dateKey]: updatedDayTasks };
    });
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-4 bg-canvas-surface px-6 rounded-t-lg border-b border-canvas-variant">
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
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="flex-1 text-center font-bold text-xs uppercase text-secondary-light tracking-wider py-3 border-b border-canvas-variant" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="flex bg-canvas-surface">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        const dayTasks = tasks[dateKey] || [];
        const hasTasks = dayTasks.length > 0;
        const allCompleted = hasTasks && dayTasks.every(t => t.status === 'completed');
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
               {hasTasks && tasks[dateKey].map(t => (
                  <div key={t.id} className="text-[10px] bg-canvas px-1.5 py-0.5 rounded text-secondary-dark truncate border border-canvas-variant">
                    {t.task}
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
    return <div className="bg-canvas-surface border-l border-canvas-variant rounded-b-lg overflow-hidden">{rows}</div>;
  };

  return (
    <div className="w-full">
      <div className="shadow-sm border border-canvas-variant rounded-lg bg-canvas-surface">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Tasks for ${selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}`}
        className="max-w-2xl"
      >
        <div className="mt-4 space-y-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="enterprise-label">Task Name</label>
              <Input 
                placeholder="e.g. Publish Newsletter" 
                value={newTaskName} 
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="enterprise-label">Assignee</label>
              <Select 
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                options={[
                  { value: '', label: 'Select Employee...' },
                  ...employees.map(emp => ({ value: emp.name, label: emp.name }))
                ]}
              />
            </div>
            <Button 
              onClick={() => {
                if (!selectedDate || !newTaskName || !selectedEmployee) return;
                const dateKey = format(selectedDate, 'yyyy-MM-dd');
                const newTask = {
                  id: Date.now(),
                  employee: selectedEmployee,
                  task: newTaskName,
                  status: 'pending'
                };
                setTasks(prev => ({
                  ...prev,
                  [dateKey]: [...(prev[dateKey] || []), newTask]
                }));
                setNewTaskName('');
                setSelectedEmployee('');
              }}
              disabled={!newTaskName || !selectedEmployee}
            >
              Create Task
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDate && tasks[format(selectedDate, 'yyyy-MM-dd')] ? (
                tasks[format(selectedDate, 'yyyy-MM-dd')].map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-secondary-dark">{t.employee}</TableCell>
                    <TableCell>{t.task}</TableCell>
                    <TableCell>
                      <Select 
                        value={t.status}
                        onChange={(e) => updateTaskStatus(format(selectedDate, 'yyyy-MM-dd'), t.id, e.target.value)}
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'completed', label: 'Completed' }
                        ]}
                        className="h-8 py-1 text-xs w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-secondary-light">
                    No tasks assigned for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Modal>
    </div>
  );
};
