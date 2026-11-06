"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Search, CheckCircle, ShieldCheck, AlertCircle, Phone, ArrowRight, Award, Zap } from "lucide-react";
import { publicWarrantyLookup } from "@/app/actions/public-actions";

export default function PublicWarrantyPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await publicWarrantyLookup(serialNumber.trim().toUpperCase());
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center pt-28 pb-20 px-4 relative overflow-hidden">
      <div className="w-full max-w-3xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#00843D] text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> Official Goodwin Warranty Verification
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-slate-900 tracking-tight mb-4">
            Instant E-Warranty Status Check
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Verify genuine battery authenticity, activation date, and remaining replacement warranty coverage using your battery serial number.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                placeholder="e.g. GW-TZ5LB-260924-00128"
                className="w-full px-5 py-4 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00843D] focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold tracking-wider uppercase text-base transition-all shadow-sm"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#00843D] hover:bg-[#006830] text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-700/25 shrink-0 text-sm uppercase tracking-wider active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Verify Now
            </button>
          </form>

          {/* Quick info note */}
          <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
            <Award size={14} className="text-amber-500 shrink-0" />
            <span>The serial number is laser-engraved on the top lid or printed on your warranty sticker barcode.</span>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="transition-all duration-500">
            
            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-900 shadow-xl">
                <AlertCircle size={44} className="mx-auto mb-3 text-red-500" />
                <h3 className="text-xl font-black mb-2 text-slate-900">Serial Number Not Found</h3>
                <p className="text-sm text-red-700 mb-4">{result.error}</p>
                <p className="text-xs text-slate-500">
                  Please double check the engraved code. If you bought this battery recently, contact our support team to get it registered.
                </p>
              </div>
            )}

            {result.status === "NOT_REGISTERED" && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center text-amber-900 shadow-xl">
                <ShieldCheck size={44} className="mx-auto mb-3 text-amber-600" />
                <h3 className="text-xl font-black mb-2 text-slate-900">Genuine Battery Found — Warranty Pending</h3>
                <p className="text-sm text-amber-800 max-w-md mx-auto mb-4">
                  This serial is authenticated in our master database, but digital e-warranty has not been activated yet.
                </p>
                <div className="font-mono font-black text-amber-900 bg-amber-100 py-2.5 px-5 rounded-xl border border-amber-300 inline-block mb-4 text-sm tracking-wider">
                  {result.battery.serial_number}
                </div>
                <div className="mt-3 mb-4">
                  <Link
                    href={`/support/warranty-registration?serial=${encodeURIComponent(result.battery.serial_number)}`}
                    className="inline-flex items-center gap-2 bg-[#00843D] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-[#006830] transition-colors"
                  >
                    Register Digital Warranty Now →
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  You can register online above or ask your authorized dealer to activate your digital warranty certificate.
                </p>
              </div>
            )}

            {result.status === "REGISTERED" && (
              <div className="bg-white border border-emerald-200 rounded-3xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-[#00843D] to-[#006830] p-8 text-center text-white relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-3">
                    <CheckCircle size={14} /> Active Goodwin Warranty
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                    Coverage Confirmed
                  </h3>
                  <p className="font-mono font-bold text-emerald-100 text-sm tracking-wider">
                    {result.battery.serial_number}
                  </p>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Date of Purchase</p>
                      <p className="text-lg font-black text-slate-900">{result.registration.warranty_start_date || 'N/A'}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <p className="text-[10px] text-emerald-800 uppercase tracking-widest font-black mb-1">Valid Until (Free Replacement)</p>
                      <p className="text-lg font-black text-[#00843D]">{result.registration.warranty_expiry_date || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-5 mb-6">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Registration Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 uppercase font-black text-[10px] mb-1">Product</p>
                        <p className="text-slate-900 font-bold">{result.battery.product_id || 'Goodwin Automotive'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase font-black text-[10px] mb-1">Status</p>
                        <p className="text-[#00843D] font-bold">{result.registration.status}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase font-black text-[10px] mb-1">Authorized Dealer</p>
                        <p className="text-slate-900 font-bold truncate">{result.registration.dealer_name || 'Authorized Goodwin Dealer'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-center gap-3">
                    <a 
                      href={`/warranty/certificate?serial=${result.battery.serial_number}`} 
                      className="bg-[#00843D] hover:bg-[#006830] text-white font-black px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/20"
                    >
                      <Award size={16} /> View Digital Certificate
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Direct WhatsApp Support */}
            <div className="mt-8 text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-600 mb-3">Have questions regarding your claim or replacement?</p>
              <a 
                href="https://wa.me/919220404411?text=Hello%20Goodwin%20Batteries%20Support,%20I%20have%20a%20warranty%20inquiry%20regarding%20my%20battery." 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#00843D] hover:bg-[#006830] text-white font-black px-5 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20"
              >
                <Phone size={14} />
                WhatsApp Warranty Desk: 92204 04411
              </a>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
