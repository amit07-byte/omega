"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseLogin, parseSignup } from "@/lib/auth/credentials";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function redirectWith(path: string, key: "error" | "notice", message: string): never {
  const params = new URLSearchParams();
  params.set(key, message.replace(/[\r\n]+/g, " ").slice(0, 240));
  redirect(`${path}?${params.toString()}`);
}

async function requestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`;
  }

  return publicEnv.siteUrl ?? "http://localhost:3000";
}

export async function login(formData: FormData) {
  const parsed = parseLogin(formData);
  if (!parsed.ok) {
    redirectWith("/login", "error", parsed.message);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.value);
  if (error) {
    redirectWith("/login", "error", error.message);
  }

  redirect("/account");
}

export async function signup(formData: FormData) {
  const parsed = parseSignup(formData);
  if (!parsed.ok) {
    redirectWith("/signup", "error", parsed.message);
  }

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.value.email,
    password: parsed.value.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        role: parsed.value.role,
        display_name: parsed.value.displayName,
      },
    },
  });

  if (error) {
    redirectWith("/signup", "error", error.message);
  }

  if (data.session) {
    redirect("/account");
  }

  redirectWith(
    "/signup",
    "notice",
    "Check your email and open the confirmation link, then log in.",
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
