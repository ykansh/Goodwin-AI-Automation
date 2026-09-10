import { create } from 'zustand';
import { supabase } from './supabase';

export interface Employee {
  id: string;
  name: string;
  role: string;
  type: string;
  salary: number;
  joinDate: string; // mapped from join_date
  status: string;
  phone: string;
  email: string;
  skills: string;
  notes: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day';

export interface AttendanceRecord {
  status: AttendanceStatus;
  arrival: string;
  departure: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  status: string;
  cvLink: string; // mapped from cv_link
  portfolioLink: string; // mapped from portfolio_link
  checklist?: { id: string; label: string; completed: boolean }[];
}

export interface GlobalState {
  isLoading: boolean;
  error: string | null;

  // HRMS - Employees
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'joinDate'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // HRMS - Attendance
  attendance: Record<string, Record<string, AttendanceRecord>>; // date -> employeeName -> record
  updateAttendance: (date: string, employeeName: string, record: AttendanceRecord) => Promise<void>;

  // HRMS - Recruitment & Onboarding
  recruits: Candidate[];
  onboardings: Candidate[];
  addRecruit: (candidate: Omit<Candidate, 'id'>) => Promise<void>;
  moveToOnboarding: (candidateId: string) => Promise<void>;
  toggleChecklistTask: (candidateId: string, taskId: string) => Promise<void>;
  completeOnboarding: (candidateId: string, employeeDetails: Partial<Employee>) => Promise<void>;

  // Dashboards metrics
  pipelineLeads: number;
  hotLeads: number;
  tasksDueToday: number;
  totalExpenses: number;
  revenue: number;
  
