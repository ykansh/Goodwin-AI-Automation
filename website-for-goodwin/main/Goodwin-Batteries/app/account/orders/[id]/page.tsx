"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Wrench, 
  FileText, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Download, 
  Printer, 
  AlertCircle,
  Package,
  User,
  X
} from "lucide-react";
import CombinedShippingLabelInvoice from "@/components/orders/CombinedShippingLabelInvoice";

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params.id as string) || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      // 1. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId.trim())
          .single();

        if (data) {
          setOrder({
            id: data.id,
            customerName: data.customer_name,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            vehicleDetails: data.vehicle_details,
            deliverySlot: data.delivery_slot,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            status: data.status || "Confirmed",
            items: Array.isArray(data.items) ? data.items : [],
            totalAmount: Number(data.total_amount) || 0,
            createdAt: data.created_at || new Date().toISOString(),
            technicianName: data.technician_name,
            technicianPhone: data.technician_phone,
            technicianVehicle: data.technician_vehicle,
            invoiceNumber: data.invoice_number,
            trackingNumber: data.tracking_number,
            packedAt: data.packed_at,
            dispatchedAt: data.dispatched_at,
            deliveredAt: data.delivered_at,
          });
          setLoading(false);
          return;
        }
      } catch (sbErr) {
        console.warn("Could not load order from Supabase:", sbErr);
      }

      // 2. Fallback to localStorage
      try {
        const stored = localStorage.getItem("goodwin_orders");
        const latest = localStorage.getItem("goodwin_latest_order");
        let all: any[] = stored ? JSON.parse(stored) : [];

        if (latest) {
          const p = JSON.parse(latest);
          if (!all.some(o => o.id === p.id)) all.unshift(p);
        }

        const found = all.find(o => o.id.toUpperCase() === orderId.toUpperCase());
        if (found) {
          setOrder(found);
        }
      } catch (e) {
        console.error("Order load error", e);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Package size={56} className="text-slate-300 mb-4" />
        <h1 className="text-2xl font-heading font-black text-slate-900 mb-2">Order Not Found</h1>
        <p className="text-slate-500 text-sm max-w-sm mb-6">
          Could not find order <code className="bg-slate-200 px-2 py-0.5 rounded font-mono font-bold">{orderId}</code>.
        </p>
        <Link
          href="/account/orders"
          className="bg-[#00843D] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
        >
          &larr; Return to My Orders
        </Link>
      </div>
    );
  }

  // Stepper calculations
  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered & Installed";
  const isOutForDelivery = isDelivered || order.status === "Out for Delivery";
  const isPacked = isOutForDelivery || order.status === "Packed";
  const isConfirmed = true; // Always confirmed when order is created

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-20">
      
      {/* Top Navbar */}
      <div className="bg-[#00843D] text-white shadow-md">
        <div className="container py-3.5 flex items-center justify-between">
          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-amber-200 transition-colors"
          >
            <ArrowLeft size={16} /> All Orders
          </Link>
          <span className="font-heading font-black text-sm uppercase tracking-wide">
            Goodwin Order Tracker: {order.id}
          </span>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
          >
            <FileText size={13} /> Tax Invoice
          </button>
        </div>
      </div>

      <div className="container py-8 max-w-4xl space-y-6">
        
        {/* Order Status Stepper Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Order Status
              </span>
              <h2 className="text-xl font-heading font-black text-slate-900">
                {order.status || "Confirmed"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Slot:</span>
              <span className="text-xs font-bold text-slate-900 capitalize bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {order.deliverySlot?.replace(/-/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            
            {/* Step 1: Confirmed */}
            <div className="relative">
              <div className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ${
                isConfirmed ? "bg-[#00843D] text-white shadow-xs" : "bg-slate-200 text-slate-500"
              }`}>
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Order Confirmed
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your order has been placed & payment received. Placed on {new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
              </div>
            </div>

            {/* Step 2: Packed */}
            <div className="relative">
              <div className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ${
                isPacked ? "bg-[#00843D] text-white shadow-xs" : "bg-slate-200 text-slate-500"
              }`}>
                <Package size={13} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Packed & Inspected at Factory Warehouse
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isPacked 
                    ? "Battery tested for high voltage open circuit & packaged with warranty seal."
                    : "Scheduled for factory warehouse pick & seal packaging."}
                </p>
              </div>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className="relative">
              <div className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ${
                isOutForDelivery ? "bg-[#00843D] text-white shadow-xs animate-bounce" : "bg-slate-200 text-slate-500"
              }`}>
                <Truck size={13} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Out for Doorstep Delivery
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isOutForDelivery ? (
                    <span className="text-emerald-700 font-semibold">
                      Out for delivery via Goodwin dispatch logistics partner.
                    </span>
                  ) : (
                    "Delivery dispatch details will be sent via SMS/WhatsApp upon shipment."
                  )}
                </p>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className="relative">
              <div className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ${
                isDelivered ? "bg-[#00843D] text-white shadow-xs" : "bg-slate-200 text-slate-500"
              }`}>
                <Wrench size={13} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Delivered
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isDelivered 
                    ? "Battery package delivered safely to your address."
                    : "Factory-sealed battery delivered to doorstep. (Fitment is customer responsibility)."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Batteries List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Package size={18} className="text-[#00843D]" /> Ordered Items ({order.items?.length || 1})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((it: any, i: number) => (
              <div key={i} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0">
                    <Image
                      src={it.image || "/assets/logo/Goodwin.png"}
                      alt={it.name}
                      width={56}
                      height={56}
                      className="object-contain max-h-12"
                    />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      {it.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Quantity: <strong className="text-slate-900">{it.quantity}</strong> &bull; Factory Direct Sealed
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-black text-base text-slate-900">
                    {formatINR(it.price * it.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid: Delivery Address & Price Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Delivery Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin size={15} className="text-[#00843D]" /> Delivery Address
            </h3>
            <p className="font-heading font-black text-base text-slate-900">
              {order.customerName}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {order.address}, {order.city} - {order.pincode}
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p><strong>Mobile:</strong> +91 {order.phone}</p>
              <p><strong>Vehicle:</strong> {order.vehicleDetails || "Standard Automotive"}</p>
              <p><strong>Slot:</strong> {order.deliverySlot?.replace(/-/g, " ")}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400">
              Price Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>List MRP Total:</span>
                <span>{formatINR(order.totalMrp || order.totalAmount * 1.25)}</span>
              </div>
              <div className="flex justify-between text-[#00843D] font-medium">
                <span>Factory Direct Discount:</span>
                <span>-{formatINR((order.totalMrp || order.totalAmount * 1.25) - order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Safe Doorstep Delivery:</span>
                <span className="text-[#00843D] font-bold">FREE</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="font-heading text-lg text-[#00843D]">{formatINR(order.totalAmount)}</span>
              </div>
              <div className="text-[11px] text-slate-500 text-right">
                Payment: <strong>Prepaid Online ({order.paymentMethod || "Online"})</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div>
            <h4 className="font-bold text-xs text-slate-900">Have Questions About Your Installation?</h4>
            <p className="text-[11px] text-slate-500">Reach our dispatch desk on WhatsApp anytime.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Download Invoice
            </button>

            <a
              href={`https://wa.me/919667724411?text=${encodeURIComponent(`Hi Goodwin Dispatch, I am checking status of Order ${order.id}...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00843D] hover:bg-[#006830] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Phone size={14} /> Contact Dispatch Desk
            </a>
          </div>
        </div>
      </div>

      {/* Combined Shipping Label & Tax Invoice Modal */}
      {showInvoiceModal && (
        <CombinedShippingLabelInvoice
          order={order}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
