import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  categories,
  products,
  vehicleTypes,
  vehicleBrands,
  vehicleModels,
  vehicleVariants,
  dealers,
} from "../data/mock";

// Load .env.local
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Starting seed process...");

  // Insert Categories
  console.log("Inserting categories...");
  const { error: catError } = await supabase.from("categories").upsert(categories);
  if (catError) console.error("Error inserting categories:", catError);

  // Insert Products
  console.log("Inserting products...");
  const { error: prodError } = await supabase.from("products").upsert(products);
  if (prodError) console.error("Error inserting products:", prodError);

  // Insert Vehicle Types
  console.log("Inserting vehicle types...");
  const { error: vtError } = await supabase.from("vehicle_types").upsert(vehicleTypes);
  if (vtError) console.error("Error inserting vehicle types:", vtError);

  // Insert Vehicle Brands
  console.log("Inserting vehicle brands...");
  const { error: mfgError } = await supabase.from("vehicle_brands").upsert(vehicleBrands);
  if (mfgError) console.error("Error inserting vehicle brands:", mfgError);

  // Insert Vehicle Models
  console.log("Inserting vehicle models...");
  const { error: vmError } = await supabase.from("vehicle_models").upsert(vehicleModels);
  if (vmError) console.error("Error inserting vehicle models:", vmError);

  // Insert Vehicle Variants
  console.log("Inserting vehicle variants...");
  const { error: vvError } = await supabase.from("vehicle_variants").upsert(vehicleVariants);
  if (vvError) console.error("Error inserting vehicle variants:", vvError);

  // Insert Dealers
  console.log("Inserting dealers...");
  const { error: dealerError } = await supabase.from("dealers").upsert(dealers);
  if (dealerError) console.error("Error inserting dealers:", dealerError);

  console.log("Seed process completed.");
}

seed();
