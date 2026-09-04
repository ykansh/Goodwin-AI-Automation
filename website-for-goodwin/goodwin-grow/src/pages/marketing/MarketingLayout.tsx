import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Calendar, Share2, Users, Target, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const marketingNav = [
  { name: 'Dashboard', path: '/marketing/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', path: '/marketing/campaigns', icon: Megaphone },
  { name: 'Calendar', path: '/marketing/calendar', icon: Calendar },
  { name: 'Social Media', path: '/marketing/social', icon: Share2 },
  { name: 'Leads', path: '/marketing/leads', icon: Users },
  { name: 'Ads', path: '/marketing/ads', icon: Target },
  { name: 'Creatives', path: '/marketing/creatives', icon: ImageIcon },
];

export const MarketingLayout = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Marketing Hub</h1>
        <p className="text-secondary-light text-sm mt-1">Manage campaigns, leads, and marketing assets.</p>
      </div>
      
      {/* Horizontal Sub-navigation for Marketing */}
      <div className="border-b border-canvas-variant overflow-x-auto hide-scrollbar">
        <nav className="flex space-x-1" aria-label="Marketing Tabs">
          {marketingNav.map((item) => (
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
