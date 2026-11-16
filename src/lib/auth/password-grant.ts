/**
 * Password-grant results from Supabase Auth.
 * The auth client replaces some successful or detailed token responses with
 * "Auth session or user missing". These helpers keep the real outcome.
 */

export const signInFailedMessage =
  "Sign-in could not be completed. Check your email and password and try again.";

const maskedMessages = new Set([
  "Auth session or user missing",
  "Auth session missing!",
]);

const codeMessages: Record<string, string> = {
  invalid_credentials: "Invalid login credentials",
  email_not_confirmed: "Email not confirmed",
  user_banned: "This account cannot sign in.",
  over_request_rate_limit: "Too many sign-in attempts. Try again later.",
  over_email_send_rate_limit: "Too many sign-in attempts. Try again later.",
};

type AuthFailure = {
  message?: string;
  code?: string | null;
} | null;

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type PasswordGrant =
  | ({ kind: "session" } & TokenPair)
  | { kind: "error"; message: string }
  | { kind: "empty" };

export type PasswordLoginDecision =
  | { type: "signed-in" }
  | ({ type: "restore" } & TokenPair)
  | { type: "failed"; message: string };

type SignInResult = {
  data: {
    session: { access_token?: string | null; refresh_token?: string | null } | null;
    user: unknown;
  };
  error: AuthFailure;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function cleanAuthMessage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/[\r\n]+/g, " ").trim();
  if (!cleaned || cleaned.length > 180 || maskedMessages.has(cleaned)) {
    return null;
  }
  if (
    /access_token|refresh_token|token_hash|bearer\s|sb_(secret|publishable)/i.test(
      cleaned,
    )
  ) {
    return null;
  }
  if (/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

function messageForCode(value: unknown): string | null {
  if (typeof value !== "string" || /^\d+$/.test(value)) {
    return null;
  }
  return codeMessages[value] ?? cleanAuthMessage(value);
}

function tokenPair(record: Record<string, unknown> | null): TokenPair | null {
  if (!record) {
    return null;
  }
  const accessToken = record.access_token;
  const refreshToken = record.refresh_token;
  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    return null;
  }
  if (!accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export function readPasswordGrant(body: unknown): PasswordGrant {
  const record = asRecord(body);
  if (!record) {
    return { kind: "empty" };
  }

  const tokens = tokenPair(record) ?? tokenPair(asRecord(record.session));
  if (tokens) {
    return { kind: "session", ...tokens };
  }

  const nestedError = asRecord(record.error);
  const message =
    cleanAuthMessage(record.msg) ??
    cleanAuthMessage(record.error_description) ??
    cleanAuthMessage(record.message) ??
    cleanAuthMessage(record.error) ??
    cleanAuthMessage(nestedError?.message) ??
    cleanAuthMessage(nestedError?.msg) ??
    messageForCode(record.error_code) ??
    messageForCode(record.code) ??
    messageForCode(nestedError?.code);

  if (message) {
    return { kind: "error", message };
  }

  return { kind: "empty" };
}

export function publicAuthMessage(error: AuthFailure, body: unknown): string {
  const grant = readPasswordGrant(body);
  if (grant.kind === "error") {
    return grant.message;
  }
  if (error?.code && codeMessages[error.code]) {
    return codeMessages[error.code];
  }
  return cleanAuthMessage(error?.message) ?? signInFailedMessage;
}

export function decidePasswordLogin(
  result: SignInResult,
  body: unknown,
): PasswordLoginDecision {
  const session = result.data.session;
  if (
    result.data.user &&
    session?.access_token &&
    session.refresh_token
  ) {
    return { type: "signed-in" };
  }

  const grant = readPasswordGrant(body);
  if (grant.kind === "session") {
    return {
      type: "restore",
      accessToken: grant.accessToken,
      refreshToken: grant.refreshToken,
    };
  }

  return { type: "failed", message: publicAuthMessage(result.error, body) };
}

export function createPasswordGrantCapture() {
  let body: unknown = null;

  const authFetch: typeof fetch = async (input, init) => {
    const response = await globalThis.fetch(input, {
      ...init,
      cache: "no-store",
    });
    const url =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.href
          : String(input);
    if (url.includes("/token") && url.includes("grant_type=password")) {
      try {
        body = await response.clone().json();
      } catch {
        body = null;
      }
    }
    return response;
  };

  return {
    fetch: authFetch,
    body: () => body,
  };
}
