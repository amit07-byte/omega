import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isBusinessProfileComplete } from "@/lib/auth/business-profile";
import { isAccountRole, type AccountRole } from "@/lib/auth/credentials";

export function onboardingPathForRole(role: AccountRole) {
  return role === "business" ? "/business/onboarding" : "/creator/onboarding";
}

export async function destinationAfterAuth(
  supabase: SupabaseClient,
  knownUser?: User | null,
) {
  let user = knownUser ?? null;
  if (!user) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return "/login";
    }
    user = data.user;
  }

  const loaded = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const storedRole = loaded.data?.role;
  const metadataRole = user.user_metadata?.role;
  const role = isAccountRole(storedRole)
    ? storedRole
    : isAccountRole(metadataRole)
      ? metadataRole
      : null;

  if (!role) {
    return "/account";
  }

  if (role === "business") {
    return isBusinessProfileComplete(user.user_metadata)
      ? "/business/campaigns"
      : "/business/onboarding";
  }

  const creator = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (creator.data) {
    return "/campaigns";
  }

  return "/creator/onboarding";
}
