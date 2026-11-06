import { useState, useEffect } from "react";
import { X, Save, Loader2, RefreshCw } from "lucide-react";
import { processClaimReplacement, createWarrantyClaim } from "@/app/actions/claim-actions";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
  onSuccess: () => void;
}

export default function ClaimModal({ isOpen, onClose, claim, onSuccess }: ClaimModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    warranty_id: "",
    serial_number: "",
    dealer_name: "",
    issue_description: "",
    status: "",
    admin_notes: "",
    replacement_serial_number: ""
  });

  useEffect(() => {
    if (claim) {
      setFormData({
        customer_name: claim.customer_name || "",
        mobile: claim.mobile || "",
        warranty_id: claim.warranty_id || "",
        serial_number: claim.serial_number || "",
        dealer_name: claim.dealer_name || "",
        issue_description: claim.issue_description || "",
        status: claim.status || "Pending Review",
        admin_notes: claim.admin_notes || "",
        replacement_serial_number: claim.replacement_serial_number || ""
      });
    }
    setError("");
  }, [claim, isOpen]);

  if (!isOpen || !claim) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!claim.id) {
        // Create new claim
        const result = await createWarrantyClaim(formData);
        if (result.error) throw new Error(result.error);
      } else {
        // Process/Update existing claim
        const result = await processClaimReplacement(claim.id, formData);
        if (result.error) throw new Error(result.error);
      }
      
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
          <h2 className="text-2xl font-bold text-foreground">{claim.id ? "Edit Warranty Claim" : "Create Warranty Claim"}</h2>
          {claim.id && <p className="text-muted-foreground font-mono text-sm mt-1">{claim.id}</p>}
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
              <label className="block text-sm font-bold text-muted-foreground mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground appearance-none">
                <option value="Pending Review">Pending Review</option>
                <option value="Under Inspection">Under Inspection</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Dealer Name</label>
              <input type="text" value={formData.dealer_name} onChange={(e) => setFormData({...formData, dealer_name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Warranty ID</label>
              <input type="text" value={formData.warranty_id} onChange={(e) => setFormData({...formData, warranty_id: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground font-mono" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Serial Number</label>
              <input required type="text" value={formData.serial_number} onChange={(e) => setFormData({...formData, serial_number: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground font-mono uppercase" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Issue Description</label>
              <textarea required rows={4} value={formData.issue_description} onChange={(e) => setFormData({...formData, issue_description: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-1">Admin Notes (Reason for Rejection, Internal Comments)</label>
              <textarea rows={3} value={formData.admin_notes} onChange={(e) => setFormData({...formData, admin_notes: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" placeholder="These notes will be visible to the customer when checking status." />
            </div>

            {formData.status === "Approved" && (
              <div className="md:col-span-2 bg-brand/5 border border-brand/20 p-4 rounded-xl mt-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-brand font-bold mb-3">
                  <RefreshCw size={18} />
                  <h3>Replacement Processing</h3>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">New Replacement Serial Number *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.replacement_serial_number} 
                    onChange={(e) => setFormData({...formData, replacement_serial_number: e.target.value.toUpperCase()})} 
                    className="w-full bg-background border border-border rounded p-2 text-foreground font-mono uppercase" 
                    placeholder="Scan or enter the new battery serial"
                  />
                  <p className="text-xs text-muted-foreground mt-2">This will update the old battery to 'REPLACED', mark the new battery as 'SOLD', and update the warranty records permanently.</p>
                </div>
              </div>
            )}
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
