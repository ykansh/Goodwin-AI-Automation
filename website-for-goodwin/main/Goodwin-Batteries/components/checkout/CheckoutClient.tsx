"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import PaymentGatewayModal from "./PaymentGatewayModal";
import { 
  ShieldCheck, 
  Truck, 
  Zap, 
  CheckCircle2, 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  AlertCircle,
  Loader2,
  Lock
} from "lucide-react";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    itemCount,
    totalMrp,
    discount,
    totalAmount,
    pincode: savedPincode,
    clearCart,
  } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    city: "Delhi",
    state: "Delhi",
    pincode: savedPincode || "",
    vehicleDetails: "",
    deliverySlot: "same-day-delivery",
    paymentMethod: "online", // Strictly pre-paid online payment
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Please provide your complete delivery address.");
      return false;
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return false;
    }
    return true;
  };

  // Finalizes the order saving logic
  const finalizeOrder = async (orderId: string, paymentStatus: "Pending" | "Paid", transactionId?: string) => {
    setLoading(true);

    const orderRecord = {
      id: orderId,
      customerName: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      vehicleDetails: formData.vehicleDetails || "Standard",
      deliverySlot: formData.deliverySlot,
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      transactionId: transactionId || null,
      status: "Confirmed",
      items: items.map(it => ({
        productId: it.id,
        name: it.name,
        slug: it.slug,
        image: it.image,
        price: it.price,
        quantity: it.quantity,
      })),
      totalMrp,
      discount,
      deliveryFee: 0,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Supabase (orders table or fallback to enquiries)
    try {
      const { error: sbError } = await supabase.from("orders").insert([
        {
          id: orderId,
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          vehicle_details: formData.vehicleDetails,
          delivery_slot: formData.deliverySlot,
          payment_method: formData.paymentMethod,
          payment_status: paymentStatus,
          transaction_id: transactionId,
          total_amount: totalAmount,
          items: orderRecord.items,
          status: "Confirmed",
        }
      ]);

      if (sbError) {
        // Fallback to enquiries
        await supabase.from("enquiries").insert([
          {
            id: orderId,
            name: formData.name,
            mobile: formData.phone,
            email: formData.email || null,
            subject: `ONLINE ORDER: ${orderId} (${formatINR(totalAmount)} - ${paymentStatus})`,
            message: `Order Details:\nStatus: ${paymentStatus} (Txn: ${transactionId || "N/A"})\nSlot: ${formData.deliverySlot}\nAddress: ${formData.address}, ${formData.city} - ${formData.pincode}\nVehicle: ${formData.vehicleDetails}\nItems: ${items.map(i => `${i.name} (Qty ${i.quantity})`).join(", ")}`,
            status: "New",
          }
        ]);
      }
    } catch (err) {
      console.warn("Database sync warning (local storage will persist):", err);
    }

    // 2. Dispatch WhatsApp Order Notification to Configured Admin Number
    try {
      const notifyRes = await fetch("/api/notifications/whatsapp-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderRecord }),
      });
      const notifyData = await notifyRes.json();
      if (notifyData?.whatsappUrl) {
        (orderRecord as any).adminWhatsappUrl = notifyData.whatsappUrl;
        (orderRecord as any).adminWhatsappNumber = notifyData.targetNumber;
      }
    } catch (nErr) {
      console.warn("WhatsApp notification dispatch call error:", nErr);
    }

    // 3. Save in LocalStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem("goodwin_orders") || "[]");
      existingOrders.unshift(orderRecord);
      localStorage.setItem("goodwin_orders", JSON.stringify(existingOrders));
      localStorage.setItem("goodwin_latest_order", JSON.stringify(orderRecord));
    } catch (e) {
      console.error("Local storage order save error", e);
    }

    // 4. Clear cart and redirect
    clearCart();
    router.push(`/order-success?orderId=${orderId}`);
  };

  const launchRazorpay = async (orderId: string) => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();

      // Call backend order API
      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          orderId,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email,
        }),
      });

      const orderData = await res.json();
      const keyId = orderData?.keyId;

      // If Razorpay script loaded and valid key available, launch Razorpay
      if (isLoaded && keyId && keyId.startsWith("rzp_") && !keyId.includes("placeholder")) {
        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: "INR",
          name: "Goodwin Batteries",
          description: `Battery Order ${orderId}`,
          image: "/assets/logo/g-logo.png",
          order_id: orderData.orderId,
          prefill: {
            name: formData.name,
            email: formData.email || "",
            contact: formData.phone,
          },
          theme: {
            color: "#00843D",
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/payment/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                await finalizeOrder(orderId, "Paid", response.razorpay_payment_id);
              } else {
                setError("Payment verification failed. Please contact support if your account was debited.");
                setLoading(false);
              }
            } catch (vErr) {
              console.error("Payment verification network error:", vErr);
              setError("Payment verification request failed. If your account was debited, please contact our 24x7 support with your payment ID.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setError("Payment cancelled. You can retry payment whenever you are ready.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setLoading(false);
          setError(`Payment Failed: ${response.error?.description || "Transaction declined by bank"}`);
        });
        rzp.open();
        setLoading(false);
      } else {
        // Fallback to built-in dynamic UPI QR & payment gateway modal
        setLoading(false);
        setIsPaymentModalOpen(true);
      }
    } catch (err: any) {
      console.warn("Razorpay standard popup unavailable, opening UPI/Card gateway modal:", err);
      setLoading(false);
      setIsPaymentModalOpen(true);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const newOrderId = `GW-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setPendingOrderId(newOrderId);

    // Launch Online Payment Gateway (Pre-paid orders only)
    await launchRazorpay(newOrderId);
  };

  const handleOnlinePaymentSuccess = (transactionId: string) => {
    setIsPaymentModalOpen(false);
    finalizeOrder(pendingOrderId, "Paid", transactionId);
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Truck size={36} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-slate-600 text-sm max-w-md mb-8">
          You don&apos;t have any batteries in your cart right now. Please add a product to proceed with checkout.
        </p>
        <Link
          href="/products"
          className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
        >
          Explore Battery Catalogue &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-16 text-slate-900">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#00843D] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Left Form: Delivery, Vehicle & Payment */}
        <div className="w-full lg:w-7/12 space-y-8">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase tracking-tight">
              Express Checkout & Doorstep Delivery
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Enter your address below. Factory-sealed genuine Goodwin battery will be delivered to your doorstep. (Note: Battery fitment/installation is customer responsibility)
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Sign-In Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <User size={18} className="text-[#00843D] shrink-0" />
              <span className="text-slate-700 font-medium">
                Already registered with Goodwin? <strong className="text-slate-900">Sign in with OTP</strong> to view your past orders & invoices.
              </span>
            </div>
            <Link
              href="/account/login?redirect=/checkout"
              className="bg-[#00843D] hover:bg-[#006830] text-white px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] shrink-0 transition-colors shadow-xs"
            >
              Sign In &rarr;
            </Link>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-8">
            
            {/* Step 1: Contact Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#00843D]/10 text-[#00843D] flex items-center justify-center font-bold">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                    1. Contact Details
                  </h3>
                  <p className="text-[11px] text-slate-500">For delivery updates & warranty SMS</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="For GST Invoice copy & Digital Warranty Registration"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                    2. Doorstep Delivery Address
                  </h3>
                  <p className="text-[11px] text-slate-500">Where your sealed battery package will be delivered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Complete Street Address (Flat / House No., Building, Street) *
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 302, Palm Heights, Sector 14"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Near Metro Station, Market, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 110054"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Vehicle & Delivery Slot */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                    3. Vehicle Details & Delivery Slot
                  </h3>
                  <p className="text-[11px] text-slate-500">Helps verify battery compatibility for your vehicle</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Vehicle Model / Inverter Type (Optional)
                  </label>
                  <input
                    type="text"
                    name="vehicleDetails"
                    value={formData.vehicleDetails}
                    onChange={handleInputChange}
                    placeholder="e.g. Honda Activa 6G / Hyundai Creta / Microtek Inverter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Select Delivery Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "same-day-delivery", title: "Same-Day Delivery", time: "Delhi-NCR Express Dispatch", tag: "Fastest" },
                      { id: "tomorrow-morning", title: "Next-Day Morning", time: "9:00 AM - 1:00 PM", tag: "Scheduled" },
                      { id: "standard-dispatch", title: "Standard Dispatch", time: "1 to 2 Business Days", tag: "Standard" },
                    ].map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => setFormData({ ...formData, deliverySlot: slot.id })}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.deliverySlot === slot.id
                            ? "bg-emerald-50/80 border-[#00843D] shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-white bg-slate-900 px-1.5 py-0.5 rounded">
                            {slot.tag}
                          </span>
                          <input
                            type="radio"
                            name="slot"
                            checked={formData.deliverySlot === slot.id}
                            onChange={() => setFormData({ ...formData, deliverySlot: slot.id })}
                            className="w-3.5 h-3.5 text-[#00843D] accent-[#00843D]"
                          />
                        </div>
                        <h4 className="font-heading font-black text-xs text-slate-900 mt-2">
                          {slot.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {slot.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                    4. Secure Online Payment
                  </h3>
                  <p className="text-[11px] text-slate-500">100% pre-paid order required for factory-direct dispatch</p>
                </div>
              </div>

              {/* Single Pre-Paid Online Payment Option */}
              <div className="p-5 rounded-2xl border-2 border-[#00843D] bg-emerald-50/50 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="font-heading font-black text-base text-slate-900 block">
                        Pre-Paid Online Payment
                      </span>
                      <span className="text-xs font-semibold text-emerald-800">
                        Instant UPI (GPay, PhonePe, Paytm, CRED) • Cards • NetBanking
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-full w-fit">
                    100% Secure
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Orders are processed and dispatched for safe doorstep delivery immediately upon successful online payment confirmation.
                </p>
                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1 text-[#00843D]">
                    <ShieldCheck size={14} /> 256-Bit Encrypted
                  </span>
                  <span>•</span>
                  <span>Razorpay Verified Gateway</span>
                  <span>•</span>
                  <span>Instant Digital Invoice & Warranty Card</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-[#00843D] hover:bg-[#006830] text-white rounded-2xl font-heading font-black text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-700/25 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Pay Online & Confirm Order ({formatINR(totalAmount)})
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 font-medium mt-3">
                100% Secure Checkout with 256-bit encryption. Goodwin Batteries.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="w-full lg:w-5/12 lg:sticky lg:top-28">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                Order Summary
              </h2>
              <span className="text-xs font-bold text-[#00843D] bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-full">
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3 flex gap-3 items-center"
                >
                  <div className="relative w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 shrink-0 p-1 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-xs text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span>Qty: {item.quantity}</span>
                      {item.warranty && (
                        <>
                          <span>•</span>
                          <span className="text-[#00843D] font-bold">{item.warranty}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="font-heading font-black text-xs text-slate-900 shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs pt-4 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Items MRP Total</span>
                <span className="line-through text-slate-400">{formatINR(totalMrp)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#00843D] font-bold">
                  <span>Goodwin Online Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Doorstep Delivery</span>
                <span className="text-[#00843D] font-bold uppercase">FREE (₹0)</span>
              </div>
              <div className="text-[10px] text-amber-700 bg-amber-50 rounded-lg p-2 font-medium border border-amber-200/60">
                ⚠️ Notice: Battery fitment/installation is customer responsibility. Sealed authentic battery delivered safely to your door.
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% / 28% Included)</span>
                <span className="text-slate-500 font-semibold">Included</span>
              </div>
              
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-heading">
                <span className="font-black text-slate-900 text-sm uppercase">Total Amount</span>
                <span className="font-black text-[#00843D] text-2xl">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck size={15} className="text-[#00843D]" />
                <span>Goodwin Assured Warranty</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Every battery comes with a manufacturer serial number, official GST invoice, and instant digital warranty activation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Online Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderId={pendingOrderId}
        amount={totalAmount}
        customerName={formData.name}
        customerPhone={formData.phone}
        onPaymentSuccess={handleOnlinePaymentSuccess}
      />
    </div>
  );
}
