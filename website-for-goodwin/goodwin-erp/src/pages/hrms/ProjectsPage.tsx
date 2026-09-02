import React, { useState } from 'react';
import { Briefcase, Plus, X, Calendar, Activity, List, Clock, AlertCircle } from 'lucide-react';
import { useData } from '../../store/DataContext';
import toast from 'react-hot-toast';

export function ProjectsPage() {
  const { hrmsProjects, hrmsTasks, hrmsTimesheets, hrmsEmployees, addHrmsProject, addHrmsTask, addHrmsTimesheet, updateHrmsTask, updateHrmsProject, updateHrmsTimesheet } = useData();
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'timesheets'>('projects');
  
  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);

  // Active Employees Filter
  const activeEmployees = hrmsEmployees.filter(e => e.status !== 'Inactive');

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-[#00a631]" />
            Projects & Tasks
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Manage initiatives, track tasks, and log timesheets.</p>
        </div>
        
        <div className="flex bg-white/40 dark:bg-gray-800/40 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-md relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-transparent text-[#3a3b39] dark:text-white outline-none cursor-pointer appearance-none pr-10 focus:ring-2 focus:ring-[#00a631] transition-all"
          >
            <option value="projects">Projects</option>
            <option value="tasks">Tasks</option>
            <option value="timesheets">Timesheets</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: KPI Cards ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="glass-card card-padded flex flex-col justify-between min-h-[160px] overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
              Active Projects
            </span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none truncate my-3 text-[#3a3b39] dark:text-white">
            {hrmsProjects.filter(p => p.status === 'Active' || p.status === 'Planning').length}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold leading-normal text-gray-500 dark:text-gray-400">
            <span>Ongoing initiatives</span>
          </div>
        </div>

        <div className="glass-card card-padded flex flex-col justify-between min-h-[160px] overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
              Total Tasks
            </span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#00a631]/10 text-[#00a631] dark:bg-[#00a631]/20">
              <List className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none truncate my-3 text-[#3a3b39] dark:text-white">
            {hrmsTasks.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold leading-normal text-gray-500 dark:text-gray-400">
            <span>Across all projects</span>
          </div>
        </div>

        <div className="glass-card card-padded flex flex-col justify-between min-h-[160px] overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
              Pending Tasks
            </span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none truncate my-3 text-[#3a3b39] dark:text-white">
            {hrmsTasks.filter(t => t.status !== 'Done').length}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold leading-normal text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Needs attention</span>
          </div>
        </div>

        <div className="glass-card card-padded flex flex-col justify-between min-h-[160px] overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
              Hours Logged
            </span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none truncate my-3 text-[#3a3b39] dark:text-white">
            {hrmsTimesheets.reduce((sum, t) => sum + Number(t.hours_worked || 0), 0)}
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">
              hrs
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold leading-normal text-gray-500 dark:text-gray-400">
            <span>Total timesheet hours</span>
          </div>
        </div>
      </div>

      {activeTab === 'projects' && (
        <ProjectsTab 
          projects={hrmsProjects} 
          onAdd={() => setShowProjectModal(true)} 
          updateProject={updateHrmsProject}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksTab 
          tasks={hrmsTasks} 
          onAdd={() => setShowTaskModal(true)} 
          updateTask={updateHrmsTask}
        />
      )}

      {activeTab === 'timesheets' && (
        <TimesheetsTab 
          timesheets={hrmsTimesheets} 
          onAdd={() => setShowTimesheetModal(true)} 
          updateTimesheet={updateHrmsTimesheet}
        />
      )}

      {/* Modals */}
      {showProjectModal && <AddProjectModal onClose={() => setShowProjectModal(false)} onSubmit={addHrmsProject} />}
      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} onSubmit={addHrmsTask} projects={hrmsProjects} employees={activeEmployees} />}
      {showTimesheetModal && <AddTimesheetModal onClose={() => setShowTimesheetModal(false)} onSubmit={addHrmsTimesheet} tasks={hrmsTasks} employees={activeEmployees} />}
    </div>
  );
}

// ============================================================================
// TABS
// ============================================================================

function ProjectsTab({ projects, onAdd, updateProject }: { projects: any[], onAdd: () => void, updateProject: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Active Projects</h2>
        <button onClick={onAdd} className="bg-[#00a631] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj.id} className="glass-card card-padded flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative group min-h-[180px]">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="space-y-2">
                <h3 className="font-extrabold text-xl text-[#3a3b39] dark:text-white leading-tight">{proj.name}</h3>
                <select
                  value={proj.status}
                  onChange={(e) => updateProject(proj.id, { status: e.target.value })}
                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer outline-none appearance-none ${
                    proj.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    proj.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  <option value="Planning">PLANNING</option>
                  <option value="Active">ACTIVE</option>
                  <option value="On Hold">ON HOLD</option>
                  <option value="Completed">COMPLETED</option>
                </select>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2 flex-grow">
              {proj.description || 'No description provided.'}
            </p>
            
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(proj.start_date).toLocaleDateString()}</div>
              <div className="flex items-center gap-1.5 text-[#00a631]"><Briefcase className="w-4 h-4" /> {proj.budget ? `₹${proj.budget.toLocaleString()}` : 'No Budget'}</div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-bold">No projects found. Create one to get started!</div>
        )}
      </div>
    </div>
  );
}

