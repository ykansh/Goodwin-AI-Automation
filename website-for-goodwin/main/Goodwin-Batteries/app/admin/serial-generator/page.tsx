"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Download, FileText, Settings2, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SerialGeneratorPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [selectedWarranty, setSelectedWarranty] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1000);
  const [mfgDate, setMfgDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);
  const [salesChannel, setSalesChannel] = useState<string>("Dealer Network");
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      // Fetch products and active warranty plans separately since they are joined via JSONB
      const { data: prodData } = await supabase.from("products").select("id, name, slug").order("name");
      const { data: planData } = await supabase.from("warranty_plans").select("*").eq("active", true);
      const { data: dealerData } = await supabase.from("dealers").select("id, name, city").eq("is_published", true).order("name");

      if (dealerData) {
        setDealers(dealerData);
      }

      if (planData) {
        // Get unique plans by warranty_months to avoid listing 20 different "12M" plans
        const uniquePlans = Array.from(new Map(planData.map(p => [p.warranty_months, p])).values());
        // Sort by months
        uniquePlans.sort((a: any, b: any) => a.warranty_months - b.warranty_months);
        setAllPlans(uniquePlans);
      }

      if (prodData) {
        setProducts(prodData);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (allPlans.length > 0 && !selectedWarranty) {
      setSelectedWarranty(allPlans[0].id);
    }
  }, [allPlans, selectedWarranty]);

  const getShortCode = (name: string, slug: string) => {
    // Include the full product model name in the serial number
    let code = slug.toUpperCase();
    if (code.startsWith("GW-")) {
      code = code.substring(3);
    }
    return code;
  };

  const generateAndDownloadCSV = async (skipCsv = false) => {
    if (!selectedProduct || quantity <= 0) return;
    setLoading(true);
    
    const prod = products.find(p => p.id === selectedProduct);
    const shortCode = getShortCode(prod.name, prod.slug);
    
    // Parse the selected YYYY-MM-DD
    const [yearStr, monthStr, dayStr] = mfgDate.split("-");
    const yy = yearStr.slice(-2);
    const dateCode = `${dayStr}${monthStr}${yy}`; // e.g., 240924 (DDMMYY)

    // Find selected warranty plan from all plans
    const activePlan = allPlans.find((p: any) => p.id === selectedWarranty);
    const warrantyDuration = activePlan ? `${activePlan.warranty_months} Months` : "No Active Plan";
    const wtyCode = activePlan ? `${activePlan.warranty_months}M` : "0M";

    const prefixKey = `${shortCode}-${wtyCode}-${dateCode}`;
    let lastSeq = 0;
    
    // Fetch last sequence from database
    const { data: seqData, error: seqError } = await supabase
      .from('serial_sequences')
      .select('last_sequence')
      .eq('prefix_key', prefixKey)
      .single();
      
    if (seqData) {
      lastSeq = seqData.last_sequence;
    } else if (seqError && seqError.code !== 'PGRST116') {
      console.error("Error fetching sequence:", seqError);
    }

    // Find dealer name
    const dealer = selectedDealer ? dealers.find(d => d.id === selectedDealer) : null;
    const dealerName = dealer ? `${dealer.name} (${dealer.city})` : "Unassigned";

    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product_ID,Product_Name,Warranty,Sales_Channel,Assigned_Dealer,Prefix,Start_Sequence,End_Sequence,Quantity\n";

    const startSeq = lastSeq + 1;
    const newLastSeq = lastSeq + quantity;
    const startSeqStr = String(startSeq).padStart(5, '0');
    const endSeqStr = String(newLastSeq).padStart(5, '0');
    const prefix = `GW-${shortCode}-${wtyCode}-${dateCode}-`;

    const escapeCSV = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const safeProdName = escapeCSV(prod.name);
    const safeDealerName = escapeCSV(dealerName);

    csvContent += `${prod.id},${safeProdName},${warrantyDuration},${salesChannel},${safeDealerName},${prefix},${startSeqStr},${endSeqStr},${quantity}\n`;

    // Save the new last sequence to database
    const { error: upsertError } = await supabase
      .from('serial_sequences')
      .upsert({ 
        prefix_key: prefixKey, 
        last_sequence: newLastSeq,
        updated_at: new Date().toISOString()
      }, { onConflict: 'prefix_key' });
      
    if (upsertError) {
      console.error("Error updating sequence:", upsertError);
      alert("Warning: Could not update the sequence tracker in the database. Next batch might start with duplicate numbers.");
    }

    const { data: batchData, error: batchError } = await supabase
      .from('sticker_batches')
      .insert({
        product_id: prod.id,
        product_name: prod.name,
        warranty_duration: warrantyDuration,
        manufacturing_date: mfgDate,
        quantity: quantity,
        prefix_key: prefixKey,
        start_sequence: lastSeq + 1,
        end_sequence: newLastSeq,
        sales_channel: salesChannel,
        dealer_id: selectedDealer || null
      })
      .select('id')
      .single();

    if (batchError) {
      console.error("Error saving batch details:", batchError);
    }

    // Register all individual serial numbers in battery_serials table for instant lookup & verification
    try {
      const serialRows = [];
      for (let s = lastSeq + 1; s <= newLastSeq; s++) {
        const sStr = String(s).padStart(5, '0');
        serialRows.push({
          serial_number: `${prefix}${sStr}`,
          product_id: prod.id,
          manufacturing_date: mfgDate,
          status: 'ACTIVE'
        });
      }
      if (serialRows.length > 0) {
        await supabase.from('battery_serials').upsert(serialRows, { onConflict: 'serial_number' });
      }
    } catch (bsErr) {
      console.warn("Battery serials register notice:", bsErr);
    }

    if (skipCsv) {
      setLoading(false);
      return batchData;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stickers_${prod.name}_${dateCode}_Qty${quantity}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    
    setLoading(false);
    return batchData;
  };

  const handlePrint = async () => {
    const batchData = await generateAndDownloadCSV(true);
    if (batchData) {
      router.push(`/admin/labels/print/${batchData.id}`);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">Factory Sticker Generator</h1>
        <p className="text-muted-foreground">Generate intelligent serial numbers for dispatch printing.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 max-w-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="p-3 bg-brand/10 text-brand rounded-lg">
            <Settings2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Batch Generator</h2>
            <p className="text-sm text-muted-foreground">Select a product and the batch size to generate your CSV.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Select Battery Model</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {allPlans.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Warranty Plan to Encode</label>
              <select 
                value={selectedWarranty}
                onChange={(e) => setSelectedWarranty(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
              >
                {allPlans.map((wp: any) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.warranty_months} Months ({wp.free_replacement_months}F + {wp.pro_rata_months}P)
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">You can assign any warranty duration to the stickers.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Sales Channel</label>
              <select 
                value={salesChannel}
                onChange={(e) => {
                  setSalesChannel(e.target.value);
                  if (e.target.value !== "Dealer Network") {
                    setSelectedDealer("");
                  }
                }}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
              >
                <option value="Dealer Network">Dealer Network</option>
                <option value="Online Ecommerce">Online Ecommerce</option>
                <option value="Export">Export</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">Bifurcation for sticker tracking.</p>
            </div>

            {salesChannel === "Dealer Network" && (
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Assign to Dealer (Optional)</label>
                <select 
                  value={selectedDealer}
                  onChange={(e) => setSelectedDealer(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
                >
                  <option value="">-- General Stock --</option>
                  {dealers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">Prints dealer name on the stickers.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Quantity (Number of Stickers)</label>
            <input 
              type="number" 
              min="1"
              max="50000"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-2">Maximum 50,000 per export to prevent browser freezing.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Manufacturing Date</label>
            <input 
              type="date" 
              value={mfgDate}
              onChange={(e) => setMfgDate(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-2">This will be encoded into the serial number (e.g. {mfgDate.split("-")[2]}{mfgDate.split("-")[1]}{mfgDate.split("-")[0].slice(-2)}).</p>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={handlePrint}
              disabled={!selectedProduct || quantity <= 0 || !mfgDate || loading}
              className="flex-1 bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              {loading ? "Generating..." : "Generate & Print"}
            </button>
            <button 
              onClick={() => generateAndDownloadCSV(false)}
              disabled={!selectedProduct || quantity <= 0 || !mfgDate || loading}
              className="flex-1 bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl max-w-2xl">
        <h3 className="font-bold text-blue-500 flex items-center gap-2 mb-2"><FileText size={18}/> How this works</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This tool generates a CSV file perfectly formatted for sticker printing machines (like Zebra or TSC printers) or standard Excel. 
        </p>
        <p className="text-sm text-muted-foreground">
          The serial numbers are completely offline until the dealer sells the battery. The moment a dealer registers one of these printed serials on the dashboard, it is automatically verified and saved to the database!
        </p>
      </div>
    </div>
  );
}
