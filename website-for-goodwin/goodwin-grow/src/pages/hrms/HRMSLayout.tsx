import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, CalendarCheck, Clock, DollarSign, UserPlus, FileCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

const hrmsNav = [
  { name: 'Employees', path: '/hrms/employees', icon: Users },
  { name: 'Attendance', path: '/hrms/attendance', icon: Clock },
  { name: 'Leave', path: '/hrms/leave', icon: CalendarCheck },
  { name: 'Payroll', path: '/hrms/payroll', icon: DollarSign },
  { name: 'Recruit', path: '/hrms/recruit', icon: UserPlus },
  { name: 'Onboarding', path: '/hrms/onboarding', icon: FileCheck },
];

export const HRMSLayout = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">HRMS Hub</h1>
        <p className="text-secondary-light text-sm mt-1">Manage team, attendance, payroll, and recruitment.</p>
      </div>
      
      <div className="border-b border-canvas-variant overflow-x-auto hide-scrollbar">
        <nav className="flex space-x-1" aria-label="HRMS Tabs">
          {hrmsNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-secondary-light hover:text-secondary-dark hover:border-secondary-light/30"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
