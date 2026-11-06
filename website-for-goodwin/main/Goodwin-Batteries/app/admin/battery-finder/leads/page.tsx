"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BatteryFinderLead } from "@/types";
import { Loader2, Download, Search, Calendar } from "lucide-react";

export default function LeadsViewer() {
  const [leads, setLeads] = useState<BatteryFinderLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const { data } = await supabase.from("battery_finder_leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  }

  const exportCSV = () => {
    const headers = ["Date", "Enquiry ID", "Name", "Phone", "Email", "Vehicle", "Recommended Battery"];
    const rows = leads.map(l => [
      new Date(l.created_at).toLocaleDateString(),
      l.enquiry_id,
      l.customer_name || "N/A",
      l.phone || "N/A",
      l.email || "N/A",
      `${l.brand} ${l.model} ${l.variant} (${l.year})`,
      l.recommended_product_id || "N/A"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `battery_finder_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Battery Finder Leads</h2>
        <button onClick={exportCSV} className="bg-surface-hover border border-border text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:border-brand">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-bold">Date / ID</th>
                <th className="pb-3 font-bold">Customer Details</th>
                <th className="pb-3 font-bold">Vehicle Details</th>
                <th className="pb-3 font-bold">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-surface-hover/50">
                  <td className="py-4">
                    <div className="font-bold text-foreground flex items-center gap-1"><Calendar size={14} className="text-muted-foreground" /> {new Date(lead.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">{lead.enquiry_id}</div>
                  </td>
                  <td className="py-4">
                    <div className="font-bold text-foreground">{lead.customer_name || "Guest"}</div>
                    {(lead.phone || lead.email) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {lead.phone && <div>{lead.phone}</div>}
                        {lead.email && <div>{lead.email}</div>}
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-foreground">{lead.brand} {lead.model}</span>
                    <span className="text-xs text-muted-foreground block mt-1">{lead.variant} {lead.fuel ? `(${lead.fuel})` : ""} {lead.year ? `(${lead.year})` : ""}</span>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-brand">{lead.recommended_product_id ? "Battery Found" : "No Match"}</span>
                    <span className="text-xs text-muted-foreground block mt-1">{lead.recommended_product_id}</span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No leads captured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
