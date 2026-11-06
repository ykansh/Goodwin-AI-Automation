"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Truck, ArrowRight, ShieldCheck, Package } from "lucide-react";

export default function PublicTrackOrderPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = query.trim();
    if (!val) {
      setError("Please enter your Order ID (e.g. GW-ORD-208887) or 10-digit mobile number.");
      return;
    }

    if (val.toUpperCase().startsWith("GW-ORD-")) {
      router.push(`/account/orders/${val.toUpperCase()}`);
      return;
    }

    const cleanDigits = val.replace(/\D/g, "");
    if (cleanDigits.length === 10) {
      router.push(`/account/login?redirect=/account/orders&phone=${cleanDigits}`);
      return;
    }

    // Default assume order ID
    router.push(`/account/orders/GW-ORD-${val.replace(/\D/g, "")}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-16 text-slate-900">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#00843D] flex items-center justify-center mx-auto shadow-inner">
          <Truck size={32} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
            Track Your Battery Order
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Check real-time live status, packing progress, and delivery dispatch details.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleTrack} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. GW-ORD-208887) or Phone"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 focus:border-[#00843D] focus:bg-white rounded-2xl text-sm font-bold tracking-wide focus:outline-none transition-all text-center"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#00843D] hover:bg-[#006830] text-white rounded-2xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
          >
            <Search size={16} /> Track Order Live &rarr;
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link href="/account/login" className="text-[#00843D] font-bold hover:underline">
            Login to view All Past Orders &rarr;
          </Link>
          <Link href="/products" className="text-slate-500 hover:text-slate-900">
            Store Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
