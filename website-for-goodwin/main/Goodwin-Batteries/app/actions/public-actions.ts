"use server";

import { createClient } from "@/lib/supabase/server";

export async function publicWarrantyLookup(serialNumber: string) {
  const cleanSerial = (serialNumber || "").trim().toUpperCase();
  if (!cleanSerial) {
    return { error: "Please enter a valid battery serial number." };
  }

  const supabase = await createClient();

  // 1. Look up existing warranty registration first
  const { data: registration } = await supabase
    .from("warranty_registrations")
    .select("serial_number, warranty_start_date, warranty_expiry_date, status, dealer_name, battery_model_id, vehicle_make_model")
    .eq("serial_number", cleanSerial)
    .maybeSingle();

  // 2. Look up battery serial in battery_serials
  const { data: battery } = await supabase
    .from("battery_serials")
    .select("serial_number, product_id, status, manufacturing_date")
    .eq("serial_number", cleanSerial)
    .maybeSingle();

  // 3. Fallback: check if serial belongs to any known manufactured sticker batch
  let batchMatch: any = null;
  if (!battery) {
    try {
      const { data: batches } = await supabase
        .from("sticker_batches")
        .select("id, product_id, product_name, warranty_duration, manufacturing_date, prefix_key, start_sequence, end_sequence");

      if (batches && batches.length > 0) {
        batchMatch = batches.find((b) => {
          if (!b.prefix_key) return false;
          // Match prefix
          const cleanPrefix = b.prefix_key.replace(/[^A-Za-z0-9]/g, "");
          const cleanS = cleanSerial.replace(/[^A-Za-z0-9]/g, "");
          return cleanS.includes(cleanPrefix) || cleanSerial.startsWith(b.prefix_key);
        });
      }
    } catch {
      // ignore
    }
  }

  if (registration) {
    return {
      status: "REGISTERED",
      battery: battery || {
        serial_number: cleanSerial,
        product_id: registration.battery_model_id,
        status: "REGISTERED",
      },
      registration,
    };
  }

  if (battery || batchMatch) {
    return {
      status: "NOT_REGISTERED",
      battery: battery || {
        serial_number: cleanSerial,
        product_id: batchMatch?.product_id,
        product_name: batchMatch?.product_name,
        manufacturing_date: batchMatch?.manufacturing_date,
        warranty_duration: batchMatch?.warranty_duration,
        status: "ACTIVE",
      },
    };
  }

  return { error: "Battery serial number not found in official Goodwin manufacturing records." };
}
