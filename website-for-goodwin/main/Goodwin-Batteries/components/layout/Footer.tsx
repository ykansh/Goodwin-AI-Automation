"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
import { useGlobalSettings } from "@/components/GlobalSettingsProvider";

export default function Footer() {
  const settings = useGlobalSettings();

  return (
    <footer className="bg-slate-100/90 text-slate-700 pt-16 pb-10 border-t border-slate-200 relative overflow-hidden">
      {/* Top Helpline Banner */}
      <div className="container relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D] shrink-0">
              <Phone size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Toll-Free Customer Care</p>
              <a href="tel:9220404411" className="text-base font-black text-slate-900 hover:text-[#00843D] transition-colors">
                92204 04411
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dealership & Distributorship</p>
              <a href="tel:9667724411" className="text-base font-black text-slate-900 hover:text-amber-600 transition-colors">
                96677 24411
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D] shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Instant Digital Warranty</p>
              <Link href="/warranty" className="text-sm font-black text-[#00843D] hover:text-[#006830] transition-colors flex items-center gap-1">
                Verify Serial Number <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Info (Original Logo directly on background, NO white box) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-3 self-start">
              <Image 
                src="/assets/logo/g-logo.png" 
                alt="Goodwin" 
                width={38} 
                height={38} 
                className="object-contain"
              />
              <Image 
                src="/assets/logo/Goodwin.png" 
                alt={settings?.company_name || "Goodwin Batteries"} 
                width={145} 
                height={46} 
                className="object-contain"
              />
            </Link>
            
            <p className="text-xs font-black text-[#00843D] uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <Award size={14} /> {settings?.tagline || "India's Everyday Power Choice"}
            </p>

            <p className="text-xs leading-relaxed text-slate-600 max-w-sm">
              Engineered with advanced calcium-tin radial alloy grids and high vibration resistance. Powering two-wheelers, home inverters, VRLA equipment, agricultural sprayers, and lithium-ion systems across India with guaranteed reliability.
            </p>

            <div className="flex gap-2 mt-2">
              {[
                { name: "Facebook", code: "Fb", url: "https://facebook.com/goodwinbatteries" },
                { name: "Instagram", code: "Ig", url: "https://instagram.com/goodwinbatteries" },
                { name: "YouTube", code: "Yt", url: "https://youtube.com/@goodwinbatteries" },
                { name: "Twitter/X", code: "X", url: "https://twitter.com/goodwinbattery" },
                { name: "LinkedIn", code: "In", url: "https://linkedin.com/company/goodwinbatteries" }
              ].map((s) => (
                <a 
                  key={s.name}
                  href={s.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-[#00843D] hover:text-white hover:border-[#00843D] transition-all text-xs font-bold font-heading shadow-xs" 
                  title={s.name}
                >
                  {s.code}
                </a>
              ))}
            </div>
          </div>

          {/* Product Ranges */}
          <div className="lg:col-span-3">
            <h4 className="text-slate-900 font-heading font-black mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-[#00843D]" /> Battery Categories
            </h4>
            <ul className="flex flex-col gap-3 text-xs font-medium">
              <li>
                <Link href="/products/category/two-wheeler" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/>
                  Two-Wheeler VRLA (12 Models)
                </Link>
              </li>
              <li>
                <Link href="/products/category/inverter" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/>
                  Inverter &amp; UPS (Up to 72M Warranty)
                </Link>
              </li>
              <li>
                <Link href="/products/category/vrla-smf" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/>
                  VRLA, SMF &amp; Gold Series (13 Models)
                </Link>
              </li>
              <li>
                <Link href="/products/category/agriculture" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/>
                  Agricultural Sprayers (VRLA &amp; Li-Ion)
                </Link>
              </li>
              <li>
                <Link href="/products/category/lithium-ion" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/>
                  Lithium-Ion Packs (12V 8Ah &amp; 14Ah)
                </Link>
              </li>
              <li>
                <Link href="/upcoming-products" className="text-amber-700 font-bold hover:text-amber-800 transition-colors flex items-center gap-2 group pt-1">
                  <ArrowRight size={12} className="text-amber-600 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/>
                  Upcoming R&amp;D Pipeline <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">Upcoming</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Tools & Support */}
          <div className="lg:col-span-2">
            <h4 className="text-slate-900 font-heading font-black mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#00843D]" /> Explore & Tools
            </h4>
            <ul className="flex flex-col gap-3 text-xs font-medium">
              <li><Link href="/account/login" className="text-[#00843D] font-bold hover:underline transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-100 transition-all"/> Customer Login & Account</Link></li>
              <li><Link href="/track-order" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Track My Order</Link></li>
              <li><Link href="/gallery" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Manufacturing Gallery</Link></li>
              <li><Link href="/blogs" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Battery Care & Blogs</Link></li>
              <li><Link href="/vision" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Vision & Mission 2030</Link></li>
              <li><Link href="/battery-finder" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Vehicle Battery Finder</Link></li>
              <li><Link href="/warranty" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Instant Warranty Lookup</Link></li>
              <li><Link href="/dealer-distributor" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Become a Dealer</Link></li>
              <li><Link href="/dealers" className="text-slate-600 hover:text-[#00843D] transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-[#00843D] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Dealer Locator</Link></li>
            </ul>
          </div>

          {/* Offices & Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-slate-900 font-heading font-black mb-5 text-sm uppercase tracking-wider">Offices & Plant</h4>
            <ul className="flex flex-col gap-4 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#00843D] shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Head Office:</strong><br />
                  Shop No. 51, Gokhale Market, Opp. Tis Hazari Court, Delhi – 110054
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#00843D] shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Corporate Office:</strong><br />
                  202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#00843D] shrink-0" />
                <span className="text-slate-600">
                  <a href="mailto:sales@goodwinbatteries.com" className="hover:text-[#00843D] transition-colors">sales@goodwinbatteries.com</a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {settings?.company_name || "Goodwin Batteries"}. All rights reserved. Registered Trademark.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium">
            <Link href="/account/login" className="text-[#00843D] font-bold hover:underline transition-colors">Customer Login</Link>
            <Link href="/privacy" className="text-slate-600 hover:text-[#00843D] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-600 hover:text-[#00843D] transition-colors">Terms of Use</Link>
            <Link href="/admin/login" className="text-slate-600 hover:text-[#00843D] transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
