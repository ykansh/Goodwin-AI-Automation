import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Save, Loader2 } from "lucide-react";

interface DealerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealer?: any; // null if adding new
  onSuccess: () => void;
}

export default function DealerModal({ isOpen, onClose, dealer, onSuccess }: DealerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    opening_hours: "",
    latitude: "",
    longitude: "",
    is_published: true
  });

  useEffect(() => {
    if (dealer) {
      setFormData({
        name: dealer.name || "",
        address: dealer.address || "",
        city: dealer.city || "",
        state: dealer.state || "",
        pincode: dealer.pincode || "",
        phone: dealer.phone || "",
        opening_hours: dealer.opening_hours || "",
        latitude: dealer.latitude ? dealer.latitude.toString() : "",
        longitude: dealer.longitude ? dealer.longitude.toString() : "",
        is_published: dealer.is_published !== false
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        opening_hours: "",
        latitude: "",
        longitude: "",
        is_published: true
      });
    }
    setError("");
  }, [dealer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone,
        opening_hours: formData.opening_hours,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        is_published: formData.is_published
      };

      if (dealer?.id) {
        // Update
        const { error: updateError } = await supabase.from("dealers").update(payload).eq("id", dealer.id);
        if (updateError) throw updateError;
      } else {
        // Insert (generate id)
        const id = `d-${Date.now()}`;
        const { error: insertError } = await supabase.from("dealers").insert([{ id, ...payload }]);
        if (insertError) throw insertError;
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the dealer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {dealer ? "Edit Dealer" : "Add New Dealer"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Dealer / Shop Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Full Address</label>
              <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">City</label>
              <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">State</label>
              <input required type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Pincode</label>
              <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Opening Hours</label>
              <input type="text" value={formData.opening_hours} onChange={(e) => setFormData({...formData, opening_hours: e.target.value})} placeholder="e.g. Mon-Sat: 10AM-8PM" className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Latitude</label>
              <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none font-mono" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Longitude</label>
              <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="w-full bg-background border border-border rounded p-2.5 text-foreground focus:border-brand outline-none font-mono" />
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 rounded border-border bg-background checked:bg-brand" />
                <span className="font-bold text-foreground">Published (Visible on Website)</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded font-bold text-foreground bg-background border border-border hover:bg-surface-hover">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded font-bold text-white bg-brand hover:bg-brand-dark flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {dealer ? "Save Changes" : "Add Dealer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