function TasksTab({ tasks, onAdd, updateTask }: { tasks: any[], onAdd: () => void, updateTask: any }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'To Do': return 'border-transparent';
      case 'In Progress': return 'border-blue-200 dark:border-blue-800/50 ring-1 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-900/10';
      case 'In Review': return 'border-yellow-200 dark:border-yellow-800/50 ring-1 ring-yellow-500/20 bg-yellow-50/10 dark:bg-yellow-900/10';
      case 'Done': return 'border-[#00a631]/30 ring-1 ring-[#00a631]/20 bg-[#00a631]/5';
      default: return 'border-transparent';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Tasks</h2>
        <button onClick={onAdd} className="bg-[#00a631] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task.id} className={`glass-card card-padded flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-h-[180px] ${getStatusColor(task.status)}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                task.priority === 'High' || task.priority === 'Urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                task.priority === 'Medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>{task.priority}</span>
              
              <select 
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value })}
                className="text-[10px] uppercase tracking-wider font-black bg-transparent outline-none cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              >
                <option value="To Do">TO DO</option>
                <option value="In Progress">IN PROGRESS</option>
                <option value="In Review">IN REVIEW</option>
                <option value="Done">DONE</option>
              </select>
            </div>
            
            <h3 className="font-extrabold text-lg text-[#3a3b39] dark:text-white mb-2 leading-tight flex-grow">{task.title}</h3>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold leading-normal text-gray-500 dark:text-gray-400 mb-6">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate">{task.project?.name || 'No Project'}</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black">
                  {task.employee ? task.employee.first_name[0] : '?'}
                </div>
                <span>{task.employee ? task.employee.first_name : 'Unassigned'}</span>
              </div>
              
              {task.due_date && (
                <div className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-bold">No tasks found. Create one to get started!</div>
        )}
      </div>
    </div>
  );
}

function TimesheetsTab({ timesheets, onAdd, updateTimesheet }: { timesheets: any[], onAdd: () => void, updateTimesheet: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Timesheets</h2>
        <button onClick={onAdd} className="bg-[#00a631] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Log Time
        </button>
      </div>

      <div className="bg-white/40 dark:bg-[#1b1e1b]/40 backdrop-blur-xl border border-white/40 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Date</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Task</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Hours</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-600 dark:text-gray-400">
                    {entry.employee ? `${entry.employee.first_name} ${entry.employee.last_name}` : 'Unknown'}
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{entry.task?.title || 'Unknown Task'}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{entry.notes}</p>
                  </td>
                  <td className="p-4 text-sm font-black text-[#00a631] text-right">
                    {entry.hours_worked} hrs
                  </td>
                  <td className="p-4">
                    <select
                      value={entry.status}
                      onChange={(e) => updateTimesheet(entry.id, { status: e.target.value })}
                      className={`px-2 py-1 rounded-md text-xs font-bold cursor-pointer outline-none appearance-none ${
                        entry.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        entry.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {timesheets.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">
                    No timesheets logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODALS
// ============================================================================

function AddProjectModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: 0,
    status: 'Planning'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name required');
    
    const submissionData = { ...formData };
    if (!submissionData.end_date) delete (submissionData as any).end_date;
    
    onSubmit(submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1b1e1b] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">New Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold resize-none h-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Budget (₹)</label>
            <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#00a631] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95 mt-4">Create Project</button>
        </form>
      </div>
    </div>
  );
}

function AddTaskModal({ onClose, onSubmit, projects, employees }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    priority: 'Medium',
    due_date: '',
    status: 'To Do'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.project_id) return toast.error('Title and Project required');
    
    const submissionData = { ...formData };
    if (!submissionData.due_date) delete (submissionData as any).due_date;
    if (!submissionData.assigned_to) delete (submissionData as any).assigned_to;
    
    onSubmit(submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1b1e1b] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Project</label>
            <select required value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold">
              <option value="">Select Project</option>
              {projects.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
            <select value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold">
              <option value="">Unassigned</option>
              {employees.map((e:any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-[#00a631] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95 mt-4">Create Task</button>
        </form>
      </div>
    </div>
  );
}

function AddTimesheetModal({ onClose, onSubmit, tasks, employees }: any) {
  const [formData, setFormData] = useState({
    task_id: '',
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: 1,
    notes: '',
    status: 'Pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task_id || !formData.employee_id) return toast.error('Task and Employee required');
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1b1e1b] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">Log Time</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Employee</label>
            <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold">
              <option value="">Select Employee</option>
              {employees.map((e:any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Task</label>
            <select required value={formData.task_id} onChange={e => setFormData({...formData, task_id: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold">
              <option value="">Select Task</option>
              {tasks.map((t:any) => <option key={t.id} value={t.id}>{t.title} ({t.project?.name})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Hours</label>
              <input type="number" step="0.5" required min="0.5" max="24" value={formData.hours_worked} onChange={e => setFormData({...formData, hours_worked: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00a631] outline-none font-bold" placeholder="What did you work on?" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#00a631] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#00a631]/30 transition-all active:scale-95 mt-4">Log Hours</button>
        </form>
      </div>
    </div>
  );
}
