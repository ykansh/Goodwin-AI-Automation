import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Users, Plus, X, Trash2, Edit2 } from 'lucide-react';

export function EmployeesPage() {
  const { hrmsEmployees, addHrmsEmployee, updateHrmsEmployee } = useData();
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0],
    basic_salary: 0,
    status: 'Active'
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      joining_date: new Date().toISOString().split('T')[0],
      basic_salary: 0,
      status: 'Active'
    });
    setEditingId(null);
  };

  const canAddEmployee = user?.role === 'admin' || user?.role === 'hr';

  const handleEdit = (employee: any) => {
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department || '',
      designation: employee.designation || '',
      joining_date: employee.joining_date ? new Date(employee.joining_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      basic_salary: employee.basic_salary || 0,
      status: employee.status || 'Active'
    });
    setEditingId(employee.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee? Their past attendance records will be preserved.")) {
      await updateHrmsEmployee(id, { status: 'Inactive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const result = await updateHrmsEmployee(editingId, formData);
      if (result) {
        setShowModal(false);
        resetForm();
      }
    } else {
      // Generate a unique employee ID
      const employee_id = `EMP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      const empData = {
        ...formData,
        employee_id
      };
      
      const result = await addHrmsEmployee(empData);
      if (result) {
        setShowModal(false);
        resetForm();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white flex items-center gap-2">
          <Users className="w-8 h-8 text-[#00a631]" />
          Employees
        </h1>
        
        {canAddEmployee && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#00a631] text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Email & Phone</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Department</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Designation</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Join Date</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th>
                {canAddEmployee && <th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {hrmsEmployees.filter(emp => emp.status !== 'Inactive').map((record) => (
                <tr key={record.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#3a3b39] dark:text-white">{record.first_name} {record.last_name}</p>
                    <p className="text-xs text-gray-500">{record.employee_id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-600 dark:text-gray-300">{record.email}</p>
                    <p className="text-xs text-gray-500">{record.phone}</p>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{record.department || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{record.designation || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{record.joining_date ? new Date(record.joining_date).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      record.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  {canAddEmployee && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(record)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {hrmsEmployees.filter(emp => emp.status !== 'Inactive').length === 0 && (
                <tr>
                  <td colSpan={canAddEmployee ? 7 : 6} className="p-8 text-center text-gray-500 font-bold">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-extrabold text-[#3a3b39] dark:text-white">
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joining_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, joining_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Basic Salary</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.basic_salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00a631] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95"
                >
                  {editingId ? 'Update Employee' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
