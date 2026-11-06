"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Loader2, 
  RotateCcw,
  MessageSquare
} from "lucide-react";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/orders";

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [receivedOtpNotice, setReceivedOtpNotice] = useState<string | null>(null);
  const [challengeToken, setChallengeToken] = useState<string>("");

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const clean = phone.replace(/\D/g, "").slice(-10);
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send verification code. Please try again.");
        setLoading(false);
        return;
      }

      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
      setSuccessMsg(`OTP sent to +91 ${clean}`);
      if (data.challengeToken) {
        setChallengeToken(data.challengeToken);
      }

      // Display the received OTP alert on screen
      if (data.deliveredOtp) {
        setReceivedOtpNotice(data.deliveredOtp);
      }

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);

    try {
      const clean = phone.replace(/\D/g, "").slice(-10);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });

      const data = await res.json();

      if (data.success) {
        setResendTimer(30);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        setSuccessMsg(`New OTP sent to +91 ${clean}`);
        if (data.challengeToken) {
          setChallengeToken(data.challengeToken);
        }
        if (data.deliveredOtp) {
          setReceivedOtpNotice(data.deliveredOtp);
        }
        otpInputsRef.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend code.");
      }
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredOtp = otp.join("").trim();
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: enteredOtp,
          name: name.trim(),
          challengeToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid OTP code. Please enter the correct code.");
        setLoading(false);
        return;
      }

      // Successful verification! Set customer storage
      localStorage.setItem("goodwin_customer_phone", cleanPhone);
      if (name.trim()) {
        localStorage.setItem("goodwin_customer_name", name.trim());
      }

      setSuccessMsg("Verification successful! Redirecting...");
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
    } catch {
      setError("Failed to verify OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "");
    const nextOtp = [...otp];

    if (val.length > 1) {
      // User pasted full 6 digit code
      const digits = val.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        nextOtp[i] = digits[i] || "";
      }
      setOtp(nextOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    nextOtp[index] = val;
    setOtp(nextOtp);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:py-20 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header / Brand Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-[#00843D] to-teal-700 p-8 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 mx-auto mb-4 flex items-center justify-center border border-white/20 shadow-inner">
            <Image
              src="/assets/logo/Goodwin.png"
              alt="Goodwin Batteries"
              width={56}
              height={56}
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <h1 className="font-heading font-black text-2xl tracking-tight">
            Customer Account
          </h1>
          <p className="text-emerald-100 text-xs mt-1 font-medium">
            Enter your mobile number to verify and access your Goodwin account
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          
          {/* Error notice */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Success notice */}
          {successMsg && !error && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-[#00843D] rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Live SMS Verification Alert */}
          {step === "otp" && receivedOtpNotice && (
            <div className="mb-6 p-4 bg-emerald-50/90 border-2 border-emerald-500 rounded-2xl shadow-sm text-center animate-in slide-in-from-top-3 duration-300">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00843D] mb-1">
                <MessageSquare size={14} /> SMS Verification Code Sent
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Your one-time password for Goodwin Batteries:
              </p>
              <div className="inline-block px-4 py-2 bg-white border border-emerald-300 rounded-xl text-2xl font-black tracking-[0.25em] text-slate-900 shadow-inner">
                {receivedOtpNotice}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                (Valid for 5 minutes. Enter this 6-digit code below to log in)
              </p>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Your Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajnish Chauhan"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#00843D] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  10-Digit Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter mobile number"
                    autoFocus
                    required
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-wider focus:border-[#00843D] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  We will send a 6-digit OTP to verify your account and order history.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, "").length < 10}
                className="w-full py-3.5 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Get Verification OTP &rarr;</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-2">
                <span className="text-xs text-slate-500 font-medium">OTP sent to </span>
                <strong className="text-xs text-slate-900">+91 {phone}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                    setSuccessMsg(null);
                    setReceivedOtpNotice(null);
                  }}
                  className="text-[11px] text-[#00843D] font-bold ml-2 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 text-center mb-3">
                  Enter 6-Digit OTP Code
                </label>
                
                {/* 6 Digit Inputs */}
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={otp[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 bg-slate-50 border-2 border-slate-200 focus:border-[#00843D] rounded-xl text-center text-xl font-black text-slate-900 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 px-1">
                  <span className="text-xs text-slate-500 font-medium">
                    Didn&apos;t receive code?
                  </span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-xs text-[#00843D] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">
                      Resend in {resendTimer}s
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3.5 bg-[#00843D] hover:bg-[#006830] text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify OTP & Access Orders &rarr;</>}
              </button>
            </form>
          )}

          {/* Security & Authenticity Trust Badge */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <Lock size={14} className="text-[#00843D]" />
            <span>Secure OTP-Verified Goodwin Customer Account</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs">
          <Link href="/track-order" className="text-[#00843D] font-bold hover:underline">
            Don&apos;t want to login? Track by Order ID directly &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#00843D]" size={36} />
      </div>
    }>
      <CustomerLoginForm />
    </Suspense>
  );
}
