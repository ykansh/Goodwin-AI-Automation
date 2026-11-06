"use client";

import { useState } from "react";
import { ChevronRight, Upload, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WarrantyClaimPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [claimId, setClaimId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    warranty_id: "",
    serial_number: "",
    customer_name: "",
    mobile: "",
    dealer_name: "",
    issue_description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    
    try {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const generatedId = `GW-CLM-${new Date().getFullYear()}-${randomNum}`;
      
      const { error } = await supabase.from('warranty_claims').insert({
        id: generatedId,
        warranty_id: formData.warranty_id || null,
        serial_number: formData.serial_number.toUpperCase(),
        customer_name: formData.customer_name,
        mobile: formData.mobile,
        dealer_name: formData.dealer_name,
        issue_description: formData.issue_description,
        status: 'Pending Review'
      });

      if (error) {
        throw error;
      }
      
      setClaimId(generatedId);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to submit claim. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col w-full min-h-screen pt-20">
        <section className="py-24 flex-1 flex items-center justify-center bg-background">
          <div className="container max-w-2xl text-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Claim Submitted Successfully</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your warranty claim has been received. Our support team will review it and contact you shortly.
            </p>
            <div className="bg-surface border border-border rounded-xl p-8 mb-8 inline-block shadow-lg">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-2">Your Claim ID</p>
              <p className="text-3xl font-mono font-bold text-brand">{claimId}</p>
            </div>
            <div className="flex justify-center gap-4">
              <Link href="/support/warranty-status" className="bg-brand text-white px-8 py-3 rounded font-bold transition-all hover:bg-brand-dark">
                Track Claim Status
              </Link>
              <Link href="/" className="bg-surface border border-border text-foreground px-8 py-3 rounded font-bold hover:border-brand transition-all">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      {/* Header */}
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold mb-6 tracking-wider uppercase">
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">Warranty Claim</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            WARRANTY <span className="text-brand">CLAIM</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Experiencing an issue? Submit a warranty claim and our team will resolve it promptly.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
              <AlertTriangle size={32} className="text-brand" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Submit a New Claim</h2>
                <p className="text-sm text-muted-foreground">Please provide accurate details to expedite the process.</p>
              </div>
            </div>

            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Core Details */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Battery Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Warranty ID (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.warranty_id}
                      onChange={(e) => setFormData({...formData, warranty_id: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors uppercase" 
                      placeholder="e.g. GW-WTY-..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Battery Serial Number *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.serial_number}
                      onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors uppercase" 
                      placeholder="e.g. GW-12345678" 
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Full Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="e.g. Rahul Sharma" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Mobile Number *</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="+91" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Dealer Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.dealer_name}
                      onChange={(e) => setFormData({...formData, dealer_name: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="Name of the shop/dealer" 
                    />
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Issue Description</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Describe the Problem *</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.issue_description}
                      onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="Please describe the issue you are facing with the battery..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="bg-brand text-white px-10 py-4 rounded font-bold uppercase tracking-wider hover:bg-brand-dark transition-all disabled:opacity-70 flex items-center gap-2 w-full md:w-auto ml-auto"
                >
                  {status === "submitting" ? <><Loader2 size={18} className="animate-spin" /> Submitting Claim...</> : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
