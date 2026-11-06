import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Save, Loader2 } from "lucide-react";

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
  onSuccess: () => void;
}

export default function WarrantyModal({ isOpen, onClose, registration, onSuccess }: WarrantyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    battery_model_id: "",
    serial_number: "",
    purchase_date: "",
    invoice_number: "",
    dealer_name: "",
    retailer_name: "",
    retailer_location: "",
    vehicle_reg_number: "",
    vehicle_make_model: "",
    status: "",
    admin_notes: ""
  });

  useEffect(() => {
    if (registration) {
      setFormData({
        customer_name: registration.customer_name || "",
        mobile: registration.mobile || "",
        email: registration.email || "",
        battery_model_id: registration.battery_model_id || "",
        serial_number: registration.serial_number || "",
        purchase_date: registration.purchase_date || "",
        invoice_number: registration.invoice_number || "",
        dealer_name: registration.dealer_name || "",
        retailer_name: registration.retailer_name || "",
        retailer_location: registration.retailer_location || "",
        vehicle_reg_number: registration.vehicle_reg_number || "",
        vehicle_make_model: registration.vehicle_make_model || "",
        status: registration.status || "Registered",
        admin_notes: registration.admin_notes || ""
      });
    }
    setError("");
  }, [registration, isOpen]);

  if (!isOpen || !registration) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("warranty_registrations")
        .update(formData)
        .eq("id", registration.id);

      if (updateError) throw updateError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
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
          <h2 className="text-2xl font-bold text-foreground">Edit Warranty Registration</h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">{registration.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Customer Name</label>
              <input required type="text" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Mobile</label>
              <input required type="text" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground font-mono" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground appearance-none">
                <option value="Registered">Registered</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Battery Model ID</label>
              <input type="text" value={formData.battery_model_id} onChange={(e) => setFormData({...formData, battery_model_id: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Serial Number</label>
              <input required type="text" value={formData.serial_number} onChange={(e) => setFormData({...formData, serial_number: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground uppercase font-mono" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Purchase Date</label>
              <input required type="date" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Invoice Number</label>
              <input type="text" value={formData.invoice_number} onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Dealer Name</label>
              <input type="text" value={formData.dealer_name} onChange={(e) => setFormData({...formData, dealer_name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Retailer Name</label>
              <input type="text" value={formData.retailer_name} onChange={(e) => setFormData({...formData, retailer_name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Retailer Location</label>
              <input type="text" value={formData.retailer_location} onChange={(e) => setFormData({...formData, retailer_location: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Vehicle Reg Number</label>
              <input type="text" value={formData.vehicle_reg_number} onChange={(e) => setFormData({...formData, vehicle_reg_number: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground uppercase" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Vehicle Make/Model</label>
              <input type="text" value={formData.vehicle_make_model} onChange={(e) => setFormData({...formData, vehicle_make_model: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Admin Notes (Reason for Rejection, Internal Comments)</label>
              <textarea rows={3} value={formData.admin_notes} onChange={(e) => setFormData({...formData, admin_notes: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" placeholder="These notes will be visible to the customer when checking status." />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded font-bold text-foreground bg-background border border-border hover:bg-surface-hover">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded font-bold text-white bg-brand hover:bg-brand-dark flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
