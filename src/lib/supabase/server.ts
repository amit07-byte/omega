import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { requireSupabasePublicEnv } from "@/lib/env";

export async function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  // Auth session expiry is computed with Date.now() inside @supabase/auth-js.
  // cookies() resume during the runtime shell, and partial prefetching still
  // rejects that clock read. io() resumes at the dynamic stage, where it is allowed.
  await io();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The proxy refreshes the session.
        }
      },
    },
  });
}
