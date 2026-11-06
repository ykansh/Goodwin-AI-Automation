"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Camera, Eye, X, ChevronRight, Play, 
  Sparkles, ShieldCheck, Factory, Cpu, Truck, Users, Award 
} from "lucide-react";

export interface GalleryItem {
  id: string;
  title: string;
  category: "Manufacturing Plant" | "Quality & R&D Labs" | "Field Deployments" | "Dealer Conclaves";
  image: string;
  caption: string;
  specs?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "mfg-1",
    title: "High-Pressure Die-Casting Grid Spine Facility",
    category: "Manufacturing Plant",
    image: "/assets/products/Gold Series.png",
    caption: "State-of-the-art gravity & high-pressure die-casting machines producing dense calcium-tin spine grids with zero internal porosity.",
    specs: "99.99% Refined Virgin Lead • Zero Void Metallurgy"
  },
  {
    id: "mfg-2",
    title: "Automated Continuous Plate Pasting & Hydro-Set Curing",
    category: "Manufacturing Plant",
    image: "/assets/products/goodwin-lithium-ups-12v-8ah.png",
    caption: "Computer-controlled positive and negative paste application with automated density profiling and 72-hour moisture-controlled curing chambers.",
    specs: "±0.5g Weight Consistency • Micro-porous Crystallization"
  },
  {
    id: "mfg-3",
    title: "Automated Acid Filling & Chilled Formation Tanks",
    category: "Manufacturing Plant",
    image: "/assets/products/Inverter Batteries.png",
    caption: "Precision chilled formation tanks with recirculated demineralized acid cooling to prevent thermal plate degradation during initial charging.",
    specs: "Multi-Stage Formation • Internal Acid Circulation"
  },
  {
    id: "mfg-4",
    title: "Hermetic Ultrasonic Heat Sealing & Leak Testing",
    category: "Manufacturing Plant",
    image: "/assets/products/goodwin-12vgw-xl5lb-side.png",
    caption: "Robotic hot-plate container-to-cover heat sealing with 100% automated pressurized helium gas leak detection on every single battery.",
    specs: "100% Leak Tested • Explosion-Proof Safety Vents"
  },
  {
    id: "lab-1",
    title: "30G Tri-Axial Mechanical Vibration Test Dyno",
    category: "Quality & R&D Labs",
    image: "/assets/categories/commercial-heavy-duty.jpg",
    caption: "Simulating thousands of kilometers of punishing Indian highway potholes and rural corrugated roads to verify anchor-bonding integrity.",
    specs: "ISO 30G Shock Standard • Zero Active Mass Shedding"
  },
  {
    id: "lab-2",
    title: "Optical Emission Spectrometer (OES) Lead Analysis",
    category: "Quality & R&D Labs",
    image: "/assets/categories/industrial.jpg",
    caption: "Incoming raw lead ingots are analyzed down to parts-per-million (PPM) to guarantee strict zero-antimony tolerance on maintenance-free lines.",
    specs: "99.99% Lead Purity Benchmark • Strict Trace Metallurgy"
  },
  {
    id: "lab-3",
    title: "High-Rate Cold Cranking Current (CCA) Laboratory",
    category: "Quality & R&D Labs",
    image: "/assets/products/goodwin-12vgw-tz4lb.png",
    caption: "Testing instantaneous cold-discharge performance at -18°C and +55°C to guarantee reliable first-crank engine starting.",
    specs: "SAE / DIN / JIS Standards • High Peak Surge Verification"
  },
  {
    id: "fleet-1",
    title: "Interstate Commercial Heavy Haulage Fleet",
    category: "Field Deployments",
    image: "/assets/categories/commercial-heavy-duty.jpg",
    caption: "Goodwin Haulage batteries powering 16-wheel tractor-trailers across 2,000+ km non-stop logistics routes with heavy auxiliary loads.",
    specs: "150Ah - 180Ah Heavy Duty • High Reserve Capacity"
  },
  {
    id: "fleet-2",
    title: "Agricultural Tractor & Harvester Field Operations",
    category: "Field Deployments",
    image: "/assets/categories/agricultural-tractors.jpg",
    caption: "Reliable cold starts during harvest season under intense dust, crop straw, and non-stop agricultural cycles.",
    specs: "Anchor-Bonded Plates • Anti-Corrosion Terminals"
  },
  {
    id: "fleet-3",
    title: "High-Altitude Two-Wheeler Himalayan Excursions",
    category: "Field Deployments",
    image: "/assets/categories/two-wheelers.jpg",
    caption: "Goodwin Rider VRLA AGM batteries delivering instant spark on high-altitude mountain passes at sub-zero temperatures.",
    specs: "Spill-Proof VRLA AGM • Zero Acid Leakage"
  },
  {
    id: "fleet-4",
    title: "Passenger Cars & Urban Commuters in Traffic",
    category: "Field Deployments",
    image: "/assets/categories/passenger-vehicles.jpg",
    caption: "Enduring bumper-to-bumper city traffic with continuous AC, audio, infotainment, and stop-start electrical loads.",
    specs: "Ultra Low Internal Resistance • Fast Recharge Acceptance"
  },
  {
    id: "event-1",
    title: "National Automotive Battery Expo & Innovation Stall",
    category: "Dealer Conclaves",
    image: "/assets/about/about-network.jpg",
    caption: "Showcasing Goodwin's latest heavy tubular inverter batteries and next-gen lithium prototypes to trade partners.",
    specs: "500+ Dealer Registrations • New Product Unveilings"
  },
  {
    id: "event-2",
    title: "Annual Channel Partner Felicitation & Awards Conclave",
    category: "Dealer Conclaves",
    image: "/assets/about/about-hero.jpg",
    caption: "Celebrating our top-performing distributors and retailers across 12 states with performance recognitions and exclusive benefits.",
    specs: "Pan-India Distributor Network • Zero Paperwork Warranty"
  }
];

