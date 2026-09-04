import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';

const mockEmployees = [
  { id: 1, name: 'Alice Smith', role: 'Senior Dev', type: 'Full-time', salary: 120000, joinDate: '2023-01-15', status: 'active', phone: '555-0101', email: 'alice@goodwin.com', skills: 'React, Node', notes: 'Top performer' },
  { id: 2, name: 'Bob Johnson', role: 'Marketing Lead', type: 'Full-time', salary: 95000, joinDate: '2024-03-01', status: 'on_leave', phone: '555-0202', email: 'bob@goodwin.com', skills: 'SEO, Ads', notes: 'Maternity leave' },
];

export const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search employees..." 
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
        
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Salary</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium text-secondary-dark">{emp.name}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.type}</TableCell>
                <TableCell className="text-right">${emp.salary.toLocaleString()}</TableCell>
                <TableCell>{emp.joinDate}</TableCell>
                <TableCell>
                  <Badge variant={emp.status === 'active' ? 'success' : 'warning'}>
                    {emp.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs">{emp.email}</div>
                  <div className="text-xs text-secondary-light">{emp.phone}</div>
                </TableCell>
                <TableCell className="text-xs text-secondary-light">{emp.skills}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
