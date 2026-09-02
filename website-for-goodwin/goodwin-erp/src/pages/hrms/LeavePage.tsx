import { useState } from 'react';
import { Plus, Calendar, X } from 'lucide-react';
import { useData } from '../../store/DataContext';
import toast from 'react-hot-toast';

export function LeavePage() {
  const { hrmsLeaves, hrmsEmployees, applyLeave, updateLeaveStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'Sick Leave',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    number_of_days: 1,
    reason: '',
    status: 'Pending'
  });

  const filteredLeaves = hrmsLeaves.filter(l => 
    l.employee?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.employee?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id) return toast.error('Select an employee');
    applyLeave(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white flex items-center gap-2">
          <Calendar className="w-8 h-8 text-[#00a631]" />
          Leave Management
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
            <span className="hidden sm:inline">Apply Leave</span>
          </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Type</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Duration</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((record) => (
                <tr key={record.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-bold text-[#3a3b39] dark:text-white">{record.employee?.first_name} {record.employee?.last_name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{record.leave_type}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{record.start_date} to {record.end_date} ({record.number_of_days} days)</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      record.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {record.status === 'Pending' && (
                      <>
                        <button onClick={() => updateLeaveStatus(record.id, 'Approved')} className="text-green-600 hover:text-green-800 font-bold text-sm">Approve</button>
                        <button onClick={() => updateLeaveStatus(record.id, 'Rejected')} className="text-red-600 hover:text-red-800 font-bold text-sm">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">No leave requests found.</td>
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
              <h2 className="text-xl font-extrabold text-[#3a3b39] dark:text-white">Apply Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Employee</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  required
                >
                  <option value="">Select an employee</option>
                  {hrmsEmployees.filter(e => e.status !== 'Inactive').map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, leave_type: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Number of Days</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.number_of_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, number_of_days: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-[#00a631] text-white rounded-xl hover:shadow-lg hover:shadow-[#00a631]/30 transition-all">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
