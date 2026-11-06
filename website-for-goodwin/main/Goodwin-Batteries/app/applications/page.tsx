import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { getCategorySpecSummary } from "@/lib/product-specs";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Battery Applications — Two-Wheeler, Home Inverter & Solar, VRLA UPS, Agriculture & Lithium | Goodwin Batteries",
  description:
    "Explore Goodwin Batteries by application: Two-Wheeler motorcycles & scooters (48M warranty), Home Inverter & Solar Tall Tubular (up to 72M warranty), VRLA/SMF UPS standby, Agricultural Sprayers, and LiFePO4 Lithium.",
  alternates: {
    canonical: "/applications",
  },
};

export default async function ApplicationsPage() {
  const categories = await getCategories();
  const products = await getProducts();
  const publishedProducts = products.filter((p) => p.is_published !== false);

  const activeCategories = categories.filter(
    (c) => (c.status || "active") === "active"
  );
  const upcomingCategories = categories.filter((c) => c.status === "upcoming");

  return (
    <div className="flex flex-col w-full min-h-screen pt-20 bg-white text-slate-900">
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 md:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 mb-5 shadow-xs">
            <Zap size={14} className="text-[#00843D]" />
            <span className="text-[#00843D] text-xs font-black tracking-widest uppercase">
              Verified Application Directory
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">
            BATTERY <span className="text-[#00843D]">APPLICATIONS</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Explore Goodwin&apos;s active, ready-to-ship battery lines across
            two-wheelers, home inverters, industrial VRLA, agricultural
            sprayers, and lithium-ion packs.
          </p>
        </div>
      </section>

      {/* Active Sellable Applications */}
      <section className="py-16 md:py-20 bg-white flex-1">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#00843D] block mb-1">
                Active Catalogue • Immediate Online Dispatch
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-slate-900 uppercase">
                Active Battery Categories ({activeCategories.length})
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#00843D] hover:underline flex items-center gap-1.5 uppercase tracking-wider"
            >
              Browse All {publishedProducts.length} Active Products{" "}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeCategories.map((cat) => {
              const summary = getCategorySpecSummary(
                cat.id,
                publishedProducts,
                categories
              );
              return (
                <div
                  key={cat.id}
                  className="group rounded-3xl overflow-hidden bg-white border border-slate-200 hover:border-[#00843D] shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="relative h-56 bg-slate-50 border-b border-slate-100 overflow-hidden">
                    {cat.image && (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#00843D] text-white shadow-sm">
                        <CheckCircle2 size={12} /> {summary.productCount} Models
                        Listed
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-900 shadow-sm">
                        <ShieldCheck size={12} className="text-[#00843D]" />{" "}
                        {summary.warrantyRangeLabel}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                        {cat.capacityRange}
                      </div>
                      <h3 className="text-white font-heading font-black text-2xl">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                        {cat.description}
                      </p>

                      {cat.highlights && cat.highlights.length > 0 && (
                        <ul className="space-y-1.5 mb-5 text-xs text-slate-700 font-medium">
                          {cat.highlights.slice(0, 2).map((hl, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2
                                size={13}
                                className="text-[#00843D] shrink-0 mt-0.5"
                              />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="flex-1 bg-[#00843D] hover:bg-[#006830] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors"
                      >
                        Shop {summary.productCount} Batteries
                      </Link>
                      <Link
                        href={`/products/category/${cat.slug}`}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-[#00843D] text-slate-700 hover:text-[#00843D] text-xs font-bold transition-colors"
                      >
                        Landing Page &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Innovations Callout */}
      <section className="py-12 bg-slate-50 border-t border-slate-200 text-center">
        <div className="container max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#00843D] text-[11px] font-black uppercase tracking-wider mb-3">
            <Sparkles size={12} /> R&amp;D Pipeline
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 uppercase mb-2">
            Looking for Our Upcoming Battery Lines?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-5">
            Preview upcoming additions in development on our dedicated R&amp;D Pipeline page.
          </p>
          <Link
            href="/upcoming-products"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            View Upcoming Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
