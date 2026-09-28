import React, { useState, useMemo } from 'react';
import { Download, Filter, Search, Plus, Calendar, Edit, Trash2, FolderKanban, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useOperationsStore } from '../../lib/operationsStore';
import { useStore } from '../../lib/store';
import { useCurrentUser, isSameEmployee } from '../../lib/useCurrentUser';

export const Projects = () => {
  const employees = useStore((state: any) => state.employees);
  const projects = useOperationsStore((state: any) => state.projects);
  const addProject = useOperationsStore((state: any) => state.addProject);
  const updateProject = useOperationsStore((state: any) => state.updateProject);
  const deleteProject = useOperationsStore((state: any) => state.deleteProject);

  const { isAdmin, isEmployee, employeeName } = useCurrentUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    id: 0,
    companyName: '',
    projectName: '',
    assignedTo: '',
    startDate: new Date().toISOString().split('T')[0],
    phase: 'Evaluation',
    endDate: '',
    budget: 0,
    status: 'Not Started'
  });

  // Filter projects by current employee if employee role, or by filter for admin
  const visibleProjects = useMemo(() => {
    let list = projects || [];
    if (isEmployee) {
      list = list.filter((p: any) => isSameEmployee(p.assignedTo, employeeName));
    } else if (selectedAssigneeFilter !== 'all') {
      list = list.filter((p: any) => isSameEmployee(p.assignedTo, selectedAssigneeFilter));
    }
    return list;
  }, [projects, isEmployee, employeeName, selectedAssigneeFilter]);

  const filteredProjects = visibleProjects.filter((p: any) => 
    p.projectName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    p.companyName?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const getPhaseColor = (phase: string) => {
    switch(phase) {
      case 'Evaluation': return 'bg-canvas-variant text-secondary-dark';
      case 'Designing': return 'bg-primary/10 text-primary-dark';
      case 'Development': return 'bg-warning/10 text-warning';
      case 'Debugging': return 'bg-danger/10 text-danger';
      default: return 'bg-canvas-variant text-secondary-dark';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Running': return <Badge variant="default">Running</Badge>;
      case 'Not Started': return <Badge variant="default">Not Started</Badge>;
      default: return null;
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      id: Date.now(),
      companyName: '',
      projectName: '',
      assignedTo: isEmployee ? employeeName : (employees?.[0]?.name || ''),
      startDate: new Date().toISOString().split('T')[0],
      phase: 'Evaluation',
      endDate: '',
      budget: 0,
      status: 'Not Started'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setFormData({...p});
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert('Only administrators can delete projects.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName.trim() || !formData.projectName.trim()) {
      alert('Please fill in both Company Name and Project Name.');
      return;
    }

    const payload = {
      ...formData,
      // Enforce assignedTo as the employee themselves if role is employee
      assignedTo: isEmployee ? employeeName : formData.assignedTo
    };

    if (isEditing) {
      await updateProject(formData.id, payload);
    } else {
      await addProject(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">
              {isEmployee ? 'My Assigned Projects' : 'Projects'}
            </h1>
            <Badge variant="default" className="bg-primary/10 text-primary-dark border-primary/20">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
            </Badge>
          </div>
          <p className="text-secondary-light text-sm mt-1">
            {isEmployee 
              ? `Showing projects currently assigned to you (${employeeName}). You can update project status and phases.`
              : 'Manage ongoing work and team assignments across all clients.'}
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button variant="secondary" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <Input 
            type="text" 
            placeholder="Search projects..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Assignee Filter (Admin only) */}
        {isAdmin && (
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-secondary-light font-medium whitespace-nowrap">Filter Assignee:</span>
            <select
              value={selectedAssigneeFilter}
              onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-canvas border border-canvas-variant rounded-md text-secondary-dark focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Team Members ({projects?.length || 0})</option>
              {employees?.map((emp: any) => {
                const count = projects?.filter((p: any) => isSameEmployee(p.assignedTo, emp.name)).length || 0;
                return (
                  <option key={emp.id} value={emp.name}>
                    {emp.name.trim()} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-canvas-surface p-12 rounded-xl border border-canvas-variant text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-secondary-dark">
            {isEmployee ? 'No Projects Assigned to You' : 'No Projects Found'}
          </h3>
          <p className="text-sm text-secondary-light max-w-md mx-auto">
            {isEmployee 
              ? `You currently don't have any projects assigned under the name "${employeeName}". Projects assigned to you will show up here automatically.`
              : 'There are no projects matching your search filter.'}
          </p>
          <div className="pt-2">
            <Button onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project: any) => (
            <div key={project.id} className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative flex flex-col justify-between">
              <div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(project)} title="Edit Project">
                    <Edit className="h-4 w-4 text-secondary-light" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(project.id)} title="Delete Project">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="mb-4 pr-16">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-lg text-secondary-dark">{project.companyName}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="text-secondary-dark font-medium">{project.projectName}</p>
                </div>

                <div className="space-y-3 mt-6 border-t border-canvas-variant pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-light">Assignee</span>
                    <span className="text-secondary-dark font-medium flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary mr-1.5"></span>
                      {project.assignedTo}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-light">Phase</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPhaseColor(project.phase)}`}>
                      {project.phase}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-light">Timeline</span>
                    <div className="flex items-center text-secondary-dark">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{project.startDate || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-light">Budget</span>
                    <span className="text-secondary-dark font-medium">₹{Number(project.budget || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-canvas-variant/50 mt-4 flex justify-between items-center text-xs">
                <span className="text-secondary-light">Status: <strong className="text-secondary-dark">{project.status}</strong></span>
                <button
                  onClick={() => handleOpenEditModal(project)}
                  className="text-primary hover:underline font-medium"
                >
                  Update Phase →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Project" : "New Project"}>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Company Name</label>
              <Input 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                placeholder="Client / Company"
              />
            </div>
            <div>
              <label className="enterprise-label">Project Name</label>
              <Input 
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                placeholder="Project title"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Assignee</label>
              {isEmployee ? (
                <div>
                  <Input 
                    value={employeeName}
                    disabled
                    className="bg-canvas/60 cursor-not-allowed text-secondary-dark font-medium"
                  />
                  <span className="text-[10px] text-secondary-light mt-0.5 block">Locked to your profile</span>
                </div>
              ) : (
                <Select 
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  options={employees?.map((e: any) => ({ value: e.name.trim(), label: e.name.trim() })) || []}
                />
              )}
            </div>
            <div>
              <label className="enterprise-label">Phase</label>
              <Select 
                value={formData.phase}
                onChange={(e) => setFormData({...formData, phase: e.target.value})}
                options={[
                  {value: 'Evaluation', label: 'Evaluation'},
                  {value: 'Designing', label: 'Designing'},
                  {value: 'Development', label: 'Development'},
                  {value: 'Debugging', label: 'Debugging'}
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Start Date</label>
              <Input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="enterprise-label">Status</label>
              <Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                options={[
                  {value: 'Not Started', label: 'Not Started'},
                  {value: 'Running', label: 'Running'},
                  {value: 'Completed', label: 'Completed'}
                ]}
              />
            </div>
          </div>

          <div>
            <label className="enterprise-label">Budget (₹)</label>
            <Input 
              type="number"
              value={formData.budget}
              disabled={isEmployee}
              onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
              className={isEmployee ? "bg-canvas/50 cursor-not-allowed" : ""}
            />
            {isEmployee && (
              <span className="text-[10px] text-secondary-light mt-0.5 block">Budget can only be modified by an administrator.</span>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Create Project"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
