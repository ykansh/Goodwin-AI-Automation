"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { 
  Package, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  ArrowLeft,
  LogOut,
  User,
  AlertCircle,
  ExternalLink
} from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("Customer");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    // 1. Check logged-in customer session
    const phone = localStorage.getItem("goodwin_customer_phone");
    const name = localStorage.getItem("goodwin_customer_name");

    if (!phone) {
      router.push("/account/login?redirect=/account/orders");
      return;
    }

    setCustomerPhone(phone);
    if (name) setCustomerName(name);

    // 2. Load orders matching this phone from Supabase & fallback to localStorage
    async function loadCustomerOrders() {
      const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
      let list: any[] = [];

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .ilike("phone", `%${cleanPhone}%`)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          list = data.map((row: any) => ({
            id: row.id,
            customerName: row.customer_name,
            phone: row.phone,
            email: row.email,
            address: row.address,
            city: row.city,
            state: row.state,
            pincode: row.pincode,
            vehicleDetails: row.vehicle_details,
            deliverySlot: row.delivery_slot,
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            status: row.status || "Confirmed",
            items: Array.isArray(row.items) ? row.items : [],
            totalAmount: Number(row.total_amount) || 0,
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (sbErr) {
        console.warn("Could not load from Supabase orders", sbErr);
      }

      // Merge with localStorage
      try {
        const stored = localStorage.getItem("goodwin_orders");
        const latest = localStorage.getItem("goodwin_latest_order");
        let localAll: any[] = stored ? JSON.parse(stored) : [];

        if (latest) {
          const latestParsed = JSON.parse(latest);
          if (!localAll.some((o) => o.id === latestParsed.id)) {
            localAll.unshift(latestParsed);
          }
        }

        localAll.forEach((localOrd) => {
          const oPhone = (localOrd.phone || "").replace(/\D/g, "").slice(-10);
          if (oPhone === cleanPhone || !oPhone) {
            if (!list.some((o) => o.id === localOrd.id)) {
              list.push(localOrd);
            }
          }
        });
      } catch (e) {
        console.error("Local storage orders parse error", e);
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
      setLoading(false);
    }

    loadCustomerOrders();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("goodwin_customer_phone");
    localStorage.removeItem("goodwin_customer_name");
    router.push("/account/login");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.items || []).some((it: any) => it.name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Your Orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-20">
      
      {/* Top Navigation Bar */}
      <div className="bg-[#00843D] text-white shadow-md">
        <div className="container py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/products" 
              className="text-white/80 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Back to Store
            </Link>
            <span className="text-white/30">|</span>
            <span className="font-heading font-black text-sm uppercase tracking-wide">
              My Orders & Live Tracking
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <User size={14} />
              </div>
              <span className="font-bold">{customerName}</span>
              <span className="text-emerald-200 text-[11px]">(+91 {customerPhone})</span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        
        {/* Page Title & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
              All Orders ({filteredOrders.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track live delivery status & download GST invoices
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or battery model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
          {["All", "Confirmed", "Packed", "Out for Delivery", "Delivered & Installed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === st
                  ? "bg-[#00843D] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <Package size={52} className="text-slate-300 mb-4" />
            <h3 className="font-heading font-black text-lg text-slate-900 mb-1">
              No Orders Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              You don&apos;t have any orders matching your search or filters.
            </p>
            <Link
              href="/products"
              className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Browse Batteries &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const firstItem = ord.items?.[0] || { name: "Goodwin Automotive Battery", price: ord.totalAmount, quantity: 1 };
              const itemCount = ord.items?.length || 1;

              const isDelivered = ord.status === "Delivered & Installed";
              const isOutForDelivery = ord.status === "Out for Delivery";
              const isPacked = ord.status === "Packed";
              const isConfirmed = ord.status === "Confirmed" || !ord.status;

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
                    
                    {/* Left: Product Thumbnail & Title */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative w-20 h-20 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        <Image
                          src={firstItem.image || "/assets/logo/Goodwin.png"}
                          alt={firstItem.name}
                          width={72}
                          height={72}
                          className="object-contain max-h-16"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Order ID: {ord.id} &bull; Placed on {new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>

                        <h2 className="font-heading font-black text-base text-slate-900 leading-snug">
                          {firstItem.name} {itemCount > 1 ? `(+${itemCount - 1} more items)` : ""}
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span>Slot: <strong className="text-slate-900 capitalize">{ord.deliverySlot?.replace(/-/g, " ")}</strong></span>
                          <span>&bull;</span>
                          <span>Vehicle: <strong className="text-slate-900">{ord.vehicleDetails || "Standard"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Price */}
                    <div className="text-left lg:text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Amount Paid
                      </span>
                      <span className="font-heading font-black text-xl text-slate-900">
                        {formatINR(ord.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-[#00843D] block mt-0.5">
                        Doorstep Delivery Included
                      </span>
                    </div>

                    {/* Right: Status Badge */}
                    <div className="w-full lg:w-64 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          isDelivered
                            ? "bg-emerald-500"
                            : isOutForDelivery
                            ? "bg-blue-600 animate-pulse"
                            : isPacked
                            ? "bg-indigo-600"
                            : "bg-amber-500"
                        }`} />
                        <span className="font-black text-xs uppercase tracking-tight text-slate-900">
                          {ord.status || "Confirmed"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-tight">
                        {isDelivered
                          ? "Package delivered safely to doorstep"
                          : isOutForDelivery
                          ? `Out for doorstep delivery via logistics`
                          : isPacked
                          ? "Packed at factory warehouse"
                          : "Order received, dispatch pending"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Delivery Address: <strong className="text-slate-700">{ord.address}, {ord.city}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/account/orders/${ord.id}`}
                        className="bg-[#00843D] hover:bg-[#006830] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Truck size={14} /> Track Order & Status
                      </Link>

                      <a
                        href={`https://wa.me/919667724411?text=${encodeURIComponent(`Hi Goodwin Support, I need help with my Order ${ord.id} (${formatINR(ord.totalAmount)})...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1"
                      >
                        <PhoneCall size={13} /> Need Help?
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
