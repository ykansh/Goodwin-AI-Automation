"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { getProductPricing, formatINR } from "@/lib/pricing";
import { 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Check, 
  PhoneCall, 
  Plus, 
  Minus,
  CheckCircle2
} from "lucide-react";

export default function ProductBuyWidget({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, checkPincode, pincode, pincodeStatus, setPincode } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [pinInput, setPinInput] = useState(pincode || "");

  const pricing = getProductPricing(product);
  const totalPrice = pricing.price * quantity;
  const totalMrp = pricing.mrp * quantity;
  const totalSavings = totalMrp - totalPrice;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleWhatsAppOrder = () => {
    const message = `*GOODWIN BATTERIES - ORDER ENQUIRY*\n\n` +
      `*Product:* ${product.name}\n` +
      `*Quantity:* ${quantity}\n` +
      `*Price:* ${formatINR(totalPrice)} (MRP: ${formatINR(totalMrp)})\n` +
      (pincode ? `*Delivery Pincode:* ${pincode}\n` : "") +
      `\nPlease confirm delivery and doorstep fitment timing.`;

    window.open(`https://wa.me/919667724411?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200 rounded-3xl p-6 shadow-sm mb-8 space-y-6">
      
      {/* Price Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Special Online Price
          </span>
          {pricing.discountPercent > 0 && (
            <span className="bg-emerald-600 text-white font-heading font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md">
              {pricing.discountPercent}% OFF
            </span>
          )}
          <span className="text-[11px] text-emerald-700 font-bold ml-auto flex items-center gap-1">
            <Truck size={13} /> Safe Doorstep Delivery
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className="font-heading font-black text-2xl sm:text-4xl text-[#00843D]">
            {formatINR(totalPrice)}
          </span>
          <span className="text-sm sm:text-base text-slate-400 line-through">
            {formatINR(totalMrp)}
          </span>
          {totalSavings > 0 && (
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              Save {formatINR(totalSavings)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Inclusive of all taxes and GST. Factory-sealed battery delivered to your address. <span className="text-slate-700 font-semibold">(Battery fitment is customer responsibility)</span>
        </p>
      </div>

      {/* Delivery Pincode SLA Checker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Truck size={14} className="text-[#00843D]" /> Check Doorstep Delivery Pincode
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit Pincode"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00843D]"
          />
          <button
            onClick={() => {
              setPincode(pinInput);
              checkPincode(pinInput);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Verify
          </button>
        </div>

        {pincodeStatus && (
          <div className={`mt-2 text-[11px] font-bold flex items-center gap-1.5 ${
            pincodeStatus.available ? "text-emerald-700" : "text-amber-700"
          }`}>
            <CheckCircle2 size={13} />
            <span>{pincodeStatus.message}</span>
          </div>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>
            <span className="w-10 text-center text-sm font-black text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-md ${
              justAdded
                ? "bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {justAdded ? (
              <>
                <Check size={16} /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Buy Now & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleBuyNow}
            className="w-full py-4 px-4 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-700/20 active:scale-98"
          >
            <span>Proceed to Buy Now</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleWhatsAppOrder}
            className="w-full py-4 px-4 bg-white border border-slate-300 hover:border-[#00843D] text-slate-800 hover:text-[#00843D] rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <PhoneCall size={15} className="text-[#00843D]" />
            <span>Order on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Trust Assurances */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck size={16} className="text-[#00843D]" />
          <span>100% Genuine</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Truck size={16} className="text-[#00843D]" />
          <span>Doorstep Delivery</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CheckCircle2 size={16} className="text-[#00843D]" />
          <span>Secure Online Pay</span>
        </div>
      </div>
    </div>
  );
}
