"use client";

import { useState } from "react";
import { ChevronRight, Search, Activity, Package, Wrench, CheckCircle2, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WarrantyStatusPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setStatus("searching");
    const upperQuery = query.trim().toUpperCase();
    
    try {
      // Check Claims
      let { data: claimData } = await supabase
        .from('warranty_claims')
        .select('*')
        .or(`id.eq.${upperQuery},serial_number.eq.${upperQuery},mobile.eq.${upperQuery}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check Registrations
      let { data: regData } = await supabase
        .from('warranty_registrations')
        .select('*')
        .or(`id.eq.${upperQuery},serial_number.eq.${upperQuery},mobile.eq.${upperQuery}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If we found a claim but no reg (maybe wasn't registered online), or we found a reg but no claim
      // Let's combine them into a single result object for rendering
      if (claimData || regData) {
        setResult({
          claim: claimData,
          registration: regData,
          type: claimData ? 'Claim' : 'Registration',
          id: claimData?.id || regData?.id,
          status: claimData?.status || regData?.status || 'Active',
          admin_notes: claimData?.admin_notes || regData?.admin_notes || null
        });
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch (err) {
      console.error("Error fetching status:", err);
      setStatus("not_found");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      {/* Header */}
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold mb-6 tracking-wider uppercase">
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">Track Warranty / Claim</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            TRACK <span className="text-brand">STATUS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Enter your Warranty ID, Claim ID, or Battery Serial Number to check current status.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-24 bg-background flex-1">
        <div className="container max-w-4xl">
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-2xl mb-12">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:border-brand transition-colors uppercase font-mono text-lg" 
                  placeholder="Enter ID (e.g., GW-WTY-... or GW-12345678)" 
                />
              </div>
              <button 
                type="submit"
                disabled={status === "searching" || !query.trim()}
                className="bg-brand text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-dark transition-all disabled:opacity-70 flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px]"
              >
                {status === "searching" ? <><Loader2 size={18} className="animate-spin" /> Searching...</> : "Track Status"}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {status === "not_found" && (
            <div className="text-center py-12 animate-in fade-in">
              <Activity size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Record Not Found</h3>
              <p className="text-muted-foreground mb-6">We couldn&apos;t find a warranty or claim matching that ID. Please check the details and try again, or <Link href="/contact" className="text-brand hover:underline">contact support</Link>.</p>
              <div className="flex justify-center gap-4">
                <Link href="/support/warranty-registration" className="text-brand font-bold hover:underline">Register New Warranty</Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/contact" className="text-brand font-bold hover:underline">Contact Support</Link>
              </div>
            </div>
          )}

          {status === "found" && result && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-surface-hover border-b border-border p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Record Found - {result.type}</p>
                    <p className="text-xl font-mono font-bold text-foreground">{result.id}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                    result.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                    result.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                    result.status === 'Pending Review' || result.status === 'Under Inspection' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {result.status === 'Active' || result.status === 'Registered' || result.status === 'Approved' ? <CheckCircle2 size={16} /> : <Activity size={16} />} 
                    {result.status}
                  </div>
                </div>
                
                <div className="p-8">
                  <h4 className="text-lg font-bold text-foreground mb-6">Status Timeline</h4>
                  
                  {result.admin_notes && (
                    <div className="mb-8 p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                      <h5 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        <Activity size={16} className="text-yellow-500" />
                        Message from Support
                      </h5>
                      <p className="text-muted-foreground whitespace-pre-wrap text-sm">{result.admin_notes}</p>
                    </div>
                  )}

                  <div className="relative border-l-2 border-border ml-4 space-y-8">
                    {result.registration && (
                      <div className="relative pl-8">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-brand border-4 border-surface" />
                        <h5 className="font-bold text-foreground">Warranty Registered</h5>
                        <p className="text-sm text-muted-foreground mb-1">{new Date(result.registration.created_at).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mb-3">Battery Serial {result.registration.serial_number} successfully registered to {result.registration.customer_name}.</p>
                        
                        {result.registration.invoice_url && (
                          <a href={result.registration.invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-brand font-bold text-sm hover:bg-surface-hover transition-colors">
                            <FileText size={16} /> View Original Invoice
                          </a>
                        )}
                      </div>
                    )}
                    
                    {result.claim && (
                      <div className="relative pl-8">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-yellow-500 border-4 border-surface" />
                        <h5 className="font-bold text-yellow-500">Claim Submitted</h5>
                        <p className="text-sm text-muted-foreground mb-1">{new Date(result.claim.created_at).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Claim regarding "{result.claim.issue_description}" was submitted. Current status: {result.claim.status}.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
