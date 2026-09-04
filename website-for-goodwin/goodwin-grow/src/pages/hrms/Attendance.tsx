import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';

const mockAttendance = [
  { id: 1, name: 'Alice Smith', role: 'Senior Dev', status: 'present', checkIn: '09:00 AM', checkOut: '05:30 PM', workHours: '8h 30m' },
  { id: 2, name: 'Bob Johnson', role: 'Marketing Lead', status: 'absent', checkIn: '--', checkOut: '--', workHours: '0h' },
  { id: 3, name: 'Charlie Davis', role: 'Designer', status: 'late', checkIn: '10:15 AM', checkOut: '--', workHours: 'In Progress' },
];

export const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search by name..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="px-3">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="text-sm font-medium text-secondary-light bg-canvas px-4 py-2 rounded-md border border-canvas-variant">
          Today: <span className="text-secondary-dark">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAttendance.map((record) => (
          <Card key={record.id} className="hover:shadow-level-2 transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{record.name}</CardTitle>
                <p className="text-xs text-secondary-light">{record.role}</p>
              </div>
              <Badge 
                variant={
                  record.status === 'present' ? 'success' : 
                  record.status === 'late' ? 'warning' : 'destructive'
                }
              >
                {record.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-canvas-variant pb-2">
                  <span className="text-secondary-light flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-primary" /> Check In
                  </span>
                  <span className="font-medium">{record.checkIn}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-canvas-variant pb-2">
                  <span className="text-secondary-light flex items-center">
                    <XCircle className="h-4 w-4 mr-1 text-secondary-light" /> Check Out
                  </span>
                  <span className="font-medium">{record.checkOut}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary-light flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Total Hours
                  </span>
                  <span className="font-medium text-secondary-dark">{record.workHours}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
