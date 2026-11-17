"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseLogin, parseSignup } from "@/lib/auth/credentials";
import { destinationAfterAuth } from "@/lib/auth/onboarding";
import {
  createPasswordGrantCapture,
  decidePasswordLogin,
  publicAuthMessage,
} from "@/lib/auth/password-grant";
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

  const capture = createPasswordGrantCapture();
  const supabase = await createClient({ fetch: capture.fetch });
  const result = await supabase.auth.signInWithPassword(parsed.value);
  const decision = decidePasswordLogin(result, capture.body());

  if (decision.type === "failed") {
    redirectWith("/login", "error", decision.message);
  }

  if (decision.type === "restore") {
    const restored = await supabase.auth.setSession({
      access_token: decision.accessToken,
      refresh_token: decision.refreshToken,
    });
    if (restored.error || !restored.data.session || !restored.data.user) {
      redirectWith("/login", "error", publicAuthMessage(restored.error, null));
    }
    redirect(await destinationAfterAuth(supabase, restored.data.user));
  }

  redirect(await destinationAfterAuth(supabase, result.data.user));
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
    const alreadyRegistered = /already|registered|exists/i.test(error.message);
    redirectWith(
      "/signup",
      "error",
      alreadyRegistered
        ? "An account with this email already exists. Log in instead."
        : error.message,
    );
  }

  if (data.session) {
    redirect(await destinationAfterAuth(supabase, data.user));
  }

  const identities = data.user?.identities;
  if (data.user && Array.isArray(identities) && identities.length === 0) {
    redirectWith(
      "/signup",
      "error",
      "An account with this email already exists. Log in instead.",
    );
  }

  if (data.user) {
    redirectWith(
      "/signup",
      "notice",
      "Check your email and open the confirmation link.",
    );
  }

  redirectWith("/signup", "error", "Sign-up could not be completed. Try again.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
