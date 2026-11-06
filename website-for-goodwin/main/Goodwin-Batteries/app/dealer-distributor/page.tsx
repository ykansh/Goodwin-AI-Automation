"use client";

import { useState } from "react";
import { useGlobalSettings } from "@/components/GlobalSettingsProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function DealerDistributorPage() {
  const settings = useGlobalSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    businessType: "",
    years: "",
    brands: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const combinedMessage = `Company: ${formData.company}
Business Type: ${formData.businessType}
Years in Business: ${formData.years}
Brands Handled: ${formData.brands}
Message: ${formData.message}`;

      const id = `GW-B2B-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("enquiries").insert({
        id,
        name: formData.name,
        mobile: formData.mobile,
        message: combinedMessage,
        subject: `B2B Enquiry from ${formData.city}, ${formData.state}`,
      });

      if (error) {
        console.error("Failed to save enquiry:", error);
      }

      const text = `Hello Goodwin Batteries,
I have a B2B Enquiry.
Name: ${formData.name}
Company: ${formData.company}
Mobile: ${formData.mobile}
Email: ${formData.email}
City/State: ${formData.city}, ${formData.state}
Business Type: ${formData.businessType}
Years in Business: ${formData.years}
Brands Handled: ${formData.brands}
Message: ${formData.message}

Please contact me regarding my enquiry.`;

      const whatsappNum = settings?.whatsapp_main?.replace(/\D/g, "") || "9667724411";
      window.open(`https://wa.me/91${whatsappNum}?text=${encodeURIComponent(text)}`, "_blank");

      setFormData({ name: "", company: "", mobile: "", email: "", city: "", state: "", businessType: "", years: "", brands: "", message: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/10 blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-6">
            GROW WITH <span className="text-primary">GOODWIN</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Join the Goodwin network and build your business with a growing, premium battery brand.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-3xl">
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
             {/* Decorative glow */}
             <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[100px] pointer-events-none mix-blend-screen" />
             
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8 text-center relative z-10">Business Enquiry Form</h2>
            
            <form className="flex flex-col gap-6 relative z-10" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input type="text" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                  <input type="text" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone / Mobile</label>
                  <input type="tel" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input type="email" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">City</label>
                  <input type="text" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">State</label>
                  <input type="text" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Business Type</label>
                  <select className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all appearance-none" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}>
                    <option value="">Select Type</option>
                    <option value="dealer">Become a Dealer</option>
                    <option value="distributor">Become a Distributor</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Years in Business</label>
                  <input type="number" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" value={formData.years} onChange={e => setFormData({...formData, years: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Brands Handled</label>
                <input type="text" className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" value={formData.brands} onChange={e => setFormData({...formData, brands: e.target.value})} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Message / Enquiry Details</label>
                <textarea rows={4} className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all resize-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
              </div>

              <button type="submit" disabled={loading} className="mt-4 w-full bg-primary text-black font-bold uppercase tracking-wider p-4 rounded-lg hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 border-glow shadow-lg shadow-primary/20">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
