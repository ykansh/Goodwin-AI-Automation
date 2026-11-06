"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, X } from "lucide-react";

export default function ProductForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    series: initialData?.series || "",
    category_id: initialData?.category_id || "",
    voltage: initialData?.voltage || "",
    ah: initialData?.ah || "",
    cca: initialData?.cca || "",
    warranty: initialData?.warranty || "",
    warranty_options: initialData?.warranty_options || [],
    image: initialData?.image || "",
    description: initialData?.description || "",
    features: initialData?.features || [],
    terminal_layout: initialData?.terminal_layout || "",
    dimensions: initialData?.dimensions || "",
    weight: initialData?.weight || "",
    display_order: initialData?.display_order || 0,
    is_published: initialData?.is_published ?? true,
    is_featured: initialData?.is_featured ?? false,
    application: initialData?.application || [],
  });

  const [newFeature, setNewFeature] = useState("");
  const [newApp, setNewApp] = useState("");
  const [newWarrantyOpt, setNewWarrantyOpt] = useState("");

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArrayAdd = (field: "features" | "application" | "warranty_options", value: string, setter: any) => {
    if (!value.trim()) return;
    setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    setter("");
  };

  const handleArrayRemove = (field: "features" | "application" | "warranty_options", index: number) => {
    const newArr = [...formData[field]];
    newArr.splice(index, 1);
    setFormData({ ...formData, [field]: newArr });
  };

  const generateSlug = () => {
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        id: initialData?.id || `prod-${formData.slug || Date.now()}`,
      };

      if (initialData) {
        await supabase.from("products").update(payload).eq("id", initialData.id);
      } else {
        await supabase.from("products").insert(payload);
      }

      // Revalidate Next.js cache for products
      await fetch('/api/revalidate?path=/products');

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl">
      {/* Basic Info */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Product Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Slug *</label>
            <div className="flex gap-2">
              <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
              <button type="button" onClick={generateSlug} className="bg-white/10 px-3 rounded text-sm hover:bg-white/20">Auto</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Series</label>
            <input type="text" name="series" value={formData.series} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Category *</label>
            <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground">
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Voltage</label>
            <input type="text" name="voltage" value={formData.voltage} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Capacity (Ah)</label>
            <input type="text" name="ah" value={formData.ah} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">CCA</label>
            <input type="text" name="cca" value={formData.cca} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Terminal Layout</label>
            <input type="text" name="terminal_layout" value={formData.terminal_layout} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Dimensions</label>
            <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Weight</label>
            <input type="text" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
        </div>
      </div>

      {/* Warranty */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Warranty Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Standard Warranty</label>
            <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} placeholder="e.g. 12 Months" className="w-full bg-background border border-border rounded p-3 text-foreground" />
            <p className="text-xs text-muted-foreground mt-1">Used for single-warranty products.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Warranty Options (Two-Wheeler)</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newWarrantyOpt} onChange={(e) => setNewWarrantyOpt(e.target.value)} placeholder="e.g. 48 Months" className="flex-1 bg-background border border-border rounded p-2 text-foreground text-sm" />
              <button type="button" onClick={() => handleArrayAdd("warranty_options", newWarrantyOpt, setNewWarrantyOpt)} className="bg-white/10 px-3 rounded hover:bg-white/20"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.warranty_options?.map((opt: string, i: number) => (
                <div key={i} className="bg-brand/20 text-brand px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  {opt} <button type="button" onClick={() => handleArrayRemove("warranty_options", i)}><X size={12} /></button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">If options exist, they will override standard warranty.</p>
          </div>
        </div>
      </div>

      {/* Media & Content */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Media & Content</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Image Path / URL</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="/assets/products/name.png" className="w-full bg-background border border-border rounded p-3 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-background border border-border rounded p-3 text-foreground"></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Applications</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newApp} onChange={(e) => setNewApp(e.target.value)} placeholder="Add application..." className="flex-1 bg-background border border-border rounded p-2 text-foreground text-sm" />
                <button type="button" onClick={() => handleArrayAdd("application", newApp, setNewApp)} className="bg-white/10 px-3 rounded hover:bg-white/20"><Plus size={16} /></button>
              </div>
              <ul className="text-sm flex flex-col gap-1">
                {formData.application?.map((app: string, i: number) => (
                  <li key={i} className="flex justify-between items-center bg-background p-2 rounded border border-border">
                    {app} <button type="button" onClick={() => handleArrayRemove("application", i)} className="text-red-500"><X size={14} /></button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Features / Technology</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." className="flex-1 bg-background border border-border rounded p-2 text-foreground text-sm" />
                <button type="button" onClick={() => handleArrayAdd("features", newFeature, setNewFeature)} className="bg-white/10 px-3 rounded hover:bg-white/20"><Plus size={16} /></button>
              </div>
              <ul className="text-sm flex flex-col gap-1">
                {formData.features?.map((f: string, i: number) => (
                  <li key={i} className="flex justify-between items-center bg-background p-2 rounded border border-border">
                    {f} <button type="button" onClick={() => handleArrayRemove("features", i)} className="text-red-500"><X size={14} /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Visibility & Ordering</h2>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="w-5 h-5 accent-brand" />
            <span className="font-bold text-foreground">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-5 h-5 accent-brand" />
            <span className="font-bold text-foreground">Featured</span>
          </label>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-bold text-muted-foreground">Display Order</label>
            <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="w-20 bg-background border border-border rounded p-2 text-foreground text-center" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.push("/admin/products")} className="px-6 py-3 border border-border rounded-lg font-bold hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-6 py-3 bg-brand text-white rounded-lg font-bold hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-70">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
