"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Loader2 } from "lucide-react";

export default function WarrantyPlanModal({ isOpen, onClose, plan, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    plan_name: "",
    warranty_months: 0,
    free_replacement_months: 0,
    pro_rata_months: 0,
    active: true
  });

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        id: "",
        plan_name: "",
        warranty_months: 0,
        free_replacement_months: 0,
        pro_rata_months: 0,
        active: true
      });
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app we'd validate the IDs format and uniqueness
    const dataToSave = {
      ...formData,
      // Defaulting ID to a slug of plan name if not provided (only on create)
      id: formData.id || formData.plan_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      updated_at: new Date().toISOString()
    };
    
    try {
      if (plan) {
        await supabase.from("warranty_plans").update(dataToSave).eq("id", plan.id);
      } else {
        await supabase.from("warranty_plans").insert([dataToSave]);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving warranty plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border bg-background">
          <h2 className="text-xl font-bold font-heading">{plan ? "Edit Plan" : "Add New Plan"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!plan && (
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Plan ID (Optional)</label>
              <input 
                type="text" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})} 
                placeholder="e.g. plan-24m"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Plan Name *</label>
            <input 
              type="text" 
              required
              value={formData.plan_name} 
              onChange={e => setFormData({...formData, plan_name: e.target.value})} 
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Total (Months)</label>
              <input 
                type="number" 
                required
                value={formData.warranty_months} 
                onChange={e => setFormData({...formData, warranty_months: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Free (Months)</label>
              <input 
                type="number" 
                required
                value={formData.free_replacement_months} 
                onChange={e => setFormData({...formData, free_replacement_months: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Pro-rata (Mo)</label>
              <input 
                type="number" 
                required
                value={formData.pro_rata_months} 
                onChange={e => setFormData({...formData, pro_rata_months: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-border">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-bold text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {plan ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
