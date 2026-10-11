import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { onboardingPathForRole } from "@/lib/auth/onboarding";
import { loadAccount } from "@/lib/auth/profile";

export const metadata: Metadata = {
  title: "Creator onboarding",
  robots: { index: false, follow: false },
};

export default function CreatorOnboardingPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading your account…</p>}
      >
        <CreatorOnboarding />
      </Suspense>
    </Container>
  );
}

async function CreatorOnboarding() {
  const account = await loadAccount();
  if (!account) {
    redirect("/login");
  }
  if (account.profile?.role && account.profile.role !== "creator") {
    redirect(onboardingPathForRole(account.profile.role));
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">
        Creator
      </p>
      <h1 className="mt-3 font-heading text-3xl tracking-tight">
        Set up your creator profile
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        Your creator profile is not finished yet.
      </p>
      <dl className="mt-8 grid gap-4 rounded-3xl border bg-card p-6">
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="mt-1 text-base">{account.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Role</dt>
          <dd className="mt-1 text-base capitalize">
            {account.profile?.role ?? "Not stored"}
          </dd>
        </div>
      </dl>
      {account.profileMessage ? (
        <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">
          {account.profileMessage}
        </p>
      ) : null}
      <form action={signOut} className="mt-8">
        <Button type="submit" variant="outline" size="cta">
          Log out
        </Button>
      </form>
    </div>
  );
}
