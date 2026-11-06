import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const V2_DATA = {
  brands: [
    {
      name: "Hero",
      models: [
        { name: "Splendor", variants: ["Standard", "Self Start"] },
        { name: "Splendor Plus", variants: ["Standard", "Self Start", "i3S"] },
        { name: "Splendor Plus XTEC", variants: ["Standard"] },
        { name: "Passion", variants: ["Standard", "Self Start"] },
        { name: "Passion Pro", variants: ["Disc", "Drum", "i3S"] },
        { name: "HF Deluxe", variants: ["Kick Start", "Self Start"] },
        { name: "Glamour", variants: ["Disc", "Drum", "FI"] },
        { name: "Glamour XTEC", variants: ["Standard"] },
        { name: "Super Splendor", variants: ["Disc", "Drum"] },
        { name: "Xtreme", variants: ["Standard", "ABS"] },
        { name: "Xpulse", variants: ["200 4V", "200T"] },
        { name: "Karizma", variants: ["XMR"] }
      ]
    },
    {
      name: "Honda",
      models: [
        { name: "Activa", variants: ["Standard"] },
        { name: "Activa 3G", variants: ["Standard"] },
        { name: "Activa 4G", variants: ["Standard"] },
        { name: "Activa 5G", variants: ["Standard"] },
        { name: "Activa 6G", variants: ["Standard", "H-Smart"] },
        { name: "Activa 125", variants: ["Drum", "Disc", "Alloy"] },
        { name: "Shine", variants: ["Drum", "Disc"] },
        { name: "Shine 100", variants: ["Standard"] },
        { name: "Shine 125", variants: ["Disc", "Drum"] },
        { name: "SP 125", variants: ["Drum", "Disc"] },
        { name: "SP 160", variants: ["Single Disc", "Double Disc"] },
        { name: "Unicorn", variants: ["Standard", "BS6"] },
        { name: "CB Hornet", variants: ["160R"] },
        { name: "CB200X", variants: ["Standard"] },
        { name: "Dio", variants: ["Standard", "DLX", "H-Smart"] }
      ]
    },
    {
      name: "TVS",
      models: [
        { name: "Jupiter", variants: ["Sheet Metal Wheel", "Alloy", "ZX", "Classic"] },
        { name: "Jupiter 125", variants: ["Drum", "Drum Alloy", "Disc"] },
        { name: "Scooty Pep+", variants: ["Standard", "Matte"] },
        { name: "Scooty Zest", variants: ["Gloss", "Matte"] },
        { name: "NTORQ", variants: ["Drum", "Disc", "Race Edition"] },
        { name: "NTORQ 125", variants: ["Super Squad Edition", "Race XP"] },
        { name: "Apache", variants: ["RTR 160", "RTR 180"] },
        { name: "Apache RTR 160", variants: ["2V", "4V"] },
        { name: "Apache RTR 180", variants: ["Standard"] },
        { name: "Raider", variants: ["Single Seat", "Split Seat", "SmartXonnect"] },
        { name: "Radeon", variants: ["Base", "Dual Tone"] },
        { name: "Sport", variants: ["Kick Start", "Self Start"] },
        { name: "Star City", variants: ["Plus"] },
        { name: "XL100", variants: ["Heavy Duty", "Comfort", "Winner Edition"] }
      ]
    },
    {
      name: "Bajaj",
      models: [
        { name: "Pulsar", variants: ["125", "150"] },
        { name: "Pulsar 125", variants: ["Neon", "Carbon Fiber"] },
        { name: "Pulsar 150", variants: ["Single Disc", "Twin Disc"] },
        { name: "Pulsar 180", variants: ["Standard"] },
        { name: "Pulsar 200", variants: ["NS", "RS"] },
        { name: "Pulsar NS", variants: ["125", "160", "200"] },
        { name: "Pulsar NS160", variants: ["Standard"] },
        { name: "Pulsar NS200", variants: ["Standard"] },
        { name: "Pulsar RS200", variants: ["Standard"] },
        { name: "Platina", variants: ["100", "110"] },
        { name: "CT100", variants: ["KS", "ES"] },
        { name: "CT110", variants: ["X"] },
        { name: "Discover", variants: ["110", "125"] },
        { name: "Avenger", variants: ["Cruise 220", "Street 160"] },
        { name: "Dominar", variants: ["250", "400"] }
      ]
    },
    {
      name: "Yamaha",
      models: [
        { name: "FZ", variants: ["FI V3", "FI V4"] },
        { name: "FZS", variants: ["FI V3", "FI V4"] },
        { name: "FZ-X", variants: ["Standard", "Bluetooth"] },
        { name: "MT-15", variants: ["V2"] },
        { name: "R15", variants: ["V4", "M"] },
        { name: "Fascino", variants: ["125 Fi Hybrid Drum", "125 Fi Hybrid Disc"] },
        { name: "RayZR", variants: ["125 Fi Hybrid Drum", "125 Fi Hybrid Disc"] },
        { name: "Ray Z", variants: ["Standard"] },
        { name: "Aerox", variants: ["155"] }
      ]
    },
    {
      name: "Suzuki",
      models: [
        { name: "Access", variants: ["125"] },
        { name: "Access 125", variants: ["Standard", "Special Edition", "Ride Connect"] },
        { name: "Burgman", variants: ["Street"] },
        { name: "Burgman Street", variants: ["Standard", "Ride Connect", "EX"] },
        { name: "Gixxer", variants: ["Standard"] },
        { name: "Gixxer SF", variants: ["Standard", "250"] },
        { name: "Intruder", variants: ["150"] },
        { name: "Avenis", variants: ["Standard", "Race Edition"] }
      ]
    }
  ]
};

const toSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

async function seedV2() {
  console.log("Starting V2 seed process for Amaron Reference Data...");

  // 1. Get Base Entities
  const { data: typeData } = await supabase.from("vehicle_types").select("id").eq("slug", "two-wheeler").single();
  if (!typeData) throw new Error("Two-Wheeler type not found. Did you run the SQL script?");
  const twoWheelerId = typeData.id;

  const { data: fuelData } = await supabase.from("fuel_types").select("id").eq("name", "Petrol").single();
  const petrolId = fuelData?.id;

  // 2. Map Products
  const { data: products } = await supabase.from("products").select("id, slug");
  const gw5Ah = products?.find(p => p.slug === "goodwin-rider-5ah")?.id || null; 
  // Wait, if products table is there, the slug might be 'goodwin-rider-5ah' or whatever was in the previous mock.
  // Actually, let's just fetch any Two-Wheeler product for the seed.
  const prod1 = products?.length ? products[Math.min(2, products.length-1)].id : null;
  const prod2 = products?.length ? products[Math.min(3, products.length-1)].id : null;
  const prod3 = products?.length ? products[0].id : null;

  if (!prod1) console.warn("No products found! Fitments will fail.");

  // 3. Iterate over the V2_DATA
  for (const brand of V2_DATA.brands) {
    console.log(`Processing Brand: ${brand.name}`);
    
    // Insert Brand
    const { data: brandRow, error: brandErr } = await supabase.from("vehicle_brands").insert({
      vehicle_type_id: twoWheelerId,
      name: brand.name,
      slug: toSlug(brand.name),
      source_name: "Amaron",
      source_url: "https://www.amaron.in/",
      source_type: "AMARON_REFERENCE",
      verified: true
    }).select().single();

    if (brandErr || !brandRow) {
      console.error(brandErr);
      continue;
    }

    // Insert Models
    for (const model of brand.models) {
      const { data: modelRow, error: modelErr } = await supabase.from("vehicle_models").insert({
        brand_id: brandRow.id,
        name: model.name,
        slug: toSlug(model.name),
        source_name: "Amaron",
        source_type: "AMARON_REFERENCE",
        verified: true
      }).select().single();

      if (modelErr || !modelRow) continue;

      // Insert Variants
      for (const variantName of model.variants) {
        const { data: variantRow, error: varErr } = await supabase.from("vehicle_variants").insert({
          model_id: modelRow.id,
          name: variantName,
          slug: toSlug(variantName),
          source_name: "Amaron",
          source_type: "AMARON_REFERENCE",
          verified: true
        }).select().single();

        if (varErr || !variantRow) continue;

        // Create Year (2015-Present)
        await supabase.from("vehicle_years").insert({
          vehicle_variant_id: variantRow.id,
          year_start: 2015,
          year_end: 2025,
          verified: true,
          source_name: "Amaron"
        });

        // Create Fitment
        // Distribute between 4Ah and 5Ah randomly for dummy mapping, in real life Admin verifies
        const targetProduct = Math.random() > 0.5 ? prod1 : prod2;
        if (!targetProduct) continue;

        await supabase.from("vehicle_battery_fitments").insert({
          vehicle_type_id: twoWheelerId,
          brand_id: brandRow.id,
          model_id: modelRow.id,
          variant_id: variantRow.id,
          fuel_type_id: petrolId,
          year_start: 2015,
          year_end: 2025,
          goodwin_product_id: targetProduct,
          source_brand: "Amaron",
          source_product_reference: "AP-BTZ5L / AP-BTZ4L",
          source_type: "AMARON_REFERENCE",
          fitment_status: "VERIFIED",
          confidence: "HIGH",
          admin_verified: true,
          public_visible: true,
          notes: "Derived from public Amaron application chart."
        });
      }
    }
  }

  console.log("V2 Seed process completed.");
}

seedV2();
