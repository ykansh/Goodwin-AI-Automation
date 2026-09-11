import { create } from 'zustand';
import { supabase } from './supabase';

export interface Project {
  id: string;
  projectName: string;
  companyName: string;
  assignedTo: string;
  startDate: string | null;
  endDate: string | null;
  status: 'Not Started' | 'Running' | 'Completed';
  phase: 'Evaluation' | 'Designing' | 'Development' | 'Debugging';
  progress: number;
  budget: number;
}

export interface Client {
  id: string;
  name: string;
  businessType: string;
  package: string;
  value: number;
  status: string;
  startDate: string | null;
  nextReview: string | null;
  manager: string;
  whatsapp: string;
  mail: string;
  notes: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  assignedTo: string;
  purchaseDate: string;
  value: number;
}

export interface CrmLead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  lastContact: string;
  value: number;
}

export interface Task {
  id: string;
  date: string;
  title: string;
  assignee: string;
  status: string;
  priority: string;
}

export interface Workflow {
  id: string;
  projectId: string;
  nodes: any[];
  edges: any[];
}

export interface OperationsState {
  isLoading: boolean;
  error: string | null;
  projects: Project[];
  assets: Asset[];
  crmLeads: CrmLead[];
  tasks: Task[];
  workflows: Workflow[];
  clients: Client[];

