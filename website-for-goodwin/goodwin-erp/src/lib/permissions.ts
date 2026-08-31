import type { UserRole, AppMode } from '../types';

interface ModulePermissions {
  [module: string]: UserRole[];
}

const erpPermissions: ModulePermissions = {
  dashboard: ['admin', 'manager', 'accounts', 'sales', 'inventory'],
  customers: ['admin', 'manager', 'sales'],
  suppliers: ['admin', 'manager', 'inventory'],
  products: ['admin', 'manager', 'inventory'],
  sales: ['admin', 'manager', 'sales'],
  purchases: ['admin', 'manager', 'inventory'],
  returns: ['admin', 'manager', 'sales'],
  warranty: ['admin', 'manager', 'inventory'],
  reports: ['admin', 'manager', 'accounts'],
  settings: ['admin', 'manager'],
};

const ledgerPermissions: ModulePermissions = {
  dashboard: ['admin', 'manager', 'accounts', 'sales', 'inventory'],
  parties: ['admin', 'manager', 'accounts', 'sales'],
  sales: ['admin', 'manager', 'accounts', 'sales'],
  'payment-in': ['admin', 'manager', 'accounts'],
  'payment-out': ['admin', 'manager', 'accounts'],
};

const leadsPermissions: ModulePermissions = {
  leads: ['admin', 'manager', 'accounts', 'sales', 'inventory'],
  pipeline: ['admin', 'manager', 'accounts', 'sales', 'inventory'],
  'follow-ups': ['admin', 'manager', 'accounts', 'sales', 'inventory'],
};

export function canAccess(role: UserRole, module: string, mode: AppMode): boolean {
  const permissions = mode === 'erp' ? erpPermissions : mode === 'ledger' ? ledgerPermissions : leadsPermissions;
  const allowedRoles = permissions[module];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

export function getAccessibleModules(role: UserRole, mode: AppMode): string[] {
  const permissions = mode === 'erp' ? erpPermissions : mode === 'ledger' ? ledgerPermissions : leadsPermissions;
  return Object.keys(permissions).filter((module) => permissions[module].includes(role));
}

export const erpSidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/erp/dashboard', module: 'dashboard' },
  { key: 'customers', label: 'Customers & Dealers', icon: 'Users', path: '/erp/customers', module: 'customers' },
  { key: 'suppliers', label: 'Suppliers & Vendors', icon: 'Truck', path: '/erp/suppliers', module: 'suppliers' },
  { key: 'products', label: 'Products & Inventory', icon: 'Package', path: '/erp/products', module: 'products' },
  { key: 'sales', label: 'Sales / GST Invoices', icon: 'FileText', path: '/erp/sales', module: 'sales' },
  { key: 'purchases', label: 'Purchases & POs', icon: 'ShoppingCart', path: '/erp/purchases', module: 'purchases' },
  { key: 'returns', label: 'Returns (Credit/Debit)', icon: 'RotateCcw', path: '/erp/returns', module: 'returns' },
  { key: 'warranty', label: 'Battery Warranty', icon: 'ShieldCheck', path: '/erp/warranty', module: 'warranty' },
  { key: 'reports', label: 'Reports & Analytics', icon: 'BarChart3', path: '/erp/reports', module: 'reports' },
  { key: 'settings', label: 'Settings & Cloud DB', icon: 'Settings', path: '/erp/settings', module: 'settings' },
];

export const ledgerSidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/ledger/dashboard', module: 'dashboard' },
  { key: 'parties', label: 'Parties', icon: 'Users', path: '/ledger/parties', module: 'parties' },
  { key: 'sales', label: 'Sales / Invoices', icon: 'FileText', path: '/ledger/sales', module: 'sales' },
  { key: 'payment-in', label: 'Payment In', icon: 'ArrowDownLeft', path: '/ledger/payment-in', module: 'payment-in' },
  { key: 'payment-out', label: 'Payment Out', icon: 'ArrowUpRight', path: '/ledger/payment-out', module: 'payment-out' },
];

export const leadsSidebarItems = [
  { key: 'leads', label: 'Leads', icon: 'Users', path: '/leads/list', module: 'leads' },
  { key: 'pipeline', label: 'Pipeline', icon: 'Kanban', path: '/leads/pipeline', module: 'pipeline' },
  { key: 'follow-ups', label: 'Follow-ups', icon: 'CalendarClock', path: '/leads/follow-ups', module: 'follow-ups' },
];
