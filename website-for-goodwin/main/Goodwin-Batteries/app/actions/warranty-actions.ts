"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, hasAdminAccess } from "./auth";

export async function checkBatteryStatus(serialNumber: string) {
  const supabase = await createClient();
  
  // 1. Check if it exists in battery_serials
  const { data: battery, error: batteryError } = await supabase
    .from("battery_serials")
    .select("*")
    .eq("serial_number", serialNumber)
    .single();

  if (batteryError || !battery) {
    return { status: "NOT_FOUND", message: "Battery serial number not found in Goodwin inventory." };
  }

  // 1b. Fetch all available warranty plans
  const { data: plans } = await supabase
    .from("warranty_plans")
    .select("*")
    .eq("active", true);

  const available_plans = plans?.filter(p => p.product_id === battery.product_id) || [];
  
  // Get unique plans for fallback/admin override
  const all_plans = Array.from(new Map(plans?.map(p => [p.warranty_months, p]) || []).values());
  all_plans.sort((a: any, b: any) => a.warranty_months - b.warranty_months);

  // 2. Check if it's already registered
  const { data: registration, error: regError } = await supabase
    .from("warranty_registrations")
    .select(`
      *,
      warranty_plan:warranty_plans(*)
    `)
    .eq("serial_number", serialNumber)
    .single();

  if (!registration || regError) {
    return { status: "NOT_REGISTERED", battery, available_plans, all_plans };
  }

  // 3. Determine if dealer is authorized to view details
  const profile = await getCurrentUserProfile();
  const isAdmin = await hasAdminAccess();
  
  const isAuthorized = isAdmin || (profile && profile.dealer_id === registration.dealer_id);

  return {
    status: "REGISTERED",
    battery,
    registration: isAuthorized ? registration : { ...registration, customer_name: "MASKED", mobile: "MASKED" },
    isAuthorized,
    available_plans,
    all_plans
  };
}

export async function registerWarranty(data: any) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };

  const dealerId = data.dealer_id || profile.dealer_id;
  if (!dealerId) return { error: "Dealer ID is required" };

  const supabase = await createClient();

  // Validate serial exists
  const { data: battery } = await supabase
    .from("battery_serials")
    .select("*")
    .eq("serial_number", data.serial_number)
    .single();

  if (!battery) return { error: "Invalid serial number" };

  // Calculate Expiry
  let expiryDate = null;
  if (data.warranty_plan_id && data.purchase_date) {
    const { data: plan } = await supabase.from("warranty_plans").select("*").eq("id", data.warranty_plan_id).single();
    if (plan) {
      const start = new Date(data.purchase_date);
      start.setMonth(start.getMonth() + plan.warranty_months);
      expiryDate = start.toISOString().split('T')[0];
    }
  }

  const { data: reg, error } = await supabase
    .from("warranty_registrations")
    .insert([{
      ...data,
      dealer_id: dealerId,
      warranty_start_date: data.purchase_date,
      warranty_expiry_date: expiryDate,
      status: "Active"
    }])
    .select()
    .single();

  if (error) return { error: error.message };

  // Update battery status
  await supabase.from("battery_serials").update({ status: "SOLD" }).eq("serial_number", data.serial_number);

  // Audit log
  await supabase.from("audit_logs").insert([{
    action: "REGISTER_WARRANTY",
    entity_type: "warranty_registrations",
    entity_id: reg.id,
    user_id: profile.id,
    dealer_id: dealerId,
    new_values: reg
  }]);

  return { success: true, data: reg };
}
