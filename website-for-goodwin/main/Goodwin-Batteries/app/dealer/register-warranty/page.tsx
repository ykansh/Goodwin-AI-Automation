"use client";

import { useState } from "react";
import { ChevronRight, ShieldCheck, Upload, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DealerWarrantyRegistrationPage() {
  const router = useRouter();
  const [dealer, setDealer] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [warrantyId, setWarrantyId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  
  useEffect(() => {
    supabase.from('products').select('id, name, ah').eq('is_published', true).order('name').then(({ data }) => {
      if (data) setProducts(data);
    });
    supabase.from('warranty_plans').select('*').eq('active', true).then(({ data }) => {
      if (data) {
        const uniquePlans = Array.from(new Map(data.map(p => [p.warranty_months, p])).values());
        uniquePlans.sort((a: any, b: any) => a.warranty_months - b.warranty_months);
        setAllPlans(uniquePlans);
      }
    });
    
    const auth = localStorage.getItem("dealer_auth");
    if (!auth) {
      router.push("/dealer/login");
      return;
    }
    try {
      setDealer(JSON.parse(auth));
    } catch (e) {
      router.push("/dealer/login");
    }
  }, []);

  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    battery_model_id: "",
    warranty_plan_id: "",
    serial_number: "",
    purchase_date: "",
    invoice_number: "",
    dealer_name: "",
    retailer_name: "",
    retailer_location: "",
    vehicle_reg_number: "",
    vehicle_make_model: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    
    try {
      if (!formData.warranty_plan_id) {
        throw new Error("Please select a warranty plan.");
      }

      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const generatedId = `GW-WTY-${new Date().getFullYear()}-${randomNum}`;
      
      const plan = allPlans.find(p => p.id === formData.warranty_plan_id);
      let expiryDate = null;
      if (plan && formData.purchase_date) {
        const start = new Date(formData.purchase_date);
        start.setMonth(start.getMonth() + plan.warranty_months);
        expiryDate = start.toISOString().split('T')[0];
      }
      
      if (!dealer) throw new Error("Dealer authentication lost.");

      let finalInvoiceUrl = null;
      if (invoiceFile) {
        const fileExt = invoiceFile.name.split('.').pop();
        const fileName = `${generatedId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('invoices').upload(fileName, invoiceFile);
        
        if (uploadError) {
          throw new Error("Failed to upload invoice file: " + uploadError.message);
        }
        
        const { data: publicUrlData } = supabase.storage.from('invoices').getPublicUrl(fileName);
        finalInvoiceUrl = publicUrlData.publicUrl;
      } else {
        throw new Error("Invoice upload is mandatory.");
      }

      const { error } = await supabase.from('warranty_registrations').insert({
        id: generatedId,
        customer_name: formData.customer_name,
        mobile: formData.mobile,
        email: formData.email,
        battery_model_id: formData.battery_model_id,
        warranty_plan_id: formData.warranty_plan_id,
        serial_number: formData.serial_number.toUpperCase(),
        purchase_date: formData.purchase_date,
        warranty_start_date: formData.purchase_date,
        warranty_expiry_date: expiryDate,
        invoice_number: formData.invoice_number,
        invoice_url: finalInvoiceUrl,
        dealer_name: dealer.role === 'retailer' ? (dealer.parent_dealer_name || dealer.parent_dealer_code) : dealer.name,
        retailer_name: dealer.role === 'retailer' ? dealer.name : formData.retailer_name || null,
        retailer_location: dealer.role === 'retailer' ? dealer.region : formData.retailer_location || null,
        seller_code: dealer.role === 'retailer' ? dealer.parent_dealer_code : dealer.seller_code,
        region: dealer.region,
        vehicle_reg_number: formData.vehicle_reg_number.toUpperCase(),
        vehicle_make_model: formData.vehicle_make_model,
        status: 'Registered'
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error("This serial number has already been registered.");
        }
        throw error;
      }
      
      setWarrantyId(generatedId);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to register warranty. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col w-full min-h-screen pt-20">
        <section className="py-24 flex-1 flex items-center justify-center bg-background">
          <div className="container max-w-2xl text-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Registration Successful</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your Goodwin battery has been successfully registered. Please save your Warranty ID for future reference.
            </p>
            <div className="bg-surface border border-border rounded-xl p-8 mb-8 inline-block shadow-lg">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-2">Your Warranty ID</p>
              <p className="text-3xl font-mono font-bold text-brand">{warrantyId}</p>
            </div>
            <div className="flex justify-center gap-4">
              <Link href="/support/warranty-status" className="bg-brand text-white px-8 py-3 rounded font-bold transition-all hover:bg-brand-dark">
                Check Status
              </Link>
              <Link href="/products" className="bg-surface border border-border text-foreground px-8 py-3 rounded font-bold hover:border-brand transition-all">
                Explore Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      {/* Header */}
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold mb-6 tracking-wider uppercase">
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">Warranty Registration</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            WARRANTY <span className="text-brand">REGISTRATION</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Register your new Goodwin Battery to activate your warranty and ensure hassle-free support.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
              <ShieldCheck size={32} className="text-brand" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Register Your Product</h2>
                <p className="text-sm text-muted-foreground">All fields are mandatory unless marked otherwise.</p>
              </div>
            </div>

            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="e.g. Rahul Sharma" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Mobile Number</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="+91" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="rahul@example.com" 
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Battery Model</label>
                    <select 
                      required 
                      value={formData.battery_model_id}
                      onChange={(e) => setFormData({...formData, battery_model_id: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors appearance-none"
                    >
                      <option value="">Select Battery Model</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.ah})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Warranty Plan</label>
                    <select 
                      required 
                      value={formData.warranty_plan_id}
                      onChange={(e) => setFormData({...formData, warranty_plan_id: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors appearance-none"
                    >
                      <option value="">Select Warranty Duration</option>
                      {allPlans.map((wp: any) => (
                        <option key={wp.id} value={wp.id}>
                          {wp.warranty_months} Months ({wp.free_replacement_months}F + {wp.pro_rata_months}P)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Serial Number</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.serial_number}
                      onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors uppercase" 
                      placeholder="e.g. GW-12345678" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Date of Purchase</label>
                    <input 
                      required 
                      type="date" 
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-muted-foreground focus:outline-none focus:border-brand transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Invoice Number</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="Invoice No." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Dealer Name</label>
                    <input 
                      disabled
                      type="text" 
                      value={dealer?.role === 'retailer' ? (dealer.parent_dealer_name || dealer.parent_dealer_code) : (dealer?.name || "Loading...")}
                      className="w-full bg-background border border-border rounded p-3 text-muted-foreground focus:outline-none focus:border-brand transition-colors cursor-not-allowed opacity-50 font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Retailer Name (Optional)</label>
                    <input 
                      type="text" 
                      disabled={dealer?.role === 'retailer'}
                      value={dealer?.role === 'retailer' ? dealer.name : formData.retailer_name}
                      onChange={(e) => setFormData({...formData, retailer_name: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      placeholder="e.g. Battery Point" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Retailer Location (Optional)</label>
                    <input 
                      type="text" 
                      disabled={dealer?.role === 'retailer'}
                      value={dealer?.role === 'retailer' ? dealer.region : formData.retailer_location}
                      onChange={(e) => setFormData({...formData, retailer_location: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      placeholder="e.g. Andheri West, Mumbai" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Upload Invoice (Image or PDF) *</label>
                    <input 
                      required
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setInvoiceFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" 
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Vehicle Registration Number</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.vehicle_reg_number}
                      onChange={(e) => setFormData({...formData, vehicle_reg_number: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors uppercase" 
                      placeholder="e.g. DL 1C AB 1234" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Vehicle Make & Model</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.vehicle_make_model}
                      onChange={(e) => setFormData({...formData, vehicle_make_model: e.target.value})}
                      className="w-full bg-background border border-border rounded p-3 text-foreground focus:outline-none focus:border-brand transition-colors" 
                      placeholder="e.g. Maruti Swift" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground max-w-md">By submitting this form, you agree to our Warranty Terms & Conditions and Privacy Policy.</p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="bg-brand text-white px-10 py-4 rounded font-bold uppercase tracking-wider hover:bg-brand-dark transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {status === "submitting" ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : "Register Warranty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
