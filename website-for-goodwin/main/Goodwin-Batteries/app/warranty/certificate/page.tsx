"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { publicWarrantyLookup } from "@/app/actions/public-actions";
import { Loader2, Printer } from "lucide-react";
import Link from "next/link";

function CertificateContent() {
  const searchParams = useSearchParams();
  const serial = searchParams.get("serial");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!serial) {
      setError("No serial number provided.");
      setLoading(false);
      return;
    }
    fetchData();
  }, [serial]);

  async function fetchData() {
    try {
      const res = await publicWarrantyLookup(serial as string);
      if (res.error) {
        setError(res.error);
      } else if (res.status !== "REGISTERED") {
        setError("Warranty not registered or invalid.");
      } else {
        setData(res);
      }
    } catch (e) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-brand" size={48} /></div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
        <Link href="/warranty" className="text-brand hover:underline font-bold">← Back to Search</Link>
        <button 
          onClick={() => window.print()} 
          className="bg-brand text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-dark transition-colors"
        >
          <Printer size={20} /> Print Certificate
        </button>
      </div>

      <div className="bg-white w-full max-w-4xl p-12 shadow-2xl relative overflow-hidden print:shadow-none print:p-0" id="certificate">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-brand"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/5 rounded-tr-full -z-10"></div>

        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <div className="w-16 h-16 bg-brand text-white font-bold flex items-center justify-center rounded-xl text-3xl mb-4">G</div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Warranty Certificate</h1>
            <p className="text-gray-500 mt-2 font-mono">Goodwin Konnekt Digital Record</p>
          </div>
          <div className="text-right">
            {/* Pseudo-QR code area for now */}
            <div className="w-24 h-24 bg-gray-100 border border-gray-300 p-1 flex items-center justify-center text-xs text-gray-400 font-mono text-center mb-2">
              QR Code Placeholder
            </div>
            <p className="font-mono font-bold text-gray-700">{data.battery.serial_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Product Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Model / Product ID</p>
                <p className="font-bold text-gray-900 text-lg">{data.battery.product_id || "Goodwin Automotive Battery"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                <p className="font-bold text-brand font-mono text-lg">{data.battery.serial_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Vehicle Application</p>
                <p className="font-semibold text-gray-800">{data.registration.vehicle_make_model || "N/A"}</p>
                {data.registration.vehicle_reg_number && (
                   <p className="text-sm text-gray-600 font-mono mt-1">{data.registration.vehicle_reg_number}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Warranty Terms</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Purchase Date</p>
                <p className="font-bold text-gray-900 text-lg">{new Date(data.registration.warranty_start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                <p className="font-bold text-green-600 text-lg">{data.registration.warranty_expiry_date ? new Date(data.registration.warranty_expiry_date).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Authorized Dealer</p>
                <p className="font-semibold text-gray-800">{data.registration.dealer_name || data.registration.dealer_id || "Goodwin Authorized Network"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">This is a system-generated digital certificate and does not require a physical signature.</p>
          <p>For warranty claims and support, present this certificate along with your original purchase invoice.</p>
          <p className="mt-4 font-bold text-gray-700">Goodwin Batteries • 1800-XXX-XXXX • support@goodwinbatteries.in</p>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-brand" size={48} /></div>}>
      <CertificateContent />
    </Suspense>
  );
}
