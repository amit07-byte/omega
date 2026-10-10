import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthScreen, authFieldClassName } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthScreen
      title="Log in"
      description="Use the email and password for your Omega account."
      alternate={{
        href: "/signup",
        prompt: "Need an account?",
        label: "Sign up",
      }}
    >
      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading the form…</p>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthScreen>
  );
}

async function LoginForm({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
      <form action={login} className="mt-8 grid gap-4">
        {error ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
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
            autoComplete="current-password"
            required
          />
        </label>
        <Button type="submit" size="cta" className="mt-2 w-full">
          Log in
        </Button>
      </form>
  );
}
