import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Download, CheckCircle2, Wrench, FileText, Phone, Zap, Search, Sparkles } from "lucide-react";
import { getProductBySlug, getProducts, getCategories } from "@/lib/data";
import { getProductWarrantyInfo } from "@/lib/product-specs";
import { getProductPricing } from "@/lib/pricing";
import ProductGallery from "@/components/ProductGallery";
import ProductBuyWidget from "@/components/products/ProductBuyWidget";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Battery Product Not Found | Goodwin Batteries",
      description: "Explore BIS-certified Goodwin batteries across Two-Wheeler, Inverter Tubular, VRLA/SMF, Agricultural Sprayer, and Lithium categories.",
    };
  }

  const categories = await getCategories();
  const category = categories.find((c) => c.id === product.category);
  const warrantyInfo = getProductWarrantyInfo(product);

  const isAgroProduct =
    product.category === "cat-agriculture" ||
    product.secondaryCategories?.includes("cat-agriculture") ||
    product.slug.includes("agro");

  const categoryLabel =
    product.category === "cat-inverter"
      ? "Tall Tubular Inverter & Solar Battery"
      : product.category === "cat-two-wheeler"
      ? "Two-Wheeler VRLA Battery"
      : product.category === "cat-lithium" && isAgroProduct
      ? "Agricultural Sprayer LiFePO4 Lithium Battery"
      : isAgroProduct
      ? "Agricultural Sprayer VRLA SMF Battery"
      : product.category === "cat-vrla"
      ? "VRLA SMF UPS & Standby Battery"
      : product.category === "cat-lithium"
      ? "LiFePO4 Lithium-Ion Battery"
      : `${category?.name || "Heavy-Duty"} Battery`;

  const specPrefix = [product.voltage || "12V", product.ah]
    .filter(Boolean)
    .join(" ");

  const cleanModelName = product.name
    .replace(/\s*\(\d+\s*Months?\)\s*$/i, "")
    .trim();

  const seoTitle = `${cleanModelName} — ${specPrefix} ${categoryLabel} (${warrantyInfo.displayLabel} Warranty) | Goodwin Batteries`;

  const appsPreview =
    product.applications && product.applications.length > 0
      ? ` Compatible with ${product.applications.slice(0, 3).join(", ")}.`
      : "";

  const dimsPreview =
    product.dimensions && product.weight
      ? ` Specs: ${product.dimensions}, ${product.weight}.`
      : "";

  const seoDescription = `${cleanModelName} (${specPrefix}) ${categoryLabel} by Goodwin Batteries. Backed by ${warrantyInfo.breakdownLabel}.${dimsPreview}${appsPreview}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `/products/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  const categories = await getCategories();
  const category = categories.find(c => c.id === product.category);
  const warrantyInfo = getProductWarrantyInfo(product);
  const pricing = getProductPricing(product);

  const isTwoWheelerOrAuto = product.category === "cat-two-wheeler" || product.category === "cat-automotive";
  const isInverterOrUPS = product.category === "cat-inverter";
  const isAgro = product.category === "cat-agriculture";
  const isVRLA = product.category === "cat-vrla";
  const isLithium = product.category === "cat-lithium";

  // Application Compatibility Headings & Copy
  const compatibilityTitle = isInverterOrUPS
    ? "Application & System Compatibility"
    : isAgro
    ? "Agricultural Equipment Compatibility"
    : isVRLA
    ? "Device & Standby Compatibility"
    : "Vehicle Compatibility";

  const compatibilitySubtitle = isInverterOrUPS
    ? "Recommended for the following home, office, and solar power applications:"
    : isAgro
    ? "Recommended for the following agricultural and field spraying equipment:"
    : isVRLA
    ? "Recommended for the following cyclic and standby power devices:"
    : "Recommended for the following two-wheeler and automotive applications:";

  const compatibilityCtaText = isInverterOrUPS
    ? "Browse Inverter & UPS Range"
    : isAgro
    ? "Browse Agricultural Battery Range"
    : isVRLA
    ? "Browse VRLA & SMF Range"
    : "Find By Exact Vehicle Model";

  const compatibilityCtaHref = isInverterOrUPS
    ? "/products/category/inverter"
    : isAgro
    ? "/products/category/agriculture"
    : isVRLA
    ? "/products/category/vrla-smf"
    : "/battery-finder";

  // Care & Installation standards tailored by product family
  const careStandards = isInverterOrUPS
    ? [
        "Place battery in a well-ventilated space on an inverter trolley or acid-resistant tray.",
        "Keep electrolyte levels between MIN and MAX marks using certified demineralized/distilled water (never use acid or tap water).",
        "Clean terminal posts, apply petroleum jelly, and connect Positive (+) first, then Negative (-).",
        "Activate your Goodwin digital e-warranty within 14 days of purchase at any authorized dealer.",
      ]
    : isAgro || isVRLA || isLithium
    ? [
        "100% sealed maintenance-free design — never attempt to pry open safety lids or add liquid.",
        "Store in a cool, dry place and recharge promptly after deep discharge cycles.",
        "Use with matched CC/CV or SMF chargers to avoid overcharging and terminal sulfation.",
        "Activate your Goodwin digital e-warranty within 14 days of purchase at any authorized dealer.",
      ]
    : [
        "Clean battery tray and ensure terminal clamps are tightened to OE torque specification.",
        "Always connect Positive (+) terminal first, then Negative (-).",
        "Activate your Goodwin digital e-warranty within 14 days of purchase at any authorized dealer.",
      ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-slate-900 pt-20">
      
      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 py-4">
        <div className="container flex items-center text-xs font-bold uppercase tracking-wider text-slate-500">
          <Link href="/" className="hover:text-[#00843D] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2 text-slate-400" />
          <Link href="/products" className="hover:text-[#00843D] transition-colors">Products</Link>
          <ChevronRight size={14} className="mx-2 text-slate-400" />
          <Link href={`/products?category=${category?.slug}`} className="hover:text-[#00843D] transition-colors">{category?.name}</Link>
          <ChevronRight size={14} className="mx-2 text-slate-400" />
          <span className="text-[#00843D] font-black">{product.name}</span>
        </div>
      </div>

      {/* Product Hero */}
      <section className="py-12 md:py-20 relative overflow-hidden bg-white">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Image Gallery */}
            <ProductGallery product={product} />

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-[#00843D] border border-emerald-200">
                  <Zap size={12} className="text-[#00843D]" /> {product.series || "Gold"} Series
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {category?.name || "Automotive Battery"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  Heavy-Duty German Spec
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-slate-900 tracking-tight mb-4">
                {product.name}
                <span className="block text-base sm:text-lg font-bold text-[#00843D] mt-2 tracking-normal">
                  {product.voltage || "12V"} {product.ah ? `${product.ah} ` : ""}{category?.name || "Battery"} • {warrantyInfo.breakdownLabel}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed font-normal">
                {product.description || "Engineered with ultra-pure lead alloy grids, high vibration dampeners, and rapid charge acceptance for extreme Indian weather."}
              </p>

              {/* Key Highlights Matrix */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center flex flex-col justify-center relative overflow-hidden group hover:border-[#00843D]/50 transition-colors shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Capacity</span>
                  <span className="font-black text-xl sm:text-2xl text-slate-900">{product.ah || "TBA"}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center flex flex-col justify-center relative overflow-hidden group hover:border-[#00843D]/50 transition-colors shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Voltage</span>
                  <span className="font-black text-xl sm:text-2xl text-slate-900">{product.voltage || "12V"}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center flex flex-col justify-center relative overflow-hidden shadow-sm" title={warrantyInfo.breakdownLabel}>
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-emerald-800 mb-1">Verified Warranty</span>
                  <span className="font-black text-base sm:text-lg text-[#00843D] flex items-center justify-center gap-1">
                    <ShieldCheck size={16} className="shrink-0" />
                    {warrantyInfo.displayLabel}
                  </span>
                </div>
              </div>

              {/* E-Commerce Buy Widget */}
              <ProductBuyWidget product={product} />

              {/* Goodwin Tech Advantages Checklist */}
              {product.features && product.features.length > 0 ? (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Zap size={16} className="text-[#00843D]" /> Goodwin High-Performance Engineering
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                        <CheckCircle2 size={16} className="text-[#00843D] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Zap size={16} className="text-[#00843D]" /> Goodwin High-Performance Engineering
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "High-Density Silver-Calcium Alloy Plates",
                      "Instant High Cold Cranking Amperage (CCA)",
                      "Ultra Vibration & Heat Resistant Design",
                      "Zero Maintenance Sealed VRLA / Low-Water Architecture"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                        <CheckCircle2 size={16} className="text-[#00843D] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-800">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Section: Specs + Fitment + Engineering */}
      <section id="specifications" className="py-16 md:py-24 bg-slate-50/70 border-t border-slate-200">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            
            {/* Tech Specs Table */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#00843D] block mb-1">
                    Certified Technical Matrix
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                    Technical Specifications
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <ShieldCheck size={14} className="text-[#00843D]" /> BIS Certified
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-100">
                {[
                  { label: "Model Number", val: product.name, bold: true },
                  { label: "Battery Series", val: `${product.series || "Goodwin Gold"} High-Crank`, bold: false },
                  { label: "Technology", val: product.technology || "Heavy-Duty Calcium-Tin Expanded Grid", bold: false },
                  { label: "Rated Capacity", val: product.ah ? `${product.ah} @ 20Hr Rate` : "Factory Standard", bold: true },
                  { label: "Nominal Voltage", val: product.voltage || "12 Volts DC", bold: false },
                  { label: "Dimensions (L x W x H)", val: product.dimensions || "Standard JIS/DIN Case Specification", bold: false },
                  { label: "Total Filled Weight", val: product.weight || "Engineered Heavy-Duty Mass", bold: false },
                  { label: "Terminal Layout & Polarity", val: product.terminalLayout || "Left / Right Terminal (Standard Post)", bold: false },
                  { label: "Warranty Coverage", val: warrantyInfo.breakdownLabel, bold: true }
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 hover:bg-slate-50/50 transition-colors">
                    <div className="p-4 sm:p-5 sm:border-r sm:border-slate-100 bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
                      {row.label}
                    </div>
                    <div className={`p-4 sm:p-5 text-sm sm:col-span-2 flex items-center ${row.bold ? "text-slate-900 font-bold" : "text-slate-700 font-medium"}`}>
                      {row.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Datasheet Download Strip */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-between">
                <div>
                  <h4 className="text-slate-900 font-bold text-sm mb-1">Official Product Engineering Datasheet</h4>
                  <p className="text-xs text-slate-600">Download complete discharge curves, CCA values, and dimension CAD schematics.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <a 
                    href={`/api/datasheet/${product.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 transition-all shadow-sm"
                  >
                    <FileText size={14} className="text-[#00843D]" /> View Online
                  </a>
                  <a 
                    href={`/api/datasheet/${product.slug}?download=true`} 
                    download 
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#00843D] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#006830] transition-all shadow-md shadow-emerald-700/20"
                  >
                    <Download size={14} /> Download PDF
                  </a>
                </div>
              </div>
            </div>

            {/* Side Column: Application Compatibility & Care Guide */}
            <div className="flex flex-col gap-6">
              
              {/* Compatibility Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
                <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#00843D]" /> {compatibilityTitle}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{compatibilitySubtitle}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.application && product.application.length > 0 ? (
                    product.application.map((app, i) => (
                      <span key={i} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                        {app}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs">
                      {isInverterOrUPS
                        ? "Home Inverters, Solar Power, Office UPS."
                        : isAgro
                        ? "Agricultural Sprayers, Solar Fencing."
                        : isVRLA
                        ? "Weighing Scales, Medical Devices, Emergency Lighting."
                        : "Motorcycles, Commuter Scooters."}
                    </span>
                  )}
                </div>

                <Link
                  href={compatibilityCtaHref}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#00843D] border border-emerald-200 transition-all shadow-sm"
                >
                  {isTwoWheelerOrAuto ? <Search size={14} /> : <Zap size={14} />} {compatibilityCtaText}
                </Link>
              </div>

              {/* Installation & Maintenance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
                <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Wrench size={16} className="text-[#00843D]" /> Installation & Care Standards
                </h3>
                <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  {careStandards.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00843D] shrink-0 mt-1.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Need Help Box */}
              <div className="bg-gradient-to-br from-[#00843D] to-[#005e2b] p-6 rounded-2xl border border-emerald-600 shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="font-black text-white text-base mb-1">Looking for Bulk or Dealer Supply?</h3>
                <p className="text-emerald-100 text-xs mb-4 leading-relaxed">
                  Connect directly with our regional dispatch team for stockist discounts, GST billing, and immediate dispatch.
                </p>
                <a 
                  href="tel:9667724411" 
                  className="flex items-center justify-center gap-2 bg-white text-[#00843D] font-black px-4 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition-all shadow-md"
                >
                  <Phone size={14} /> Call Regional Sales: 96677 24411
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.image ? `https://goodwinbatteries.in${product.image}` : "https://goodwinbatteries.in/assets/logo/Goodwin.png",
            description: product.description || "Premium automotive battery by Goodwin.",
            sku: product.slug,
            brand: {
              "@type": "Brand",
              name: "Goodwin Batteries",
            },
            offers: {
              "@type": "Offer",
              url: `https://goodwinbatteries.in/products/${product.slug}`,
              priceCurrency: "INR",
              price: String(pricing.price),
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Warranty Coverage",
                value: warrantyInfo.breakdownLabel,
              },
              {
                "@type": "PropertyValue",
                name: "Capacity",
                value: product.ah,
              },
              {
                "@type": "PropertyValue",
                name: "Voltage",
                value: product.voltage,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
