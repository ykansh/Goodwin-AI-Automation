"use client";

import { useState } from "react";
import { Loader2, Search, AlertCircle, CheckCircle, ShieldCheck, FileText } from "lucide-react";
import { checkBatteryStatus, registerWarranty } from "@/app/actions/warranty-actions";
import Link from "next/link";
import ClaimModal from "@/components/admin/ClaimModal";

export default function WarrantySearchPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Registration Form State
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [vehicleMakeModel, setVehicleMakeModel] = useState("");
  const [warrantyPlanId, setWarrantyPlanId] = useState("");
  
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await checkBatteryStatus(serialNumber.trim());
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerWarranty({
        serial_number: result.battery.serial_number,
        customer_name: customerName,
        mobile,
        email,
        purchase_date: purchaseDate,
        invoice_number: invoiceNumber,
        vehicle_reg_number: vehicleReg,
        vehicle_make_model: vehicleMakeModel,
        warranty_plan_id: warrantyPlanId,
        battery_model_id: result.battery.product_id
      });
      
      if (res.success) {
        // Refresh status
        const refresh = await checkBatteryStatus(result.battery.serial_number);
        setResult(refresh);
      } else {
        alert("Registration failed: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Warranty Management</h1>
          <p className="text-muted-foreground">Check status, register warranties, and process claims.</p>
        </div>
        <Link 
          href="/admin/warranties/list"
          className="bg-surface border border-border text-foreground font-bold px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          View All Warranties
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm text-center mb-8">
        <h2 className="text-xl font-bold mb-6">Enter Battery Serial Number</h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
            placeholder="e.g. GW-TZ5LB-260924-00128"
            className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand font-mono uppercase text-lg"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand text-white font-bold px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            Search Battery
          </button>
        </form>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* CASE C: NOT FOUND */}
          {result.status === "NOT_FOUND" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center text-red-500">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Battery Not Found</h3>
              <p>{result.message}</p>
            </div>
          )}

          {/* CASE A: FOUND BUT NOT REGISTERED */}
          {result.status === "NOT_REGISTERED" && (
            <div className="bg-surface border border-brand/50 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Battery Found • Not Registered</h3>
                  <p className="text-muted-foreground font-mono mt-1">Serial: {result.battery.serial_number}</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <h4 className="font-bold text-lg border-b border-border pb-2">Register Warranty</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Customer Name *</label>
                    <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Mobile Number *</label>
                    <input type="tel" required value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Purchase Date *</label>
                    <input type="date" required value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Invoice Number</label>
                    <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Vehicle Reg Number</label>
                    <input type="text" value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none font-mono uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Vehicle Make & Model</label>
                    <input type="text" value={vehicleMakeModel} onChange={e => setVehicleMakeModel(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Select Warranty Plan *</label>
                    <select 
                      required
                      value={warrantyPlanId} 
                      onChange={e => setWarrantyPlanId(e.target.value)} 
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand outline-none"
                    >
                      <option value="">-- Choose Plan --</option>
                      {/* Show perfectly matching plans first if they exist, otherwise show all */}
                      {result.available_plans && result.available_plans.length > 0 && (
                        <optgroup label="Matched to Product">
                          {result.available_plans.map((p: any) => (
                            <option key={`avail-${p.id}`} value={p.id}>
                              {p.warranty_months} Months ({p.free_replacement_months}F + {p.pro_rata_months}P)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      
                      {result.all_plans && result.all_plans.length > 0 && (
                        <optgroup label="All Warranty Plans">
                          {result.all_plans.map((p: any) => (
                            <option key={`all-${p.id}`} value={p.id}>
                              {p.warranty_months} Months ({p.free_replacement_months}F + {p.pro_rata_months}P)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={loading} className="bg-brand text-white font-bold px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2">
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Register Warranty
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CASE B: ALREADY REGISTERED */}
          {result.status === "REGISTERED" && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-brand/10 border-b border-brand/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Warranty Active</h3>
                    <p className="text-sm font-mono text-brand mt-1">{result.battery.serial_number}</p>
                  </div>
                </div>
                
                {result.isAuthorized && (
                  <button 
                    onClick={() => setIsClaimModalOpen(true)}
                    className="bg-background border border-border text-foreground font-bold px-4 py-2 rounded-lg hover:border-brand hover:text-brand transition-colors flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Create Claim
                  </button>
                )}
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Customer</p>
                  <p className="font-semibold text-foreground">{result.registration.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{result.registration.mobile}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Purchase Date</p>
                  <p className="text-foreground">{result.registration.warranty_start_date || result.registration.purchase_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Warranty Expiry</p>
                  <p className="font-semibold text-foreground">{result.registration.warranty_expiry_date || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Vehicle</p>
                  <p className="text-foreground font-mono">{result.registration.vehicle_reg_number || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{result.registration.vehicle_make_model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Dealer ID</p>
                  <p className="text-foreground font-mono">{result.registration.dealer_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Status</p>
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                    {result.registration.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {result && result.status === "REGISTERED" && (
        <ClaimModal 
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          claim={{ warranty_id: result.registration.id, serial_number: result.battery.serial_number, customer_name: result.registration.customer_name, mobile: result.registration.mobile }}
          onSuccess={() => {
            setIsClaimModalOpen(false);
            handleSearch({ preventDefault: () => {} } as any);
          }}
        />
      )}
    </div>
  );
}
