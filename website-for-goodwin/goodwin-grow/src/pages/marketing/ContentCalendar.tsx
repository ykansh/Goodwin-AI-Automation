import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
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
  addDays 
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        const hasTasks = mockTasks[dateKey] && mockTasks[dateKey].length > 0;

        days.push(
          <div
            className={`flex-1 min-h-[100px] border-b border-r border-canvas-variant p-2 cursor-pointer transition-colors hover:bg-canvas-variant/30 ${
              !isSameMonth(day, monthStart)
                ? "bg-canvas text-secondary-light/50"
                : isSameDay(day, new Date()) ? "bg-primary/5 text-primary-dark" : "bg-canvas-surface text-secondary-dark"
            }`}
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
               {hasTasks && mockTasks[dateKey].map(t => (
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
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDate && mockTasks[format(selectedDate, 'yyyy-MM-dd')] ? (
                mockTasks[format(selectedDate, 'yyyy-MM-dd')].map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-secondary-dark">{t.employee}</TableCell>
                    <TableCell>{t.task}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'completed' ? 'success' : 'warning'}>
                        {t.status}
                      </Badge>
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
