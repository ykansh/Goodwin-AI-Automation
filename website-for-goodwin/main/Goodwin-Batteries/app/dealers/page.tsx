"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { Search, MapPin, Phone, MessageSquare, ExternalLink, ShieldCheck, Clock, Building2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useGlobalSettings } from "@/components/GlobalSettingsProvider";
import { supabase } from "@/lib/supabase";

interface DealerItem {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  pincode?: string;
  opening_hours?: string;
}

const DEFAULT_HUBS: DealerItem[] = [
  {
    id: "hub-delhi",
    name: "Goodwin Central Hub & Service Station",
    city: "Delhi",
    state: "Delhi",
    address: "Shop No. 51, Gokhale Market, Opp. Tis Hazari Court",
    pincode: "110054",
    phone: "9220404411",
    opening_hours: "Mon-Sat: 9:00 AM - 8:00 PM",
  },
  {
    id: "hub-mumbai",
    name: "Goodwin Western Logistics Depot",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Plot 14, Auto Nagar Industrial Area, Andheri East",
    pincode: "400069",
    phone: "9667724411",
    opening_hours: "Mon-Sat: 9:30 AM - 7:30 PM",
  },
  {
    id: "hub-indore",
    name: "Goodwin Central India Distribution Centre",
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Transport Nagar, Ring Road, Near Auto Cluster",
    pincode: "452014",
    phone: "9667724411",
    opening_hours: "Mon-Sat: 9:00 AM - 8:00 PM",
  },
  {
    id: "hub-jaipur",
    name: "Goodwin Rajasthan Regional Hub",
    city: "Jaipur",
    state: "Rajasthan",
    address: "VKIA Industrial Area, Road No. 9",
    pincode: "302013",
    phone: "9220404411",
    opening_hours: "Mon-Sat: 10:00 AM - 7:00 PM",
  },
];

function DealerLocatorContent() {
  const settings = useGlobalSettings();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [dealers, setDealers] = useState<DealerItem[]>(DEFAULT_HUBS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDealers() {
      try {
        const { data } = await supabase
          .from("dealers")
          .select("id, name, city, state, address, phone, pincode, opening_hours")
          .eq("is_published", true);

        if (data && data.length > 0) {
          setDealers(data);
        }
      } catch {
        // Fallback to default hubs
      }
    }
    loadDealers();
  }, []);

  const filteredDealers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dealers;
    return dealers.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.city && d.city.toLowerCase().includes(q)) ||
        (d.state && d.state.toLowerCase().includes(q)) ||
        (d.pincode && d.pincode.includes(q)) ||
        (d.address && d.address.toLowerCase().includes(q))
    );
  }, [dealers, query]);

  const handleWhatsAppContact = (cityOrLocation: string) => {
    const text = `Hello Goodwin Batteries,\nI am looking for an authorized dealer/replacement center near: ${cityOrLocation || query || "my city"}.\nPlease share contact details of the nearest store.`;
    const whatsappNum = settings?.whatsapp_main?.replace(/\D/g, "") || "9667724411";
    window.open(`https://wa.me/91${whatsappNum}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-20 bg-slate-50 text-slate-900">
      {/* Header */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-white py-16 border-b border-slate-200 text-center">
        <div className="container max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#00843D] text-xs font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={14} /> Nationwide Certified Network
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-4 tracking-tight">
            FIND A GOODWIN <span className="text-[#00843D]">DEALER</span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Locate authorized Goodwin battery sales, free doorstep fitment partners, and certified warranty claim centres near you.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by City, State, or 6-digit Pincode (e.g. Delhi, Mumbai, 110054)..."
              className="w-full bg-white border-2 border-slate-200 focus:border-[#00843D] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none shadow-md transition-all"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Dealer Cards Grid */}
      <section className="py-12 flex-1">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-black text-slate-900">
              {query ? `Results for "${query}"` : "Authorized Distribution Hubs & Flagship Stores"}
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredDealers.length} {filteredDealers.length === 1 ? "location" : "locations"}
            </span>
          </div>

          {filteredDealers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDealers.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-[#00843D] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00843D] flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                      <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {d.city}
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-base text-slate-900 leading-snug">
                      {d.name}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{d.address}{d.pincode ? ` - ${d.pincode}` : ""}, {d.state}</span>
                    </p>

                    {d.opening_hours && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <Clock size={13} className="text-slate-400" />
                        <span>{d.opening_hours}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`tel:${d.phone}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone size={14} /> Call
                    </a>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppContact(`${d.name}, ${d.city}`)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#00843D] hover:bg-[#006830] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto space-y-4">
              <MapPin size={48} className="text-slate-300 mx-auto" />
              <h3 className="text-lg font-heading font-black text-slate-900">
                No store found matching &quot;{query}&quot;
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We have over 500+ verified partner retailers across India. Connect with our dispatch team directly on WhatsApp to locate the nearest point or arrange doorstep delivery.
              </p>
              <button
                type="button"
                onClick={() => handleWhatsAppContact(query)}
                className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <MessageSquare size={16} /> Connect with Dealer Concierge on WhatsApp
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DealersLocatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-20">Loading dealers...</div>}>
      <DealerLocatorContent />
    </Suspense>
  );
}
