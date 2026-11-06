import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  Info,
  BatteryCharging,
} from "lucide-react";
import { getProducts, getCategories } from "@/lib/data";
import {
  resolveCategory,
  isUpcomingOnlyCategory,
  getCategorySpecSummary,
  getProductWarrantyInfo,
} from "@/lib/product-specs";
import { getProductPricing, formatINR } from "@/lib/pricing";
import ProductCard from "@/components/products/ProductCard";

export async function generateStaticParams() {
  const categories = await getCategories();
  const slugs = new Set<string>();
  categories.forEach((cat) => {
    slugs.add(cat.slug);
    if (cat.aliases) {
      cat.aliases.forEach((alias) => slugs.add(alias));
    }
  });
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const products = await getProducts();
  const category = resolveCategory(slug, categories);

  if (!category) {
    return { title: "Battery Category | Goodwin Batteries" };
  }

  const summary = getCategorySpecSummary(category.id, products, categories);

  return {
    title: `${category.name} Batteries (${summary.capacityRangeLabel}) — ${summary.warrantyRangeLabel} Warranty | Goodwin Batteries`,
    description: category.longDescription || category.description,
  };
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isUpcomingOnlyCategory(slug)) {
    redirect("/upcoming-products");
  }

  const categories = await getCategories();
  const products = await getProducts();
  const publishedProducts = products.filter((p) => p.is_published !== false);

  const category = resolveCategory(slug, categories);
  if (!category) {
    notFound();
  }

  const summary = getCategorySpecSummary(
    category.id,
    publishedProducts,
    categories
  );
  const isUpcoming = category.status === "upcoming";

  const activeCategories = categories.filter(
    (c) => (c.status || "active") === "active"
  );

  // High-capacity alternatives if visitor lands on Commercial Heavy Duty
  const commercialAlternatives =
    category.id === "cat-commercial"
      ? getCategorySpecSummary("cat-inverter", publishedProducts, categories)
          .products
      : [];

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-slate-900 pt-20">
      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 py-4">
        <div className="container flex flex-wrap items-center text-xs font-bold uppercase tracking-wider text-slate-500">
          <Link href="/" className="hover:text-[#00843D] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="mx-2 text-slate-400" />
          <Link
            href="/products"
            className="hover:text-[#00843D] transition-colors"
          >
            Catalogue
          </Link>
          <ChevronRight size={14} className="mx-2 text-slate-400" />
          <span className="text-[#00843D] font-black">{category.name}</span>
        </div>
      </div>

      {/* Category Hero Section */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 relative overflow-hidden">
        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                  isUpcoming
                    ? "bg-amber-400 text-slate-950"
                    : "bg-[#00843D] text-white"
                }`}
              >
                {isUpcoming ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                {category.statusLabel ||
                  (isUpcoming
                    ? "Upcoming / B2B Enquiry"
                    : `${summary.productCount} Active Models In Stock`)}
              </span>

              {category.capacityRange && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Capacity: <strong>{category.capacityRange}</strong>
                </span>
              )}

              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-[#00843D] shadow-2xs flex items-center gap-1">
                <ShieldCheck size={14} />
                Warranty: <strong>{summary.warrantyRangeLabel}</strong>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 uppercase tracking-tight mb-5">
              GOODWIN <span className="text-[#00843D]">{category.name}</span>{" "}
              BATTERIES
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
              {category.longDescription || category.description}
            </p>

            {category.highlights && category.highlights.length > 0 && (
              <div className="space-y-2.5 mb-8">
                {category.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-[#00843D] shrink-0 mt-0.5"
                    />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!isUpcoming ? (
                <a
                  href="#category-products"
                  className="bg-[#00843D] hover:bg-[#006830] text-white px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <Zap size={16} /> Browse {summary.productCount} Available
                  Models
                </a>
              ) : (
                <Link
                  href="/upcoming-products"
                  className="bg-[#00843D] hover:bg-[#006830] text-white px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <Sparkles size={16} /> Preview R&D Pipeline
                </Link>
              )}

              <Link
                href="/battery-finder"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <BatteryCharging size={16} className="text-[#00843D]" /> Vehicle
                Fitment Finder
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl p-6 flex items-center justify-center">
              <Image
                src={category.image || "/assets/logo/Goodwin.png"}
                alt={category.name}
                fill
                className="object-contain p-4"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming / Partial Note Callout */}
      {category.upcomingNote && (
        <section className="pt-8 bg-white">
          <div className="container">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black uppercase tracking-wider block mb-0.5">
                  Application Availability Note
                </strong>
                <span>{category.upcomingNote}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Products / Upcoming Content */}
      <section id="category-products" className="py-12 md:py-16 bg-white flex-1">
        <div className="container">
          {summary.products.length > 0 ? (
            <div className="space-y-14">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#00843D] block mb-1">
                      Verified In-Stock Lineup
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase">
                      {category.name} Models ({summary.productCount})
                    </h2>
                  </div>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-xs font-bold text-[#00843D] hover:underline flex items-center gap-1"
                  >
                    Open in Interactive Filter Catalogue{" "}
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {summary.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>

              {/* Verified Specification & Warranty Matrix Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-[#00843D] block mb-1">
                    Single Source of Truth
                  </span>
                  <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 uppercase">
                    Verified {category.name} Specification & Warranty Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Official factory-verified capacities, dimensions, and
                    replacement warranty terms.
                  </p>
                </div>

                <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                        <th className="p-3.5">Model</th>
                        <th className="p-3.5">Series / Tech</th>
                        <th className="p-3.5">Voltage & Capacity</th>
                        <th className="p-3.5">Verified Warranty Breakdown</th>
                        <th className="p-3.5">Dimensions</th>
                        <th className="p-3.5">Online Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.products.map((p) => {
                        const w = getProductWarrantyInfo(p);
                        const pr = getProductPricing(p);
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-emerald-50/40 transition-colors"
                          >
                            <td className="p-3.5 font-bold text-slate-900">
                              <Link
                                href={`/products/${p.slug}`}
                                className="hover:text-[#00843D] hover:underline"
                              >
                                {p.name}
                              </Link>
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {p.series} • {p.technology}
                            </td>
                            <td className="p-3.5 font-bold text-slate-800">
                              {p.voltage} / {p.ah}
                            </td>
                            <td className="p-3.5 font-bold text-[#00843D]">
                              {w.breakdownLabel}
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {p.dimensions} ({p.weight})
                            </td>
                            <td className="p-3.5 font-black text-slate-900">
                              {formatINR(pr.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Dedicated Upcoming / B2B Category Landing Experience */
            <div className="space-y-12">
              <div className="bg-slate-50 border-2 border-amber-300 rounded-3xl p-8 sm:p-10 shadow-sm">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-4">
                  <Sparkles size={14} /> Upcoming Retail Launch & Active B2B
                  Fleet Desk
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase mb-3">
                  {category.name} — Direct Fleet & Distributor Enquiry
                </h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-6">
                  We do not display out-of-stock placeholder items on our store.{" "}
                  {category.longDescription}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/upcoming-products"
                    className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
                  >
                    <Zap size={15} /> View R&D Pipeline & Pre-Book
                  </Link>
                  <a
                    href="tel:9667724411"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <Phone size={15} /> Call Regional Fleet Desk: 96677 24411
                  </a>
                  <Link
                    href="/dealer-distributor"
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider"
                  >
                    Dealer / Bulk Allocation Enquiry
                  </Link>
                </div>
              </div>

              {commercialAlternatives.length > 0 && (
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-[#00843D] block mb-1">
                      Immediate High-Capacity Dispatch (150Ah – 250Ah)
                    </span>
                    <h3 className="text-2xl font-heading font-black text-slate-900 uppercase">
                      In-Stock Heavy-Duty Tall Tubular Batteries (72 Months
                      Warranty)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Looking for 150Ah, 200Ah, or 250Ah deep-cycle commercial
                      power backup today? Order our in-stock Tall Tubular models
                      below:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commercialAlternatives.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other Active Categories Cross-Links */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h3 className="text-lg font-heading font-black text-slate-900 uppercase mb-4">
              Explore All Active Battery Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {activeCategories.map((cat) => {
                const catSummary = getCategorySpecSummary(
                  cat.id,
                  publishedProducts,
                  categories
                );
                return (
                  <Link
                    key={cat.id}
                    href={`/products/category/${cat.slug}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      cat.id === category.id
                        ? "bg-emerald-50 border-[#00843D] shadow-xs"
                        : "bg-slate-50 hover:bg-white border-slate-200 hover:border-[#00843D]"
                    }`}
                  >
                    <span className="text-xs font-black text-slate-900 mb-1">
                      {cat.name}
                    </span>
                    <span className="text-[11px] font-bold text-[#00843D]">
                      {catSummary.productCount} Models •{" "}
                      {catSummary.warrantyRangeLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

