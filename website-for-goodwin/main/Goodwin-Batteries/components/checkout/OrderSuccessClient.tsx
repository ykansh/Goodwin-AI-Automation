"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/pricing";
import { 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  PhoneCall, 
  Printer, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  User, 
  Banknote,
  Package
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [adminWhatsApp, setAdminWhatsApp] = useState("9667724411");

  useEffect(() => {
    // Load configured WhatsApp number
    fetch("/api/admin/whatsapp-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.config?.whatsappNumber) {
          setAdminWhatsApp(d.config.whatsappNumber);
        }
      })
      .catch(() => {});

    try {
      const stored = localStorage.getItem("goodwin_latest_order");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!orderId || parsed.id === orderId) {
          setOrder(parsed);
          return;
        }
      }

      // Check all orders
      const allOrders = JSON.parse(localStorage.getItem("goodwin_orders") || "[]");
      const found = allOrders.find((o: any) => o.id === orderId);
      if (found) {
        setOrder(found);
      }
    } catch (e) {
      console.error("Failed to load order info", e);
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!order) return;
    const msg = `*GOODWIN BATTERIES - ORDER CONFIRMATION*\n\n` +
      `*Order ID:* ${order.id}\n` +
      `*Customer:* ${order.customerName} (${order.phone})\n` +
      `*Delivery Address:* ${order.address}, ${order.city} - ${order.pincode}\n` +
      `*Vehicle:* ${order.vehicleDetails || "Standard"}\n` +
      `*Slot:* ${order.deliverySlot}\n` +
      `*Total Amount:* ${formatINR(order.totalAmount)} (Paid Online - Prepaid)\n\n` +
      `Kindly confirm delivery dispatch status for my order. Thank you!`;

    const targetNumber = (order.adminWhatsappNumber || adminWhatsApp).replace(/\D/g, "");
    window.open(`https://wa.me/91${targetNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="container py-12 md:py-20 max-w-3xl text-slate-900 print:p-0 print:max-w-none">
      
      {/* Success Hero */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-[#00843D] to-teal-500" />
        
        <div className="w-20 h-20 bg-emerald-100 text-[#00843D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-in zoom-in-75">
          <CheckCircle2 size={44} />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#00843D] bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Order Confirmed & Scheduled for Delivery
        </span>

        <h1 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight mb-2">
          Thank You for Ordering with Goodwin!
        </h1>
        
        <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
          Your order <strong className="text-slate-900">{orderId || order?.id || "GW-ORD-CONFIRMED"}</strong> has been received. Our dispatch team is packing your factory-sealed battery for safe doorstep delivery.
        </p>

        {/* Dispatch notice */}
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          WhatsApp Notification Active &bull; Operations Notified (+91 {adminWhatsApp})
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7 print:hidden">
          <button
            onClick={handleWhatsAppShare}
            className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-98"
          >
            <PhoneCall size={16} /> Chat on WhatsApp (+91 {adminWhatsApp})
          </button>
          
          <button
            onClick={handlePrint}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Order Reference
              </span>
              <strong className="font-heading font-black text-lg text-slate-900">
                {order.id}
              </strong>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Order Date
              </span>
              <span className="text-xs font-bold text-slate-800">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          </div>

          {/* Delivery & Technician Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                <MapPin size={15} className="text-[#00843D]" /> Delivery Address
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900">{order.customerName}</strong><br />
                {order.phone}<br />
                {order.address}<br />
                {order.landmark && <span>Landmark: {order.landmark}<br /></span>}
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                <Truck size={15} className="text-[#00843D]" /> Delivery Slot & Payment
              </h4>
              <div className="text-xs text-slate-700 space-y-1 font-medium">
                <div>
                  <span className="text-slate-500">Slot: </span>
                  <span className="font-bold text-slate-900 capitalize">
                    {order.deliverySlot?.replace(/-/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Vehicle / Model: </span>
                  <span className="font-bold text-slate-900">
                    {order.vehicleDetails || "Not Specified"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Payment: </span>
                  <span className="font-bold text-[#00843D] uppercase">
                    Paid Online (Prepaid)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Delivery: </span>
                  <span className="font-black text-[#00843D]">FREE Doorstep Delivery</span>
                </div>
                <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded font-medium mt-1 border border-amber-200/50">
                  *Battery fitment is customer responsibility.
                </div>
              </div>
            </div>
          </div>

          {/* Items Purchased */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-1.5">
              <Package size={15} className="text-[#00843D]" /> Batteries Ordered
            </h4>

            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-white rounded-xl border border-slate-200 shrink-0 p-1 flex items-center justify-center">
                      <Image
                        src={item.image || "/assets/logo/Goodwin.png"}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h5 className="font-heading font-bold text-xs text-slate-900">
                        {item.name}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <span className="font-heading font-black text-sm text-slate-900 shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-2 text-xs border border-slate-200">
            {order.totalMrp && order.totalMrp > order.totalAmount && (
              <div className="flex justify-between text-[#00843D] font-bold">
                <span>Goodwin Online Savings</span>
                <span>- {formatINR(order.totalMrp - order.totalAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Doorstep Delivery</span>
              <span className="text-[#00843D] font-bold uppercase">FREE</span>
            </div>
            {order.transactionId && (
              <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                <span>Transaction Ref</span>
                <span>{order.transactionId}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-heading">
              <span className="font-black text-slate-900 text-sm uppercase">Total Amount</span>
              <span className="font-black text-[#00843D] text-2xl">{formatINR(order.totalAmount)}</span>
            </div>
          </div>

          {/* Next Steps Guide */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <h5 className="font-heading font-black uppercase text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#00843D]" /> What Happens Next?
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>Our dispatch hub confirms your order and packs a fresh, factory-charged battery.</li>
              <li>The delivery logistics partner contacts you before doorstep delivery.</li>
              <li>Sealed Goodwin battery package is handed over with official GST invoice.</li>
              <li>Fitment is handled by customer or local technician; digital warranty can be activated online anytime.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Footer Back link */}
      <div className="text-center mt-10 print:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#00843D] transition-colors"
        >
          <span>Continue Shopping More Batteries</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessClient() {
  return (
    <Suspense fallback={
      <div className="container py-20 text-center font-bold text-slate-500">
        Loading order confirmation...
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
