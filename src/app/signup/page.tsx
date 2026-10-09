import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthScreen, authFieldClassName } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { signup } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

type SignupPageProps = {
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <AuthScreen
      title="Create an account"
      description="Sign up as a local business or as a creator. Omega uses this choice only to label the account."
      alternate={{
        href: "/login",
        prompt: "Already have an account?",
        label: "Log in",
      }}
    >
      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading the form…</p>}>
        <SignupForm searchParams={searchParams} />
      </Suspense>
    </AuthScreen>
  );
}

async function SignupForm({ searchParams }: SignupPageProps) {
  const { error, notice } = await searchParams;

  return (
      <form action={signup} className="mt-8 grid gap-4">
        {error ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
            {notice}
          </p>
        ) : null}
        <label className="grid gap-2 text-sm font-medium">
          Display name
          <input
            className={authFieldClassName}
            name="displayName"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Account type</legend>
          <label className="flex items-center gap-2 text-sm">
            <input name="role" type="radio" value="business" required />
            Business
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="role" type="radio" value="creator" required />
            Creator
          </label>
        </fieldset>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className={authFieldClassName}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            className={authFieldClassName}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </label>
        <Button type="submit" size="cta" className="mt-2 w-full">
          Sign up
        </Button>
      </form>
  );
}
