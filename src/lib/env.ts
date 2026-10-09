/**
 * Public configuration for this app and Supabase Auth.
 * These values are safe to expose in the browser.
 * A service role key is a server secret and must never use the NEXT_PUBLIC_ prefix.
 */

export type PublicEnv = {
  siteUrl: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
};

function present(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readOrigin(value: string | undefined): string | undefined {
  const raw = present(value);
  if (!raw) {
    return undefined;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}

export const publicEnv: PublicEnv = {
  siteUrl: readOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  supabaseUrl: readOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};

export function requireSupabasePublicEnv(): { url: string; anonKey: string } {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using authentication.",
    );
  }

  return {
    url: publicEnv.supabaseUrl,
    anonKey: publicEnv.supabaseAnonKey,
  };
}
