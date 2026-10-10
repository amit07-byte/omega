"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  confirmationErrorMessage,
  invalidConfirmationMessage,
  safeNext,
} from "@/lib/auth/confirm";
import { createClient } from "@/lib/supabase/client";

type RestoreResult =
  | { ok: true; next: string }
  | { ok: false; message: string };

let restoreInFlight: Promise<RestoreResult> | null = null;
let restoreResult: RestoreResult | null = null;

function authHashParams() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const hasAuthHash =
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.has("error") ||
    params.has("error_code") ||
    params.has("error_description");

  return {
    hasAuthHash,
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    error:
      params.get("error_description") ??
      params.get("error") ??
      params.get("error_code"),
  };
}

function stripHash() {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}`,
  );
}

export function restoreSessionFromHash(): Promise<RestoreResult> {
  if (restoreResult) {
    return Promise.resolve(restoreResult);
  }
  if (restoreInFlight) {
    return restoreInFlight;
  }

  restoreInFlight = (async () => {
    try {
      const hash = authHashParams();
      if (!hash.hasAuthHash) {
        return { ok: false as const, message: invalidConfirmationMessage };
      }

      if (hash.error || !hash.accessToken || !hash.refreshToken) {
        stripHash();
        return { ok: false as const, message: confirmationErrorMessage(hash.error) };
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: hash.accessToken,
        refresh_token: hash.refreshToken,
      });
      stripHash();

      if (error) {
        return { ok: false as const, message: invalidConfirmationMessage };
      }

      return {
        ok: true as const,
        next: safeNext(new URLSearchParams(window.location.search).get("next")),
      };
    } catch {
      stripHash();
      return { ok: false as const, message: invalidConfirmationMessage };
    }
  })().then((result) => {
    restoreResult = result;
    restoreInFlight = null;
    return result;
  });

  return restoreInFlight;
}

export function ConfirmSession({
  initialError,
}: {
  initialError?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(initialError ?? "");
  const [pending, setPending] = useState(!initialError);

  useEffect(() => {
    if (initialError) {
      return;
    }

    let cancelled = false;
    restoreSessionFromHash().then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        router.replace(result.next);
        return;
      }
      setPending(false);
      setMessage(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, [initialError, router]);

  if (pending) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        Confirming your account…
      </p>
    );
  }

  return (
    <p
      role="alert"
      className="mt-8 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

export function AuthHashSession() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/auth/confirm" || !authHashParams().hasAuthHash) {
      return;
    }

    let cancelled = false;
    restoreSessionFromHash().then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        router.replace(result.next);
        return;
      }
      router.replace(
        `/auth/confirm?error=${encodeURIComponent(result.message)}`,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
