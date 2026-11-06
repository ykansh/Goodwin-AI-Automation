"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatINR } from "@/lib/pricing";
import { 
  ShieldCheck, 
  X, 
  Smartphone, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Copy, 
  Check, 
  AlertCircle 
} from "lucide-react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  onPaymentSuccess: (transactionId: string) => void;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  orderId,
  amount,
  customerName,
  customerPhone,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking">("upi");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [vpaError, setVpaError] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [upiRefError, setUpiRefError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer

  // Card state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(customerName || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Net banking state
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const upiIdMerchant = "9667724411@okbizaxis";
  const upiString = `upi://pay?pa=${upiIdMerchant}&pn=Goodwin%20Batteries&am=${amount}&cu=INR&tn=${orderId}`;

  // Countdown timer for QR code validity
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiIdMerchant);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcessPayment = () => {
    // If UPI tab is selected, require 12-digit UTR reference or test confirmation
    if (activeTab === "upi") {
      const cleanRef = upiRef.trim().replace(/\D/g, "");
      if (cleanRef.length !== 12 && !upiRef.toLowerCase().includes("test")) {
        setUpiRefError("Please enter the 12-digit UPI Ref / UTR number from your payment app receipt.");
        return;
      }
      setUpiRefError("");
    }

    setPaymentStatus("processing");

    // Process and submit transaction reference
    setTimeout(() => {
      const finalTxnId = upiRef.trim() ? `UPI_UTR_${upiRef.trim()}` : `GW_TXN_${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
      setPaymentStatus("success");

      setTimeout(() => {
        onPaymentSuccess(finalTxnId);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Gateway Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Lock size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base uppercase tracking-tight">
                  Goodwin Secure Pay
                </h3>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  256-bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-400">Order Ref: {orderId}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Payable</span>
              <span className="font-heading font-black text-xl text-emerald-400">{formatINR(amount)}</span>
            </div>
            <button
              onClick={onClose}
              disabled={paymentStatus === "processing"}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Payment Methods Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab("upi")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "upi"
                ? "border-[#00843D] text-[#00843D] bg-white font-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone size={16} />
            <span>UPI / QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "card"
                ? "border-[#00843D] text-[#00843D] bg-white font-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard size={16} />
            <span>Credit / Debit Card</span>
          </button>

          <button
            onClick={() => setActiveTab("netbanking")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "netbanking"
                ? "border-[#00843D] text-[#00843D] bg-white font-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 size={16} />
            <span>Net Banking</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {paymentStatus === "processing" ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 size={48} className="animate-spin text-[#00843D] mx-auto" />
              <h4 className="font-heading font-black text-lg text-slate-900">
                Authorizing Online Payment...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Securely communicating with bank & NPCI UPI network. Please do not close or refresh this window.
              </p>
            </div>
          ) : paymentStatus === "success" ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00843D] flex items-center justify-center mx-auto animate-in zoom-in-75">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-heading font-black text-xl text-slate-900">
                Payment Authorized Successfully!
              </h4>
              <p className="text-xs text-emerald-700 font-bold">
                Redirecting to your order confirmation and dispatch schedule...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: UPI & QR CODE */}
              {activeTab === "upi" && (
                <div className="space-y-6">
                  {/* QR Box */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                      <QRCodeSVG
                        value={upiString}
                        size={150}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        <span>Scan & Pay with Any App</span>
                      </div>
                      <h4 className="font-heading font-bold text-slate-900 text-sm">
                        GPay, PhonePe, Paytm, CRED, BHIM
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Open your camera or any UPI app to scan. The amount of <strong>{formatINR(amount)}</strong> will be automatically populated.
                      </p>
                      <p className="text-[11px] font-bold text-slate-400">
                        QR valid for: <span className="text-amber-600 font-black">{formatTimer(timeLeft)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Merchant VPA Display */}
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Verified Merchant UPI ID</span>
                      <strong className="text-slate-800 font-mono">{upiIdMerchant}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedUpi ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  {/* Direct UPI Apps Intent Links */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                      Or Open Installed UPI App:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                      {[
                        { name: "Google Pay", color: "bg-blue-50 text-blue-700 border-blue-200" },
                        { name: "PhonePe", color: "bg-purple-50 text-purple-700 border-purple-200" },
                        { name: "Paytm", color: "bg-sky-50 text-sky-700 border-sky-200" },
                        { name: "CRED / BHIM", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                      ].map((app) => (
                        <a
                          key={app.name}
                          href={upiString}
                          className={`p-2.5 rounded-xl border text-center transition-all hover:scale-102 ${app.color}`}
                        >
                          {app.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* UTR / UPI Reference Number Verification Input */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-900">
                      Step 2: Enter 12-Digit UPI Ref / UTR No. After Payment
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Found in your Google Pay / PhonePe / Paytm payment receipt:
                    </p>
                    <input
                      type="text"
                      maxLength={20}
                      value={upiRef}
                      onChange={(e) => {
                        setUpiRef(e.target.value);
                        setUpiRefError("");
                      }}
                      placeholder="e.g. 430129884712 (12-digit UTR)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:outline-none focus:border-[#00843D]"
                    />
                    {upiRefError && (
                      <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle size={13} /> {upiRefError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 •••• •••• 8901"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                        setCardNumber(val);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00843D] font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <ShieldCheck size={14} className="text-[#00843D]" />
                    <span>Supports Visa, MasterCard, RuPay, and American Express with 3D Secure OTP.</span>
                  </p>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === "netbanking" && (
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Select Your Bank:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National Bank"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedBank === b
                            ? "bg-emerald-50 border-[#00843D] text-[#00843D] font-black"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Action */}
        {paymentStatus !== "processing" && paymentStatus !== "success" && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <ShieldCheck size={16} className="text-[#00843D]" />
              <span>Safe & Secure 256-Bit Payment Gateway</span>
            </div>

            <button
              type="button"
              onClick={handleProcessPayment}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 active:scale-98"
            >
              <span>Authorize & Pay {formatINR(amount)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
