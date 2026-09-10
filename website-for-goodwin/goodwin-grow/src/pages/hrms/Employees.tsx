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
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

import { useStore } from '../../lib/store';

export const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const employees = useStore((state) => state.employees);
  const deleteEmployee = useStore((state) => state.deleteEmployee);
  const addEmployee = useStore((state) => state.addEmployee);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    type: 'Full-time',
    salary: 0,
    status: 'active',
    phone: '',
    email: '',
    skills: '',
    notes: ''
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.name) return;
    await addEmployee(newEmployee);
    setIsAddModalOpen(false);
    setNewEmployee({ name: '', role: '', type: 'Full-time', salary: 0, status: 'active', phone: '', email: '', skills: '', notes: '' });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    emp.role?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

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
        
        <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
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
            {filteredEmployees.map((emp) => (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger" onClick={() => deleteEmployee(emp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
        <div className="space-y-4 mt-4">
          <div>
            <label className="enterprise-label">Name</label>
            <Input 
              value={newEmployee.name} 
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="enterprise-label">Role</label>
            <Input 
              value={newEmployee.role} 
              onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div>
            <label className="enterprise-label">Type</label>
            <Select 
              value={newEmployee.type} 
              onChange={(e) => setNewEmployee({...newEmployee, type: e.target.value})}
              options={[{value: 'Full-time', label: 'Full-time'}, {value: 'Part-time', label: 'Part-time'}, {value: 'Contractor', label: 'Contractor'}]}
            />
          </div>
          <div>
            <label className="enterprise-label">Salary</label>
            <Input 
              type="number"
              value={newEmployee.salary.toString()} 
              onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-canvas-variant mt-6">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
