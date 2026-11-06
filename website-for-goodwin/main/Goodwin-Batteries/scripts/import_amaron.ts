import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const INPUT_FILE = path.join(__dirname, "data", "amaron_raw.json");

interface ScrapedVariant {
  url: string;
  brand_slug: string;
  model_slug: string;
  fuel_slug: string;
  h1_title: string;
  recommended_batteries: string[];
}

function normalizeAmaronBattery(batteryName: string): string {
  if (batteryName.includes("APBTZ5L")) return "prod-gw-tz5lb";
  if (batteryName.includes("APBTZ4L")) return "prod-gw-tz4lb";
  if (batteryName.includes("APB5L-B") || batteryName.includes("APB5L-B")) return "prod-gw-xl5lb";
  if (batteryName.includes("APB2.5L-C")) return "prod-gw-xl2-5lc";
  if (batteryName.includes("APB9-B")) return "prod-gw-xl9lb"; // Just a guess if we have one
  return "";
}

function parseModelVariant(modelString: string) {
  // E.g., "Glamour(BS6) (ES)" -> Base: "Glamour", Emission: "BS6", Variant: "ES"
  // E.g., "Activa 6G" -> Base: "Activa 6G"
  let baseModel = modelString;
  let variant = "Standard";
  let emissionStandard = null;

  // Extract BS generation
  const bsMatch = baseModel.match(/\((BS\d+)\)/i);
  if (bsMatch) {
    emissionStandard = bsMatch[1];
    baseModel = baseModel.replace(bsMatch[0], "").trim();
  }

  // Extract variant (usually in parentheses at the end)
  const variantMatch = baseModel.match(/\((.*?)\)$/);
  if (variantMatch) {
    variant = variantMatch[1];
    baseModel = baseModel.replace(variantMatch[0], "").trim();
  }

  return { baseModel, variant, emissionStandard };
}

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function getOrCreateVehicleType(name: string): Promise<string> {
  const slug = generateSlug(name);
  const { data: existing } = await supabase.from('vehicle_types').select('id').eq('slug', slug).single();
  if (existing) return existing.id;

  const { data: inserted, error } = await supabase.from('vehicle_types').insert({
    name,
    slug,
    display_order: 1
  }).select('id').single();

  if (error) throw error;
  return inserted.id;
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`File not found: ${INPUT_FILE}`);
    return;
  }

  const rawData: ScrapedVariant[] = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  console.log(`Loaded ${rawData.length} records from JSON.`);

  // 1. Get Vehicle Type
  const vehicleTypeId = await getOrCreateVehicleType("Two Wheelers");
  
  // Create an artificial Fuel Type "Petrol" to satisfy constraints if needed
  // Note: V2 schema might not strictly require this or it might already be in fuel_types if we check.
  
  const brandMap = new Map<string, string>();
  const modelMap = new Map<string, string>();

  let insertedCount = 0;
  let skippedCount = 0;

  for (const record of rawData) {
    // 2. Extract Brand from URL/slug, but properly capitalize
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
          console.error(`Error inserting brand ${rawBrandName}:`, error);
          continue;
        }
        brandId = newBrand.id;
      }
      brandMap.set(brandSlug, brandId as string);
    }

    // 3. Parse Model/Variant
    // We use the model_slug to find the original text by relying on h1_title or we just use model_slug
    // Wait, the h1 title is "Suitable batteries for HERO Glamour Xtec (Petrol) Two Wheelers"
    // Let's extract the model name from H1!
    const h1Match = record.h1_title.match(/Suitable batteries for (?:.*?) (.*?) \(Petrol\)/i);
    let originalModelText = record.model_slug.replace(/-/g, ' ');
    if (h1Match && h1Match[1]) {
      // Remove the brand name from the start of the h1 match if it exists
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
          console.error(`Error inserting model ${baseModel}:`, error);
          continue;
        }
        modelId = newModel.id;
      }
      modelMap.set(baseModelSlug, modelId as string);
    }

    // 4. Insert Variant
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
        console.error(`Error inserting variant ${variant}:`, error);
        continue;
      }
      variantId = newVariant.id;
    }

    // 5. Create Fitment
    const batteryString = record.recommended_batteries.join(" | ");
    const goodwinProductId = normalizeAmaronBattery(batteryString);

    if (!goodwinProductId) {
      console.log(`Could not map battery: ${batteryString} for ${baseModel} ${variant}`);
      skippedCount++;
      // We will insert the fitment but leave goodwin_product_id empty or map to a generic "unmatched" if required.
      // But if the column is NOT NULL we will skip for now or insert with null. Let's try inserting with null.
    }

    // Insert fitment
    // Let's assume fuel_type_id isn't required in V2 or we can pass null.
    const fitmentData: any = {
      vehicle_type_id: vehicleTypeId,
      brand_id: brandId,
      model_id: modelId,
      variant_id: variantId,
      goodwin_product_id: goodwinProductId || null, // Might fail if NOT NULL
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
      // If error is null constraint on goodwin_product_id, we just skip it.
      console.error(`Error inserting fitment for ${variantId}:`, fitmentError.message);
    } else {
      insertedCount++;
    }
  }

  console.log(`Finished import. Inserted ${insertedCount} fitments. Skipped ${skippedCount} unmatched batteries.`);
}

main().catch(console.error);
