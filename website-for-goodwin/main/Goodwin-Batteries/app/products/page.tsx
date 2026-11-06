import { getProducts, getCategories } from "@/lib/data";
import { getCatalogWarrantyStats } from "@/lib/product-specs";
import ProductsClient from "@/components/products/ProductsClient";
import { Zap, ShieldCheck, BatteryCharging } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const products = await getProducts();
  const categories = await getCategories();
  
  // Filter out unpublished products just in case
  const publishedProducts = products.filter(p => p.is_published !== false);
  const warrantyStats = getCatalogWarrantyStats(publishedProducts);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-slate-900">
      {/* Automotive Tech Header (Amaron & Exide Care Benchmark) */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 md:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00843D] animate-ping" />
            <span className="text-[#00843D] text-xs font-black tracking-widest uppercase">
              Official Product Catalogue
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">
            GOODWIN <span className="text-[#00843D]">BATTERY CATALOGUE</span>
          </h1>
          
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Engineered for high cranking amps, extreme shock resistance, and zero maintenance. Filter by vehicle application, voltage, and warranty terms.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Zap size={14} className="text-amber-500" />
              <span>100% Maintenance-Free VRLA</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <ShieldCheck size={14} className="text-[#00843D]" />
              <span>Up to {warrantyStats.maxWarrantyLabel} Warranty</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <BatteryCharging size={14} className="text-blue-600" />
              <span>OEM Direct Fitment Standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-white flex-1">
        {/* Next-Gen Innovation Teaser Banner */}
        <div className="container mb-10">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-amber-50/50 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00843D] text-white flex items-center justify-center shrink-0 shadow-md">
                <Zap size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#00843D]">R&D Pipeline</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-900">Arriving Soon</span>
                </div>
                <h3 className="text-base sm:text-lg font-heading font-black text-slate-900 mt-0.5">
                  Explore Upcoming Lines: Heavy E-Rickshaw, Solar Tall Tubular & Smart LFP
                </h3>
              </div>
            </div>
            <a
              href="/upcoming-products"
              className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 transition-all shadow-md flex items-center gap-1.5"
            >
              Preview Pipeline &rarr;
            </a>
          </div>
        </div>

        <div className="container">
          <ProductsClient
            initialProducts={publishedProducts}
            categories={categories}
            initialCategory={resolvedParams.category}
          />
        </div>
      </section>
    </div>
  );
}
