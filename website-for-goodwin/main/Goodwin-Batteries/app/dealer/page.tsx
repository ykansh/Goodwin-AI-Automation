"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, ShieldCheck, LogOut, Package } from "lucide-react";
import Link from "next/link";

export default function DealerDashboard() {
  const [dealer, setDealer] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("dealer_auth");
    if (!auth) {
      router.push("/dealer/login");
      return;
    }
    
    try {
      const parsed = JSON.parse(auth);
      setDealer(parsed);
      fetchRegistrations(parsed.seller_code);
    } catch (e) {
      router.push("/dealer/login");
    }
  }, []);

  async function fetchRegistrations(sellerCode: string) {
    const { data } = await supabase
      .from("warranty_registrations")
      .select("*")
      .eq("seller_code", sellerCode)
      .order("created_at", { ascending: false });
      
    if (data) setRegistrations(data);
    setLoading(false);
  }

  const handleLogout = () => {
    localStorage.removeItem("dealer_auth");
    router.push("/dealer/login");
  };

  if (loading || !dealer) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-brand" size={32} /></div>;
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (statusFilter !== "all" && reg.status !== statusFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = String(reg.customer_name || "").toLowerCase().includes(q);
      const matchSerial = String(reg.serial_number || "").toLowerCase().includes(q);
      const matchMobile = String(reg.mobile || "").toLowerCase().includes(q);
      
      if (!matchName && !matchSerial && !matchMobile) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-background">
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Welcome, {dealer.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <span className="font-mono text-brand font-bold bg-brand/10 px-2 py-0.5 rounded">{dealer.seller_code}</span>
                <span>•</span>
                <span>{dealer.region} Region</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {dealer.role !== 'retailer' && (
                <Link 
                  href="/dealer/retailers" 
                  className="flex items-center gap-2 bg-surface hover:bg-surface-hover border border-border text-foreground px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <Package size={20} /> Manage Retailers
                </Link>
              )}
              <Link 
                href="/dealer/register-warranty" 
                className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors"
              >
                <Plus size={20} /> Register New Warranty
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-surface hover:bg-surface-hover border border-border text-foreground px-4 py-3 rounded-xl font-bold transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Registrations ({filteredRegistrations.length})</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input 
              type="text"
              placeholder="Search Name, Serial, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:outline-none focus:border-brand w-full sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border text-foreground px-4 py-2 rounded-lg focus:outline-none focus:border-brand w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {filteredRegistrations.map((reg) => (
            <div key={reg.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{reg.customer_name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="font-mono">{reg.serial_number}</span>
                    <span>•</span>
                    <span>{new Date(reg.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-foreground font-mono">{reg.mobile}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      reg.status === 'Registered' ? 'bg-blue-500/10 text-blue-500' : 
                      reg.status === 'Verified' ? 'bg-green-500/10 text-green-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                    {reg.status}
                  </div>
                  {reg.invoice_url && (
                    <a href={reg.invoice_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1">
                      <Package size={12} /> View Invoice
                    </a>
                  )}
                </div>
              </div>

              {reg.admin_notes && (
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-foreground text-sm">
                  <p className="text-xs text-yellow-600 uppercase tracking-widest font-bold mb-1">Admin Notes</p>
                  <p className="whitespace-pre-wrap">{reg.admin_notes}</p>
                </div>
              )}
            </div>
          ))}

          {filteredRegistrations.length === 0 && (
            <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted-foreground">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>You haven't registered any warranties yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
