"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { getProductPricing, formatINR } from "@/lib/pricing";
import { getProductWarrantyInfo, resolveCategory } from "@/lib/product-specs";
import { 
  ArrowRight, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Check 
} from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const pricing = getProductPricing(product);
  const warrantyInfo = getProductWarrantyInfo(product);
  const categoryObj = resolveCategory(product.category);
  const displayWarranty = warrantyInfo.displayLabel;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    router.push("/checkout");
  };

  return (
    <div className="group bg-white border border-slate-200 hover:border-[#00843D] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 flex flex-col justify-between text-slate-900 relative">
      
      {/* Top Header Strip */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px]">
        <span className="font-heading font-black text-slate-600 tracking-widest uppercase">
          {product.series || "GOODWIN POWER"}
        </span>
        <span className="text-[#00843D] font-bold flex items-center gap-1">
          <Zap size={12} className="text-amber-500" /> Maintenance-Free
        </span>
      </div>

      {/* Image Area with Strikethrough & Discount Tag */}
      <div className="relative h-48 bg-slate-50/70 p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden">
        {/* Discount Badge */}
        {pricing.discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 z-20 bg-emerald-600 text-white font-heading font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs">
            {pricing.discountPercent}% OFF
          </span>
        )}

        {/* Safe Doorstep Delivery Tag */}
        <span className="absolute top-2.5 right-2.5 z-20 bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
          <Truck size={10} className="text-[#00843D]" /> Doorstep Delivery
        </span>

        <Link 
          href={`/products/${product.slug}`}
          className="w-full h-full relative z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
        >
          <Image 
            src={product.image || "/assets/logo/Goodwin.png"} 
            alt={product.name} 
            fill
            className="object-contain"
          />
        </Link>
      </div>
      
      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 mb-1 group-hover:text-[#00843D] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <div className="text-xs text-slate-500 mb-3 line-clamp-1">
            {categoryObj?.name || product.application?.join(" • ") || "Goodwin Power Battery"}
          </div>

          {/* Specs Mini Matrix */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-center">
              <span className="block text-[9px] uppercase font-bold text-slate-500">Capacity</span>
              <strong className="text-slate-900 text-xs sm:text-sm">{product.ah || "Standard AH"}</strong>
            </div>
            <div
              className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-center"
              title={warrantyInfo.breakdownLabel}
            >
              <span className="block text-[9px] uppercase font-bold text-slate-500">Warranty</span>
              <strong className="text-[#00843D] text-xs sm:text-sm flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> {displayWarranty}
              </strong>
            </div>
          </div>

          {/* Clean Price Box */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Special Online Price
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5">
              <div className="flex items-baseline gap-2 shrink-0">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#00843D]">
                  {formatINR(pricing.price)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(pricing.mrp)}
                </span>
              </div>

              {pricing.mrp > pricing.price && (
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md shrink-0">
                  Save {formatINR(pricing.mrp - pricing.price)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleAddToCart}
              className={`py-2.5 px-2 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all shadow-xs ${
                justAdded
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {justAdded ? (
                <>
                  <Check size={13} /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={13} /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="py-2.5 px-2 sm:px-3 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-700/20 active:scale-98"
            >
              Buy Now &rarr;
            </button>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-[#00843D] flex items-center justify-center gap-1 transition-colors"
          >
            <span>View Full Specifications & Fitment</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
