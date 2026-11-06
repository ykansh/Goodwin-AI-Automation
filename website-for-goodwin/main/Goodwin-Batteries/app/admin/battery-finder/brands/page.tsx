"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { VehicleBrand, VehicleType } from "@/types";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function BrandsManager() {
  const [brands, setBrands] = useState<(VehicleBrand & { vehicle_type: { name: string } })[]>([]);
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<VehicleBrand>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    // Load types for dropdown
    const { data: typesData } = await supabase.from("vehicle_types").select("*").order("name");
    setTypes(typesData || []);

    // Load brands with joined type name
    const { data: brandsData } = await supabase.from("vehicle_brands").select(`*, vehicle_type:vehicle_type_id(name)`).order("display_order");
    setBrands((brandsData || []) as any);
    
    setLoading(false);
  }

  async function handleSave() {
    if (!editForm.name || !editForm.slug || !editForm.vehicle_type_id) return alert("Name, Slug, and Vehicle Type are required.");
    
    if (isEditing === "new") {
      await supabase.from("vehicle_brands").insert({
        name: editForm.name,
        slug: editForm.slug,
        vehicle_type_id: editForm.vehicle_type_id,

        display_order: editForm.display_order || 0,
        active: editForm.active ?? true
      });
    } else {
      await supabase.from("vehicle_brands").update({
        name: editForm.name,
        slug: editForm.slug,
        vehicle_type_id: editForm.vehicle_type_id,

        display_order: editForm.display_order || 0,
        active: editForm.active ?? true
      }).eq("id", isEditing);
    }
    
    setIsEditing(null);
    setEditForm({});
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete all associated models and variants!")) return;
    await supabase.from("vehicle_brands").delete().eq("id", id);
    loadData();
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Vehicle Brands</h2>
        <button onClick={() => { setIsEditing("new"); setEditForm({ active: true, display_order: 0, vehicle_type_id: types[0]?.id }); }} className="bg-brand text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-dark">
          <Plus size={18} /> Add New
        </button>
      </div>

      <div className="p-6">
        {isEditing && (
          <div className="mb-8 bg-background p-6 rounded-xl border border-border">
            <h3 className="font-bold mb-4">{isEditing === "new" ? "Add Brand" : "Edit Brand"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Vehicle Type *</label>
                <select value={editForm.vehicle_type_id || ""} onChange={e => setEditForm({...editForm, vehicle_type_id: e.target.value})} className="w-full bg-surface border border-border rounded p-2 text-foreground">
                  <option value="">Select Type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Brand Name *</label>
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
                <th className="pb-3 font-bold">Brand Name</th>
                <th className="pb-3 font-bold">Vehicle Type</th>
                <th className="pb-3 font-bold text-center">Order</th>
                <th className="pb-3 font-bold text-center">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand.id} className="border-b border-border/50 hover:bg-surface-hover/50">
                  <td className="py-4">
                    <div className="font-bold text-foreground">{brand.name}</div>
                    <div className="text-xs text-muted-foreground">{brand.slug}</div>
                  </td>
                  <td className="py-4"><span className="bg-background px-2 py-1 rounded text-xs border border-border">{brand.vehicle_type?.name}</span></td>
                  <td className="py-4 text-center font-semibold">{brand.display_order}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      {brand.active ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setIsEditing(brand.id); setEditForm(brand); }} className="p-2 hover:bg-background rounded text-brand"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(brand.id)} className="p-2 hover:bg-background rounded text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No brands found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
