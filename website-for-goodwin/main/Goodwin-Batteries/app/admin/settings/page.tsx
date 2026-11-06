"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, MessageSquare, Bell, Send, CheckCircle2, ShieldCheck } from "lucide-react";

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [orderWhatsApp, setOrderWhatsApp] = useState({
    whatsappNumber: "9667724411",
    countryCode: "91",
    enableAlerts: true,
    autoOpenNotification: true,
  });
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from("global_settings").select("*").single();
      if (data) {
        setSettings(data);
      } else {
        console.error("Error loading settings:", error);
      }
      setLoading(false);
    }
    loadSettings();

    // Load WhatsApp Order Notification Configuration
    fetch("/api/admin/whatsapp-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setOrderWhatsApp(data.config);
        }
      })
      .catch((err) => console.warn("Could not load WhatsApp config", err));
  }, []);

  const handleTestWhatsApp = async () => {
    setTestingWhatsApp(true);
    try {
      // 1. Save current setting first
      await fetch("/api/admin/whatsapp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderWhatsApp),
      });

      // 2. Dispatch test message
      const res = await fetch("/api/notifications/whatsapp-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTest: true }),
      });
      const data = await res.json();
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
    } catch (err: any) {
      alert("Error sending test WhatsApp: " + err.message);
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      // 1. Save global settings to Supabase
      const { error } = await supabase
        .from("global_settings")
        .update({
          company_name: settings.company_name,
          tagline: settings.tagline,
          phone_support: settings.phone_support,
          phone_sales: settings.phone_sales,
          whatsapp_main: orderWhatsApp.whatsappNumber || settings.whatsapp_main,
          email_support: settings.email_support,
          email_sales: settings.email_sales,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          pincode: settings.pincode,
          google_maps_url: settings.google_maps_url,
          facebook_url: settings.facebook_url,
          instagram_url: settings.instagram_url,
          youtube_url: settings.youtube_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", settings.id);

      if (error) throw error;

      // 2. Save WhatsApp Order Notifications Configuration
      await fetch("/api/admin/whatsapp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderWhatsApp),
      });

      setMessage({ text: "All settings & WhatsApp notification configuration saved successfully!", type: "success" });
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;
  if (!settings) return <div className="p-12 text-center">Settings not found. Please ensure database schema is initialized.</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Global Settings</h1>
          <p className="text-muted-foreground">Manage company information, contact details, and social links.</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 bg-surface border border-border rounded-xl p-8 shadow-sm">
        {/* Brand Details */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Brand Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Company Name</label>
              <input type="text" name="company_name" value={settings.company_name || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Official Tagline</label>
              <input type="text" name="tagline" value={settings.tagline || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Contact Numbers (10 digits)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Sales Phone</label>
              <input type="text" name="phone_sales" value={settings.phone_sales || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Support Phone</label>
              <input type="text" name="phone_support" value={settings.phone_support || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand mb-2">Main WhatsApp</label>
              <input type="text" name="whatsapp_main" value={settings.whatsapp_main || ""} onChange={handleChange} className="w-full bg-background border border-brand/50 rounded-xl p-3 text-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Used for Quick Enquiries</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Order Notifications Configuration */}
        <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-black text-foreground">
                  Online Order WhatsApp Notifications
                </h2>
                <p className="text-xs text-muted-foreground">
                  Every online order placed on the website will be automatically formatted and alerted to this WhatsApp number.
                </p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> Active Notification Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Order Notification WhatsApp Mobile Number (10 digits)
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-background border border-border px-3.5 py-3 rounded-xl text-xs font-bold text-muted-foreground select-none">
                  +{orderWhatsApp.countryCode || "91"}
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={orderWhatsApp.whatsappNumber}
                  onChange={(e) =>
                    setOrderWhatsApp({
                      ...orderWhatsApp,
                      whatsappNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="e.g. 9667724411"
                  className="flex-1 bg-background border-2 border-emerald-500/40 focus:border-emerald-500 rounded-xl p-3 text-foreground font-mono font-bold tracking-wider text-base focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                New online orders with customer name, phone, delivery address, time slot, and battery details will be sent to this WhatsApp.
              </p>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={testingWhatsApp || !orderWhatsApp.whatsappNumber}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {testingWhatsApp ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending Test...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Test Order Alert
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                Opens sample alert in WhatsApp to test number
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={orderWhatsApp.enableAlerts}
                onChange={(e) =>
                  setOrderWhatsApp({ ...orderWhatsApp, enableAlerts: e.target.checked })
                }
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="font-semibold text-foreground">
                Enable instant WhatsApp notifications for every new online order
              </span>
            </label>

            <span className="text-[11px] text-emerald-600 font-bold">
              Recipient: +{orderWhatsApp.countryCode || "91"} {orderWhatsApp.whatsappNumber}
            </span>
          </div>
        </div>

        {/* Emails */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Email Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Sales Email</label>
              <input type="email" name="email_sales" value={settings.email_sales || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Support Email</label>
              <input type="email" name="email_support" value={settings.email_support || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Head Office Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-2">Street Address / Area</label>
              <textarea name="address" value={settings.address || ""} onChange={handleChange} rows={2} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">City</label>
              <input type="text" name="city" value={settings.city || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">State</label>
              <input type="text" name="state" value={settings.state || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Pincode</label>
              <input type="text" name="pincode" value={settings.pincode || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Google Maps URL</label>
              <input type="text" name="google_maps_url" value={settings.google_maps_url || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" />
            </div>
          </div>
        </div>

        {/* Socials */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Social Media & Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Facebook URL</label>
              <input type="text" name="facebook_url" value={settings.facebook_url || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" placeholder="Leave blank to hide" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Instagram URL</label>
              <input type="text" name="instagram_url" value={settings.instagram_url || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" placeholder="Leave blank to hide" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">YouTube URL</label>
              <input type="text" name="youtube_url" value={settings.youtube_url || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-foreground" placeholder="Leave blank to hide" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-brand text-white font-bold uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-brand-dark transition-all shadow-lg flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
