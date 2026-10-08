/**
 * Public configuration reserved for this app and a future Supabase integration.
 * Reading these values does not connect to Auth, PostgreSQL, or Storage.
 * Server-only secrets, including a Supabase service role key, do not belong here.
 */

export type PublicEnv = {
  siteUrl: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
};

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readOrigin(name: string): string | undefined {
  const value = read(name);
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}

export const publicEnv: PublicEnv = {
  siteUrl: readOrigin("NEXT_PUBLIC_SITE_URL"),
  supabaseUrl: readOrigin("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};
