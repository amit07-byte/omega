import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ConfirmSession } from "@/components/auth/confirm-session";
import {
  confirmationErrorMessage,
  emailOtpType,
  safeNext,
} from "@/lib/auth/confirm";
import { destinationAfterAuth } from "@/lib/auth/onboarding";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Confirm email",
  robots: { index: false, follow: false },
};

type ConfirmPageProps = {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
    next?: string;
    error?: string;
    error_description?: string;
    error_code?: string;
  }>;
};

export default function ConfirmPage({ searchParams }: ConfirmPageProps) {
  return (
    <AuthScreen
      title="Confirm your email"
      description="Omega is finishing the confirmation link from your email."
      alternate={{
        href: "/login",
        prompt: "Already confirmed?",
        label: "Log in",
      }}
    >
      <Suspense
        fallback={
          <p className="mt-8 text-sm text-muted-foreground">
            Confirming your account…
          </p>
        }
      >
        <ConfirmRequest searchParams={searchParams} />
      </Suspense>
    </AuthScreen>
  );
}

async function ConfirmRequest({ searchParams }: ConfirmPageProps) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const queryError =
    params.error_description ?? params.error ?? params.error_code;

  if (params.code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) {
      const destination = await destinationAfterAuth(supabase);
      redirect(destination === "/account" ? next : destination);
    }
    return <ConfirmSession initialError={confirmationErrorMessage(error.message)} />;
  }

  const otpType = emailOtpType(params.type);
  if (params.token_hash && otpType) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: params.token_hash,
    });
    if (!error) {
      const destination = await destinationAfterAuth(supabase);
      redirect(destination === "/account" ? next : destination);
    }
    return <ConfirmSession initialError={confirmationErrorMessage(error.message)} />;
  }

  if (queryError || (params.token_hash && !otpType)) {
    return (
      <ConfirmSession initialError={confirmationErrorMessage(queryError)} />
    );
  }

  return <ConfirmSession />;
}
