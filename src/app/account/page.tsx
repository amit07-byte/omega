import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { loadAccount } from "@/lib/auth/profile";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading your account…</p>}
      >
        <AccountDetails />
      </Suspense>
    </Container>
  );
}

async function AccountDetails() {
  const account = await loadAccount();
  if (!account) {
    redirect("/login");
  }

  return (
      <div className="mx-auto w-full max-w-lg">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Account
        </p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight">
          {account.profile?.displayName ?? "Signed in"}
        </h1>
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
