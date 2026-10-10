import type { EmailOtpType } from "@supabase/supabase-js";

export const invalidConfirmationMessage =
  "This confirmation link is invalid or has expired.";

const otpTypes = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}

export function confirmationErrorMessage(value: string | null | undefined) {
  if (!value) {
    return invalidConfirmationMessage;
  }

  const cleaned = value.replace(/[\r\n]+/g, " ").trim();
  if (
    !cleaned ||
    cleaned.length > 180 ||
    /access_token|refresh_token|token_hash/i.test(cleaned)
  ) {
    return invalidConfirmationMessage;
  }

  return cleaned;
}

export function emailOtpType(value: string | null | undefined): EmailOtpType | null {
  if (!value || !otpTypes.has(value as EmailOtpType)) {
    return null;
  }
  return value as EmailOtpType;
}
