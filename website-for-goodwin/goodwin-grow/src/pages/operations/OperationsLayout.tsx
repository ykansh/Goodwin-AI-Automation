import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, UserPlus, CheckSquare, FolderGit2, GitMerge, FileArchive } from 'lucide-react';
import { cn } from '../../lib/utils';

const opsNav = [
  { name: 'Client Tracker', path: '/operations/clients', icon: Users },
  { name: 'Lead Tracker', path: '/operations/leads', icon: UserPlus },
  { name: 'Task Manager', path: '/operations/tasks', icon: CheckSquare },
  { name: 'Projects', path: '/operations/projects', icon: FolderGit2 },
  { name: 'Workflows', path: '/operations/workflows', icon: GitMerge },
  { name: 'Assets', path: '/operations/assets', icon: FileArchive },
];

export const OperationsLayout = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Operations Hub</h1>
        <p className="text-secondary-light text-sm mt-1">Manage clients, projects, and automated workflows.</p>
      </div>
      
      {/* Horizontal Sub-navigation */}
      <div className="border-b border-canvas-variant overflow-x-auto hide-scrollbar">
        <nav className="flex space-x-1" aria-label="Operations Tabs">
          {opsNav.map((item) => (
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
