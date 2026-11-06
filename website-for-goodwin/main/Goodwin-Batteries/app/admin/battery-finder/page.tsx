"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Car, Tag, Box, Hash, Link as LinkIcon, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function BatteryFinderOverview() {
  const [stats, setStats] = useState({
    types: 0,
    brands: 0,
    models: 0,
    variants: 0,
    compatibilities: 0,
    verifiedCompat: 0,
    pendingCompat: 0,
    leads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [
        { count: tCount },
        { count: bCount },
        { count: mCount },
        { count: vCount },
        { count: cCount },
        { count: cvCount },
        { count: cpCount },
        { count: lCount },
      ] = await Promise.all([
        supabase.from("vehicle_types").select("*", { count: "exact", head: true }),
        supabase.from("vehicle_brands").select("*", { count: "exact", head: true }),
        supabase.from("vehicle_models").select("*", { count: "exact", head: true }),
        supabase.from("vehicle_variants").select("*", { count: "exact", head: true }),
        supabase.from("battery_compatibility").select("*", { count: "exact", head: true }),
        supabase.from("battery_compatibility").select("*", { count: "exact", head: true }).eq("verification_status", "Verified"),
        supabase.from("battery_compatibility").select("*", { count: "exact", head: true }).eq("verification_status", "Pending Verification"),
        supabase.from("battery_finder_leads").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        types: tCount || 0,
        brands: bCount || 0,
        models: mCount || 0,
        variants: vCount || 0,
        compatibilities: cCount || 0,
        verifiedCompat: cvCount || 0,
        pendingCompat: cpCount || 0,
        leads: lCount || 0
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  const statCards = [
    { label: "Vehicle Types", value: stats.types, icon: <Box size={24} className="text-brand" />, href: "/admin/battery-finder/types" },
    { label: "Brands", value: stats.brands, icon: <Tag size={24} className="text-purple-500" />, href: "/admin/battery-finder/brands" },
    { label: "Models", value: stats.models, icon: <Car size={24} className="text-emerald-500" />, href: "/admin/battery-finder/models" },
    { label: "Variants", value: stats.variants, icon: <Hash size={24} className="text-orange-500" />, href: "/admin/battery-finder/variants" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link href={card.href} key={card.label} className="bg-surface border border-border p-6 rounded-xl hover:border-brand transition-colors group flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <h3 className="text-4xl font-heading font-bold text-foreground group-hover:text-brand transition-colors">{card.value}</h3>
            </div>
            <div className="bg-background p-4 rounded-xl">
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compatibility Health */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand/10 p-3 rounded-lg text-brand">
              <LinkIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Compatibility Mapping</h3>
              <p className="text-sm text-muted-foreground">Total rules mapping vehicles to Goodwin Batteries</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-foreground mb-1">{stats.compatibilities}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Rules</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-green-500 mb-1">{stats.verifiedCompat}</span>
              <span className="text-xs text-green-600 uppercase tracking-widest font-bold">Verified</span>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-yellow-500 mb-1">{stats.pendingCompat}</span>
              <span className="text-xs text-yellow-600 uppercase tracking-widest font-bold">Pending</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/battery-finder/compatibility" className="bg-foreground text-background px-6 py-3 rounded-lg font-bold hover:bg-brand hover:text-white transition-colors">
              Manage Compatibility Rules
            </Link>
          </div>
        </div>

        {/* Lead Capture */}
        <div className="bg-brand text-white rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Users size={180} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Battery Finder Leads</h3>
            <p className="text-white/80 text-sm mb-6">Enquiries captured through the public battery finder tool.</p>
            
            <div className="mb-8">
              <span className="text-6xl font-heading font-bold">{stats.leads}</span>
              <span className="text-white/80 uppercase tracking-widest text-sm block mt-2">Total Leads</span>
            </div>
          </div>
          
          <Link href="/admin/battery-finder/leads" className="bg-white text-brand px-6 py-3 rounded-lg font-bold text-center hover:bg-gray-100 transition-colors relative z-10 w-full inline-block">
            View All Leads
          </Link>
        </div>

      </div>
      
    </div>
  );
}
