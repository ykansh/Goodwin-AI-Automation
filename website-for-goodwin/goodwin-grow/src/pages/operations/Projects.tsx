import React, { useState } from 'react';
import { Download, Filter, Search, Plus, Calendar, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useOperationsStore } from '../../lib/operationsStore';
import { useStore } from '../../lib/store';

export const Projects = () => {
  const employees = useStore((state: any) => state.employees);
  const projects = useOperationsStore((state: any) => state.projects);
  const setProjects = useOperationsStore((state: any) => state.setProjects);
  const addProject = useOperationsStore((state: any) => state.addProject);
  const updateProject = useOperationsStore((state: any) => state.updateProject);
  const deleteProject = useOperationsStore((state: any) => state.deleteProject);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const filteredProjects = projects?.filter((p: any) => 
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
      assignedTo: employees?.[0]?.name || '',
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
    await deleteProject(id);
  };

  const handleSave = async () => {
    if (isEditing) {
      await updateProject(formData.id, formData);
    } else {
      await addProject(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Projects</h1>
          <p className="text-secondary-light text-sm mt-1">Manage ongoing work across all clients.</p>
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
        <Button variant="secondary" className="w-full sm:w-auto px-3">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects?.map((project: any) => (
          <div key={project.id} className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(project)}>
                <Edit className="h-4 w-4 text-secondary-light" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(project.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
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
                <span className="text-secondary-dark font-medium">{project.assignedTo}</span>
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
                  <span>{project.startDate}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-light">Budget</span>
                <span className="text-secondary-dark font-medium">${Number(project.budget || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Project" : "New Project"}>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Company Name</label>
              <Input 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div>
              <label className="enterprise-label">Project Name</label>
              <Input 
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="enterprise-label">Assignee</label>
              <Select 
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                options={employees?.map((e: any) => ({ value: e.name, label: e.name })) || []}
              />
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
            <label className="enterprise-label">Budget</label>
            <Input 
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
            />
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
