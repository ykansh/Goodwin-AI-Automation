"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Tag, FileText, Printer, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import MRPLabel from "@/components/labels/MRPLabel";

interface Product {
  id: string;
  name: string;
  slug: string;
  voltage: string;
  ah: string;
  cca: string;
  dimensions: string;
  weight: string;
}

export default function MRPGeneratorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [mrp, setMrp] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(100);
  const [mfgDate, setMfgDate] = useState<string>(() => {
    const d = new Date();
    // Default to YYYY-MM
    return d.toISOString().substring(0, 7); 
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      const { data: prodData } = await supabase
        .from("products")
        .select("id, name, slug, voltage, ah, cca, dimensions, weight")
        .order("name");

      if (prodData) {
        setProducts(prodData);
      }
    }
    fetchProducts();
  }, []);

  const generateAndDownloadCSV = (skipCsv = false) => {
    if (!selectedProduct || quantity <= 0 || !mrp) return;
    setLoading(true);
    
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) {
      setLoading(false);
      return;
    }
    
    // Parse the selected YYYY-MM
    const [yearStr, monthStr] = mfgDate.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[parseInt(monthStr) - 1];
    const displayDate = `${monthName} ${yearStr}`;

    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product_Name,Model,Voltage,Capacity_AH,CCA,Dimensions,Weight,Mfg_Month,MRP_Rs,Quantity\n";

    // Escape fields that might have commas or quotes
    const escapeCSV = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const name = escapeCSV(prod.name);
    const model = escapeCSV(prod.slug);
    const voltage = escapeCSV(prod.voltage);
    const ah = escapeCSV(prod.ah);
    const cca = escapeCSV(prod.cca);
    const dimensions = escapeCSV(prod.dimensions);
    const weight = escapeCSV(prod.weight);
    const mrpVal = escapeCSV(mrp);
    
    csvContent += `${name},${model},${voltage},${ah},${cca},${dimensions},${weight},"${displayDate}",${mrpVal},${quantity}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MRP_Stickers_${prod.name}_${monthStr}${yearStr}_Qty${quantity}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    
    setLoading(false);
  };

  const handlePrint = () => {
    if (!selectedProduct || quantity <= 0 || !mrp || !mfgDate) return;
    
    const [yearStr, monthStr] = mfgDate.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[parseInt(monthStr) - 1];
    const displayDate = `${monthName} ${yearStr}`;

    const params = new URLSearchParams({
      productId: selectedProduct,
      qty: quantity.toString(),
      mrp: mrp,
      mfgDate: displayDate
    });
    
    router.push(`/admin/labels/print-mrp?${params.toString()}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">MRP Sticker Generator</h1>
        <p className="text-muted-foreground">Generate MRP and specification stickers for batteries.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 max-w-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="p-3 bg-brand/10 text-brand rounded-lg">
            <Tag size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">MRP Batch Generator</h2>
            <p className="text-sm text-muted-foreground">Select a product, enter MRP and generate your CSV.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">MRP (₹)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="e.g. 5499.00"
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-2">Maximum Retail Price to print.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Mfg Month & Year</label>
              <input 
                type="month" 
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-brand focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-2">Will be printed as {mfgDate ? `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(mfgDate.split("-")[1]) - 1]} ${mfgDate.split("-")[0]}` : ''}.</p>
            </div>
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
            <p className="text-xs text-muted-foreground mt-2">Maximum 50,000 per export.</p>
          </div>

          {/* Live Thermal Sticker Preview */}
          {products.find(p => p.id === selectedProduct) && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={14} className="text-brand" /> Live Sticker Preview (38x25mm)
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">DC Code High-Clarity Preset</span>
              </div>
              <div className="p-4 bg-muted/40 rounded-xl border border-dashed border-border flex justify-center items-center">
                <div className="shadow-lg rounded overflow-hidden bg-white border border-gray-200">
                  {(() => {
                    const sel = products.find(p => p.id === selectedProduct)!;
                    let displayDate = "";
                    if (mfgDate) {
                      const [yearStr, monthStr] = mfgDate.split("-");
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const monthName = monthNames[parseInt(monthStr) - 1] || "";
                      displayDate = `${monthName} ${yearStr}`;
                    }
                    return (
                      <MRPLabel
                        productName={sel.name}
                        productModel={sel.slug}
                        voltage={sel.voltage || "12V"}
                        capacity={sel.ah || "N/A"}
                        mrp={mrp || "0.00"}
                        mfgDate={displayDate || "Oct 2026"}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button 
              onClick={handlePrint}
              disabled={!selectedProduct || quantity <= 0 || !mrp || !mfgDate || loading}
              className="flex-1 bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              {loading ? "Generating..." : "Generate & Print"}
            </button>
            <button 
              onClick={() => generateAndDownloadCSV(false)}
              disabled={!selectedProduct || quantity <= 0 || !mrp || !mfgDate || loading}
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
          This tool generates a CSV file with product specifications (Voltage, Capacity, Dimensions, Weight) alongside the entered MRP and Manufacturing Month.
        </p>
        <p className="text-sm text-muted-foreground">
          You can use this CSV file with barcode/sticker printing software like BarTender, ZebraDesigner, or any label printing tool to mass-print MRP labels for the boxes.
        </p>
      </div>
    </div>
  );
}
