"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DealerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // This is the Seller Code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("email", email.trim())
        .eq("seller_code", password.trim().toUpperCase())
        .single();

      if (error || !data) {
        throw new Error("Invalid Email or Seller Code.");
      }

      if (data.is_authorized === false) {
        throw new Error("This account is currently inactive. Please contact support.");
      }

      if (data.role === 'retailer' && data.parent_dealer_code) {
        const { data: parentDealer } = await supabase
          .from("dealers")
          .select("name")
          .eq("seller_code", data.parent_dealer_code)
          .single();
        if (parentDealer) {
          data.parent_dealer_name = parentDealer.name;
        }
      }

      // Save to local storage for persistence
      localStorage.setItem("dealer_auth", JSON.stringify(data));
      router.push("/dealer");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-20 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <ShieldCheck size={32} className="text-brand" />
          <span className="text-2xl font-heading font-black tracking-widest uppercase">
            Dealer<span className="text-brand">Portal</span>
          </span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">Dealer Login</h2>
          <p className="text-muted-foreground mb-8">Enter your registered email and Seller Code.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Email Address</label>
              <input 
                required 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-brand"
                placeholder="dealer@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Seller Code (Password)</label>
              <input 
                required 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-brand font-mono"
                placeholder="e.g. GW-DL-001"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In to Portal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