  fetchOperationsData: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  addCrmLead: (lead: Omit<CrmLead, 'id'>) => Promise<void>;
  updateCrmLead: (id: string, lead: Partial<CrmLead>) => Promise<void>;
  deleteCrmLead: (id: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  updateWorkflow: (projectId: string, nodes: any[], edges: any[]) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;

  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  setProjects: (updater: (prev: Project[]) => Project[]) => void;
  setAssets: (updater: (prev: Asset[]) => Asset[]) => void;
  setCrmLeads: (updater: (prev: CrmLead[]) => CrmLead[]) => void;
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  setWorkflows: (updater: (prev: Workflow[]) => Workflow[]) => void;
  setClients: (updater: (prev: Client[]) => Client[]) => void;
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  isLoading: false,
  error: null,
  projects: [],
  assets: [],
  crmLeads: [],
  tasks: [],
  workflows: [],
  clients: [],

  fetchOperationsData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [
        { data: projData, error: projErr },
        { data: assetsData, error: assetsErr },
        { data: leadsData, error: leadsErr },
        { data: tasksData, error: tasksErr },
        { data: wfData, error: wfErr },
        { data: clientsData, error: clientsErr }
      ] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('assets').select('*'),
        supabase.from('crm_leads').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('workflows').select('*'),
        supabase.from('clients').select('*')
      ]);

      if (projErr) throw projErr;
      if (assetsErr) throw assetsErr;
      if (leadsErr) throw leadsErr;
      if (tasksErr) throw tasksErr;
      if (wfErr) throw wfErr;
      if (clientsErr && clientsErr.code !== '42P01') throw clientsErr;

      set({
        projects: projData.map(p => ({
          id: p.id, projectName: p.project_name, companyName: p.company_name, assignedTo: p.assigned_to, startDate: p.start_date, endDate: p.end_date, status: p.status, phase: p.phase, progress: p.progress, budget: p.budget
        })),
        assets: assetsData.map(a => ({
          id: a.id, name: a.name, type: a.type, status: a.status, assignedTo: a.assigned_to, purchaseDate: a.purchase_date, value: a.value
        })),
        crmLeads: leadsData.map(l => ({
          id: l.id, name: l.name, company: l.company, email: l.email, status: l.status, lastContact: l.last_contact, value: l.value
        })),
        tasks: tasksData.map(t => ({
          id: t.id, date: t.date, title: t.title, assignee: t.assignee, status: t.status, priority: t.priority
        })),
        workflows: wfData.map(w => ({
          id: w.id, projectId: w.project_id, nodes: w.nodes, edges: w.edges
        })),
        clients: (clientsData || []).map(c => ({
          id: c.id, name: c.name, businessType: c.business_type, package: c.package, value: c.value, status: c.status, startDate: c.start_date, nextReview: c.next_review, manager: c.manager, whatsapp: c.whatsapp, mail: c.mail, notes: c.notes
        })),
        isLoading: false
      });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message, isLoading: false });
    }
  },

  addProject: async (project) => {
    const { data, error } = await supabase.from('projects').insert([{
      project_name: project.projectName, 
      company_name: project.companyName, 
      assigned_to: project.assignedTo, 
      start_date: project.startDate || null, 
      end_date: project.endDate || null, 
      status: project.status, 
      phase: project.phase, 
      progress: project.progress, 
      budget: project.budget
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ projects: [...state.projects, { ...project, id: data.id }] }));
  },
  updateProject: async (id, project) => {
    const { error } = await supabase.from('projects').update({
      project_name: project.projectName, 
      company_name: project.companyName, 
      assigned_to: project.assignedTo, 
      start_date: project.startDate || null, 
      end_date: project.endDate || null, 
      status: project.status, 
      phase: project.phase, 
      progress: project.progress, 
      budget: project.budget
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ projects: state.projects.map(p => p.id === id ? { ...p, ...project } : p) }));
  },
  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ projects: state.projects.filter(p => p.id !== id) }));
  },

  addAsset: async (asset) => {
    const { data, error } = await supabase.from('assets').insert([{
      name: asset.name, type: asset.type, status: asset.status, assigned_to: asset.assignedTo, purchase_date: asset.purchaseDate, value: asset.value
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ assets: [...state.assets, { ...asset, id: data.id }] }));
  },
  updateAsset: async (id, asset) => {
    const { error } = await supabase.from('assets').update({
      name: asset.name, type: asset.type, status: asset.status, assigned_to: asset.assignedTo, purchase_date: asset.purchaseDate, value: asset.value
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ assets: state.assets.map(a => a.id === id ? { ...a, ...asset } : a) }));
  },
  deleteAsset: async (id) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ assets: state.assets.filter(a => a.id !== id) }));
  },

  addCrmLead: async (lead) => {
    const { data, error } = await supabase.from('crm_leads').insert([{
      name: lead.name, company: lead.company, email: lead.email, status: lead.status, last_contact: lead.lastContact, value: lead.value
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ crmLeads: [...state.crmLeads, { ...lead, id: data.id }] }));
  },
  updateCrmLead: async (id, lead) => {
    const { error } = await supabase.from('crm_leads').update({
      name: lead.name, company: lead.company, email: lead.email, status: lead.status, last_contact: lead.lastContact, value: lead.value
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ crmLeads: state.crmLeads.map(l => l.id === id ? { ...l, ...lead } : l) }));
  },
  deleteCrmLead: async (id) => {
    const { error } = await supabase.from('crm_leads').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ crmLeads: state.crmLeads.filter(l => l.id !== id) }));
  },

  addTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([{
      date: task.date, title: task.title, assignee: task.assignee, status: task.status, priority: task.priority
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ tasks: [...state.tasks, { ...task, id: data.id }] }));
  },
  updateTask: async (id, task) => {
    const { error } = await supabase.from('tasks').update({
      date: task.date, title: task.title, assignee: task.assignee, status: task.status, priority: task.priority
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, ...task } : t) }));
  },
  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },

  updateWorkflow: async (projectId, nodes, edges) => {
    const existing = get().workflows.find(w => w.projectId === projectId);
    
    // Clean nodes and edges of any undefined values that Supabase might reject
    const cleanNodes = JSON.parse(JSON.stringify(nodes));
    const cleanEdges = JSON.parse(JSON.stringify(edges));
    
    if (existing && existing.id && existing.id !== 'new') {
      const { error } = await supabase.from('workflows').update({
        nodes: cleanNodes, edges: cleanEdges
      }).eq('id', existing.id);
      if (error) throw error;
      
      set(state => ({
        workflows: state.workflows.map(w => w.projectId === projectId ? { ...w, nodes, edges } : w)
      }));
    } else {
      const { data, error } = await supabase.from('workflows').insert({
        project_id: projectId, nodes: cleanNodes, edges: cleanEdges
      }).select().single();
      if (error) throw error;
      
      if (data) {
        set(state => ({
          workflows: [...state.workflows.filter(w => w.projectId !== projectId), { id: data.id, projectId: data.project_id, nodes: data.nodes, edges: data.edges }]
        }));
      }
    }
  },

  setProjects: (updater) => set(state => ({ projects: updater(state.projects) })),
  setAssets: (updater) => set(state => ({ assets: updater(state.assets) })),
  setCrmLeads: (updater) => set(state => ({ crmLeads: updater(state.crmLeads) })),
  setTasks: (updater) => set(state => ({ tasks: updater(state.tasks) })),
  setWorkflows: (updater) => set(state => ({ workflows: updater(state.workflows) })),
  setClients: (updater) => set(state => ({ clients: updater(state.clients) })),

  deleteWorkflow: async (id) => {
    const { error } = await supabase.from('workflows').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ workflows: state.workflows.filter(w => w.id !== id) }));
  },

  addClient: async (client) => {
    const { data, error } = await supabase.from('clients').insert([{
      name: client.name, business_type: client.businessType, package: client.package, value: client.value, status: client.status, start_date: client.startDate || null, next_review: client.nextReview || null, manager: client.manager, whatsapp: client.whatsapp, mail: client.mail, notes: client.notes
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ clients: [...state.clients, { ...client, id: data.id }] }));
  },
  updateClient: async (id, client) => {
    const { error } = await supabase.from('clients').update({
      name: client.name, business_type: client.businessType, package: client.package, value: client.value, status: client.status, start_date: client.startDate || null, next_review: client.nextReview || null, manager: client.manager, whatsapp: client.whatsapp, mail: client.mail, notes: client.notes
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ clients: state.clients.map(c => c.id === id ? { ...c, ...client } : c) }));
  },
  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
  }
}));
