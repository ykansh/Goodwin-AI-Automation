"use server";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "super_admin" | "admin" | "dealer";

export interface UserProfile {
  id: string;
  role: UserRole;
  dealer_id: string | null;
  full_name: string | null;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // If no profile exists, they might be a legacy user or just haven't been assigned a role.
    // We default them to 'dealer' but without a dealer_id.
    return {
      id: user.id,
      role: "dealer",
      dealer_id: null,
      full_name: user.user_metadata?.full_name || null,
    };
  }

  return profile as UserProfile;
}

export async function hasAdminAccess(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile !== null && (profile.role === "super_admin" || profile.role === "admin");
}

export async function hasSuperAdminAccess(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile !== null && profile.role === "super_admin";
}
