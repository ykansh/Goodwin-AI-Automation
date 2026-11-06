"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, hasAdminAccess } from "./auth";

export async function createWarrantyClaim(data: any) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };

  const dealerId = profile.dealer_id;
  if (!dealerId) return { error: "Dealer ID is required" };

  const supabase = await createClient();

  // Create the claim
  const { data: claim, error } = await supabase
    .from("warranty_claims")
    .insert([{
      ...data,
      dealer_id: dealerId,
      status: "Pending Review"
    }])
    .select()
    .single();

  if (error) return { error: error.message };

  // Audit
  await supabase.from("audit_logs").insert([{
    action: "CREATE_CLAIM",
    entity_type: "warranty_claims",
    entity_id: claim.id,
    user_id: profile.id,
    dealer_id: dealerId,
    new_values: data
  }]);

  return { success: true, data: claim };
}

export async function processClaimReplacement(claimId: string, data: any) {
  const profile = await getCurrentUserProfile();
  const isAdmin = await hasAdminAccess();
  
  // Only admins can approve and process replacements in this architecture? 
  // Let's assume Dealers or Admins can if they own the claim. We'll enforce RLS.
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();
  
  // Verify claim exists
  const { data: claim, error: claimError } = await supabase
    .from("warranty_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) return { error: "Claim not found" };

  // Verify new serial exists and is INVENTORY
  if (data.status === "Approved" && data.replacement_serial_number) {
    const { data: newBattery, error: batErr } = await supabase
      .from("battery_serials")
      .select("*")
      .eq("serial_number", data.replacement_serial_number)
      .single();

    if (batErr || !newBattery) return { error: "Replacement serial number not found in inventory." };
    if (newBattery.status !== "INVENTORY") return { error: "Replacement battery is not available in inventory (Status: " + newBattery.status + ")." };
  }

  // Transaction-like updates via RPC or sequential updates
  // 1. Update the claim
  const { error: updateError } = await supabase
    .from("warranty_claims")
    .update({
      customer_name: data.customer_name,
      mobile: data.mobile,
      issue_description: data.issue_description,
      status: data.status,
      admin_notes: data.admin_notes,
      replacement_serial_number: data.replacement_serial_number || null,
      decision_date: ["Approved", "Rejected"].includes(data.status) && claim.status !== data.status ? new Date().toISOString() : claim.decision_date
    })
    .eq("id", claimId);

  if (updateError) return { error: updateError.message };

  // 2. Handle specific Approved + Replacement flow
  if (data.status === "Approved" && data.replacement_serial_number && claim.status !== "Approved") {
    // Insert replacement genealogy record
    await supabase.from("battery_replacements").insert([{
      original_serial: claim.serial_number,
      new_serial: data.replacement_serial_number,
      claim_id: claim.id,
      notes: data.admin_notes
    }]);

    // Update old battery status
    await supabase.from("battery_serials").update({ status: "REPLACED" }).eq("serial_number", claim.serial_number);
    
    // Update new battery status
    await supabase.from("battery_serials").update({ status: "SOLD" }).eq("serial_number", data.replacement_serial_number);

    // Update the warranty registration to point to new serial
    if (claim.warranty_id) {
      await supabase.from("warranty_registrations")
        .update({ replacement_serial_number: data.replacement_serial_number })
        .eq("id", claim.warranty_id);
    }
  }

  // Audit
  await supabase.from("audit_logs").insert([{
    action: "UPDATE_CLAIM",
    entity_type: "warranty_claims",
    entity_id: claimId,
    user_id: profile.id,
    dealer_id: profile.dealer_id,
    new_values: data
  }]);

  return { success: true };
}
