import { isAccountRole, type AccountRole } from "@/lib/auth/credentials";
import { createClient } from "@/lib/supabase/server";

export type AccountProfile = {
  email: string;
  role: AccountRole;
  displayName: string;
};

export type AccountState = {
  userId: string;
  email: string;
  profile: AccountProfile | null;
  profileMessage: string | null;
};

type ProfileRow = {
  email: string;
  role: string;
  display_name: string;
};

function profileFromRow(row: ProfileRow): AccountProfile | null {
  if (!isAccountRole(row.role)) {
    return null;
  }

  return {
    email: row.email,
    role: row.role,
    displayName: row.display_name,
  };
}

export async function loadAccount(): Promise<AccountState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  const user = data.user;
  const email = user.email ?? "";
  const loaded = await supabase
    .from("profiles")
    .select("email, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (loaded.error) {
    const missingTable = loaded.error.code === "PGRST205";
    return {
      userId: user.id,
      email,
      profile: null,
      profileMessage: missingTable
        ? "This account is signed in. The profiles table is not in the database yet, so the role cannot be stored until supabase/migrations/20261009160000_auth_profiles.sql is applied."
        : "This account is signed in. The profile row could not be read.",
    };
  }

  const existing = loaded.data ? profileFromRow(loaded.data as ProfileRow) : null;
  if (existing) {
    return {
      userId: user.id,
      email,
      profile: existing,
      profileMessage: null,
    };
  }

  const metadataRole = user.user_metadata?.role;
  const metadataName = user.user_metadata?.display_name;
  const role: AccountRole = isAccountRole(metadataRole) ? metadataRole : "creator";
  const displayName =
    typeof metadataName === "string" && metadataName.trim().length >= 2
      ? metadataName.trim().slice(0, 80)
      : email.split("@")[0] || "Member";

  const inserted = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email,
      role,
      display_name: displayName.length >= 2 ? displayName : "Member",
    })
    .select("email, role, display_name")
    .single();

  if (inserted.error || !inserted.data) {
    return {
      userId: user.id,
      email,
      profile: null,
      profileMessage:
        "This account is signed in. A profile row was not created. Apply the profiles migration, then sign in again.",
    };
  }

  return {
    userId: user.id,
    email,
    profile: profileFromRow(inserted.data as ProfileRow),
    profileMessage: null,
  };
}
