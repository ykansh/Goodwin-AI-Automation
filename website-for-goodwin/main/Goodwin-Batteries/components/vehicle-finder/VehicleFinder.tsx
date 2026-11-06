"use client";

import { useState, useEffect } from "react";
import { 
  Battery, Car, Truck, Bike, Tractor, Search, Phone, 
  Loader2, Info, ArrowLeft, RotateCcw, Download, CheckCircle, Zap, ShieldCheck 
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { useGlobalSettings } from "@/components/GlobalSettingsProvider";

import vehicleFitments from "@/data/vehicleFitments.json";
import goodwinProducts from "@/data/goodwinProducts.json";
import { getProductWarrantyInfo } from "@/lib/product-specs";

export default function VehicleFinder() {
  const settings = useGlobalSettings();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing...");

  // Data Options
  const [types, setTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  
  const [selections, setSelections] = useState({
    type: "",
    brand: "",
    model: "",
    variant: "",
    fuel: "",
    year: ""
  });

  // Results
  const [recommendedProduct, setRecommendedProduct] = useState<any | null>(null);
  const [availableWarrantyVariants, setAvailableWarrantyVariants] = useState<any[]>([]);
  const [fitmentStatus, setFitmentStatus] = useState<"verified" | "unverified">("verified");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Initial load of Types
    const uniqueTypes = Array.from(new Set(vehicleFitments.map(f => f.type))).sort();
    setTypes(uniqueTypes);
  }, []);

  const resetFinder = () => {
    setStep(1);
    setSelections({ type: "", brand: "", model: "", variant: "", fuel: "", year: "" });
    setRecommendedProduct(null);
    setAvailableWarrantyVariants([]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const goBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  // Helper to reliably match a product in goodwinProducts.json
  const findProduct = (fitment: any) => {
    if (!fitment) return null;

    // 1. Direct match by ID (e.g. "prod-xl25lc", "prod-tz4lb")
    if (fitment.batteryProductId) {
      const byId = goodwinProducts.find(p => p.id === fitment.batteryProductId);
      if (byId) return byId;
    }

    // 2. Direct match by slug (e.g. "gw-xl2-5lc", "gw-tz4lb")
    if (fitment.batteryProductId) {
      const bySlug = goodwinProducts.find(p => p.slug === fitment.batteryProductId);
      if (bySlug) return bySlug;
    }

    // 3. Match by batteryModel (e.g. "GW-XL2.5LC", "GW-TZ4LB", "GOLD SERIES 12V 9AH")
    if (fitment.batteryModel) {
      const rawModel = fitment.batteryModel.trim();
      const cleanModel = rawModel.toLowerCase();
      const cleanAlpha = cleanModel.replace(/[^a-z0-9]/gi, "");

      // Match product name prefix or exact
      const byName = goodwinProducts.find(p => {
        const pName = p.name.toLowerCase();
        return pName === cleanModel || pName.startsWith(cleanModel) || pName.includes(cleanModel);
      });
      if (byName) return byName;

      // Match product slug
      const bySlug = goodwinProducts.find(p => {
        const pSlug = p.slug.toLowerCase();
        const pAlpha = pSlug.replace(/[^a-z0-9]/gi, "");
        return pSlug === cleanModel || pAlpha === cleanAlpha || pAlpha.includes(cleanAlpha) || cleanAlpha.includes(pAlpha);
      });
      if (bySlug) return bySlug;
    }

    // 4. Match by Ah / capacity
    if (fitment.notes || fitment.batteryModel) {
      const text = `${fitment.batteryModel || ""} ${fitment.notes || ""}`;
      const ahMatch = text.match(/(\d+(?:\.\d+)?)\s*ah/i);
      if (ahMatch) {
        const ahNum = parseFloat(ahMatch[1]);
        const byAh = goodwinProducts.find(p => {
          const pAh = parseFloat(p.ah?.replace(/[^0-9.]/g, "") || "0");
          return pAh === ahNum && p.category === "cat-two-wheeler";
        });
        if (byAh) return byAh;
      }
    }

    return null;
  };

  const getWarrantyVariants = (baseProd: any) => {
    if (!baseProd) return [];
    // Extract base model prefix, e.g. "GW-TZ4LB" from "GW-TZ4LB (48 Months)"
    const baseCodeMatch = baseProd.name.match(/^(GW-[A-Z0-9.]+)/i);
    if (!baseCodeMatch) return [baseProd];
    const baseCode = baseCodeMatch[1].toLowerCase();

    const variants = goodwinProducts.filter(p => 
      p.name.toLowerCase().startsWith(baseCode) || 
      (baseProd.slug.includes("-") && p.slug.toLowerCase().startsWith(baseProd.slug.split("-").slice(0, 2).join("-")))
    );
    return variants.length > 0 ? variants : [baseProd];
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    // Find matching models or brands
    const matches = vehicleFitments.filter(f => 
      f.model.toLowerCase().includes(query.toLowerCase()) || 
      f.brand.toLowerCase().includes(query.toLowerCase())
    );
    
    // Deduplicate by brand + model
    const uniqueMatches: any[] = [];
    const seen = new Set();
    for (const m of matches) {
      const key = `${m.brand.toLowerCase()}-${m.model.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMatches.push(m);
      }
      if (uniqueMatches.length >= 12) break;
    }
      
    setSearchResults(uniqueMatches);
    setIsSearching(false);
  };

  const selectSearchResult = (fitment: any) => {
    setSearchQuery("");
    setSearchResults([]);
    setSelections(s => ({ 
      ...s, 
      type: fitment.type, 
      brand: fitment.brand, 
      model: fitment.model,
      variant: "", fuel: "", year: ""
    }));
    
    setStep(4);
    setLoading(true);
    setLoadingText("Loading variants...");
    
    setTimeout(() => {
      const v = Array.from(new Set(vehicleFitments
        .filter(f => f.brand.toLowerCase() === fitment.brand.toLowerCase() && f.model.toLowerCase() === fitment.model.toLowerCase())
        .map(f => f.variant)
      ));
      setVariants(v.length > 0 ? v.sort() : ["Standard"]);
      setLoading(false);
    }, 250);
  };

  const handleTypeSelect = (type: string) => {
    setSelections(s => ({ ...s, type, brand: "", model: "", variant: "", fuel: "", year: "" }));
    setStep(2);
    setLoading(true);
    setLoadingText("Loading brands...");
    setTimeout(() => {
      const b = Array.from(new Set(vehicleFitments.filter(f => f.type === type).map(f => f.brand)));
      setBrands(b.sort());
      setLoading(false);
    }, 250);
  };

  const handleBrandSelect = (brand: string) => {
    setSelections(s => ({ ...s, brand, model: "", variant: "", fuel: "", year: "" }));
    setStep(3);
    setLoading(true);
    setLoadingText("Loading models...");
    setTimeout(() => {
      const m = Array.from(new Set(vehicleFitments.filter(f => f.type === selections.type && f.brand === brand).map(f => f.model)));
      setModels(m.sort());
      setLoading(false);
    }, 250);
  };

  const handleModelSelect = (model: string) => {
    setSelections(s => ({ ...s, model, variant: "", fuel: "", year: "" }));
    setStep(4);
    setLoading(true);
    setLoadingText("Loading variants...");
    setTimeout(() => {
      const v = Array.from(new Set(vehicleFitments
        .filter(f => f.type === selections.type && f.brand === selections.brand && f.model === model)
        .map(f => f.variant)
      ));
      setVariants(v.length > 0 ? v.sort() : ["Standard"]);
      setLoading(false);
    }, 250);
  };

  const handleVariantSelect = (variant: string) => {
    setSelections(s => ({ ...s, variant, fuel: "", year: "" }));
    setStep(5);
    setLoading(true);
    setLoadingText("Loading fuels...");
    setTimeout(() => {
      const fl = Array.from(new Set(vehicleFitments
        .filter(f => f.type === selections.type && f.brand === selections.brand && f.model === selections.model && f.variant === variant)
        .map(f => f.fuel)
      ));
      setFuels(fl.length > 0 ? fl.sort() : ["Petrol"]);
      setLoading(false);
    }, 250);
  };

  const handleFuelSelect = (fuel: string) => {
    setSelections(s => ({ ...s, fuel, year: "" }));
    setStep(6);
    setLoading(true);
    setLoadingText("Loading years...");
    setTimeout(() => {
      const matchingFitments = vehicleFitments.filter(f => 
        f.type === selections.type && 
        f.brand === selections.brand && 
        f.model === selections.model && 
        f.variant === selections.variant && 
        f.fuel === fuel
      );
      if (matchingFitments.length > 0) {
        const yearSet = new Set<string>();
        matchingFitments.forEach(f => {
          const from = f.yearFrom || 2010;
          const to = f.yearTo || 2025;
          for (let i = to; i >= from; i--) {
            yearSet.add(i.toString());
          }
        });
        setYears(Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a)));
      } else {
        const y: string[] = [];
        for (let i = 2025; i >= 2010; i--) {
          y.push(i.toString());
        }
        setYears(y);
      }
      setLoading(false);
    }, 250);
  };

  const handleYearSelect = (year: string) => {
    setSelections(s => ({ ...s, year }));
    setStep(7);
    setLoading(true);
    setLoadingText("Finding verified battery match...");

    setTimeout(() => {
      const yearNum = parseInt(year);
      const match = vehicleFitments.find(f => 
        f.type === selections.type && 
        f.brand === selections.brand && 
        f.model === selections.model && 
        f.variant === selections.variant && 
        f.fuel === selections.fuel &&
        (!isNaN(yearNum) ? (yearNum >= f.yearFrom && yearNum <= f.yearTo) : true)
      ) || vehicleFitments.find(f => 
        f.type === selections.type && 
        f.brand === selections.brand && 
        f.model === selections.model && 
        f.variant === selections.variant && 
        f.fuel === selections.fuel
      ) || vehicleFitments.find(f => 
        f.brand.toLowerCase() === selections.brand.toLowerCase() && 
        f.model.toLowerCase() === selections.model.toLowerCase()
      );

      const prod = findProduct(match);

      if (prod) {
        setRecommendedProduct(prod);
        const related = getWarrantyVariants(prod);
        setAvailableWarrantyVariants(related);
        setFitmentStatus("verified");
      } else {
        setRecommendedProduct(null);
        setAvailableWarrantyVariants([]);
        setFitmentStatus("unverified");
      }
      
      setLoading(false);
    }, 400);
  };

  const getIconForType = (typeName: string) => {
    if (typeName.includes("Passenger") || typeName.includes("Car")) return <Car size={28} />;
    if (typeName.includes("Two") || typeName.includes("Bike") || typeName.includes("Motorcycle") || typeName.includes("Scooter")) return <Bike size={28} />;
    if (typeName.includes("Commercial") || typeName.includes("Truck")) return <Truck size={28} />;
    if (typeName.includes("Tractor")) return <Tractor size={28} />;
    return <Battery size={28} />;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Goodwin Batteries,\n\nI used the Battery Finder and need a battery for:\n\n` +
    `Vehicle: ${selections.brand} ${selections.model}\n` +
    `Variant: ${selections.variant}\n` +
    `Fuel: ${selections.fuel}\n` +
    `Year: ${selections.year}\n\n` +
    (recommendedProduct ? 
      `Recommended Goodwin Battery:\n${recommendedProduct.name}\n${recommendedProduct.voltage} / ${recommendedProduct.ah || recommendedProduct.capacity || ""}\n\n` :
      `The database showed this as Unverified. Can you please help me find the exact match?\n\n`
    ) +
    `Please confirm availability and price.`
  );
  
  const whatsappUrl = `https://wa.me/${settings?.whatsapp_main || "919667724411"}?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden min-h-[500px] flex flex-col relative text-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between shrink-0 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#00843D] uppercase mb-1">
            <Zap size={14} className="text-amber-500" /> Instant Match Engine
          </div>
          <h3 className="text-2xl font-heading font-black tracking-tight text-slate-900 uppercase">
            Goodwin Battery Finder
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Select your vehicle parameters to get an OEM-grade verified battery recommendation.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative z-20 w-full md:w-72">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search make or model..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#00843D] focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm transition-all shadow-sm"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>
          
          {searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-slate-500 text-xs">Searching database...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(res => (
                  <button 
                    key={res.id} 
                    onClick={() => selectSearchResult(res)}
                    className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-emerald-50/50 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>{res.brand} {res.model}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{res.type}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">No matching vehicle found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stepped Progress Bar */}
      <div className="flex items-center justify-between bg-slate-50/90 px-6 py-3 border-b border-slate-200">
        <div className="flex text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 items-center gap-1 sm:gap-2">
          <span className={clsx("cursor-pointer transition-colors px-2 py-1 rounded-md", step >= 1 ? "text-[#00843D] bg-emerald-100/60 font-black" : "hover:text-slate-900")} onClick={() => setStep(1)}>1. Type</span>
          <span className="text-slate-300">&rsaquo;</span>
          <span className={clsx("cursor-pointer transition-colors px-2 py-1 rounded-md", step >= 2 ? "text-[#00843D] bg-emerald-100/60 font-black" : "hover:text-slate-900")} onClick={() => step >= 2 && setStep(2)}>2. Brand</span>
          <span className="text-slate-300">&rsaquo;</span>
          <span className={clsx("cursor-pointer transition-colors px-2 py-1 rounded-md", step >= 3 ? "text-[#00843D] bg-emerald-100/60 font-black" : "hover:text-slate-900")} onClick={() => step >= 3 && setStep(3)}>3. Model</span>
          <span className="text-slate-300">&rsaquo;</span>
          <span className={clsx("cursor-pointer transition-colors px-2 py-1 rounded-md", step >= 4 ? "text-[#00843D] bg-emerald-100/60 font-black" : "hover:text-slate-900")} onClick={() => step >= 4 && setStep(4)}>4. Variant</span>
          <span className="text-slate-300">&rsaquo;</span>
          <span className={clsx("cursor-pointer transition-colors px-2 py-1 rounded-md", step >= 5 ? "text-[#00843D] bg-emerald-100/60 font-black" : "hover:text-slate-900")} onClick={() => step >= 5 && setStep(5)}>5. Fuel</span>
          <span className="text-slate-300">&rsaquo;</span>
          <span className={clsx("cursor-pointer transition-colors px-2 py-1 rounded-md", step >= 6 ? "text-[#00843D] bg-emerald-100/60 font-black" : "hover:text-slate-900")} onClick={() => step >= 6 && setStep(6)}>6. Year</span>
        </div>
        
        <button 
          onClick={resetFinder} 
          className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors shrink-0 ml-4 hover:underline"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 flex-1 flex flex-col relative min-h-[360px] bg-white">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
            <Loader2 size={36} className="animate-spin text-[#00843D] mb-3" />
            <p className="text-slate-900 font-black tracking-widest uppercase text-xs">{loadingText}</p>
          </div>
        )}

        {/* Back Button */}
        {step > 1 && step < 7 && !loading && (
          <button 
            onClick={goBack} 
            className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:text-[#00843D] transition-colors text-xs font-bold tracking-wider uppercase self-start"
          >
            <ArrowLeft size={14} /> Back to Previous Step
          </button>
        )}

        {/* Step 1: Type */}
        {step === 1 && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base sm:text-lg font-bold mb-6 text-center text-slate-900">Select Vehicle Category</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {types.map((vt) => (
                <button
                  key={vt}
                  onClick={() => handleTypeSelect(vt)}
                  className="flex flex-col items-center justify-center p-6 border border-slate-200 bg-slate-50/70 rounded-2xl hover:border-[#00843D] hover:bg-emerald-50/40 hover:shadow-lg transition-all text-slate-800 group active:scale-95 hover:-translate-y-1"
                >
                  <div className="text-slate-500 group-hover:text-[#00843D] transition-colors mb-3 group-hover:scale-110">
                    {getIconForType(vt)}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-center">{vt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Brand */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base sm:text-lg font-bold mb-6 text-center text-slate-900">Select Vehicle Make</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandSelect(brand)}
                  className="py-3.5 px-3 border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00843D] hover:shadow-md rounded-xl text-center font-bold text-xs sm:text-sm text-slate-800 active:scale-95 transition-all truncate"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Model */}
        {step === 3 && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base sm:text-lg font-bold mb-6 text-center text-slate-900">Select {selections.brand} Model</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => handleModelSelect(model)}
                  className="py-3.5 px-3 border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00843D] hover:shadow-md rounded-xl text-center font-bold text-xs sm:text-sm text-slate-800 active:scale-95 transition-all truncate"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Variant */}
        {step === 4 && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base sm:text-lg font-bold mb-6 text-center text-slate-900">Select Vehicle Variant</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {variants.map((variant) => (
                <button
                  key={variant}
                  onClick={() => handleVariantSelect(variant)}
                  className="py-3.5 px-3 border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00843D] hover:shadow-md rounded-xl text-center font-bold text-xs sm:text-sm text-slate-800 active:scale-95 transition-all truncate"
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Fuel */}
        {step === 5 && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base sm:text-lg font-bold mb-6 text-center text-slate-900">Select Fuel Type</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {fuels.map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => handleFuelSelect(fuel)}
                  className="py-5 px-4 border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00843D] hover:shadow-md rounded-2xl text-center font-bold text-slate-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span className="text-2xl">{fuel === "Electric" ? "⚡" : fuel === "Diesel" ? "🛢️" : "⛽"}</span>
                  <span className="text-xs sm:text-sm">{fuel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Year */}
        {step === 6 && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base sm:text-lg font-bold mb-6 text-center text-slate-900">Select Manufacturing Year</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-3xl mx-auto">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className="py-3.5 px-2 border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00843D] hover:shadow-md rounded-xl text-center font-bold text-xs sm:text-sm text-slate-800 active:scale-95 transition-all"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Result - VERIFIED MATCH (Amaron / VARTA Benchmark) */}
        {step === 7 && fitmentStatus === "verified" && recommendedProduct && (
          <div className="animate-in zoom-in-95 duration-400 flex flex-col items-center py-2">
            <div className="w-full max-w-3xl bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 border border-emerald-200/90 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden">
              {/* Verified Badge */}
              <div className="absolute top-0 right-0 bg-[#00843D] text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-bl-xl flex items-center gap-1 shadow-md">
                <CheckCircle size={14} /> OEM VERIFIED FITMENT
              </div>
              
              {/* Battery Visual */}
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 p-4 relative z-10 shadow-sm">
                {recommendedProduct.image ? (
                  <div className="w-full h-full relative">
                    <Image 
                      src={recommendedProduct.image} 
                      alt={recommendedProduct.name} 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                ) : (
                  <Battery size={64} className="text-slate-400" />
                )}
              </div>
              
              {/* Product Information */}
              <div className="flex-1 text-center md:text-left relative z-10">
                <span className="text-[#00843D] font-bold text-xs tracking-widest uppercase mb-1 block">
                  {recommendedProduct.series || "Goodwin Power"} Series
                </span>
                <h4 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mb-4">
                  {recommendedProduct.name}
                </h4>
                
                {/* Specs Matrix */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Capacity</span>
                    <strong className="text-slate-900 text-sm">{recommendedProduct.ah || "N/A"}</strong>
                  </div>
                  <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Voltage</span>
                    <strong className="text-slate-900 text-sm">{recommendedProduct.voltage || "12V"}</strong>
                  </div>
                  <div className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-center" title={getProductWarrantyInfo(recommendedProduct).breakdownLabel}>
                    <span className="text-[10px] text-emerald-800 block uppercase font-bold">Warranty</span>
                    <strong className="text-[#00843D] text-sm font-black">
                      {getProductWarrantyInfo(recommendedProduct).displayLabel}
                    </strong>
                  </div>
                </div>

                {/* Warranty Variants Selector (e.g. 48M / 18M / 12M) */}
                {availableWarrantyVariants.length > 1 && (
                  <div className="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                      Available Warranty Tiers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableWarrantyVariants.map((vProd) => {
                        const isCurrent = vProd.id === recommendedProduct.id;
                        const wText = getProductWarrantyInfo(vProd).displayLabel;
                        return (
                          <button
                            key={vProd.id}
                            type="button"
                            onClick={() => setRecommendedProduct(vProd)}
                            className={clsx(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                              isCurrent
                                ? "bg-[#00843D] text-white border-[#00843D] shadow-sm font-black"
                                : "bg-white text-slate-700 border-slate-300 hover:border-[#00843D] hover:text-[#00843D]"
                            )}
                          >
                            {wText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-3 mb-6 border border-slate-200 text-xs text-slate-600 text-left">
                  <span className="font-bold text-slate-900 block mb-0.5">Matched for your vehicle:</span>
                  {selections.brand} {selections.model} ({selections.variant}) • {selections.fuel} • {selections.year}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href={`/products/${recommendedProduct.slug}`} 
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center flex-1 shadow-md hover:shadow-lg"
                  >
                    View Specs
                  </Link>
                  <a 
                    href={`/api/datasheet/${recommendedProduct.slug}?download=true`} 
                    download 
                    className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-1 border border-slate-200 shadow-sm"
                  >
                    <Download size={14} /> Datasheet
                  </a>
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-[#00843D] hover:bg-[#006830] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-1 shadow-lg shadow-emerald-700/20 active:scale-95"
                  >
                    <Phone size={14} /> WhatsApp Dealer
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Empty State / UNVERIFIED MATCH */}
        {step === 7 && fitmentStatus === "unverified" && (
          <div className="animate-in zoom-in-95 duration-400 flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-5 text-amber-600">
              <Info size={28} />
            </div>
            <h4 className="text-xl font-heading font-black mb-3 text-center text-slate-900 uppercase tracking-wider">
              Custom Vehicle Verification
            </h4>
            <p className="text-slate-700 font-semibold mb-2 text-center text-sm">
              We want to ensure 100% exact tray dimensions and terminal polarity for your vehicle.
            </p>
            <p className="text-slate-500 mb-6 max-w-md text-center text-xs leading-relaxed">
              For <strong>{selections.brand} {selections.model} {selections.variant}</strong> ({selections.fuel}, {selections.year}), contact our technical fitment team directly via WhatsApp for an immediate match confirmation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-8">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all w-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
              >
                <Phone size={16} /> WhatsApp Fitment Team
              </a>
              <Link 
                href="/products" 
                className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all w-full flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
              >
                Browse All Batteries
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
