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
import { useCurrentUser, isSameEmployee } from '../../lib/useCurrentUser';

export const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const employees = useStore((state) => state.employees);
  const deleteEmployee = useStore((state) => state.deleteEmployee);
  const addEmployee = useStore((state) => state.addEmployee);
  const updateEmployee = useStore((state) => state.updateEmployee);

  const { isAdmin, employeeName } = useCurrentUser();
  
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
    notes: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Edit Employee State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const handleAddEmployee = async () => {
    if (!newEmployee.name) return;
    await addEmployee(newEmployee as any);
    setIsAddModalOpen(false);
    setNewEmployee({ name: '', role: '', type: 'Full-time', salary: 0, status: 'active', phone: '', email: '', skills: '', notes: '', joinDate: new Date().toISOString().split('T')[0] });
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      type: emp.type || 'Full-time',
      salary: emp.salary || 0,
      joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
      status: emp.status || 'active',
      phone: emp.phone || '',
      email: emp.email || '',
      skills: emp.skills || '',
      notes: emp.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee || !editingEmployee.id) return;
    try {
      await updateEmployee(editingEmployee.id, {
        name: editingEmployee.name,
        role: editingEmployee.role,
        type: editingEmployee.type,
        salary: Number(editingEmployee.salary),
        joinDate: editingEmployee.joinDate,
        status: editingEmployee.status,
        phone: editingEmployee.phone,
        email: editingEmployee.email,
        skills: editingEmployee.skills,
        notes: editingEmployee.notes
      });
      setIsEditModalOpen(false);
      setEditingEmployee(null);
    } catch (err: any) {
      alert('Failed to update employee: ' + err.message);
    }
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
        
        {isAdmin && (
          <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Salary / Stipend</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Skills</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium text-secondary-dark">{emp.name}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    emp.type === 'Intern' 
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' 
                      : 'bg-canvas text-secondary-light'
                  }`}>
                    {emp.type}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {isAdmin || isSameEmployee(emp.name, employeeName)
                    ? `₹${emp.salary.toLocaleString()}`
                    : '••••••'}
                </TableCell>
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
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-secondary-light hover:text-primary"
                        onClick={() => handleOpenEdit(emp)}
                        title="Edit Employee & Join Date"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-danger hover:text-danger" 
                        onClick={() => deleteEmployee(emp.id)}
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Employee Modal */}
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
              placeholder="e.g. Automation Intern"
            />
          </div>
          <div>
            <label className="enterprise-label">Type</label>
            <Select 
              value={newEmployee.type} 
              onChange={(e) => setNewEmployee({...newEmployee, type: e.target.value})}
              options={[
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Intern', label: 'Intern (Stipend)' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Contractor', label: 'Contractor' }
              ]}
            />
          </div>
          <div>
            <label className="enterprise-label">Salary / Stipend (₹)</label>
            <Input 
              type="number"
              value={newEmployee.salary.toString()} 
              onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="enterprise-label">Date of Joining</label>
            <Input 
              type="date"
              value={newEmployee.joinDate} 
              onChange={(e) => setNewEmployee({...newEmployee, joinDate: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-canvas-variant mt-6">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Employee: ${editingEmployee.name}`}>
          <div className="space-y-4 mt-4">
            <div>
              <label className="enterprise-label">Full Name</label>
              <Input 
                value={editingEmployee.name} 
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
              />
            </div>
            <div>
              <label className="enterprise-label">Role / Designation</label>
              <Input 
                value={editingEmployee.role} 
                onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="enterprise-label">Employment Type</label>
                <Select 
                  value={editingEmployee.type} 
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, type: e.target.value })}
                  options={[
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Intern', label: 'Intern (Stipend)' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Contractor', label: 'Contractor' }
                  ]}
                />
              </div>
              <div>
                <label className="enterprise-label">Status</label>
                <Select 
                  value={editingEmployee.status} 
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'on_leave', label: 'On Leave' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="enterprise-label">Monthly Salary / Stipend (₹)</label>
                <Input 
                  type="number"
                  value={editingEmployee.salary.toString()} 
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="enterprise-label">Date of Joining</label>
                <Input 
                  type="date"
                  value={editingEmployee.joinDate} 
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, joinDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="enterprise-label">Email</label>
                <Input 
                  value={editingEmployee.email} 
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                />
              </div>
              <div>
                <label className="enterprise-label">Phone</label>
                <Input 
                  value={editingEmployee.phone} 
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t border-canvas-variant mt-6">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
