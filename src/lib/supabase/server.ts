import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { requireSupabasePublicEnv } from "@/lib/env";

type CreateClientOptions = {
  fetch?: typeof fetch;
};

export async function createClient(options?: CreateClientOptions) {
  const { url, anonKey } = requireSupabasePublicEnv();
  // Auth session expiry is computed with Date.now() inside @supabase/auth-js.
  // cookies() resume during the runtime shell, and partial prefetching still
  // rejects that clock read. io() resumes at the dynamic stage, where it is allowed.
  await io();
  const cookieStore = await cookies();
  const authFetch =
    options?.fetch ??
    ((input: RequestInfo | URL, init?: RequestInit) =>
      globalThis.fetch(input, { ...init, cache: "no-store" }));

  return createServerClient(url, anonKey, {
    global: {
      fetch: authFetch,
    },
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
