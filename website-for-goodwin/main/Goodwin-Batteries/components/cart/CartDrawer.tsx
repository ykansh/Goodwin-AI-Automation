"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/pricing";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Truck, 
  CheckCircle2,
  PhoneCall
} from "lucide-react";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    totalMrp,
    discount,
    totalAmount,
    pincode,
    setPincode,
    pincodeStatus,
    checkPincode,
  } = useCart();

  const [inputPin, setInputPin] = useState(pincode || "");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const itemList = items
      .map((it) => `• ${it.name} (Qty: ${it.quantity}) @ ${formatINR(it.price)} each`)
      .join("\n");

    const message = `*GOODWIN BATTERIES - ONLINE ORDER ENQUIRY*\n\n` +
      `*Items in Cart:*\n${itemList}\n\n` +
      `*Total MRP:* ${formatINR(totalMrp)}\n` +
      `*Discounted Total:* ${formatINR(totalAmount)}\n` +
      (pincode ? `*Delivery Pincode:* ${pincode}\n` : "") +
      `\nPlease assist me with quick doorstep delivery & installation!`;

    window.open(`https://wa.me/919667724411?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00843D]/10 text-[#00843D] flex items-center justify-center font-bold">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-heading font-black text-slate-900 text-lg uppercase tracking-tight">
                Your Cart
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {itemCount} {itemCount === 1 ? "battery" : "batteries"} in cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-500 font-bold px-2 py-1 rounded transition-colors"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Free Delivery announcement */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-900">
          <Truck size={16} className="text-[#00843D] shrink-0" />
          <span>FREE Doorstep Delivery & Certified Installation Included!</span>
        </div>

        {/* Body / Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag size={36} />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-6">
                Explore our maintenance-free automotive, inverter and commercial battery catalogue.
              </p>
              <button
                onClick={closeCart}
                className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 shrink-0 p-1 flex items-center justify-center">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-heading font-bold text-sm text-slate-900 hover:text-[#00843D] transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {item.ah && <span>{item.ah}</span>}
                          {item.voltage && <span>• {item.voltage}</span>}
                          {item.warranty && <span className="text-[#00843D] font-bold">• {item.warranty}</span>}
                        </div>

                        {/* Price */}
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-heading font-black text-base text-slate-900">
                            {formatINR(itemTotal)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {formatINR(item.mrp * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Quantity
                      </span>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Delivery Pincode Checker */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Truck size={14} className="text-[#00843D]" /> Check Delivery & Installation SLA
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 110054)"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00843D]"
                  />
                  <button
                    onClick={() => {
                      setPincode(inputPin);
                      checkPincode(inputPin);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Check
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
            </>
          )}
        </div>

        {/* Footer with totals and action buttons */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-white space-y-4">
            
            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Total MRP</span>
                <span className="line-through">{formatINR(totalMrp)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#00843D] font-bold">
                  <span>Goodwin Online Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Doorstep Delivery</span>
                <span className="text-[#00843D] font-bold uppercase">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-heading">
                <span className="font-black text-slate-900 text-sm uppercase">Total Payable</span>
                <span className="font-black text-[#00843D] text-2xl">{formatINR(totalAmount)}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right">Inclusive of all taxes & GST</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-700/20 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#00843D] border border-emerald-200 rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall size={15} />
                <span>Quick Order via WhatsApp</span>
              </button>
            </div>

            <div className="text-center text-[11px] text-slate-500 pt-0.5">
              Have an account?{" "}
              <Link
                href="/account/login"
                onClick={closeCart}
                className="text-[#00843D] font-bold hover:underline"
              >
                Login with OTP
              </Link>{" "}
              for fast checkout & saved orders
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#00843D]" /> 100% Genuine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-[#00843D]" /> Doorstep Delivery
              </span>
              <span>•</span>
              <span>Secure Payment</span>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-1 font-medium">
              *Battery fitment is customer responsibility.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
