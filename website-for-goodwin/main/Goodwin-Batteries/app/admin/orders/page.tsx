"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import CombinedShippingLabelInvoice from "@/components/orders/CombinedShippingLabelInvoice";
import { GOODWIN_GST_DETAILS } from "@/lib/invoice";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Calendar, 
  RotateCcw, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Settings,
  Send,
  Package,
  Wrench,
  FileText,
  Printer,
  Download,
  X,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Award,
  Trash2,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";

interface OrderData {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  vehicleDetails?: string;
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus?: string;
  status: "Confirmed" | "Packed" | "Out for Delivery" | "Delivered & Installed" | "Cancelled";
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: string;
  packedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianVehicle?: string;
  invoiceNumber?: string;
  installedSerialNumber?: string;
  trackingNumber?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Primary Filter Tabs
  const [activeTab, setActiveTab] = useState<string>("All");

  // Search & Sub-filters
  const [search, setSearch] = useState("");
  const [subfilterDate, setSubfilterDate] = useState<string>("all");
  const [subfilterSlot, setSubfilterSlot] = useState<string>("all");
  const [subfilterCity, setSubfilterCity] = useState<string>("all");
  const [subfilterPayment, setSubfilterPayment] = useState<string>("all");
  
  // WhatsApp config state
  const [whatsappConfig, setWhatsappConfig] = useState({
    whatsappNumber: "9667724411",
    countryCode: "91",
  });

  // Modals state
  const [dispatchModalOrder, setDispatchModalOrder] = useState<OrderData | null>(null);
  const [technicianForm, setTechnicianForm] = useState({
    name: "Vikram Sharma (Certified Expert)",
    phone: "9811223344",
    vehicle: "MP-09-AB-1234 (Goodwin Van)",
  });

  // Combined Shipping Label & Tax Invoice Modal
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<OrderData | null>(null);

  // Delete Order Confirmation Modal
  const [deleteModalOrder, setDeleteModalOrder] = useState<OrderData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    let loaded: OrderData[] = [];

