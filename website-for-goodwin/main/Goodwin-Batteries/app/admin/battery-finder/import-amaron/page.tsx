"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function normalizeAmaronBattery(batteryName: string): string {
  if (batteryName.includes("APBTZ5L")) return "prod-gw-tz5lb";
  if (batteryName.includes("APBTZ4L")) return "prod-gw-tz4lb";
  if (batteryName.includes("APB5L-B") || batteryName.includes("APB5L-B")) return "prod-gw-xl5lb";
  if (batteryName.includes("APB2.5L-C")) return "prod-gw-xl2-5lc";
  if (batteryName.includes("APB9-B")) return "prod-gw-xl9lb";
  return "";
}

function parseModelVariant(modelString: string) {
  let baseModel = modelString;
  let variant = "Standard";
  let emissionStandard = null;

  const bsMatch = baseModel.match(/\((BS\d+)\)/i);
  if (bsMatch) {
    emissionStandard = bsMatch[1];
    baseModel = baseModel.replace(bsMatch[0], "").trim();
  }

  const variantMatch = baseModel.match(/\((.*?)\)$/);
  if (variantMatch) {
    variant = variantMatch[1];
    baseModel = baseModel.replace(variantMatch[0], "").trim();
  }

  return { baseModel, variant, emissionStandard };
}

