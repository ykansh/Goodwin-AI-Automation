import type { UserRole } from '../types';

interface ModulePermissions {
  [module: string]: UserRole[];
}

const ALL_ROLES: UserRole[] = [
  'super_admin', 'admin', 'hr', 'sales_manager', 'sales_executive', 
  'accounts', 'inventory_manager', 'warehouse_staff', 'employee'
];

export const unifiedPermissions: ModulePermissions = {
  // Common
  'dashboard': ALL_ROLES,
  'settings': ['super_admin', 'admin'],
  'user-management': ['super_admin', 'admin'],
  
  // CRM / Leads
  'leads': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'pipeline': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'follow-ups': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  
  // Sales & Customers
  'customers': ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'accounts'],
  'sales': ['super_admin', 'admin', 'sales_manager', 'accounts'],
  'returns': ['super_admin', 'admin', 'sales_manager', 'accounts', 'inventory_manager'],
  
  // Inventory & Warehouse
  'stock-main': ALL_ROLES,
  'products': ['super_admin', 'admin', 'inventory_manager', 'warehouse_staff', 'sales_manager'],
  'suppliers': ['super_admin', 'admin', 'inventory_manager', 'accounts'],
  'purchases': ['super_admin', 'admin', 'inventory_manager', 'accounts'],
  'warranty': ['super_admin', 'admin', 'inventory_manager', 'warehouse_staff', 'sales_manager'],
  
  // Accounts / Ledger
  'parties': ['super_admin', 'admin', 'accounts', 'sales_manager'],
  'ledger-sales': ['super_admin', 'admin', 'accounts'],
  'payment-in': ['super_admin', 'admin', 'accounts', 'sales_manager'],
  'payment-out': ['super_admin', 'admin', 'accounts'],
  'reports': ['super_admin', 'admin', 'accounts', 'sales_manager', 'inventory_manager'],
  
  // HRMS
  'employees': ['super_admin', 'admin', 'hr'],
  'attendance': ALL_ROLES,
  'leave': ALL_ROLES,
  'payroll': ['super_admin', 'admin', 'hr', 'accounts'],
  'projects': ALL_ROLES,
};

export function canAccess(role: UserRole, module: string): boolean {
  const allowedRoles = unifiedPermissions[module];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

export function getAccessibleModules(role: UserRole): string[] {
  return Object.keys(unifiedPermissions).filter((module) => unifiedPermissions[module].includes(role));
}

// Grouped Sidebar Items for Unified Layout
export const sidebarGroups = [
  {
    group: 'Home',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', module: 'dashboard' },
    ]
  },
  {
    group: 'CRM & Sales',
    items: [
      { key: 'leads', label: 'Leads Pipeline', icon: 'Kanban', path: '/leads', module: 'leads' },
      { key: 'customers', label: 'Customers & Dealers', icon: 'Users', path: '/customers', module: 'customers' },
      { key: 'sales', label: 'Invoices & Orders', icon: 'FileText', path: '/sales', module: 'sales' },
      { key: 'returns', label: 'Sales Returns', icon: 'RotateCcw', path: '/returns', module: 'returns' },
    ]
  },
  {
    group: 'Inventory & Operations',
    items: [
      { key: 'stock-main', label: 'Stock main', icon: 'BarChart2', path: '/stock-main', module: 'stock-main' },
      { key: 'products', label: 'Products & Stock', icon: 'Package', path: '/products', module: 'products' },
      { key: 'warranty', label: 'Battery Warranty', icon: 'ShieldCheck', path: '/warranty', module: 'warranty' },
      { key: 'purchases', label: 'Purchase Orders', icon: 'ShoppingCart', path: '/purchases', module: 'purchases' },
      { key: 'suppliers', label: 'Suppliers & Vendors', icon: 'Truck', path: '/suppliers', module: 'suppliers' },
    ]
  },
  {
    group: 'Finance & Ledger',
    items: [
      { key: 'parties', label: 'Ledger Accounts', icon: 'BookOpen', path: '/ledger/parties', module: 'parties' },
      { key: 'payment-in', label: 'Payment In (Receipts)', icon: 'ArrowDownLeft', path: '/ledger/payment-in', module: 'payment-in' },
      { key: 'payment-out', label: 'Payment Out', icon: 'ArrowUpRight', path: '/ledger/payment-out', module: 'payment-out' },
      { key: 'reports', label: 'Financial Reports', icon: 'BarChart3', path: '/reports', module: 'reports' },
    ]
  },
  {
    group: 'HR & Team',
    items: [
      { key: 'employees', label: 'Employee Directory', icon: 'Users', path: '/hrms/employees', module: 'employees' },
      { key: 'attendance', label: 'Attendance & Leave', icon: 'CalendarClock', path: '/hrms/attendance', module: 'attendance' },
      { key: 'payroll', label: 'Payroll & Salary', icon: 'DollarSign', path: '/hrms/payroll', module: 'payroll' },
      { key: 'projects', label: 'Tasks & Projects', icon: 'Briefcase', path: '/hrms/projects', module: 'projects' },
    ]
  },
  {
    group: 'System',
    items: [
      { key: 'settings', label: 'System Settings', icon: 'Settings', path: '/settings', module: 'settings' },
      { key: 'user-management', label: 'User Roles & Access', icon: 'Shield', path: '/user-management', module: 'user-management' },
    ]
  }
];