    // 1. Load from Supabase orders table
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        loaded = data.map((row: any) => ({
          id: row.id,
          customerName: row.customer_name || "Customer",
          phone: row.phone || "",
          email: row.email,
          address: row.address || "",
          city: row.city || "",
          state: row.state || "",
          pincode: row.pincode || "",
          vehicleDetails: row.vehicle_details,
          deliverySlot: row.delivery_slot || "Same-Day Delivery",
          paymentMethod: row.payment_method || "online",
          paymentStatus: row.payment_status || "Paid",
          status: row.status || "Confirmed",
          items: Array.isArray(row.items) ? row.items : [],
          totalAmount: Number(row.total_amount) || 0,
          createdAt: row.created_at || new Date().toISOString(),
          technicianName: row.technician_name,
          technicianPhone: row.technician_phone,
          technicianVehicle: row.technician_vehicle,
          invoiceNumber: row.invoice_number,
          trackingNumber: row.tracking_number,
          packedAt: row.packed_at,
          dispatchedAt: row.dispatched_at,
          deliveredAt: row.delivered_at,
        }));
      }
    } catch (e) {
      console.warn("Could not fetch from Supabase orders table", e);
    }

    // 1b. Fallback check: Look in enquiries table for any orders saved during database transition
    try {
      const { data: enqData } = await supabase
        .from("enquiries")
        .select("*")
        .or("id.like.GW-ORD%,subject.ilike.%ONLINE ORDER%")
        .order("created_at", { ascending: false });

      if (enqData && enqData.length > 0) {
        enqData.forEach((enq: any) => {
          if (!loaded.some((o) => o.id === enq.id)) {
            // Extract items and details from message if possible
            loaded.push({
              id: enq.id,
              customerName: enq.name || "Customer",
              phone: enq.mobile || "",
              email: enq.email,
              address: "Address recorded in order details",
              city: "City",
              state: "State",
              pincode: "",
              vehicleDetails: "",
              deliverySlot: "Standard Delivery",
              paymentMethod: "online",
              paymentStatus: "Paid",
              status: enq.status === "Closed" ? "Delivered & Installed" : "Confirmed",
              items: [],
              totalAmount: 0,
              createdAt: enq.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch (enqErr) {
      console.warn("Enquiries orders fallback notice:", enqErr);
    }

    // 2. Load from localStorage
    try {
      const stored = localStorage.getItem("goodwin_orders");
      if (stored) {
        const localList: OrderData[] = JSON.parse(stored);
        localList.forEach((localOrd) => {
          if (!loaded.some((o) => o.id === localOrd.id)) {
            loaded.push(localOrd);
          }
        });
      }
    } catch (e) {
      console.warn("Local storage orders read error", e);
    }

    // Sort newest first
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(loaded);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    fetch("/api/admin/whatsapp-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setWhatsappConfig({
            whatsappNumber: data.config.whatsappNumber,
            countryCode: data.config.countryCode || "91",
          });
        }
      })
      .catch((err) => console.warn("Failed to load WhatsApp config in orders page", err));
  }, []);

  const triggerToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  // Save order update helper
  const persistOrderUpdate = (updatedOrder: OrderData) => {
    // 1. Update state
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));

    // 2. Update localStorage
    try {
      const stored = localStorage.getItem("goodwin_orders");
      if (stored) {
        const list: OrderData[] = JSON.parse(stored);
        const updated = list.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        localStorage.setItem("goodwin_orders", JSON.stringify(updated));
      }
      localStorage.setItem("goodwin_latest_order", JSON.stringify(updatedOrder));
    } catch {}

    // 3. Update Supabase if table exists
    try {
      supabase.from("orders").update({
        status: updatedOrder.status,
        technician_name: updatedOrder.technicianName,
        technician_phone: updatedOrder.technicianPhone,
        technician_vehicle: updatedOrder.technicianVehicle,
        invoice_number: updatedOrder.invoiceNumber,
        packed_at: updatedOrder.packedAt,
        dispatched_at: updatedOrder.dispatchedAt,
        delivered_at: updatedOrder.deliveredAt,
      }).eq("id", updatedOrder.id);
    } catch {}
  };

  // 1. Action: Pack Order (Seller workflow)
  const handlePackOrder = (order: OrderData) => {
    const updated: OrderData = {
      ...order,
      status: "Packed",
      packedAt: new Date().toISOString(),
      invoiceNumber: order.invoiceNumber || `GB/IND/${new Date().getFullYear()}/${order.id.replace("GW-ORD-", "")}`,
    };
    persistOrderUpdate(updated);
    triggerToast(`Order ${order.id} marked as Packed & ready for dispatch.`);
  };

  // 2. Action: Dispatch & Assign Technician
  const handleDispatchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;

    const updated: OrderData = {
      ...dispatchModalOrder,
      status: "Out for Delivery",
      dispatchedAt: new Date().toISOString(),
      technicianName: technicianForm.name,
      technicianPhone: technicianForm.phone,
      technicianVehicle: technicianForm.vehicle,
      invoiceNumber: dispatchModalOrder.invoiceNumber || `GB/IND/${new Date().getFullYear()}/${dispatchModalOrder.id.replace("GW-ORD-", "")}`,
    };

    persistOrderUpdate(updated);
    setDispatchModalOrder(null);
    triggerToast(`Order ${dispatchModalOrder.id} dispatched with technician ${technicianForm.name}.`);
  };

  // 3. Action: Complete & Delivered
  const handleMarkDelivered = (order: OrderData) => {
    const updated: OrderData = {
      ...order,
      status: "Delivered & Installed",
      deliveredAt: new Date().toISOString(),
    };
    persistOrderUpdate(updated);
    triggerToast(`Order ${order.id} completed. Battery successfully installed & tested.`);
  };

  // 4. Action: Cancel Order
  const handleCancelOrder = (order: OrderData) => {
    if (confirm(`Are you sure you want to cancel order ${order.id}?`)) {
      const updated: OrderData = {
        ...order,
        status: "Cancelled",
      };
      persistOrderUpdate(updated);
      triggerToast(`Order ${order.id} has been marked as Cancelled.`);
    }
  };

  // 5. Action: Delete Order Permanently
  const handleConfirmDelete = async () => {
    if (!deleteModalOrder) return;
    setIsDeleting(true);

    const orderIdToDelete = deleteModalOrder.id;

    // 1. Update State
    setOrders((prev) => prev.filter((o) => o.id !== orderIdToDelete));

    // 2. Remove from LocalStorage
    try {
      const stored = localStorage.getItem("goodwin_orders");
      if (stored) {
        const list: OrderData[] = JSON.parse(stored);
        const filtered = list.filter((o) => o.id !== orderIdToDelete);
        localStorage.setItem("goodwin_orders", JSON.stringify(filtered));
      }
      const latest = localStorage.getItem("goodwin_latest_order");
      if (latest) {
        const parsedLatest = JSON.parse(latest);
        if (parsedLatest.id === orderIdToDelete) {
          localStorage.removeItem("goodwin_latest_order");
        }
      }
    } catch (e) {
      console.warn("Could not delete order from localStorage", e);
    }

    // 3. Remove from Supabase
    try {
      await supabase.from("orders").delete().eq("id", orderIdToDelete);
    } catch (e) {
      console.warn("Could not delete order from Supabase", e);
    }

    setIsDeleting(false);
    setDeleteModalOrder(null);
    triggerToast(`Order ${orderIdToDelete} was permanently deleted.`);
  };

  // Dynamically extract unique cities from current orders
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.city && o.city.trim()) {
        set.add(o.city.trim());
      }
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filtered orders based on Tab, Search, and All Sub-filters
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter((o) => {
      // 1. Search Query
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.pincode.includes(q) ||
        (o.vehicleDetails && o.vehicleDetails.toLowerCase().includes(q)) ||
        (o.address && o.address.toLowerCase().includes(q));

      // 2. Main Status Tab
      let matchesTab = true;
      if (activeTab === "New") matchesTab = o.status === "Confirmed" || !o.status;
      else if (activeTab === "Packed") matchesTab = o.status === "Packed";
      else if (activeTab === "Out for Delivery") matchesTab = o.status === "Out for Delivery";
      else if (activeTab === "Delivered") matchesTab = o.status === "Delivered & Installed";
      else if (activeTab === "Cancelled") matchesTab = o.status === "Cancelled";

      // 3. Sub-filter: Date Period
      let matchesDate = true;
      const orderTimestamp = new Date(o.createdAt).getTime();
      if (subfilterDate === "today") {
        matchesDate = orderTimestamp >= startOfToday;
      } else if (subfilterDate === "yesterday") {
        matchesDate = orderTimestamp >= startOfYesterday && orderTimestamp < startOfToday;
      } else if (subfilterDate === "last7") {
        matchesDate = orderTimestamp >= sevenDaysAgo;
      } else if (subfilterDate === "month") {
        matchesDate = orderTimestamp >= startOfMonth;
      }

      // 4. Sub-filter: Delivery Slot
      let matchesSlot = true;
      if (subfilterSlot !== "all") {
        const slotKey = o.deliverySlot?.toLowerCase() || "";
        if (subfilterSlot === "express") matchesSlot = slotKey.includes("express");
        else if (subfilterSlot === "morning") matchesSlot = slotKey.includes("morning") || slotKey.includes("9am") || slotKey.includes("9 am");
        else if (subfilterSlot === "afternoon") matchesSlot = slotKey.includes("afternoon") || slotKey.includes("1pm") || slotKey.includes("1 pm");
        else if (subfilterSlot === "evening") matchesSlot = slotKey.includes("evening") || slotKey.includes("5pm") || slotKey.includes("5 pm");
      }

      // 5. Sub-filter: City
      let matchesCity = true;
      if (subfilterCity !== "all") {
        matchesCity = (o.city || "").toLowerCase().trim() === subfilterCity.toLowerCase().trim();
      }

      // 6. Sub-filter: Payment
      let matchesPayment = true;
      if (subfilterPayment !== "all") {
        const pStatus = (o.paymentStatus || "").toLowerCase();
        if (subfilterPayment === "paid") matchesPayment = pStatus === "paid" || o.paymentMethod === "online";
        else if (subfilterPayment === "pending") matchesPayment = pStatus === "pending";
      }

      return matchesSearch && matchesTab && matchesDate && matchesSlot && matchesCity && matchesPayment;
    });
  }, [orders, search, activeTab, subfilterDate, subfilterSlot, subfilterCity, subfilterPayment]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === "Confirmed" || !o.status).length,
      packed: orders.filter((o) => o.status === "Packed").length,
      out: orders.filter((o) => o.status === "Out for Delivery").length,
      delivered: orders.filter((o) => o.status === "Delivered & Installed").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
    };
  }, [orders]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return {
      total: orders.length,
      totalRevenue,
      pendingCount: tabCounts.new + tabCounts.packed,
      inTransitCount: tabCounts.out,
      deliveredCount: tabCounts.delivered,
    };
  }, [orders, tabCounts]);

  const hasActiveSubfilters = 
    search !== "" || 
    subfilterDate !== "all" || 
    subfilterSlot !== "all" || 
    subfilterCity !== "all" || 
    subfilterPayment !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setActiveTab("All");
    setSubfilterDate("all");
    setSubfilterSlot("all");
    setSubfilterCity("all");
    setSubfilterPayment("all");
  };

  // Comprehensive Orders Report Download (CSV)
  const handleExportOrdersReport = () => {
    const exportDataset = filteredOrders.length > 0 ? filteredOrders : orders;
    if (exportDataset.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Order Date",
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "City",
      "State",
      "Pincode",
      "Vehicle Details",
      "Items & Qty",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Delivery Slot",
      "Status",
      "Invoice Number",
      "AWB / Tracking",
      "Technician Name",
      "Technician Phone",
      "Technician Van",
    ];

    const rows = exportDataset.map((o) => {
      const dateStr = new Date(o.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const itemsStr = (o.items || []).map((i) => `${i.name} (Qty: ${i.quantity})`).join(" | ");

      return [
        `"${o.id}"`,
        `"${dateStr}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${o.phone}"`,
        `"${o.email || ""}"`,
        `"${(o.address || "").replace(/"/g, '""')}"`,
        `"${o.city || ""}"`,
        `"${o.state || ""}"`,
        `"${o.pincode || ""}"`,
        `"${(o.vehicleDetails || "Standard").replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.totalAmount,
        `"${o.paymentMethod}"`,
        `"${o.paymentStatus || "Paid"}"`,
        `"${o.deliverySlot || ""}"`,
        `"${o.status}"`,
        `"${o.invoiceNumber || `GB/IND/${new Date(o.createdAt).getFullYear()}/${o.id.replace("GW-ORD-", "")}`}"`,
        `"${o.trackingNumber || `FMPC${o.id.replace(/\D/g, "").slice(0, 10).padEnd(10, "0")}`}"`,
        `"${o.technicianName || "Unassigned"}"`,
        `"${o.technicianPhone || ""}"`,
        `"${o.technicianVehicle || ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateTag = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Goodwin_Orders_Report_${dateTag}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Orders report exported as CSV successfully.");
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Toast Notification Banner */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-emerald-500">
          <CheckCircle2 size={18} className="text-emerald-200" />
          <span className="font-bold text-xs">{actionSuccessMessage}</span>
          <button onClick={() => setActionSuccessMessage(null)} className="ml-2 text-white/70 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Goodwin Seller Hub Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-black uppercase tracking-wider">
            <Award size={14} /> Goodwin Seller Hub &bull; Direct OEM Store &bull; Indore
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
            Order Fulfillment &amp; Dispatch Portal
          </h1>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Manage live online orders, pack factory-sealed batteries, generate combined shipping labels with GST tax invoices (HSN 8507 &bull; GSTIN 23EAZPR0166R1ZN), and assign certified fitment technicians.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reports Download Button */}
          <button
            onClick={handleExportOrdersReport}
            className="bg-[#00843D] hover:bg-[#007033] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
            title="Download complete orders report in CSV"
          >
            <Download size={14} /> Download Reports (CSV)
          </button>

          <button
            onClick={loadOrders}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* WhatsApp Order Notification Status Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <MessageSquare size={18} />
          </div>
          <div>
            <span className="font-black text-foreground text-sm block">
              Active WhatsApp Order Forwarding: +{whatsappConfig.countryCode} {whatsappConfig.whatsappNumber}
            </span>
            <p className="text-[11px] text-muted-foreground">
              Every online customer order is automatically notified to this operations desk for doorstep technician dispatch.
            </p>
          </div>
        </div>
        <Link
          href="/admin/settings"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Settings size={13} /> Change Alert Number
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
              Total Online Orders
            </span>
            <span className="text-2xl font-heading font-black text-foreground">
              {metrics.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
              Total Revenue
            </span>
            <span className="text-2xl font-heading font-black text-emerald-600">
              {formatINR(metrics.totalRevenue)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
              Pending Fulfillment
            </span>
            <span className="text-2xl font-heading font-black text-amber-500">
              {metrics.pendingCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
              Delivered &amp; Installed
            </span>
            <span className="text-2xl font-heading font-black text-blue-500">
              {metrics.deliveredCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* FILTERS & SUB-FILTERS SECTION */}
      <div className="bg-surface border border-border rounded-3xl p-5 shadow-xs space-y-4">
        
        {/* Main Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold uppercase tracking-wider">
          {[
            { id: "All", label: "All Orders", count: tabCounts.all },
            { id: "New", label: "1. New / Pending Pack", count: tabCounts.new, color: "text-amber-500" },
            { id: "Packed", label: "2. Ready to Dispatch", count: tabCounts.packed, color: "text-indigo-500" },
            { id: "Out for Delivery", label: "3. Out for Fitment", count: tabCounts.out, color: "text-blue-500" },
            { id: "Delivered", label: "4. Delivered & Installed", count: tabCounts.delivered, color: "text-emerald-500" },
            { id: "Cancelled", label: "Cancelled", count: tabCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-surface border-border text-muted-foreground hover:border-brand hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-muted text-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-background border border-border p-3 rounded-2xl flex items-center gap-3">
          <Search size={18} className="text-muted-foreground shrink-0 ml-2" />
          <input
            type="text"
            placeholder="Search by Order ID (e.g. GW-ORD-208887), customer name, phone, city, vehicle, or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground mr-2 font-bold cursor-pointer">
              Clear
            </button>
          )}
        </div>

        {/* SUB-FILTERS ROW (Date, Slot, City, Payment) */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-1 mr-1">
              <Filter size={13} /> Sub-filters:
            </span>

            {/* Date Period Sub-filter */}
            <select
              value={subfilterDate}
              onChange={(e) => setSubfilterDate(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">📅 All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>

            {/* Delivery Slot Sub-filter */}
            <select
              value={subfilterSlot}
              onChange={(e) => setSubfilterSlot(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">⚡ All Delivery Slots</option>
              <option value="same-day">Same-Day Delivery</option>
              <option value="morning">Morning (9 AM - 1 PM)</option>
              <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 9 PM)</option>
            </select>

            {/* City Sub-filter */}
            <select
              value={subfilterCity}
              onChange={(e) => setSubfilterCity(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">📍 All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Payment Status Sub-filter */}
            <select
              value={subfilterPayment}
              onChange={(e) => setSubfilterPayment(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">💳 All Payments</option>
              <option value="paid">Paid Online (Prepaid)</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Results count & Clear All */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground font-medium">
              Showing <strong className="text-foreground">{filteredOrders.length}</strong> of {orders.length} orders
            </span>

            {hasActiveSubfilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-red-500 hover:text-red-600 underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <Package size={52} className="text-muted-foreground mb-4 opacity-40" />
          <h3 className="font-heading font-bold text-lg text-foreground mb-1">
            No Orders Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {hasActiveSubfilters ? "No orders match the selected filters." : "No orders are currently waiting in this section."}
          </p>
          {hasActiveSubfilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isDelivered = ord.status === "Delivered & Installed";
            const isOutForDelivery = ord.status === "Out for Delivery";
            const isPacked = ord.status === "Packed";
            const isNew = ord.status === "Confirmed" || !ord.status;

            return (
              <div
                key={ord.id}
                className="bg-surface border-2 border-border hover:border-brand/50 rounded-3xl p-6 shadow-xs transition-all space-y-4 relative"
              >
                {/* Card Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold shadow-inner">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-black text-foreground text-lg tracking-tight">
                          {ord.id}
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Prepaid Online
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Placed on {new Date(ord.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </span>
                    </div>
                  </div>

                  {/* Status Pill, Amount, & Quick Delete Trigger */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                      isDelivered
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        : isOutForDelivery
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/30 animate-pulse"
                        : isPacked
                        ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {ord.status || "Confirmed"}
                    </span>

                    <span className="font-heading font-black text-2xl text-brand">
                      {formatINR(ord.totalAmount)}
                    </span>

                    {/* Delete order icon button */}
                    <button
                      onClick={() => setDeleteModalOrder(ord)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title={`Delete order ${ord.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  
                  {/* Customer Information */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Customer Details
                    </span>
                    <p className="font-bold text-foreground text-sm">{ord.customerName}</p>
                    <p className="text-muted-foreground font-mono">+91 {ord.phone}</p>
                    {ord.email && <p className="text-muted-foreground">{ord.email}</p>}

                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={`tel:${ord.phone}`}
                        className="bg-background border border-border hover:border-brand px-2.5 py-1.5 rounded-lg font-bold text-[11px] text-foreground flex items-center gap-1 transition-colors"
                      >
                        <Phone size={12} /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${ord.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${ord.customerName}, regarding your Goodwin Battery order ${ord.id}...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare size={12} /> WhatsApp Customer
                      </a>
                    </div>
                  </div>

                  {/* Delivery Location & Slot */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Doorstep Fitment Address
                    </span>
                    <p className="text-foreground font-medium leading-relaxed">
                      {ord.address}, {ord.city} &ndash; <strong className="font-mono">{ord.pincode}</strong>
                    </p>
                    <div className="pt-1 text-muted-foreground space-y-0.5">
                      <p><strong>Slot:</strong> <span className="capitalize">{ord.deliverySlot?.replace(/-/g, " ")}</span></p>
                      <p><strong>Vehicle:</strong> {ord.vehicleDetails || "Standard Automotive"}</p>
                    </div>
                  </div>

                  {/* Assigned Technician & Dispatch Info */}
                  <div className="space-y-1 bg-muted/30 p-3.5 rounded-2xl border border-border">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Fulfillment &amp; Technician
                    </span>
                    {ord.technicianName ? (
                      <div className="space-y-1">
                        <p className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                          <UserCheck size={14} className="text-emerald-500" />
                          {ord.technicianName}
                        </p>
                        <p className="text-muted-foreground font-mono">
                          Mobile: <strong>{ord.technicianPhone}</strong>
                        </p>
                        <p className="text-muted-foreground">
                          Service Van: {ord.technicianVehicle}
                        </p>
                      </div>
                    ) : (
                      <div className="py-2 text-muted-foreground">
                        <span className="italic block">No technician assigned yet.</span>
                        <span className="text-[11px] text-amber-500 font-bold block mt-1">
                          Action: Pack &amp; Assign Technician below
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Battery Items */}
                <div className="pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
                    Batteries Ordered ({ord.items?.length || 1})
                  </span>
                  <div className="space-y-1.5">
                    {ord.items?.map((it, idx) => (
                      <div key={idx} className="bg-background border border-border p-2.5 rounded-xl flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">
                          {it.name} <span className="text-muted-foreground font-normal">(Qty: {it.quantity})</span>
                        </span>
                        <span className="font-black text-brand">
                          {formatINR(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seller Action Toolbar */}
                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* PRIMARY ACTION: Combined Shipping Label & Tax Invoice (matches 1730258755.webp) */}
                    <button
                      onClick={() => setSelectedLabelOrder(ord)}
                      className="bg-[#00843D] hover:bg-[#007033] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      title="Generate and print combined Shipping Label & Tax Invoice"
                    >
                      <Printer size={14} /> Shipping Label &amp; Tax Invoice
                    </button>

                    {/* WhatsApp Ops Forward */}
                    <a
                      href={`https://wa.me/${whatsappConfig.countryCode}${whatsappConfig.whatsappNumber}?text=${encodeURIComponent(`🚨 *GOODWIN ORDER ALERT - ${ord.id}*\n\nCustomer: ${ord.customerName} (${ord.phone})\nAmount: ${formatINR(ord.totalAmount)} (Paid Online)\nAddress: ${ord.address}, ${ord.city} - ${ord.pincode}\nSlot: ${ord.deliverySlot}\nVehicle: ${ord.vehicleDetails || "Standard"}\n\nBatteries:\n${(ord.items || []).map(i => `• ${i.name} (x${i.quantity})`).join("\n")}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title={`Forward to Operations WhatsApp (+${whatsappConfig.whatsappNumber})`}
                    >
                      <Send size={12} /> Alert Ops
                    </a>

                    {/* Customer Public Tracking Link */}
                    <Link
                      href={`/account/orders/${ord.id}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1 px-2"
                    >
                      <ExternalLink size={12} /> View Tracking
                    </Link>
                  </div>

                  {/* Dispatch Workflow Step Buttons */}
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <button
                        onClick={() => handlePackOrder(ord)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        <Package size={14} /> 1. Pack Battery
                      </button>
                    )}

                    {(isNew || isPacked) && (
                      <button
                        onClick={() => {
                          setDispatchModalOrder(ord);
                          setTechnicianForm({
                            name: "Vikram Sharma (Certified Expert)",
                            phone: "9811223344",
                            vehicle: "MP-09-AB-1234 (Goodwin Van)",
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        <Truck size={14} /> 2. Assign &amp; Dispatch
                      </button>
                    )}

                    {isOutForDelivery && (
                      <button
                        onClick={() => handleMarkDelivered(ord)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        <CheckCircle2 size={14} /> 3. Mark Delivered &amp; Installed
                      </button>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 size={14} /> Completed &amp; Installed
                      </span>
                    )}

                    {/* Cancel action */}
                    {!isDelivered && ord.status !== "Cancelled" && (
                      <button
                        onClick={() => handleCancelOrder(ord)}
                        className="text-muted-foreground hover:text-red-500 text-xs px-2 py-1 font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH / ASSIGN TECHNICIAN MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-blue-400" />
                <h3 className="font-heading font-black text-base uppercase">
                  Assign Technician &amp; Dispatch
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDispatchOrder} className="p-6 space-y-4 text-xs">
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
                <span className="font-bold text-foreground">Order ID: {dispatchModalOrder.id}</span>
                <p className="text-muted-foreground">
                  Customer: {dispatchModalOrder.customerName} ({dispatchModalOrder.phone})
                </p>
                <p className="text-muted-foreground">
                  Destination: {dispatchModalOrder.address}, {dispatchModalOrder.city} ({dispatchModalOrder.deliverySlot})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Technician Full Name
                </label>
                <input
                  type="text"
                  required
                  value={technicianForm.name}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, name: e.target.value })}
                  placeholder="e.g. Vikram Sharma (Senior Fitment Tech)"
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-bold focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Technician Mobile Number (For Customer Contact)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={technicianForm.phone}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="e.g. 9811223344"
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-mono font-bold focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Service Van / Vehicle Number
                </label>
                <input
                  type="text"
                  required
                  value={technicianForm.vehicle}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, vehicle: e.target.value })}
                  placeholder="e.g. MP-09-AB-1234 (Goodwin Express Van)"
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-heading font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Truck size={15} /> Confirm Dispatch &amp; Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMBINED SHIPPING LABEL & TAX INVOICE MODAL (Matches 1730258755.webp) */}
      {selectedLabelOrder && (
        <CombinedShippingLabelInvoice
          order={selectedLabelOrder}
          onClose={() => setSelectedLabelOrder(null)}
        />
      )}

      {/* DELETE ORDER CONFIRMATION MODAL */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-white" />
                <h3 className="font-heading font-black text-base uppercase">
                  Delete Order Permanently
                </h3>
              </div>
              <button
                onClick={() => setDeleteModalOrder(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-red-50 text-red-900 p-4 rounded-2xl border border-red-200 space-y-2">
                <p className="font-bold text-sm">
                  Are you sure you want to permanently delete this order?
                </p>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <p><strong>Order ID:</strong> {deleteModalOrder.id}</p>
                  <p><strong>Customer:</strong> {deleteModalOrder.customerName} (+91 {deleteModalOrder.phone})</p>
                  <p><strong>Amount:</strong> {formatINR(deleteModalOrder.totalAmount)}</p>
                  <p><strong>Status:</strong> {deleteModalOrder.status}</p>
                </div>
                <p className="text-[11px] text-red-700 pt-1 font-medium">
                  This action cannot be undone. The order will be removed from local storage and the dispatch database.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-heading font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {isDeleting ? "Deleting..." : "Yes, Delete Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
