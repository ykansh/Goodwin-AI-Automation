"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, MapPin, MessageSquare, ShieldCheck, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    dealers: 0,
    enquiries: 0,
    warranties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("dealer");

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentRole = "dealer";
        if (session) {
          const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single();
          if (profile) currentRole = profile.role;
          setRole(currentRole);
        }
        const [
          { count: productsCount },
          { count: dealersCount },
          { count: enquiriesCount },
          { count: warrantiesCount }
        ] = await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("dealers").select("*", { count: "exact", head: true }),
          supabase.from("enquiries").select("*", { count: "exact", head: true }),
          supabase.from("warranty_registrations").select("*", { count: "exact", head: true })
        ]);

        setStats({
          products: productsCount || 0,
          dealers: dealersCount || 0,
          enquiries: enquiriesCount || 0,
          warranties: warrantiesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (role === "warehouse") {
    return null; // Will redirect via layout
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the Goodwin Batteries CMS. Here's a summary of your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {role !== "dealer" && (
          <>
            <StatCard 
              title="Total Products" 
              value={loading ? "-" : stats.products} 
              icon={<Package size={24} />} 
              trend="+2 this month"
              color="bg-brand"
            />
            <StatCard 
              title="Active Dealers" 
              value={loading ? "-" : stats.dealers} 
              icon={<MapPin size={24} />} 
              trend="Stable"
              color="bg-emerald-500"
            />
            <StatCard 
              title="New Enquiries" 
              value={loading ? "-" : stats.enquiries} 
              icon={<MessageSquare size={24} />} 
              trend="Needs Attention"
              color="bg-amber-500"
            />
          </>
        )}
        <StatCard 
          title="Warranty Reg." 
          value={loading ? "-" : stats.warranties} 
          icon={<ShieldCheck size={24} />} 
          trend="Total Registered"
          color="bg-purple-500"
        />
      </div>

      {role !== "dealer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Enquiries</h3>
            <button className="text-brand text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity size={48} className="mb-4 opacity-20" />
            <p>Connect database to view live enquiries</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Warranty Claims</h3>
            <button className="text-brand text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity size={48} className="mb-4 opacity-20" />
            <p>Connect database to view live claims</p>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-foreground">{value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{trend}</p>
    </div>
  );
}
