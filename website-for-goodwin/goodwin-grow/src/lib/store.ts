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
  isFinalized?: boolean;
}

export interface Leave {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  name: string;
  month: string;
  basic: number;
  allowances: number;
  deductions: number;
  net: number;
  status: string;
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

export interface AITool {
  id: string;
  name: string;
  category: string;
  usedFor: string;
  cost: number;
  sub: string;
  email: string;
  renewal: string;
  notes: string;
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
  clockIn: (employeeName: string) => Promise<void>;
  clockOut: (employeeName: string) => Promise<void>;
  markAbsences: (date: string) => Promise<void>;

  // HRMS - Leave
  leaves: Leave[];
  requestLeave: (leave: Omit<Leave, 'id' | 'name' | 'status'>) => Promise<void>;
  updateLeave: (id: string, leave: Partial<Leave>) => Promise<void>;
  deleteLeave: (id: string) => Promise<void>;

  // HRMS - Payroll
  payroll: PayrollRecord[];
  runPayroll: () => Promise<void>;
  updatePayroll: (id: string, record: Partial<PayrollRecord>) => Promise<void>;
  deletePayroll: (id: string) => Promise<void>;

  // HRMS - Recruitment & Onboarding
  recruits: Candidate[];
  onboardings: Candidate[];
  addRecruit: (candidate: Omit<Candidate, 'id'>) => Promise<void>;
  updateRecruit: (id: string, candidate: Partial<Candidate>) => Promise<void>;
  deleteRecruit: (id: string) => Promise<void>;
  moveToOnboarding: (candidateId: string) => Promise<void>;
  toggleChecklistTask: (candidateId: string, taskId: string) => Promise<void>;
  completeOnboarding: (candidateId: string, employeeDetails: Partial<Employee>) => Promise<void>;

  // AI Tools
  aiTools: AITool[];
  addAITool: (tool: Omit<AITool, 'id'>) => Promise<void>;
  updateAITool: (id: string, tool: Partial<AITool>) => Promise<void>;
  deleteAITool: (id: string) => Promise<void>;

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
  leaves: [],
  payroll: [],
  recruits: [],
  onboardings: [],
  aiTools: [],
  
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
      (attData || []).forEach(a => {
        if (!attendanceObj[a.date]) attendanceObj[a.date] = {};
        attendanceObj[a.date][a.employee_name] = {
          status: a.status as AttendanceStatus,
          arrival: a.arrival,
          departure: a.departure,
          isFinalized: a.is_finalized
        };
      });

      // Fetch Leaves
      const { data: leavesData, error: leavesError } = await supabase.from('leaves').select('*');
      if (leavesError && leavesError.code !== '42P01') throw leavesError;
      
      const leaves = (leavesData || []).map(l => {
        const emp = employees.find(e => e.id === l.employee_id);
        return {
          id: l.id,
          employeeId: l.employee_id,
          name: emp ? emp.name : 'Unknown',
          type: l.leave_type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
          status: l.status
        };
      });

      // Fetch Payroll
      const { data: payrollData, error: payrollError } = await supabase.from('payroll').select('*');
      if (payrollError && payrollError.code !== '42P01') throw payrollError;
      
      const payroll = (payrollData || []).map(p => {
        const emp = employees.find(e => e.id === p.employee_id);
        return {
          id: p.id,
          employeeId: p.employee_id,
          name: emp ? emp.name : 'Unknown',
          month: p.month,
          basic: p.basic_salary,
          allowances: p.allowances,
          deductions: p.deductions,
          net: p.net_salary,
          status: p.status
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

      // Fetch AI Tools
      const { data: aiData, error: aiError } = await supabase.from('ai_tools').select('*');
      if (aiError && aiError.code !== '42P01') throw aiError;
      
      const aiTools = (aiData || []).map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        usedFor: t.used_for,
        cost: t.monthly_cost,
        sub: t.subscription_type,
        email: t.login_email,
        renewal: t.renewal_date,
        notes: t.notes
      }));

      // Fetch Metrics
      const { data: metData, error: metError } = await supabase.from('metrics').select('*').single();
      if (metError && metError.code !== 'PGRST116') throw metError; // ignore no rows

      set({
        employees,
        attendance: attendanceObj,
        leaves,
        payroll,
        recruits,
        onboardings,
        aiTools,
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
      departure: record.departure,
      is_finalized: record.isFinalized || false
    }, { onConflict: 'date, employee_name' });
    
