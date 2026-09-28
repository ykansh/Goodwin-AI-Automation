import { useMemo } from 'react';
import { useAuthStore, type Role } from './authStore';
import { useStore, type Employee } from './store';

export const isSameEmployee = (a?: string | null, b?: string | null): boolean => {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};

export interface CurrentUserInfo {
  userEmail: string | null;
  actualRole: Role;
  role: Role;
  isAdmin: boolean;
  isEmployee: boolean;
  employee: Employee | null;
  employeeName: string;
  simulatedRole: Role;
  setSimulatedRole: (role: Role) => void;
  isSimulating: boolean;
}

export const useCurrentUser = (): CurrentUserInfo => {
  const userEmail = useAuthStore((state) => state.userEmail);
  const actualRole = useAuthStore((state) => state.role);
  const simulatedRole = useAuthStore((state) => state.simulatedRole);
  const setSimulatedRole = useAuthStore((state) => state.setSimulatedRole);
  const employees = useStore((state) => state.employees);

  const effectiveRole: Role = (simulatedRole || actualRole || 'employee') as Role;
  const isAdmin = effectiveRole === 'admin';
  const isEmployee = effectiveRole === 'employee';

  const employee = useMemo(() => {
    if (!userEmail || !employees || employees.length === 0) return null;
    const cleanEmail = userEmail.trim().toLowerCase();

    // 1. Exact email match
    const byEmail = employees.find(
      (e) => e.email && e.email.trim().toLowerCase() === cleanEmail
    );
    if (byEmail) return byEmail;

    // 2. Name-based match with email prefix (e.g., 'iamanshchourasiya' matches 'Ansh Chourasiya')
    const username = cleanEmail.split('@')[0].replace(/[^a-z]/g, '');
    const byName = employees.find((e) => {
      const parts = e.name.trim().toLowerCase().split(/\s+/);
      return parts.some((part) => part.length >= 3 && username.includes(part));
    });
    if (byName) return byName;

    return null;
  }, [userEmail, employees]);

  const employeeName = employee ? employee.name.trim() : (userEmail?.split('@')[0] || 'User');

  return {
    userEmail,
    actualRole,
    role: effectiveRole,
    isAdmin,
    isEmployee,
    employee,
    employeeName,
    simulatedRole,
    setSimulatedRole,
    isSimulating: !!simulatedRole && simulatedRole !== actualRole,
  };
};
