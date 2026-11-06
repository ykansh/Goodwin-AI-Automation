"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { VehicleType } from "@/types";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VehicleTypesManager() {
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<VehicleType>>({});

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    setLoading(true);
    const { data } = await supabase.from("vehicle_types").select("*").order("display_order", { ascending: true });
    setTypes(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!editForm.name || !editForm.slug) return alert("Name and Slug are required.");
    
    if (isEditing === "new") {
      await supabase.from("vehicle_types").insert({
        name: editForm.name,
        slug: editForm.slug,
        description: editForm.description,
        image_url: editForm.image_url,
        display_order: editForm.display_order || 0,
        active: editForm.active ?? true
      });
    } else {
      await supabase.from("vehicle_types").update({
        name: editForm.name,
        slug: editForm.slug,
        description: editForm.description,
        image_url: editForm.image_url,
        display_order: editForm.display_order || 0,
        active: editForm.active ?? true
      }).eq("id", isEditing);
    }
    
    setIsEditing(null);
    setEditForm({});
    loadTypes();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete all associated brands, models, variants and compatibility records!")) return;
    await supabase.from("vehicle_types").delete().eq("id", id);
    loadTypes();
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Vehicle Types</h2>
        <button onClick={() => { setIsEditing("new"); setEditForm({ active: true, display_order: 0 }); }} className="bg-brand text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-dark">
          <Plus size={18} /> Add New
        </button>
      </div>

      <div className="p-6">
        {isEditing && (
          <div className="mb-8 bg-background p-6 rounded-xl border border-border">
            <h3 className="font-bold mb-4">{isEditing === "new" ? "Add Vehicle Type" : "Edit Vehicle Type"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Name *</label>
                <input type="text" value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Slug *</label>
                <input type="text" value={editForm.slug || ""} onChange={e => setEditForm({...editForm, slug: e.target.value})} className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Display Order</label>
                <input type="number" value={editForm.display_order || 0} onChange={e => setEditForm({...editForm, display_order: parseInt(e.target.value)})} className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="active" checked={editForm.active ?? true} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-4 h-4 accent-brand" />
                <label htmlFor="active" className="text-sm font-bold text-foreground">Active (Visible to public)</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-brand text-white px-6 py-2 rounded font-bold">Save</button>
              <button onClick={() => { setIsEditing(null); setEditForm({}); }} className="bg-surface-hover text-foreground px-6 py-2 rounded font-bold">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-bold">Name / Slug</th>
                <th className="pb-3 font-bold text-center">Order</th>
                <th className="pb-3 font-bold text-center">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map(type => (
                <tr key={type.id} className="border-b border-border/50 hover:bg-surface-hover/50">
                  <td className="py-4">
                    <div className="font-bold text-foreground">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.slug}</div>
                  </td>
                  <td className="py-4 text-center font-semibold">{type.display_order}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      {type.active ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setIsEditing(type.id); setEditForm(type); }} className="p-2 hover:bg-background rounded text-brand"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(type.id)} className="p-2 hover:bg-background rounded text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {types.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No vehicle types found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
