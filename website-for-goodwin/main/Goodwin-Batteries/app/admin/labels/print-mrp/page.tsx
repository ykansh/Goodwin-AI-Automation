"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MRPLabel from "@/components/labels/MRPLabel";
import { useSearchParams } from "next/navigation";
import { getPrintCss } from "@/lib/printer-config";
import PrintControlToolbar, { DEFAULT_PRINT_SETTINGS, PrintSettings } from "@/components/labels/PrintControlToolbar";
import { Loader2 } from "lucide-react";

function PrintMRPContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const qty = parseInt(searchParams.get("qty") || "1", 10);
  const mrp = searchParams.get("mrp") || "0";
  const mfgDate = searchParams.get("mfgDate") || "";
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [testOnlyOne, setTestOnlyOne] = useState(false);

  useEffect(() => {
    // Load stored settings if available
    try {
      const stored = localStorage.getItem("goodwin_thermal_print_settings");
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {
      // ignore
    }

    async function loadProduct() {
      if (!productId) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      
      if (data) {
        setProduct(data);
      } else {
        console.error("Product not found:", error);
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-medium">Loading product data...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-red-500 font-bold">Product not found.</div>;
  }

  const effectiveCount = testOnlyOne ? 1 : qty;
  const labelsToPrint = Array.from({ length: effectiveCount }).map((_, i) => i);

  const handlePrintAll = () => {
    setTestOnlyOne(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleTestPrint = () => {
    setTestOnlyOne(true);
    setTimeout(() => {
      window.print();
      // Revert back after dialog opens
      setTimeout(() => setTestOnlyOne(false), 1000);
    }, 100);
  };

  return (
    <div className="print-page-wrapper min-h-screen bg-background">
      {/* Live Thermal Fine-Tuning Toolbar */}
      <PrintControlToolbar
        backHref="/admin/mrp-generator"
        title={`Print MRP: ${product.name}`}
        labelCount={qty}
        settings={settings}
        onSettingsChange={setSettings}
        onPrintAll={handlePrintAll}
        onPrintTest={handleTestPrint}
      />

      {/* Printable area stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: getPrintCss(settings.verticalOffset) }} />

      {/* Visual notice if test mode is active */}
      {testOnlyOne && (
        <div className="print:hidden bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-bold text-amber-600">
          Printing 1 Test Sticker to check thermal clarity on DC Code printer...
        </div>
      )}

      {/* Preview container (styled for screen, reset for 38x25mm thermal print) */}
      <div className="print-labels-container flex flex-wrap gap-4 p-8 print:p-0 bg-background print:bg-white pb-20 print:pb-0 justify-center print:justify-start">
        {labelsToPrint.map((_, index) => (
          <div 
            key={index} 
            className="print-label-item bg-white overflow-hidden"
            style={{ border: '0 none transparent', outline: '0 none transparent', boxShadow: 'none', borderRadius: '0' }}
          >
            <MRPLabel
              productName={product.name}
              productModel={product.slug}
              voltage={product.voltage || '12V'}
              capacity={product.ah || 'N/A'}
              mrp={mrp}
              mfgDate={mfgDate}
              logoFont={settings.logoFont}
              bodyFont={settings.bodyFont}
              serialFont={settings.serialFont}
              letterSpacing={settings.letterSpacing}
              verticalOffset={settings.verticalOffset}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrintMRPPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center flex items-center justify-center gap-2 text-muted-foreground font-medium">
        <Loader2 className="animate-spin text-[#00843D]" size={24} />
        <span>Loading MRP print layout...</span>
      </div>
    }>
      <PrintMRPContent />
    </Suspense>
  );
}

