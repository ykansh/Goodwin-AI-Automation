import { useState } from 'react';
import { Plus, DollarSign, X } from 'lucide-react';
import { useData } from '../../store/DataContext';
import toast from 'react-hot-toast';

export function PayrollPage() {
  const { hrmsPayroll, hrmsEmployees, processPayroll, updateHrmsPayroll } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: 'August',
    year: new Date().getFullYear(),
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
    net_salary: 0,
    status: 'Processed'
  });

  const filteredPayroll = hrmsPayroll.filter(p => 
    p.employee?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeChange = (empId: string) => {
    const emp = hrmsEmployees.find(e => e.id === empId);
    if (emp) {
      const basic = emp.basic_salary || 0;
      setFormData(prev => ({
        ...prev,
        employee_id: empId,
        basic_salary: basic,
        net_salary: basic + prev.allowances - prev.deductions
      }));
    }
  };

  const calculateNet = (basic: number, allow: number, ded: number) => {
    setFormData(prev => ({
      ...prev,
      basic_salary: basic,
      allowances: allow,
      deductions: ded,
      net_salary: basic + allow - ded
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id) return toast.error('Select an employee');
    processPayroll(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-[#00a631]" />
          Payroll
        </h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-white/40 dark:bg-gray-800/40 border border-white/40 dark:border-gray-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a631] text-[#3a3b39] dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#00a631] text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Process Payroll</span>
          </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Period</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Basic</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Net Salary</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map((record) => (
                <tr key={record.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-bold text-[#3a3b39] dark:text-white">{record.employee?.first_name} {record.employee?.last_name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{record.month} {record.year}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">₹{record.basic_salary.toLocaleString()}</td>
                  <td className="p-4 font-bold text-[#00a631]">₹{record.net_salary.toLocaleString()}</td>
                  <td className="p-4">
                    <select
                      value={record.status}
                      onChange={(e) => updateHrmsPayroll(record.id, { status: e.target.value })}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer outline-none appearance-none ${
                        record.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        record.status === 'Processed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Processed">Processed</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredPayroll.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">No payroll records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-extrabold text-[#3a3b39] dark:text-white">Process Payroll</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Employee</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  required
                >
                  <option value="">Select an employee</option>
                  {hrmsEmployees.filter(e => e.status !== 'Inactive').map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Basic Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.basic_salary}
                    onChange={(e) => calculateNet(parseFloat(e.target.value) || 0, formData.allowances, formData.deductions)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Allowances (₹)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => calculateNet(formData.basic_salary, parseFloat(e.target.value) || 0, formData.deductions)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Deductions (₹)</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => calculateNet(formData.basic_salary, formData.allowances, parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Net Salary</label>
                  <div className="text-xl font-extrabold text-[#00a631]">₹{formData.net_salary.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-[#00a631] text-white rounded-xl hover:shadow-lg hover:shadow-[#00a631]/30 transition-all">Process</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
