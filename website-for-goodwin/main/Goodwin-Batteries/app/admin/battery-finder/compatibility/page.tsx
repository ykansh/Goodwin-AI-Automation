"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { VehicleType, VehicleBrand, VehicleModel, VehicleVariant, Product } from "@/types";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function CompatibilityManager() {
  const [compatibilities, setCompatibilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Reference Data
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    const [t, b, m, v, p, c] = await Promise.all([
      supabase.from("vehicle_types").select("*").order("name"),
      supabase.from("vehicle_brands").select("*").order("name"),
      supabase.from("vehicle_models").select("*").order("name"),
      supabase.from("vehicle_variants").select("*").order("name"),
      supabase.from("products").select("*").order("name"),
      supabase.from("battery_compatibility").select(`
        *,
        vehicle_type:vehicle_type_id(name),
        vehicle_brand:brand_id(name),
        vehicle_model:model_id(name),
        vehicle_variant:variant_id(name),
        product:product_id(name)
      `).order("created_at", { ascending: false })
    ]);

    setTypes(t.data || []);
    setBrands(b.data || []);
    setModels(m.data || []);
    setVariants(v.data || []);
    setProducts(p.data || []);
    setCompatibilities(c.data || []);
    
    setLoading(false);
  }

  async function handleSave() {
    if (!editForm.vehicle_type_id || !editForm.brand_id || !editForm.model_id || !editForm.variant_id || !editForm.product_id) {
      return alert("Please select Type, Brand, Model, Variant, and Product.");
    }
    
    if (isEditing === "new") {
      await supabase.from("battery_compatibility").insert({
        vehicle_type_id: editForm.vehicle_type_id,
        brand_id: editForm.brand_id,
        model_id: editForm.model_id,
        variant_id: editForm.variant_id,
        fuel_type: editForm.fuel_type,
        year_from: editForm.year_from,
        year_to: editForm.year_to,
        product_id: editForm.product_id,
        fitment_notes: editForm.fitment_notes,
        source: editForm.source,
        verification_status: editForm.verification_status || 'Pending Verification',
        active: editForm.active ?? true
      });
    } else {
      await supabase.from("battery_compatibility").update({
        vehicle_type_id: editForm.vehicle_type_id,
        brand_id: editForm.brand_id,
        model_id: editForm.model_id,
        variant_id: editForm.variant_id,
        fuel_type: editForm.fuel_type,
        year_from: editForm.year_from,
        year_to: editForm.year_to,
        product_id: editForm.product_id,
        fitment_notes: editForm.fitment_notes,
        source: editForm.source,
        verification_status: editForm.verification_status || 'Pending Verification',
        active: editForm.active ?? true
      }).eq("id", isEditing);
    }
    
    setIsEditing(null);
    setEditForm({});
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this compatibility record?")) return;
    await supabase.from("battery_compatibility").delete().eq("id", id);
    loadData();
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Battery Compatibility Mapping</h2>
        <button onClick={() => { setIsEditing("new"); setEditForm({ active: true, verification_status: 'Pending Verification' }); }} className="bg-brand text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-dark">
          <Plus size={18} /> Map Battery
        </button>
      </div>

      <div className="p-6">
        {isEditing && (
          <div className="mb-8 bg-background p-6 rounded-xl border border-border">
            <h3 className="font-bold mb-4">{isEditing === "new" ? "New Compatibility Rule" : "Edit Compatibility Rule"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Vehicle Type *</label>
                <select value={editForm.vehicle_type_id || ""} onChange={e => setEditForm({...editForm, vehicle_type_id: e.target.value, brand_id: "", model_id: "", variant_id: ""})} className="w-full bg-surface border border-border rounded p-2 text-foreground">
                  <option value="">Select Type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Brand *</label>
                <select value={editForm.brand_id || ""} onChange={e => setEditForm({...editForm, brand_id: e.target.value, model_id: "", variant_id: ""})} className="w-full bg-surface border border-border rounded p-2 text-foreground" disabled={!editForm.vehicle_type_id}>
                  <option value="">Select Brand</option>
                  {brands.filter(b => b.vehicle_type_id === editForm.vehicle_type_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Model *</label>
                <select value={editForm.model_id || ""} onChange={e => setEditForm({...editForm, model_id: e.target.value, variant_id: ""})} className="w-full bg-surface border border-border rounded p-2 text-foreground" disabled={!editForm.brand_id}>
                  <option value="">Select Model</option>
                  {models.filter(m => m.brand_id === editForm.brand_id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Variant *</label>
                <select value={editForm.variant_id || ""} onChange={e => setEditForm({...editForm, variant_id: e.target.value})} className="w-full bg-surface border border-border rounded p-2 text-foreground" disabled={!editForm.model_id}>
                  <option value="">Select Variant</option>
                  {variants.filter(v => v.model_id === editForm.model_id).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-6 border-t border-border">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-muted-foreground mb-1">Recommended Goodwin Battery *</label>
                <select value={editForm.product_id || ""} onChange={e => setEditForm({...editForm, product_id: e.target.value})} className="w-full bg-brand/10 border-2 border-brand/50 rounded p-3 text-foreground font-bold">
                  <option value="">Select Battery</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.ah})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Fuel Type (Override)</label>
                <input type="text" value={editForm.fuel_type || ""} onChange={e => setEditForm({...editForm, fuel_type: e.target.value})} placeholder="e.g. Petrol" className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Year From</label>
                <input type="text" value={editForm.year_from || ""} onChange={e => setEditForm({...editForm, year_from: e.target.value})} placeholder="YYYY" className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Year To</label>
                <input type="text" value={editForm.year_to || ""} onChange={e => setEditForm({...editForm, year_to: e.target.value})} placeholder="YYYY" className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-muted-foreground mb-1">Fitment Notes</label>
                <input type="text" value={editForm.fitment_notes || ""} onChange={e => setEditForm({...editForm, fitment_notes: e.target.value})} placeholder="e.g. Polarity L, Remove base spacer" className="w-full bg-surface border border-border rounded p-2 text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-6 border-t border-border">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Verification Status *</label>
                <select value={editForm.verification_status || "Pending Verification"} onChange={e => setEditForm({...editForm, verification_status: e.target.value})} className={clsx(
                  "w-full rounded p-2 text-white font-bold",
                  editForm.verification_status === 'Verified' ? "bg-green-600" : editForm.verification_status === 'Inactive' ? "bg-gray-600" : "bg-yellow-600"
                )}>
                  <option value="Verified">Verified (Publicly Visible)</option>
                  <option value="Pending Verification">Pending Verification (Hidden)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">Only 'Verified' and 'Active' mappings appear on the website.</p>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="active" checked={editForm.active ?? true} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-4 h-4 accent-brand" />
                <label htmlFor="active" className="text-sm font-bold text-foreground">Rule is Active</label>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-brand text-white px-6 py-2 rounded font-bold">Save Rule</button>
              <button onClick={() => { setIsEditing(null); setEditForm({}); }} className="bg-surface-hover text-foreground px-6 py-2 rounded font-bold">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-bold">Vehicle Match</th>
                <th className="pb-3 font-bold">Battery</th>
                <th className="pb-3 font-bold text-center">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {compatibilities.map(comp => (
                <tr key={comp.id} className="border-b border-border/50 hover:bg-surface-hover/50">
                  <td className="py-4">
                    <div className="font-bold text-foreground">
                      {comp.vehicle_brand?.name} {comp.vehicle_model?.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                      <span className="bg-surface-hover px-1 rounded">{comp.vehicle_variant?.name}</span>
                      {comp.year_from && <span>({comp.year_from}-{comp.year_to || 'Now'})</span>}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-brand">{comp.product?.name}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      {comp.verification_status === 'Verified' && comp.active ? (
                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertCircle size={12} /> {comp.verification_status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setIsEditing(comp.id); setEditForm(comp); }} className="p-2 hover:bg-background rounded text-brand"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(comp.id)} className="p-2 hover:bg-background rounded text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {compatibilities.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No compatibility rules found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
