import type { SupabaseClient } from "@supabase/supabase-js";
import { isBusinessProfileComplete } from "@/lib/auth/business-profile";
import { isAccountRole, type AccountRole } from "@/lib/auth/credentials";

export function onboardingPathForRole(role: AccountRole) {
  return role === "business" ? "/business/onboarding" : "/creator/onboarding";
}

export async function destinationAfterAuth(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return "/login";
  }

  const loaded = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const storedRole = loaded.data?.role;
  const metadataRole = data.user.user_metadata?.role;
  const role = isAccountRole(storedRole)
    ? storedRole
    : isAccountRole(metadataRole)
      ? metadataRole
      : null;

  if (role === "business" && isBusinessProfileComplete(data.user.user_metadata)) {
    return "/account";
  }

  if (!role) {
    return "/account";
  }

  return onboardingPathForRole(role);
}