const CATEGORIES = [
  "All",
  "Manufacturing Plant",
  "Quality & R&D Labs",
  "Field Deployments",
  "Dealer Conclaves"
] as const;

export default function GalleryClient() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeCategory === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="w-full">
      {/* 1. Hero Header */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 md:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 mb-6 shadow-sm">
            <Camera size={14} className="text-[#00843D]" />
            <span className="text-[#00843D] text-xs font-black tracking-widest uppercase">
              Official Media & Manufacturing Showcase
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">
            GOODWIN <span className="text-[#00843D]">IN ACTION</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Step behind the scenes into our precision manufacturing plant, quality testing laboratories, and real-world automotive deployments across India. Experience the engineering excellence that powers every Goodwin battery.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-[#00843D]">50,000+</div>
              <div className="text-xs text-slate-500 font-medium">Sq. Ft. Plant Footprint</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-amber-600">30G</div>
              <div className="text-xs text-slate-500 font-medium">Shock & Vibration Testing</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-slate-900">99.8%</div>
              <div className="text-xs text-slate-500 font-medium">First Start Reliability</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-blue-600">100%</div>
              <div className="text-xs text-slate-500 font-medium">Closed-Loop Eco Recycling</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Navigation Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-xs">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#00843D] text-white shadow-md shadow-emerald-700/20 scale-102"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Media Grid */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#00843D] transition-all flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-64 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-4">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-[#00843D] border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-xs">
                  {item.category}
                </div>

                {/* Hover Overlay Icon */}
                <div className="absolute inset-0 bg-[#00843D]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-[#00843D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Eye size={20} />
                  </div>
                </div>
              </div>

              {/* Text Description */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-[#00843D] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {item.caption}
                  </p>
                </div>

                {item.specs && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-[#00843D] bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                      {item.specs}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Factory Video Tour Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#00843D] mb-2">
              <Play size={14} className="fill-current" /> Video Walkthrough
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 uppercase">
              INSIDE GOODWIN BATTERIES
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Watch our precision engineering, high-cranking assembly lines, and battery testing standards.
            </p>
          </div>

          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
            <iframe 
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/1V8bok8jTW4?si=_CsXpuKTjEQSErLT&rel=0" 
              title="Goodwin Batteries Manufacturing Tour" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 5. Lightbox Modal */}
      {activeLightboxItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveLightboxItem(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveLightboxItem(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Media Area */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-50 flex items-center justify-center p-6 border-b border-slate-200">
              <Image 
                src={activeLightboxItem.image} 
                alt={activeLightboxItem.title} 
                fill 
                className="object-contain p-6" 
              />
              <div className="absolute top-4 left-4 bg-[#00843D] text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md">
                {activeLightboxItem.category}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 mb-3">
                {activeLightboxItem.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {activeLightboxItem.caption}
              </p>
              {activeLightboxItem.specs && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#00843D]">
                  Engineering Specification: {activeLightboxItem.specs}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Plant Visit / Dealership Callout */}
      <section className="py-16 bg-white border-t border-slate-200 text-center">
        <div className="container max-w-3xl">
          <Award size={36} className="text-[#00843D] mx-auto mb-3" />
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase mb-3">
            INTERESTED IN VISITING OUR FACILITY?
          </h3>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mb-6">
            We welcome authorized distributors, institutional fleet managers, and dealers to inspect our automated lines and quality certification setups.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dealer-distributor"
              className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Partner as a Dealer
            </Link>
            <Link 
              href="/contact"
              className="bg-white hover:bg-slate-100 text-slate-800 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-300 shadow-xs"
            >
              Contact Corporate Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
