"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import WarrantyPlanModal from "@/components/admin/WarrantyPlanModal";

export default function WarrantyPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredPlans = plans.filter(p => {
    if (statusFilter === "active" && !p.active) return false;
    if (statusFilter === "inactive" && p.active) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!(p.plan_name || "").toLowerCase().includes(term) && !(p.id || "").toLowerCase().includes(term)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "name_asc") return (a.plan_name || "").localeCompare(b.plan_name || "");
    if (sortOrder === "name_desc") return (b.plan_name || "").localeCompare(a.plan_name || "");
    return 0;
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setLoading(true);
    const { data, error } = await supabase.from("warranty_plans").select("*").order("created_at", { ascending: false });
    if (data) setPlans(data);
    setLoading(false);
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from("warranty_plans").update({ active: !currentStatus }).eq("id", id);
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      await supabase.from("warranty_plans").delete().eq("id", id);
      fetchPlans();
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Warranty Plans</h1>
          <p className="text-muted-foreground">Manage your product warranty plans, free replacement periods, and pro-rata rules.</p>
        </div>
        <button onClick={() => { setSelectedPlan(null); setIsModalOpen(true); }} className="bg-brand text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-dark flex items-center gap-2">
          <Plus size={18} /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface p-4 rounded-xl border border-border mb-6">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search</label>
          <input 
            type="text" 
            placeholder="Search plan name or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sort By</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="p-4 font-bold text-sm uppercase text-muted-foreground tracking-wider">Plan Details</th>
                <th className="p-4 font-bold text-sm uppercase text-muted-foreground tracking-wider">Durations (Months)</th>
                <th className="p-4 font-bold text-sm uppercase text-muted-foreground tracking-wider">Status</th>
                <th className="p-4 font-bold text-sm uppercase text-muted-foreground tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="border-b border-border hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-foreground">{plan.plan_name}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">ID: {plan.id}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="text-sm">Total: <span className="font-bold text-foreground">{plan.warranty_months}</span></div>
                    <div className="text-xs">Free: {plan.free_replacement_months} | Pro-rata: {plan.pro_rata_months}</div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(plan.id, plan.active)} className="flex items-center gap-2">
                      {plan.active ? (
                        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Active</span>
                      ) : (
                        <span className="bg-gray-500/10 text-muted-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={14} /> Inactive</span>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedPlan(plan); setIsModalOpen(true); }} className="p-2 bg-background border border-border rounded hover:text-brand transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deletePlan(plan.id)} className="p-2 bg-background border border-border rounded hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No warranty plans found. Create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WarrantyPlanModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPlan(null); }}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
}