export default function ImportAmaronPage() {
  const [jsonContent, setJsonContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const handleImport = async () => {
    if (!jsonContent.trim()) return;
    setLoading(true);
    setResult(null);
    setLogs([]);

    try {
      const rawData = JSON.parse(jsonContent);
      addLog(`Loaded ${rawData.length} records from JSON.`);

      // 1. Get or Create Vehicle Type
      let vehicleTypeId;
      const typeSlug = generateSlug("Two Wheelers");
      const { data: existingType } = await supabase.from('vehicle_types').select('id').eq('slug', typeSlug).single();
      if (existingType) {
        vehicleTypeId = existingType.id;
      } else {
        const { data: newType, error } = await supabase.from('vehicle_types').insert({
          name: "Two Wheelers",
          slug: typeSlug,
          display_order: 1
        }).select('id').single();
        if (error) throw new Error("Failed to create vehicle type: " + error.message);
        vehicleTypeId = newType.id;
      }
      addLog(`Vehicle Type ID: ${vehicleTypeId}`);

      const brandMap = new Map<string, string>();
      const modelMap = new Map<string, string>();

      let insertedCount = 0;
      let skippedCount = 0;

      for (const record of rawData) {
        const rawBrandName = record.brand_slug.toUpperCase().replace(/-/g, ' ');
        const brandSlug = record.brand_slug;
        
        let brandId = brandMap.get(brandSlug);
        if (!brandId) {
          const { data: existingBrand } = await supabase.from('vehicle_brands').select('id').eq('slug', brandSlug).single();
          if (existingBrand) {
            brandId = existingBrand.id;
          } else {
            const { data: newBrand, error } = await supabase.from('vehicle_brands').insert({
              vehicle_type_id: vehicleTypeId,
              name: rawBrandName,
              slug: brandSlug,
              display_order: 10,
              verified: true
            }).select('id').single();
            if (error) {
              addLog(`Error brand ${rawBrandName}: ${error.message}`);
              continue;
            }
            brandId = newBrand.id;
          }
          brandMap.set(brandSlug, brandId as string);
        }

        const h1Match = record.h1_title.match(/Suitable batteries for (?:.*?) (.*?) \(Petrol\)/i);
        let originalModelText = record.model_slug.replace(/-/g, ' ');
        if (h1Match && h1Match[1]) {
          const brandRegex = new RegExp(`^${rawBrandName}\\s+`, 'i');
          originalModelText = h1Match[1].replace(brandRegex, '').trim();
        }
        
        const { baseModel, variant, emissionStandard } = parseModelVariant(originalModelText);
        const baseModelSlug = generateSlug(baseModel);

        let modelId = modelMap.get(baseModelSlug);
        if (!modelId) {
          const { data: existingModel } = await supabase.from('vehicle_models').select('id').eq('brand_id', brandId).eq('slug', baseModelSlug).single();
          if (existingModel) {
            modelId = existingModel.id;
          } else {
            const { data: newModel, error } = await supabase.from('vehicle_models').insert({
              brand_id: brandId,
              name: baseModel,
              slug: baseModelSlug,
              display_order: 10,
              verified: true
            }).select('id').single();
            if (error) {
              addLog(`Error model ${baseModel}: ${error.message}`);
              continue;
            }
            modelId = newModel.id;
          }
          modelMap.set(baseModelSlug, modelId as string);
        }

        const variantSlug = generateSlug(`${baseModelSlug}-${variant}`);
        let variantId;
        const { data: existingVariant } = await supabase.from('vehicle_variants').select('id').eq('model_id', modelId).eq('slug', variantSlug).single();
        if (existingVariant) {
          variantId = existingVariant.id;
        } else {
          const { data: newVariant, error } = await supabase.from('vehicle_variants').insert({
            model_id: modelId,
            name: variant,
            slug: variantSlug,
            display_order: 10,
            verified: true
          }).select('id').single();
          if (error) {
            addLog(`Error variant ${variant}: ${error.message}`);
            continue;
          }
          variantId = newVariant.id;
        }

        const batteryString = record.recommended_batteries.join(" | ");
        const goodwinProductId = normalizeAmaronBattery(batteryString);

        if (!goodwinProductId) {
          addLog(`Could not map battery: ${batteryString} for ${baseModel} ${variant}`);
          skippedCount++;
        }

        // We try to find existing fitment first to avoid duplicates
        const { data: existingFitment } = await supabase.from('goodwin_vehicle_fitments')
            .select('id')
            .eq('variant_id', variantId)
            .eq('source_type', 'website_scrape')
            .single();

        if (!existingFitment) {
            const fitmentData: any = {
            vehicle_type_id: vehicleTypeId,
            brand_id: brandId,
            model_id: modelId,
            variant_id: variantId,
            goodwin_product_id: goodwinProductId || null,
            source_brand: 'Amaron',
            source_product_reference: batteryString,
            source_url: record.url,
            source_type: 'website_scrape',
            fitment_status: 'pending',
            confidence: 'low',
            admin_verified: false,
            public_visible: false,
            notes: emissionStandard ? `Emission Standard: ${emissionStandard}` : ''
            };

            const { error: fitmentError } = await supabase.from('goodwin_vehicle_fitments').insert(fitmentData);
            if (fitmentError) {
                addLog(`Error fitment ${variantId}: ${fitmentError.message}`);
            } else {
                insertedCount++;
            }
        }
      }

      setResult({
        success: insertedCount,
        errors: skippedCount,
        message: "Successfully processed JSON."
      });
      addLog(`Finished import. Inserted ${insertedCount} fitments. Unmapped/Skipped ${skippedCount}.`);
    } catch (e: any) {
      setResult({
        message: e.message || "Failed to process JSON"
      });
      addLog(`CRITICAL ERROR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Import Amaron JSON</h2>
          <p className="text-muted-foreground">Paste the JSON from the scraper to import directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><Upload size={18} /> Paste JSON Data</h3>
            <textarea
              className="w-full h-64 bg-background border border-border rounded-lg p-4 font-mono text-xs text-foreground focus:outline-none focus:border-brand"
              placeholder="[{ url: ... }]"
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={loading || !jsonContent.trim()}
              className="bg-brand text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {loading ? "Processing..." : "Run Import"}
            </button>
          </div>

          {result && (
            <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${result.success ? "bg-green-500/10 border-green-500/30 text-green-600" : "bg-red-500/10 border-red-500/30 text-red-600"}`}>
              {result.success ? <CheckCircle2 size={24} className="shrink-0 mt-0.5" /> : <AlertCircle size={24} className="shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{result.message}</p>
                {result.success !== undefined && <p className="text-sm mt-1">{result.success} records inserted, {result.errors} unmapped.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm overflow-auto h-96">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">Import Logs</h3>
          <ul className="text-xs font-mono text-muted-foreground space-y-1">
            {logs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
