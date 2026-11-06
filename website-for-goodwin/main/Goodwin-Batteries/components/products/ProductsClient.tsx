"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import {
  Filter,
  Search,
  RotateCcw,
  ArrowUpDown,
  Truck,
  ShieldCheck,
  Tag,
  Zap,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Product, Category } from "@/types";
import { getProductPricing } from "@/lib/pricing";
import {
  resolveCategory,
  isUpcomingOnlyCategory,
  productMatchesCategory,
  getProductWarrantyInfo,
  getCategorySpecSummary,
} from "@/lib/product-specs";

export default function ProductsClient({
  initialProducts,
  categories,
  initialCategory,
}: {
  initialProducts: Product[];
  categories: Category[];
  initialCategory?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (isUpcomingOnlyCategory(initialCategory)) {
      router.replace("/upcoming-products");
    }
  }, [initialCategory, router]);

  const defaultCategory = useMemo(() => {
    if (!initialCategory || initialCategory === "All") return "All";
    const match = resolveCategory(initialCategory, categories);
    return match ? match.id : "All";
  }, [initialCategory, categories]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [selectedWarranty, setSelectedWarranty] = useState<string>("All");
  const [selectedVoltage, setSelectedVoltage] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Keep selectedCategory in sync when user clicks Navbar/Footer category links while on /products
  useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === "All") return null;
    return resolveCategory(selectedCategory, categories);
  }, [selectedCategory, categories]);

  const activeCategorySummary = useMemo(() => {
    if (!activeCategoryObj) return null;
    return getCategorySpecSummary(activeCategoryObj.id, initialProducts, categories);
  }, [activeCategoryObj, initialProducts, categories]);

  const activeCategories = useMemo(
    () => categories.filter((c) => (c.status || "active") === "active"),
    [categories]
  );

  const upcomingCategories = useMemo(
    () => categories.filter((c) => c.status === "upcoming"),
    [categories]
  );

  const warrantyOptions = useMemo(() => {
    const options = new Set(
      initialProducts.map((p) => getProductWarrantyInfo(p).displayLabel).filter(Boolean)
    );
    return Array.from(options).sort((a, b) => {
      const mA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const mB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return mA - mB;
    });
  }, [initialProducts]);

  const voltageOptions = useMemo(() => {
    const options = new Set(initialProducts.map((p) => p.voltage).filter(Boolean));
    return Array.from(options).sort();
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = initialProducts.filter((product) => {
      const pricing = getProductPricing(product);
      const warrantyInfo = getProductWarrantyInfo(product);

      // Search matching
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.series && product.series.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query)) ||
        (product.ah && product.ah.toLowerCase().includes(query)) ||
        (Array.isArray(product.application) &&
          product.application.some((app) => app.toLowerCase().includes(query)));

      // Multi-category & alias matching
      const matchesCategory =
        selectedCategory === "All" ||
        productMatchesCategory(product, selectedCategory, categories);

      const matchesWarranty =
        selectedWarranty === "All" ||
        warrantyInfo.displayLabel === selectedWarranty ||
        product.warranty === selectedWarranty;

      const matchesVoltage =
        selectedVoltage === "All" || product.voltage === selectedVoltage;

      // Price range
      let matchesPrice = true;
      if (priceRange === "under-1000") {
        matchesPrice = pricing.price < 1000;
      } else if (priceRange === "1000-2000") {
        matchesPrice = pricing.price >= 1000 && pricing.price <= 2000;
      } else if (priceRange === "2000-5000") {
        matchesPrice = pricing.price > 2000 && pricing.price <= 5000;
      } else if (priceRange === "above-5000") {
        matchesPrice = pricing.price > 5000;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarranty &&
        matchesVoltage &&
        matchesPrice
      );
    });

    // Sorting
    return filtered.sort((a, b) => {
      const pricingA = getProductPricing(a);
      const pricingB = getProductPricing(b);

      if (sortBy === "price-asc") {
        return pricingA.price - pricingB.price;
      }
      if (sortBy === "price-desc") {
        return pricingB.price - pricingA.price;
      }
      if (sortBy === "capacity-desc") {
        const ahA = parseFloat((a.ah || "").replace(/[^\d.]/g, "")) || 0;
        const ahB = parseFloat((b.ah || "").replace(/[^\d.]/g, "")) || 0;
        return ahB - ahA;
      }
      if (sortBy === "warranty-desc") {
        const wA = getProductWarrantyInfo(a).totalMonths;
        const wB = getProductWarrantyInfo(b).totalMonths;
        return wB - wA;
      }

      // Default: featured / category
      if (a.category !== b.category) {
        return (a.category || "").localeCompare(b.category || "");
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [
    initialProducts,
    categories,
    searchQuery,
    selectedCategory,
    selectedWarranty,
    selectedVoltage,
    priceRange,
    sortBy,
  ]);

  // High-capacity alternatives for visitors landing on Commercial Heavy Duty
  const commercialAlternativeProducts = useMemo(() => {
    if (activeCategoryObj?.id === "cat-commercial") {
      return initialProducts.filter((p) =>
        productMatchesCategory(p, "cat-inverter", categories)
      );
    }
    return [];
  }, [activeCategoryObj, initialProducts, categories]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedWarranty("All");
    setSelectedVoltage("All");
    setPriceRange("All");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedWarranty !== "All" ||
    selectedVoltage !== "All" ||
    priceRange !== "All" ||
    searchQuery !== "";

  return (
    <div className="flex flex-col gap-8 text-slate-900">
      {/* E-Commerce Value Props Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00843D] text-white flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-slate-900 block">
              Doorstep Battery Delivery
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Safe dispatch (Fitment by customer)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Tag size={18} />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-slate-900 block">
              Factory Direct Pricing
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Best online discounts & GST bill
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-slate-900 block">
              Verified Warranty Database
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              6M to 72M digital e-warranty
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-slate-900 block">
              100% Secure Checkout
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              UPI, Cards & Instant Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Category Landing Header when a Category is Selected */}
      {activeCategoryObj && activeCategorySummary && (
        <div
          className={`rounded-3xl border p-6 sm:p-8 shadow-sm transition-all ${
            activeCategoryObj.status === "upcoming"
              ? "bg-gradient-to-br from-amber-50/80 via-white to-slate-50 border-amber-300"
              : "bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border-emerald-200"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    activeCategoryObj.status === "upcoming"
                      ? "bg-amber-400 text-slate-950"
                      : "bg-[#00843D] text-white"
                  }`}
                >
                  {activeCategoryObj.status === "upcoming" ? (
                    <Clock size={12} />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}
                  {activeCategoryObj.statusLabel ||
                    (activeCategoryObj.status === "upcoming"
                      ? "Upcoming / B2B Enquiry"
                      : `${activeCategorySummary.productCount} Active Models In Stock`)}
                </span>

                {activeCategoryObj.capacityRange && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white border border-slate-200 text-slate-700">
                    Capacity: <strong>{activeCategoryObj.capacityRange}</strong>
                  </span>
                )}

                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white border border-emerald-200 text-[#00843D]">
                  Verified Warranty:{" "}
                  <strong>{activeCategorySummary.warrantyRangeLabel}</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase tracking-tight mb-2">
                {activeCategoryObj.name} Batteries
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {activeCategoryObj.longDescription || activeCategoryObj.description}
              </p>

              {activeCategoryObj.highlights && activeCategoryObj.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activeCategoryObj.highlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-white/90 border border-slate-200/80 p-2.5 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-[#00843D] shrink-0 mt-0.5"
                      />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeCategoryObj.upcomingNote && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{activeCategoryObj.upcomingNote}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <Link
                href={`/products/category/${activeCategoryObj.slug}`}
                className="bg-[#00843D] hover:bg-[#006830] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Category Guide & Specs</span>
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => setSelectedCategory("All")}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                View All 30 Batteries
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="static lg:sticky lg:top-28 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-[#00843D]" />
                <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider">
                  Catalogue Filters
                </h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Keyword Search
                </label>
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="e.g. TZ4LB, 150Ah, Agro 14Ah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00843D] focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Active Sellable Categories */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-2.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Active Categories</span>
                  <span className="text-[10px] text-[#00843D] font-black">In Stock</span>
                </h4>
                <ul className="flex flex-col gap-1">
                  <li>
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`text-xs transition-colors text-left w-full px-3 py-2 rounded-lg font-semibold flex items-center justify-between ${
                        selectedCategory === "All"
                          ? "bg-[#00843D] text-white shadow-md font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>All Active Batteries</span>
                      <span className="text-[10px] opacity-80">
                        ({initialProducts.length})
                      </span>
                    </button>
                  </li>
                  {activeCategories.map((cat) => {
                    const count = initialProducts.filter((p) =>
                      productMatchesCategory(p, cat.id, categories)
                    ).length;
                    return (
                      <li key={cat.id}>
                        <button
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`text-xs transition-colors text-left w-full px-3 py-2 rounded-lg font-semibold flex items-center justify-between ${
                            selectedCategory === cat.id
                              ? "bg-[#00843D] text-white shadow-md font-bold"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] opacity-80 font-bold">
                            ({count})
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Upcoming Pipeline Link */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/upcoming-products"
                  className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/70 transition-colors"
                >
                  <span>Upcoming R&amp;D Pipeline</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Price Filter Chips */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-2.5 uppercase tracking-wider">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "All", label: "All Prices" },
                    { id: "under-1000", label: "Under ₹1,000" },
                    { id: "1000-2000", label: "₹1,000 - ₹2,000" },
                    { id: "2000-5000", label: "₹2,000 - ₹5,000" },
                    { id: "above-5000", label: "₹5,000+" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setPriceRange(chip.id)}
                      className={`text-xs px-2.5 py-2 rounded-lg font-bold text-left transition-all border ${
                        priceRange === chip.id
                          ? "bg-[#00843D] text-white border-[#00843D] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voltage */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-2.5 uppercase tracking-wider">
                  Voltage
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedVoltage("All")}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                      selectedVoltage === "All"
                        ? "bg-[#00843D] text-white border-[#00843D] shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {voltageOptions.map((volt) => (
                    <button
                      key={volt}
                      onClick={() => setSelectedVoltage(volt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        selectedVoltage === volt
                          ? "bg-[#00843D] text-white border-[#00843D] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {volt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warranty */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-2.5 uppercase tracking-wider">
                  Verified Warranty
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedWarranty("All")}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                      selectedWarranty === "All"
                        ? "bg-[#00843D] text-white border-[#00843D] shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {warrantyOptions.map((warr) => (
                    <button
                      key={warr}
                      onClick={() => setSelectedWarranty(warr)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        selectedWarranty === warr
                          ? "bg-[#00843D] text-white border-[#00843D] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {warr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid & Top Sort Bar */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
              {activeCategoryObj?.status === "upcoming" ? (
                <span>
                  Category Status:{" "}
                  <strong className="text-amber-700 font-black">
                    {activeCategoryObj.statusLabel}
                  </strong>
                </span>
              ) : (
                <>
                  Showing{" "}
                  <strong className="text-slate-900 font-black">
                    {filteredProducts.length}
                  </strong>{" "}
                  {activeCategoryObj ? `${activeCategoryObj.name} ` : ""}Batteries
                </>
              )}
            </p>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown size={13} /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-xs text-slate-800 font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#00843D] shadow-xs"
              >
                <option value="featured">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="capacity-desc">Capacity (Ah): High to Low</option>
                <option value="warranty-desc">Warranty: Longest First</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : activeCategoryObj?.status === "upcoming" ? (
            /* Rich Landing View for Upcoming / B2B Categories (Automotive & Commercial) */
            <div className="space-y-8">
              <div className="bg-white border-2 border-amber-300 rounded-3xl p-8 sm:p-10 shadow-md">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-4">
                  <Sparkles size={14} /> Upcoming Product Line & B2B Fleet Allocation
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mb-3 uppercase">
                  {activeCategoryObj.name} — Direct Fleet & Dealer Allocation
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
                  {activeCategoryObj.upcomingNote || activeCategoryObj.longDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <Link
                    href="/upcoming-products"
                    className="bg-[#00843D] hover:bg-[#006830] text-white px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md"
                  >
                    <Zap size={15} /> View R&D Pipeline Specs
                  </Link>
                  <a
                    href="tel:9667724411"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Phone size={15} /> Call Fleet Desk: 96677 24411
                  </a>
                  <Link
                    href="/dealer-distributor"
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
                  >
                    Request Bulk / Dealer Quote
                  </Link>
                </div>

                {/* Show Active Category Quick Switchers */}
                <div className="pt-6 border-t border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-3">
                    Browse Active, Immediately Sellable Categories:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCategories.map((cat) => {
                      const count = initialProducts.filter((p) =>
                        productMatchesCategory(p, cat.id, categories)
                      ).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-[#00843D] text-[#00843D] hover:text-white border border-emerald-200 text-xs font-bold transition-colors"
                        >
                          {cat.name} ({count} In Stock)
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* If Commercial Heavy Duty is selected, show in-stock 150Ah-250Ah Tall Tubular batteries */}
              {commercialAlternativeProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-[#00843D] block">
                        In Stock Today • High-Capacity 150Ah – 250Ah
                      </span>
                      <h4 className="text-xl font-heading font-black text-slate-900 uppercase">
                        Available Heavy-Duty Stationary & Inverter Batteries (Up to 72M Warranty)
                      </h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {commercialAlternativeProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No matching batteries found
              </h3>
              <p className="text-slate-600 text-sm max-w-sm mb-6">
                Try adjusting your search criteria, price range, or category filter to view other models.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-emerald-700/20"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