    if (error) {
      console.error(error);
      throw error;
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

  clockIn: async (employeeName) => {
    const date = new Date().toISOString().split('T')[0];
    const arrival = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:mm"
    
    const record: AttendanceRecord = {
      status: 'Present',
      arrival,
      departure: '',
      isFinalized: false
    };
    await get().updateAttendance(date, employeeName, record);
  },

  clockOut: async (employeeName) => {
    const date = new Date().toISOString().split('T')[0];
    const state = get();
    const existing = state.attendance[date]?.[employeeName];
    
    if (!existing) {
      throw new Error('Must clock in first');
    }
    if (existing.isFinalized) {
      throw new Error('Attendance is already finalized for today');
    }
    
    const departure = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:mm"
    const record: AttendanceRecord = {
      ...existing,
      departure,
      isFinalized: true
    };
    await get().updateAttendance(date, employeeName, record);
  },

  markAbsences: async (date) => {
    const state = get();
    const activeEmployees = state.employees.filter(e => e.status === 'active');
    const todaysAttendance = state.attendance[date] || {};
    
    const absentPromises = activeEmployees
      .filter(emp => !todaysAttendance[emp.name])
      .map(emp => {
        return get().updateAttendance(date, emp.name, {
          status: 'Absent',
          arrival: '',
          departure: '',
          isFinalized: true
        });
      });
      
    await Promise.all(absentPromises);
  },

  requestLeave: async (leave) => {
    const { data, error } = await supabase.from('leaves').insert([{
      employee_id: leave.employeeId,
      leave_type: leave.type,
      start_date: leave.startDate,
      end_date: leave.endDate,
      days: leave.days,
      status: 'Pending'
    }]).select().single();
    
    if (error) {
      console.error(error);
      throw error;
    }
    
    set(state => {
      const emp = state.employees.find(e => e.id === leave.employeeId);
      const newLeave: Leave = {
        id: data.id,
        employeeId: data.employee_id,
        name: emp ? emp.name : 'Unknown',
        type: data.leave_type,
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days,
        status: data.status
      };
      return { leaves: [...state.leaves, newLeave] };
    });
  },

  updateLeave: async (id, updatedFields) => {
    const dbUpdates: any = {};
    if (updatedFields.type !== undefined) dbUpdates.leave_type = updatedFields.type;
    if (updatedFields.startDate !== undefined) dbUpdates.start_date = updatedFields.startDate;
    if (updatedFields.endDate !== undefined) dbUpdates.end_date = updatedFields.endDate;
    if (updatedFields.days !== undefined) dbUpdates.days = updatedFields.days;
    if (updatedFields.status !== undefined) dbUpdates.status = updatedFields.status;

    const { error } = await supabase.from('leaves').update(dbUpdates).eq('id', id);
    if (error) throw error;
    
    set(state => ({
      leaves: state.leaves.map(l => l.id === id ? { ...l, ...updatedFields } : l)
    }));
  },

  deleteLeave: async (id) => {
    const { error } = await supabase.from('leaves').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ leaves: state.leaves.filter(l => l.id !== id) }));
  },

  runPayroll: async () => {
    const state = get();
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'short' }) + ' ' + currentDate.getFullYear();
    
    if (state.payroll.some(p => p.month === month)) {
      throw new Error(`Payroll already run for ${month}`);
    }
    
    const activeEmployees = state.employees.filter(e => e.status === 'active');
    if (activeEmployees.length === 0) throw new Error('No active employees to run payroll for.');
    
    const payrollInserts = activeEmployees.map(emp => {
      const basic = emp.salary || 0;
      const allowances = basic * 0.1;
      const deductions = basic * 0.05;
      const net = basic + allowances - deductions;
      return {
        employee_id: emp.id,
        month,
        basic_salary: basic,
        allowances,
        deductions,
        net_salary: net,
        status: 'Pending'
      };
    });
    
    const { data, error } = await supabase.from('payroll').insert(payrollInserts).select();
    if (error) {
      console.error(error);
      throw error;
    }
    
    const newRecords: PayrollRecord[] = data.map(p => {
      const emp = state.employees.find(e => e.id === p.employee_id);
      return {
        id: p.id,
        employeeId: p.employee_id,
        name: emp ? emp.name : 'Unknown',
        month: p.month,
        basic: p.basic_salary,
        allowances: p.allowances,
        deductions: p.deductions,
        net: p.net_salary,
        status: p.status
      };
    });
    
    set(state => ({ payroll: [...state.payroll, ...newRecords] }));
  },

  updatePayroll: async (id, updatedFields) => {
    const dbUpdates: any = {};
    if (updatedFields.month !== undefined) dbUpdates.month = updatedFields.month;
    if (updatedFields.basic !== undefined) dbUpdates.basic_salary = updatedFields.basic;
    if (updatedFields.allowances !== undefined) dbUpdates.allowances = updatedFields.allowances;
    if (updatedFields.deductions !== undefined) dbUpdates.deductions = updatedFields.deductions;
    if (updatedFields.net !== undefined) dbUpdates.net_salary = updatedFields.net;
    if (updatedFields.status !== undefined) dbUpdates.status = updatedFields.status;

    const { error } = await supabase.from('payroll').update(dbUpdates).eq('id', id);
    if (error) throw error;
    
    set(state => ({
      payroll: state.payroll.map(p => p.id === id ? { ...p, ...updatedFields } : p)
    }));
  },

  deletePayroll: async (id) => {
    const { error } = await supabase.from('payroll').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ payroll: state.payroll.filter(p => p.id !== id) }));
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
    
    const newCandidate: Candidate = {
      id: data.id,
      name: data.name,
      role: data.role,
      status: data.status,
      cvLink: data.cv_link,
      portfolioLink: data.portfolio_link,
      checklist: data.checklist
    };
    
    set(state => ({
      recruits: [...state.recruits, newCandidate]
    }));
  },

  updateRecruit: async (id, updatedFields) => {
    const dbUpdates: any = { ...updatedFields };
    if (updatedFields.cvLink !== undefined) {
      dbUpdates.cv_link = updatedFields.cvLink;
      delete dbUpdates.cvLink;
    }
    if (updatedFields.portfolioLink !== undefined) {
      dbUpdates.portfolio_link = updatedFields.portfolioLink;
      delete dbUpdates.portfolioLink;
    }

    const { error } = await supabase.from('candidates').update(dbUpdates).eq('id', id);
    if (error) throw error;
    
    set(state => ({
      recruits: state.recruits.map(r => r.id === id ? { ...r, ...updatedFields } : r),
      onboardings: state.onboardings.map(o => o.id === id ? { ...o, ...updatedFields } : o)
    }));
  },

  deleteRecruit: async (id) => {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) throw error;
    set(state => ({
      recruits: state.recruits.filter(r => r.id !== id),
      onboardings: state.onboardings.filter(o => o.id !== id)
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
      throw error;
    }
    
    set(state => {
      const candidate = state.recruits.find(r => r.id === candidateId);
      if (!candidate) return state;
      
      const updatedCandidate = { ...candidate, status: 'Onboarding', checklist };
      return {
        recruits: state.recruits.filter(r => r.id !== candidateId),
        onboardings: [...state.onboardings, updatedCandidate]
      };
    });
  },

  toggleChecklistTask: async (candidateId, taskId) => {
    const state = get();
    const candidate = state.onboardings.find(c => c.id === candidateId);
    if (!candidate || !candidate.checklist) return;
    
    const newChecklist = candidate.checklist.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    const { error } = await supabase.from('candidates')
      .update({ checklist: newChecklist })
      .eq('id', candidateId);
      
    if (error) throw error;
    
    set(state => ({
      onboardings: state.onboardings.map(c => 
        c.id === candidateId ? { ...c, checklist: newChecklist } : c
      )
    }));
  },

  completeOnboarding: async (candidateId, employeeDetails) => {
    // For this prototype, we'll just remove them from onboardings and add to employees
    const state = get();
    const candidate = state.onboardings.find(c => c.id === candidateId);
    if (!candidate) return;
    
    await get().addEmployee({
      name: employeeDetails.name || candidate.name,
      role: employeeDetails.role || candidate.role,
      type: employeeDetails.type || 'Full-time',
      salary: employeeDetails.salary || 0,
      status: 'active',
      phone: employeeDetails.phone || '',
      email: employeeDetails.email || '',
      skills: employeeDetails.skills || '',
      notes: employeeDetails.notes || ''
    });
    
    await get().deleteRecruit(candidateId);
  },

  addAITool: async (tool) => {
    const { data, error } = await supabase.from('ai_tools').insert([{
      name: tool.name, category: tool.category, used_for: tool.usedFor, monthly_cost: tool.cost, subscription_type: tool.sub, login_email: tool.email, renewal_date: tool.renewal, notes: tool.notes
    }]).select().single();
    if (error) throw error;
    set(state => ({ aiTools: [...state.aiTools, { ...tool, id: data.id }] }));
  },
  
  updateAITool: async (id, updatedFields) => {
    const dbUpdates: any = {};
    if (updatedFields.name !== undefined) dbUpdates.name = updatedFields.name;
    if (updatedFields.category !== undefined) dbUpdates.category = updatedFields.category;
    if (updatedFields.usedFor !== undefined) dbUpdates.used_for = updatedFields.usedFor;
    if (updatedFields.cost !== undefined) dbUpdates.monthly_cost = updatedFields.cost;
    if (updatedFields.sub !== undefined) dbUpdates.subscription_type = updatedFields.sub;
    if (updatedFields.email !== undefined) dbUpdates.login_email = updatedFields.email;
    if (updatedFields.renewal !== undefined) dbUpdates.renewal_date = updatedFields.renewal;
    if (updatedFields.notes !== undefined) dbUpdates.notes = updatedFields.notes;

    const { error } = await supabase.from('ai_tools').update(dbUpdates).eq('id', id);
    if (error) throw error;
    set(state => ({ aiTools: state.aiTools.map(t => t.id === id ? { ...t, ...updatedFields } : t) }));
  },
  
  deleteAITool: async (id) => {
    const { error } = await supabase.from('ai_tools').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ aiTools: state.aiTools.filter(t => t.id !== id) }));
  }
}));