  fetchInitialData: () => Promise<void>;
}

export const useStore = create<GlobalState>((set, get) => ({
  isLoading: false,
  error: null,

  employees: [],
  attendance: {},
  recruits: [],
  onboardings: [],
  
  pipelineLeads: 0,
  hotLeads: 0,
  tasksDueToday: 0,
  totalExpenses: 0,
  revenue: 0,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch Employees
      const { data: empData, error: empError } = await supabase.from('employees').select('*');
      if (empError) throw empError;
      
      const employees = empData.map(e => ({
        id: e.id,
        name: e.name,
        role: e.role,
        type: e.type,
        salary: e.salary,
        joinDate: e.join_date,
        status: e.status,
        phone: e.phone,
        email: e.email,
        skills: e.skills,
        notes: e.notes
      }));

      // Fetch Attendance
      const { data: attData, error: attError } = await supabase.from('attendance').select('*');
      if (attError) throw attError;
      
      const attendanceObj: Record<string, Record<string, AttendanceRecord>> = {};
      attData.forEach(a => {
        if (!attendanceObj[a.date]) attendanceObj[a.date] = {};
        attendanceObj[a.date][a.employee_name] = {
          status: a.status as AttendanceStatus,
          arrival: a.arrival,
          departure: a.departure
        };
      });

      // Fetch Candidates
      const { data: candData, error: candError } = await supabase.from('candidates').select('*');
      if (candError) throw candError;
      
      const recruits = candData
        .filter(c => c.status !== 'Onboarding')
        .map(c => ({
          id: c.id,
          name: c.name,
          role: c.role,
          status: c.status,
          cvLink: c.cv_link,
          portfolioLink: c.portfolio_link,
          checklist: c.checklist
        }));

      const onboardings = candData
        .filter(c => c.status === 'Onboarding')
        .map(c => ({
          id: c.id,
          name: c.name,
          role: c.role,
          status: c.status,
          cvLink: c.cv_link,
          portfolioLink: c.portfolio_link,
          checklist: c.checklist
        }));

      // Fetch Metrics
      const { data: metData, error: metError } = await supabase.from('metrics').select('*').single();
      if (metError && metError.code !== 'PGRST116') throw metError; // ignore no rows

      set({
        employees,
        attendance: attendanceObj,
        recruits,
        onboardings,
        pipelineLeads: metData?.pipeline_leads || 842,
        hotLeads: metData?.hot_leads || 47,
        tasksDueToday: metData?.tasks_due_today || 12,
        totalExpenses: metData?.total_expenses || 42150,
        revenue: metData?.revenue || 142300,
        isLoading: false
      });
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addEmployee: async (emp) => {
    const { data, error } = await supabase.from('employees').insert([{
      name: emp.name,
      role: emp.role,
      type: emp.type,
      salary: emp.salary,
      status: emp.status,
      phone: emp.phone,
      email: emp.email,
      skills: emp.skills,
      notes: emp.notes
    }]).select().single();
    
    if (error) {
      console.error(error);
      return;
    }
    
    const newEmp = {
      id: data.id,
      name: data.name,
      role: data.role,
      type: data.type,
      salary: data.salary,
      joinDate: data.join_date,
      status: data.status,
      phone: data.phone,
      email: data.email,
      skills: data.skills,
      notes: data.notes
    };
    
    set(state => ({ employees: [...state.employees, newEmp] }));
  },

  updateEmployee: async (id, updatedFields) => {
    // Map camelCase back to snake_case if needed
    const dbUpdates: any = { ...updatedFields };
    if (updatedFields.joinDate) {
      dbUpdates.join_date = updatedFields.joinDate;
      delete dbUpdates.joinDate;
    }
    
    const { error } = await supabase.from('employees').update(dbUpdates).eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    
    set(state => ({
      employees: state.employees.map(emp => emp.id === id ? { ...emp, ...updatedFields } : emp)
    }));
  },

  deleteEmployee: async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    set(state => ({ employees: state.employees.filter(emp => emp.id !== id) }));
  },

  updateAttendance: async (date, employeeName, record) => {
    // Upsert attendance record
    const { error } = await supabase.from('attendance').upsert({
      date,
      employee_name: employeeName,
      status: record.status,
      arrival: record.arrival,
      departure: record.departure
    }, { onConflict: 'date, employee_name' });
    
    if (error) {
      console.error(error);
      return;
    }
    
    set(state => ({
      attendance: {
        ...state.attendance,
        [date]: {
          ...(state.attendance[date] || {}),
          [employeeName]: record
        }
      }
    }));
  },

  addRecruit: async (cand) => {
    const { data, error } = await supabase.from('candidates').insert([{
      name: cand.name,
      role: cand.role,
      status: cand.status || 'Interviewing',
      cv_link: cand.cvLink,
      portfolio_link: cand.portfolioLink,
      checklist: '[]'
    }]).select().single();
    
    if (error) {
      console.error(error);
      return;
    }
    
    set(state => ({
      recruits: [...state.recruits, {
        id: data.id,
        name: data.name,
        role: data.role,
        status: data.status,
        cvLink: data.cv_link,
        portfolioLink: data.portfolio_link,
        checklist: data.checklist
      }]
    }));
  },

  moveToOnboarding: async (candidateId) => {
    const checklist = [
      { id: 'c1', label: 'Sign Employment Contract', completed: false },
      { id: 'c2', label: 'Setup IT Accounts (Email, Slack)', completed: false },
      { id: 'c3', label: 'Provide Welcome Kit', completed: false },
      { id: 'c4', label: 'Manager Welcome Meeting', completed: false },
    ];
    
    const { error } = await supabase.from('candidates')
      .update({ status: 'Onboarding', checklist })
      .eq('id', candidateId);
      
    if (error) {
      console.error(error);
      return;
    }
    
    set(state => {
      const candidate = state.recruits.find(r => r.id === candidateId);
      if (!candidate) return state;
      return {
        recruits: state.recruits.filter(r => r.id !== candidateId),
        onboardings: [...state.onboardings, { ...candidate, status: 'Onboarding', checklist }]
      };
    });
  },

  toggleChecklistTask: async (candidateId, taskId) => {
    const state = get();
    const candidate = state.onboardings.find(c => c.id === candidateId);
    if (!candidate || !candidate.checklist) return;
    
    const newChecklist = candidate.checklist.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    
    const { error } = await supabase.from('candidates')
      .update({ checklist: newChecklist })
      .eq('id', candidateId);
      
    if (error) {
      console.error(error);
      return;
    }
    
    set({
      onboardings: state.onboardings.map(c => 
        c.id === candidateId ? { ...c, checklist: newChecklist } : c
      )
    });
  },

  completeOnboarding: async (candidateId, employeeDetails) => {
    const state = get();
    const candidate = state.onboardings.find(o => o.id === candidateId);
    if (!candidate) return;
    
    // First insert into employees
    const empInsert = {
      name: candidate.name,
      role: candidate.role,
      type: 'Full-time',
      salary: 0,
      status: 'active',
      phone: '',
      email: `${candidate.name.split(' ')[0].toLowerCase()}@goodwin.com`,
      skills: '',
      notes: 'Completed onboarding',
      ...employeeDetails
    };
    
    const { data: newEmpData, error: empError } = await supabase.from('employees').insert([empInsert]).select().single();
    if (empError) {
      console.error(empError);
      return;
    }
    
    // Then delete from candidates
    const { error: delError } = await supabase.from('candidates').delete().eq('id', candidateId);
    if (delError) {
      console.error(delError);
      // Not reverting employee insert for simplicity in this demo, but should ideally be in a transaction
    }
    
    const newEmployee = {
      id: newEmpData.id,
      name: newEmpData.name,
      role: newEmpData.role,
      type: newEmpData.type,
      salary: newEmpData.salary,
      joinDate: newEmpData.join_date,
      status: newEmpData.status,
      phone: newEmpData.phone,
      email: newEmpData.email,
      skills: newEmpData.skills,
      notes: newEmpData.notes
    };
    
    set({
      onboardings: state.onboardings.filter(o => o.id !== candidateId),
      employees: [...state.employees, newEmployee]
    });
  }
}));
