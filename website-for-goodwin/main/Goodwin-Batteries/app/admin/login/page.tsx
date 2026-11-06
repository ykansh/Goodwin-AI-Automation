"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand/5 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 bg-background border border-border rounded-2xl shadow-2xl relative z-10 mx-4">
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/assets/logo/g-logo.png" 
            alt="Goodwin" 
            width={72} 
            height={72} 
            className="object-contain mb-4 drop-shadow-md"
          />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-sm">Secure access to Goodwin ERP</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-brand transition-colors"
              placeholder="admin@goodwinbatteries.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-brand transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
