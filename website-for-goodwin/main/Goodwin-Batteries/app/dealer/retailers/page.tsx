"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Edit2, Power, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DealerRetailersPage() {
  const [dealer, setDealer] = useState<any>(null);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", region: "", seller_code: "" });
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("dealer_auth");
    if (!auth) {
      router.push("/dealer/login");
      return;
    }
    
    try {
      const parsed = JSON.parse(auth);
      if (parsed.role === 'retailer') {
        router.push("/dealer");
        return;
      }
      setDealer(parsed);
      fetchRetailers(parsed.seller_code);
    } catch (e) {
      router.push("/dealer/login");
    }
  }, []);

  async function fetchRetailers(parentCode: string) {
    setLoading(true);
    const { data } = await supabase
      .from("dealers")
      .select("*")
      .eq("role", "retailer")
      .eq("parent_dealer_code", parentCode)
      .order("created_at", { ascending: false });
    if (data) setRetailers(data);
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let err;
    const dataToSave = {
      ...formData,
      role: 'retailer',
      parent_dealer_code: dealer.seller_code
    };

    if (editingRetailer) {
      const { error } = await supabase.from("dealers").update(dataToSave).eq("id", editingRetailer.id);
      err = error;
    } else {
      const { error } = await supabase.from("dealers").insert([dataToSave]);
      err = error;
    }
    
    if (err) {
      alert("Error saving retailer: " + err.message);
      return;
    }
    
    setIsModalOpen(false);
    setEditingRetailer(null);
    setFormData({ name: "", email: "", mobile: "", region: "", seller_code: "" });
    fetchRetailers(dealer.seller_code);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean | null) => {
    // If currentStatus is null or undefined, default it to true
    const isActive = currentStatus === false ? false : true;
    const newStatus = !isActive;
    
    const action = newStatus ? "activate" : "deactivate";
    if (confirm(`Are you sure you want to ${action} this retailer?`)) {
      await supabase.from("dealers").update({ is_authorized: newStatus }).eq("id", id);
      fetchRetailers(dealer.seller_code);
    }
  };

  const openEdit = (ret: any) => {
    setEditingRetailer(ret);
    setFormData({
      name: ret.name,
      email: ret.email,
      mobile: ret.mobile || "",
      region: ret.region,
      seller_code: ret.seller_code
    });
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingRetailer(null);
    setFormData({ name: "", email: "", mobile: "", region: dealer.region, seller_code: "" });
    setIsModalOpen(true);
  };

  if (loading || !dealer) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-brand" size={32} /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-background">
      <div className="container py-8">
        <Link href="/dealer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Manage Retailers</h1>
            <p className="text-muted-foreground">Add and manage retailers under your dealership.</p>
          </div>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors"
          >
            <Plus size={20} /> Add Retailer
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-hover border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Seller Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Region</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {retailers.map((r) => (
                <tr key={r.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="p-4 font-mono text-brand font-bold">{r.seller_code}</td>
                  <td className="p-4 font-bold text-foreground">{r.name}</td>
                  <td className="p-4">{r.region}</td>
                  <td className="p-4">
                    <div className="text-sm">{r.email}</div>
                    <div className="text-sm text-muted-foreground">{r.mobile}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${r.is_authorized !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {r.is_authorized !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openEdit(r)} className="p-2 text-muted-foreground hover:text-brand bg-background border border-border rounded" title="Edit Retailer"><Edit2 size={16} /></button>
                    <button onClick={() => handleToggleStatus(r.id, r.is_authorized)} className={`p-2 bg-background border border-border rounded ${r.is_authorized !== false ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}`} title={r.is_authorized !== false ? "Deactivate Retailer" : "Activate Retailer"}>
                      <Power size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {retailers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">No retailers found. Add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-foreground mb-4">{editingRetailer ? 'Edit Retailer' : 'Add Retailer'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Code (Used as Password)</label>
                <input required type="text" value={formData.seller_code} onChange={e => setFormData({...formData, seller_code: e.target.value.toUpperCase()})} className="w-full bg-background border border-border rounded-lg p-3 font-mono text-foreground uppercase" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Region</label>
                <input required type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Email (Used for Login)</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Mobile</label>
                <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-foreground" />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface border border-border py-3 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-brand text-white py-3 rounded-lg font-bold">Save Retailer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
