"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { useGlobalSettings } from "@/components/GlobalSettingsProvider";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const settings = useGlobalSettings();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const id = `GW-MSG-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("enquiries").insert({
        id,
        name: formData.name,
        mobile: formData.phone,
        message: formData.message,
        subject: formData.subject,
      });

      if (error) throw error;
      
      setMessage({ text: "Thank you! Your message has been sent successfully. Our team will contact you shortly.", type: "success" });
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      setMessage({ text: "Failed to send message. Please try again or contact us directly on WhatsApp.", type: "error" });
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
            CONTACT <span className="text-primary">GOODWIN</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Have a question or need support? Our team is ready to assist you.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div className="flex flex-col gap-12">
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground mb-8">Get in Touch</h2>
                <div className="flex flex-col gap-8">
                  {/* Delhi Head Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface border border-border/50 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      <MapPin size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Delhi Head Office</h4>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        Shop No. 51, Gokhale Market,<br />
                        Opposite Tis Hazari Court,<br />
                        Delhi – 110054
                      </p>
                      <a href="https://maps.google.com/?q=Gokhale+Market+Tis+Hazari+Court+Delhi+110054" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                        View on Google Maps <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  {/* Indore Corporate Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface border border-border/50 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      <MapPin size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Indore Corporate Office</h4>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        202, 2nd Floor – Samiksh Landmark,<br />
                        Near Choithram Circle, A.B. Road,<br />
                        Indore – 452012
                      </p>
                      <a href="https://maps.google.com/?q=Samiksh+Landmark+Choithram+Circle+Indore" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                        View on Google Maps <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface border border-border/50 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      <Phone size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Call Us</h4>
                      <a href="tel:9667724411" className="text-muted-foreground leading-relaxed hover:text-primary transition-colors text-lg font-mono mb-1 block">Sales: 96677 24411</a>
                      <a href="tel:9220404411" className="text-muted-foreground leading-relaxed hover:text-primary transition-colors text-lg font-mono mb-1 block">Support: 92204 04411</a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface border border-border/50 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      <Mail size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Email Us</h4>
                      <a href="mailto:sales@goodwinbatteries.com" className="text-muted-foreground leading-relaxed hover:text-primary transition-colors block mb-1">sales@goodwinbatteries.com (Sales)</a>
                      <a href="mailto:support@goodwinbatteries.com" className="text-muted-foreground leading-relaxed hover:text-primary transition-colors block">support@goodwinbatteries.com (Support)</a>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface border border-border/50 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      <ExternalLink size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-3">Connect With Us</h4>
                      <div className="flex flex-wrap gap-2">
                        <a href="https://facebook.com/goodwinbatteries" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors">Facebook</a>
                        <a href="https://instagram.com/goodwinbatteries" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors">Instagram</a>
                        <a href="https://youtube.com/@goodwinbatteries" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors">YouTube</a>
                        <a href="https://twitter.com/goodwinbattery" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors">Twitter (X)</a>
                        <a href="https://linkedin.com/company/goodwinbatteries" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors">LinkedIn</a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Google Map */}
                  <div className="mt-8">
                    <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm text-muted-foreground">Location Map</h4>
                    <iframe 
                      src="https://maps.google.com/maps?q=Gokhale%20Market%2C%20Tis%20Hazari%20Court%2C%20Delhi%20110054&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="300" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade" 
                      className="rounded-xl border border-border/50 shadow-lg grayscale invert opacity-80"
                    ></iframe>
                  </div>

                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-surface border border-border/50 rounded-2xl p-8 md:p-10 shadow-2xl h-fit relative overflow-hidden">
               {/* Decorative glow */}
               <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[100px] pointer-events-none mix-blend-screen" />
               
              <h3 className="text-2xl font-bold text-foreground mb-6 relative z-10">Send us a message</h3>
              
              {message.text && (
                <div className={`p-4 rounded-xl mb-6 relative z-10 ${message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone *</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Subject *</label>
                  <select 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all appearance-none"
                  >
                    <option value="">Select a Subject</option>
                    <option value="sales">Sales Enquiry</option>
                    <option value="support">Warranty / Support</option>
                    <option value="dealer">Dealership Query</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Message *</label>
                  <textarea 
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-background border border-border/50 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all resize-none" 
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="mt-4 w-full bg-primary text-black font-bold uppercase tracking-wider p-4 rounded-lg hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 border-glow shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Send Enquiry"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
