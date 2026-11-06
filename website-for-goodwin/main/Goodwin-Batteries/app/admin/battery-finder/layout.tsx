"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Car, Tag, Box, Hash, Link as LinkIcon, Users } from "lucide-react";

export default function BatteryFinderAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/admin/battery-finder", exact: true, icon: <Car size={16} /> },
    { name: "Vehicle Types", href: "/admin/battery-finder/types", exact: false, icon: <Box size={16} /> },
    { name: "Brands", href: "/admin/battery-finder/brands", exact: false, icon: <Tag size={16} /> },
    { name: "Models", href: "/admin/battery-finder/models", exact: false, icon: <Car size={16} /> },
    { name: "Variants", href: "/admin/battery-finder/variants", exact: false, icon: <Hash size={16} /> },
    { name: "Fuels", href: "/admin/battery-finder/fuels", exact: false, icon: <Tag size={16} /> },
    { name: "Years", href: "/admin/battery-finder/years", exact: false, icon: <Hash size={16} /> },
    { name: "Fitments", href: "/admin/battery-finder/compatibility", exact: false, icon: <LinkIcon size={16} /> },
    { name: "Import", href: "/admin/battery-finder/import", exact: false, icon: <Box size={16} /> },
    { name: "Leads", href: "/admin/battery-finder/leads", exact: false, icon: <Users size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Battery Finder Configuration</h1>
        <p className="text-muted-foreground mt-2">Manage vehicle types, brands, models, and battery compatibility mapping.</p>
      </div>

      <div className="bg-surface border border-border p-2 rounded-xl flex flex-wrap gap-2 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? pathname === tab.href 
            : pathname.startsWith(tab.href);
            
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                isActive 
                  ? "bg-brand text-white shadow-md shadow-brand/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              {tab.icon}
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="bg-background">
        {children}
      </div>
    </div>
  );
}
