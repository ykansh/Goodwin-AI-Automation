"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronRight, ShieldCheck, Zap, Cog, ArrowRight, MapPin, 
  CheckCircle2, BatteryCharging, Search, Sparkles, Award, 
  Flame, Gauge, RefreshCw, PhoneCall, ShieldAlert, Check,
  Clock, Cpu, Shield, Layers, Wrench, BarChart3, HelpCircle
} from "lucide-react";
import VehicleFinder from "@/components/vehicle-finder/VehicleFinder";
import QuickEnquiryForm from "@/components/forms/QuickEnquiryForm";
import Image from "next/image";
import { GlobalSettings } from "@/components/GlobalSettingsProvider";
import {
  getCatalogWarrantyStats,
  getProductWarrantyInfo,
  getCategorySpecSummary,
} from "@/lib/product-specs";

export default function HomePageClient({ 
  applications = [], 
  products = [], 
  settings 
}: { 
  applications: any[]; 
  products?: any[]; 
  settings: GlobalSettings | null; 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"finder" | "warranty" | "dealer">("finder");
  const [quickSerial, setQuickSerial] = useState("");
  const [quickCity, setQuickCity] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("all");

  // Single Verified Warranty & Spec Stats
  const warrantyStats = getCatalogWarrantyStats(products);
  const twoWheelerSummary = getCategorySpecSummary("cat-two-wheeler", products);
  const inverterSummary = getCategorySpecSummary("cat-inverter", products);
  const vrlaSummary = getCategorySpecSummary("cat-vrla", products);
  const agroSummary = getCategorySpecSummary("cat-agriculture", products);

  // Get top featured products
  const featuredProducts = products.filter(p => p.is_featured).length > 0 
    ? products.filter(p => p.is_featured).slice(0, 4) 
    : products.slice(0, 4);

  const seriesFilter = selectedSeries === "all" 
    ? featuredProducts 
    : products.filter(p => p.category === selectedSeries || p.series === selectedSeries).slice(0, 4);

  return (
    <div className="flex flex-col w-full bg-white text-slate-900 overflow-hidden font-sans">
      
      {/* 1. HERO SECTION (Amaron & Exide Benchmark: Clean, Energetic Light Automotive Tech) */}
      <section className="relative w-full min-h-[88vh] flex flex-col justify-center pt-24 pb-16 overflow-hidden bg-radial-hero bg-grid-pattern">
        {/* Soft atmospheric energy blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Text & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start w-full lg:w-7/12 max-w-2xl"
          >
            {/* Automotive Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00843D] animate-ping" />
              <span className="text-[#00843D] text-xs font-black tracking-widest uppercase">
                OEM Engineered • 100% Maintenance-Free
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-slate-900 leading-[1.08] tracking-tight mb-6 uppercase break-words">
              UNCOMPROMISING <br />
              <span className="text-[#00843D]">POWER.</span> <br />
              <span className="text-slate-900">RELENTLESS DRIVE.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl font-normal">
              Engineered for grueling Indian roads and extreme tropical heat. Goodwin Batteries deliver maximum cold-cranking amps, ultra-low self-discharge, and proven endurance for two-wheelers, home inverters, VRLA equipment, agricultural sprayers, and lithium-ion systems.
            </p>
            
            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
              <a 
                href="#quick-assistant" 
                className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-700/20 active:scale-[0.98]"
              >
                <BatteryCharging size={18} />
                Find Battery For Vehicle
              </a>
              <Link 
                href="/products" 
                className="bg-white hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-300 shadow-xs active:scale-[0.98]"
              >
                Explore Catalogue
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Micro Highlights Pill Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00843D] shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">High CCA</div>
                  <div className="text-[11px] text-slate-500">Instant Start</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">Up to {warrantyStats.maxWarrantyShort}</div>
                  <div className="text-[11px] text-slate-500">Total Warranty</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">Zero Leak</div>
                  <div className="text-[11px] text-slate-500">AGM VRLA Tech</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Visual with Floating Specs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-5/12 relative h-[360px] sm:h-[460px] lg:h-[520px] flex items-center justify-center"
          >
            {/* Concentric Energy Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-emerald-500/5 to-transparent rounded-full blur-[70px]" />
            <div className="absolute w-72 h-72 border border-emerald-500/20 rounded-full animate-spin [animation-duration:30s] pointer-events-none" />
            
            {/* Battery Image */}
            <div className="relative w-full h-full max-w-md flex items-center justify-center z-10 drop-shadow-[0_20px_40px_rgba(0,132,61,0.18)]">
              <Image 
                src="/assets/products/goodwin-12vgw-tz5lb.png" 
                alt="Goodwin High Performance Battery" 
                fill 
                className="object-contain" 
                priority
              />
            </div>

            {/* Floating Spec Badge 1 (Top Left) */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-3 sm:top-6 left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 sm:gap-2.5 shadow-xl"
            >
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00843D] shadow-[0_0_8px_#00843D]" />
              <div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black">Cranking Power</div>
                <div className="text-[11px] sm:text-xs font-black text-slate-900">550+ Cold Amps</div>
              </div>
            </motion.div>

            {/* Floating Spec Badge 2 (Bottom Right) */}
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute bottom-4 sm:bottom-8 right-2 sm:right-6 z-20 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 sm:gap-3 shadow-xl"
            >
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black">Replacement Guarantee</div>
                <div className="text-[11px] sm:text-xs font-black text-amber-600">Fast Dealer Swap</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. INTERACTIVE QUICK ASSISTANT (Amaron & Exide Benchmark) */}
      <section id="quick-assistant" className="py-12 bg-slate-50 border-y border-slate-200 relative z-30">
        <div className="container">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
            
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("finder")}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeTab === "finder" 
                      ? "bg-[#00843D] text-white shadow-md shadow-emerald-700/20" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BatteryCharging size={16} />
                  1. Find Battery by Vehicle
                </button>

                <button
                  onClick={() => setActiveTab("warranty")}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeTab === "warranty" 
                      ? "bg-[#00843D] text-white shadow-md shadow-emerald-700/20" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <ShieldCheck size={16} />
                  2. Check Warranty Status
                </button>

                <button
                  onClick={() => setActiveTab("dealer")}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeTab === "dealer" 
                      ? "bg-[#00843D] text-white shadow-md shadow-emerald-700/20" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <MapPin size={16} />
                  3. Locate Nearest Dealer
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
                <Sparkles size={14} className="text-amber-500" />
                <span>Verified Match in Seconds</span>
              </div>
            </div>

            {/* Tab 1: Vehicle Finder Shortcut */}
            {activeTab === "finder" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Select Vehicle Type</h3>
                  <p className="text-xs text-slate-500">Click your vehicle to immediately match recommended Goodwin batteries:</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-6">
                  {[
                    { name: "Motorcycle / Bike", icon: "🏍️", href: "/products/category/two-wheeler", count: `${twoWheelerSummary.productCount} Models • Up to 48M` },
                    { name: "Inverter & Tubular", icon: "⚡", href: "/products/category/inverter", count: `${inverterSummary.productCount} Models • Up to ${warrantyStats.maxWarrantyShort}` },
                    { name: "VRLA & Gold Series", icon: "🔋", href: "/products/category/vrla-smf", count: `${vrlaSummary.productCount} Models • 4V/6V/12V` },
                    { name: "Agri Sprayers", icon: "🌿", href: "/products/category/agriculture", count: `${agroSummary.productCount} Models • 12V 12Ah–14Ah` },
                    { name: "Lithium-Ion (LiFePO4)", icon: "🚀", href: "/products/category/lithium-ion", count: "2 Models • 12V 8Ah & 14Ah" },
                  ].map((v) => (
                    <Link
                      key={v.name}
                      href={v.href}
                      className="bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-[#00843D] p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all group hover:-translate-y-1 shadow-xs hover:shadow-md"
                    >
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{v.icon}</span>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#00843D] transition-colors mb-0.5">{v.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{v.count}</span>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00843D]/10 text-[#00843D] flex items-center justify-center font-bold">
                      <Search size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Know your vehicle model or registration?</div>
                      <div className="text-xs text-slate-500">Access our comprehensive 400+ vehicle fitment directory.</div>
                    </div>
                  </div>
                  <Link
                    href="/battery-finder"
                    className="w-full sm:w-auto bg-[#00843D] hover:bg-[#006830] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors text-center shadow-xs"
                  >
                    Open Complete Vehicle Finder &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Quick Warranty Verification */}
            {activeTab === "warranty" && (
              <div className="animate-in fade-in duration-300 max-w-2xl py-2">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Check Battery Warranty Status</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Enter the serial number stamped on your Goodwin battery or the QR sticker (e.g. <code>GW-TZ5LB-260924-00128</code>):
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (quickSerial) {
                      router.push(`/warranty?serial=${encodeURIComponent(quickSerial)}`);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={quickSerial}
                    onChange={(e) => setQuickSerial(e.target.value.toUpperCase())}
                    placeholder="Enter Serial Number..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 font-mono uppercase focus:bg-white focus:outline-none focus:border-[#00843D]"
                  />
                  <button
                    type="submit"
                    className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShieldCheck size={16} />
                    Verify Now
                  </button>
                </form>

                <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Check size={12} className="text-[#00843D]" /> Instant expiry check</span>
                  <span className="flex items-center gap-1"><Check size={12} className="text-[#00843D]" /> Authorized dealer verification</span>
                  <span className="flex items-center gap-1"><Check size={12} className="text-[#00843D]" /> Hassle-free replacement</span>
                </div>
              </div>
            )}

            {/* Tab 3: Dealer Locator Shortcut */}
            {activeTab === "dealer" && (
              <div className="animate-in fade-in duration-300 max-w-2xl py-2">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Find Nearest Authorized Goodwin Dealer</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Enter your city, district, or 6-digit pincode to locate certified sales and replacement partners:
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    router.push(`/dealers?q=${encodeURIComponent(quickCity)}`);
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={quickCity}
                    onChange={(e) => setQuickCity(e.target.value)}
                    placeholder="e.g. Delhi, Indore, Jaipur, 452012..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#00843D]"
                  />
                  <button
                    type="submit"
                    className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MapPin size={16} />
                    Search Stores
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Over <strong>500+ service points</strong> nationwide.</span>
                  <Link href="/dealer-distributor" className="text-[#00843D] font-bold hover:underline">
                    Want to become a dealer? &rarr;
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 3. BATTERY APPLICATION DOMAINS (Tata Green & GS Yuasa Benchmark) */}
      <section className="py-20 bg-white relative">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00843D] text-xs font-black tracking-widest uppercase mb-3">
              Comprehensive Coverage
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 uppercase tracking-tight mb-4">
              POWER FOR EVERY APPLICATION
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              From high-vibration motorcycle demands to intense commercial logistics, Goodwin manufactures specialized chemistries optimized for each load profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Two Wheeler (Active) */}
            <div className="bg-slate-50/70 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🏍️
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00843D]">
                    {twoWheelerSummary.productCount} Models Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Two-Wheeler Series
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Advanced VRLA AGM batteries engineered for rough road vibration, zero water top-up, and instant high cold-cranking torque.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-6">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Spill-proof sealed construction (2.5Ah – 5Ah)</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Warranty options: {twoWheelerSummary.warrantyRangeLabel}</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Models: TZ4LB, TZ5LB, XL5LB, XL2.5LC</div>
                </div>
              </div>
              <Link 
                href="/products/category/two-wheeler" 
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1 uppercase tracking-wider pt-4 border-t border-slate-200"
              >
                Explore Bike Range ({twoWheelerSummary.productCount}) &rarr;
              </Link>
            </div>

            {/* Card 2: Inverter & Tall Tubular (Active) */}
            <div className="bg-slate-50/70 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00843D]">
                    {inverterSummary.productCount} Models Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Inverter &amp; UPS Backup
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Robust Tall Tubular (150Ah–250Ah) and compact 12V 8Ah UPS batteries designed for frequent power cuts and steady backup.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-6">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Tall Tubular: 150Ah, 200Ah &amp; 250Ah</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Compact 12V 8Ah VRLA &amp; Lithium UPS</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Verified Warranty: {inverterSummary.warrantyRangeLabel}</div>
                </div>
              </div>
              <Link 
                href="/products/category/inverter" 
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1 uppercase tracking-wider pt-4 border-t border-slate-200"
              >
                Explore Inverter &amp; UPS ({inverterSummary.productCount}) &rarr;
              </Link>
            </div>

            {/* Card 3: VRLA & Gold Series (Active) */}
            <div className="bg-slate-50/70 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00843D] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🔋
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00843D]">
                    {vrlaSummary.productCount} Models Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  VRLA, SMF &amp; Gold Series
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Sealed maintenance-free 4V, 6V, and 12V batteries for E-bikes, weighing scales, medical devices, toys, and emergency lighting.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-6">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Capacities from 4.2Ah up to 17Ah</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Gold Series 12V 12Ah–17Ah for E-Bikes</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Verified Warranty: {vrlaSummary.warrantyRangeLabel}</div>
                </div>
              </div>
              <Link 
                href="/products/category/vrla-smf" 
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1 uppercase tracking-wider pt-4 border-t border-slate-200"
              >
                Explore VRLA Range ({vrlaSummary.productCount}) &rarr;
              </Link>
            </div>

            {/* Card 4: Agricultural Sprayers & Lithium (Active) */}
            <div className="bg-slate-50/70 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🌿
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00843D]">
                    {agroSummary.productCount} Models Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Agri Sprayers &amp; Lithium
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Deep-cycle 12V 12Ah–14Ah VRLA and featherlight LiFePO4 Lithium batteries engineered for agricultural sprayers and solar equipment.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-6">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> 12V 14Ah Lithium-Ion (1.3 kg) &amp; VRLA</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Built-in BMS protection on LiFePO4 packs</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#00843D]" /> Verified Warranty: {agroSummary.warrantyRangeLabel}</div>
                </div>
              </div>
              <Link 
                href="/products/category/agriculture" 
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1 uppercase tracking-wider pt-4 border-t border-slate-200"
              >
                Explore Agro &amp; Lithium ({agroSummary.productCount}) &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INSIDE THE POWER: ENGINEERING ARCHITECTURE (Luminous & VARTA Benchmark) */}
      <section className="py-20 bg-slate-50 border-y border-slate-200 relative">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Visual Technical Diagram Container */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl p-8">
                <div className="inline-block text-[11px] font-black uppercase tracking-widest text-[#00843D] mb-4 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Engineering Anatomy
                </div>
                <h3 className="text-3xl font-heading font-black text-slate-900 mb-6 uppercase">
                  BUILT TO DEFY INDIAN HEAT & SHOCK.
                </h3>
                <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center p-4">
                  <Image 
                    src="/assets/categories/commercial-heavy-duty.jpg" 
                    alt="Goodwin Heavy Duty Engineering" 
                    fill 
                    className="object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
                  <div className="relative z-10 text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00843D] flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Cpu size={32} />
                    </div>
                    <div className="text-xl font-black text-slate-900 uppercase tracking-tight">Pure Calcium-Tin Alloy</div>
                    <div className="text-xs text-slate-600 mt-1 max-w-sm">99.99% refined lead with anti-corrosive silver/tin additives.</div>
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-2xl font-black text-[#00843D]">30G</div>
                    <div className="text-xs text-slate-500">Vibration Proofing Standard</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-2xl font-black text-amber-600">55°C+</div>
                    <div className="text-xs text-slate-500">Under-Hood Thermal Resilience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Core Technology Pillars */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#00843D] uppercase mb-3">
                <Sparkles size={14} /> The Goodwin Standard
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 uppercase tracking-tight mb-6">
                FOUR PILLARS OF DEPENDABILITY
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                Automotive batteries in India face extreme weather and rough asphalt. Here is how Goodwin’s cell architecture outperforms standard replacements:
              </p>

              <div className="space-y-5">
                {[
                  {
                    title: "1. Ultra-Dense Paste Formulation",
                    desc: "Specially mixed high-density lead oxide formula maximizes active surface contact, ensuring instantaneous ignition even in cold weather.",
                    icon: <Flame size={20} className="text-[#00843D]" />
                  },
                  {
                    title: "2. Anti-Corrosion Calcium-Tin Grids",
                    desc: "Eliminates electrolyte water consumption. Never requires refilling and preserves terminal conductivity over years of daily driving.",
                    icon: <Shield size={20} className="text-[#00843D]" />
                  },
                  {
                    title: "3. Reinforced Polypropylene Shell",
                    desc: "High-impact polymer container absorbs chassis vibration and withstands intense battery tray vibration on potholed roads.",
                    icon: <Layers size={20} className="text-amber-600" />
                  },
                  {
                    title: "4. Flame-Arrestor Safety Vents",
                    desc: "Micro-porous disc filters prevent external spark ingress while safely exhausting internal gas expansion.",
                    icon: <Wrench size={20} className="text-blue-600" />
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00843D] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PRODUCT CATALOGUE SHOWCASE (Livguard & Exide Benchmark) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-xs font-black tracking-widest text-[#00843D] uppercase mb-2">High Performance Lineup</div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 uppercase">
                FEATURED BATTERIES
              </h2>
            </div>
            
            <Link 
              href="/products" 
              className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1.5 uppercase tracking-wider group transition-colors"
            >
              View Full 30+ Catalogue 
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seriesFilter.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#00843D] transition-all flex flex-col group shadow-sm hover:shadow-xl hover:-translate-y-1.5"
              >
                {/* Visual Area */}
                <div className="relative h-56 p-6 flex items-center justify-center bg-slate-50 border-b border-slate-100 overflow-hidden">
                  <div className="w-full h-full relative z-10">
                    <Image 
                      src={product.image || "/assets/logo/Goodwin.png"} 
                      alt={product.name} 
                      fill 
                      className="object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  {/* Warranty Ribbon */}
                  <div className="absolute top-3 right-3 bg-white border border-emerald-200 text-[#00843D] text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                    {getProductWarrantyInfo(product).displayLabel}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                      {product.series || product.category || "Goodwin Automotive"}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors truncate">
                      {product.name}
                    </h3>

                    {/* Specs Pill Matrix */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                        <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                        <strong className="text-slate-900">{product.ah || "N/A"}</strong>
                      </div>
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                        <span className="text-[10px] text-slate-400 block uppercase">Voltage</span>
                        <strong className="text-slate-900">{product.voltage || "12V"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Ready for dispatch</span>
                    <Link 
                      href={`/products/${product.slug}`}
                      className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1 transition-colors"
                    >
                      Specifications <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMPLETE VEHICLE FINDER EMBED (Amaron & VARTA Benchmark) */}
      <section className="py-20 bg-slate-50 relative">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00843D] text-xs font-black tracking-widest uppercase mb-3">
              Precision Matching Engine
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 uppercase tracking-tight mb-4">
              FIND YOUR EXACT VEHICLE MATCH
            </h2>
            <p className="text-slate-600 text-base">
              Select your vehicle make, model, fuel type, and year to receive verified battery recommendations with instant dealer lookup.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <VehicleFinder />
          </div>
        </div>
      </section>

      {/* 7. DEALER & DISTRIBUTOR HUB (Livguard & Exide Benchmark) */}
      <section className="py-20 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 relative overflow-hidden border-t border-slate-200">
        <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#00843D] uppercase mb-3">
              <Award size={14} /> Business Opportunities
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-black text-slate-900 mb-6 uppercase leading-[1.08]">
              PARTNER WITH <br />
              <span className="text-[#00843D]">GOODWIN.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Join India's fastest expanding automotive power network. Enjoy direct manufacturer margins, territory protection, digital warranty automation, and consistent supply reliability.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-xl font-black text-[#00843D]">High Margins</div>
                <div className="text-xs text-slate-500">Competitive dealer pricing</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-xl font-black text-amber-600">Instant Claims</div>
                <div className="text-xs text-slate-500">Paperless warranty replacement</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dealer-distributor" 
                className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-center shadow-lg shadow-emerald-700/20"
              >
                Apply as Dealer / Distributor
              </Link>
              <Link 
                href="/contact" 
                className="bg-white hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center border border-slate-300 shadow-xs"
              >
                Speak with Sales Team
              </Link>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00843D]">
                <PhoneCall size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Direct Enquiry</h3>
                <p className="text-xs text-slate-500">Our regional sales head will respond within 4 business hours.</p>
              </div>
            </div>
            <QuickEnquiryForm />
          </div>

        </div>
      </section>

      {/* 8. GOODWIN ECOSYSTEM: INNOVATION, GALLERY, VISION & BLOGS */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-xs font-black tracking-widest text-[#00843D] uppercase mb-2">The Goodwin Universe</div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 uppercase">
                DISCOVER MORE
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              From our automated robotic assembly line to our 2030 sustainability roadmap and expert battery maintenance guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Upcoming Innovations */}
            <div className="bg-slate-50 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <div className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block mb-2">
                  R&D Pipeline
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Upcoming Innovations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Preview next-gen heavy commercial E-Rickshaw batteries, VoltMax solar tall tubular, and smart LFP lithium packs.
                </p>
              </div>
              <Link 
                href="/upcoming-products"
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1.5 pt-4 border-t border-slate-200/60"
              >
                Preview Pipeline <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2: Manufacturing Gallery */}
            <div className="bg-slate-50 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00843D] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Cpu size={24} />
                </div>
                <div className="text-[10px] font-black uppercase text-[#00843D] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mb-2">
                  Plant & Labs
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Manufacturing Gallery
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Take a visual walkthrough of our 50,000+ sq. ft. facility, automated formation lines, and 30G vibration dynos.
                </p>
              </div>
              <Link 
                href="/gallery"
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1.5 pt-4 border-t border-slate-200/60"
              >
                View Plant Media <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3: Vision & Mission 2030 */}
            <div className="bg-slate-50 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-block mb-2">
                  Roadmap 2030
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Our Vision & Mission
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Explore our 5 core pillars of quality metallurgy, closed-loop eco recycling, and goal to power 5M+ active Indian vehicles.
                </p>
              </div>
              <Link 
                href="/vision"
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1.5 pt-4 border-t border-slate-200/60"
              >
                Explore Roadmap <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 4: Battery Insights & Blogs */}
            <div className="bg-slate-50 border border-slate-200 hover:border-[#00843D] rounded-3xl p-6 transition-all group hover:-translate-y-1.5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:bg-white">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <div className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full inline-block mb-2">
                  Knowledge Hub
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#00843D] transition-colors">
                  Battery Care & Blogs
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Expert advice on inverter battery selection, cold-cranking diagnostics, and summer maintenance to double battery life.
                </p>
              </div>
              <Link 
                href="/blogs"
                className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1.5 pt-4 border-t border-slate-200/60"
              >
                Read Expert Guides <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 9. TRUST COUNTERS & FINAL CTA */}
      <section className="py-20 bg-slate-50 border-t border-slate-200 text-center">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">500+</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Authorized Retailers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#00843D] mb-1">99.8%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">First Start Reliability</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mb-1">{warrantyStats.maxWarrantyShort}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Max Warranty Available</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">100%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Made in India</div>
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 mb-6 uppercase">
            EXPERIENCE THE POWER OF GOODWIN
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto mb-8">
            Find the perfect battery for your two-wheeler, home inverter, UPS backup, VRLA equipment, or agricultural sprayer today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/battery-finder" 
              className="bg-[#00843D] hover:bg-[#006830] text-white px-9 py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-700/20"
            >
              Match Your Vehicle Now
            </Link>
            <Link 
              href="/dealers" 
              className="bg-white hover:bg-slate-50 text-slate-800 px-9 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-300 shadow-xs"
            >
              Locate Local Store
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
