export const accountRoles = ["business", "creator"] as const;

export type AccountRole = (typeof accountRoles)[number];

export type SignupInput = {
  email: string;
  password: string;
  role: AccountRole;
  displayName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CredentialResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailValue(formData: FormData): CredentialResult<string> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!emailPattern.test(email) || email.length > 254) {
    return { ok: false, message: "Enter a valid email address." };
  }

  return { ok: true, value: email };
}

export function parseLogin(formData: FormData): CredentialResult<LoginInput> {
  const email = emailValue(formData);
  if (!email.ok) {
    return email;
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 1 || password.length > 72) {
    return { ok: false, message: "Enter your password." };
  }

  return { ok: true, value: { email: email.value, password } };
}

export function parseSignup(formData: FormData): CredentialResult<SignupInput> {
  const email = emailValue(formData);
  if (!email.ok) {
    return email;
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password.length > 72) {
    return {
      ok: false,
      message: "Use a password between 8 and 72 characters.",
    };
  }

  const role = String(formData.get("role") ?? "");
  if (role !== "business" && role !== "creator") {
    return {
      ok: false,
      message: "Choose whether this account is a business or a creator.",
    };
  }

  const displayName = String(formData.get("displayName") ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (displayName.length < 2 || displayName.length > 80) {
    return {
      ok: false,
      message: "Enter a display name between 2 and 80 characters.",
    };
  }

  return {
    ok: true,
    value: {
      email: email.value,
      password,
      role,
      displayName,
    },
  };
}

export function isAccountRole(value: unknown): value is AccountRole {
  return value === "business" || value === "creator";
}
